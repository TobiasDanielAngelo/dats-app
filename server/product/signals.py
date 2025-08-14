from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Address, Location


@receiver(post_migrate)
def create_default_accounts(sender, **kwargs):
    if sender.name != "core":
        return

    defaults = [(Address, -1, {"name": "Gen Luna"})]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)

    defaults = [
        (Location, -1, {"address": Address.objects.get(pk=-1), "shelf": "Shelf"}),
        (Location, -2, {"address": Address.objects.get(pk=-1), "shelf": "Storage"}),
    ]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)
