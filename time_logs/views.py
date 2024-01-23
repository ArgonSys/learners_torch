import datetime
import json

from django.shortcuts import render
from django.http import HttpResponseNotFound, JsonResponse
from django.views import View

from tasks.models import Task
from .models import TimeLog, ActualTime


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

        context = {
            "task": task,
            "stage": stage,
            "planed_time": planed_time,
            "remain_time": remain_time,
        }
        return render(request, "time_logs/measure_time.html", context)

    def post(self, request, task_pk):
        task = Task.objects.get(pk=task_pk)
        stage = task.stage

        data = json.loads(request.body)
        time_log = TimeLog.objects.filter(task=task, stage=stage).first()
        if not time_log:
            return HttpResponseNotFound("time_log not found")

        # javascriptの基準(1970/1/1 00:00:00)を加える
        date_js_std = datetime.datetime(1970, 1, 1, tzinfo=datetime.UTC)
        date_started = date_js_std + datetime.timedelta(
            seconds=data["started_time"] / 1000
        )
        time = datetime.timedelta(milliseconds=data["actual_time"])
        actual_time = ActualTime(
            time_log=time_log,
            date_started=date_started,
            actual_time=time,
        )
        actual_time.save()
        planed_time = int(time_log.planed_time.total_seconds() * 1000)

        passed_time = datetime.timedelta()
        for actual_time in time_log.actualtime_set.all():
            passed_time += actual_time.actual_time

        remain_time = planed_time - int(passed_time.total_seconds() * 1000)

        response = {"planedTime": planed_time, "remainTime": remain_time}
        return JsonResponse(response)


class DeleteTimeView(View):
    def post(self, request, task_pk, time_log_pk):
        return render(request, "time_logs/measure_time.html")
