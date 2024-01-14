function slideOut() {
  const stages = document.querySelector(".stages__inner");
  const pending = document.querySelector(".pending-stage");
  if(pending.querySelector(".task")) pending.classList.add("sliding-out");

  stages.addEventListener("touchmove", slideCursorMove);
  stages.addEventListener("mousemove", slideCursorMove);
}


function slideCursorMove(event) {
  const stages = document.querySelector(".stages__inner");
  const handles = document.querySelectorAll(".slideout-handle");
  let inHandles = false;

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousemove"? event: event.changedTouches[0];

  handles.forEach((ele) => {
    const rect = ele.getBoundingClientRect();
    if(isCursorInRect(event.clientX, event.clientY, rect)) {
      inHandles = true;
      ele.closest(".slideout").classList.add("sliding-out");
    }
  });

  if(!inHandles) removeSlidingOutClasses();

  stages.addEventListener("mouseleave", removeSlidingOutClasses);
  stages.addEventListener("touchleave", removeSlidingOutClasses);
}

function removeSlidingOutClasses() {
  const slidingOuts = document.querySelectorAll(".sliding-out");
  slidingOuts.forEach((ele) => {
    ele.closest(".slideout").classList.remove("sliding-out");
  });
}


window.addEventListener("load", slideOut);
