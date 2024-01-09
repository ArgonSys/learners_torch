// isCursorInRect, getCookie from "./utils";


let relMouseX;
let relMouseY;
let scrollLeftAtMouseDown;


function dragAndDrop(){

  const dragHandles = document.querySelectorAll(".drag-handle");

  dragHandles.forEach((dragHandle) => {
    dragHandle.addEventListener("mousedown", mouseDown);
    dragHandle.addEventListener("touchstart", mouseDown);
  });
}


function mouseDown(event){
  //  draggingオブジェクトのクローニング
  const draggingFrom = this.closest(".draggable");
  const dragging = draggingFrom.cloneNode(true);
  const scrollArea = document.querySelector(".stages__scroll-area");

  //  draggingFromオブジェクトを透過処理
  draggingFrom.classList.add("dragging-from");

  // //  初期位置からtop, left設定し挿入
  dragging.style.top = draggingFrom.offsetTop + "px";
  dragging.style.left = draggingFrom.offsetLeft - parseInt(scrollArea.scrollLeft) + "px";
  dragging.classList.add("dragging");
  draggingFrom.after(dragging);

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousedown"? event: event.changedTouches[0];

  // スクロール量の更新
  scrollLeftAtMouseDown = parseInt(scrollArea.scrollLeft)

  //  マウスとの位置関係を保持
  relMouseX = event.pageX + scrollArea.scrollLeft - dragging.offsetLeft;
  relMouseY = event.pageY - dragging.offsetTop;

  document.body.addEventListener("mouseup", mouseUp);
  document.body.addEventListener("touchend", mouseUp);

  document.body.addEventListener("mousemove", mouseMove);
  document.body.addEventListener("touchmove", mouseMove, {passive: false});
}


function mouseMove(event){

  const dragging = document.querySelector(".dragging");
  const droppables = document.querySelectorAll(".droppable");

  if (!dragging) return null;

  // ドラッギングに伴うページスクロールを抑制
  event.preventDefault();
  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousemove"? event: event.changedTouches[0];

  // 要素とクリック・タッチ位置の関係を維持しながら動かす
  dragging.style.top = event.pageY - relMouseY + "px";
  dragging.style.left = event.pageX - relMouseX + scrollLeftAtMouseDown + "px";


  droppables.forEach((droppable) => {
    if (dragging.getAttribute("drag-group") != droppable.getAttribute("drop-group")) return null;
    //  droppable要素の中にタッチドラッギングしてドロップしたら発火
    rect = droppable.getBoundingClientRect();
    if(isCursorInRect(event.clientX, event.clientY, rect)) {
      droppable.classList.add("dragging-over");
      document.addEventListener("touchend", dropDown);
      droppable.addEventListener("mouseup", dropDown);
    } else {
      droppable.classList.remove("dragging-over");
      document.body.removeEventListener("touchend", dropDown);
      droppable.removeEventListener("mouseup", dropDown);
    }
  });


  //  カーソルが body から外れたとき発火
  document.body.addEventListener("mouseleave", mouseUp);
  document.body.addEventListener("touchleave", mouseUp);
}


function dropDown(event){
  ////  ドラッグした要素の入れ替えとViewへのデータ送信
  //  ドラッグ元の要素を消し、ドラッグ中の要素からdraggingクラスを取り除く
  const draggingFrom = document.querySelector(".dragging-from");
  const dragging = document.querySelector(".dragging");
  const draggingOver = document.querySelector(".dragging-over");
  const draggingGroup = dragging.getAttribute("drag-group");

  draggingFrom.remove();
  dragging.classList.remove("dragging");

  if(!draggingOver) {
    mouseUp();
    return null;
  }

  const XHR = new XMLHttpRequest();
  const csrftoken = getCookie("csrftoken");
  let destinationOrder = Number(draggingOver.getAttribute("order"));


  // order が小さい要素に対する swap 時の補正
  if (destinationOrder < dragging.getAttribute("order")) destinationOrder += 1;
  // 補正後の2つの order が等しいなら return
  if (destinationOrder == dragging.getAttribute("order")) return mouseUp();

  //  const stageSwapURL = "{% url 'stages:swap' %}"  (stages/show.html)
  //  const taskSwapURL = "{% url 'tasks:swap' %}"  (stages/show.html)
  let swapURL;
  let data;

  if (draggingGroup == "stage") {
    data = JSON.stringify({
      "source-id": dragging.getAttribute("stage-id"),
      "destination-order": destinationOrder,
    });
    swapURL = stageSwapURL;

  } else if (draggingGroup == "task") {
    data = JSON.stringify({
      "stage-id": draggingOver.getAttribute("stage-id"),
      "source-id": dragging.getAttribute("task-id"),
      "destination-order": destinationOrder,
    });
    swapURL = taskSwapURL;

  } else {
    console.log("dragging");
    return null;
  }

  XHR.open("post", swapURL, true);
  XHR.responseType = "json";
  XHR.setRequestHeader("X-CSRFToken", csrftoken);
  XHR.setRequestHeader("content-type", "application/json");
  XHR.send(data);

  // top, left削除
  dragging.removeAttribute("style");
  dragging.classList.remove("dragging");

  draggingOver.closest(`.${draggingGroup}-wrapper`).insertAdjacentHTML("afterend", dragging.outerHTML);
  dragging.remove();

  XHR.onload = () => {
    if (XHR.status != 200) {
      alert(`Error ${ XHR.status }: ${ XHR.statusText }`);
      return null;
    }

    const swappedOrders = XHR.response
    if (draggingGroup == "stage") {
      applySwappedStageOrders(swappedOrders);
    }
    else if (draggingGroup == "task") {
      applySwappedTaskOrders(swappedOrders);
    }


  }
  //  eventlistenerの削除
  mouseUp();
}


