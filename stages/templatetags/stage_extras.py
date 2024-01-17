from django import template
from django.template.defaultfilters import stringfilter


register = template.Library()


@register.filter
@stringfilter
def split(str, sep):
    """sprit filter

    Args:
        str (string): string
        sep (string): separator
    """

    return str.split(sep)
