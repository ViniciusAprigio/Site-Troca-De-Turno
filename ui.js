/* =========================================================
   Sistema de Troca de Turno — funções compartilhadas
   (modais, login do histórico, toasts e formatação)
   ========================================================= */
(function () {
  const CONTATO = {
    email: 'vinicius.ap.oliveira@arcelormittal.com.br',
    telefone: '+55 (27) 99728-1745',
    telefoneLink: '+5527997281745'
  };

  const ICONES = {
    fechar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>',
    telefone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
  };
  window.ICONES = ICONES;

  /* ---------- Utilidades ---------- */

  // Escapa texto antes de colocar no HTML (evita que um registro "quebre" a página)
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  window.esc = esc;

  window.formatarDataBR = iso => {
    if (!iso || !String(iso).includes('-')) return '';
    const [ano, mes, dia] = String(iso).split('-');
    return `${dia}/${mes}/${ano}`;
  };

  window.formatarDataHora = ts => ts
    ? new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : '';

  window.dataHojeISO = () => {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  window.chipTurno = (turno, letra) => {
    const t = String(turno || '');
    const noite = t.toLowerCase().startsWith('noite');
    const nome = t.split(' (')[0] || '—';
    return `<span class="chip ${noite ? 'noite' : ''}" title="${esc(t)}">` +
           `<span class="chip-letra">${esc(letra || '?')}</span>${esc(nome)}</span>`;
  };

  const fotoSegura = src => (typeof src === 'string' && src.startsWith('data:image/')) ? src : '';

  window.htmlDetalhe = (reg, opcoes = {}) => {
    const foto = fotoSegura(reg.foto);
    const auditoria = opcoes.auditoria ? `
        <div class="detalhe-item"><span class="detalhe-rotulo">Última edição por</span>${esc(reg.updatedBy || reg.createdBy)}</div>
        <div class="detalhe-item"><span class="detalhe-rotulo">Última alteração</span>${esc(formatarDataHora(reg.updatedAt || reg.createdAt))}</div>` : '';

    return `
      <div class="detalhe">
        <div class="detalhe-topo">
          <div>
            <div class="detalhe-nome">${esc(reg.nome)}</div>
            <div class="detalhe-sub">Matrícula ${esc(reg.matricula)}</div>
          </div>
          ${chipTurno(reg.turno, reg.letra)}
        </div>

        <div class="detalhe-grid">
          <div class="detalhe-item"><span class="detalhe-rotulo">Número da OP</span>${esc(reg.op)}</div>
          <div class="detalhe-item"><span class="detalhe-rotulo">Data</span>${esc(reg.dataBR || formatarDataBR(reg.data))}</div>
          <div class="detalhe-item"><span class="detalhe-rotulo">Centro de trabalho</span>${esc(reg.centroTrabalho)}</div>
          ${auditoria}
        </div>

        <div class="detalhe-bloco">
          <span class="detalhe-rotulo">Descrição da atividade</span>
          <p>${esc(reg.descricao) || '—'}</p>
        </div>

        ${foto
          ? `<div class="detalhe-foto"><span class="detalhe-rotulo">Foto anexada</span><img src="${esc(foto)}" alt="Foto anexada ao registro"></div>`
          : `<div class="sem-foto">Nenhuma foto anexada neste registro.</div>`}
      </div>`;
  };

  window.linhaVazia = (colunas, html) =>
    `<tr><td class="td-vazio" colspan="${colunas}">${html}</td></tr>`;

  window.linhaCarregando = colunas =>
    linhaVazia(colunas, '<span class="spinner"></span>Carregando registros…');

  window.carregando = (botao, ativo, textoCarregando = 'Enviando…') => {
    if (ativo) {
      botao.dataset.textoOriginal = botao.innerHTML;
      botao.textContent = textoCarregando;
      botao.classList.add('carregando');
      botao.disabled = true;
    } else {
      botao.innerHTML = botao.dataset.textoOriginal || botao.innerHTML;
      botao.classList.remove('carregando');
      botao.disabled = false;
    }
  };

  // ATENÇÃO: esta verificação roda no navegador e não protege os dados de verdade.
  // Para segurança real, use Firebase Authentication + regras do Firestore.
  window.validarSupervisor = (usuario, senha) => usuario === 'Supervisor' && senha === 'Supervisor';

  /* ---------- Modais compartilhados + área de toasts ---------- */
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-fundo" id="modalSobre" role="dialog" aria-modal="true" aria-labelledby="tituloSobre">
      <div class="modal-box">
        <div class="modal-cabecalho">
          <h3 id="tituloSobre">Sobre</h3>
          <button type="button" class="btn-x" data-fechar aria-label="Fechar">${ICONES.fechar}</button>
        </div>
        <p class="modal-texto" style="text-align:left;margin:0">
          Este site foi criado para melhorar a eficiência da troca de turno e facilitar a visualização das informações para todos.
        </p>
      </div>
    </div>

    <div class="modal-fundo" id="modalContato" role="dialog" aria-modal="true" aria-labelledby="tituloContato">
      <div class="modal-box">
        <div class="modal-cabecalho">
          <h3 id="tituloContato">Contato</h3>
          <button type="button" class="btn-x" data-fechar aria-label="Fechar">${ICONES.fechar}</button>
        </div>
        <a class="contato-item" href="mailto:${CONTATO.email}">${ICONES.email}${CONTATO.email}</a>
        <a class="contato-item" href="tel:${CONTATO.telefoneLink}">${ICONES.telefone}${CONTATO.telefone}</a>
      </div>
    </div>

    <div class="modal-fundo" id="modalHistorico" role="dialog" aria-modal="true" aria-labelledby="tituloLoginHistorico">
      <div class="modal-box">
        <img src="logo.png" alt="ArcelorMittal" class="modal-logo">
        <h3 class="modal-titulo" id="tituloLoginHistorico">Acesso ao histórico</h3>
        <p class="modal-texto">Área restrita ao supervisor.</p>

        <form id="formLoginHistorico">
          <div class="campo">
            <label class="rotulo" for="usuarioHistorico">Usuário</label>
            <input type="text" id="usuarioHistorico" placeholder="Digite o usuário" autocomplete="username">
          </div>
          <div class="campo">
            <label class="rotulo" for="senhaHistorico">Senha</label>
            <input type="password" id="senhaHistorico" placeholder="Digite a senha" autocomplete="current-password">
          </div>
          <div class="erro-login" id="erroLogin">Usuário ou senha incorretos.</div>
          <div class="modal-acoes">
            <button type="button" class="btn btn-sec" data-fechar>Cancelar</button>
            <button type="submit" class="btn">Entrar</button>
          </div>
        </form>
      </div>
    </div>

    <div class="toasts" id="toasts" aria-live="polite"></div>
  `);

  /* ---------- Abrir / fechar modais ---------- */
  window.abrirModal = id => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('aberto');
    document.body.classList.add('sem-scroll');
    const campo = modal.querySelector('input:not([type=hidden]), select, textarea');
    if (campo) setTimeout(() => campo.focus(), 60);
  };

  window.fecharModal = id => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('aberto');
    if (!document.querySelector('.modal-fundo.aberto')) document.body.classList.remove('sem-scroll');
  };

  document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('modal-fundo')) fecharModal(e.target.id);
    const botaoFechar = e.target.closest('[data-fechar]');
    if (botaoFechar) fecharModal(botaoFechar.closest('.modal-fundo').id);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-fundo.aberto').forEach(m => fecharModal(m.id));
    }
  });

  /* ---------- Login do histórico ---------- */
  const mostrarErro = el => {
    el.classList.remove('visivel');
    void el.offsetWidth; // reinicia a animação
    el.classList.add('visivel');
  };
  window.mostrarErro = mostrarErro;

  window.abrirLoginHistorico = () => {
    document.getElementById('formLoginHistorico').reset();
    document.getElementById('erroLogin').classList.remove('visivel');
    abrirModal('modalHistorico');
  };

  document.getElementById('formLoginHistorico').addEventListener('submit', e => {
    e.preventDefault();
    const usuario = document.getElementById('usuarioHistorico').value.trim();
    const senha = document.getElementById('senhaHistorico').value.trim();
    if (validarSupervisor(usuario, senha)) {
      window.location.href = 'historico.html';
    } else {
      mostrarErro(document.getElementById('erroLogin'));
    }
  });

  /* ---------- Toasts (substituem os alert) ---------- */
  window.toast = (mensagem, tipo = 'sucesso') => {
    const el = document.createElement('div');
    el.className = `toast ${tipo}`;
    el.textContent = mensagem;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => {
      el.classList.add('saindo');
      setTimeout(() => el.remove(), 300);
    }, 3500);
  };

  /* ---------- Ano do rodapé ---------- */
  document.querySelectorAll('[data-ano]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
