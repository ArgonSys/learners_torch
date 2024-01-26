// remainTime, planedTime, iconStartHTML, iconStopHTML,
// actualTimeURL, deleteActualTimeURL   from _timer.html
// getCookie from utils.js
const UNDER_HALF = 0;
const CLOCK_WISE = 1;

const DERAY_TIME = 10; //ms

let viewW, viewH, r, incl;

let planedTime, remainTime;
let initialTheta;

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
  const timersLoader = document.querySelector(".timers-loader");


  [viewW, viewH, r, incl] = getTimerVars(mainTimerPi);

  timersLoader.classList.remove("hidden");
  fetchInitialValues().then(() => {
    console.log("currentValue");

    currentRemainTime = Math.abs(remainTime);
    currentTheta = initialTheta;

    setTimerCirclePath(mainTimerPi, currentTheta);
    remainTimeArea.innerHTML = formatMsec(currentRemainTime, remainTime > 0);

    resetTimerButton();
    if(remainTime > 0){
      timerBtn.addEventListener("click", startCountDown);
    } else {
      setCountupApparence();
      timerBtn.addEventListener("click", startCountUp);
    }

    startedTime = null;
    lastTime = null;
    resetBtn.addEventListener("click", resetCount);

    timersLoader.classList.add("hidden");
  });
}


function startCountDown(event){
  const timerBtn = document.querySelector(".timer-btn");

  startedTime ??= Date.now();

  timerBtn.innerHTML = iconStopHTML;
  timerBtn.removeEventListener("click", startCountDown);
  timerBtn.addEventListener("click", stopCountDown);
  window.addEventListener("beforeunload", stopCountDown);

  countdownID = setInterval(countdown, DERAY_TIME);
}


function stopCountDown(event){
  const timerBtn = document.querySelector(".timer-btn");
  const timersLoader = document.querySelector(".timers-loader");

  timerBtn.innerHTML = iconStartHTML;

  clearInterval(countdownID);
  countdownID = null;

  timersLoader.classList.remove("hidden");
  saveActualTime(Date.now() - startedTime).then(() => {
    timer();
    timerBtn.removeEventListener("click", stopCountDown);
    window.removeEventListener("beforeunload", stopCountDown);
    timerBtn.addEventListener("click", startCountDown);
  });
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
  const timerBtn = document.querySelector(".timer-btn");

  startedTime ??= Date.now();

  timerBtn.innerHTML = iconStopHTML;
  timerBtn.removeEventListener("click", startCountUp);
  timerBtn.addEventListener("click", stopCountUp);
  window.addEventListener("beforeunload", stopCountUp);

  countupID = setInterval(countup, DERAY_TIME);
}


function stopCountUp(event){
  const timerBtn = document.querySelector(".timer-btn");
  const timersLoader = document.querySelector(".timers-loader");

  timerBtn.innerHTML = iconStartHTML;

  clearInterval(countupID);
  countupID = null;

  timersLoader.classList.remove("hidden");
  saveActualTime(Date.now() - startedTime).then(() => {
    timer();
    timerBtn.removeEventListener("click", stopCountUp);
    window.removeEventListener("beforeunload", stopCountUp);
    timerBtn.addEventListener("click", startCountUp);
  });
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

  }

  if(countdownID || countupID){
    countdownID = null;
    countupID = null;

    resetTimerButton();
    removeCountupApparence();

    timer();
  } else {
    const timersLoader = document.querySelector(".timers-loader");
    timersLoader.classList.remove("hidden");

    deleteLatestRecord().then(() => {
      resetTimerButton();
      removeCountupApparence();

      timer();
    })
  }
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
  window.removeEventListener("beforeunload", stopCountUp);
  window.removeEventListener("beforeunload", stopCountDown);
}

function getTimerVars(timerPi) {
  const viewBox = timerPi.getAttribute("viewBox").split(" ");
  const [viewW, viewH] = [viewBox[2] - viewBox[0], viewBox[3] - viewBox[1]];

  const overhalfD = timerPi.querySelector(".overhalf-circle").getAttribute("d").split(" ");
  const [r, incl] = [overhalfD[4], overhalfD[6]]

  return [Number(viewW), Number(viewH), Number(r), incl];
}

function fetchInitialValues() {
  return new Promise((resolve, reject) => {
    const XHR = new XMLHttpRequest();
    XHR.open("get", actualTimeURL, true);
    XHR.responseType = "json";
    XHR.send();
    XHR.onload = () => {
      if (XHR.status != 200) {
        alert(`Error ${ XHR.status }: ${ XHR.statusText }`);
        reject();
      }

      planedTime =  XHR.response.planedTime;
      remainTime =  XHR.response.remainTime;
      console.log(planedTime, remainTime, initialTheta);

      if(planedTime != 0){
        // remainTimeの正負を吸収、場合分けは timer()内で行う
        initialTheta = Math.abs(2*Math.PI * remainTime / planedTime);
      } else {
        initialTheta = 0;
      }
      resolve();
    }
  });
}



function saveActualTime(measuredTime) {
  return new Promise((resolve, reject) => {
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

    XHR.open("post", actualTimeURL, true);
    XHR.responseType = "json";
    XHR.setRequestHeader("X-CSRFToken", csrftoken);
    XHR.setRequestHeader("content-type", "application/json");
    XHR.send(data);
    XHR.onload = () => {
      if (XHR.status != 200) {
        alert(`Error ${ XHR.status }: ${ XHR.statusText }`);
        reject();
      }
      resolve();
    }
  });
}


function deleteLatestRecord() {
  return new Promise((resolve, reject) => {
    const XHR = new XMLHttpRequest();
    const csrftoken = getCookie("csrftoken");

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
      resolve();
    };
  });
}


window.addEventListener("pageshow", timer);
// window.addEventListener("render", timer);
