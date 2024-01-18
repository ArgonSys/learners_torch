// remainTime, planedTime, iconStartHTML, iconStopHTML from measure_time.html
const UNDER_HALF = 0;
const CLOCK_WISE = 1;

const DERAY_TIME = 10; //ms

let viewW, viewH, r, incl;

const initialTheta = 2*Math.PI * remainTime / planedTime;
let currentTheta = initialTheta;

let countdownID, countupID;
let startedTime, lastTime;
let currentRemainTime = remainTime;


let loopCount = 0;


function timer() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const timerBtn = document.querySelector(".timer-btn");
  const resetBtn = document.querySelector(".reset-btn");
  [viewW, viewH, r, incl] = getTimerVars(mainTimerPi);
  setTimerCirclePath(mainTimerPi, currentTheta);


  timerBtn.addEventListener("click", startCountDown);
  resetBtn.addEventListener("click", resetCount);
}


function startCountDown(event){
  startedTime = Date.now();
  lastTime = Date.now();
  this.innerHTML = iconStopHTML;
  this.removeEventListener("click", startCountDown);
  this.addEventListener("click", stopCountDown);
  countdownID = setInterval(countdown, DERAY_TIME);
  lastTime = Date.now();
}


function stopCountDown(event){
  this.innerHTML = iconStartHTML;

  this.removeEventListener("click", stopCountDown);
  this.addEventListener("click", startCountDown);

  clearInterval(countdownID);
  countdownID = null;
}


function countdown() {
  const timerBtn = document.querySelector(".timer-btn");
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const remainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");

  loopCount++;
  console.log(loopCount, currentTheta);

  const currentTime = Date.now();
  const deltaTime = currentTime - lastTime;
  const deltaTheta = 2*Math.PI * deltaTime/planedTime;
  lastTime = Date.now();

  currentRemainTime -= deltaTime;
  remainTimeArea.innerHTML = formatMsec((currentRemainTime > 0)? currentRemainTime: 0, true);

  currentTheta -= deltaTheta;
  setTimerCirclePath(mainTimerPi, currentTheta);



  if(currentTheta <= 0) {
    clearInterval(countdownID);
    countdownID = null;
    currentTheta = 0 - currentTheta;

    setCountupApparence()

    timerBtn.removeEventListener("click", stopCountDown);
    timerBtn.addEventListener("click", stopCountUp);

    countupID = setInterval(countup, DERAY_TIME);
  }
}

function startCountUp(event){
  lastTime = Date.now();
  this.innerHTML = iconStopHTML;
  this.removeEventListener("click", startCountUp);
  this.addEventListener("click", stopCountUp);
  countupID = setInterval(countup, DERAY_TIME);
  lastTime = Date.now();
}


function stopCountUp(event){
  this.innerHTML = iconStartHTML;
  this.removeEventListener("click", stopCountUp);
  this.addEventListener("click", startCountUp);
  clearInterval(countupID);
  countupID = null;
}


function countup() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const remainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");
  loopCount++;
  console.log(loopCount, currentTheta);

  const deltaTime = Date.now() - lastTime;
  const deltaTheta = 2*Math.PI * deltaTime/planedTime;
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

  countdownID = null;
  countupID = null;

  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const remainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");
  const timerBtn = document.querySelector(".timer-btn");

  currentTheta = initialTheta;
  setTimerCirclePath(mainTimerPi, currentTheta);

  currentRemainTime = remainTime;
  remainTimeArea.innerHTML = formatMsec(currentRemainTime, false);

  timerBtn.innerHTML = iconStartHTML;
  timerBtn.removeEventListener("click", stopCountUp);
  timerBtn.removeEventListener("click", stopCountDown);
  timerBtn.removeEventListener("click", startCountUp);
  timerBtn.addEventListener("click", startCountDown);

  removeCountupApparence();
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

  remainTimeArea.setAttribute("style", "color:red;")
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


function getTimerVars(timerPi) {
  const viewBox = timerPi.getAttribute("viewBox").split(" ");
  const [viewW, viewH] = [viewBox[2] - viewBox[0], viewBox[3] - viewBox[1]];

  const overhalfD = timerPi.querySelector(".overhalf-circle").getAttribute("d").split(" ");
  const [r, incl] = [overhalfD[4], overhalfD[6]]

  return [Number(viewW), Number(viewH), Number(r), incl];
}


window.addEventListener("load", timer);
