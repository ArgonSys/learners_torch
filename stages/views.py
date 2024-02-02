import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden
from django.views import View
from django.db import transaction

from .models import Stage
from .forms import StageForm

from plans.models import Plan


class StageCreateView(View):
    def get(self, request, plan_pk):
        get_object_or_404(Plan, pk=plan_pk)
        form = StageForm
        current_task = request.user.current_task
        context = {"form": form, "plan_pk": plan_pk, "current_task": current_task}
        return render(request, "stages/new.html", context)

    def post(self, request, plan_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        form = StageForm(request.POST)
        if form.is_valid:
            stage = form.save(commit=False)
            stage.plan = plan
            stage.order = plan.stage_set.filter(order__gt=0).count() + 1
            stage.save()
            return redirect("plans:show", plan_pk=plan_pk)
        current_task = request.user.current_task
        context = {"form": form, "current_task": current_task}
        return render(request, "stages/new.html", context)


class StageUpdateView(View):
    def get(self, request, plan_pk, stage_pk):
        stage = get_object_or_404(Stage, pk=stage_pk)
        form = StageForm(instance=stage)
        current_task = request.user.current_task
        context = {"form": form, "plan_pk": plan_pk, "stage_pk": stage_pk, "current_task": current_task}
        return render(request, "stages/edit.html", context)

    def post(self, request, plan_pk, stage_pk):
        stage = get_object_or_404(Stage, pk=stage_pk)
        form = StageForm(request.POST, instance=stage)
        if form.is_valid:
            stage = form.save(commit=False)
            stage.plan = get_object_or_404(Plan, pk=plan_pk)
            stage.save()
            return redirect("plans:show", plan_pk=plan_pk)
        context = {"form": form, "current_task": current_task}
        return render(request, "stages/new.html", context)


class StageDeleteView(View):
    @transaction.atomic
    def post(self, request, plan_pk, stage_pk):
        plan = get_object_or_404(Plan, pk=plan_pk)
        stage = get_object_or_404(Stage, pk=stage_pk)

        # plan非所有者による削除とpending, doneステージの削除を禁止
        if request.user != plan.owner or stage.order < 0:
            return HttpResponseForbidden("このステージを削除することは禁止されています。")

        # pendingステージへtaskを移動
        tasks = stage.task_set.all()
        for task in tasks:
            pending = plan.stage_set.get(order=-2)
            task.stage = pending
            print(task.name, task.stage)
            task.order = pending.task_set.count() + 1
            task.save()

        # stage orderの修正
        stages = plan.stage_set.filter(order__gt=stage.order)
        for st in stages:
            st.order -= 1
            st.save()

        stage.delete()
        return redirect("plans:show", plan_pk=plan_pk)


class StageSwapView(View):
    @transaction.atomic
    def post(self, request):
        data = json.loads(request.body)
        source = get_object_or_404(Stage, pk=data["source-id"])
        plan = source.plan
        destination_order = int(data["destination-order"])

        # 移動先が移動元より小さい order を持つとき、負の方向にスライド
        if source.order < destination_order:
            slide = -1
            stages = plan.stage_set.filter(
                order__range=(source.order, destination_order)
            )

        # 移動先が移動元より大きい order を持つとき、正の方向にスライド
        elif source.order > destination_order:
            slide = 1
            stages = plan.stage_set.filter(
                order__range=(destination_order, source.order)
            )

        data = dict()
        for stage in stages:
            # 移動元に移動先の order を代入する
            if stage == source:
                stage.order = destination_order
            # その他の stage の order をスライドさせる
            else:
                stage.order += slide
            stage.save()
            data[stage.pk] = stage.order

        return JsonResponse(data)
