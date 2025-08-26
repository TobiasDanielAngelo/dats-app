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
    reorder_level = fields.LimitedIntegerField(1, 100000, 10)

    def clean(self):
        super().clean()
        motors = getattr(self, "_prefetched_compatibility", None)
        if motors is None:
            if self.pk:
                motors = self.compatibility.all()
            else:
                motors = []  # or skip
        if self.category:
            for motor in motors:
                if (
                    GenericProduct.objects.exclude(pk=self.pk)
                    .filter(category=self.category, compatibility=motor)
                    .exists()
                ):
                    raise ValidationError(
                        {
                            "category": f"Combination of category '{self.category}' and motor '{motor}' already exists.",
                            "compatibility": f"Combination of category '{self.category}' and motor '{motor}' already exists.",
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
