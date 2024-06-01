import { Mouse, ctx, functionPositions, higlightedConnections, state } from ".";
import { NODE_BORDER_WIDTH, NODE_LINE_HEIGHT, NODE_WIDTH } from "./drawFile";
import { getFunctionById } from "./getNodes";
import { nodes } from "./parseGraph";

export function clickOnFunction(event: MouseEvent): boolean {
  if (
    state.lastClick.x !== event.pageX - ctx.canvas.offsetLeft &&
    state.lastClick.y !== event.pageY - ctx.canvas.offsetTop
  )
    return false;

  const functionName = getHoveredFunction();
  if (functionName) {
    higlightedConnections.clear();

    addConnectionHighlights(functionName);

    return true;
  }

  return false;
}

export function getHoveredFunction(): string | null {
  const functionKeys = Object.keys(functionPositions);

  for (let i = 0; i < functionKeys.length; i++) {
    const [functionName, functionPosition] =
      Object.entries(functionPositions)[i];
    if (
      Mouse.canvasPosition.x > functionPosition.start.x &&
      Mouse.canvasPosition.x < functionPosition.end.x &&
      Mouse.canvasPosition.y > functionPosition.start.y &&
      Mouse.canvasPosition.y < functionPosition.end.y
    ) {
      return functionName;
    }
  }
  return null;
}

export function getHoveredFile() {
  const files = Object.entries(nodes);
  for (let i = 0; i < files.length; i++) {
    const [file, node] = files[i];
    if (
      Mouse.canvasPosition.y > node.position.y - NODE_BORDER_WIDTH &&
      Mouse.canvasPosition.y <
        node.position.y +
          (Object.keys(node.functions).length + 1) * NODE_LINE_HEIGHT +
          2 * NODE_BORDER_WIDTH &&
      Mouse.canvasPosition.x > node.position.x - NODE_BORDER_WIDTH &&
      Mouse.canvasPosition.x < node.position.x + NODE_WIDTH + NODE_BORDER_WIDTH
    ) {
      return file;
    }
  }
  return null;
}

function addConnectionHighlights(connectionId: string) {
  const functionConnections = getFunctionById(connectionId);
  functionConnections.forEach((functionConnection) => {
    higlightedConnections.add(
      `${connectionId}-${functionConnection.connectionId}`,
    );
    getFunctionById(functionConnection.connectionId).forEach((connection) => {
      addConnectionHighlights(connection.connectionId),
        higlightedConnections.add(
          `${functionConnection.connectionId}-${connection.connectionId}`,
        );
    });
  });
}
