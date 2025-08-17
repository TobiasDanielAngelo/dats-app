# signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import (
    Sale,
    InventoryLog,
    Labor,
    TemporarySale,
    Purchase,
    TemporaryPurchase,
)
from finance.models import Transaction, Account, Category
from my_django_app.utils import SumProduct
from django.utils import timezone


@receiver(post_save, sender=Sale)
def set_default_customer(sender, instance, created, **kwargs):
    if instance.customer == "":
        padded_pk = str(instance.pk).zfill(5)
        instance.customer = f"C#{padded_pk}"
        Sale.objects.filter(pk=instance.pk).update(
            customer=instance.customer, updated_at=timezone.now()
        )


@receiver(post_delete, sender=TemporaryPurchase)
@receiver(post_delete, sender=InventoryLog)
@receiver(post_delete, sender=TemporarySale)
@receiver(post_delete, sender=Transaction)
@receiver(post_delete, sender=Labor)
def items_deleted(sender, instance, **kwargs):
    if hasattr(instance, "sale") and instance.sale is not None:
        Sale.objects.filter(pk=instance.sale.pk).update(updated_at=timezone.now())
    elif hasattr(instance, "purchase") and instance.purchase is not None:
        Purchase.objects.filter(pk=instance.purchase.pk).update(
            updated_at=timezone.now()
        )


@receiver(post_save, sender=Labor)
def labor_paid_changed(sender, instance: Labor, **kwargs):
    going_to = Account.objects.get(name="Cash Register")
    category = Category.objects.get(title="Product Sales")
    if not instance.is_paid and instance.collection:
        instance.collection.delete()
        instance.labor = None
    if instance.is_paid and not instance.collection:
        transaction = Transaction(
            labor=instance,
            sale=instance.sale,
            going_to=going_to,
            category=category,
            description=f"Compensation for C#{instance.sale.id}",
            amount=-instance.compensation_amount,
            updated_at=timezone.now(),
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


@receiver(post_save, sender=InventoryLog)
@receiver(post_save, sender=Transaction)
def purchase_items_changed(sender, instance, **kwargs):
    purchase = getattr(instance, "purchase", None)
    if not purchase:
        return
    if purchase.amount_payable != 0 or purchase.unclaimed_items > 0:
        Purchase.objects.filter(pk=purchase.pk).update(
            status=0 if purchase.amount_payable > 0 else 1
        )
    else:
        Purchase.objects.filter(pk=purchase.pk).update(
            status=(2 if (purchase.amount_paid > 0) else 0)
        )
    Purchase.objects.filter(pk=purchase.pk).update(updated_at=timezone.now())


@receiver(post_delete, sender=Transaction)
def collection_deleted(sender, instance, **kwargs):
    if instance.labor:
        Labor.objects.filter(pk=instance.labor.pk).update(is_paid=False)


@receiver(post_save, sender=InventoryLog)
def inventory_log_adjust_stock_value(sender, instance, **kwargs):
    stock_account = Account.objects.get(name="Stocks")
    if instance.log_type == 3:
        transaction = Transaction(
            description=f"Stock Adjustment for Log # {instance.pk}",
            going_to=stock_account,
            amount=instance.quantity * instance.product.selling_price,
        )
        transaction.save()


# from product.models import Article

# @receiver(post_save, sender=InventoryLog)
# def handle_article_inventory(sender, instance, created, **kwargs):
#     if not created:
#         return  # avoid loops

#     article = instance.article
#     qty = instance.quantity_change

#     if article.parent_article:
#         # CHILD sold or stocked
#         if qty < 0:
#             # Sell: deduct parent immediately
#             create_inventory_log(article.parent_article, -1)
#     else:
#         # PARENT stocked/sold
#         children = Article.objects.filter(parent_article=article)
#         if qty > 0:
#             for child in children:
#                 create_inventory_log(child, qty)
#         elif qty < 0:
#             for child in children:
#                 create_inventory_log(child, qty)


# def create_inventory_log(article, qty_change):
#     InventoryLog.objects.create(
#         article=article,
#         quantity_change=qty_change
#     )


# @receiver(post_delete, sender=InventoryLog)
# def handle_article_inventory_delete(sender, instance, **kwargs):
#     article = instance.article
#     qty = instance.quantity_change

#     if article.parent_article:
#         # Undo parent effect if a child log is deleted
#         if qty < 0:
#             create_inventory_log(article.parent_article, +1)
#     else:
#         # Undo children effect if a parent log is deleted
#         children = Article.objects.filter(parent_article=article)
#         if qty > 0:
#             for child in children:
#                 create_inventory_log(child, -qty)
#         elif qty < 0:
#             for child in children:
#                 create_inventory_log(child, -qty)
