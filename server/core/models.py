from my_django_app import fields


class Setting(fields.CustomModel):
    key = fields.ShortCharField(unique=True, display=True)
    value = fields.LongCharField()
    description = fields.MediumCharField()
