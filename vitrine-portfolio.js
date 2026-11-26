// Vitrine do início, parte das fotos e vídeos: portfólio da Nova América
// Registra a prévia (dentro do selo) e a versão cheia (no selo ampliado) em window.VitrinePartes;
// o vitrine.js liga tudo. Ajudantes comuns em window.VitrineUtil (el, reais, inteiro).
//
// Prévia: dois celulares desenhados em CSS, cujas telas trocam sozinhas de foto e vídeo, cada uma
//         em um momento (defasadas). Vídeo só toca mudo, em laço, com o selo visível na tela.
// Ampliado: um celular com a foto ou o vídeo, que passa por deslize do dedo, setas e teclado.
(() => {
  const { el } = window.VitrineUtil;

  const PERIODO_PREVIA = 3200;    // tempo de cada trabalho na tela da prévia (ms)
  const DURACAO_PREVIA = 420;     // fade com deslize curto da prévia (ms)
  const DURACAO_CHEIA = 260;      // deslize da janela ampliada (ms)
  const LIMIAR_DESLIZE = 40;      // distância mínima do deslize do dedo (px)
  const FAIXA_CONTROLES = 64;     // faixa de baixo do vídeo, reservada aos controles nativos (px)
  const SAIDA = 'cubic-bezier(.23, 1, .32, 1)';

  const movimentoReduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tipoEmTexto = (item) => (item.tipo === 'video' ? 'vídeo' : 'foto');

  // Ordem em que os trabalhos passam na prévia: dois vídeos, duas fotos, e assim por diante.
  // Com os celulares trocando em turnos, cada um alterna entre vídeo e foto.
  const intercalar = (itens) => {
    const filas = [itens.filter(i => i.tipo === 'video'), itens.filter(i => i.tipo !== 'video')];
    const saida = [];
    let vez = 0;
    while (filas[0].length || filas[1].length) {
      for (let n = 0; n < 2; n++) {
        const fila = filas[vez].length ? filas[vez] : filas[1 - vez];
        if (fila.length) saida.push(fila.shift());
      }
      vez = 1 - vez;
    }
    return saida;
  };

  // Cria a tela de um trabalho. modo: 'previa' (vídeo mudo em laço, sem baixar até a vez dele),
  // 'parada' (só a capa, para quem prefere menos movimento) ou 'cheia' (vídeo com controles).
  const criarSlide = (item, pasta, modo) => {
    const slide = el('div', `port-slide port-slide-${item.tipo}`);
    if (item.tipo === 'video' && modo !== 'parada') {
      const video = el('video');
      video.poster = pasta + item.capa;
      video.playsInline = true;
      if (modo === 'cheia') {
        video.controls = true;
        video.preload = 'metadata';
        video.src = pasta + item.arquivo;
        video.setAttribute('aria-label', item.alt);
      } else {
        video.muted = true;
        video.loop = true;
        video.preload = 'none';
        video.dataset.origem = pasta + item.arquivo;   // só vira src quando for tocar
        // a capa fica no fundo da tela e o vídeo só aparece quando o primeiro quadro toca (sem piscar preto)
        // (url() dentro de variável CSS vale a partir da folha de estilo, por isso o endereço vai completo)
        slide.style.setProperty('--fundo', `url("${new URL(pasta + item.capa, document.baseURI).href}")`);
        video.classList.add('port-aguarda');
        video.addEventListener('playing', () => video.classList.remove('port-aguarda'));
      }
      slide.append(video);
    } else {
      const img = el('img');
      img.src = pasta + (item.tipo === 'video' ? item.capa : item.arquivo);
      img.alt = modo === 'cheia' ? item.alt : '';
      img.decoding = 'async';
      img.draggable = false;
      slide.style.setProperty('--fundo', `url("${img.src}")`);
      slide.append(img);
    }
    return slide;
  };

  const tocarSlide = (slide) => {
    const video = slide && slide.querySelector('video');
    if (!video) return;
    if (!video.getAttribute('src') && video.dataset.origem) video.src = video.dataset.origem;
    video.play().catch(() => {});
  };

  const pausarSlide = (slide) => {
    const video = slide && slide.querySelector('video');
    if (video) video.pause();
  };

  // tira a tela do lugar e solta o arquivo do vídeo, para o navegador parar de baixar
  const soltarSlide = (slide) => {
    const video = slide.querySelector('video');
    if (video) {
      video.pause();
      if (video.getAttribute('src')) { video.removeAttribute('src'); video.load(); }
    }
    slide.remove();
  };

  const desenharCelular = (classe) => {
    const celular = el('div', `celular ${classe || ''}`.trim());
    const ilha = el('span', 'celular-ilha');
    ilha.setAttribute('aria-hidden', 'true');
    const tela = el('div', 'celular-tela');
    celular.append(ilha, tela);
    return { celular, tela };
  };

  // ---------- prévia, dentro do selo ----------
  const previaPortfolio = (p, pasta) => {
    const caixa = el('div', 'vitrine-previa previa-celulares');
    caixa.setAttribute('role', 'img');
    caixa.setAttribute('aria-label', `Portfólio: vídeos e fotos feitos para a ${p.cliente}`);
    const ordem = intercalar(p.itens);
    if (!ordem.length) return caixa;

    const reduzido = movimentoReduzido();
    const modo = reduzido ? 'parada' : 'previa';
    let proximo = 0;
    const pegar = () => ordem[proximo++ % ordem.length];

    const telas = [0, 1].map(k => {
      const { celular, tela } = desenharCelular(k === 0 ? 'celular-esquerdo' : 'celular-direito');
      caixa.append(celular);
      const t = { tela, slide: criarSlide(pegar(), pasta, modo), timer: 0 };
      tela.append(t.slide);
      return t;
    });
    if (reduzido) return caixa;

    let ativo = false;
    const trocar = (t) => {
      const novo = criarSlide(pegar(), pasta, modo);
      const velho = t.slide;
      t.tela.append(novo);
      t.slide = novo;
      novo.animate(
        [{ opacity: 0, transform: 'translateX(14%)' }, { opacity: 1, transform: 'translateX(0)' }],
        { duration: DURACAO_PREVIA, easing: SAIDA }
      );
      velho.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DURACAO_PREVIA, fill: 'forwards' })
        .finished.then(() => soltarSlide(velho), () => soltarSlide(velho));
      if (ativo) tocarSlide(novo);
    };
    const agendar = (t, atraso) => {
      clearTimeout(t.timer);
      t.timer = setTimeout(() => { trocar(t); agendar(t, PERIODO_PREVIA); }, atraso);
    };
    const ligar = () => {
      if (ativo) return;
      ativo = true;
      // o segundo celular troca meio período depois do primeiro
      telas.forEach((t, k) => { tocarSlide(t.slide); agendar(t, k === 0 ? PERIODO_PREVIA : PERIODO_PREVIA * 1.5); });
    };
    const desligar = () => {
      if (!ativo) return;
      ativo = false;
      telas.forEach(t => { clearTimeout(t.timer); pausarSlide(t.slide); });
    };

    // só anda com o selo à vista, a aba aberta e a janela do selo fechada
    let visivel = typeof IntersectionObserver === 'undefined';
    let janelaAberta = false;
    const atualizar = () => (visivel && !janelaAberta && !document.hidden ? ligar() : desligar());
    if (!visivel) {
      new IntersectionObserver((entradas) => {
        visivel = entradas[entradas.length - 1].isIntersecting;
        atualizar();
      }, { threshold: 0.35 }).observe(caixa);
    }
    document.addEventListener('visibilitychange', atualizar);
    document.addEventListener('selo:aberto', () => { janelaAberta = true; atualizar(); });
    document.getElementById('modalSelo')?.addEventListener('close', () => { janelaAberta = false; atualizar(); });
    atualizar();
    return caixa;
  };

  // ---------- versão cheia, na janela do selo ----------
  const portfolioInterativo = (p, pasta) => {
    const itens = p.itens;
    const total = itens.length;
    const reduzido = movimentoReduzido();
    const caixa = el('div', 'vitrine vitrine-portfolio');
    caixa.append(el('p', 'rel-rotulo', `Portfólio · ${p.cliente}`));
    if (!total) return caixa;

    const cena = el('div', 'port-cena');
    const aparelho = el('div', 'port-aparelho');
    const { celular, tela } = desenharCelular();
    celular.setAttribute('role', 'group');
    celular.setAttribute('aria-roledescription', 'carrossel');
    celular.setAttribute('aria-label', 'Trabalhos do portfólio');

    const seta = (classe, rotulo) => {
      const b = el('button', `port-seta ${classe}`);
      b.type = 'button';
      b.setAttribute('aria-label', rotulo);
      return b;
    };
    const anterior = seta('port-seta-ant', 'Anterior');
    const proximo = seta('port-seta-prox', 'Próximo');
    aparelho.append(anterior, celular, proximo);   // setas fora da tela do celular, uma de cada lado
    cena.append(aparelho);

    const info = el('div', 'port-info');
    info.setAttribute('aria-live', 'polite');
    const legenda = el('p', 'port-legenda');
    const posicao = el('p', 'port-posicao');
    const pontos = el('div', 'port-pontos');
    pontos.setAttribute('aria-hidden', 'true');
    const marcas = itens.map(() => { const m = el('span', 'port-ponto'); pontos.append(m); return m; });
    const linha = el('div', 'port-posicao-linha');
    linha.append(pontos, posicao);
    info.append(legenda, linha);

    const miniaturas = el('div', 'port-miniaturas');
    miniaturas.setAttribute('role', 'group');
    miniaturas.setAttribute('aria-label', 'Escolha um trabalho');
    const botoes = itens.map((item, i) => {
      const b = el('button', 'port-miniatura');
      b.type = 'button';
      b.dataset.tipo = item.tipo;
      b.setAttribute('aria-label', `${item.titulo} (${tipoEmTexto(item)})`);
      const img = el('img');
      img.src = pasta + (item.capa || item.arquivo);
      img.alt = '';
      img.loading = 'lazy';
      b.append(img);
      b.addEventListener('click', () => ir(i, i > atual ? 1 : -1));
      miniaturas.append(b);
      return b;
    });

    let atual = -1;
    let slideAtual = null;

    // direcao: 1 vem da direita (próximo), -1 vem da esquerda (anterior), 0 sem deslize
    const mostrar = (i, tocar, direcao) => {
      const velho = slideAtual;
      const novo = criarSlide(itens[i], pasta, 'cheia');
      tela.querySelectorAll('.port-slide').forEach(s => { if (s !== velho) soltarSlide(s); });
      tela.append(novo);
      slideAtual = novo;
      atual = i;
      if (velho) {
        pausarSlide(velho);
        if (direcao && !reduzido) {
          const opcoes = { duration: DURACAO_CHEIA, easing: SAIDA };
          novo.animate([{ transform: `translateX(${direcao * 100}%)` }, { transform: 'translateX(0)' }], opcoes);
          velho.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-direcao * 100}%)` }], { ...opcoes, fill: 'forwards' })
            .finished.then(() => soltarSlide(velho), () => soltarSlide(velho));
        } else {
          soltarSlide(velho);
        }
      }
      if (tocar) tocarSlide(novo);

      legenda.textContent = `${itens[i].titulo} · ${tipoEmTexto(itens[i])}`;
      posicao.textContent = `${i + 1} de ${total}`;
      marcas.forEach((m, k) => { if (k === i) m.dataset.atual = ''; else delete m.dataset.atual; });
      botoes.forEach((b, k) => { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      const b = botoes[i];
      miniaturas.scrollTo({
        left: b.offsetLeft - (miniaturas.clientWidth - b.offsetWidth) / 2,
        behavior: reduzido || !direcao ? 'auto' : 'smooth'
      });
    };

    const ir = (i, direcao) => {
      const destino = ((i % total) + total) % total;
      if (destino !== atual) mostrar(destino, true, direcao);
    };
    anterior.addEventListener('click', () => ir(atual - 1, -1));
    proximo.addEventListener('click', () => ir(atual + 1, 1));

    // deslize do dedo (ou do mouse): horizontal passa o trabalho; vertical continua rolando a janela
    let inicio = null;
    let deslizou = false;
    celular.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      deslizou = false;
      inicio = { x: e.clientX, y: e.clientY, id: e.pointerId };
      // a faixa de baixo do vídeo é da barra de controles (a barra de tempo também anda para o lado)
      const area = celular.getBoundingClientRect();
      if (itens[atual].tipo === 'video' && e.clientY > area.bottom - FAIXA_CONTROLES) inicio = null;
    });
    celular.addEventListener('pointerup', (e) => {
      if (!inicio || e.pointerId !== inicio.id) return;
      const dx = e.clientX - inicio.x;
      const dy = e.clientY - inicio.y;
      inicio = null;
      if (Math.abs(dx) >= LIMIAR_DESLIZE && Math.abs(dx) > Math.abs(dy) * 1.3) {
        deslizou = true;
        ir(atual + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }
    });
    celular.addEventListener('pointercancel', () => { inicio = null; });
    // depois de um deslize, o clique que o navegador gera não deve pausar nem tocar o vídeo
    celular.addEventListener('click', (e) => {
      if (!deslizou) return;
      deslizou = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);

    // setas do teclado, enquanto a janela estiver aberta (nos controles do vídeo elas mexem no tempo e no volume)
    const teclas = (e) => {
      if (!caixa.isConnected) { document.removeEventListener('keydown', teclas); return; }
      if (!document.getElementById('modalSelo')?.open) return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest && e.target.closest('video, input, textarea, select')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir(atual - 1, -1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); ir(atual + 1, 1); }
    };
    document.addEventListener('keydown', teclas);

    caixa.append(cena, info, miniaturas);
    mostrar(0, false, 0);
    return caixa;
  };

  window.VitrinePartes.portfolio = { previa: previaPortfolio, cheia: portfolioInterativo };
})();
