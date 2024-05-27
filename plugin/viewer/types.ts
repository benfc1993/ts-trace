export type Vector = {
  x: number;
  y: number;
};

export type State = {
  lastClick: Vector;
  dragstart: Vector;
  dragging: boolean;
  draggingTimeout: boolean;
  dragTimeout: NodeJS.Timeout | null;
  width: number;
  height: number;
  zoomIntensity: number;
  zoomMax: number;
  zoomMin: number;
  scale: number;
  canvasOrigin: Vector;
};
