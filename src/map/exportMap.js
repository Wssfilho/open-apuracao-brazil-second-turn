import { MAP_THEMES } from './mapTheme.js';

/** Flattens the map canvas and its HTML state labels into a PNG download. */
export function exportMap({ frame, theme, filename }) {
  if (frame?.querySelector('.senate-chamber')) {
    exportSenate(frame, theme);
    return;
  }
  const canvas = frame?.querySelector('canvas');
  if (!canvas) return;

  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext('2d');
  ctx.fillStyle = MAP_THEMES[theme].background;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0);

  const canvasBounds = canvas.getBoundingClientRect();
  const scale = out.width / canvasBounds.width;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const label of frame.querySelectorAll('.state-labels button')) {
    const bounds = label.getBoundingClientRect(), style = getComputedStyle(label);
    const x = (bounds.left - canvasBounds.left) * scale, y = (bounds.top - canvasBounds.top) * scale;
    const width = bounds.width * scale, height = bounds.height * scale;
    if (label.classList.contains('state-callout')) {
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(x, y, width, height);
    }
    ctx.fillStyle = style.color;
    ctx.font = `${style.fontWeight} ${parseFloat(style.fontSize) * scale}px Geist, sans-serif`;
    const text = [...label.children].map(part => part.textContent).join(' ') || label.textContent;
    ctx.fillText(text, x + width / 2, y + height / 2);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = MAP_THEMES[theme].focus;
  ctx.font = `500 ${Math.max(12, out.width / 45)}px Geist, sans-serif`;
  ctx.fillText('DADOS SIMULADOS', 16, out.height - 16);

  out.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

function exportSenate(frame, theme) {
  const chamber = frame.querySelector('.senate-chamber');
  const bounds = chamber.getBoundingClientRect();
  const out = document.createElement('canvas');
  out.width = 1200;
  out.height = 820;
  const ctx = out.getContext('2d');
  ctx.fillStyle = MAP_THEMES[theme].background;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.fillStyle = MAP_THEMES[theme].focus;
  ctx.font = '500 30px Geist, sans-serif';
  ctx.fillText('Senado · composição ilustrativa', 40, 55);
  const scale = 1120 / bounds.width;
  for (const seat of chamber.querySelectorAll('button')) {
    const box = seat.getBoundingClientRect();
    const style = getComputedStyle(seat);
    const x = 40 + (box.left - bounds.left) * scale;
    const y = 95 + (box.top - bounds.top) * scale;
    ctx.fillStyle = style.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(x, y, box.width * scale, box.height * scale, 8);
    ctx.fill();
    ctx.fillStyle = style.color;
    ctx.font = '600 16px Geist, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(seat.textContent, x + box.width * scale / 2, y + box.height * scale / 2 + 6);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = MAP_THEMES[theme].focus;
  ctx.font = '400 19px Geist, sans-serif';
  const legend = [...frame.querySelectorAll('.senate-legend li')].map(item => item.textContent.trim()).join(' · ');
  ctx.fillText(legend, 40, 740);
  ctx.fillText('DADOS SIMULADOS · 54 em disputa · 27 com mandato em curso', 40, 790);
  out.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'senado-cadeiras-simulado.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
