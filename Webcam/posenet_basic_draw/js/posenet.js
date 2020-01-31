let posenetX, posenetY = 0;//global parameters => control
let posenetOk = false;
let touchTimer = 0; // prevent multiple hits
let handTouch = false;
const screenWidth = screen.width;
const screenHeight = screen.height;
const canvas2 = document.getElementById('canvas2');
let ctx2 = canvas2.getContext('2d');
let pose;//debug global
let showVideoStream = false; // do not show video toggle
function setupContext(){
  canvas2.width = screenWidth;
  canvas2.height = screenHeight;
  canvas2.style.zIndex = "2";// canvas on top
  ctx2.translate(screenWidth, 0);
  ctx2.scale(-1, 1); // flip screen horizontal
}
async function start() {
  setupContext();
  //https://github.com/tensorflow/tfjs-models/tree/master/posenet
  const net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      //inputResolution: { width: 640, height: 480 },
      multiplier: 0.5 // 0.75
      //outputstride 32 lower resolution = higher speed
    });

  let video;
  try {
      video = await loadVideo();
  } catch (e) {
      console.error(e);
      return;
  }
  detectPoseInRealTime(video, net);
}
function detectPoseInRealTime(video, net) {
    async function poseDetectionFrame() {
       //pose = await net.estimateSinglePose(video, 0.5, false, 16);
       pose = await net.estimateSinglePose(video, {
        //flipHorizontal: false
      });
      showSkeleton(pose);
      requestAnimationFrame(poseDetectionFrame);
    }
    poseDetectionFrame();
}
async function loadVideo() {
  const video = await setupCamera();
  video.play();
  return video;
}
async function setupCamera() {
  const video = document.getElementById('video');
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        width: screenWidth,
        height: screenHeight
      }
    });
    video.width = screenWidth;
    video.height = screenHeight;
    video.srcObject = stream;
    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  } else {
    const errorMessage = "This browser does not support video capture, or this device does not have a camera";
    alert(errorMessage);
    return Promise.reject(errorMessage);
  }
}
//draw a circle
const ellipse = (x,y,radius, hex) =>{
  ctx2.fillStyle  =  hex;
  ctx2.beginPath();
  ctx2.arc(x, y, radius, radius, 0, 2 * Math.PI);
  ctx2.fill();
}
function showSkeleton(poseArray){
    ctx2.clearRect(0, 0, screenWidth, screenHeight);
    if(showVideoStream){
        ctx2.globalAlpha = 1; // show video stream
        ctx2.drawImage(video, 0, 0, screenWidth, screenHeight);
      }
    //left ear index 3 right ear index 4. left eye 1  right eye 2 nose 0
    if(poseArray.keypoints[0].score>0.8){// see the nose?
      posenetOk = true; // start controlling
      //left ear index 3 right ear index 4. left eye 1  right eye 2 nose 0
      //nose
      ellipse(poseArray.keypoints[0].position.x, poseArray.keypoints[0].position.y, 30, 'blue');
      posenetX = Math.round(poseArray.keypoints[0].position.x);//global parameters => communicate to application
      posenetY = Math.round(poseArray.keypoints[0].position.y);//global parameters => communicate to application
      // show left eye & right eye
      ellipse(poseArray.keypoints[1].position.x, poseArray.keypoints[1].position.y, 30, 'green');
      ellipse(poseArray.keypoints[2].position.x, poseArray.keypoints[2].position.y, 30, 'red');
      if(poseArray.keypoints[10].score>0.5){//show right wrist if visible
        ellipse(poseArray.keypoints[10].position.x, poseArray.keypoints[10].position.y, 30, 'magenta');//right wrist
        ellipse(poseArray.keypoints[9].position.x, poseArray.keypoints[9].position.y, 30, 'magenta');//left wrist
        // if wrist close to each other then say touch
        if (Math.abs(poseArray.keypoints[9].position.x - poseArray.keypoints[10].position.x ) <150){
          if (Math.abs(poseArray.keypoints[9].position.y- poseArray.keypoints[10].position.y ) <150){
            if(Date.now() - touchTimer > 10000){
            handTouch = true; // hand touches
            console.log("hand touch");
            touchTimer = Date.now();//get time
            }
          }
        }
        else {handTouch = false;}
      }
      // calculate moving average
      movingAverageX.update(screenWidth - posenetX);
      cursorX = movingAverageX.mean;
      movingAverageY.update(posenetY)
      cursorY = movingAverageY.mean;
      drawPosenet(cursorX,cursorY); // communicate to draw Cursor X is Rechts
      if(cursorX > 300 ){
        console.log("video speelt af");
        player.playVideo();

      }
      else{
        console.log("videotstopy");
        player.stopVideo();
      }
    }
    else {
      posenetOk = false; // stop controlling
    }

  }
start();
