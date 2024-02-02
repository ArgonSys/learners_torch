def get_context(request):
    context = dict()
    context["current_task"] = request.user.current_task

    return context
