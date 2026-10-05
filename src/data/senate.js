import { STATES } from './mocks.js';

export const SENATE_GROUPS = {
  blue: 'Cenário azul', red: 'Cenário vermelho', pending: 'Sem apuração', retained: 'Mandato em curso',
};

/** Illustrative groups, not candidate rankings: the mock feed has no Senate ticket data. */
export function buildSenateSeats(states) {
  return Object.keys(STATES).sort().flatMap(uf => {
    const result = states[uf];
    const counted = result?.valid > 0 && result.completion > 0;
    const blueShare = counted ? result.votes[0] / result.valid : 0;
    const groups = !counted ? ['pending', 'pending']
      : blueShare > .56 ? ['blue', 'blue']
        : blueShare < .38 ? ['red', 'red'] : ['blue', 'red'];
    return [...groups, 'retained'].map((group, index) => ({ id: `${uf}-${index}`, uf, group, contested: index < 2 }));
  });
}

/** Five concentric rows, with seats sorted by colour for a readable hemicycle. */
export function layoutSenateSeats(seats) {
  const order = ['blue', 'pending', 'retained', 'red'];
  const sorted = [...seats].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.id.localeCompare(b.id));
  const positions = [11, 14, 16, 19, 21].flatMap((count, row) => {
    const radius = 112 + row * 36;
    return Array.from({ length: count }, (_, index) => {
      const angle = Math.PI - index * Math.PI / (count - 1);
      return { angle, x: 300 + Math.cos(angle) * radius, y: 284 - Math.sin(angle) * radius };
    });
  });
  return positions.sort((a, b) => b.angle - a.angle).map(({ x, y }, index) => ({ ...sorted[index], x, y }));
}
