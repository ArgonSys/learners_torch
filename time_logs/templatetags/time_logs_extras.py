from django import template


register = template.Library()

MSEC_PER_HOUR = 3600000
MSEC_PER_MINUTE = 60000
MSEC_PER_SECOND = 1000


@register.filter
def format_msec(msec):
    """time format filter

    Args:
        msec (string): integer
    """
    hour = msec // MSEC_PER_HOUR
    msec = msec % MSEC_PER_HOUR
    minute = msec // MSEC_PER_MINUTE
    msec = msec % MSEC_PER_MINUTE
    sec = msec // MSEC_PER_SECOND

    return f"{hour:0>2}:{minute:0>2}:{sec:0>2}"
