// Formulário em carta das landing pages (odonto e estética) · Ginga Mídia
// Só cuida do formulário e da janela do WhatsApp; o resto do script.js do início não é usado aqui.
// Todo link para o WhatsApp (a[href*="wa.me/"]) abre uma janela com o mesmo envelope do bloco
// da página, sem mostrar o número. O número fica só no href dos links; este arquivo o lê de lá.
// A mensagem diz de qual landing veio (data-origem) e leva o código do anúncio (data-codigo,
// que o script.js de cada landing troca pelo valor de ?origem=).
(function () {
    'use strict';

    var modal = document.getElementById('modalSelo');
    var modalConteudo = document.getElementById('modalConteudo');
    var modalFechar = document.getElementById('modalFechar');
    var formBloco = document.getElementById('formContato');
    if (!modal || !modalConteudo || !modalFechar || !formBloco) return;

    var origemDoFoco = null;

    // número do WhatsApp: lido do primeiro link da página, nunca escrito aqui
    var numeroDaPagina = function (link) {
        var alvo = link || document.querySelector('a[href*="wa.me/"]');
        var achado = alvo ? /wa\.me\/(\d+)/.exec(alvo.href) : null;
        return achado ? achado[1] : '';
    };

    var montarTexto = function (form, nome, servico, mensagem) {
        var origem = form.dataset.origem || 'página da Ginga';
        var codigo = form.dataset.codigo;
        return 'Olá! Meu nome é ' + nome + '.\n' +
            'Vim pela ' + origem + '.\n' +
            'Tenho interesse em: ' + servico + '.\n' +
            (mensagem ? 'Sobre a clínica: ' + mensagem + '\n' : '') +
            (codigo ? '(código ' + codigo + ')' : '');
    };

    var enviarFormulario = function (e) {
        e.preventDefault();
        var form = e.currentTarget;
        var aviso = form.querySelector('.form-aviso');
        var nome = form.nome.value.trim();
        var marcados = Array.prototype.map.call(
            form.querySelectorAll('input[name="servico"]:checked'),
            function (c) { return c.value; }
        );
        var servico = marcados.length ? marcados.join(', ') : 'ainda não sei, gostaria de conversar';
        var mensagem = form.mensagem.value.trim();

        if (!nome) {
            aviso.textContent = 'Por favor, informe seu nome.';
            form.nome.focus();
            return;
        }
        aviso.textContent = '';

        var numero = form.dataset.numero || numeroDaPagina();
        var url = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(montarTexto(form, nome, servico, mensagem));
        window.open(url, '_blank', 'noopener');
    };
    formBloco.addEventListener('submit', enviarFormulario);

    var abrirFormulario = function (link) {
        var copia = formBloco.cloneNode(true);
        copia.id = 'formJanela';
        copia.dataset.numero = numeroDaPagina(link);
        copia.querySelectorAll('[id]').forEach(function (el) { el.id += '-janela'; });
        copia.querySelectorAll('label[for]').forEach(function (el) { el.htmlFor += '-janela'; });
        copia.querySelector('.form-aviso').textContent = '';
        copia.addEventListener('submit', enviarFormulario);

        modalConteudo.className = 'modal-conteudo modal-formulario';
        modalConteudo.replaceChildren(copia);
        modalConteudo.scrollTop = 0;
        modal.setAttribute('aria-label', 'Pedir proposta');

        if (!modal.open) {
            origemDoFoco = link;
            document.body.classList.add('modal-aberto');
            modal.classList.remove('fechando');
            modal.showModal();
        }
        copia.nome.focus();
    };

    var fecharJanela = function () {
        if (!modal.open || modal.classList.contains('fechando')) return;
        var terminar = function () {
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

    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href*="wa.me/"]');
        if (!link) return;
        e.preventDefault();
        e.stopPropagation();
        abrirFormulario(link);
    });

    modalFechar.addEventListener('click', fecharJanela);
    // clicar fora da carta também fecha
    modal.addEventListener('click', function (e) { if (e.target === modal) fecharJanela(); });
    // Esc usa a mesma animação de saída
    modal.addEventListener('cancel', function (e) { e.preventDefault(); fecharJanela(); });
    modal.addEventListener('close', function () {
        document.body.classList.remove('modal-aberto');
        if (origemDoFoco) origemDoFoco.focus();
    });
})();
