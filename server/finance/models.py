from my_django_app import fields
from my_django_app.utils import CannotEqual
from django.db.models import Sum, CheckConstraint, Q, F
from commerce.models import Sale, Purchase


TYPE_CHOICES = [
    (0, "Cash"),
    (1, "Coins"),
    (3, "Cash + Coins"),
    (4, "Savings"),
    (5, "Credit"),
    (6, "Loan"),
    (7, "Mortgage"),
    (8, "Stocks"),
    (9, "Assets"),
    (10, "Liabilities"),
    (11, "Untracked"),
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
    sale = fields.CascadeOptionalForeignKey(Sale)
    purchase = fields.CascadeOptionalForeignKey(Purchase)
    category = fields.SetNullOptionalForeignKey(Category, display=True)
    description = fields.MediumCharField(display=True)
    coming_from = fields.SetNullOptionalForeignKey(Account, display=True)
    going_to = fields.SetNullOptionalForeignKey(Account, display=True)
    amount = fields.AmountField()

    class Meta:
        constraints = [CannotEqual("coming_from", "going_to", "Transaction")]


class Receivable(fields.CustomModel):
    charge = fields.CascadeOptionalForeignKey(Transaction)
    payments = fields.OptionalManyToManyField(Transaction)
    name = fields.ShortCharField(display=True)
    amount = fields.AmountField(display=True)
    description = fields.MediumCharField(display=True)
    date_due = fields.OptionalDateField()
    date_completed = fields.OptionalDateField(display=True)

    def payment_total(self):
        return sum(p.amount for p in self.payments.all())


class Payable(fields.CustomModel):
    charge = fields.CascadeOptionalForeignKey(Transaction)
    payments = fields.OptionalManyToManyField(Transaction)
    name = fields.ShortCharField(display=True)
    amount = fields.AmountField(display=True)
    description = fields.MediumCharField(display=True)
    date_due = fields.OptionalDateField()
    date_completed = fields.OptionalDateField(display=True)

    def payment_total(self):
        return sum(p.amount for p in self.payments.all())
