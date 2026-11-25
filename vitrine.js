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

  const METRICAS = {
    custo: { nome: 'Investimento', formata: reais },
    cliques: { nome: 'Cliques', formata: inteiro },
    impressoes: { nome: 'Impressões', formata: inteiro },
    contatos: { nome: 'Contatos', formata: inteiro }
  };

  // ---------- prévias dentro dos selos (sem nada clicável: o selo inteiro já abre) ----------
  const previaRelatorio = (r) => {
    const caixa = el('div', 'vitrine-previa previa-relatorio');
    caixa.setAttribute('role', 'img');
    caixa.setAttribute('aria-label', `Relatório do anúncio: ${reais(r.total.custo)} investidos, ${inteiro(r.total.cliques)} cliques, ${inteiro(r.total.impressoes)} impressões`);
    const topo = el('div', 'previa-rel-topo');
    topo.append(el('span', 'previa-rel-rotulo', 'Relatório · Google Ads'), el('span', 'previa-rel-valor', reais(r.total.custo)));
    const barras = el('div', 'previa-rel-barras');
    const maior = Math.max(...r.semanas.map(s => s.custo));
    r.semanas.forEach(s => {
      const b = el('span');
      b.style.setProperty('--h', Math.max(4, (s.custo / maior) * 100) + '%');
      barras.append(b);
    });
    const rodape = el('div', 'previa-rel-rodape');
    rodape.append(el('span', '', `${inteiro(r.total.cliques)} cliques`), el('span', '', `${inteiro(r.total.impressoes)} impressões`));
    caixa.append(topo, barras, rodape);
    return caixa;
  };

  const previaPortfolio = (p, pasta) => {
    const caixa = el('div', 'vitrine-previa previa-portfolio');
    p.itens.filter(i => i.tipo === 'video').slice(0, 3).forEach(i => {
      const img = el('img');
      img.src = pasta + i.capa;
      img.alt = '';
      img.loading = 'lazy';
      caixa.append(img);
    });
    const foto = p.itens.find(i => i.tipo === 'foto');
    if (foto) {
      const img = el('img');
      img.src = pasta + foto.arquivo;
      img.alt = '';
      img.loading = 'lazy';
      caixa.append(img);
    }
    caixa.setAttribute('role', 'img');
    caixa.setAttribute('aria-label', `Portfólio: vídeos e fotos feitos para a ${p.cliente}`);
    caixa.append(el('span', 'previa-etiqueta', `${p.itens.length} trabalhos`));
    return caixa;
  };

  const previaSite = (s, pasta) => {
    const caixa = el('div', 'vitrine-previa previa-site');
    const barra = el('div', 'previa-site-barra');
    barra.append(el('span', 'previa-site-bolinhas'), el('span', 'previa-site-endereco', s.endereco.replace(/^https?:\/\//, '').replace(/\/$/, '')));
    const img = el('img');
    img.src = pasta + s.print;
    img.alt = s.alt;
    img.loading = 'lazy';
    caixa.append(barra, img);
    return caixa;
  };

  // ---------- versões interativas (na janela do selo ampliado) ----------
  const relatorioInterativo = (r) => {
    const caixa = el('div', 'vitrine vitrine-relatorio');

    const cab = el('div', 'rel-cabecalho');
    cab.append(el('p', 'rel-rotulo', `Relatório de anúncio · ${r.rede}`), el('h3', 'rel-titulo', r.campanha), el('p', 'rel-periodo', `${r.cliente} · ${r.periodo}`));

    // números: cada um é um botão que troca o que o gráfico mostra
    const numeros = el('div', 'rel-numeros');
    numeros.setAttribute('role', 'group');
    numeros.setAttribute('aria-label', 'Escolha o número do gráfico');
    const botoesMetrica = {};
    Object.entries(METRICAS).forEach(([chave, m]) => {
      const b = el('button', 'rel-numero');
      b.type = 'button';
      b.append(el('span', 'rel-numero-valor', m.formata(r.total[chave])), el('span', 'rel-numero-nome', m.nome));
      b.addEventListener('click', () => mostrar(chave));
      botoesMetrica[chave] = b;
      numeros.append(b);
    });

    const taxas = el('p', 'rel-taxas', `Taxa de cliques ${r.total.ctr.toLocaleString('pt-BR')}% · custo médio por clique ${reais(r.total.cpc)}`);

    // gráfico por semana: cada barra é um botão com o detalhe da semana
    const grafico = el('div', 'rel-grafico');
    const tituloGrafico = el('p', 'rel-subtitulo');
    const barras = el('div', 'rel-barras');
    const detalhe = el('p', 'rel-detalhe');
    detalhe.setAttribute('aria-live', 'polite');
    grafico.append(tituloGrafico, barras, detalhe);
    let metrica = 'custo';
    let semanaEscolhida = null;

    const escreverDetalhe = () => {
      if (semanaEscolhida == null) {
        detalhe.textContent = 'Toque numa semana para ver os números dela.';
        return;
      }
      const s = r.semanas[semanaEscolhida];
      detalhe.textContent = `Semana de ${s.rotulo}: ${reais(s.custo)} investidos, ${inteiro(s.cliques)} cliques, ${inteiro(s.impressoes)} impressões` + (s.contatos ? `, ${s.contatos} ${s.contatos > 1 ? 'contatos' : 'contato'}.` : '.');
    };

    const desenhar = () => {
      tituloGrafico.textContent = `${METRICAS[metrica].nome} por semana`;
      const maior = Math.max(...r.semanas.map(s => s[metrica])) || 1;
      barras.replaceChildren(...r.semanas.map((s, i) => {
        const b = el('button', 'rel-barra');
        b.type = 'button';
        b.style.setProperty('--h', Math.max(2, (s[metrica] / maior) * 100) + '%');
        b.setAttribute('aria-pressed', String(i === semanaEscolhida));
        b.setAttribute('aria-label', `Semana de ${s.rotulo}: ${METRICAS[metrica].formata(s[metrica])}`);
        // na barra, o valor curto (R$ 146); o exato fica no detalhe da semana
        const curto = metrica === 'custo' ? 'R$ ' + Math.round(s.custo).toLocaleString('pt-BR') : METRICAS[metrica].formata(s[metrica]);
        const valor = el('span', 'rel-barra-valor', curto);
        const coluna = el('span', 'rel-barra-coluna');
        const rotulo = el('span', 'rel-barra-rotulo', s.rotulo);
        b.append(valor, coluna, rotulo);
        b.addEventListener('click', () => {
          semanaEscolhida = i === semanaEscolhida ? null : i;
          desenhar();
        });
        return b;
      }));
      escreverDetalhe();
    };

    const mostrar = (chave) => {
      metrica = chave;
      Object.entries(botoesMetrica).forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === chave)));
      desenhar();
      desenharPalavras();
    };

    // palavras-chave: lista com fios, ordenada pelo número escolhido
    const palavras = el('div', 'rel-palavras');
    const tituloPalavras = el('p', 'rel-subtitulo');
    const lista = el('ol', 'rel-lista');
    const somaPalavras = r.palavras.reduce((t, p) => t + p.custo, 0);
    const notaPalavras = el('p', 'rel-fonte', `As ${r.palavras.length} palavras-chave cadastradas hoje na campanha somam ${reais(somaPalavras)} do investimento total.`);
    palavras.append(tituloPalavras, lista, notaPalavras);
    const desenharPalavras = () => {
      const chave = metrica;
      tituloPalavras.textContent = `Palavras pesquisadas, por ${METRICAS[chave].nome.toLowerCase()}`;
      const ordem = [...r.palavras].sort((a, b) => b[chave] - a[chave] || b.custo - a.custo);
      const maior = ordem[0][chave] || 1;
      lista.replaceChildren(...ordem.map(p => {
        const li = el('li');
        li.style.setProperty('--w', (p[chave] / maior) * 100 + '%');
        li.append(el('span', 'rel-termo', p.termo), el('span', 'rel-termo-valor', METRICAS[chave].formata(p[chave])));
        return li;
      }));
    };

    // como o anúncio aparecia no Google
    const anuncio = el('div', 'rel-anuncio');
    anuncio.append(el('p', 'rel-subtitulo', 'O anúncio no Google'));
    const cartao = el('div', 'rel-anuncio-cartao');
    cartao.append(el('span', 'rel-anuncio-patrocinado', 'Patrocinado'), el('span', 'rel-anuncio-endereco', r.anuncio.endereco), el('span', 'rel-anuncio-titulo', r.anuncio.titulo), el('span', 'rel-anuncio-texto', r.anuncio.texto));
    anuncio.append(cartao);

    const fonte = el('p', 'rel-fonte', `Números do Google Ads, conferidos em ${r.lidoEm}. Contatos são as conversões que o Google Ads registrou.`);

    caixa.append(cab, numeros, taxas, grafico, palavras, anuncio, fonte);
    mostrar('custo');
    return caixa;
  };

  const portfolioInterativo = (p, pasta) => {
    const caixa = el('div', 'vitrine vitrine-portfolio');
    caixa.append(el('p', 'rel-rotulo', `Portfólio · ${p.cliente}`));
    const palco = el('div', 'port-palco');
    const legenda = el('p', 'port-legenda');
    legenda.setAttribute('aria-live', 'polite');
    const miniaturas = el('div', 'port-miniaturas');
    miniaturas.setAttribute('role', 'group');
    miniaturas.setAttribute('aria-label', 'Escolha um trabalho');
    const botoes = [];

    const abrir = (i, tocar) => {
      const item = p.itens[i];
      let midia;
      if (item.tipo === 'video') {
        midia = el('video');
        midia.src = pasta + item.arquivo;
        midia.poster = pasta + item.capa;
        midia.controls = true;
        midia.playsInline = true;
        midia.preload = 'metadata';
        midia.setAttribute('aria-label', item.alt);
        if (tocar) midia.play().catch(() => {});
      } else {
        midia = el('img');
        midia.src = pasta + item.arquivo;
        midia.alt = item.alt;
      }
      palco.dataset.tipo = item.tipo;
      palco.replaceChildren(midia);
      legenda.textContent = `${item.titulo} · ${item.tipo === 'video' ? 'vídeo' : 'foto'}`;
      botoes.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    };

    p.itens.forEach((item, i) => {
      const b = el('button', 'port-miniatura');
      b.type = 'button';
      b.dataset.tipo = item.tipo;
      b.setAttribute('aria-label', `${item.titulo} (${item.tipo === 'video' ? 'vídeo' : 'foto'})`);
      const img = el('img');
      img.src = pasta + (item.capa || item.arquivo);
      img.alt = '';
      img.loading = 'lazy';
      b.append(img);
      b.addEventListener('click', () => abrir(i, true));
      botoes.push(b);
      miniaturas.append(b);
    });

    caixa.append(palco, legenda, miniaturas);
    abrir(0, false);
    return caixa;
  };

  const siteInterativo = (s) => {
    const caixa = el('div', 'vitrine vitrine-site');
    const barra = el('div', 'site-barra');
    barra.append(el('p', 'rel-rotulo', `Site · ${s.cliente}`));
    const modos = el('div', 'site-modos');
    modos.setAttribute('role', 'group');
    modos.setAttribute('aria-label', 'Ver o site como');
    const tela = el('div', 'site-tela');
    const moldura = el('iframe');
    moldura.src = s.endereco;
    moldura.title = `Site da ${s.cliente}, ao vivo`;
    moldura.loading = 'lazy';
    moldura.referrerPolicy = 'no-referrer';
    moldura.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    tela.append(moldura);

    const botoes = {};
    [['celular', 'Celular'], ['computador', 'Computador']].forEach(([modo, nome]) => {
      const b = el('button', 'site-modo', nome);
      b.type = 'button';
      b.addEventListener('click', () => {
        tela.dataset.modo = modo;
        Object.entries(botoes).forEach(([k, x]) => x.setAttribute('aria-pressed', String(k === modo)));
      });
      botoes[modo] = b;
      modos.append(b);
    });
    const abrirFora = el('a', 'site-abrir', 'Abrir o site');
    abrirFora.href = s.endereco;
    abrirFora.target = '_blank';
    abrirFora.rel = 'noopener noreferrer';
    barra.append(modos, abrirFora);

    // no modo computador, o site é desenhado a 1280 px e reduzido para caber na janela
    const LARGURA_PC = 1280;
    const ajustarEscala = () => {
      const livre = tela.clientWidth - 20;
      tela.style.setProperty('--escala', String(Math.min(1, livre / LARGURA_PC)));
    };
    new ResizeObserver(ajustarEscala).observe(tela);

    caixa.append(barra, tela, el('p', 'rel-fonte', 'O site aparece ao vivo: role e clique dentro da tela.'));
    botoes[window.matchMedia('(min-width: 640px)').matches ? 'computador' : 'celular'].click();
    return caixa;
  };

  // ---------- liga tudo quando os dados existem ----------
  const iniciar = (d) => {
    const pasta = d.pasta || PASTA;
    const montar = {
      relatorio: { previa: () => previaRelatorio(d.relatorio), cheia: () => relatorioInterativo(d.relatorio) },
      portfolio: { previa: () => previaPortfolio(d.portfolio, pasta), cheia: () => portfolioInterativo(d.portfolio, pasta) },
      site: { previa: () => previaSite(d.site, pasta), cheia: () => siteInterativo(d.site) }
    };

    document.querySelectorAll('.selo-imagem[data-vitrine]').forEach(caixa => {
      const tipo = caixa.dataset.vitrine;
      if (!montar[tipo] || !d[tipo]) return;
      caixa.classList.add('com-vitrine');
      caixa.replaceChildren(montar[tipo].previa());
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

  if (window.vitrineDados) {
    iniciar(window.vitrineDados);
  } else {
    const s = document.createElement('script');
    s.src = PASTA + 'vitrine-dados.js';
    s.onload = () => window.vitrineDados && iniciar(window.vitrineDados);
    document.body.append(s);
  }
})();
