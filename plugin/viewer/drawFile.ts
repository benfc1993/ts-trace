import { containedStyles, ctx } from ".";
import { Vector } from "./types";

export const NODE_LINE_HEIGHT = 25;
export const NODE_BORDER_WIDTH = 2;
export const NODE_WIDTH = 200;
export const NODE_BOX_WIDTH = NODE_WIDTH + NODE_BORDER_WIDTH;
export const NODE_PADDING = 5;
export const NODE_SPACING = NODE_WIDTH * 2;

let hoveredFunction: string | null = null;
export function setHoveredFunction(connectionId: string | null) {
  hoveredFunction = connectionId;
}

export function drawFile(
  fileName: string,
  functions: string[],
  position: Vector,
) {
  const NODE_PADDING = 5;
  const adjustedFileName = fileName.includes("node_modules")
    ? fileName.split("/").slice(1, 3).join("/")
    : fileName;
  containedStyles(() => {
    ctx.fillStyle = "#555";
    ctx.strokeStyle = "#f2f2f2";
    ctx.lineWidth = NODE_BORDER_WIDTH;
    ctx.fillRect(
      position.x,
      position.y,
      NODE_WIDTH,
      NODE_LINE_HEIGHT + NODE_LINE_HEIGHT * functions.length,
    );
    ctx.strokeRect(
      position.x,
      position.y,
      NODE_WIDTH,
      NODE_LINE_HEIGHT + NODE_LINE_HEIGHT * functions.length,
    );
    ctx.fillStyle = "#f2f2f2";
    ctx.font = "12px roboto-mono";
    ctx.fillText(
      adjustedFileName,
      position.x + NODE_PADDING,
      position.y + NODE_LINE_HEIGHT / 2 + NODE_PADDING,
      NODE_WIDTH - NODE_PADDING * 2,
    );
    functions.forEach((functionName, i) => {
      drawFunction(
        `${fileName}#${functionName}`,
        functionName,
        { x: position.x, y: position.y + NODE_LINE_HEIGHT * (i + 1) },
        NODE_WIDTH,
        NODE_LINE_HEIGHT,
      );
    });
  });
}

function drawFunction(
  connectionId: string,
  functionName: string,
  position: Vector,
  width: number,
  height: number,
) {
  const radius = 3;
  containedStyles(() => {
    ctx.fillStyle = connectionId === hoveredFunction ? "#999999" : "#00000000";
    ctx.fillRect(position.x + 1, position.y, width - 2, height);
    ctx.fillStyle = "#f2f2f2";
    ctx.fillText(
      functionName,
      position.x + NODE_PADDING * 2,
      position.y + height / 2 + 5,
      width - NODE_PADDING * 2,
    );
    ctx.beginPath();
    ctx.ellipse(
      position.x + width,
      position.y + height / 2,
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
      position.x,
      position.y + height / 2,
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
