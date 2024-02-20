from django.contrib.auth.views import (
    LoginView as BaseLoginView,
    LogoutView as BaseLogoutView,
)
from django.views.generic import CreateView
from django.forms import inlineformset_factory
from django.urls import reverse_lazy

from .models import User
from .forms import SignupForm, LoginForm

from profiles.models import Profile


class SignupView(CreateView):
    model = User
    form_class = SignupForm
    template_name = "users/signup.html"
    success_url = reverse_lazy("top")

    def get_context_data(self, **kwargs):
        ProfileFormset = inlineformset_factory(
            User,
            Profile,
            fields=(
                "icon",
                "bio",
                "affiliation",
                "location",
            ),
            extra=1,
            can_delete_extra=False,
        )

        context = super().get_context_data(**kwargs)
        context["profile_form"] = ProfileFormset()[0]
        return context


class LoginView(BaseLoginView):
    model = User
    form_class = LoginForm
    template_name = "users/login.html"
    success_url = reverse_lazy("top")


class LogoutView(BaseLogoutView):
    model = User
    success_url = reverse_lazy("top")
