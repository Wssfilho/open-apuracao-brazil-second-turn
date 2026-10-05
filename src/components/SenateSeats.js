import { useMemo, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { buildSenateSeats, layoutSenateSeats, SENATE_GROUPS } from '../data/senate.js';
import { STATES } from '../data/mocks.js';
import { percent } from '../lib/format.js';

export function SenateScoreboard({ scope, result }) {
  return html`<section class="senate-scoreboard" aria-label=${`Senado: visão geral em ${scope}`}>
    <div><h2>Senado <span>em ${scope}</span></h2><p>Renovação de dois terços · simulação de 2026</p></div>
    <dl><div><dt>Total de cadeiras</dt><dd>81</dd></div><div><dt>Em disputa</dt><dd>54</dd></div><div><dt>Mandato em curso</dt><dd>27</dd></div></dl>
    <p class="counting">${percent(result.completion)} das seções apuradas</p>
  </section>`;
}

export function SenateSeats({ states, uf, onState, onMap }) {
  const [feedback, setFeedback] = useState({ id: null, revision: 0 });
  const selectSeat = seat => {
    setFeedback(previous => ({ id: seat.id, revision: previous.revision + 1 }));
    if (seat.uf !== uf) onState(seat.uf);
  };
  const seats = useMemo(() => buildSenateSeats(states), [states]);
  const layout = useMemo(() => layoutSenateSeats(seats), [seats]);
  const totals = Object.fromEntries(Object.keys(SENATE_GROUPS).map(group => [group, seats.filter(seat => seat.group === group).length]));
  const selected = seats.filter(seat => seat.uf === uf);
  return html`<div class="senate-view">
    <div class="senate-intro"><span class="sim-chip">Composição ilustrativa</span><h3>Uma cadeira, uma representação</h3>
      <p>81 cadeiras · 54 em disputa em 2026 · 27 com mandato em curso</p></div>
    <div class="senate-chamber" role="group" aria-label="81 cadeiras do Senado. Selecione uma cadeira para abrir seu estado.">
      ${layout.map((seat, index) => html`<button key=${seat.id}
        class=${`senate-seat senate-${seat.group}${uf && uf !== seat.uf ? ' is-muted' : ''}`}
        style=${{ left: `${seat.x / 6}%`, top: `${seat.y / 3.2}%`, '--seat-delay': `${index * 5}ms` }}
        aria-pressed=${seat.uf === uf} aria-label=${`${STATES[seat.uf][0]}, cadeira ${Number(seat.id.split('-')[1]) + 1}: ${SENATE_GROUPS[seat.group]}`}
        title=${`${seat.uf} · ${SENATE_GROUPS[seat.group]}`} onClick=${() => selectSeat(seat)}>
        <span>${seat.uf}</span>${feedback.id === seat.id && html`<i key=${feedback.revision} class="seat-click-pulse" aria-hidden="true"></i>`}</button>`)}
      <div class="senate-center" aria-live="polite"><strong>${uf || '81'}</strong><span>${uf ? '3 cadeiras selecionadas' : 'cadeiras'}</span></div>
    </div>
    <ul class="senate-legend" aria-label="Distribuição ilustrativa de cadeiras">
      ${Object.entries(SENATE_GROUPS).map(([group, label]) => html`<li key=${group}><i class=${`senate-${group}`}></i><span>${label}</span><b>${totals[group]}</b></li>`)}
    </ul>
    <div class=${'senate-detail' + (uf ? ' has-selection' : '')} aria-live="polite">
      ${uf ? html`<div key=${uf} class="senate-detail-content"><strong>${STATES[uf][0]} · 3 cadeiras</strong><p>${selected.filter(s => s.group === 'blue').length} azul · ${selected.filter(s => s.group === 'red').length} vermelho · 1 mandato em curso${selected.some(s => s.group === 'pending') ? ' · 2 sem apuração' : ''}</p>
        <p>${percent(states[uf].completion)} das seções apuradas</p></div><div class="senate-detail-actions"><button class="button" onClick=${onMap}>Ver mapa do estado</button><button class="button senate-clear" onClick=${() => onState(null)}>Limpar seleção</button></div>`
        : html`<div><strong>Explore a composição por estado</strong><p>Clique ou use Tab e Enter em uma cadeira para selecionar o estado.</p></div>`}
    </div>
    <p class="senate-note">Simulação: as cores ilustram a tendência dos votos do estado, sem representar candidatos, partidos ou eleitos. Acima de 56% de votos azuis, duas cadeiras azuis; abaixo de 38%, duas vermelhas; entre essas faixas, uma de cada cor. As 27 cadeiras em curso não têm filiação informada.</p>
  </div>`;
}
