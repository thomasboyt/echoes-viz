import {
  initRadius,
} from './constants';

function getNSidedPoints(r: number, n: number): number[][] {
  return _.range(0, n+1).map((i) => {
    return [
      Math.round(r * Math.cos(2 * Math.PI * i/n)),
      Math.round(r * Math.sin(2 * Math.PI * i/n)),
    ];
  });
}

function getInterp(a: number, b: number, i: number) {
  return a + (b  - a) * i;
}

// 0 = hexagon, 1 = rectangle
export function hexagonToRectangle(ctx: CanvasRenderingContext2D, interp: number) {
  // idea:
  // create hexagon points
  // take two opposite points
  // move them towards each other until you have a rectangle

  const r = initRadius;

  const points = getNSidedPoints(initRadius, 6);

  // todo: oh god how does this even works
  const destA  = [
    Math.round(r/2 * Math.cos(2 * Math.PI * 1/6)),
    Math.round(r/2 * Math.sin(2 * Math.PI * 1/6)),
  ];
  const destB = [
    Math.round(r/2 * Math.cos(2 * Math.PI * 4/6)),
    Math.round(r/2 * Math.sin(2 * Math.PI * 4/6)),
  ];

  points[1][0] = getInterp(points[1][0], destA[0], interp);
  points[1][1] = getInterp(points[1][1], destA[1], interp);
  points[4][0] = getInterp(points[4][0], destB[0], interp);
  points[4][1] = getInterp(points[4][1], destB[1], interp);

  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
}

// 0 = hexagon, 1 = circle
export function hexagonToCircle(ctx: CanvasRenderingContext2D, interp: number) {
  const points = getNSidedPoints(initRadius, 6);
  const sweep = Math.PI * 2 / 6;

  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 0; i < points.length - 1; i += 1) {
    const cur = points[i];
    const next = points[i + 1];

    // TODO: How does this work :(
    // Adapted from http://stackoverflow.com/a/26948225
    const sAngle = sweep * i;
    const eAngle = sweep * (i + 1);
    const x1 = initRadius * Math.cos((eAngle + sAngle) / 2);
    const y1 = initRadius * Math.sin((eAngle + sAngle) / 2);
    const fullCpx = 2 * x1 - cur[0] / 2 - next[0] / 2;
    const fullCpy = 2 * y1 - cur[1] / 2 - next[1] / 2;

    const midX = (cur[0] + next[0]) / 2;
    const midY = (cur[1] + next[1]) / 2;

    const interpCpx = getInterp(midX, fullCpx, interp);
    const interpCpy = getInterp(midY, fullCpy, interp);

    ctx.quadraticCurveTo(interpCpx, interpCpy, next[0], next[1]);
  }
}
