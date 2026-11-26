// Menu mobile
const botao = document.getElementById('menuBotao');
const menu = document.getElementById('menu');

botao.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  botao.setAttribute('aria-expanded', aberto);
  botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});

const fecharMenu = () => {
  menu.classList.remove('aberto');
  botao.setAttribute('aria-expanded', 'false');
  botao.setAttribute('aria-label', 'Abrir menu');
};
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', fecharMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('aberto')) {
    fecharMenu();
    botao.focus();
  }
});

// Topo ganha fundo ao rolar
const topo = document.getElementById('topo');
const aoRolar = () => topo.classList.toggle('rolou', window.scrollY > 40);
window.addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

// Animação de entrada
const itens = document.querySelectorAll('.revelar');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  itens.forEach(i => obs.observe(i));
} else {
  itens.forEach(i => i.classList.add('visivel'));
}

// Formulário envia para o WhatsApp (o do contato e o da janela usam a mesma função)
const form = document.getElementById('formContato');

const enviarFormulario = (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const aviso = form.querySelector('.form-aviso');
  const nome = form.nome.value.trim();
  const marcados = [...form.querySelectorAll('input[name="servico"]:checked')].map(c => c.value);
  const servico = marcados.length ? marcados.join(', ') : 'ainda não sei, quero conversar';
  const mensagem = form.mensagem.value.trim();

  if (!nome) {
    aviso.textContent = 'Por favor, informe seu nome.';
    form.nome.focus();
    return;
  }
  aviso.textContent = '';

  const texto =
    `Olá! Meu nome é ${nome}.\n` +
    `Tenho interesse em: ${servico}.\n` +
    (mensagem ? `Sobre meu negócio: ${mensagem}` : '');

  const url = 'https://wa.me/5516996076565?text=' + encodeURIComponent(texto);
  window.open(url, '_blank', 'noopener');
};
form.addEventListener('submit', enviarFormulario);

// Selo ampliado: clicar num selo abre ele na tela toda
const modal = document.getElementById('modalSelo');
const modalConteudo = document.getElementById('modalConteudo');
const modalFechar = document.getElementById('modalFechar');
const cores = ['selo-laranja', 'selo-vermelho', 'selo-amarelo'];
let seloAberto = null;

const abrirSelo = (selo) => {
  seloAberto = selo;
  const ehFicha = selo.classList.contains('ficha');

  // ficha da equipe: copia a ficha inteira; selos: copia só a face colorida
  const copia = (ehFicha ? selo : selo.querySelector('.selo-face')).cloneNode(true);
  copia.querySelectorAll('[hidden]').forEach(el => el.removeAttribute('hidden'));
  copia.querySelectorAll('.ver-mais').forEach(el => el.remove());
  copia.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  copia.removeAttribute('data-ampliar');
  copia.classList.remove('revelar', 'visivel');

  if (ehFicha) {
    modalConteudo.className = 'modal-conteudo modal-ficha';
  } else {
    modalConteudo.className = 'modal-conteudo selo';
    cores.forEach(c => { if (selo.classList.contains(c)) modalConteudo.classList.add(c); });
  }
  modalConteudo.replaceChildren(copia);
  modalConteudo.scrollTop = 0;
  // a vitrine do início (vitrine.js) troca a prévia pela versão interativa
  document.dispatchEvent(new CustomEvent('selo:aberto', { detail: { selo, copia, conteudo: modalConteudo } }));

  const nome = copia.querySelector('.selo-nome, .ficha-nome');
  modal.setAttribute('aria-label', nome ? nome.textContent : 'Detalhes');

  document.body.classList.add('modal-aberto');
  modal.classList.remove('fechando');
  modal.showModal();
  modalFechar.focus();
};

const fecharSelo = () => {
  if (!modal.open || modal.classList.contains('fechando')) return;
  const terminar = () => {
    modal.classList.remove('fechando');
    modal.close();
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    terminar();
  } else {
    modal.classList.add('fechando');
    modalConteudo.addEventListener('animationend', terminar, { once: true });
  }
};

// o selo inteiro abre com o mouse; no teclado, o botão "Ver mais" de cada selo
document.querySelectorAll('[data-ampliar]').forEach(selo => {
  selo.addEventListener('click', () => abrirSelo(selo));
});

