from django.shortcuts import render

from django.views import View


class PlansIndexView(View):
    def get(self, request):
        return render(request, "plans/index.html")
