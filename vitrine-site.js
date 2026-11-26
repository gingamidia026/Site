// Vitrine do início, parte do site: site da Sabrina ao vivo
// Registra a prévia (dentro do selo) e a versão cheia (no selo ampliado) em window.VitrinePartes;
// o vitrine.js liga tudo. Ajudantes comuns em window.VitrineUtil (el, reais, inteiro).
(() => {
  const { el } = window.VitrineUtil;

  // ---------- preparo da conexão: o site da cliente demora para responder, então começa antes ----------
  let conexaoPronta = false;
  let aquecido = false;

  const origemDe = (endereco) => {
    try {
      const url = new URL(endereco);
      return url.protocol === 'https:' ? url : null; // só endereço seguro
    } catch (e) {
      return null;
    }
  };

  // as mesmas regras de segurança do iframe da janela: sem enviar referência e com permissões mínimas
  const PERMISSOES = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';

  // assim que a vitrine inicia: DNS, conexão e TLS já resolvidos quando a janela abrir
  const prepararConexao = (endereco) => {
    const url = origemDe(endereco);
    if (conexaoPronta || !url) return;
    conexaoPronta = true;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url.origin;
    document.head.append(link);
  };

  // ao passar o mouse, encostar o dedo ou focar o selo: carrega o site uma vez num iframe escondido,
  // para a folha de estilo, os scripts e as fontes já estarem no cache quando a janela abrir.
  // Medido em 26/11/2026: o iframe aquecido deixou a segunda carga ~0,65 s mais rápida (3,05 s para 2,4 s);
  // um <link rel="prefetch"> do documento não ajudou (o site não manda cabeçalho de cache), por isso não é usado.
  const aquecerAoAproximar = (caixa, endereco) => {
    const url = origemDe(endereco);
    const selo = caixa.closest('[data-ampliar]');
    if (!url || !selo) return;
    const parar = new AbortController();
    const aquecer = () => {
      if (aquecido) return;
      aquecido = true;
      parar.abort();
      const escondido = el('iframe', 'site-aquecimento');
      escondido.setAttribute('aria-hidden', 'true');
      escondido.tabIndex = -1;
      escondido.title = '';
      escondido.referrerPolicy = 'no-referrer';
      escondido.setAttribute('sandbox', PERMISSOES);
      const tirar = () => escondido.remove();
      escondido.addEventListener('load', tirar, { once: true });
      setTimeout(tirar, 20000); // garantia, se o site nunca terminar de carregar
      escondido.src = url.href;
      document.body.append(escondido);
    };
    ['pointerenter', 'pointerdown', 'focus'].forEach(evento =>
      // focus não borbulha: a captura pega o foco no botão "Ver mais" dentro do selo
      selo.addEventListener(evento, aquecer, { signal: parar.signal, passive: true, capture: true }));
  };

  // ---------- prévia dentro do selo ----------
  const previaSite = (s, pasta) => {
    prepararConexao(s.endereco);
    const caixa = el('div', 'vitrine-previa previa-site');
    const barra = el('div', 'previa-site-barra');
    barra.append(el('span', 'previa-site-bolinhas'), el('span', 'previa-site-endereco', s.endereco.replace(/^https?:\/\//, '').replace(/\/$/, '')));
    const img = el('img');
    img.src = pasta + s.print;
    img.alt = s.alt;
    img.loading = 'lazy';
    caixa.append(barra, img);
    // a caixa ainda não está na página: espera o vitrine.js encaixá-la no selo
    setTimeout(() => aquecerAoAproximar(caixa, s.endereco), 0);
    return caixa;
  };

  // ---------- versão cheia: o site dentro de uma moldura de computador ou de celular ----------
  // Medidas em pixels da tela do aparelho. O site é desenhado no tamanho de um aparelho de verdade
  // (1280 px no computador, 390 px no celular) e reduzido por escala quando não cabe.
  const LARGURA_PC = 1280;
  const PROPORCAO_PC = 10 / 16;
  const LARGURA_CEL = 390;
  const ALTURA_CEL = 780;
  const MAX_TELA_PC = 1000;      // a moldura do computador não passa disso nem em tela grande
  const BARRA_PC = 28;           // altura da barra de navegador desenhada
  const PE_PC = 34;              // altura do pé do monitor
  const BORDA_CEL = { lados: 10, topo: 30, base: 18 };
  const TETO_CEL = 0.7;          // o celular nunca passa de 70% da altura da janela do navegador
  const TETO_PC = 0.64;

  const siteInterativo = (s, pasta) => {
    const endereco = s.endereco;
    const caixa = el('div', 'vitrine vitrine-site');
    const barra = el('div', 'site-barra');
    barra.append(el('p', 'rel-rotulo', `Site · ${s.cliente}`));
    const modos = el('div', 'site-modos');
    modos.setAttribute('role', 'group');
    modos.setAttribute('aria-label', 'Ver o site como');

    // palco > aparelho (moldura escura) > navegador (só no computador) + vidro (tela) ; pé do monitor fora do aparelho
    const palco = el('div', 'site-palco');
    const aparelho = el('div', 'site-aparelho');
    const ilha = el('span', 'site-ilha');
    ilha.setAttribute('aria-hidden', 'true');
    const navegador = el('div', 'site-navegador');
    navegador.setAttribute('aria-hidden', 'true');
    navegador.append(el('span', 'site-navegador-bolinhas'), el('span', 'site-navegador-endereco', endereco.replace(/^https?:\/\//, '').replace(/\/$/, '')));
    const vidro = el('div', 'site-vidro');
    const pe = el('div', 'site-pe');
    pe.setAttribute('aria-hidden', 'true');
    pe.append(el('span', 'site-pe-haste'), el('span', 'site-pe-base'));

    // sem loading="lazy": começa a carregar assim que a janela abre
    const moldura = el('iframe', 'site-iframe');
    moldura.src = endereco;
    moldura.title = `Site da ${s.cliente}, ao vivo`;
    moldura.referrerPolicy = 'no-referrer';
    moldura.setAttribute('sandbox', PERMISSOES);

    // por cima do site, o print dele, até o iframe terminar de carregar
    const carregando = el('div', 'site-carregando');
    // um print por modo: o do computador (1280 px) e o do celular (390 px); o CSS mostra o do modo da vez
    const prints = [['site-print-computador', s.print], ['site-print-celular', s.printCelular || s.print]].map(([classe, arquivo]) => {
      const print = el('img', classe);
      print.src = pasta + arquivo;
      print.alt = '';
      print.decoding = 'async';
      return print;
    });
    const aviso = el('p', 'site-carregando-texto', 'Carregando o site ao vivo…');
    aviso.setAttribute('role', 'status');
    carregando.append(...prints, aviso);
    moldura.addEventListener('load', () => {
      carregando.classList.add('some');
      const tirar = () => carregando.remove();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) tirar();
      else {
        carregando.addEventListener('transitionend', tirar, { once: true });
        setTimeout(tirar, 600); // garantia, se a transição não rodar (aba escondida)
      }
    }, { once: true });

    vidro.append(moldura, carregando);
    aparelho.append(ilha, navegador, vidro);
    palco.append(aparelho, pe);

    const botoes = {};
    [['celular', 'Celular'], ['computador', 'Computador']].forEach(([modo, nome]) => {
      const b = el('button', 'site-modo', nome);
      b.type = 'button';
      b.addEventListener('click', () => {
        palco.dataset.modo = modo;
        Object.entries(botoes).forEach(([k, x]) => x.setAttribute('aria-pressed', String(k === modo)));
        ajustar();
      });
      botoes[modo] = b;
      modos.append(b);
    });
    const abrirFora = el('a', 'site-abrir', 'Abrir o site');
    abrirFora.href = endereco;
    abrirFora.target = '_blank';
    abrirFora.rel = 'noopener noreferrer';
    barra.append(modos, abrirFora);

    // calcula tela, escala e bordas de cada modo e entrega ao CSS por variáveis
    const definir = (nome, valor) => palco.style.setProperty(nome, valor);
    function ajustar() {
      const livre = palco.clientWidth;
      if (!livre) return;
      const altura = window.innerHeight || 800;
      if (palco.dataset.modo === 'celular') {
        const escala = Math.min(1,
          (livre - 2 * BORDA_CEL.lados) / LARGURA_CEL,
          (altura * TETO_CEL - BORDA_CEL.topo - BORDA_CEL.base) / ALTURA_CEL);
        const e = Math.max(escala, 0.2);
        definir('--escala', e.toFixed(4));
        definir('--iframe-l', `${LARGURA_CEL}px`);
        definir('--iframe-a', `${ALTURA_CEL}px`);
        definir('--tela-l', `${Math.round(LARGURA_CEL * e)}px`);
        definir('--tela-a', `${Math.round(ALTURA_CEL * e)}px`);
        definir('--borda-lados', `${BORDA_CEL.lados}px`);
        definir('--borda-topo', `${BORDA_CEL.topo}px`);
        definir('--borda-base', `${BORDA_CEL.base}px`);
      } else {
        const borda = livre < 520 ? 6 : 10;
        const larguraTela = Math.min(livre - 2 * borda, MAX_TELA_PC);
        const escala = Math.max(larguraTela / LARGURA_PC, 0.1);
        const alturaMax = Math.max(160, altura * TETO_PC - BARRA_PC - PE_PC - 2 * borda);
        const alturaTela = Math.min(larguraTela * PROPORCAO_PC, alturaMax);
        definir('--escala', escala.toFixed(4));
        definir('--iframe-l', `${LARGURA_PC}px`);
        definir('--iframe-a', `${Math.round(alturaTela / escala)}px`);
        definir('--tela-l', `${Math.round(larguraTela)}px`);
        definir('--tela-a', `${Math.round(alturaTela)}px`);
        definir('--borda-lados', `${borda}px`);
        definir('--borda-topo', `${borda}px`);
        definir('--borda-base', `${borda}px`);
      }
    }

    // a janela muda de largura (girar o celular) ou de altura (barra de endereço): recalcula
    const observador = new ResizeObserver(ajustar);
    observador.observe(palco);
    const aoRedimensionar = () => {
      if (!palco.isConnected) { window.removeEventListener('resize', aoRedimensionar); observador.disconnect(); return; }
      ajustar();
    };
    window.addEventListener('resize', aoRedimensionar);

    caixa.append(barra, palco, el('p', 'rel-fonte', 'O site aparece ao vivo: role e clique dentro da tela.'));
    palco.dataset.modo = window.matchMedia('(min-width: 640px)').matches ? 'computador' : 'celular';
    botoes[palco.dataset.modo].setAttribute('aria-pressed', 'true');
    botoes[palco.dataset.modo === 'celular' ? 'computador' : 'celular'].setAttribute('aria-pressed', 'false');
    // o primeiro ajuste acontece quando o palco já está na página (observador); depois liga a transição curta
    requestAnimationFrame(() => requestAnimationFrame(() => { palco.dataset.pronto = ''; }));
    return caixa;
  };

  window.VitrinePartes.site = { previa: previaSite, cheia: (d, pasta) => siteInterativo(d, pasta) };
})();
