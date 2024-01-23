import datetime

from django.shortcuts import render
from django.views import View

from tasks.models import Task
from .models import TimeLog


class MeasureTimeView(View):
    def get(self, request, task_pk):
        task = Task.objects.get(pk=task_pk)
        stage = task.stage

        planed_time = 0
        remain_time = 0

        time_log = TimeLog.objects.filter(task=task, stage=stage).first()
        if time_log:
            planed_time = int(time_log.planed_time.total_seconds() * 1000)

            passed_time = datetime.timedelta()
            for actual_time in time_log.actualtime_set.all():
                passed_time += actual_time.actual_time

            remain_time = planed_time - int(passed_time.total_seconds() * 1000)

        context = {"planed_time": planed_time, "remain_time": remain_time}
        return render(request, "time_logs/measure_time.html", context)

    def post(self, request):
        return render(request, "time_logs/measure_time.html")


class DeleteTimeView(View):
    def post(self, request, task_pk, time_log_pk):
        return render(request, "time_logs/measure_time.html")
