from my_django_app import fields
from django.core.exceptions import ValidationError


class Unit(fields.CustomModel):
    name = fields.ShortCharField(display=True)


class Category(fields.CustomModel):
    parent_category = fields.SetNullOptionalForeignKey("self")
    name = fields.ShortCharField(display=True, unique=True)
    is_kit = fields.DefaultBooleanField(False)
    is_universal = fields.DefaultBooleanField(False)
    notes = fields.MediumCharField()


class Maker(fields.CustomModel):
    name = fields.ShortCharField(display=True, unique=True)


class Motor(fields.CustomModel):
    maker = fields.SetNullOptionalForeignKey(Maker)
    model = fields.ShortCharField(display=True, unique=True)


class GenericProduct(fields.CustomModel):
    category = fields.SetNullOptionalForeignKey(Category, display=True)
    compatibility = fields.OptionalManyToManyField(Motor, display=True)
    description = fields.MediumCharField(display=True)
    reorder_level = fields.LimitedIntegerField(1, 100000, 10)

    def clean(self):
        super().clean()
        motors = getattr(self, "_prefetched_compatibility", None)
        if motors is None:
            motors = self.compatibility.all() if self.pk else []

        # Normalize empties
        has_cat = bool(self.category)
        has_desc = bool(self.description)
        has_motor = bool(motors)

        if not (has_cat or has_desc or has_motor):
            return  # all empty, skip

        # Check for each motor if applicable, else handle no motor case
        check_motors = motors if has_motor else [None]

        for motor in check_motors:
            qs = GenericProduct.objects.exclude(pk=self.pk)

            # Build filter based on non-empty fields
            filters = {}
            if has_cat:
                filters["category"] = self.category
            if has_desc:
                filters["description"] = self.description
            if motor:
                filters["compatibility"] = motor

            if filters and qs.filter(**filters).exists():
                parts = []
                if has_cat:
                    parts.append(f"category '{self.category}'")
                if has_desc:
                    parts.append(f"description '{self.description}'")
                if motor:
                    parts.append(f"motor '{motor}'")

                msg = f"Combination of {', '.join(parts)} already exists."
                raise ValidationError(
                    {
                        "category": msg if has_cat else None,
                        "description": msg if has_desc else None,
                        "compatibility": msg if motor else None,
                    }
                )


class Article(fields.CustomModel):
    parent_article = fields.CascadeOptionalForeignKey("self")
    generic_product = fields.CascadeRequiredForeignKey(GenericProduct, display=True)
    brand = fields.ShortCharField(display=True)
    is_orig = fields.DefaultBooleanField(False, display=True)
    unit = fields.SetNullOptionalForeignKey(Unit)
    quantity_per_unit = fields.LimitedIntegerField(1, 100, 1)
    purchase_price = fields.LimitedDecimalField(0, 999999.99)
    selling_price = fields.LimitedDecimalField(0, 999999.99)

    def clean(self):
        super().clean()

        if self.purchase_price >= self.selling_price:
            raise ValidationError(
                {
                    "purchase_price": f"Must be less than selling price.",
                    "selling_price": f"Must be greater than purchase price.",
                }
            )


class Barcode(fields.CustomModel):
    product = fields.OneToOneField(Article, display=True)
    code = fields.ShortCharField(unique=True)


class PrintJob(fields.CustomModel):
    product = fields.CascadeRequiredForeignKey(Article, display=True)
    quantity = fields.LimitedIntegerField(1, 10000)


class ProductImage(fields.CustomModel):
    part = fields.CascadeRequiredForeignKey(Article, display=True)
    image = fields.ImageField(upload_to="part_images/")
    alt_text = fields.ShortCharField()


class Address(fields.CustomModel):
    name = fields.MediumCharField(display=True, unique=True)


class Location(fields.CustomModel):
    address = fields.CascadeRequiredForeignKey(Address, display=True)
    shelf = fields.ShortCharField(display=True)

    class Meta:
        unique_together = ("address", "shelf")
