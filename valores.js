document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('armarios-valores');
  const armarios = JSON.parse(localStorage.getItem('armarios-valores')) || {};
  const historico = JSON.parse(localStorage.getItem('historico-valores')) || {};

  function criarArmarios() {
    container.innerHTML = '';
    for (let i = 1; i <= 300; i++) {
      const div = document.createElement('div');
      div.className = 'armario';
      div.id = `valor-${i}`;

      div.innerHTML = `
        <h3>Armário ${i}</h3>
        <input type="text" id="nome-valor-${i}" placeholder="Nome do Paciente">
        <input type="text" id="prontuario-valor-${i}" placeholder="Prontuário">
        <input type="text" id="itens-valor-${i}" placeholder="Itens Guardados">
        <input type="text" id="devolver-valor-${i}" placeholder="Devolvido a">
        <div class="botoes">
          <button onclick="guardarValor(${i})">📦 Guardar</button>
          <button onclick="devolverValor(${i})">✅ Devolvido</button>
          <button onclick="historicoValor(${i})">📜 Histórico</button>
        </div>
      `;

      container.appendChild(div);

      if (armarios[i]) {
        document.getElementById(`nome-valor-${i}`).value = armarios[i].nome;
        document.getElementById(`prontuario-valor-${i}`).value = armarios[i].prontuario;
        document.getElementById(`itens-valor-${i}`).value = armarios[i].itens;
        document.getElementById(`devolver-valor-${i}`).value = armarios[i].devolver;
        div.classList.add('guardado');
      }
    }
  }

  window.guardarValor = (id) => {
    const nome = document.getElementById(`nome-valor-${id}`).value.trim();
    const prontuario = document.getElementById(`prontuario-valor-${id}`).value.trim();
    const itens = document.getElementById(`itens-valor-${id}`).value.trim();
    
    if (!nome || !prontuario || !itens) {
      alert('Por favor, preencha Nome, Prontuário e Itens para guardar.');
      return;
    }

    armarios[id] = {
      nome,
      prontuario,
      itens,
      devolver: '', // inicia vazio
      status: 'guardado',
      data: Date.now()
    };

    
  salvar();
  registrarHistorico(id, 'guardado');
  criarArmarios();
};

  window.devolverValor = (id) => {
    const devolverPara = document.getElementById(`devolver-valor-${id}`).value.trim();
  
    if (!devolverPara) {
      alert('Por favor, preencha "Devolver Para" antes de marcar como Devolvido.');
      return;
    }
  
    if (!armarios[id]) return;
  
    armarios[id].devolver = devolverPara; // salva quem recebeu
    registrarHistorico(id, 'devolvido');
    delete armarios[id];
    salvar();
    criarArmarios();
  };
  

  function salvar() {
    localStorage.setItem('armarios-valores', JSON.stringify(armarios));
    localStorage.setItem('historico-valores', JSON.stringify(historico));
  }

  function registrarHistorico(id, status) {
    if (!historico[id]) historico[id] = [];
    historico[id].push({
      status,
      data: new Date().toLocaleString('pt-BR'),
      ...armarios[id]
    });
  }

  window.historicoValor = (id) => {
    const h = historico[id] || [];
    if (h.length === 0) {
      alert('Nenhum histórico disponível.');
      return;
    }

    let texto = `Histórico do Armário ${id}:\n\n`;
    h.forEach(item => {
      texto += `📅 ${item.data}\n🔹 Status: ${item.status}\n👤 Nome: ${item.nome}\n📋 Prontuário: ${item.prontuario}\n🎒 Itens: ${item.itens}\n🧾 Devolver Para: ${item.devolver}\n\n――――――――――――――――――――\n\n`;
    });

    const modal = document.getElementById('modal-historico');
    const textoEl = document.getElementById('historico-texto');
    textoEl.textContent = texto;
    modal.style.display = 'block';

    document.querySelector('.close').onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
    };
  };

  window.exportarValores = () => {
    if (Object.keys(armarios).length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    let csv = "data:text/csv;charset=utf-8,Armário,Nome,Prontuário,Itens,Devolver Para,Data\n";
    for (let i = 1; i <= 30; i++) {
      if (armarios[i]) {
        csv += `${i},${armarios[i].nome},${armarios[i].prontuario},${armarios[i].itens},${armarios[i].devolver},${new Date(armarios[i].data).toLocaleString('pt-BR')}\n`;
      }
    }

    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `valores_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  window.filtrarValores = () => {
    const filtro = document.getElementById('search-valores').value.toLowerCase().trim();
    const match = (valor) =>
      valor === filtro || valor.startsWith(filtro + ' ') || valor.startsWith(filtro + '-');
  
    for (let i = 1; i <= 300; i++) {
      const nome = (document.getElementById('nome-valor-' + i)?.value || '').toLowerCase();
      const prontuario = (document.getElementById('prontuario-valor-' + i)?.value || '').toLowerCase();
      const armario = document.getElementById('valor-' + i);
      if (!armario) continue;
      armario.style.display = match(nome) || match(prontuario) ? 'block' : 'none';

      if (filtro === '') {
        armario.style.display = 'block';
        continue; 
      }
    }
  };

  criarArmarios();

  });
  