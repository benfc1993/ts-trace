import { addInteraction } from "./interactions";
import { GraphNodes, parseGraph } from "./parseGraph";
import { State, Vector } from "./types";

export const NODE_LINE_HEIGHT = 25;
export const NODE_WIDTH = 100;
export const NODE_SPACING = NODE_WIDTH * 2;
const lineColor = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`;
const highlightColor = "red";

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

let nodes: GraphNodes = {};
const connectionLines: { connection: string; start: Vector; end: Vector }[] =
  [];
export const higlightedConnections: Set<string> = new Set();

async function setup() {
  nodes = await parseGraph();
  addInteraction(canvas);
  resize();
  createFunctionPositions();
  createConnections();
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

function createFunctionPositions() {
  Object.entries(nodes).forEach(([file, node]) => {
    Object.keys(node.functions).forEach((functionName, idx) => {
      const functionId = file + "#" + functionName;
      const height = NODE_LINE_HEIGHT * (idx + 1);
      functionPositions[functionId] = {
        start: {
          x: node.position.x,
          y: node.position.y + height,
        },
        end: {
          x: node.position.x + NODE_WIDTH,
          y: node.position.y + height + NODE_LINE_HEIGHT,
        },
      };
    });
  });
}

function createConnections() {
  Object.entries(nodes).forEach(([filePath, node]) => {
    Object.entries(node.functions).forEach(([functionName, connections]) => {
      const functionPosition = functionPositions[filePath + "#" + functionName];
      connections.forEach((connection) => {
        const externalFunctionPosition =
          functionPositions[connection.connectionId];

        connectionLines.push({
          connection:
            filePath + "#" + functionName + "-" + connection.connectionId,
          start: {
            x: functionPosition.end.x,
            y: functionPosition.start.y + NODE_LINE_HEIGHT / 2 - 2.5,
          },
          end: {
            x: externalFunctionPosition.start.x,
            y: externalFunctionPosition.start.y + NODE_LINE_HEIGHT / 2 - 2.5,
          },
        });
      });
    });
  });
}

function draw() {
  const visibleWidth = ctx.canvas.width / state.scale;
  const visibleHeight = ctx.canvas.height / state.scale;
  ctx.clearRect(
    state.canvasOrigin.x,
    state.canvasOrigin.y,
    visibleWidth,
    visibleHeight,
  );
  Object.entries(nodes).forEach(([file, node]) => {
    drawFile(file, Object.keys(node.functions), node.position);
  });

  connectionLines.forEach(({ connection, start, end }) => {
    containedStyles(() => {
      ctx.strokeStyle = higlightedConnections.has(connection)
        ? highlightColor
        : lineColor;
      drawPath(start, end);
    });
  });

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
  const padding = 5;
  const adjustedFileName = fileName.includes("node_modules")
    ? fileName.split("/").slice(1, 3).join("/")
    : fileName;
  containedStyles(() => {
    ctx.fillStyle = "#555";
    ctx.strokeStyle = "#f2f2f2";
    ctx.lineWidth = 2;
    ctx.fillRect(
      position.x,
      position.y,
      NODE_WIDTH,
      NODE_LINE_HEIGHT + NODE_LINE_HEIGHT * functions.length + padding,
    );
    ctx.strokeRect(
      position.x,
      position.y,
      NODE_WIDTH,
      NODE_LINE_HEIGHT + NODE_LINE_HEIGHT * functions.length + padding,
    );
    ctx.fillStyle = "#f2f2f2";
    ctx.fillText(
      adjustedFileName,
      position.x + padding,
      position.y + NODE_LINE_HEIGHT / 2 + padding,
      NODE_WIDTH - padding * 2,
    );
    functions.forEach((functionName, i) => {
      drawFunction(
        functionName,
        { x: position.x + padding, y: position.y + NODE_LINE_HEIGHT * (i + 1) },
        NODE_WIDTH - padding * 2,
        NODE_LINE_HEIGHT,
      );
    });
  });
}

function drawFunction(
  functionName: string,
  position: Vector,
  width: number,
  height: number,
) {
  const radius = 3;
  containedStyles(() => {
    ctx.fillStyle = "#f2f2f2";
    ctx.fillText(functionName, position.x, position.y + height / 2, width);
    ctx.beginPath();
    ctx.ellipse(
      position.x + width + 5,
      position.y + height / 2 - 2.5,
      radius,
      radius,
      0,
      0,
      2 * Math.PI,
    );
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      position.x - 5,
      position.y + height / 2 - 2.5,
      radius,
      radius,
      0,
      0,
      2 * Math.PI,
    );
    ctx.closePath();
    ctx.fill();
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

setup();
