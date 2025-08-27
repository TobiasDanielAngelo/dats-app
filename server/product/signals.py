from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver
from .models import Address, Location, Unit, Category


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
        (Unit, -1, {"name": "pcs"}),
        (Unit, -2, {"name": "set"}),
        (Unit, -3, {"name": "ft"}),
        (Unit, -4, {"name": "m"}),
    ]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)


@receiver(post_save, sender=Category)
def generate_images_if_needed(sender, instance, **kwargs):
    if instance.to_print_price:
        post_save.disconnect(generate_images_if_needed, sender=Category)
        instance.generate_pricelist_image()
        post_save.connect(generate_images_if_needed, sender=Category)

    if instance.to_print_compatibility:
        post_save.disconnect(generate_images_if_needed, sender=Category)
        instance.generate_compatibility_image()
        post_save.connect(generate_images_if_needed, sender=Category)
