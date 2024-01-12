let verticalScrolling = null;

const verticalScrollByWheel = (event) => {
  const PX_PER_SCROLL = 100;

  // デフォルトスクロールの抑制
  event.preventDefault();
  verticalScrolling.scrollTop += Math.sign(event.deltaY) * PX_PER_SCROLL;
}

const fixFromVerticalScroll = (event) => {
  const fixedElements = verticalScrolling.querySelectorAll(".vertical-fixed");
  if(fixedElements) {
    fixedElements.forEach((ele) => {
        if(verticalScrolling.contains(ele)) ele.setAttribute("style", `top: calc(50% + ${this.scrollTop}px)`);
    })
  }
}


function vertical_scroll() {
  const dragAnchor = document.querySelector(".drag-anchor");
  const scrollArea = document.querySelector(".scroll-area");
  const verticalScrollAreas = document.querySelectorAll(".vertical-scroll");
  const fixedElements = document.querySelectorAll(".vertical-fixed");

  scrollArea.parentNode.addEventListener("mousemove", (event) => {

    // fixed 内はスクロールできないようにする
    let inFixed = false;
    fixedElements.forEach((fixedEle) => {
      const rect = fixedEle.getBoundingClientRect();
      if(isCursorInRect(event.clientX, event.clientY, rect)) {
        inFixed = true;
        return;
      }
    });

    verticalScrollAreas.forEach((verticalScrollArea) => {
      if(!isCursorInRect(event.clientX, event.clientY, verticalScrollArea.getBoundingClientRect())) return;
      verticalScrolling = verticalScrollArea;
      if(!inFixed){
        dragAnchor.parentNode.addEventListener("wheel", verticalScrollByWheel);
        verticalScrolling.addEventListener("scroll", fixFromVerticalScroll);
      } else {
        dragAnchor.parentNode.removeEventListener("wheel", verticalScrollByWheel);
        verticalScrolling.removeEventListener("scroll", fixFromVerticalScroll);
      }

    });
  });
}

window.addEventListener("load", vertical_scroll);
