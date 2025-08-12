from my_django_app import fields
from product.models import Location, Article
from people.models import Supplier, Employee
from django.db.models import Sum, UniqueConstraint, Q
from my_django_app.utils import SumProduct


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
    transmitter = fields.SetNullOptionalForeignKey(Location)
    receiver = fields.SetNullOptionalForeignKey(Location)

    @property
    def unit_amount(self):
        return self.product.selling_price

    @property
    def subtotal_amount(self):
        return self.product.selling_price * self.quantity

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["sale", "product"],
                name="unique_sale_product",
                condition=Q(sale__isnull=False),
            ),
            UniqueConstraint(
                fields=["purchase", "product"],
                name="unique_purchase_product",
                condition=Q(purchase__isnull=False),
            ),
        ]


STATUS_CHOICES = [
    (0, "Draft"),
    (1, "Pending Approval"),
    (2, "Approved"),
    (3, "Fulfilled"),
    (4, "Cancelled"),
]


class Sale(fields.CustomModel):
    status = fields.ChoiceIntegerField(STATUS_CHOICES, display=True)
    customer = fields.ShortCharField(display=True)

    @property
    def amount_payable(self):
        value1 = self.transaction_sale.aggregate(total=Sum("amount"))["total"]
        value2 = self.inventorylog_sale.aggregate(
            total=SumProduct("quantity", "product__selling_price")
        )["total"]
        value1 = float(value1 if value1 is not None else 0)
        value2 = float(value2 if value2 is not None else 0)
        return value2 - value1

    @property
    def amount_paid(self):
        value = self.transaction_sale.aggregate(total=Sum("amount"))["total"]
        value = float(value if value is not None else 0)
        return value

    @property
    def total_cost(self):
        value = self.inventorylog_sale.aggregate(
            total=SumProduct("quantity", "product__selling_price")
        )["total"]
        value = float(value if value is not None else 0)
        return value

    @property
    def sales_items(self):
        return list(self.inventorylog_sale.values_list("pk", flat=True))


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
    sale = fields.CascadeRequiredForeignKey(Sale)
    employees = fields.OptionalManyToManyField(Employee)
    labor_type = fields.SetNullOptionalForeignKey(LaborType)
    description = fields.MediumCharField()
    cost = fields.AmountField()
    compensation_amount = fields.AmountField()
    is_paid = fields.DefaultBooleanField(False)
    paid_at = fields.OptionalDateTimeField(display=True)
