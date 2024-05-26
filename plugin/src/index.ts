type Vector = {
  x: number;
  y: number;
};

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
if (!ctx) throw new Error("No context");
resize();
draw();

window.addEventListener("resize", resize);

canvas.addEventListener("click", (event) => {
  console.log({ x: event.clientX, y: event.clientY });
});
const dragstart: Vector = { x: 0, y: 0 };
let dragging = false;

canvas.addEventListener("mousedown", (event) => {
  dragging = true;
  dragstart.x = event.pageX - canvas.offsetLeft;
  dragstart.y = event.pageY - canvas.offsetTop;
});

canvas.addEventListener("mousemove", (event) => {
  if (!dragging) return;
  console.log("moving");
  const dragend: Vector = {
    x: event.pageX - canvas.offsetLeft,
    y: event.pageY - canvas.offsetTop,
  };
  ctx.translate(dragend.x - dragstart.x, dragend.y - dragstart.y);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw();
  dragstart.x = dragend.x;
  dragstart.y = dragend.y;
});

canvas.addEventListener("mouseup", (event) => {
  dragging = false;
  dragstart.x = 0;
  dragstart.y = 0;
});

canvas.addEventListener("mouseout", () => {
  dragging = false;
  dragstart.x = 0;
  dragstart.y = 0;
});

const canvasOrigin = { x: 0, y: 0 };
let scale = 1;
canvas.addEventListener("wheel", (event) => {
  console.log(event);
  const scaleBy = -event.deltaY / 500;
  const x = event.pageX - canvas.offsetLeft;
  const y = event.pageY - canvas.offsetTop;
  scale += scaleBy;

  canvasOrigin.x = x - canvasOrigin.x * scaleBy;
  canvasOrigin.y = y - canvasOrigin.y * scaleBy;
  console.log(scale);
  ctx.reset();
  ctx.setTransform(scale, 0, 0, scale, canvasOrigin.x, canvasOrigin.y);
  draw();
});

function resize() {
  ctx.canvas.width = document.body.clientWidth;
  ctx.canvas.height = document.body.clientHeight;
  draw();
}

function draw() {
  drawFile("main", ["main"], { x: 120, y: 430 });
}

function drawPath(from: Vector, to: Vector) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.lineCap = "round";
}

function drawFile(fileName: string, functions: string[], position: Vector) {
  containedStyles(() => {
    ctx.fillStyle = "#555";
    ctx.strokeStyle = "#f2f2f2";
    ctx.lineWidth = 3;
    ctx.fillRect(
      position.x,
      position.y,
      position.x + 200,
      position.y + 20 + 20 * functions.length,
    );
    ctx.strokeText(fileName, position.x, position.y + 5);
  });
}

function containedStyles(func: () => void) {
  const previousStyles = {
    fill: ctx.fillStyle,
    stroke: ctx.strokeStyle,
    lineWidth: ctx.lineWidth,
  };
  func();
  ctx.strokeStyle = previousStyles.stroke;
  ctx.fillStyle = previousStyles.fill;
  ctx.lineWidth = previousStyles.lineWidth;
}
