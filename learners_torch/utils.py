from django.utils.html import escape


def replace_newline_to_br(str):
    """エスケープ処理の後、改行コードをbrタグに変換

    Args:
        str (string): 対象の文字列

    Returns:
        string: brタグを含む文字列
    """

    str = escape(str)
    str = str.replace("\r\n", "<br>")
    str = str.replace("\n", "<br>")
    return str
