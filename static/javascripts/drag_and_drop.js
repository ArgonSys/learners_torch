// setElementXYFromBase, isCursorInRect, getCookie from "./utils";


let draggingX;
let draggingY;
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
  const draggingFrom = this.closest(".draggable");
  const dragging = draggingFrom.cloneNode(true);
  const dragAnchor = document.querySelector(".drag-anchor");
  const scrollArea = dragAnchor.parentNode.querySelector(".scroll-area");

  [draggingX, draggingY] = setElementXYFromBase(this.parentNode, dragAnchor.parentNode);

  //  draggingオブジェクトのクローニング
  draggingFrom.classList.add("dragging-from");
  dragging.style.top = draggingY + "px";
  dragging.style.left = draggingX + "px";
  dragging.classList.add("dragging");
  dragAnchor.after(dragging);

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousedown"? event: event.changedTouches[0];

  scrollLeftAtMouseDown = parseInt(scrollArea.scrollLeft);

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
  const overlaps = document.querySelectorAll(".overlap");


  if (!dragging) return null;

  // ドラッギングに伴うページスクロールを抑制
  event.preventDefault();
  event = event.type == "mousemove"? event: event.changedTouches[0];

  // 要素とクリック・タッチ位置の関係を維持しながら動かす
  dragging.style.top = event.pageY - relMouseY + "px";
  dragging.style.left = event.pageX - relMouseX + scrollLeftAtMouseDown + "px";

  //  droppable 要素上にカーソルがあるときに dropDown イベントハンドラへのイベントリスナを追加
  let inDroppable = false;
  droppables.forEach((droppable) => {
    if (dragging.getAttribute("drag-group") != droppable.getAttribute("drop-group")) return null;
    rect = droppable.getBoundingClientRect();

    // overlapがない、カーソルが overlap に乗っていない、droppable が overlap に含まれる場合に dragging-over を付与
    let isContainedOverlap = false;
    let isCursorInOverlap = false;

    overlaps.forEach((overlap) => {
      const overlapRect = overlap.getBoundingClientRect();

      if(isCursorInRect(event.clientX, event.clientY, overlapRect)) isCursorInOverlap = true;
      if(overlap.contains(droppable)) isContainedOverlap = true;
    });

    if((!overlaps || !isCursorInOverlap || isContainedOverlap)
        && isCursorInRect(event.clientX, event.clientY, rect)) {
      inDroppable = true;
      droppable.classList.add("dragging-over");
      return;
    }
  });

  // inDroppable によるイベントリスナの切替
  if (inDroppable) {
    document.body.removeEventListener("mouseup", mouseUp);
    document.body.removeEventListener("touchend", mouseUp);
    document.body.addEventListener("mouseup", dropDown);
    document.body.addEventListener("touchend", dropDown);
  } else {
    const draggingOver = document.querySelector(".dragging-over");
    if(draggingOver) draggingOver.classList.remove("dragging-over");
    document.body.addEventListener("mouseup", mouseUp);
    document.body.addEventListener("touchend", mouseUp);
    document.body.removeEventListener("mouseup", dropDown);
    document.body.removeEventListener("touchend", dropDown);
  }

  //  カーソルが body から外れたとき発火
  document.body.addEventListener("mouseleave", mouseUp);
  document.body.addEventListener("touchleave", mouseUp);
}



function dropDown(event){
  ////  ドラッグした要素の入れ替えとViewへのデータ送信
  //  ドラッグ元の要素を消し、ドラッグ中の要素からdraggingクラスを取り除く
  const dragging = document.querySelector(".dragging");
  const draggingOver = document.querySelector(".dragging-over");
  const draggingGroup = dragging.getAttribute("drag-group");
  const stagesLoader = document.querySelector(".stages-loader");

  if(!draggingOver) return mouseUp();

  if(draggingGroup == "stage") sendXHRAboutStageSwap();
  else if(draggingGroup == "task") sendXHRAboutTaskSwap();
  else console.log("ERROR: Invalid draggingGroup");

  //  eventlistenerの削除
  mouseUp();
}


function mouseUp(event){
  // クラスやイベントリスナなどのリセット
  const draggingFromAll = document.querySelectorAll(".dragging-from");
  const draggingAll = document.querySelectorAll(".dragging");
  const draggingOverAll = document.querySelectorAll(".dragging-over");

  if(draggingFromAll){
    draggingFromAll.forEach( (draggingFrom) => {
      draggingFrom.classList.remove("dragging-from");
    });
  }

  if(draggingAll){
    draggingAll.forEach( (dragging) => {
      dragging.remove();
    });
  }

  if(draggingOverAll){
    draggingOverAll.forEach( (draggingOver) => {
      draggingOver.classList.remove("dragging-over");
    });
  }

  document.body.removeEventListener("mouseup", mouseUp);
  document.body.removeEventListener("touchend", mouseUp);
  document.body.removeEventListener("mouseleave", mouseUp);
  document.body.removeEventListener("touchleave", mouseUp);
  document.body.removeEventListener("mouseup", dropDown);
  document.body.removeEventListener("touchend", dropDown);
}


