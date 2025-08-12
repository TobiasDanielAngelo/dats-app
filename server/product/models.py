from my_django_app import fields


class Unit(fields.CustomModel):
    name = fields.ShortCharField(display=True)


class Category(fields.CustomModel):
    name = fields.ShortCharField(display=True, unique=True)
    is_kit = fields.DefaultBooleanField(False, display=True)
    is_universal = fields.DefaultBooleanField(False, display=True)
    notes = fields.MediumCharField()


class CategoryComponent(fields.CustomModel):
    kit = fields.CascadeRequiredForeignKey(Category, display=True)
    percent_cost = fields.LimitedDecimalField(0, 100, 100)


class Maker(fields.CustomModel):
    name = fields.ShortCharField(display=True, unique=True)


class Motor(fields.CustomModel):
    maker = fields.SetNullOptionalForeignKey(Maker)
    model = fields.ShortCharField(display=True, unique=True)


class GenericProduct(fields.CustomModel):
    category = fields.SetNullOptionalForeignKey(Category, display=True)
    compatibility = fields.OptionalManyToManyField(Motor, display=True)
    reorder_level = fields.LimitedIntegerField(1, 100000, 10)


class Article(fields.CustomModel):
    generic_product = fields.CascadeRequiredForeignKey(GenericProduct, display=True)
    brand = fields.ShortCharField(display=True)
    is_orig = fields.DefaultBooleanField(False, display=True)
    unit = fields.SetNullOptionalForeignKey(Unit)
    quantity_per_unit = fields.LimitedIntegerField(1, 100, 1)
    purchase_price = fields.LimitedDecimalField(0, 999999.99)
    selling_price = fields.LimitedDecimalField(0, 999999.99)


class ProductComponent(fields.CustomModel):
    kit = fields.CascadeRequiredForeignKey(Article, display=True)
    component = fields.CascadeRequiredForeignKey(Article, display=True)
    percent_cost = fields.LimitedDecimalField(0, 100)


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


class Location(fields.CustomModel):
    address = fields.MediumCharField(display=True)
    shelf = fields.ShortCharField(display=True)

    class Meta:
        unique_together = ("address", "shelf")
