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

from time_logs.models import ActualTime


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

        actual_times = ActualTime.objects.filter(
            time_log__stage__plan__owner=request.user
        ).order_by("date_started")

        total_time_by_date = dict()
        date = None
        sum = timedelta()
        for actual_time in actual_times:
            if date is None:
                date = actual_time.date_started.date()

            if date != actual_time.date_started.date():
                print(f"date: {date}")
                total_time_by_date[str(date)] = {
                    "total_time": sum,
                    "hexdig_alph": set_hexdig_alph(sum / timedelta(hours=3)),
                }

                date = actual_time.date_started.date()
                sum = actual_time.measured_time

            else:
                sum += actual_time.measured_time

        context = {
            "wdays": wdays,
            "weeks": weeks,
            "total_time_by_date": total_time_by_date,
        }
        return render(request, "users/mypage.html", context)


def get_recent_Sun(dt):
    # dt.weekday() = 0 -> Mon
    distance = (dt.weekday() + 1) % 7
    return dt - timedelta(days=distance)


def set_hexdig_alph(ratio):
    opacity = 0
    if 0 < ratio < 0.3:
        opacity = 0.3
    elif 0.3 <= ratio < 0.6:
        opacity = 0.6
    elif 0.6 <= ratio:
        opacity = 1.0

    return "{:x}".format(round(opacity * (16**2 - 1)))
