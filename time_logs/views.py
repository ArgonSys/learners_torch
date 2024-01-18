import math

from django.shortcuts import render
from django.views import View


class MeasureTimeView(View):
    def get(self, request):
        planed_time = 10000
        remain_time = 8000

        context = {"planed_time": planed_time, "remain_time": remain_time}
        return render(request, "time_logs/measure_time.html", context)

    def post(self, request):
        return render(request, "time_logs/measure_time.html")
