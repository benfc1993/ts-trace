import { Mouse, ctx, functionPositions, state } from ".";

export function clickOnFunction(event: MouseEvent): boolean {
  if (
    state.lastClick.x !== event.pageX - ctx.canvas.offsetLeft &&
    state.lastClick.y !== event.pageY - ctx.canvas.offsetTop
  )
    return false;

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
      console.log(functionName);
      return true;
    }
  }

  return false;
}
