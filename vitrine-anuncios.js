// Vitrine do início, parte dos anúncios: relatório do Google Ads da Sabrina
// Registra a prévia (dentro do selo) e a versão cheia (no selo ampliado) em window.VitrinePartes;
// o vitrine.js liga tudo. Ajudantes comuns em window.VitrineUtil (el, reais, inteiro).
// O relatório é parado (sem botões): um gráfico só com investimento, cliques e impressões por semana
// e, embaixo, a leitura dos números em texto para quem nunca viu um relatório de anúncio.
(() => {
  const { el, reais, inteiro } = window.VitrineUtil;
  const SVG = 'http://www.w3.org/2000/svg';
  const reaisRedondo = (n) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR');

  // Investimento (R$) e cliques ficam na mesma régua: nesta campanha os dois variam entre 39 e 146,
  // então a barra e a linha se comparam sem um segundo eixo. A folga de 14% dá lugar ao rótulo do ponto.
  const teto = (r) => Math.max(...r.semanas.map(s => Math.max(s.custo, s.cliques))) * 1.14;

  // linha dos cliques: um ponto no meio de cada coluna; o SVG estica junto com a caixa
  const linhaCliques = (r, classe) => {
    const topo = teto(r);
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', classe);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const linha = document.createElementNS(SVG, 'polyline');
    linha.setAttribute('points', r.semanas.map((s, i) => `${((i + 0.5) / r.semanas.length) * 100},${100 - (s.cliques / topo) * 100}`).join(' '));
    linha.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(linha);
    return svg;
  };

  const previaRelatorio = (r) => {
    const topo = teto(r);
    const caixa = el('div', 'vitrine-previa previa-relatorio');
    caixa.setAttribute('role', 'img');
    caixa.setAttribute('aria-label', `Relatório do anúncio: ${reais(r.total.custo)} investidos, ${inteiro(r.total.cliques)} cliques e ${inteiro(r.total.impressoes)} impressões em ${r.semanas.length} semanas`);
    const cabeca = el('div', 'previa-rel-topo');
    const valor = el('span', 'previa-rel-valor', reais(r.total.custo));
    valor.append(el('small', '', ' investidos'));
    cabeca.append(el('span', 'previa-rel-rotulo', 'Relatório · Google Ads'), valor);

    const plano = el('div', 'previa-rel-plano');
    r.semanas.forEach(s => {
      const coluna = el('span', 'previa-rel-coluna');
      const barra = el('span', 'previa-rel-barra');
      barra.style.setProperty('--h', (s.custo / topo) * 100 + '%');
      const ponto = el('span', 'previa-rel-ponto');
      ponto.style.setProperty('--y', (s.cliques / topo) * 100 + '%');
      coluna.append(barra, ponto);
      plano.append(coluna);
    });
    plano.append(linhaCliques(r, 'previa-rel-linha'));

    // rodapé só à esquerda: o canto de baixo à direita fica livre para o aviso "Clique aqui"
    const rodape = el('div', 'previa-rel-rodape');
    const cliques = el('span', 'previa-rel-cliques');
    cliques.append(el('b', '', inteiro(r.total.cliques)), ' cliques');
    const impressoes = el('span', '');
    impressoes.append(el('b', '', inteiro(r.total.impressoes)), ' impressões');
    rodape.append(cliques, impressoes);
    caixa.append(cabeca, plano, rodape);
    return caixa;
  };

  // ---------- gráfico único: barras de investimento, linha de cliques e faixa de impressões ----------
  const graficoSemanas = (r) => {
    const topo = teto(r);
    const maiorImpressao = Math.max(...r.semanas.map(s => s.impressoes));
    const figura = el('figure', 'rel-grafico');
    figura.append(el('h4', 'rel-subtitulo', 'Semana a semana'));

    const legenda = el('ul', 'rel-legenda');
    legenda.setAttribute('aria-hidden', 'true');
    [['investimento', 'Investimento na semana, em reais'], ['cliques', 'Cliques no anúncio'], ['impressoes', 'Impressões: vezes em que o anúncio apareceu']].forEach(([tipo, texto]) => {
      const item = el('li');
      item.append(el('span', 'rel-marca rel-marca-' + tipo), texto);
      legenda.append(item);
    });

    const desenho = el('div', 'rel-desenho');
    desenho.setAttribute('aria-hidden', 'true');
    desenho.style.setProperty('--semanas', r.semanas.length);
    const plano = el('div', 'rel-plano');
    r.semanas.forEach(s => {
      const coluna = el('div', 'rel-coluna');
      const barra = el('span', 'rel-barra');
      barra.style.setProperty('--h', (s.custo / topo) * 100 + '%');
      barra.append(el('span', 'rel-barra-valor', reaisRedondo(s.custo)));
      const ponto = el('span', 'rel-ponto');
      ponto.style.setProperty('--y', (s.cliques / topo) * 100 + '%');
      ponto.append(el('span', 'rel-ponto-valor', inteiro(s.cliques)));
      coluna.append(barra, ponto);
      plano.append(coluna);
    });
    plano.append(linhaCliques(r, 'rel-linha'));

    const datas = el('div', 'rel-faixa rel-datas');
    r.semanas.forEach(s => datas.append(el('span', '', s.rotulo)));

    const vistas = el('div', 'rel-faixa rel-vistas');
    r.semanas.forEach(s => {
      const celula = el('span', '', inteiro(s.impressoes));
      celula.style.setProperty('--w', (s.impressoes / maiorImpressao) * 100 + '%');
      vistas.append(celula);
    });

    desenho.append(plano, datas, el('p', 'rel-faixa-nome', 'Dia em que a semana começou'), vistas, el('p', 'rel-faixa-nome', 'Impressões na semana'));

    // os mesmos números em tabela, para leitor de tela
    // a tabela fica dentro de uma caixa escondida: tabela não encolhe a 1 px e criava rolagem lateral
    const tabela = el('table');
    tabela.append(el('caption', '', `Investimento, cliques e impressões por semana, de ${r.periodo}`));
    const cabecalho = el('tr');
    ['Semana que começou em', 'Investimento', 'Cliques', 'Impressões'].forEach(t => {
      const th = el('th', '', t);
      th.scope = 'col';
      cabecalho.append(th);
    });
    const corpo = el('tbody');
    corpo.append(cabecalho);
    r.semanas.forEach(s => {
      const tr = el('tr');
      const th = el('th', '', s.rotulo);
      th.scope = 'row';
      tr.append(th, el('td', '', reais(s.custo)), el('td', '', inteiro(s.cliques)), el('td', '', inteiro(s.impressoes)));
      corpo.append(tr);
    });
    tabela.append(corpo);

    const soLeitor = el('div', 'rel-so-leitor');
    soLeitor.append(tabela);
    figura.append(legenda, desenho, soLeitor);
    return figura;
  };

  // ---------- leitura dos números em texto ----------
  const analise = (r) => {
    const t = r.total;
    const primeira = r.semanas[0];
    const ultima = r.semanas[r.semanas.length - 1];
    const caixa = el('section', 'rel-analise');
    caixa.append(el('h4', 'rel-subtitulo', 'O que esses números querem dizer'));

    const lista = el('dl', 'rel-leitura');
    const linha = (valor, nome, texto) => {
      const item = el('div', 'rel-leitura-item');
      const dt = el('dt');
      dt.append(el('span', 'rel-leitura-valor', valor), el('span', 'rel-leitura-nome', nome));
      item.append(dt, el('dd', '', texto));
      lista.append(item);
    };
    linha(reais(t.custo), 'investidos', `Valor pago ao Google pelos anúncios em ${r.semanas.length} semanas, de ${r.periodo}. Em média, ${reais(t.custo / r.semanas.length)} por semana.`);
    linha(inteiro(t.impressoes), 'impressões', 'Vezes em que o anúncio apareceu para alguém que pesquisava no Google sobre trabalho sem carteira assinada.');
    linha(inteiro(t.cliques), 'cliques', `Cada clique é uma visita à página da advogada, feita por uma pessoa que procurava esse serviço. A cada 100 vezes em que o anúncio apareceu, ele recebeu cerca de ${Math.round(t.ctr)} cliques.`);
    linha(reais(t.cpc), 'por clique', `Custo médio para levar cada pessoa interessada até a página. O valor caiu ao longo do período: ${reais(primeira.custo / primeira.cliques)} por clique na primeira semana e ${reais(ultima.custo / ultima.cliques)} na última.`);

    caixa.append(lista);
    if (r.estimativa) caixa.append(estimativaDeClientes(r));
    return caixa;
  };

  // ---------- quanto rendeu: pessoas interessadas e pedidos de atendimento estimados ----------
  // A campanha não informa quantas pessoas contrataram a advogada nem o valor de um caso (regra dado-inventado).
  // O que é certo aparece primeiro; o resto é estimativa, com a suposição e a fonte escritas na tela.
  // A taxa de pedidos vem de fonte pública (r.estimativa.fonte). A conta para em pedidos: contratos não têm fonte.
  const estimativaDeClientes = (r) => {
    const t = r.total;
    const e = r.estimativa;
    const umACada = Math.round(100 / e.taxaDePedidos);
    const pedidos = Math.round(t.cliques * e.taxaDePedidos / 100);
    const taxa = e.taxaDePedidos.toLocaleString('pt-BR');
    const fonte = `${e.fonte.nome}, ${e.fonte.relatorio}, ${e.fonte.ano}`;

    const caixa = el('div', 'rel-estimativa');
    caixa.append(el('h4', 'rel-subtitulo', 'Quanto isso rendeu'));

    const lista = el('dl', 'rel-leitura rel-leitura-estimativa');
    const linha = (selo, valor, nome, texto) => {
      const item = el('div', 'rel-leitura-item');
      const dt = el('dt');
      dt.append(el('span', 'rel-selo-estimativa', selo), el('span', 'rel-leitura-valor', valor), el('span', 'rel-leitura-nome', nome));
      item.append(dt, el('dd', '', texto));
      lista.append(item);
    };
    linha('Dado da campanha', inteiro(t.cliques), 'pessoas interessadas', `Foi o que o investimento de ${reais(t.custo)} rendeu: ${inteiro(t.cliques)} visitas à página da advogada, feitas por pessoas que procuravam esse serviço. O Google Ads mostra quem viu e quem clicou, mas não informa quantas dessas pessoas contrataram a advogada.`);
    linha('Estimativa', `Cerca de ${inteiro(pedidos)}`, 'pedidos de atendimento', `Em anúncios de pesquisa de advogados e serviços jurídicos, em média ${taxa}% dos cliques, ou 1 em cada ${umACada}, viram um pedido de atendimento por telefone, formulário ou mensagem (${fonte}). Se esta campanha seguiu essa média, os ${inteiro(t.cliques)} cliques podem ter rendido cerca de ${inteiro(pedidos)} pedidos.`);

    const aviso = el('p', 'rel-estimativa-aviso', `A média é de campanhas de outros escritórios, atendidos por uma empresa dos Estados Unidos. O resultado real depende do atendimento e de cada caso. Fonte da média: `);
    const link = el('a', '', `${e.fonte.relatorio} ${e.fonte.ano}, ${e.fonte.nome}`);
    link.href = e.fonte.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    aviso.append(link, ' (página em inglês).');
    caixa.append(lista, aviso);
    return caixa;
  };

  const relatorioInterativo = (r) => {
    const caixa = el('div', 'vitrine vitrine-relatorio');

    const cab = el('div', 'rel-cabecalho');
    cab.append(el('p', 'rel-rotulo', `Relatório de anúncio · ${r.rede}`), el('h3', 'rel-titulo', r.campanha), el('p', 'rel-periodo', `${r.cliente} · ${r.periodo}`));

    // os três números do período, parados (sem botão)
    const numeros = el('dl', 'rel-numeros');
    [[reais(r.total.custo), 'Investimento'], [inteiro(r.total.cliques), 'Cliques'], [inteiro(r.total.impressoes), 'Impressões']].forEach(([valor, nome]) => {
      const item = el('div', 'rel-numero');
      item.append(el('dt', 'rel-numero-nome', nome), el('dd', 'rel-numero-valor', valor));
      numeros.append(item);
    });

    // como o anúncio aparecia no Google
    const anuncio = el('div', 'rel-anuncio');
    anuncio.append(el('h4', 'rel-subtitulo', 'O anúncio no Google'));
    const cartao = el('div', 'rel-anuncio-cartao');
    cartao.append(el('span', 'rel-anuncio-patrocinado', 'Patrocinado'), el('span', 'rel-anuncio-endereco', r.anuncio.endereco), el('span', 'rel-anuncio-titulo', r.anuncio.titulo), el('span', 'rel-anuncio-texto', r.anuncio.texto));
    anuncio.append(cartao);

    const fonte = el('p', 'rel-fonte', `Números do Google Ads, conferidos em ${r.lidoEm}. Período de ${r.periodo}, em semanas completas.`);

    caixa.append(cab, numeros, graficoSemanas(r), analise(r), anuncio, fonte);
    return caixa;
  };

  window.VitrinePartes.relatorio = { previa: (d, pasta) => previaRelatorio(d), cheia: (d, pasta) => relatorioInterativo(d) };
})();
