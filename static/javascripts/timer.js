const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 100;
const R = 40;
const INCLINATION = 0;
const OVER_HALF = 1;
const CLOCK_WISE = 1;


const DERAY_TIME = 100; //ms
const T = 10000; //ms
const DELTA_THETA = 2 * Math.PI * DERAY_TIME / T;
let countdownID;
let currentTime;

let loopCount=0;

function timer() {
  const timerBtn = document.querySelector(".timer-btn");
  const resetBtn = document.querySelector(".resetBtn");
  const mainTimerCircle = document.querySelector(".timer-main .timer-circle");
  const subTimerCircle = document.querySelector(".timer-sub .timer-circle");

  // setTimerCirclePath(mainTimerCircle);
  // d = M startX startY A R R inclination isOverHalf isClockWise endX endY
  const d = ["M", `${VIEW_WIDTH/2}`, `${VIEW_HEIGHT/2 - R}`,
             "A", `${R}`, `${R}`, `${INCLINATION}`, `${OVER_HALF}`,
             `${CLOCK_WISE}`, `${VIEW_WIDTH/2-0.0001}`, `${VIEW_HEIGHT/2 - R}`]
  mainTimerCircle.setAttribute("d", d.join(" "));

  currentTime = Date.now()
  countdownID = setInterval(countdown, DERAY_TIME);
}

// function setTimerCirclePath(circlePath) {
// }


function countdown() {
  loopCount++;
  const mainTimerCircle = document.querySelector(".timer-main .timer-circle");
  // 円弧の終点を取得する
  // isOverHalf = 1: endX = VIEW_WIDTH/2 - RcosΘ, endY = VIEW_HEIGHT/2 + RsinΘ
  // isOverHalf = 0: endX = VIEW_WIDTH/2 + RcosΘ, endY = VIEW_HEIGHT/2 - RsinΘ

  let pathList = mainTimerCircle.getAttribute("d").split(" ");
  let isOverHalf = pathList[7];
  let endX = pathList[9];
  let endY = pathList[10];

  if (isOverHalf === "1") {
    let theta = Math.atan((endY - VIEW_HEIGHT/2) / (VIEW_WIDTH/2 - endX));

    theta += DELTA_THETA;
    [endX, endY] = [VIEW_WIDTH/2 - R * Math.cos(theta), VIEW_HEIGHT/2 + R * Math.sin(theta)]

    // thetaが pi/2 を上回ったらisOverHalfを変更し、
    // thetaを pi/2 から上回った分だけ進める
    if (theta >= Math.PI/2) {
      console.log(loopCount, theta);

      theta =  -Math.PI/2 + (theta - Math.PI/2);
      isOverHalf = 0;
      [endX, endY] = [VIEW_WIDTH/2 + R * Math.cos(theta), VIEW_HEIGHT/2 - R * Math.sin(theta)]
    }

  } else {
    let theta = Math.atan((VIEW_HEIGHT/2 - endY) / (endX - VIEW_WIDTH/2));
    theta += DELTA_THETA;

    // thetaが -pi/2 を下回ったらthetaを -pi/2 にする
    if (theta >= Math.PI/2) {
      // theta = Math.PI/2;
      clearInterval(countdownID)
    }
    [endX, endY] = [VIEW_WIDTH/2 + R * Math.cos(theta), VIEW_HEIGHT/2 - R * Math.sin(theta)]

  }


  pathList[7] = isOverHalf;
  pathList[9] = endX;
  pathList[10] = endY;

  mainTimerCircle.setAttribute("d", pathList.join(" "));
}



window.addEventListener("load", timer);
