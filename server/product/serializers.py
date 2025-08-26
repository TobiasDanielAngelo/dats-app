from my_django_app.serializers import (
    auto_create_serializers,
    CustomSerializer,
    serializers,
)
from . import models
from .models import Article, GenericProduct
from django.db.models import Max

auto_create_serializers(models)


def int_to_code(n: float) -> str:
    num = int(n)  # truncate decimals
    mapping = {
        1: "L",
        2: "U",
        3: "C",
        4: "K",
        5: "Y",
        6: "S",
        7: "T",
        8: "O",
        9: "R",
        0: "E",
    }
    return "".join(mapping[int(d)] for d in str(abs(num)))


class CategorySerializer(CustomSerializer):
    price_matrix = serializers.SerializerMethodField()

    class Meta:
        fields = ["price_matrix"]

    def get_price_matrix(self, obj):
        # Step 1: get latest created_at per (brand, product)
        latest_articles = (
            Article.objects.filter(generic_product__category=obj)
            .values("brand", "generic_product_id")
            .annotate(latest_created=Max("created_at"))
        )

        # Step 2: fetch those records
        articles = Article.objects.filter(
            generic_product__category=obj,
            created_at__in=[la["latest_created"] for la in latest_articles],
        ).select_related("generic_product")

        # Collect brands (strings)
        brands = sorted({a.brand for a in articles})

        # Header row
        rows = [["Product"] + brands]

        # collect all products in this category
        products = {
            gp.description: {b: "" for b in brands}
            for gp in GenericProduct.objects.filter(category=obj)
        }

        # fill with data from articles
        for art in articles:
            prod = art.generic_product.description
            products[prod][
                art.brand
            ] = f"{art.selling_price} ({int_to_code(art.purchase_price)})"

        # Build rows
        for prod, brand_prices in products.items():
            rows.append([prod] + [brand_prices[b] for b in brands])

        return rows
