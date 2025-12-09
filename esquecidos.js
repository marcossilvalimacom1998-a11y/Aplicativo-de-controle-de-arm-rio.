document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById ('armarios-esquecidos');
  const esquecidos = JSON.parse(localStorage.getItem('itens-esquecidos')) || {};

  function criarArmariosEsquecidos() {
    container.innerHTML = '';
    for (let i = 1; i <= 300; i++) {
      const div = document.createElement('div');
      div.className = 'armario';
      div.id = `esquecido-${i}`;

      div.innerHTML = `
        <h3>Armário ${i}</h3>
        <input type="text" id="nome-esquecido-${i}" placeholder="Nome do Paciente">
        <input type="text" id="prontuario-esquecido-${i}" placeholder="Prontuário">
        <input type="text" id="itens-esquecido-${i}" placeholder="Itens Guardados">
        <div class="botoes">
          <button onclick="guardarEsquecido(${i})">📦 Guardar</button>
          <button onclick="descartarEsquecido(${i})">🗑️ Descartar</button>
        </div>
      `;

      container.appendChild(div);

      if (esquecidos[i]) {
        document.getElementById(`nome-esquecido-${i}`).value = esquecidos[i].nome;
        document.getElementById(`prontuario-esquecido-${i}`).value = esquecidos[i].prontuario;
        document.getElementById(`itens-esquecido-${i}`).value = esquecidos[i].itens;
      
        const cronometro = document.createElement('div');
        cronometro.className = 'cronometro';
        cronometro.id = `cronometro-esquecido-${i}`;
        div.appendChild(cronometro);
      
        iniciarContagemRegressiva(i, esquecidos[i].data);
      }      
    }
  }

  window.guardarEsquecido = (id) => {
    const nome = document.getElementById(`nome-esquecido-${id}`).value.trim();
    const prontuario = document.getElementById(`prontuario-esquecido-${id}`).value.trim();
    const itens = document.getElementById(`itens-esquecido-${id}`).value.trim();
  
    if (!nome || !prontuario || !itens) {
      alert('Preencha todos os campos para guardar.');
      return;
    }
  
    esquecidos[id] = {
      nome,
      prontuario,
      itens,
      data: Date.now()
    };
  
    salvar();
  
    const busca = document.getElementById('search-esquecidos');
    const tinhaBusca = busca.value.trim(); // armazena antes de limpar
    
    busca.value = '';
    criarArmariosEsquecidos();
    if (tinhaBusca !== '') filtrarEsquecidos(); 
  };

  function salvar() {
    localStorage.setItem('itens-esquecidos', JSON.stringify(esquecidos));
  }

  window.exportarEsquecidos = () => {
    if (Object.keys(esquecidos).length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    let csv = "data:text/csv;charset=utf-8,Armário,Nome,Prontuário,Itens,Data\n";
    for (let i = 1; i <= 30; i++) {
      if (esquecidos[i]) {
        csv += `${i},${esquecidos[i].nome},${esquecidos[i].prontuario},${esquecidos[i].itens},${new Date(esquecidos[i].data).toLocaleString('pt-BR')}\n`;
      }
    }

    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `esquecidos_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

window.filtrarEsquecidos = () => {
  const filtro = document.getElementById('search-esquecidos').value.toLowerCase().trim();
  const match = (valor) =>
    valor === filtro || valor.startsWith(filtro + ' ') || valor.startsWith(filtro + '-');

  for (let i = 1; i <= 300; i++) {
    const nome = (document.getElementById('nome-esquecido-' + i)?.value || '').toLowerCase();
    const prontuario = (document.getElementById('prontuario-esquecido-' + i)?.value || '').toLowerCase();
    const armario = document.getElementById('esquecido-' + i);
    if (!armario) continue;
    armario.style.display = match(nome) || match(prontuario) ? 'block' : 'none';
    
    if (filtro === '') {
      armario.style.display = 'block';
      continue; 
    }
  }
};

window.descartarEsquecido = (id) => {
  if (confirm("Tem certeza que deseja descartar este item?")) {
    delete esquecidos[id];
    salvar();
    criarArmariosEsquecidos();
  }
};

function iniciarContagemRegressiva(id, timestamp) {
  const cronometro = document.getElementById(`cronometro-esquecido-${id}`);
  const armario = document.getElementById(`esquecido-${id}`);
  if (!cronometro || !armario) return;

  const totalSegundos = 30 * 24 * 60 * 60; // 30 dias em segundos
  let alertaMostrado = false;

  function atualizar() {
    const agora = Date.now();
    const segundosPassados = Math.floor((agora - timestamp) / 1000);
    const restante = totalSegundos - segundosPassados;

    if (restante <= 0) {
      cronometro.textContent = '⏰ Prazo Vencido';
      
      // APLICA ESTILO VISUAL
      armario.classList.add('vencido');
      armario.classList.remove('guardado');

      // LOG PRA TESTE
      console.log(`⚠️ Armário ${id} vencido — classe aplicada.`);

      if (!alertaMostrado) {
        alertaMostrado = true;
        alert(`⚠️ Item do Armário ${id} está vencido!`);
      }

      return;
    }

    const dias = Math.floor(restante / (24 * 3600));
    const horas = Math.floor((restante % (24 * 3600)) / 3600);
    const minutos = Math.floor((restante % 3600) / 60);
    const segundos = restante % 60;

    cronometro.textContent = `⏳ ${dias}d ${horas}h ${minutos}m ${segundos}s`;
  }

  atualizar();
  setInterval(atualizar, 1000);
}

criarArmariosEsquecidos();

});