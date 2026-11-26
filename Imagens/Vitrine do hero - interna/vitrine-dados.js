// Dados da vitrine do início (os três selos do hero).
// Material de clientes, publicado com autorização confirmada por Dominique em 25/11/2026.
// Sem este arquivo, o site mostra as fotos de banco de sempre.
// Números do Google Ads lidos em 25/11/2026 (conta da Sabrina, campanha
// "[TRABALHISTA] [SEM REGISTRO]", todo o período). As semanas somam o total.
window.vitrineDados = {
  pasta: 'Imagens/Vitrine%20do%20hero%20-%20interna/',

  relatorio: {
    cliente: 'Advogada Sabrina Conrado',
    campanha: 'Trabalhista: sem carteira assinada',
    rede: 'Google Ads, rede de pesquisa',
    periodo: '28/07 a 31/08/2025',
    lidoEm: '25/11/2026',
    // Totais das cinco semanas completas (soma de `semanas`). A semana de 01/09/2025 ficou fora da análise
    // a pedido de Dominique (26/11/2026): teve um dia só (R$ 3,10, 4 cliques, 42 impressões).
    // Com ela o Google Ads marcava R$ 533,99, 363 cliques e 6.259 impressões.
    // A tela mostra só investimento, cliques e impressões (pedido de Dominique, 26/11/2026).
    total: { custo: 530.89, cliques: 359, impressoes: 6217, ctr: 5.77, cpc: 1.48 },
    // ESTIMATIVA de quantos pedidos de atendimento os cliques podem ter rendido. Não é dado da campanha
    // (regra dado-inventado): a tela mostra a fonte por escrito.
    // taxaDePedidos tem fonte pública: média de conversão (clique que vira pedido de atendimento por telefone,
    //    conversa, formulário ou e-mail) dos anúncios de pesquisa de "Attorneys & Legal Services", 5,55%,
    //    no relatório da LocaliQ abaixo (página atualizada em 01/06/2026, lida em 26/11/2026).
    //    A média é de campanhas de clientes da LocaliQ, empresa dos Estados Unidos, e não desta campanha.
    // A hipótese de contratos (1 a cada 4 pedidos, sem fonte) saiu em 26/11/2026, por decisão de Dominique.
    estimativa: {
      taxaDePedidos: 5.55,
      fonte: {
        nome: 'LocaliQ',
        relatorio: 'Search Advertising Benchmarks',
        ano: 2026,
        link: 'https://localiq.com/blog/search-advertising-benchmarks/'
      }
    },
    semanas: [
      { rotulo: '28/07', custo: 145.50, cliques: 39, impressoes: 865 },
      { rotulo: '04/08', custo: 121.81, cliques: 68, impressoes: 1738 },
      { rotulo: '11/08', custo: 58.34, cliques: 41, impressoes: 787 },
      { rotulo: '18/08', custo: 108.65, cliques: 101, impressoes: 1419 },
      { rotulo: '25/08', custo: 96.59, cliques: 110, impressoes: 1408 }
    ],
    // Palavras-chave: não aparecem mais no relatório do site. Os números abaixo são do período inteiro
    // do Google Ads (28/07 a 01/09/2025, com a semana de um dia só) e ficam guardados só como registro.
    palavras: [
      { termo: 'trabalho sem carteira assinada', custo: 48.93, cliques: 7, impressoes: 165 },
      { termo: 'sem carteira assinada', custo: 21.37, cliques: 2, impressoes: 22 },
      { termo: 'não tenho carteira assinada e fui demitido', custo: 8.62, cliques: 2, impressoes: 54 },
      { termo: 'fui demitido sem registro', custo: 8.51, cliques: 1, impressoes: 4 },
      { termo: 'sem registro', custo: 8.19, cliques: 2, impressoes: 33 },
      { termo: 'direitos trabalhistas sem carteira assinada', custo: 7.16, cliques: 1, impressoes: 42 },
      { termo: 'direito trabalhista sem carteira assinada', custo: 7.05, cliques: 4, impressoes: 55 },
      { termo: 'direitos trabalhistas sem registro', custo: 5.83, cliques: 2, impressoes: 18 },
      { termo: 'advogado trabalhista', custo: 3.49, cliques: 5, impressoes: 52 },
      { termo: 'trabalho sem registro', custo: 1.26, cliques: 1, impressoes: 9 }
    ],
    anuncio: {
      endereco: 'advogadasabrina.com.br/sem-registro',
      titulo: 'Trabalhou Sem Carteira? | Você Pode Ter Direitos',
      texto: 'Trabalhou sem carteira? Descubra seus direitos. Avaliação gratuita e online. Mesmo sem registro, você pode receber FGTS, férias, 13º e mais. Fale com Sabrina.'
    }
  },

  portfolio: {
    cliente: 'Nova América Veículos',
    itens: [
      { tipo: 'video', arquivo: 'video-kicks.mp4', capa: 'video-kicks.jpg', titulo: 'Nissan Kicks 2023', alt: 'Vídeo de anúncio do Nissan Kicks 2023 da Nova América Veículos' },
      { tipo: 'video', arquivo: 'video-tracker.mp4', capa: 'video-tracker.jpg', titulo: 'Chevrolet Tracker Premier', alt: 'Vídeo de anúncio do Chevrolet Tracker Premier da Nova América Veículos' },
      { tipo: 'video', arquivo: 'video-argo.mp4', capa: 'video-argo.jpg', titulo: 'Fiat Argo Drive 2024', alt: 'Vídeo de anúncio do Fiat Argo Drive 2024 da Nova América Veículos' },
      { tipo: 'video', arquivo: 'video-civic.mp4', capa: 'video-civic.jpg', titulo: 'Honda Civic LXR', alt: 'Vídeo de anúncio do Honda Civic LXR da Nova América Veículos' },
      { tipo: 'foto', arquivo: 'foto-c3-frente.webp', titulo: 'Citroën C3, frente', alt: 'Citroën C3 branco fotografado de frente no pátio da loja' },
      { tipo: 'foto', arquivo: 'foto-c3-lateral.webp', titulo: 'Citroën C3, lateral', alt: 'Citroën C3 branco fotografado de lado' },
      { tipo: 'foto', arquivo: 'foto-c3-interior.webp', titulo: 'Citroën C3, interior', alt: 'Painel e bancos dianteiros do Citroën C3' },
      { tipo: 'foto', arquivo: 'foto-c3-farol.webp', titulo: 'Citroën C3, farol', alt: 'Detalhe do farol do Citroën C3' }
    ]
  },

  site: {
    cliente: 'Advogada Sabrina Conrado',
    endereco: 'https://www.advogadasabrina.com.br/',
    print: 'site-sabrina.webp',
    printCelular: 'site-sabrina-celular.webp', // print do site em 390 px (26/11/2026), aparece no modo Celular até o site carregar
    alt: 'Início do site da advogada Sabrina Conrado, com a chamada "Advogada previdenciária em Matão/SP" e a foto dela'
  },

  origem: '01: campanha trabalhista da Advogada Sabrina Conrado no Google Ads, a que mais investiu (2025). 02: vídeos e fotos que a Ginga fez para os anúncios da Nova América Veículos em 2026, com os preços da época. 03: site da Advogada Sabrina, que a Ginga refez em novembro de 2026.'
};
