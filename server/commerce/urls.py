from my_django_app.urls import auto_create_urlpatterns
from . import viewsets

router_urls = auto_create_urlpatterns(viewsets)

urlpatterns = router_urls
