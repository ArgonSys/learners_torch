def get_context(request):
    context = dict()
    if request.user.is_authenticated:
        context["current_task"] = request.user.current_task

    return context
