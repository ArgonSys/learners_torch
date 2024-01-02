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
  const droppables = document.querySelectorAll(".droppable")

  // ドラッギングに伴うページスクロールを抑制
  event.preventDefault();

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousemove"? event: event.changedTouches[0];

  // 要素とクリック・タッチ位置の関係を維持しながら動かす
  dragging.style.top = event.pageY - relMouseY + "px";
  dragging.style.left = event.pageX - relMouseX + "px";

  droppables.forEach((ele) => {
    ele.addEventListener("mouseup", dropDown);
    ele.addEventListener("touchend", dropDown);
  });


  //マウスクリック・タッチがされなくなった、またはカーソルが body から外れたとき発火
  dragging.addEventListener("mouseup", mouseUp, false);
  dragging.addEventListener("touchend", mouseUp, false);
  document.body.addEventListener("mouseleave", mouseUp, false);
  document.body.addEventListener("touchleave", mouseUp, false);

}

function dropDown(event){

//  ドラッグ中の要素からdraggingクラスを取り除き、droppableの後に挿入し、元の要素を削除する
  const dragging = document.querySelector(".dragging");
  dragging.classList.remove("dragging");
  this.closest(".draggable").insertAdjacentHTML("afterend", dragging.outerHTML);
  dragging.remove();
  mouseUp(event);

}

function mouseUp(event){

  const dragging = document.querySelector(".dragging");
  const droppables = document.querySelectorAll(".droppable")

  if(dragging){
    dragging.classList.remove("dragging");
    dragging.removeEventListener("mouseup", mouseUp, false);
    dragging.removeEventListener("touchend", mouseUp, false);
  }

  document.body.removeEventListener("mousemove", mouseMove, false);
  document.body.removeEventListener("touchmove", mouseMove, false);

  document.body.removeEventListener("mouseleave", mouseUp, false);
  document.body.removeEventListener("touchleave", mouseUp, false);

  droppables.forEach((ele) => {
    ele.removeEventListener("mouseup", dropDown);
    ele.removeEventListener("touchend", dropDown);
  });
}


window.addEventListener("load", dragAndDrop);

//  DOM構造が変化したとき、再び EventListenerを埋め込む
const observer = new MutationObserver(documentMutation);
const config = { attributes: true, childList: true, subtree: true };
observer.observe(document, config);
function documentMutation(mutationsList, observer){
  dragAndDrop()
}
