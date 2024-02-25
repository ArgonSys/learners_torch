from django import template


register = template.Library()

MSEC_PER_HOUR = 3600000
MSEC_PER_MINUTE = 60000
MSEC_PER_SECOND = 1000


@register.filter
def format_msec(msec):
    """time format filter
    default(msec="") "00:00:00"

    Args:
        msec (string): can be cast to integer
    """
    msec = abs(int(msec if msec != "" else 0))
    hour = msec // MSEC_PER_HOUR
    msec = msec % MSEC_PER_HOUR
    minute = msec // MSEC_PER_MINUTE
    msec = msec % MSEC_PER_MINUTE
    sec = msec // MSEC_PER_SECOND

    return f"{hour:0>2}:{minute:0>2}:{sec:0>2}"


@register.filter
def format_duration(duration, format):
    total_msec = int(duration.total_seconds() * 1000)
    return format_msec(total_msec)


@register.filter
def ratio_in(duration, divider):
    ratio = 0
    if divider != 0:
        ratio = duration / divider * 100
    return ratio
