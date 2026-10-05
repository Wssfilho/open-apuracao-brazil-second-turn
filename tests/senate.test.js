import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSenateSeats, layoutSenateSeats } from '../src/data/senate.js';
import { STATES } from '../src/data/mocks.js';

test('Senate preserves 81 seats, three per state and 54 contested seats', () => {
  const seats = buildSenateSeats({});
  assert.equal(seats.length, 81);
  assert.equal(new Set(seats.map(seat => seat.id)).size, 81);
  assert.equal(seats.filter(seat => seat.contested).length, 54);
  for (const uf of Object.keys(STATES)) {
    assert.equal(seats.filter(seat => seat.uf === uf).length, 3);
    assert.equal(seats.filter(seat => seat.uf === uf && seat.group === 'retained').length, 1);
  }
  assert.equal(seats.filter(seat => seat.group === 'pending').length, 54);
});

test('illustrative groups follow state votes without assigning uncounted seats', () => {
  const result = (blue, completion = .5) => ({ valid: 100, votes: [blue, 100 - blue, 0], completion });
  const seats = buildSenateSeats({ SP: result(65), BA: result(25), MG: result(48), AC: result(65, 0) });
  const groups = uf => seats.filter(seat => seat.uf === uf && seat.contested).map(seat => seat.group);
  assert.deepEqual(groups('SP'), ['blue', 'blue']);
  assert.deepEqual(groups('BA'), ['red', 'red']);
  assert.deepEqual(groups('MG'), ['blue', 'red']);
  assert.deepEqual(groups('AC'), ['pending', 'pending']);
  assert.deepEqual(groups('RO'), ['pending', 'pending']);
});

test('hemicycle places every seat once, within bounds and without overlap', () => {
  const seats = buildSenateSeats({});
  const layout = layoutSenateSeats(seats);
  assert.deepEqual(new Set(layout.map(seat => seat.id)), new Set(seats.map(seat => seat.id)));
  for (const seat of layout) {
    assert.ok(seat.x >= 26 && seat.x <= 574 && seat.y >= 26 && seat.y <= 294);
    for (const other of layout) {
      if (seat.id !== other.id) assert.ok(Math.hypot(seat.x - other.x, seat.y - other.y) > 27);
    }
  }
});
