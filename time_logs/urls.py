from django.urls import path

from .views import MeasureTimeView, DeleteTimeView


app_name = "time_logs"

urlpatterns = [
    path("<int:task_pk>/time_log", MeasureTimeView.as_view(), name="measure_time"),
    path(
        "<int:task_pk>/time_log/<int:time_log_pk>",
        DeleteTimeView.as_view(),
        name="delete_time",
    ),
]
