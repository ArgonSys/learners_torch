function horizontal_scroll() {
  const scrollArea = document.querySelector(".horizontal-scroll");
  const PX_PER_SCROLL = 100;
  scrollArea.addEventListener("wheel", (event) => {
    const fixedElements = scrollArea.querySelectorAll(".horizontal-fixed");
    // 縦スクロールの抑制
    event.preventDefault();
    scrollArea.scrollLeft += Math.sign(event.deltaY) * PX_PER_SCROLL;

    if(fixedElements) {
      fixedElements.forEach((ele) => {
        ele.setAttribute("style", `left: calc(50% + ${scrollArea.scrollLeft}px)`);
      });
    }
  });
}

window.addEventListener("load", horizontal_scroll);
