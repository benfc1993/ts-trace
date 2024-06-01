import { NODE_LINE_HEIGHT, NODE_WIDTH, drawFile } from "./drawFile";
import { addInteraction } from "./interactions";
import { GraphNodes, parseGraph } from "./parseGraph";
import { State, Vector } from "./types";

const lineColor = "#ffffff";
const lineUnfocusedColor = "#3d3d3d";

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
  let font = new FontFace("roboto-mono", "url(fonts/roboto-mono.ttf)", {
    style: "normal",
    weight: "400",
  });
  await font.load().then((font) => document.fonts.add(font));

  draw();
}

export const state: State = {
  lastClick: { x: 0, y: 0 },
  dragstart: { x: 0, y: 0 },
  dragging: false,
  draggingBlocked: false,
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
            y: functionPosition.start.y + NODE_LINE_HEIGHT / 2,
          },
          end: {
            x: externalFunctionPosition.start.x,
            y: externalFunctionPosition.start.y + NODE_LINE_HEIGHT / 2,
          },
        });
      });
    });
  });
}

function draw() {
  const visibleWidth = ctx.canvas.width / state.scale;
  const visibleHeight = ctx.canvas.height / state.scale;
  ctx.font = "11px roboto-mono";
  ctx.clearRect(
    state.canvasOrigin.x,
    state.canvasOrigin.y,
    visibleWidth,
    visibleHeight,
  );
  containedStyles(() => {
    ctx.fillStyle = "#222";
    ctx.fillRect(
      state.canvasOrigin.x,
      state.canvasOrigin.y,
      visibleWidth,
      visibleHeight,
    );
  });
  Object.entries(nodes).forEach(([file, node]) => {
    drawFile(file, Object.keys(node.functions), node.position);
  });

  const defered: typeof connectionLines = [];

  for (const { connection, start, end } of connectionLines) {
    if (higlightedConnections.has(connection)) {
      defered.push({ connection, start, end });
      continue;
    }
    containedStyles(() => {
      ctx.strokeStyle =
        higlightedConnections.size === 0 ? lineColor : lineUnfocusedColor;
      drawPath(start, end);
    });
  }

  defered.forEach(({ start, end }) => {
    containedStyles(() => {
      ctx.strokeStyle = lineColor;
      drawPath(start, end);
    });
  });

  requestAnimationFrame(() => draw());
}

function drawPath(from: Vector, to: Vector) {
  containedStyles(() => {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.lineCap = "round";
  });
}

export function containedStyles(func: () => void) {
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
