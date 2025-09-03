from my_django_app.urls import auto_create_urlpatterns
from . import viewsets
from django.urls import path
from . import views

router_urls = auto_create_urlpatterns(viewsets)

urlpatterns = router_urls + [path("myview/", views.my_custom_view, name="myview")]
