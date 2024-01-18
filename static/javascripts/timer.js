// remainTime, planedTime from measure_time.html
const UNDER_HALF = 0;
const CLOCK_WISE = 1;

const DERAY_TIME = 10; //ms

let viewW, viewH, r, incl;

let currentTheta = 2*Math.PI * remainTime / planedTime;
const DELTA_THETA = 2 * Math.PI * DERAY_TIME / planedTime;

let countdownID, countupID;
let startedTime;
let currentRemainTime = remainTime;


let loopCount = 0;


function timer() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const timerBtn = document.querySelector(".timer-btn");
  const resetBtn = document.querySelector(".resetBtn");
  [viewW, viewH, r, incl] = getTimerVars(mainTimerPi);
  setTimerCirclePath(mainTimerPi, currentTheta);
  startedTime = Date.now();
  countdownID = setInterval(countdown, DERAY_TIME);
}


function countdown() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const mainTimerRemainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");

  loopCount++;
  console.log(loopCount, currentTheta);
  setTimerCirclePath(mainTimerPi, currentTheta);
  currentRemainTime -= DERAY_TIME;
  mainTimerRemainTimeArea.innerHTML = formatMsec((currentRemainTime > 0)? currentRemainTime: 0, true);

  currentTheta -= DELTA_THETA;
  if(currentTheta <= 0) {
    clearInterval(countdownID);
    currentTheta = 0;

    mainTimerPi.classList.add("h-reverse");
    mainTimerPi.querySelectorAll("path").forEach((ele) => {
      ele.setAttribute("style", "opacity:0.5;");
      ele.setAttribute("stroke", "red");
    });
    mainTimerRemainTimeArea.setAttribute("style", "color:red;")
    countupID = setInterval(countup, DERAY_TIME);
  }
}

function countup() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const mainTimerRemainTimeArea = mainTimerPi.closest(".timer-main").querySelector(".remain-time");
  loopCount++;
  console.log(loopCount, currentTheta);
  setTimerCirclePath(mainTimerPi, currentTheta);

  currentRemainTime += DERAY_TIME;
  mainTimerRemainTimeArea.innerHTML = formatMsec(currentRemainTime, false);

  currentTheta += DELTA_THETA;
  if(currentTheta >= 2 * Math.PI) {
    const pathes = mainTimerPi.querySelectorAll("path");
    if(pathes.length < 4) pathes.forEach((ele) => {
      const clone = ele.cloneNode(true);
      clone.classList.remove("active");
      mainTimerPi.insertAdjacentElement("beforeend", clone);
    });
    currentTheta = 0;
  }
}

function setTimerCirclePath(timerPi, theta) {
  // 2つの円弧を組み合わせ、正円も対応できるようにする
  const overHalf = timerPi.querySelector(".overhalf-circle");
  const underHalf = timerPi.querySelector(".underhalf-circle");

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


function getTimerVars(timerPi) {
  const viewBox = timerPi.getAttribute("viewBox").split(" ");
  const [viewW, viewH] = [viewBox[2] - viewBox[0], viewBox[3] - viewBox[1]];

  const overhalfD = timerPi.querySelector(".overhalf-circle").getAttribute("d").split(" ");
  const [r, incl] = [overhalfD[4], overhalfD[6]]

  return [Number(viewW), Number(viewH), Number(r), incl];
}


window.addEventListener("load", timer);
