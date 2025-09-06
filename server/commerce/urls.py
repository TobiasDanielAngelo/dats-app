from my_django_app.urls import auto_create_urlpatterns
from . import viewsets
from django.urls import path, include
from rest_framework.routers import DefaultRouter


router = DefaultRouter()

router.register("myprints/", viewsets.SaleReceiptPrintViewSet, basename="myprints")

router_urls = auto_create_urlpatterns(viewsets)

urlpatterns = router_urls + [
    path("", include(router.urls)),
]
