# signals.py
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import Sale, InventoryLog, Labor
from finance.models import Transaction, Account, Category
from django.utils import timezone


@receiver(post_save, sender=Sale)
def set_default_customer(sender, instance, created, **kwargs):
    if instance.customer == "":
        padded_pk = str(instance.pk).zfill(5)
        instance.customer = f"C#{padded_pk}"
        Sale.objects.filter(pk=instance.pk).update(
            customer=instance.customer, updated_at=timezone.now()
        )


@receiver(post_save, sender=Labor)
def labor_paid_changed(sender, instance: Labor, **kwargs):
    going_to = Account.objects.get(name="Cash Register")
    category = Category.objects.get(title="Product Sales")
    if not instance.is_paid and instance.collection:
        instance.collection.delete()
    if instance.is_paid and not instance.collection:
        transaction = Transaction(
            sale=instance.sale,
            going_to=going_to,
            category=category,
            description=f"Compensation for C#{instance.sale.id}",
            amount=-instance.compensation_amount,
        )
        transaction.save()
        instance.collection = transaction
        instance.save()
    Sale.objects.filter(pk=instance.sale.pk).update(updated_at=timezone.now())


@receiver(post_save, sender=InventoryLog)
@receiver(post_save, sender=Transaction)
@receiver(post_save, sender=Labor)
def sale_items_changed(sender, instance, **kwargs):
    sale = getattr(instance, "sale", None)
    if not sale:
        return
    if (
        sale.amount_payable != 0
        or sale.uncollected_compensation > 0
        or sale.unclaimed_items > 0
    ):
        Sale.objects.filter(pk=sale.pk).update(
            status=0 if sale.amount_payable > 0 else 1
        )
    else:
        Sale.objects.filter(pk=sale.pk).update(
            status=(2 if (sale.amount_paid > 0) else 0)
        )
    Sale.objects.filter(pk=sale.pk).update(updated_at=timezone.now())
