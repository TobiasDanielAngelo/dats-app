from django.contrib import admin
from django.urls import path, include
from my_django_app.urls import auth_url_patterns
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("core.urls")),
    path("people/", include("people.urls")),
    path("product/", include("product.urls")),
    path("finance/", include("finance.urls")),
    path("commerce/", include("commerce.urls")),
] + auth_url_patterns()

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
