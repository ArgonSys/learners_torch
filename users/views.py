from datetime import timedelta, datetime

from django.contrib.auth.views import (
    LoginView as BaseLoginView,
    LogoutView as BaseLogoutView,
)
from django.shortcuts import render
from django.views.generic import CreateView
from django.views import View
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


class MypageView(View):
    def get(self, request):
        wdays = [
            {"name": "Sun", "from_Sun": timedelta(days=0)},
            {"name": "Mon", "from_Sun": timedelta(days=1)},
            {"name": "Tue", "from_Sun": timedelta(days=2)},
            {"name": "Wed", "from_Sun": timedelta(days=3)},
            {"name": "Thu", "from_Sun": timedelta(days=4)},
            {"name": "Fri", "from_Sun": timedelta(days=5)},
            {"name": "Sat", "from_Sun": timedelta(days=6)},
        ]

        weeks_of_a_year = 53  # 7 x 53 = 371
        latest_Sun = get_recent_Sun(datetime.now())
        weeks = [
            {"date_Sun": latest_Sun - timedelta(days=week * 7)}
            for week in range(weeks_of_a_year, -1, -1)
        ]

        context = {"wdays": wdays, "weeks": weeks}
        return render(request, "users/mypage.html", context)


def get_recent_Sun(dt):
    # dt.weekday() = 0 -> Mon
    distance = (dt.weekday() + 1) % 7
    return dt - timedelta(days=distance)
