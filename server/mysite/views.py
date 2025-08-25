# views.py
import os
from django.http import HttpResponse, Http404, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from django.conf import settings
import mimetypes
from django.http import FileResponse


@login_required
def serve_upload(request, file_path):
    if not user_has_permission(request.user, file_path):
        return HttpResponseForbidden("Access denied")

    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
    if not os.path.exists(full_path):
        raise Http404("File not found")

    content_type, _ = mimetypes.guess_type(full_path) or (
        "application/octet-stream",
        None,
    )
    return FileResponse(open(full_path, "rb"), content_type=content_type)


def user_has_permission(user, file_path):
    # Your permission logic here
    return True  # Replace with actual checks