function sendXHRAboutStageSwap() {
  const draggingFrom = document.querySelector(".dragging-from");
  const dragging = document.querySelector(".dragging");
  const draggingOver = document.querySelector(".dragging-over");
  const draggingGroup = dragging.getAttribute("drag-group");
  const stagesLoader = document.querySelector(".stages-loader");

  const XHR = new XMLHttpRequest();
  const csrftoken = getCookie("csrftoken");

  let destinationOrder = Number(draggingOver.getAttribute("order"));

  // order が小さい要素に対する swap 時の補正
  if (destinationOrder < dragging.getAttribute("order")) destinationOrder += 1;
  if (destinationOrder == dragging.getAttribute("order")) return mouseUp();

  // ロード画面の表示
  stagesLoader.classList.remove("hidden");

  const data = JSON.stringify({
    "source-id": dragging.getAttribute("stage-id"),
    "destination-order": destinationOrder,
  });

  //  const stageSwapURL = "{% url 'stages:swap' %}"  (stages/show.html)
  XHR.open("post", stageSwapURL, true);
  XHR.responseType = "json";
  XHR.setRequestHeader("X-CSRFToken", csrftoken);
  XHR.setRequestHeader("content-type", "application/json");
  XHR.send(data);
  XHR.onload = () => {
    if (XHR.status != 200) {
      alert(`Error ${ XHR.status }: ${ XHR.statusText }`);
      return null;
    }

    // order に変更のある stage の更新
    const swappedOrders = XHR.response
    applySwappedStageOrders(swappedOrders);

    // draggingの削除、draggingFromの挿入
    dragging.remove();
    draggingFrom.classList.remove("dragging-from");
    draggingOver.closest(`.${draggingGroup}-wrapper`).insertAdjacentHTML("afterend", draggingFrom.outerHTML);
    draggingFrom.remove();

    // ロード画面の非表示
    stagesLoader.classList.add("hidden");
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


function sendXHRAboutTaskSwap() {
  const draggingFrom = document.querySelector(".dragging-from");
  const dragging = document.querySelector(".dragging");
  const draggingOver = document.querySelector(".dragging-over");
  const draggingGroup = dragging.getAttribute("drag-group");
  const stagesLoader = document.querySelector(".stages-loader");

  const XHR = new XMLHttpRequest();
  const csrftoken = getCookie("csrftoken");

  let destinationOrder = Number(draggingOver.getAttribute("order"));

  // destinationOrderの補正
  isSameStage = dragging.getAttribute("stage-id") == draggingOver.getAttribute("stage-id");
  if (isSameStage) {
    if (destinationOrder < dragging.getAttribute("order")) destinationOrder += 1;
    if (destinationOrder == dragging.getAttribute("order")) return mouseUp();
  } else {
    destinationOrder += 1;
  }

  // ロード画面の表示
  stagesLoader.classList.remove("hidden");

  const data = JSON.stringify({
    "stage-id": draggingOver.getAttribute("stage-id"),
    "source-id": dragging.getAttribute("task-id"),
    "destination-order": destinationOrder,
  });

  //  const taskSwapURL = "{% url 'tasks:swap' %}"  (stages/show.html)
  XHR.open("post", taskSwapURL, true);
  XHR.responseType = "json";
  XHR.setRequestHeader("X-CSRFToken", csrftoken);
  XHR.setRequestHeader("content-type", "application/json");
  XHR.send(data);
  XHR.onload = () => {
    if (XHR.status != 200) {
      alert(`Error ${ XHR.status }: ${ XHR.statusText }`);
      return null;
    }

    // draggingFrom と droppable の stage-id を更新
    draggingFrom.removeAttribute("stage-id");
    draggingFrom.querySelector(".droppable").removeAttribute("stage-id");
    draggingFrom.setAttribute("stage-id", draggingOver.getAttribute("stage-id"));
    draggingFrom.querySelector(".droppable").setAttribute("stage-id", draggingOver.getAttribute("stage-id"));

    // order に変更のある task の更新
    const swappedOrders = XHR.response
    applySwappedTaskOrders(swappedOrders);

    // draggingFrom の挿入
    dragging.remove();
    draggingFrom.classList.remove("dragging-from");
    if(draggingOver.getAttribute("order") == 0){
      draggingOver.closest(`.${draggingGroup}s`).querySelector(`.${draggingGroup}s__inner`).insertAdjacentHTML("afterbegin", draggingFrom.outerHTML);
    } else {
      draggingOver.closest(`.${draggingGroup}-wrapper`).insertAdjacentHTML("afterend", draggingFrom.outerHTML);
    }
    draggingFrom.remove();

    // ロード画面の非表示
    stagesLoader.classList.add("hidden");
  }
}


function applySwappedTaskOrders(swappedOrders) {
  const draggables = document.getElementsByClassName("task-wrapper draggable");
  const droppables = document.getElementsByClassName("task-drop droppable");

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


window.addEventListener("DOMContentLoaded", dragAndDrop);

//  DOM構造が変化したとき、再び EventListenerを埋め込む
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(documentMutation);
  const config = { attributes: true, childList: true, subtree: true };
  observer.observe(document, config);
  function documentMutation(mutationsList, observer){
    dragAndDrop();
  }
});
