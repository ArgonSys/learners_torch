function toggleTimes(){
  const progressMeters = document.querySelectorAll(".progress__meter");
  progressMeters.forEach((proggressMeter) => {
    proggressMeter.addEventListener("click", toggleTimeClick);
    proggressMeter.addEventListener("touch", toggleTimeClick);
  });
}

function toggleTimeClick(event){
  const remainTimeArea = this.querySelector(".remain-time .inner-text");
  const passedTimeArea = this.querySelector(".passed-time .inner-text");

  remainTimeArea.classList.toggle("hidden");
  passedTimeArea.classList.toggle("hidden");
}




window.addEventListener("load", toggleTimes);
