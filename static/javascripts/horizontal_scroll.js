let horizontalScrolling = null;

const horizontalScrollByWheel = (event) => {
  const PX_PER_SCROLL = 100;

  // デフォルトスクロールの抑制
  event.preventDefault();
  horizontalScrolling.scrollLeft += Math.sign(event.deltaY) * PX_PER_SCROLL;
}

const fixFromHorizontalScroll = (event) => {
  const fixedElements = horizontalScrolling.querySelectorAll(".horizontal-fixed");
  if(fixedElements) {
    fixedElements.forEach((ele) => {
        if(horizontalScrolling.contains(ele)) ele.setAttribute("style", `left: calc(50% + ${this.scrollLeft}px)`);
    })
  }
}


function horizontal_scroll() {
  const dragAnchor = document.querySelector(".drag-anchor");
  const scrollArea = document.querySelector(".scroll-area");
  const horizontalScrollAreas = document.querySelectorAll(".horizontal-scroll");
  const fixedElements = document.querySelectorAll(".horizontal-fixed");

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

    horizontalScrollAreas.forEach((horizontalScrollArea) => {
      if(!isCursorInRect(event.clientX, event.clientY, horizontalScrollArea.getBoundingClientRect())) return;
      horizontalScrolling = horizontalScrollArea;
      if(!inFixed){
        dragAnchor.parentNode.addEventListener("wheel", horizontalScrollByWheel);
        horizontalScrolling.addEventListener("scroll", fixFromHorizontalScroll);
      } else {
        dragAnchor.parentNode.removeEventListener("wheel", horizontalScrollByWheel);
        horizontalScrolling.removeEventListener("scroll", fixFromHorizontalScroll);
      }

    });
  });
}

window.addEventListener("load", horizontal_scroll);
