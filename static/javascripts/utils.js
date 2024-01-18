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

function formatMsec(msec) {
  const MSEC_PER_HOUR = 3600000;
  const MSEC_PER_MINUTE = 60000;
  const MSEC_PER_SECOND = 1000;
  const MIN_LENGTH = 2;

  let hour = Math.floor( msec / MSEC_PER_HOUR );
  msec = msec % MSEC_PER_HOUR;
  let min = Math.floor( msec / MSEC_PER_MINUTE );
  msec = msec % MSEC_PER_MINUTE;
  let sec = Math.round( msec / MSEC_PER_SECOND );

  if(sec === MSEC_PER_MINUTE / MSEC_PER_SECOND){
    sec = 0;
    min += 1;
  }

  if(min === MSEC_PER_HOUR / MSEC_PER_MINUTE){
     min = 0;
     hour += 1;
  }

  hour = hour.toString();
  min = min.toString();
  sec = sec.toString();

  hour = `${(hour.length < MIN_LENGTH)? "0".repeat(MIN_LENGTH - hour.length): ""}${hour}`;
  min = `${(min.length < MIN_LENGTH)? "0".repeat(MIN_LENGTH - min.length): ""}${min}`;
  sec = `${(sec.length < MIN_LENGTH)? "0".repeat(MIN_LENGTH - sec.length): ""}${sec}`;

  return `${hour}:${min}:${sec}`;
}
