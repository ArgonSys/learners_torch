from django.urls import path

from .views import(
    PlansShowView,
    PlansIndexView,
    PlansCreateView,
    PlansUpdateView,
    PlansDeleteView,
)

app_name = "plans"

urlpatterns = [
    path("<int:plan_pk>", PlansShowView.as_view(), name="show"),
    path("", PlansIndexView.as_view(), name="index"),
    path("new", PlansCreateView.as_view(), name="new"),
    path("<int:plan_pk>/edit", PlansUpdateView.as_view(), name="edit"),
    path("<int:plan_pk>/delete", PlansDeleteView.as_view(), name="delete"),
]
