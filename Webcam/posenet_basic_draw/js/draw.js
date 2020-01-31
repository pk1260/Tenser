const canvas1 = document.getElementById('canvas1');
// could be 3d, if you want to make a video game
const ctx1 = canvas1.getContext('2d');
canvas1.width = screen.width;
canvas1.height = screen.height;

ctx1.lineJoin = 'round';
ctx1.lineCap = 'round';
ctx1.lineWidth = 20;
ctx1.strokeStyle = '#ac0000';

let isDrawing = false;
let lastX = 0;
let lastY = 0;
const clearDrawing =() => {
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
}

canvas2.addEventListener('mousedown', () => isDrawing = true);
canvas2.addEventListener('mouseup', () => isDrawing = false);

function drawPosenet(x,y) {
  // stop the function if they if not mouse down
  if(!isDrawing) return;
  console.log(x,y);
  ctx1.beginPath();
  ctx1.moveTo(lastX, lastY);
  ctx1.lineTo(x,y);
  ctx1.stroke();
  [lastX, lastY] = [x, y];
}
