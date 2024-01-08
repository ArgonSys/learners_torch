function slideOut() {
  const stages = document.querySelector(".stages__inner");

  stages.addEventListener("touchmove", slideCursor);
  stages.addEventListener("mousemove", slideCursor);
}


function slideCursor(event) {
  const pendingStage = document.querySelector(".pending-stage");
  const doneStage = document.querySelector(".done-stage");
  const pendingStageRect = pendingStage.getBoundingClientRect();
  const doneStageRect = doneStage.getBoundingClientRect();

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousemove"? event: event.changedTouches[0];

  if (isCursorInRect(event.clientX, event.clientY, pendingStageRect)) {
    pendingStage.classList.add("slideout");
  } else {
    pendingStage.classList.remove("slideout");
  }

  if (isCursorInRect(event.clientX, event.clientY, doneStageRect)) {
    doneStage.classList.add("slideout");
  } else {
    doneStage.classList.remove("slideout");
  }
}


window.addEventListener("load", slideOut);
