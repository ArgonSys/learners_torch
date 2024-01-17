from django.shortcuts import render
from django.views import View


class MeasureTimeView(View):
    def get(self, request):
        return render(request, "time_logs/measure_time.html")

    def post(self, request):
        return render(request, "time_logs/measure_time.html")
