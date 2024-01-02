let relMouseX;
let relMouseY;


function dragAndDrop(){

  const dragHandles = document.querySelectorAll(".drag-handle")

  dragHandles.forEach((ele) => {

    ele.addEventListener("mousedown", mouseDown, false);
    ele.addEventListener("touchstart", mouseDown, false);

  });
}


function mouseDown(event){

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousedown"? event: event.changedTouches[0];

  //  マウスとの位置関係を保持
  relMouseX = event.pageX - this.offsetLeft;
  relMouseY = event.pageY - this.offsetTop;

  this.closest(".draggable").classList.add("dragging");

  document.body.addEventListener("mousemove", mouseMove, false);
  document.body.addEventListener("touchmove", mouseMove, {passive: false});

}


function mouseMove(event){

  const dragging = document.querySelector(".dragging");

  // ドラッギングに伴うページスクロールを抑制
  event.preventDefault();

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousemove"? event: event.changedTouches[0];

  // 要素とクリック・タッチ位置の関係を維持しながら動かす
  dragging.style.top = event.pageY - relMouseY + "px";
  dragging.style.left = event.pageX - relMouseX + "px";

  //マウスクリック・タッチがされなくなった、またはカーソルが body から外れたとき発火
  dragging.addEventListener("mouseup", mouseUp, false);
  dragging.addEventListener("touchend", mouseUp, false);
  document.body.addEventListener("mouseleave", mouseUp, false);
  document.body.addEventListener("touchleave", mouseUp, false);

}

function mouseUp(event){

  const dragging = document.querySelector(".dragging");

  document.body.removeEventListener("mousemove", mouseMove, false);
  document.body.removeEventListener("touchmove", mouseMove, false);

  dragging.removeEventListener("mouseup", mouseUp, false);
  dragging.removeEventListener("touchend", mouseUp, false);
  document.body.removeEventListener("mouseleave", mouseUp, false);
  document.body.removeEventListener("touchleave", mouseUp, false);

  dragging.classList.remove("dragging");

}


window.addEventListener("load", dragAndDrop);
