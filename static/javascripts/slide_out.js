function slideOut() {
  const stages = document.querySelector(".stages__inner");

  stages.addEventListener("touchmove", slideCursorMove);
  stages.addEventListener("mousemove", slideCursorMove);
}


function slideCursorMove(event) {
  const stages = document.querySelector(".stages__inner");
  const slideOutHandles = document.querySelectorAll(".slideout-handle");

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousemove"? event: event.changedTouches[0];

  slideOutHandles.forEach((ele) => {
    const handleRect = ele.getBoundingClientRect();
    const wrapperRect = ele.closest(".slideout-wrapper").getBoundingClientRect();
    if (isCursorInRect(event.clientX, event.clientY, handleRect) ||
          isCursorInRect(event.clientX, event.clientY, wrapperRect)) {
      setSlidingOutClass(ele);
    } else {
      removeSlidingOutClass(ele);
    }
  });

  stages.addEventListener("mouseleave",(event) => {
    slideOutHandles.forEach((ele) => {
      removeSlidingOutClass(ele);
    });
  });
  stages.addEventListener("touchleave",(event) => {
    slideOutHandles.forEach((ele) => {
      removeSlidingOutClass(ele);
    });
  });
}


// 自身もしくは先祖要素のslideout-wrapperクラスにsliding-outを付与
function setSlidingOutClass(ele) {
  if (ele.classList.contains(".slideout-wrapper")){
    ele.classList.add("sliding-out");
  }
  if (ele.closest(".slideout-wrapper")) {
    ele.closest(".slideout-wrapper").classList.add("sliding-out");
  }
}


// 自身もしくは先祖要素のslideout-wrapperクラスからsliding-outを削除
function removeSlidingOutClass(ele) {
  if (ele.classList.contains(".slideout-wrapper")){
    ele.classList.remove("sliding-out");
  }
  if (ele.closest(".slideout-wrapper")) {
      ele.closest(".slideout-wrapper").classList.remove("sliding-out");
  }
}


window.addEventListener("load", slideOut);
