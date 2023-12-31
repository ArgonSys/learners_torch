from django.urls import path

from .views import StageCreateView, StageUpdateView


urlpatterns = [
    path("new", StageCreateView.as_view(), name="new"),
    path("<int:stage_pk>/edit", StageUpdateView.as_view(), name="edit"),
]
