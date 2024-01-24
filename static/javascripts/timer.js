// remainTime, planedTime, iconStartHTML, iconStopHTML,
// saveActualTimeURL, deleteActualTimeURL   from _timer.html
// getCookie from utils.js
const UNDER_HALF = 0;
const CLOCK_WISE = 1;

const DERAY_TIME = 10; //ms

let viewW, viewH, r, incl;

let initialTheta;
if(planedTime != 0){
  // remainTimeの正負を吸収、場合分けは timer()内で行う
  initialTheta = Math.abs(2*Math.PI * remainTime / planedTime);
} else {
  initialTheta = 0;
}

let countdownID, countupID;
let startedTime, lastTime;

let currentRemainTime;
let currentTheta;

let loopCount = 0;


function timer() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const remainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");
  const timerBtn = document.querySelector(".timer-btn");
  const resetBtn = document.querySelector(".reset-btn");
  [viewW, viewH, r, incl] = getTimerVars(mainTimerPi);

  currentRemainTime = Math.abs(remainTime);
  currentTheta = initialTheta;
  setTimerCirclePath(mainTimerPi, currentTheta);
  remainTimeArea.innerHTML = formatMsec(currentRemainTime, remainTime > 0);

  if(remainTime > 0){
    timerBtn.addEventListener("click", startCountDown);
  } else {
    setCountupApparence();
    timerBtn.addEventListener("click", startCountUp);
  }

  startedTime = null;
  lastTime = null;
  resetBtn.addEventListener("click", resetCount);
}


function startCountDown(event){
  startedTime ??= Date.now();

  this.innerHTML = iconStopHTML;
  this.removeEventListener("click", startCountDown);
  this.addEventListener("click", stopCountDown);
  window.addEventListener("pagehide", stopCountDown);

  countdownID = setInterval(countdown, DERAY_TIME);
}


function stopCountDown(event){
  this.innerHTML = iconStartHTML;
  this.removeEventListener("click", stopCountDown);
  window.removeEventListener("pagehide", stopCountDown);
  this.addEventListener("click", startCountDown);

  clearInterval(countdownID);
  countdownID = null;

  saveActualTime(Date.now() - startedTime);
}


function countdown() {
  const timerBtn = document.querySelector(".timer-btn");
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const remainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");

  const currentTime = Date.now();
  const deltaTime = currentTime - (lastTime??startedTime);
  const deltaTheta = (planedTime != 0)? (2*Math.PI * deltaTime/planedTime): 0;
  lastTime = Date.now();

  currentRemainTime -= deltaTime;
  remainTimeArea.innerHTML = formatMsec((currentRemainTime > 0)? currentRemainTime: 0, true);

  currentTheta -= deltaTheta;
  setTimerCirclePath(mainTimerPi, currentTheta);



  if(currentTheta <= 0) {
    clearInterval(countdownID);
    countdownID = null;
    currentTheta = 0 - currentTheta;

    setCountupApparence();

    timerBtn.removeEventListener("click", stopCountDown);
    timerBtn.addEventListener("click", stopCountUp);

    countupID = setInterval(countup, DERAY_TIME);
  }
}

function startCountUp(event){
  startedTime ??= Date.now();

  this.innerHTML = iconStopHTML;
  this.removeEventListener("click", startCountUp);
  this.addEventListener("click", stopCountUp);
  window.addEventListener("pagehide", stopCountUp);

  countupID = setInterval(countup, DERAY_TIME);
}


function stopCountUp(event){
  this.innerHTML = iconStartHTML;
  this.removeEventListener("click", stopCountUp);
  window.removeEventListener("pagehide", stopCountUp);
  this.addEventListener("click", startCountUp);

  clearInterval(countupID);
  countupID = null;

  saveActualTime(Date.now() - startedTime);
}


function countup() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const remainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");

  const deltaTime = Date.now() - (lastTime??startedTime);
  const deltaTheta = (planedTime != 0)? (2*Math.PI * deltaTime/planedTime): 0;
  lastTime = Date.now();

  currentRemainTime += deltaTime;
  remainTimeArea.innerHTML = formatMsec(currentRemainTime, false);

  currentTheta += deltaTheta;
  setTimerCirclePath(mainTimerPi, currentTheta);


  if(currentTheta >= 2 * Math.PI) {
    const pathes = mainTimerPi.querySelectorAll("path.hidden");
    if(pathes) pathes.forEach((ele) => {
      ele.classList.remove("hidden");
    });
    currentTheta = currentTheta - 2 * Math.PI;
  }
}


function resetCount(event){
  // タイマーが動作している場合、タイマーの停止をし、confirm が false だったら再起動する
  if(countdownID){
    clearInterval(countdownID);
    if(!confirm("タイマーをリセットしますか？")){
      countdownID = setInterval(countdown, DERAY_TIME);
      lastTime = Date.now();
      return;
    }

  } else if(countupID) {
    clearInterval(countupID);
    if(!confirm("タイマーをリセットしますか？")){
      countupID = setInterval(countup, DERAY_TIME);
      lastTime = Date.now();
      return;
    }

  } else {
    // タイマーが動作していない場合、レコードの削除を伴う
    if(!confirm("直前の記録を消去しますか？")) return;
    deleteLatestRecord();
  }

  countdownID = null;
  countupID = null;

  resetTimerButton();
  removeCountupApparence();

  timer();
}



