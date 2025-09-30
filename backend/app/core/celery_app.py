# from celery import Celery
# from celery.schedules import crontab

# celery = Celery(
#     'app',
#     broker=settings.CELERY_BROKER_URL,
#     backend=settings.CELERY_RESULT_BACKEND,
# )

# celery.conf.beat_schedule = {
#     'cleanup-every-hour': {
#         'task': 'app.tasks.cleanup_expired_rooms',
#         'schedule': crontab(minute=0, hour='*'),  # cada hora
#     },
# }

