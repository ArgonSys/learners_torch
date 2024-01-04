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
  //  draggingオブジェクトの取得、初期位置からの
  const dragging = this.closest(".draggable");
  dragging.style.top = dragging.offsetTop + "px";
  dragging.style.left = dragging.offsetLeft + "px";
  dragging.classList.add("dragging");

  // タッチイベントとマウスイベントの差異を吸収
  event = event.type == "mousedown"? event: event.changedTouches[0];


  //  マウスとの位置関係を保持
  relMouseX = event.pageX - dragging.offsetLeft;
  relMouseY = event.pageY - dragging.offsetTop;

  document.body.addEventListener("mousemove", mouseMove, false);
  document.body.addEventListener("touchmove", mouseMove, {passive: false});

}


function mouseMove(event){

  const dragging = document.querySelector(".dragging");
  const droppables = document.querySelectorAll(".droppable")
  if (!dragging) return null;

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

  const XHR = new XMLHttpRequest();
  const csrftoken = getCookie("csrftoken");
  let destinationOrder = Number(this.getAttribute("order"));
  // order が小さい要素に対する swap 時の補正
  if (destinationOrder < dragging.getAttribute("order")) destinationOrder += 1;
  // 補正後の2つの order が等しいなら return
  if (destinationOrder == dragging.getAttribute("order")) return null;

  const data = JSON.stringify({
    "source-id": dragging.getAttribute("stage-id"),
    "destination-order": destinationOrder,
  });

  //  const swapURL = "{% url 'stages:swap' %}"  (stages/show.html)
  XHR.open("post", swapURL, true);
  XHR.responseType = "json";
  XHR.setRequestHeader("X-CSRFToken", csrftoken);
  XHR.setRequestHeader("content-type", "application/json");
  XHR.send(data);

  // top, left削除
  dragging.removeAttribute("style");
  dragging.classList.remove("dragging");

  // 見た目上の並べ替え
  this.closest(".stage-wrapper").insertAdjacentHTML("afterend", dragging.outerHTML);
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
  mouseUp(event);
}

function mouseUp(event){

  const dragging = document.querySelector(".dragging");
  const droppables = document.querySelectorAll(".droppable")

  if(dragging){
    dragging.removeAttribute("style");
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


window.addEventListener("load", dragAndDrop);

//  DOM構造が変化したとき、再び EventListenerを埋め込む
const observer = new MutationObserver(documentMutation);
const config = { attributes: true, childList: true, subtree: true };
observer.observe(document, config);
function documentMutation(mutationsList, observer){
  dragAndDrop()
}
