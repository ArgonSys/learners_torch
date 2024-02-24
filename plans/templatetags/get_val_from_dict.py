from django import template

register = template.Library()


@register.filter
def key(dict_, key):
    """get value of dict in template, {{ dict|key:k }}

    Args:
        dict (Any): key of value you want to get

    Returns:
        any: value in dict
    """
    try:
        val = dict_[key]
    except KeyError:
        val = None

    return val
