from my_django_app import fields
from product.models import Location, Article
from people.models import Supplier, Employee
from django.db.models import Sum
from my_django_app.utils import SumProduct, to_money, CannotEqual
from django.core.exceptions import ValidationError


class InventoryLog(fields.CustomModel):
    LOG_TYPE_CHOICES = [
        (0, "Sale"),
        (1, "Purchase"),
        (2, "Return"),
        (3, "Adjustment"),
        (4, "Physical Count"),
        (5, "Transfer"),
    ]
    sale = fields.CascadeOptionalForeignKey("Sale")
    purchase = fields.CascadeOptionalForeignKey("Purchase")
    product = fields.CascadeRequiredForeignKey(Article, display=True)
    quantity = fields.LimitedIntegerField()
    log_type = fields.ChoiceIntegerField(LOG_TYPE_CHOICES)
    coming_from = fields.SetNullOptionalForeignKey(Location)
    going_to = fields.SetNullOptionalForeignKey(Location)
    is_collected = fields.DefaultBooleanField(False)

    class Meta:
        constraints = [CannotEqual("coming_from", "going_to", "InventoryLog")]

    @property
    def unit_amount(self):
        return self.product.selling_price

    @property
    def subtotal_amount(self):
        return self.product.selling_price * self.quantity

    def save(self, *args, **kwargs):
        # Try to find duplicate before saving
        qs = InventoryLog.objects.filter(product=self.product)
        if self.sale:
            qs = qs.filter(sale=self.sale)
        elif self.purchase:
            qs = qs.filter(purchase=self.purchase)

        existing = qs.exclude(pk=self.pk).first()
        if existing:
            # Merge quantities silently
            existing.quantity += self.quantity
            existing.save(update_fields=["quantity"])
            return  # Skip creating new row

        super().save(*args, **kwargs)


STATUS_CHOICES = [
    (0, "Draft"),
    (1, "Pending"),
    (2, "Approved"),
    (3, "Fulfilled"),
    (4, "Cancelled"),
]


class Sale(fields.CustomModel):
    customer = fields.ShortCharField(display=True)
    status = fields.ChoiceIntegerField(STATUS_CHOICES, display=True)

    @property
    def current_status(self):
        statements = []
        if self.change > 0:
            statements.append(f"The customer needs change of {to_money(self.change)}.")
        if self.amount_payable > 0:
            statements.append(
                f"The customer has {to_money(self.amount_payable)} unpaid balance."
            )
        if self.uncollected_compensation > 0:
            statements.append(
                f"The mechanic has {to_money(self.uncollected_compensation)} uncollected."
            )
        if (len(self.sales_items) + len(self.labor_items)) == 0:
            statements.append("The customer has no items.")
        if self.unclaimed_items > 0:
            statements.append(
                f"The customer has {self.unclaimed_items} unclaimed items."
            )
        return (
            "☆☆☆ SALE COMPLETE ☆☆☆" if len(statements) == 0 else "\n".join(statements)
        )

    @property
    def amount_payable(self):
        return self.total_cost - self.amount_paid + self.change_given

    @property
    def change(self):
        return self.amount_paid - self.total_cost - self.change_given

    @property
    def change_given(self):
        value = self.transaction_sale.filter(amount__lte=0).aggregate(
            total=Sum("amount")
        )["total"]
        value = float(value if value is not None else 0)
        return -value + float(self.paid_compensation)

    @property
    def total_compensation(self):
        total = self.labor_sale.aggregate(total=Sum("compensation_amount"))["total"]
        return total if total is not None else 0

    @property
    def uncollected_compensation(self):
        return self.total_compensation + self.paid_compensation

    @property
    def unclaimed_items(self):
        unclaimed = self.inventorylog_sale.filter(is_collected=0).aggregate(
            total=Sum("quantity")
        )["total"]
        return unclaimed if unclaimed is not None else 0

    @property
    def paid_compensation(self):
        collected = self.labor_sale.aggregate(total=Sum("collection__amount"))["total"]
        return collected if collected is not None else 0

    @property
    def amount_paid(self):
        value = self.transaction_sale.filter(amount__gte=0).aggregate(
            total=Sum("amount")
        )["total"]
        value = float(value if value is not None else 0)
        return value

    @property
    def total_cost(self):
        value = self.inventorylog_sale.aggregate(
            total=SumProduct("quantity", "product__selling_price")
        )["total"]
        value2 = self.labor_sale.aggregate(total=Sum("cost"))["total"]
        value = float(value if value is not None else 0)
        value2 = float(value2 if value2 is not None else 0)
        return value + value2

    @property
    def sales_items(self):
        return list(self.inventorylog_sale.values_list("pk", flat=True))

    @property
    def labor_items(self):
        return list(self.labor_sale.values_list("pk", flat=True))

    @property
    def transaction_items(self):
        return list(self.transaction_sale.values_list("pk", flat=True))


class Purchase(fields.CustomModel):
    status = fields.ChoiceIntegerField(STATUS_CHOICES, display=True)
    supplier = fields.SetNullOptionalForeignKey(Supplier, display=True)


class PrintJob(fields.CustomModel):
    sale = fields.CascadeOptionalForeignKey(Sale, display=True)
    purchase = fields.CascadeOptionalForeignKey(Purchase, display=True)


class LaborType(fields.CustomModel):
    name = fields.ShortCharField(display=True)
    description = fields.MediumCharField()


class Labor(fields.CustomModel):
    collection = fields.SetNullOptionalForeignKey("finance.Transaction")
    sale = fields.CascadeRequiredForeignKey(Sale)
    employees = fields.OptionalManyToManyField(Employee)
    labor_type = fields.SetNullOptionalForeignKey(LaborType)
    description = fields.MediumCharField()
    cost = fields.AmountField()
    compensation_amount = fields.AmountField()
    is_paid = fields.DefaultBooleanField(False)

    def clean(self):

        if (
            self.compensation_amount
            and self.cost
            and self.compensation_amount >= self.cost
        ):
            raise ValidationError(
                {
                    "compensation_amount": "This must be less than the cost.",
                    "cost": "This must be greater than the compensation amount.",
                }
            )
        return super().clean()
