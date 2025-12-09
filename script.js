document.addEventListener('DOMContentLoaded', () => {
    const armariosGrid = document.getElementById('armarios-grid');
    const armarios = JSON.parse(localStorage.getItem('armarios-100')) || {};
    const historico = JSON.parse(localStorage.getItem('historico-100')) || {};

    // Create locker grid
    for (let i = 1; i <= 300; i++) {
        const armario = document.createElement('div');
        armario.classList.add('armario');
        armario.id = `armario-${i}`;
        
        armario.innerHTML = `
            <h3>Armário ${i}</h3>
            <div class="inputs">
                <input type="text" id="nome-${i}" placeholder="Nome do Paciente" required>
                <input type="text" id="prontuario-${i}" placeholder="Nº do Prontuário" required>
                <input type="text" id="objetos-${i}" placeholder="Objetos no Armário" required>
                <input type="text" id="recebido-${i}" placeholder="Devolvido a">
            </div>
            <div class="botoes">
                <button onclick="mudarStatus(${i}, 'emprestado')">🔄 Em Uso</button>
                <button onclick="mudarStatus(${i}, 'devolvido-total')">✔️ Devolvido</button>
                <button onclick="consultarHistorico(${i})">📜 Histórico</button>
            </div>
        `;

        armariosGrid.appendChild(armario);

        // Load saved data
        if (armarios[i]) {
            if (armarios[i].status !== 'devolvido-total') {
                document.getElementById(`nome-${i}`).value = armarios[i].nome || '';
                document.getElementById(`prontuario-${i}`).value = armarios[i].prontuario || '';
                document.getElementById(`objetos-${i}`).value = armarios[i].objetos || '';
                document.getElementById(`recebido-${i}`).value = armarios[i].recebido || '';
            }
            armario.classList.add(armarios[i].status);
        }
    }

    window.mudarStatus = (id, status) => {
        const nome = sanitizeInput(`nome-${id}`);
        const prontuario = sanitizeInput(`prontuario-${id}`);
        const objetos = sanitizeInput(`objetos-${id}`);
        const recebido = sanitizeInput(`recebido-${id}`);

        if (!nome || !prontuario || !objetos) {
            alert('Por favor, preencha Nome, Prontuário e Objetos.');
            return;
        }

        if (status === 'devolvido-total' && !recebido) {
            alert('Por favor, preencha "Recebido por" antes de marcar como Devolvido.');
            return;
        }

        armarios[id] = { nome, prontuario, objetos, recebido, status };
        localStorage.setItem('armarios-100', JSON.stringify(armarios));
        registrarHistorico(id, status);

        const armario = document.getElementById(`armario-${id}`);
        armario.className = 'armario';
        armario.classList.add(status);

        if (status === 'devolvido-total') {
            limparCampos(id);
        }
    };

    function registrarHistorico(id, status) {
        if (!historico[id]) historico[id] = [];
        historico[id].push({
            data: new Date().toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            status,
            nome: armarios[id]?.nome || '',
            prontuario: armarios[id]?.prontuario || '',
            objetos: armarios[id]?.objetos || '',
            recebido: armarios[id]?.recebido || ''
        });
        localStorage.setItem('historico-100', JSON.stringify(historico));
    }

    function limparCampos(id) {
        document.getElementById(`nome-${id}`).value = '';
        document.getElementById(`prontuario-${id}`).value = '';
        document.getElementById(`objetos-${id}`).value = '';
        document.getElementById(`recebido-${id}`).value = '';
    }

    function sanitizeInput(id) {
        return document.getElementById(id).value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    window.consultarHistorico = (id) => {
        const historicoArmario = historico[id] || [];
        if (historicoArmario.length === 0) {
            alert(`Nenhum histórico encontrado para o Armário ${id}.`);
            return;
        }
        
        // Create modal content
        const modal = document.getElementById('modal-historico');
        const historicoTexto = document.getElementById('historico-texto');
        
        let historicoContent = `Histórico do Armário ${id}:\n\n`;
        historicoArmario.forEach(entry => {
            historicoContent += `📅 ${entry.data}\n`;
            historicoContent += `🔹 Status: ${formatStatus(entry.status)}\n`;
            historicoContent += `👤 Nome: ${entry.nome || 'N/A'}\n`;
            historicoContent += `📋 Prontuário: ${entry.prontuario || 'N/A'}\n`;
            historicoContent += `🎒 Objetos: ${entry.objetos || 'N/A'}\n`;
            historicoContent += `🖊️ Recebido por: ${entry.recebido || 'N/A'}\n\n`;
            historicoContent += '――――――――――――――――――――\n\n';
        });
        
        historicoTexto.textContent = historicoContent;
        modal.style.display = 'block';
        
        // Close modal when clicking X
        document.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
        };
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    };

    function formatStatus(status) {
        const statusMap = {
            'emprestado': 'Em Uso',
            'devolvido-total': 'Devolvido'
        };
        return statusMap[status] || status;
    }

    function exportarDados() {
        const dados = [];
      
        for (let i = 1; i <= 300; i++) {
          const nome = document.getElementById('nome-' + i)?.value || '';
          const prontuario = document.getElementById('prontuario-' + i)?.value || '';
          if (!nome && !prontuario) continue;
      
          dados.push({ Nome: nome, Prontuário: prontuario });
        }
      
        const worksheet = XLSX.utils.json_to_sheet(dados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Armários");
      
        XLSX.writeFile(workbook, "armarios.xlsx");
      }
      window.exportarDados = exportarDados;


window.filtrarArmarios = () => {
  const filtro = document.getElementById('search').value.toLowerCase().trim();
  const match = (valor) =>
    valor === filtro || valor.startsWith(filtro + ' ') || valor.startsWith(filtro + '-');

  for (let i = 1; i <= 300; i++) {
    const nome = (document.getElementById('nome-' + i)?.value || '').toLowerCase();
    const prontuario = (document.getElementById('prontuario-' + i)?.value || '').toLowerCase();
    const armario = document.getElementById('armario-' + i);
    if (!armario) continue;
    armario.style.display = match(nome) || match(prontuario) ? 'block' : 'none';

    if (filtro === '') {
        armario.style.display = 'block';
        continue; 
      }
  }
};
});