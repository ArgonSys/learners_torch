import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views import View


class MeasureTimeView(View):
    def get(self, request):
        context = {"planedTime": 100000, "remainTime": 100000}
        return render(request, "time_logs/measure_time.html", context)

    def post(self, request):
        return render(request, "time_logs/measure_time.html")
