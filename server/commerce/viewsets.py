from my_django_app.viewsets import (
    auto_create_viewsets,
    CustomModelViewSet,
)
from . import models
from .models import SaleReceipt
from .authentication import APIKeyAuthentication
from .serializers import SaleReceiptPrintSerializer
from rest_framework.permissions import AllowAny

auto_create_viewsets(models)


class SaleReceiptPrintViewSet(CustomModelViewSet):
    queryset = SaleReceipt.objects.all()
    serializer_class = SaleReceiptPrintSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [AllowAny]
