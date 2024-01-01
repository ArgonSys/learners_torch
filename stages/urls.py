from django.urls import path

from .views import StageCreateView, StageUpdateView


urlpatterns = [
    path("<int:plan_pk>/new", StageCreateView.as_view(), name="new"),
    path("<int:plan_pk>/<int:stage_pk>/edit", StageUpdateView.as_view(), name="edit"),
]
