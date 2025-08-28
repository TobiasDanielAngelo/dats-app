def get_price_matrix(obj):
    from .models import Article, GenericProduct
    from django.db.models import Max
    from core.utils import int_to_code

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
        for gp in GenericProduct.objects.filter(category=obj).order_by("description")
    }

    # fill with data from articles
    for art in articles:
        prod = art.generic_product.description
        products[prod][art.brand] = f"{art.selling_price}"
        # \n({int_to_code(art.purchase_price)})

    # Build rows
    for prod, brand_prices in products.items():
        rows.append([prod] + [brand_prices[b] for b in brands])

    return rows


def get_compatibility_matrix(obj):
    from .models import GenericProduct, Category, Motor

    # Only build matrix if this category has children
    child_cats = Category.objects.filter(parent_category=obj)
    if not child_cats.exists():
        return []

    # Collect all motors that appear under these child categories
    motors = Motor.objects.all()

    # Header row: "Motor" + each child category name
    rows = [["Motor"] + [cat.name for cat in child_cats]]

    # Build each row for a motor
    for motor in motors:
        row = [motor.model]
        for cat in child_cats:
            products = GenericProduct.objects.filter(
                category=cat, compatibility=motor
            ).values_list("description", flat=True)
            row.append(", ".join(products))
        rows.append(row)

    return rows
