# views.py
import os
from django.http import HttpResponse, Http404, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from django.conf import settings
import mimetypes


@login_required
def serve_upload(request, file_path):
    # Check if user can access this file
    if not user_has_permission(request.user, file_path):
        return HttpResponseForbidden("Access denied")

    # Build safe file path
    full_path = os.path.join(settings.MEDIA_ROOT, "uploads", file_path)

    # Security check
    if not os.path.exists(full_path):
        raise Http404("File not found")

    # Serve the file
    content_type, _ = mimetypes.guess_type(full_path)
    with open(full_path, "rb") as f:
        response = HttpResponse(f.read(), content_type=content_type)
        return response


def user_has_permission(user, file_path):
    # Your permission logic here
    return True  # Replace with actual checks
