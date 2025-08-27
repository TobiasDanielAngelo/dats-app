from my_django_app.serializers import (
    auto_create_serializers,
    CustomSerializer,
    serializers,
)
from . import models
from .utils import get_compatibility_matrix, get_price_matrix

auto_create_serializers(models)


class CategorySerializer(CustomSerializer):
    price_matrix = serializers.SerializerMethodField()
    compatibility_matrix = serializers.SerializerMethodField()

    class Meta:
        fields = ["price_matrix", "compatibility_matrix"]

    def get_price_matrix(self, obj):
        return get_price_matrix(obj)

    def get_compatibility_matrix(self, obj):
        return get_compatibility_matrix(obj)
