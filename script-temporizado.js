const TEMPO_PADRAO = 86400; // 24 horas em segundos

function getLocalStorageSafe(key, defaultValue = {}) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Erro ao acessar localStorage para a chave ${key}:`, e);
    return defaultValue;
  }
}

const armarios = getLocalStorageSafe('armarios-tempo', {});
const historico = getLocalStorageSafe('historico-tempo', {});
let intervalos = {};

function carregarArmariosTemporizados() {
  const grid = document.getElementById('armarios-tempo');
  if (!grid) return console.error('Elemento #armarios-tempo não encontrado');

  grid.innerHTML = '';

  for (let i = 1; i <= 40; i++) {
    const div = document.createElement('div');
    div.className = 'armario';
    div.id = `armario-tempo-${i}`;

    div.innerHTML = `
      <h3>Armário ${i}</h3>
      <input type="text" id="nome-tempo-${i}" placeholder="Nome do Acompanhante" required>
      <input type="text" id="prontuario-tempo-${i}" placeholder="Prontuário" required>
      <div class="cronometro" id="cronometro-tempo-${i}">00:00</div>
      <div class="botoes">
        <button onclick="emprestar(${i})">📦 Emprestar</button>
        <button onclick="devolver(${i})">✅ Devolver</button>
        <button onclick="consultarHistoricoTemporario(${i})">📜 Histórico</button>
      </div>
    `;

    grid.appendChild(div);

    if (armarios[i] && armarios[i].status === 'emprestado') {
      iniciarContagem(i, armarios[i].timestamp);
      document.getElementById(`nome-tempo-${i}`).value = armarios[i].nome;
      document.getElementById(`prontuario-tempo-${i}`).value = armarios[i].prontuario;
    }
  }
}

function emprestar(id) {
  const nome = document.getElementById(`nome-tempo-${id}`).value.trim();
  const prontuario = document.getElementById(`prontuario-tempo-${id}`).value.trim();

  if (!nome || !prontuario) {
    alert('Preencha todos os campos para emprestar.');
    return;
  }

  const timestamp = Date.now();
  armarios[id] = { nome, prontuario, timestamp, status: 'emprestado' };
  registrarHistorico(id, 'emprestado');
  salvar();
  iniciarContagem(id, timestamp);
}

function devolver(id) {
  if (!armarios[id]) return;
  registrarHistorico(id, 'devolvido');
  delete armarios[id];
  salvar();

  document.getElementById(`nome-tempo-${id}`).value = '';
  document.getElementById(`prontuario-tempo-${id}`).value = '';
  document.getElementById(`cronometro-tempo-${id}`).textContent = '00:00';
  clearInterval(intervalos[id]);

  const armario = document.getElementById(`armario-tempo-${id}`);
  armario.classList.remove('emprestado', 'atrasado');
}

function iniciarContagem(id, timestamp) {
  const cronometro = document.getElementById(`cronometro-tempo-${id}`);
  const armarioDiv = document.getElementById(`armario-tempo-${id}`);
  armarioDiv.classList.add('emprestado');
  armarioDiv.classList.remove('atrasado');

  function atualizar() {
    const agora = Date.now();
    const restante = TEMPO_PADRAO - Math.floor((agora - timestamp) / 1000);

    if (restante <= 0) {
      cronometro.textContent = 'Tempo Esgotado';
      armarioDiv.classList.add('atrasado');
      clearInterval(intervalos[id]);
    } else {
      const dias = Math.floor(restante / (24 * 3600));
      const horas = Math.floor((restante % (24 * 3600)) / 3600);
      const minutos = Math.floor((restante % 3600) / 60);
      const segundos = restante % 60;

      if (dias > 0) {
       cronometro.textContent = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
      } else {
         cronometro.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
      }

    }
  }

  atualizar();
  intervalos[id] = setInterval(atualizar, 1000);
}

function registrarHistorico(id, status) {
  if (!historico[id]) historico[id] = [];
  historico[id].push({
    data: new Date().toLocaleString('pt-BR'),
    status,
    nome: armarios[id]?.nome || '',
    prontuario: armarios[id]?.prontuario || ''
  });
  salvar();
}

function salvar() {
  try {
    localStorage.setItem('armarios-tempo', JSON.stringify(armarios));
    localStorage.setItem('historico-tempo', JSON.stringify(historico));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
    alert('Erro ao salvar dados. O navegador pode estar sem espaço.');
  }
}

function consultarHistoricoTemporario(id) {
  const historicoArmario = historico[id] || [];
  if (historicoArmario.length === 0) {
    alert(`Nenhum histórico encontrado para o Armário ${id}.`);
    return;
  }

  const modal = document.getElementById('modal-historico');
  const historicoTexto = document.getElementById('historico-texto');

  let historicoContent = `Histórico do Armário ${id}:

`;
  historicoArmario.forEach(entry => {
    historicoContent += `📅 ${entry.data}
`;
    historicoContent += `🔹 Status: ${entry.status}
`;
    historicoContent += `👤 Nome: ${entry.nome || 'N/A'}
`;
    historicoContent += `📋 Prontuário: ${entry.prontuario || 'N/A'}

`;
    historicoContent += '――――――――――――――――――――';
  });

  historicoTexto.textContent = historicoContent;
  modal.style.display = 'block';

  document.querySelector('.close').onclick = function () {
    modal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}

function exportarTemporarios() {
  const dados = [];

  for (let i = 1; i <= 40; i++) {
    const nome = document.getElementById('nome-tempo-' + i)?.value || '';
    const prontuario = document.getElementById('prontuario-tempo-' + i)?.value || '';
    if (!nome && !prontuario) continue;

    dados.push({ Nome: nome, Prontuário: prontuario });
  }

  const worksheet = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Armários Temporários");

  XLSX.writeFile(workbook, "armarios-temporarios.xlsx");
}
window.exportarDados = exportarTemporarios;

document.addEventListener('DOMContentLoaded', function () {
  carregarArmariosTemporizados();
});


window.filtrarArmariosTemporarios = () => {
  const filtro = document.getElementById('search-tempo').value.toLowerCase().trim();
  const match = (valor) =>
    valor === filtro || valor.startsWith(filtro + ' ') || valor.startsWith(filtro + '-');

  for (let i = 1; i <= 40; i++) {
    const nome = (document.getElementById('nome-tempo-' + i)?.value || '').toLowerCase();
    const prontuario = (document.getElementById('prontuario-tempo-' + i)?.value || '').toLowerCase();
    const armario = document.getElementById('armario-tempo-' + i);
    if (!armario) continue;
    armario.style.display = match(nome) || match(prontuario) ? 'block' : 'none';

    if (filtro === '') {
      armario.style.display = 'block';
      continue; 
    }
  }
};
