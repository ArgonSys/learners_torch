from django.shortcuts import render

from django.views import View


class StageCreateView(View):
    def get(self, request):
        form = "form"
        context = {"form": form}
        return render(request, "stages/new.html", context)


class StageUpdateView(View):
    def get(self, request, stage_pk):
        form = "form"
        context = {"form": form, "stage_pk": stage_pk}
        return render(request, "stages/edit.html", context)
