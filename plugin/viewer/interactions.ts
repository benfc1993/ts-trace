import { Mouse, ctx, resize, state } from ".";
import { clickOnFunction } from "./clickOnFunction";
import { Vector } from "./types";

window.addEventListener("resize", resize);

export function addInteraction(canvas: HTMLCanvasElement) {
  canvas.addEventListener("click", (event) => {
    if (clickOnFunction(event)) return;
    console.log("unhandled");
  });

  canvas.addEventListener("mousedown", (event) => {
    state.dragging = true;
    state.dragstart.x = event.pageX - canvas.offsetLeft;
    state.dragstart.y = event.pageY - canvas.offsetTop;
    state.lastClick.x = state.dragstart.x;
    state.lastClick.y = state.dragstart.y;
  });

  canvas.addEventListener("mousemove", (event) => {
    Mouse.x = event.pageX - canvas.offsetLeft;
    Mouse.y = event.pageY - canvas.offsetTop;

    if (!state.dragging) return;

    const dragend: Vector = {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop,
    };
    const mouseMovedX = (dragend.x - state.dragstart.x) / state.scale;
    const mouseMovedY = (dragend.y - state.dragstart.y) / state.scale;
    ctx.translate(mouseMovedX, mouseMovedY);
    state.canvasOrigin.x -= mouseMovedX;
    state.canvasOrigin.y -= mouseMovedY;
    state.dragstart.x = dragend.x;
    state.dragstart.y = dragend.y;
  });

  canvas.addEventListener("mouseup", completeDragging);

  canvas.addEventListener("mouseout", completeDragging);

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const mousex = event.pageX - canvas.offsetLeft;
    const mousey = event.pageY - canvas.offsetTop;
    const wheel = -event.deltaY / 100;

    const zoom = Math.exp(wheel * state.zoomIntensity);

    if (
      state.scale * zoom > state.zoomMax ||
      state.scale * zoom < state.zoomMin
    )
      return;

    ctx.translate(state.canvasOrigin.x, state.canvasOrigin.y);

    state.canvasOrigin.x -=
      mousex / (state.scale * zoom) - mousex / state.scale;
    state.canvasOrigin.y -=
      mousey / (state.scale * zoom) - mousey / state.scale;

    ctx.scale(zoom, zoom);
    ctx.translate(-state.canvasOrigin.x, -state.canvasOrigin.y);

    state.scale *= zoom;
  });
}

function completeDragging() {
  state.dragging = false;
  state.dragstart.x = 0;
  state.dragstart.y = 0;
  state.draggingTimeout = true;
  if (state.dragTimeout) clearTimeout(state.dragTimeout);
  state.dragTimeout = setTimeout(() => (state.draggingTimeout = false), 50);
}
