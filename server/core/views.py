from django.shortcuts import render


def my_custom_view(request):
    item_id = request.GET.get("id")  # returns "42"
    name = request.GET.get("name")  # returns "daniel"
    return render(
        request,
        "core/myview.html",
        {
            "item_id": item_id,
            "name": name,
        },
    )
