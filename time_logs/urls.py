from django.urls import path

from .views import MeasureTimeView


app_name = "time_logs"

urlpatterns = [
    path("", MeasureTimeView.as_view(), name="measure_time"),
]
