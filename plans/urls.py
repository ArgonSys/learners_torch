from django.urls import path

from .views import PlansIndexView


app_name = "plans"

urlpatterns = [
    path("", PlansIndexView.as_view(), name="index"),
]
