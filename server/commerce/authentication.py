from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


class APIKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        api_key = request.headers.get("X-API-KEY")

        if api_key != settings.SPECIAL_API_KEY:
            raise AuthenticationFailed("Invalid API Key")

        # No user attached, but passes authentication
        return (None, None)
