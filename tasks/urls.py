from django.urls import path

from .views import (
    TaskCreateView,
    TaskShowView,
    TaskUpdateView,
    TaskDeleteView,
    TaskSwapView,
)


app_name = "tasks"

urlpatterns = [
    path("<int:plan_pk>/new", TaskCreateView.as_view(), name="new"),
    path("<int:task_pk>", TaskShowView.as_view(), name="show"),
    path("<int:task_pk>/edit", TaskUpdateView.as_view(), name="edit"),
    path("<int:task_pk>/delete", TaskDeleteView.as_view(), name="delete"),
    path("swap", TaskSwapView.as_view(), name="swap"),
]