function setTimerCirclePath(timerPi, theta) {
  // 2つの円弧を組み合わせ、正円も対応できるようにする
  const overHalf = timerPi.querySelector(".active.overhalf-circle");
  const underHalf = timerPi.querySelector(".active.underhalf-circle");

  // overHalfTheta, underHalfTheta は閉区間[-π/2, π/2] に含まれる
  const overHalfTheta = Math.min(Math.max(3/2*Math.PI - theta, -Math.PI/2), Math.PI/2);
  const underHalfTheta = Math.min(Math.max(1/2*Math.PI - theta, -Math.PI/2), Math.PI/2);

  // overHalf: endX = viewW/2 - RcosΘ, endY = viewH/2 + RsinΘ
  // underHalf: endX = viewW/2 + RcosΘ, endY = viewH/2 - RsinΘ
  const [overHalfEndX, overHalfEndY] = [viewW/2 - r*Math.cos(overHalfTheta), viewH/2 + r*Math.sin(overHalfTheta)];
  const [underHalfEndX, underHalfEndY] = [viewW/2 + r*Math.cos(underHalfTheta), viewH/2 - r*Math.sin(underHalfTheta)];

  // d = M startX startY A R R inclination isOverHalf isClockWise endX endY
  const overHalfD = ["M", `${viewW/2}`, `${viewH/2 + r}`,
                     "A", `${r}`, `${r}`, `${incl}`, `${UNDER_HALF}`,
                     `${CLOCK_WISE}`, `${overHalfEndX}`, `${overHalfEndY}`];

  const underHalfD = ["M", `${viewW/2}`, `${viewH/2 - r}`,
                      "A", `${r}`, `${r}`, `${incl}`, `${UNDER_HALF}`,
                      `${CLOCK_WISE}`, `${underHalfEndX}`, `${underHalfEndY}`];

  overHalf.setAttribute("d", overHalfD.join(" "));
  underHalf.setAttribute("d", underHalfD.join(" "));
}


function setCountupApparence() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const remainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");
  const pathes = mainTimerPi.querySelectorAll("path");

  mainTimerPi.classList.add("h-reverse");
  pathes.forEach((ele) => {
    ele.setAttribute("style", "opacity:0.5;");
    ele.setAttribute("stroke", "red");
  });

  remainTimeArea.setAttribute("style", "color:red;");
}


function removeCountupApparence() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const remainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");
  const pathes = mainTimerPi.querySelectorAll("path");

  mainTimerPi.classList.remove("h-reverse");
  pathes.forEach((ele) => {
    ele.removeAttribute("style");
    ele.setAttribute("stroke", "#6fdb6f");

    if(!ele.classList.contains("active")) ele.classList.add("hidden");
  });

  remainTimeArea.removeAttribute("style");
}

function resetTimerButton() {
  const timerBtn = document.querySelector(".timer-btn");
  timerBtn.innerHTML = iconStartHTML;
  timerBtn.removeEventListener("click", stopCountUp);
  timerBtn.removeEventListener("click", stopCountDown);
  timerBtn.removeEventListener("click", startCountUp);
  timerBtn.removeEventListener("click", startCountDown);
  window.removeEventListener("pagehide", stopCountUp);
  window.removeEventListener("pagehide", stopCountDown);
}

function getTimerVars(timerPi) {
  const viewBox = timerPi.getAttribute("viewBox").split(" ");
  const [viewW, viewH] = [viewBox[2] - viewBox[0], viewBox[3] - viewBox[1]];

  const overhalfD = timerPi.querySelector(".overhalf-circle").getAttribute("d").split(" ");
  const [r, incl] = [overhalfD[4], overhalfD[6]]

  return [Number(viewW), Number(viewH), Number(r), incl];
}


function saveActualTime(measuredTime) {
  const taskId = document.querySelector(".timers__header .task-name").getAttribute("task-id");
  const stageId = document.querySelector(".timers__header .stage-name").getAttribute("stage-id");

  const XHR = new XMLHttpRequest();
  const csrftoken = getCookie("csrftoken");
  const data = JSON.stringify({
    "task_pk": taskId,
    "stage_pk": stageId,
    "started_time": startedTime,
    "measured_time": measuredTime,
  });

  // saveActualTimeURL from _timer.html
  XHR.open("post", saveActualTimeURL, true);
  XHR.responseType = "json";
  XHR.setRequestHeader("X-CSRFToken", csrftoken);
  XHR.setRequestHeader("content-type", "application/json");
  XHR.send(data);
  XHR.onload = () => {
    if (XHR.status != 200) {
      alert(`Error ${ XHR.status }: ${ XHR.statusText }`);
      return null;
    }
    planedTime =  XHR.response.planedTime;
    remainTime =  XHR.response.remainTime;
    if(planedTime != 0){
      // remainTimeの正負を吸収、場合分けは timer()内で行う
      initialTheta = Math.abs(2*Math.PI * remainTime / planedTime);
    } else {
      initialTheta = 0;
    }
    timer();
  }
}


function deleteLatestRecord() {
  const XHR = new XMLHttpRequest();
  const csrftoken = getCookie("csrftoken");

  // deleteActualTimeURL from _timer.html
  XHR.open("post", deleteActualTimeURL, true);
  XHR.responseType = "json";
  XHR.setRequestHeader("X-CSRFToken", csrftoken);
  XHR.setRequestHeader("content-type", "application/json");
  XHR.send();
  XHR.onload = () => {
    if (XHR.status != 200) {
      alert(`Error ${ XHR.status }: ${ XHR.statusText }`);
      return null;
    }

    planedTime =  XHR.response.planedTime;
    remainTime =  XHR.response.remainTime;
    if(planedTime != 0){
      // remainTimeの正負を吸収、場合分けは timer()内で行う
      initialTheta = Math.abs(2*Math.PI * remainTime / planedTime);
    } else {
      initialTheta = 0;
    }
    timer();
  }
}


window.addEventListener("load", timer);
