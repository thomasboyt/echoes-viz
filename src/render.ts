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

  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i += 1) {
    const cur = points[i];
    const next = points[i + 1];
    const xc = (cur[0] + next[0]) / 2;
    const yc = (cur[1] + next[1]) / 2;

    // INTERPOLATE FROM xc to cur[0] and xy to cur[1]
    const ix = cur[0] + (xc - cur[0]) * interp;
    const iy = cur[1] + (yc - cur[1]) * interp;

    ctx.quadraticCurveTo(cur[0], cur[1], ix, iy);
  }

  const last = points[points.length - 1];
  ctx.quadraticCurveTo(last[0], last[1], points[0][0], points[0][1]);
}
