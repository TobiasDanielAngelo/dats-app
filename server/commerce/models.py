from my_django_app import fields
from product.models import *
from finance.models import *
from people.models import *


class InventoryLog(fields.CustomModel):
    LOG_TYPE_CHOICES = [
        (0, "Sale"),
        (1, "Purchase"),
        (2, "Return"),
        (3, "Adjustment"),
        (4, "Physical Count"),
        (5, "Transfer"),
    ]
    product = fields.CascadeRequiredForeignKey(Article, display=True)
    quantity = fields.LimitedIntegerField()
    log_type = fields.ChoiceIntegerField(LOG_TYPE_CHOICES, display=True)
    transmitter = fields.SetNullOptionalForeignKey(Location)
    receiver = fields.SetNullOptionalForeignKey(Location)


STATUS_CHOICES = [
    (0, "Draft"),
    (1, "Pending Approval"),
    (2, "Approved"),
    (3, "Fulfilled"),
    (4, "Cancelled"),
]


class Sale(fields.CustomModel):
    status = fields.ChoiceIntegerField(STATUS_CHOICES, display=True)
    transactions = fields.OptionalManyToManyField(Transaction)
    inventory_logs = fields.OptionalManyToManyField(InventoryLog)
    customer = fields.SetNullOptionalForeignKey(Customer, display=True)


class Purchase(fields.CustomModel):
    status = fields.ChoiceIntegerField(STATUS_CHOICES, display=True)
    transactions = fields.OptionalManyToManyField(Transaction)
    inventory_logs = fields.OptionalManyToManyField(InventoryLog)
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
