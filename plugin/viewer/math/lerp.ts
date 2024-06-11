export function lerp(min: number, max: number, t: number) {
  return (max - min) * t + min
}
