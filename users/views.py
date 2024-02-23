from django.contrib.auth.views import (
    LoginView as BaseLoginView,
    LogoutView as BaseLogoutView,
)
from django.views.generic import CreateView
from django.forms import inlineformset_factory
from django.urls import reverse_lazy

from .models import User
from .forms import SignupForm, LoginForm


class SignupView(CreateView):
    model = User
    form_class = SignupForm
    template_name = "users/signup.html"
    success_url = reverse_lazy("top")

    def form_valid(self, form):
        user = form["user"].save()
        profile = form["profile"].save(commit=False)
        profile.user = user
        profile.save()
        return super().form_valid(form)


class LoginView(BaseLoginView):
    model = User
    form_class = LoginForm
    template_name = "users/login.html"
    success_url = reverse_lazy("top")


class LogoutView(BaseLogoutView):
    model = User
    success_url = reverse_lazy("top")
