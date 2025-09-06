from my_django_app.serializers import auto_create_serializers
from . import models
from rest_framework import serializers
from .models import SaleReceipt

auto_create_serializers(models)


class SaleReceiptPrintSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleReceipt
        fields = ["image", "id", "to_print"]
