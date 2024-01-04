function horizontal_scroll() {
  const scrollArea = document.querySelector(".horizontal-scroll");
  const PX_PER_SCROLL = 100;
  scrollArea.addEventListener("wheel", (event) => {
    // 縦スクロールの抑制
    event.preventDefault();
    if (event.deltaY > 0) {
      scrollArea.scrollLeft += PX_PER_SCROLL;
    }
    else if (event.deltaY < 0) {
      scrollArea.scrollLeft -= PX_PER_SCROLL;
    }
  });
}

window.addEventListener("load", horizontal_scroll);