function mouseUp(event){

  const droppables = document.querySelectorAll(".droppable");
  const draggingFromAll = document.querySelectorAll(".dragging-from");
  const draggingAll = document.querySelectorAll(".dragging");
  const draggingOverAll = document.querySelectorAll(".dragging-over");

  if(draggingFromAll){
    draggingFromAll.forEach( (draggingFrom) => {
      draggingFrom.remove();
    });
  }

  if(draggingAll){
    draggingAll.forEach( (dragging) => {
      dragging.removeAttribute("style");
      dragging.classList.remove("dragging");
    });
  }

  if(draggingOverAll){
    draggingOverAll.forEach( (draggingOver) => {
      draggingOver.classList.remove("dragging-over");
    });
  }

  document.body.removeEventListener("mousemove", mouseMove);
  document.body.removeEventListener("touchmove", mouseMove);

  document.body.removeEventListener("mouseup", mouseUp);
  document.body.removeEventListener("touchend", mouseUp);
  document.body.removeEventListener("mouseleave", mouseUp);
  document.body.removeEventListener("touchleave", mouseUp);

  document.body.removeEventListener("touchend", dropDown);
  droppables.forEach((droppable) => {
    droppable.removeEventListener("mouseup", dropDown);
  });
}


function setTouchendEventListener(ele, cursorX, cursorY, rect){
  if ( isCursorInRect(cursorX, cursorY, rect) ){
    ele.classList.add("dragging-over");
    document.body.removeEventListener("touchend", mouseUp);
    document.body.addEventListener("touchend", dropDown);
  } else {
    ele.classList.remove("dragging-over");
    document.body.addEventListener("touchend", mouseUp);
    document.body.removeEventListener("touchend", dropDown);
  }
}

function applySwappedStageOrders(swappedOrders) {
  const draggables = document.getElementsByClassName("stage-wrapper draggable");
  const droppables = document.getElementsByClassName("stage-drop droppable");

  // order 属性の修正
  for (var pk in swappedOrders) {
    // draggableクラス
    for (var index=0; index < draggables.length; index++) {
      const draggable = draggables[index];
      if (draggable.getAttribute("stage-id") == pk) {
        draggable.removeAttribute("order");
        draggable.setAttribute("order", swappedOrders[pk]);
        break;
      }
    }

    // droppableクラス
    for (var index=0; index < droppables.length; index++) {
      const droppable = droppables[index];
      if (droppable.getAttribute("stage-id") == pk) {
        droppable.removeAttribute("order");
        droppable.setAttribute("order", swappedOrders[pk]);
        break;
      }
    }
  }
}


function applySwappedTaskOrders(swappedOrders) {
  const draggables = document.getElementsByClassName("task-wrapper draggable");
  const droppables = document.getElementsByClassName("task-drop droppable");

  console.log(swappedOrders);
  // order 属性の修正
  for (var stagePk in swappedOrders) {
    for (var taskPk in swappedOrders[stagePk]) {
      // draggableクラス
      for (var index=0; index < draggables.length; index++) {
        const draggable = draggables[index];
        if (draggable.getAttribute("stage-id") == stagePk &&
              draggable.getAttribute("task-id") == taskPk) {
          draggable.removeAttribute("order");
          draggable.setAttribute("order", swappedOrders[stagePk][taskPk]);
          break;
        }
      }

      // droppableクラス
      for (var index=0; index < droppables.length; index++) {
        const droppable = droppables[index];
        if (droppable.getAttribute("stage-id") == stagePk &&
              droppable.getAttribute("task-id") == taskPk) {
          droppable.removeAttribute("order");
          droppable.setAttribute("order", swappedOrders[stagePk][taskPk]);
          break;
        }
      }
    }
  }
}


window.addEventListener("load", dragAndDrop);

//  DOM構造が変化したとき、再び EventListenerを埋め込む
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(documentMutation);
  const config = { attributes: true, childList: true, subtree: true };
  observer.observe(document, config);
  function documentMutation(mutationsList, observer){
    dragAndDrop();
  }
});
