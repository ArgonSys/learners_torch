let relMouseX;
let relMouseY;
let scrollLeftBeforeScroll = 0;

function dragAndDrop(){

  const dragHandles = document.querySelectorAll(".drag-handle");
  const stages = document.querySelector(".stages__inner");

  //  スクロール量の更新
  stages.addEventListener("scrollend", mouseScroll);

  dragHandles.forEach((dragHandle) => {
    dragHandle.addEventListener("mousedown", mouseDown);
    dragHandle.addEventListener("touchstart", mouseDown);
  });
}


function mouseDown(event){
  //  draggingオブジェクトのクローニング
  const draggingFrom = this.closest(".draggable");
  const dragging = draggingFrom.cloneNode(true);

  //  draggingFromオブジェクトを透過処理
  draggingFrom.classList.add("draggingFrom");

  //  初期位置からtop, left設定し挿入
  dragging.style.top = draggingFrom.offsetTop + "px";
  dragging.style.left = draggingFrom.offsetLeft + "px";
  dragging.classList.add("dragging");
  draggingFrom.after(dragging);

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousedown"? event: event.changedTouches[0];


  //  マウスとの位置関係を保持
  relMouseX = event.pageX + stages.scrollLeft - dragging.offsetLeft;
  relMouseY = event.pageY - dragging.offsetTop;

  document.body.addEventListener("mouseup", mouseUp);
  document.body.addEventListener("touchend", mouseUp);

  document.body.addEventListener("mousemove", mouseMove);
  document.body.addEventListener("touchmove", mouseMove, {passive: false});
}


function mouseMove(event){

  const dragging = document.querySelector(".dragging");
  const droppables = document.querySelectorAll(".droppable");
  const stages = document.querySelector(".stages__inner");
  if (!dragging) return null;

  // ドラッギングに伴うページスクロールを抑制
  event.preventDefault();
  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousemove"? event: event.changedTouches[0];

  // 要素とクリック・タッチ位置の関係を維持しながら動かす
  dragging.style.top = event.pageY - relMouseY + "px";
  dragging.style.left = event.pageX - relMouseX + stages.scrollLeft + "px";


  droppables.forEach((droppable) => {
    //  droppable要素の中にタッチドラッギングしてドロップしたら発火
    rect = droppable.getBoundingClientRect();
    setTouchendEventListener(droppable, event.clientX, event.clientY, rect);
    droppable.addEventListener("mouseup", dropDown);
  });


  //  カーソルが body から外れたとき発火
  document.body.addEventListener("mouseleave", mouseUp);
  document.body.addEventListener("touchleave", mouseUp);
}

function mouseScroll(event){

  const dragging = document.querySelector(".dragging");
  const droppables = document.querySelectorAll(".droppable");
  const stages = document.querySelector(".stages__inner");

  // スクロール差分の計算とスクロール量の更新
  deltaScrollLeft = stages.scrollLeft - scrollLeftBeforeScroll;
  scrollLeftBeforeScroll = stages.scrollLeft;

  if (!dragging) return null;

  // スクロールの差分だけ動かす
  left = parseInt(dragging.style.left);
  dragging.style.left = left + deltaScrollLeft + "px";

  droppables.forEach((droppable) => {
    rect = droppable.getBoundingClientRect();
    setTouchendEventListener(droppable, event.clientX, event.clientY, rect);
    droppable.addEventListener("mouseup", dropDown);
  });
}

function dropDown(event){
  ////  ドラッグした要素の入れ替えとViewへのデータ送信

  //  ドラッグ元の要素を消し、ドラッグ中の要素からdraggingクラスを取り除く
  const draggingFrom = document.querySelector(".draggingFrom");
  const dragging = document.querySelector(".dragging");
  const draggingOver = document.querySelector(".dragging-over");

  draggingFrom.remove();
  dragging.classList.remove("dragging");

  if(!draggingOver) return null;

  const XHR = new XMLHttpRequest();
  const csrftoken = getCookie("csrftoken");
  let destinationOrder = Number(draggingOver.getAttribute("order"));


  // order が小さい要素に対する swap 時の補正
  if (destinationOrder < dragging.getAttribute("order")) destinationOrder += 1;
  // 補正後の2つの order が等しいなら return
  if (destinationOrder == dragging.getAttribute("order")) return mouseUp();

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

  // top, left削除
  dragging.removeAttribute("style");
  dragging.classList.remove("dragging");

  // droppableの後に挿入し、元の要素を削除する
  draggingOver.closest(".stage-wrapper").insertAdjacentHTML("afterend", dragging.outerHTML);
  dragging.remove();

  XHR.onload = () => {
    if (XHR.status != 200) {
      alert(`Error ${ XHR.status }: ${ XHR.statusText }`);
      return null;
    }

    const swappedOrders = XHR.response
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
  //  eventlistenerの削除
  mouseUp();
}


function mouseUp(event){

  const droppables = document.querySelectorAll(".droppable");
  const draggingFromAll = document.querySelectorAll(".draggingFrom");
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


function getCookie(name) {
  if (!document.cookie || document.cookie === "") return null;
  cookies = document.cookie.split(";");
  for(var i=0; i < cookies.length; i++) {
    cookie = cookies[i].trim();
    if (cookie.substring(0, name.length + 1) === (name + "=")) {
      const cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
      return cookieValue;
    }
  }
}

function setTouchendEventListener(ele, cursorX, cursorY, rect){
  if ( isCursorInRect(cursorX, cursorY, rect) ){
    ele.classList.add("dragging-over");
    document.body.removeEventListener("touchend", mouseUp);
    document.body.addEventListener("touchend", dropDown);
  } else {
    ele.classList.remove("dragging-over");
    document.body.addEventListener("touchend", mouseUp);
    document.body.addEventListener("touchend", dropDown);
  }
}

function isCursorInRect(cursorX, cursorY, rect) {
  return cursorX >= rect.left && cursorX <= rect.right && cursorY >= rect.top && cursorY <= rect.bottom
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
