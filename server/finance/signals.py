from django.db.models.signals import post_migrate, post_save, post_delete
from django.db.models import Sum
from django.dispatch import receiver
from .models import Account, TYPE_CHOICES, Category, NATURE_CHOICES, Receivable
from my_django_app.utils import invert_choices
from django.utils import timezone


REVTYPE = invert_choices(TYPE_CHOICES)
REV_NATURE_TYPE = invert_choices(NATURE_CHOICES)


@receiver(post_migrate)
def create_default_accounts(sender, **kwargs):
    if sender.name != "core":
        return

    defaults = [
        (Account, -1, {"name": "Initial", "type": REVTYPE["Untracked"]}),
        (Account, -2, {"name": "Untracked", "type": REVTYPE["Untracked"]}),
        (Account, -3, {"name": "Assets", "type": REVTYPE["Assets"]}),
        (Account, -4, {"name": "Liabilities", "type": REVTYPE["Liabilities"]}),
        (Account, -5, {"name": "Checking", "type": REVTYPE["Checking"]}),
        (Account, -6, {"name": "Mortgage", "type": REVTYPE["Mortgage"]}),
        (Account, -7, {"name": "Stocks", "type": REVTYPE["Stocks"]}),
        (Account, -8, {"name": "Cash Box", "type": REVTYPE["Cash"]}),
        (Account, -9, {"name": "Coin Box", "type": REVTYPE["Coins"]}),
        (Account, -10, {"name": "Cash Register", "type": REVTYPE["Cash + Coins"]}),
    ]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)

    default = []

    CATEGORY_GROUPS = {
        "Outgoing": [
            "Food",
            "Utilities",
            "Rent",
            "Salaries",
            "Supplies",
            "Transportation",
            "Repairs & Maintenance",
            "Marketing",
            "Taxes",
            "Miscellaneous",
        ],
        "Incoming": [
            "Product Sales",
            "Service Income",
            "Rental Income",
            "Interest Income",
            "Other Income",
        ],
        "Transfer": [
            "Bank Transfer",
            "Cash to Bank",
            "Bank to Cash",
            "Inter-branch Transfer",
        ],
        "Receivable": [
            "Customer Credit",
            "Loan to Employee",
            "Advance Payment from Customer",
        ],
        "Payable": ["Supplier Invoice", "Loan Payable", "Tax Payable"],
    }

    pk_counter = -1

    for nature, titles in CATEGORY_GROUPS.items():
        for title in titles:
            default.append(
                (
                    Category,
                    pk_counter,
                    {"title": title, "nature": REV_NATURE_TYPE[nature]},
                )
            )
            pk_counter -= 1

    for model, id, fields in default:
        model.objects.get_or_create(id=id, defaults=fields)
