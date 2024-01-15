function getCookie(name) {
  if (!document.cookie || document.cookie === "") return null;
  cookies = document.cookie.split(";");
  for(var i=0; i < cookies.length; i++) {
    cookie = cookies[i].trim();
    if (cookie.substring(0, name.length + 1) === (name + "=")) {
      const cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
      return cookieValue;
    }
  }
}


function isCursorInRect(cursorX, cursorY, rect) {
  return cursorX >= rect.left && cursorX <= rect.right && cursorY >= rect.top && cursorY <= rect.bottom
}


function setElementXYFromBase(ele, baseEle) {
  if(!baseEle.contains(ele)) return console.log("baseEle doesn't contain childEle");

  let x = parseInt(ele.getBoundingClientRect().left) - parseInt(baseEle.getBoundingClientRect().left);
  let y = parseInt(ele.getBoundingClientRect().top) - parseInt(baseEle.getBoundingClientRect().top);
  return [x, y];
}
