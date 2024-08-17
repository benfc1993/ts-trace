import { ctx, state } from '..'

export function handleZoom(event: WheelEvent) {
  const { canvas } = ctx
  event.preventDefault()
  const mousex = event.pageX - canvas.offsetLeft
  const mousey = event.pageY - canvas.offsetTop
  const wheel = -event.deltaY / 100

  const zoom = Math.exp(wheel * state.zoomIntensity)

  if (state.scale * zoom > state.zoomMax || state.scale * zoom < state.zoomMin)
    return

  ctx.translate(state.canvasOrigin.x, state.canvasOrigin.y)

  state.canvasOrigin.x -= mousex / (state.scale * zoom) - mousex / state.scale
  state.canvasOrigin.y -= mousey / (state.scale * zoom) - mousey / state.scale

  ctx.scale(zoom, zoom)
  ctx.translate(-state.canvasOrigin.x, -state.canvasOrigin.y)

  state.scale *= zoom
}
