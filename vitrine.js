// Vitrine do início: os três selos do hero mostram trabalho real (relatório de anúncio,
// portfólio de fotos e vídeos, site de cliente) e ficam interativos quando o selo amplia.
// Os dados e a mídia moram em "Imagens/Vitrine do hero - interna/", fora do GitHub até
// os clientes autorizarem. Sem eles, nada muda: os selos seguem com as fotos de banco.
(() => {
  const PASTA = 'Imagens/Vitrine%20do%20hero%20-%20interna/';
  const reais = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const inteiro = (n) => n.toLocaleString('pt-BR');

  const el = (tag, classe, texto) => {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  };

  // dica de clique: etiqueta postal "Clique aqui" com um cursor desenhado em SVG que faz o gesto de clicar
  // (desce, aperta e solta um anel da ponta). É só decoração (o selo inteiro já é clicável), por isso fica
  // escondida dos leitores de tela. Aparência e movimento: estilo/vitrine-site.css.
  const dicaDeClique = () => {
    const NS = 'http://www.w3.org/2000/svg';
    const svgEl = (tag, classe, attrs) => {
      const e = document.createElementNS(NS, tag);
      e.setAttribute('class', classe);
      Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
      return e;
    };
    const dica = el('span', 'dica-clique');
    dica.setAttribute('aria-hidden', 'true');
    const canhoto = el('span', 'dica-clique-canhoto');
    const svg = svgEl('svg', 'dica-clique-icone', { viewBox: '0 0 28 28', focusable: 'false' });
    // o anel nasce onde a ponta do cursor aperta (2 px abaixo do repouso)
    svg.append(
      svgEl('circle', 'dica-clique-anel', { cx: '8', cy: '8', r: '6' }),
      svgEl('path', 'dica-clique-cursor', { d: 'M8 6v15l4-3.5 2.8 6.5 2.8-1.2-2.8-6.4H20z' })
    );
    canhoto.append(svg);
    dica.append(canhoto, el('span', 'dica-clique-texto', 'Clique aqui'));
    return dica;
  };

  window.VitrineUtil = { el, reais, inteiro };
  window.VitrinePartes = window.VitrinePartes || {};

  // ---------- liga tudo quando os dados existem ----------
  const iniciar = (d) => {
    const pasta = d.pasta || PASTA;
    const P = window.VitrinePartes;
    const montar = {};
    Object.keys(P).forEach(tipo => {
      montar[tipo] = { previa: () => P[tipo].previa(d[tipo], pasta), cheia: () => P[tipo].cheia(d[tipo], pasta) };
    });

    document.querySelectorAll('.selo-imagem[data-vitrine]').forEach(caixa => {
      const tipo = caixa.dataset.vitrine;
      if (!montar[tipo] || !d[tipo]) return;
      caixa.classList.add('com-vitrine');
      caixa.replaceChildren(montar[tipo].previa());
      // a dica vai depois da caixa, na face do selo: a caixa corta o que passa da borda (overflow: hidden)
      // e a etiqueta sobrepõe a moldura e o picote. Na janela ampliada o CSS a esconde (.modal-conteudo).
      if (!caixa.parentElement.querySelector(':scope > .dica-clique')) caixa.after(dicaDeClique());
    });

    const origem = document.querySelector('[data-vitrine-origem]');
    if (origem && d.origem) {
      origem.textContent = d.origem;
      origem.hidden = false;
    }

    // na janela do selo, a prévia vira a versão interativa
    document.addEventListener('selo:aberto', (e) => {
      const caixa = e.detail.copia.querySelector('.selo-imagem[data-vitrine].com-vitrine');
      if (!caixa) return;
      const tipo = caixa.dataset.vitrine;
      caixa.classList.add('vitrine-cheia');
      caixa.replaceChildren(montar[tipo].cheia());
      e.detail.conteudo.classList.add('modal-vitrine');
      e.detail.conteudo.scrollTop = 0;
      // com a janela fechada o zero não pega; repete depois do showModal para abrir sempre no topo
      requestAnimationFrame(() => { e.detail.conteudo.scrollTop = 0; });
    });

    // ao fechar, para vídeo e site (a janela só esconde o conteúdo)
    const modal = document.getElementById('modalSelo');
    if (modal) {
      modal.addEventListener('close', () => {
        modal.querySelectorAll('video').forEach(v => v.pause());
        modal.querySelectorAll('iframe').forEach(f => f.remove());
        modal.querySelector('.modal-conteudo')?.classList.remove('modal-vitrine');
      });
    }
  };

  // as partes (vitrine-anuncios.js, vitrine-portfolio.js, vitrine-site.js) carregam depois deste arquivo
  const comecar = () => {
    if (window.vitrineDados) { iniciar(window.vitrineDados); return; }
    const s = document.createElement('script');
    s.src = PASTA + 'vitrine-dados.js';
    s.onload = () => window.vitrineDados && iniciar(window.vitrineDados);
    document.body.append(s);
  };
  if (document.readyState !== 'loading') comecar(); else document.addEventListener('DOMContentLoaded', comecar);
})();
