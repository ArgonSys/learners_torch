from django import template
register = template.Library()


@register.simple_tag
def define(val=None):
    """define variable in template, {% define val as var %}

    Args:
        val (any): Any value you want assign. Defaults to None.

    Returns:
        any: Assigned value
    """
    return val
