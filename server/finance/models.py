from my_django_app import fields
from my_django_app.utils import CannotEqual
from django.db.models import Sum
from commerce.models import Sale, Purchase, Labor
from .utils import generate_check

TYPE_CHOICES = [
    (0, "Cash"),
    (1, "Coins"),
    (2, "Cash + Coins"),
    (3, "Savings"),
    (4, "Credit"),
    (5, "Checking"),
    (6, "Mortgage"),
    (7, "Stocks"),
    (8, "Assets"),
    (9, "Liabilities"),
    (10, "Untracked"),
]


class Account(fields.CustomModel):

    name = fields.ShortCharField(display=True)
    type = fields.ChoiceIntegerField(TYPE_CHOICES)

    @property
    def net_balance(self):
        inflow = self.transaction_going_to.aggregate(total=Sum("amount"))["total"] or 0
        outflow = (
            self.transaction_coming_from.aggregate(total=Sum("amount"))["total"] or 0
        )
        return inflow - outflow


NATURE_CHOICES = [
    (0, "Outgoing"),
    (1, "Incoming"),
    (2, "Transfer"),
    (3, "Receivable"),
    (4, "Payable"),
]


class Category(fields.CustomModel):
    title = fields.ShortCharField(display=True)
    nature = fields.ChoiceIntegerField(NATURE_CHOICES)


class Transaction(fields.CustomModel):
    image = fields.ImageField("transactions")
    sale = fields.CascadeOptionalForeignKey(Sale)
    purchase = fields.CascadeOptionalForeignKey(Purchase)
    labor = fields.CascadeOptionalForeignKey(Labor)
    category = fields.SetNullOptionalForeignKey(Category, display=True)
    description = fields.MediumCharField(display=True)
    coming_from = fields.SetNullOptionalForeignKey(Account, display=True)
    going_to = fields.SetNullOptionalForeignKey(Account, display=True)
    amount = fields.AmountField()
    to_print = fields.DefaultBooleanField(False)

    @property
    def nature(self):
        return self.category.get_nature_display()

    def generate_transaction_check(self):
        generate_check(self)

    class Meta:
        constraints = [CannotEqual("coming_from", "going_to", "Transaction")]


class Receivable(fields.CustomModel):
    charge = fields.CascadeOptionalForeignKey(Transaction)
    payments = fields.OptionalManyToManyField(Transaction)
    name = fields.ShortCharField(display=True)
    amount = fields.AmountField()
    description = fields.MediumCharField(display=True)
    date_due = fields.OptionalDateField()

    @property
    def payment_total(self):
        return sum(p.amount for p in self.payments.all())

    @property
    def date_completed(self):
        total = self.payments.aggregate(total=Sum("amount"))["total"] or 0
        if total >= self.amount:
            return (
                self.payments.order_by("-created_at")
                .values_list("created_at", flat=True)
                .first()
                .date()
            )
        return None


class Payable(fields.CustomModel):
    charge = fields.CascadeOptionalForeignKey(Transaction)
    payments = fields.OptionalManyToManyField(Transaction)
    name = fields.ShortCharField(display=True)
    amount = fields.AmountField(display=True)
    description = fields.MediumCharField(display=True)
    date_due = fields.OptionalDateField()

    @property
    def payment_total(self):
        return sum(p.amount for p in self.payments.all())

    @property
    def date_completed(self):
        total = self.payments.aggregate(total=Sum("amount"))["total"] or 0
        if total >= self.amount:
            return (
                self.payments.order_by("-created_at")
                .values_list("created_at", flat=True)
                .first()
                .date()
            )
        return None
