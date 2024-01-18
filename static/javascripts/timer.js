const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 100;
const R = 40;
const NO_INCLINATION = 0;
const UNDER_HALF = 0;
const OVER_HALF = 1;
const CLOCK_WISE = 1;
const REVERSE_CLOCK_WISE = 0;


const DERAY_TIME = 100; //ms
const T = 10000; //ms
const REMAIN_T = 10000; //ms
const IS_OVER_HALF_AT_STARTED = (REMAIN_T > T/2)? 1: 0;
// IS_OVER_HALF_AT_STARTED == 1の時に引きすぎる分を補正
const THETA_AT_STARTED = 2*Math.PI * REMAIN_T/T;
const ENDX_AT_STARTED = VIEW_WIDTH/2 - (IS_OVER_HALF_AT_STARTED? 1: -1) * R * Math.cos(THETA_AT_STARTED);
const ENDY_AT_STARTED = VIEW_HEIGHT/2 + (IS_OVER_HALF_AT_STARTED? 1: -1) * R * Math.sin(THETA_AT_STARTED);

const DELTA_THETA = 2 * Math.PI * DERAY_TIME / T;

let currentTheta = THETA_AT_STARTED;
let countdownID;
let startedTime;

let loopCount=0;


function timer() {
  const timerBtn = document.querySelector(".timer-btn");
  const resetBtn = document.querySelector(".resetBtn");
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");

  setTimerCirclePath(mainTimerPi, THETA_AT_STARTED);

  startedTime = Date.now();
  countdownID = setInterval(countdown, DERAY_TIME);
}


function setTimerCirclePath(timerPi, theta, view_width=VIEW_WIDTH, view_height= VIEW_HEIGHT ,r=R, inclination=NO_INCLINATION) {
  // 2つの円弧を組み合わせ、正円も対応できるようにする
  const overHalf = timerPi.querySelector(".overhalf-circle");
  const underHalf = timerPi.querySelector(".underhalf-circle");

  // overHalfTheta, underHalfTheta は閉区間[-π/2, π/2] に含まれる
  const overHalfTheta = Math.min(Math.max(3/2*Math.PI - theta, -Math.PI/2), Math.PI/2);
  const underHalfTheta = Math.min(Math.max(1/2*Math.PI - theta, -Math.PI/2), Math.PI/2);

  // overHalf: endX = VIEW_WIDTH/2 - RcosΘ, endY = VIEW_HEIGHT/2 + RsinΘ
  // underHalf: endX = VIEW_WIDTH/2 + RcosΘ, endY = VIEW_HEIGHT/2 - RsinΘ
  const [overHalfEndX, overHalfEndY] = [view_width/2 - r*Math.cos(overHalfTheta), view_height/2 + r*Math.sin(overHalfTheta)];
  const [underHalfEndX, underHalfEndY] = [view_width/2 + r*Math.cos(underHalfTheta), view_height/2 - r*Math.sin(underHalfTheta)];

  // d = M startX startY A R R inclination isOverHalf isClockWise endX endY
  const overHalfD = ["M", `${view_width/2}`, `${view_height/2 + r}`,
                     "A", `${r}`, `${r}`, `${inclination}`, `${UNDER_HALF}`,
                     `${CLOCK_WISE}`, `${overHalfEndX}`, `${overHalfEndY}`];

  const underHalfD = ["M", `${view_width/2}`, `${view_height/2 - r}`,
                      "A", `${r}`, `${r}`, `${inclination}`, `${UNDER_HALF}`,
                      `${CLOCK_WISE}`, `${underHalfEndX}`, `${underHalfEndY}`];

  overHalf.setAttribute("d", overHalfD.join(" "));
  underHalf.setAttribute("d", underHalfD.join(" "));
}


function countdown() {
  loopCount++;
  const mainTimerPi = document.querySelector(".timer-main .timer-pi");
  console.log(loopCount, currentTheta);
  setTimerCirclePath(mainTimerPi, currentTheta);
  if(currentTheta <= 0) clearInterval(countdownID);
  currentTheta -= DELTA_THETA;
}


window.addEventListener("load", timer);
