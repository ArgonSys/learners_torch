from django.urls import path

from .views import (
    StageCreateView,
    StageUpdateView,
    StageDeleteView,
    StageSwapView,
)


app_name = "stages"

urlpatterns = [
    path("<int:plan_pk>/new", StageCreateView.as_view(), name="new"),
    path("<int:plan_pk>/<int:stage_pk>/edit", StageUpdateView.as_view(), name="edit"),
    path(
        "<int:plan_pk>/<int:stage_pk>/delete", StageDeleteView.as_view(), name="delete"
    ),
    path("swap", StageSwapView.as_view(), name="swap"),
]
