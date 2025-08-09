from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import *


@receiver(post_migrate)
def create_default_accounts(sender, **kwargs):
    if sender.name != "core":
        return

    defaults = [
        (Setting, 1000001, {"key": "Theme", "value": "dark"}),
    ]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)
