from my_django_app import fields
from django.contrib.auth.models import AbstractUser


class Position(fields.CustomModel):
    title = fields.ShortCharField(unique=True, display=True)
    description = fields.MediumCharField()


class Employee(AbstractUser):
    position = fields.SetNullOptionalForeignKey(Position, display=True)
    phone = fields.ShortCharField()


class Customer(fields.CustomModel):
    name = fields.ShortCharField(unique=True, display=True)
    phone = fields.ShortCharField()
    address = fields.MediumCharField()


class Supplier(fields.CustomModel):
    name = fields.ShortCharField(unique=True, display=True)
    contact_person = fields.ShortCharField()
    email = fields.ShortCharField()
    phone = fields.ShortCharField()
    address = fields.MediumCharField()
