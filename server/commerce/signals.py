# signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Sale, InventoryLog
from finance.models import Transaction


@receiver(post_save, sender=Sale)
def set_default_customer(sender, instance, created, **kwargs):
    if instance.customer == "":
        padded_pk = str(instance.pk).zfill(6)
        instance.customer = f"Customer # {padded_pk}"
        Sale.objects.filter(pk=instance.pk).update(customer=instance.customer)


@receiver(post_save, sender=InventoryLog)
@receiver(post_delete, sender=InventoryLog)
@receiver(post_save, sender=Transaction)
@receiver(post_delete, sender=Transaction)
def sale_items_changed(sender, instance, **kwargs):
    sale = getattr(instance, "sale", None)
    if not sale:
        return
    if sale.amount_payable != 0:
        Sale.objects.filter(pk=sale.pk).update(
            status=0 if sale.amount_payable > 0 else 1
        )
    else:
        Sale.objects.filter(pk=instance.pk).update(
            status=2 if len(sale.inventorylog_sale.all()) > 0 else 0
        )
