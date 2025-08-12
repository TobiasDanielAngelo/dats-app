from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Account, TYPE_CHOICES
from my_django_app.utils import invert_choices


REVTYPE = invert_choices(TYPE_CHOICES)


@receiver(post_migrate)
def create_default_accounts(sender, **kwargs):
    if sender.name != "core":
        return

    defaults = [
        (Account, -1, {"name": "Initial", "type": REVTYPE["Untracked"]}),
        (Account, -2, {"name": "Untracked", "type": REVTYPE["Untracked"]}),
        (Account, -3, {"name": "Assets", "type": REVTYPE["Assets"]}),
        (Account, -4, {"name": "Liabilities", "type": REVTYPE["Liabilities"]}),
        (Account, -5, {"name": "Loan", "type": REVTYPE["Loan"]}),
        (Account, -6, {"name": "Mortgage", "type": REVTYPE["Mortgage"]}),
        (Account, -7, {"name": "Stocks", "type": REVTYPE["Stocks"]}),
        (Account, -8, {"name": "Assets", "type": REVTYPE["Assets"]}),
        (Account, -9, {"name": "Cash Box", "type": REVTYPE["Cash"]}),
        (Account, -10, {"name": "Coin Box", "type": REVTYPE["Coins"]}),
        (Account, -11, {"name": "Cash Register", "type": REVTYPE["Cash + Coins"]}),
    ]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)
