// Menu mobile
const botao = document.getElementById('menuBotao');
const menu = document.getElementById('menu');

botao.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  botao.setAttribute('aria-expanded', aberto);
  botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});

menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
  });
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

// Cartaz justificado: cada linha ganha o tamanho que a faz ocupar a largura do bloco
const justificar = () => {
  document.querySelectorAll('[data-justificar]').forEach(titulo => {
    const largura = titulo.clientWidth;
    titulo.querySelectorAll('span').forEach(linha => {
      linha.style.fontSize = '100px';
      const tamanho = Math.min(100 * largura / linha.scrollWidth, 150);
      linha.style.fontSize = tamanho.toFixed(1) + 'px';
    });
  });
};
document.fonts.ready.then(justificar);
window.addEventListener('load', justificar);
let espera;
window.addEventListener('resize', () => {
  clearTimeout(espera);
  espera = setTimeout(justificar, 120);
});

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
  copia.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  ['role', 'tabindex', 'aria-haspopup', 'aria-label', 'data-ampliar'].forEach(a => copia.removeAttribute(a));
  copia.classList.remove('revelar', 'visivel');

  if (ehFicha) {
    modalConteudo.className = 'modal-conteudo modal-ficha';
  } else {
    modalConteudo.className = 'modal-conteudo selo';
    cores.forEach(c => { if (selo.classList.contains(c)) modalConteudo.classList.add(c); });
  }
  modalConteudo.replaceChildren(copia);
  modalConteudo.scrollTop = 0;

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

document.querySelectorAll('[data-ampliar]').forEach(selo => {
  selo.addEventListener('click', () => abrirSelo(selo));
  selo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrirSelo(selo);
    }
  });
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
  if (seloAberto) seloAberto.focus();
});

// Linha tracejada ligando os passos: curvas e uma volta entre cada cartão
const passos = document.getElementById('passos');
const desenharLinha = () => {
  if (!passos) return;
  let svg = passos.querySelector('.passos-linha');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('passos-linha');
    svg.setAttribute('aria-hidden', 'true');
    svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    passos.prepend(svg);
  }
  const base = passos.getBoundingClientRect();
  const caixas = [...passos.querySelectorAll(':scope > .selo')].map(c => {
    const r = c.getBoundingClientRect();
    return { x: r.left - base.left, y: r.top - base.top, l: r.width, a: r.height };
  });
  const p = (n) => n.toFixed(1);
  let d = '';
  for (let i = 0; i < caixas.length - 1; i++) {
    const c = caixas[i], prox = caixas[i + 1];
    const mesmaLinha = Math.abs(prox.y - c.y) < c.a / 2;
    let x1, y1, x2, y2;
    const r = 13;
    if (mesmaLinha) {
      // sai pela direita, faz uma volta por cima e entra pela esquerda do próximo
      x1 = c.x + c.l - 4; y1 = c.y + c.a * .4; x2 = prox.x + 4; y2 = prox.y + prox.a * .6;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      d += `M${p(x1)},${p(y1)} C${p(x1 + 30)},${p(y1 + 40)} ${p(mx - 24)},${p(my + 24)} ${p(mx)},${p(my)} ` +
        `a${r},${r} 0 1,0 0,${-2 * r} a${r},${r} 0 1,0 0,${2 * r} ` +
        `C${p(mx + 24)},${p(my - 24)} ${p(x2 - 30)},${p(y2 - 40)} ${p(x2)},${p(y2)} `;
    } else {
      // sai por baixo de um lado, faz uma volta e entra por cima do outro lado do próximo
      const lado = i % 2 ? -1 : 1;
      x1 = c.x + c.l * (lado > 0 ? .3 : .7); y1 = c.y + c.a - 4;
      x2 = prox.x + prox.l * (lado > 0 ? .7 : .3); y2 = prox.y + 4;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      d += `M${p(x1)},${p(y1)} C${p(x1)},${p(y1 + 40)} ${p(mx - lado * 40)},${p(my + 6)} ${p(mx)},${p(my)} ` +
        `a${r},${r} 0 1,${lado > 0 ? 0 : 1} ${p(lado * 2 * r)},0 a${r},${r} 0 1,${lado > 0 ? 0 : 1} ${p(-lado * 2 * r)},0 ` +
        `C${p(mx + lado * 40)},${p(my - 6)} ${p(x2)},${p(y2 - 40)} ${p(x2)},${p(y2)} `;
    }
  }
  svg.firstChild.setAttribute('d', d);
};
document.fonts.ready.then(desenharLinha);
window.addEventListener('load', desenharLinha);
window.addEventListener('resize', () => requestAnimationFrame(desenharLinha));
// os cartões entram deslizando: redesenha quando param
if (passos) passos.addEventListener('transitionend', desenharLinha);

// Ano no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();
