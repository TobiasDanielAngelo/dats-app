from my_django_app import fields
from django.db.models import Sum


class Account(fields.CustomModel):
    name = fields.ShortCharField(display=True)

    @property
    def net_balance(self):
        inflow = self.transaction_receiver.aggregate(total=Sum("amount"))["total"] or 0
        outflow = (
            self.transaction_transmitter.aggregate(total=Sum("amount"))["total"] or 0
        )
        return inflow - outflow


class Category(fields.CustomModel):
    NATURE_CHOICES = [
        (0, "Outgoing"),
        (1, "Incoming"),
        (2, "Transfer"),
        (3, "Receivable"),
        (4, "Payable"),
    ]
    title = fields.ShortCharField(display=True)
    nature = fields.ChoiceIntegerField(NATURE_CHOICES)


class Transaction(fields.CustomModel):
    category = fields.SetNullOptionalForeignKey(Category)
    description = fields.MediumCharField(display=True)
    transmitter = fields.SetNullOptionalForeignKey(Account)
    receiver = fields.SetNullOptionalForeignKey(Account)
    amount = fields.AmountField()


class Receivable(fields.CustomModel):
    charge = fields.CascadeOptionalForeignKey(Transaction)
    payments = fields.OptionalManyToManyField(Transaction)
    name = fields.ShortCharField(display=True)
    amount = fields.AmountField()
    description = fields.MediumCharField(display=True)
    date_due = fields.OptionalDateField()
    date_completed = fields.OptionalDateField()

    def payment_total(self):
        return sum(p.amount for p in self.payments.all())


class Payable(fields.CustomModel):
    charge = fields.CascadeOptionalForeignKey(Transaction)
    payments = fields.OptionalManyToManyField(Transaction)
    name = fields.ShortCharField(display=True)
    amount = fields.AmountField()
    description = fields.MediumCharField(display=True)
    date_due = fields.OptionalDateField()
    date_completed = fields.OptionalDateField()

    def payment_total(self):
        return sum(p.amount for p in self.payments.all())
