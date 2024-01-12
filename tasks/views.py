import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden
from django.views import View
from django.db import transaction

from .models import Task
from .forms import TaskForm

from plans.models import Plan
from stages.models import Stage


class TaskCreateView(View):
    def get(self, request, plan_pk):
        get_object_or_404(Plan, pk=plan_pk)
        form = TaskForm
        context = {"form": form, "plan_pk": plan_pk}
        return render(request, "tasks/new.html", context)

    def post(self, request, plan_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        pending_stage = plan.stage_set.get(order=-2)
        form = TaskForm(request.POST)
        if form.is_valid:
            task = form.save(commit=False)
            task.stage = pending_stage
            task.order = pending_stage.task_set.filter(order__gt=0).count() + 1
            task.save()
            return redirect("plans:show", plan_pk=plan_pk)
        context = {"form": form}
        return render(request, "tasks/new.html", context)


class TaskUpdateView(View):
    def get(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk)
        form = TaskForm(instance=task)
        context = {"form": form, "task_pk": task_pk}
        return render(request, "tasks/edit.html", context)

    def post(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk)
        form = TaskForm(request.POST, instance=task)
        if form.is_valid:
            task = form.save(commit=False)
            task.save()
            return redirect("plans:show", plan_pk=task.stage.plan.pk)
        context = {"form": form, "task_pk": task_pk}
        return render(request, "tasks/edit.html", context)


class TaskDeleteView(View):
    def post(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk)
        plan = task.stage.plan
        if request.user != plan.owner:
            return HttpResponseForbidden("このステージを削除することは禁止されています。")
        task.delete()
        return redirect("plans:show", plan_pk=plan.pk)


class TaskSwapView(View):
    @transaction.atomic
    def post(self, request):
        data = json.loads(request.body)
        destination_stage = get_object_or_404(Stage, pk=data["stage-id"])
        source = get_object_or_404(Task, pk=data["source-id"])
        destination_order = int(data["destination-order"])

        if destination_stage == source.stage:
            # 移動先が移動元より小さい order を持つとき、負の方向にスライド
            if source.order < destination_order:
                slide = -1
                tasks = source.stage.task_set.filter(
                    order__range=(source.order, destination_order)
                )

            # 移動先が移動元より大きい order を持つとき、正の方向にスライド
            elif source.order > destination_order:
                slide = 1
                tasks = source.stage.task_set.filter(
                    order__range=(destination_order, source.order)
                )
            data = dict()
            for task in tasks:
                if task == source:
                    task.order = destination_order
                else:
                    task.order += slide
                task.save()
                print(task, task.order)
                if task.stage.pk not in data:
                    data[task.stage.pk] = dict()
                data[task.stage.pk] |= {task.pk: task.order}
            print(data)

        else:
            print(f"destination_order:{destination_order}")
            # source.stage の source.order より大きい order を -1
            # destination_stage の destination_order より大きい order を +1
            source_tasks = source.stage.task_set.filter(order__gte=source.order)
            destination_tasks = destination_stage.task_set.filter(
                order__gte=destination_order
            )
            print(f"source_tasks:{source_tasks}")
            print(f"destination_tasks:{destination_tasks}")

            data = dict()
            for task in destination_tasks:
                task.order += 1
                print(f"{task.name} {task.pk} {task.stage.pk} {task.order}")
                task.save()

                if task.stage.pk not in data:
                    data[task.stage.pk] = dict()
                data[task.stage.pk] |= {task.pk: task.order}

            for task in source_tasks:
                if task == source:
                    task.stage = destination_stage
                    task.order = destination_order
                else:
                    task.order -= 1
                print(f"{task.name} {task.pk} {task.stage.pk} {task.order}")
                task.save()

                if task.stage.pk not in data:
                    data[task.stage.pk] = dict()
                data[task.stage.pk] |= {task.pk: task.order}
            print(data)

        return JsonResponse(data)
