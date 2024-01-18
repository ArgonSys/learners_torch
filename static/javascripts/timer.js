// remainTime, planedTime from measure_time.html
const UNDER_HALF = 0;
const CLOCK_WISE = 1;

const DERAY_TIME = 10; //ms

let viewW, viewH, r, incl;

let currentTheta = 2*Math.PI * remainTime / planedTime;

let countdownID, countupID;
let startedTime, lastTime;
let currentRemainTime = remainTime;


let loopCount = 0;


function timer() {
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  const timerBtn = document.querySelector(".timer-btn");
  const resetBtn = document.querySelector(".resetBtn");
  [viewW, viewH, r, incl] = getTimerVars(mainTimerPi);
  setTimerCirclePath(mainTimerPi, currentTheta);


  timerBtn.addEventListener("click", startCountDown);
}


function startCountDown(event){
  startedTime = Date.now();
  lastTime = Date.now();
  console.log(iconStopHTML);
  this.innerHTML = iconStopHTML;
  this.removeEventListener("click", startCountDown);
  this.addEventListener("click", stopCountDown);
  countdownID = setInterval(countdown, DERAY_TIME);
  lastTime = Date.now();
}


function stopCountDown(event){
  console.log(iconStopHTML);
  this.innerHTML = iconPlayHTML;

  this.removeEventListener("click", stopCountDown);
  this.addEventListener("click", startCountDown);

  clearInterval(countdownID);
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
    currentTheta = 0 - currentTheta;

    mainTimerPi.classList.add("h-reverse");
    mainTimerPi.querySelectorAll("path").forEach((ele) => {
      ele.setAttribute("style", "opacity:0.5;");
      ele.setAttribute("stroke", "red");
    });
    remainTimeArea.setAttribute("style", "color:red;")

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
  this.innerHTML = iconPlayHTML;
  this.removeEventListener("click", stopCountUp);
  this.addEventListener("click", startCountUp);
  clearInterval(countupID);
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
