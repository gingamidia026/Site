// Botão flutuante do WhatsApp com a cor do bloco atrás dele (início e landings · Ginga Mídia).
// Cada bloco pode ter data-cor-whats="azul-escuro|amarelo|papel"; sem o atributo, o botão fica
// no vermelho de sempre. Um IntersectionObserver olha uma faixa fina na altura do botão
// (perto do pé da tela) e troca só uma classe no botão; a cor e a transição ficam no CSS.
(function () {
    'use strict';

    var botao = document.querySelector('.whats-flutuante');
    if (!botao || !('IntersectionObserver' in window)) return;

    var blocos = document.querySelectorAll('main > section, body > section, body > footer');
    var classes = ['whats-azul-escuro', 'whats-amarelo', 'whats-papel'];
    var naFaixa = [];

    var aplicar = function () {
        // com dois blocos na faixa (na emenda entre eles), vale o de baixo, que está entrando
        var bloco = naFaixa.length ? naFaixa[naFaixa.length - 1] : null;
        var cor = bloco ? bloco.getAttribute('data-cor-whats') : null;
        classes.forEach(function (c) { botao.classList.toggle(c, c === 'whats-' + cor); });
    };

    var aoCruzar = function (entradas) {
        entradas.forEach(function (e) {
            var i = naFaixa.indexOf(e.target);
            if (e.isIntersecting && i < 0) naFaixa.push(e.target);
            if (!e.isIntersecting && i >= 0) naFaixa.splice(i, 1);
        });
        // mantém a ordem da página
        naFaixa.sort(function (a, b) {
            return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
        aplicar();
    };

    // root: document faz a faixa seguir a própria janela da página também dentro de um iframe
    // (moldura de conferência); navegador antigo sem esse recurso usa a janela principal.
    var observador;
    try {
        observador = new IntersectionObserver(aoCruzar, { root: document, rootMargin: '-91% 0px -5% 0px' });
    } catch (erro) {
        observador = new IntersectionObserver(aoCruzar, { rootMargin: '-91% 0px -5% 0px' });
    }

    blocos.forEach(function (b) { observador.observe(b); });
})();
