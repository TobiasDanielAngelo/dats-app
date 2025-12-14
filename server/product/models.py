from my_django_app import fields
from django.core.exceptions import ValidationError
from .utils import generate_pricelist_assets, generate_compatibility_assets


class Unit(fields.CustomModel):
    name = fields.ShortCharField(display=True)


class Category(fields.CustomModel):
    parent_category = fields.SetNullOptionalForeignKey("self")
    name = fields.ShortCharField(display=True, unique=True)
    is_kit = fields.DefaultBooleanField(False)
    is_universal = fields.DefaultBooleanField(False)
    notes = fields.MediumCharField()
    to_print_price = fields.DefaultBooleanField(False)
    to_print_compatibility = fields.DefaultBooleanField(False)
    pricelist_image = fields.ImageField("prices")
    compatibility_image = fields.ImageField("compatibility")
    pricelist_file = fields.FileField("prices-csv")
    compatibility_file = fields.FileField("compatibility-csv")

    def generate_pricelist_image(self):
        generate_pricelist_assets(self)

    def generate_compatibility_image(self):
        generate_compatibility_assets(self)


class Maker(fields.CustomModel):
    name = fields.ShortCharField(display=True, unique=True)


class Motor(fields.CustomModel):
    maker = fields.SetNullOptionalForeignKey(Maker)
    model = fields.ShortCharField(display=True, unique=True)
    piston_pin_size = fields.LimitedDecimalField(10, 20, 10)
    piston_bore_00 = fields.LimitedDecimalField(40, 60, 40)
    piston_bore_25 = fields.LimitedDecimalField(40, 60, 40)
    piston_bore_50 = fields.LimitedDecimalField(40, 60, 40)
    piston_bore_75 = fields.LimitedDecimalField(40, 60, 40)
    piston_bore_100 = fields.LimitedDecimalField(40, 60, 40)
    piston_bore_150 = fields.LimitedDecimalField(40, 60, 40)
    piston_bore_200 = fields.LimitedDecimalField(40, 60, 40)


class GenericProduct(fields.CustomModel):
    category = fields.SetNullOptionalForeignKey(Category, display=True)
    compatibility = fields.OptionalManyToManyField(Motor, display=True)
    description = fields.MediumCharField(display=True)
    reorder_level = fields.LimitedIntegerField(1, 100000, 10)
    is_article = fields.DefaultBooleanField(False)

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


class PrintDimension(fields.CustomModel):
    width_mm = fields.LimitedIntegerField(1, 330, 10)
    height_mm = fields.LimitedIntegerField(1, 330, 10)
    name = fields.ShortCharField()

    def __str__(self):
        return f"W/H: {self.width_mm}mm x {self.height_mm}mm" + (
            f" ({self.name})" if self.name != "" else ""
        )


class PrintJob(fields.CustomModel):
    dimension = fields.SetNullOptionalForeignKey(PrintDimension)
    product = fields.CascadeOptionalForeignKey(Article, display=True)
    description = fields.LongCharField(display=True)
    purchase_code = fields.ShortCharField()
    selling_code = fields.ShortCharField()
    font_sizes = fields.NumberArrayField()
    quantity = fields.LimitedIntegerField(1, 10000)
    is_completed = fields.DefaultBooleanField(False)
    image = fields.ImageField(upload_to="label_images/")
    img_width_mm = fields.LimitedIntegerField(1, 100, 5)
    is_q1_not_q3 = fields.DefaultBooleanField(
        False
    )  # If True, the image is in Q1 else Q3

    @property
    def width_mm(self):
        return self.dimension.width_mm if self.dimension.width_mm else 0

    @property
    def height_mm(self):
        return self.dimension.height_mm if self.dimension.height_mm else 0


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
