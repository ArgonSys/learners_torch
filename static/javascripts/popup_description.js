// setElementXYFromBase from "./utils"

function popupDescription(){
  const stageDescs = document.querySelectorAll(".stage__description");
  const taskDescs = document.querySelectorAll(".task__description");


  stageDescs.forEach((stageDesc) => {
    const stage = stageDesc.closest(".stage");
    if(!stage || stageDesc.innerHTML === "") return;
    stageDesc.addEventListener("touchstart", enterDesc);
    stageDesc.addEventListener("touchend", leaveDesc);
    stageDesc.addEventListener("mouseenter", enterDesc);
    stageDesc.addEventListener("mouseleave", leaveDesc);
  });

  taskDescs.forEach((taskDesc) => {
    const task = taskDesc.closest(".task");
    if(!task || taskDesc.innerHTML === "") return;
    console.log(taskDesc.closest(".task"));
    task.addEventListener("touchstart", enterDesc);
    task.addEventListener("touchend", leaveDesc);
    task.addEventListener("mouseenter", enterDesc);
    task.addEventListener("mouseleave", leaveDesc);
  });
}


function enterDesc(event){
  event = event.type == "mouseenter"? event: event.changedTouches[0];

  const showDesc = document.querySelector(".show-description");
  console.log(this, this.parentNode);
  const main = document.querySelector("main");
  const desc = this.parentNode.querySelector(".description");
  const popup = desc.cloneNode(true);
  if(showDesc) return;

  const [popupX, popupY] = setElementXYFromBase(desc.parentNode, main);

  popup.classList.add("popup-description");
  popup.style.top = `${popupY}px`;
  popup.style.left = `${popupX}px`;
  main.insertAdjacentElement("afterbegin", popup);
}

function leaveDesc(event){
  const showDescs = document.querySelectorAll(".popup-description");
  showDescs.forEach((ele) => {ele.remove()});
}


window.addEventListener("load", popupDescription);

//  DOM構造が変化したとき、再び EventListenerを埋め込む
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(documentMutation);
  const config = { attributes: true, childList: true, subtree: true };
  observer.observe(document, config);
  function documentMutation(mutationsList, observer){
    popupDescription();
  }
});
