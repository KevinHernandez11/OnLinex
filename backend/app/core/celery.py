from celery import Celery

celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",  # o RabbitMQ si prefieres
    backend="redis://localhost:6379/0"
)

celery_app.conf.timezone = "UTC"

celery_app.conf.beat_schedule = {
    "clean-expired-rooms-every-hour": {
        "task": "tasks.clean_expired_rooms",
        "schedule": 3600.0,
    },
}

celery_app.autodiscover_tasks(['app.tasks'])