// Janela do formulário: todo link para o WhatsApp abre o envelope do contato,
// sem mostrar o número; o serviço do link já vem marcado
const servicoDoLink = {
  'sobre anúncios': 'Anúncios',
  'sobre fotos': 'Fotos e vídeos',
  'sobre criação de site': 'Criação de site'
};

const abrirFormulario = (link) => {
  const texto = decodeURIComponent((link.href.split('text=')[1] || '').replace(/\+/g, ' '));
  const copia = form.cloneNode(true);
  copia.classList.remove('revelar', 'visivel');
  copia.id = 'formJanela';
  copia.querySelectorAll('[id]').forEach(el => { el.id += '-janela'; });
  copia.querySelectorAll('label[for]').forEach(el => { el.htmlFor += '-janela'; });
  copia.querySelector('.form-aviso').textContent = '';

  const minusculo = texto.toLowerCase();
  if (!minusculo.includes('portf')) {
    Object.entries(servicoDoLink).forEach(([palavra, valor]) => {
      if (minusculo.includes(palavra)) copia.querySelector(`input[value="${valor}"]`).checked = true;
    });
  } else {
    copia.mensagem.value = texto.replace(/^Olá! /, '');
  }
  copia.addEventListener('submit', enviarFormulario);

  modalConteudo.className = 'modal-conteudo modal-formulario';
  modalConteudo.replaceChildren(copia);
  modalConteudo.scrollTop = 0;
  modal.setAttribute('aria-label', 'Pedir orçamento');

  if (!modal.open) {
    seloAberto = link;
    document.body.classList.add('modal-aberto');
    modal.classList.remove('fechando');
    modal.showModal();
  }
  copia.nome.focus();
};

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="wa.me/"]');
  if (!link) return;
  e.preventDefault();
  e.stopPropagation();
  abrirFormulario(link);
});

modalFechar.addEventListener('click', fecharSelo);

// clicar fora do selo também fecha
modal.addEventListener('click', (e) => {
  if (e.target === modal) fecharSelo();
});

// Esc: usa a mesma animação de saída
modal.addEventListener('cancel', (e) => {
  e.preventDefault();
  fecharSelo();
});

modal.addEventListener('close', () => {
  document.body.classList.remove('modal-aberto');
  // o foco volta ao botão "Ver mais" do selo (ou ao link do WhatsApp que abriu a janela)
  if (seloAberto) (seloAberto.querySelector('.ver-mais') || seloAberto).focus();
});

// Ano no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// Celular: as aves do topo ficam na altura dos selos, cada uma num vão entre dois selos
// (tucano entre o 1º e o 2º, arara entre o 2º e o 3º). Recalcula quando os selos mudam de altura.
(() => {
  const decoracao = document.querySelector('.hero .decoracao');
  const grade = document.querySelector('.hero .grade-tres');
  if (!decoracao || !grade) return;
  const aves = [decoracao.querySelector('.ave-tucano'), decoracao.querySelector('.ave-arara')];
  const celular = window.matchMedia('(max-width: 767px)');

  const posicionarAves = () => {
    if (!celular.matches) {
      aves.forEach(ave => ave && ave.style.removeProperty('--ave-topo'));
      return;
    }
    const selos = grade.querySelectorAll(':scope > .selo');
    aves.forEach((ave, i) => {
      if (!ave || !selos[i + 1]) return;
      // meio do vão entre o selo i e o seguinte, medido em offsetTop (ignora o deslocamento da
      // animação de entrada); a grade está dentro do hero, que é também a caixa da decoração
      const fimSelo = selos[i].offsetTop + selos[i].offsetHeight;
      const meioVao = grade.offsetTop + (fimSelo + selos[i + 1].offsetTop) / 2;
      // a cabeça da ave (terço de cima do desenho) fica no vão
      ave.style.setProperty('--ave-topo', Math.round(meioVao - ave.offsetHeight * 0.3) + 'px');
    });
  };

  if ('ResizeObserver' in window) new ResizeObserver(posicionarAves).observe(grade);
  celular.addEventListener('change', posicionarAves);
  window.addEventListener('load', posicionarAves);
  posicionarAves();
})();
