// Landing page estética · Ginga Mídia
// Troca o código da mensagem do WhatsApp pelo valor de ?origem= (ex.: ?origem=AN01),
// para a Ginga reconhecer de qual anúncio veio a conversa. Só aceita letras, números
// e hífen, até 20 caracteres; o valor nunca entra no HTML, só no endereço do link.
(function () {
    'use strict';

    var numero = '5516996076565';
    var codigoPadrao = 'estetica';
    var formatoValido = /^[A-Za-z0-9-]{1,20}$/;

    var codigo = codigoPadrao;
    try {
        var origem = new URLSearchParams(window.location.search).get('origem');
        if (origem && formatoValido.test(origem)) {
            codigo = origem;
        }
    } catch (erro) {
        codigo = codigoPadrao;
    }

    var mensagem = 'Olá! Tenho uma clínica de estética e quero uma proposta da Ginga. (código ' + codigo + ')';
    var endereco = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem);

    var links = document.querySelectorAll('a.zap');
    for (var i = 0; i < links.length; i++) {
        links[i].setAttribute('href', endereco);
    }
})();
