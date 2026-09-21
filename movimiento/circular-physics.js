export const TAU = 2 * Math.PI;

export function circularState({ radius, omega0, alpha, theta0 = 0 }, time) {
  const theta = theta0 + omega0 * time + 0.5 * alpha * time * time;
  const omega = omega0 + alpha * time;
  const tangentialSpeed = Math.abs(radius * omega);
  const centripetalAcceleration = radius * omega * omega;
  const tangentialAcceleration = radius * alpha;
  return {
    theta,
    omega,
    tangentialSpeed,
    centripetalAcceleration,
    tangentialAcceleration,
    totalAcceleration: Math.hypot(centripetalAcceleration, tangentialAcceleration),
    turns: (theta - theta0) / TAU,
  };
}

export function period(omega) {
  return omega === 0 ? Infinity : TAU / Math.abs(omega);
}

export function angularMeetings(a, b, duration) {
  const A = 0.5 * (a.alpha - b.alpha);
  const B = a.omega0 - b.omega0;
  const C = a.theta0 - b.theta0;
  const values = [C, A * duration * duration + B * duration + C];
  if (Math.abs(A) > 1e-12) {
    const vertex = -B / (2 * A);
    if (vertex > 0 && vertex < duration) values.push(A * vertex * vertex + B * vertex + C);
  }
  const kMin = Math.ceil(Math.min(...values) / TAU - 1e-10);
  const kMax = Math.floor(Math.max(...values) / TAU + 1e-10);
  const roots = [];
  for (let k = kMin; k <= kMax; k++) {
    const c = C - k * TAU;
    if (Math.abs(A) < 1e-12) {
      if (Math.abs(B) < 1e-12) {
        if (Math.abs(c) < 1e-10) return { continuous: true, times: [0] };
      } else roots.push(-c / B);
    } else {
      const disc = B * B - 4 * A * c;
      if (disc >= -1e-10) {
        const root = Math.sqrt(Math.max(0, disc));
        roots.push((-B - root) / (2 * A), (-B + root) / (2 * A));
      }
    }
  }
  const times = roots.filter(t => t >= -1e-9 && t <= duration + 1e-9)
    .map(t => Math.max(0, Math.min(duration, t))).sort((x, y) => x - y)
    .filter((t, i, arr) => i === 0 || Math.abs(t - arr[i - 1]) > 1e-6);
  return { continuous: false, times };
}
