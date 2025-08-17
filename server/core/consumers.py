from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.apps import apps
from datetime import datetime
from asgiref.sync import sync_to_async

WATCHED_MODELS = [
    f"{model._meta.app_label}.{model.__name__}"
    for model in apps.get_models()
    if "updated_at" in [f.name for f in model._meta.get_fields()]
]


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.send(text_data=json.dumps({"message": data["message"]}))


async def push_counts(self, event):
    # Optional: Only send if event.model_path is in self.models_info
    await self.send_counts()


class CountsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.latest_updated = self.scope["url_route"]["kwargs"]["latest_updated"]
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        # Client can send a new latest_updated date
        if text_data:
            data = json.loads(text_data)
            self.latest_updated = data.get("latest_updated")
            await self.send_counts()

    async def send_counts(self):
        counts = await self.get_counts()
        await self.send(
            text_data=json.dumps(
                {"latest_updated": self.latest_updated, "counts": counts}
            )
        )

    @sync_to_async
    def get_counts(self):
        counts = {}
        last_dt = None
        if self.latest_updated:
            try:
                last_dt = datetime.fromisoformat(self.latest_updated)
            except ValueError:
                pass

        for model_path in WATCHED_MODELS:
            app_label, model_name = model_path.split(".")
            model = apps.get_model(app_label, model_name)
            qs = model.objects.all()
            if last_dt and hasattr(model, "updated_at"):
                qs = qs.filter(updated_at__gt=last_dt)
            counts[model_path] = qs.count()
        return counts
