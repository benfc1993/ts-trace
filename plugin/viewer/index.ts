import { addInteraction } from "./interactions";
import { parseGraph } from "./parseGraph";
import { State, Vector } from "./types";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
export const ctx = canvas.getContext("2d")!;
if (!ctx) throw new Error("No context");

export function resize() {
  const changeX = ctx.canvas.width - document.body.clientWidth;
  const changeY = ctx.canvas.height - document.body.clientHeight;

  ctx.translate(state.canvasOrigin.x, state.canvasOrigin.y);
  ctx.canvas.width = document.body.clientWidth;
  ctx.canvas.height = document.body.clientHeight;

  state.canvasOrigin.x -= changeX / state.scale - changeX / state.scale;
  state.canvasOrigin.y -= changeY / state.scale - changeY / state.scale;

  ctx.scale(state.scale, state.scale);
  ctx.translate(-state.canvasOrigin.x, -state.canvasOrigin.y);
}

async function setup() {
  await parseGraph();
  addInteraction(canvas);
  resize();
  draw();
}

export const state: State = {
  lastClick: { x: 0, y: 0 },
  dragstart: { x: 0, y: 0 },
  dragging: false,
  width: canvas.width,
  height: canvas.height,
  zoomIntensity: 0.1,
  zoomMax: 3,
  zoomMin: 0.2,
  canvasOrigin: { x: 0, y: 0 },
  scale: 1,
  dragTimeout: null,
  draggingTimeout: false,
};

export const Mouse = {
  x: 0,
  y: 0,
  get canvasPosition() {
    return {
      x: this.x / state.scale + state.canvasOrigin.x,
      y: this.y / state.scale + state.canvasOrigin.y,
    };
  },
};

export const functionPositions: Record<string, { start: Vector; end: Vector }> =
  {};

function draw() {
  const visibleWidth = ctx.canvas.width / state.scale;
  const visibleHeight = ctx.canvas.height / state.scale;
  ctx.clearRect(
    state.canvasOrigin.x,
    state.canvasOrigin.y,
    visibleWidth,
    visibleHeight,
  );
  drawFile("main", ["Test", "Nesting"], { x: 120, y: 430 });
  requestAnimationFrame(() => draw());
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
    ctx.lineWidth = 2;
    ctx.fillRect(position.x, position.y, 100, 25 + 25 * functions.length + 5);
    ctx.strokeRect(position.x, position.y, 100, 25 + 25 * functions.length + 5);
    ctx.fillStyle = "#f2f2f2";
    ctx.fillText(fileName, position.x + 5, position.y + 17.5, 90);
    functions.forEach((functionName, i) => {
      drawFunction(
        functionName,
        functionName,
        { x: position.x + 5, y: position.y + 25 * (i + 1) },
        90,
        25,
      );
    });
  });
}

function drawFunction(
  functionId: string,
  functionName: string,
  position: Vector,
  width: number,
  height: number,
) {
  containedStyles(() => {
    ctx.fillStyle = "#f2f2f2";
    ctx.fillText(functionName, position.x, position.y + height / 2, 90);
  });
  functionPositions[functionId] = {
    start: position,
    end: { x: position.x + width, y: position.y + height },
  };
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

setup();
