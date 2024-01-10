function horizontal_scroll() {
  const scrollArea = document.querySelector(".horizontal-scroll");
  const PX_PER_SCROLL = 100;
  scrollArea.parentNode.addEventListener("wheel", (event) => {
    // 縦スクロールの抑制
    event.preventDefault();
    scrollArea.scrollLeft += Math.sign(event.deltaY) * PX_PER_SCROLL;
  });

  scrollArea.addEventListener("scroll", (event) => {
    const fixedElements = scrollArea.querySelectorAll(".horizontal-fixed");
    if(fixedElements) {
      fixedElements.forEach((ele) => {
        ele.setAttribute("style", `left: calc(50% + ${scrollArea.scrollLeft}px)`);
      });
    }
  });
}

window.addEventListener("load", horizontal_scroll);
