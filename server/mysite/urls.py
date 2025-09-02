from django.contrib import admin
from django.urls import path, include
from my_django_app.urls import auth_url_patterns
from django.conf import settings
from django.conf.urls.static import static

from django.urls import re_path
from . import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("core.urls")),
    path("people/", include("people.urls")),
    path("product/", include("product.urls")),
    path("finance/", include("finance.urls")),
    path("commerce/", include("commerce.urls")),
    path("productivity/", include("productivity.urls")),
] + auth_url_patterns()

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += (re_path(r"^uploads/(?P<file_path>.+)$", views.serve_upload),)
