/* Bloco "Do primeiro contato ao resultado": trilha entre os passos.
   Desenha uma linha tracejada com curvas e uma volta entre cada selo, atrás deles.
   Mede a posição dos selos e redesenha quando a largura ou a altura da lista muda. */
(() => {
  const lista = document.getElementById('passos');
  if (!lista) return;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('trilha-passos');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const caminho = document.createElementNS(NS, 'path');
  svg.appendChild(caminho);
  // fica antes da lista (e não dentro dela), para não mudar a contagem dos selos nem a marcação da <ol>
  const moldura = lista.parentElement;
  moldura.insertBefore(svg, lista);

  // posição do selo dentro da moldura, somando os deslocamentos até chegar nela
  const posicao = (el) => {
    let x = 0, y = 0;
    for (let no = el; no && no !== moldura; no = no.offsetParent) { x += no.offsetLeft; y += no.offsetTop; }
    return { x, y };
  };

  const n = (valor) => valor.toFixed(1);
  const raio = 12;      // raio da volta
  const entrada = 10;   // quanto a linha entra por baixo do selo, para parecer que sai dele

  const desenharTrilha = () => {
    // offsetLeft e offsetTop ignoram o deslize da animação de entrada dos selos
    const caixas = [...lista.querySelectorAll(':scope > .selo')].map(selo => ({
      ...posicao(selo), l: selo.offsetWidth, a: selo.offsetHeight
    }));
    let d = '';
    for (let i = 0; i < caixas.length - 1; i++) {
      const c = caixas[i], prox = caixas[i + 1];
      const lado = i % 2 ? -1 : 1;
      const mesmaLinha = prox.x > c.x + c.l - 1 && prox.y < c.y + c.a && prox.y + prox.a > c.y;
      if (mesmaLinha) {
        // passos lado a lado: sai pela direita, faz uma volta no vão e entra pela esquerda do próximo
        const meio = (Math.max(c.y, prox.y) + Math.min(c.y + c.a, prox.y + prox.a)) / 2;
        const x1 = c.x + c.l - entrada, x2 = prox.x + entrada;
        const mx = (x1 + x2) / 2, my = meio + lado * raio;
        const y1 = my, y2 = my;   // linha reta no vão estreito, com a volta para cima ou para baixo
        const folga = (x2 - x1) / 2;
        d += `M${n(x1)},${n(y1)} C${n(x1 + folga)},${n(y1)} ${n(mx - folga)},${n(my)} ${n(mx)},${n(my)} ` +
          `a${raio},${raio} 0 1,${lado > 0 ? 0 : 1} 0,${-lado * 2 * raio} a${raio},${raio} 0 1,${lado > 0 ? 0 : 1} 0,${lado * 2 * raio} ` +
          `C${n(mx + folga)},${n(my)} ${n(x2 - folga)},${n(y2)} ${n(x2)},${n(y2)} `;
      } else {
        // passos em coluna (ou troca de fileira): sai por baixo de um lado, faz uma volta e entra por cima do outro lado
        const x1 = c.x + c.l * (lado > 0 ? .3 : .7), y1 = c.y + c.a - entrada;
        const x2 = prox.x + prox.l * (lado > 0 ? .7 : .3), y2 = prox.y + entrada;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const folga = (y2 - y1) / 2;
        const puxo = Math.min(48, Math.abs(x2 - x1) / 2);
        const sentido = x2 >= x1 ? 1 : -1;
        const base = my + raio;   // a volta começa e termina no ponto de baixo do círculo
        d += `M${n(x1)},${n(y1)} C${n(x1)},${n(y1 + folga)} ${n(mx - sentido * puxo)},${n(base)} ${n(mx)},${n(base)} ` +
          `a${raio},${raio} 0 1,${sentido > 0 ? 0 : 1} 0,${-2 * raio} a${raio},${raio} 0 1,${sentido > 0 ? 0 : 1} 0,${2 * raio} ` +
          `C${n(mx + sentido * puxo)},${n(base)} ${n(x2)},${n(y2 - folga)} ${n(x2)},${n(y2)} `;
      }
    }
    caminho.setAttribute('d', d);
  };

  let pedido = 0;
  const agendar = () => {
    cancelAnimationFrame(pedido);
    pedido = requestAnimationFrame(desenharTrilha);
  };

  desenharTrilha();
  if ('ResizeObserver' in window) {
    const observador = new ResizeObserver(agendar);
    observador.observe(lista);
    lista.querySelectorAll(':scope > .selo').forEach(selo => observador.observe(selo));
  } else {
    window.addEventListener('resize', agendar);
  }
  window.addEventListener('load', agendar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(agendar);
})();
