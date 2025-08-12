from my_django_app.serializers import auto_create_serializers, CustomSerializer
from . import models
from .models import Sale
from rest_framework import serializers

auto_create_serializers(models)
