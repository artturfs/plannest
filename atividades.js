const tabs = document.querySelectorAll('.tab-btn');
const all_content = document.querySelectorAll('.content');
const subjectDetailTabs = document.querySelectorAll('.tab-btn-detail');
const subjectDetailContents = document.querySelectorAll('.content-detail');
 
const mainActivityView = document.querySelector('.main-activity-view');
const subjectDetailView = document.querySelector('.subject-detail-view');
const mainTitle = document.getElementById('mainTitle');
 
const charts = {};
let chartCurrentSubjectInstance = null;
 
let currentSubjectKey = null;
let currentSubjectDisplayName = null;
 
// Carrega matérias existentes do localStorage ou usa as padrão
let materias = JSON.parse(localStorage.getItem('materiasData')) || {
  'Artes': 'atividadesArtes',
  'Biologia': 'atividadesBiologia',
  'Ed. Física': 'atividadesEdFisica',
  'Espanhol': 'atividadesEspanhol',
  'Filosofia e Sociologia': 'atividadesFilosofiaSociologia',
  'Física': 'atividadesFisica',
  'Geografia': 'atividadesGeografia',
  'História': 'atividadesHistoria',
  'Inglês': 'atividadesIngles',
  'Matemática': 'atividadesMatematica',
  'Português': 'atividadesPortugues',
  'Química': 'atividadesQuimica'
};
 
// Matérias que não podem ser removidas
const baseSubjects = [
  'Artes', 'Biologia', 'Ed. Física', 'Espanhol',
  'Filosofia e Sociologia', 'Física', 'Geografia',
  'História', 'Inglês', 'Matemática', 'Português', 'Química'
];
 
// Ícones das matérias
let subjectIcons = JSON.parse(localStorage.getItem('subjectIcons')) || {
    'artes': 'imagens/artes.png',
    'biologia': 'imagens/biologia.png',
    'edfisica': 'imagens/edfisica.png',
    'espanhol': 'imagens/linguas.png',
    'filosofiaesociologia': 'imagens/lampada.png',
    'fisica': 'imagens/fisica.png',
    'geografia': 'imagens/geografia.png',
    'historia': 'imagens/historia.png',
    'ingles': 'imagens/linguas.png',
    'matematica': 'imagens/matematica.png',
    'portugues': 'imagens/portugues.png',
    'quimica': 'imagens/quimica.png'
};
 
function saveMateriasData() {
    localStorage.setItem('materiasData', JSON.stringify(materias));
    localStorage.setItem('subjectIcons', JSON.stringify(subjectIcons));
}
 
function normalizeString(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}
 
// --- FUNÇÕES GERAIS ---
function carregarAtividades(materiaKey) {
    return JSON.parse(localStorage.getItem(materiaKey)) || [];
}
 
function salvarAtividades(materiaKey, atividades) {
    localStorage.setItem(materiaKey, JSON.stringify(atividades));
}
 
// --- GESTÃO DE ATIVIDADES ---
function renderizarAtividades() {
    const lista = document.getElementById('lista-atividades');
    lista.innerHTML = '';
    if (!currentSubjectKey) {
        lista.innerHTML = '<p>Nenhuma matéria selecionada para carregar atividades.</p>';
        return;
    }
 
    let atividades = carregarAtividades(currentSubjectKey);
 
    atividades.sort((a, b) => {
        if (a.concluida && !b.concluida) return 1;
        if (!a.concluida && b.concluida) return -1;
 
        if (a.dataEntrega && b.dataEntrega) {
            return new Date(a.dataEntrega) - new Date(b.dataEntrega);
        }
        if (a.dataEntrega && !b.dataEntrega) return -1;
        if (!a.dataEntrega && b.dataEntrega) return 1;
 
        return 0;
    });
 
    atividades.forEach((atividade, index) => {
        const li = document.createElement('li');
        li.className = `atividade-item ${getColorByDueDate(atividade.dataEntrega, atividade.concluida)}`;
 
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'atividade-checkbox';
        checkbox.checked = atividade.concluida;
        checkbox.addEventListener('change', function() {
            atividades[index].concluida = checkbox.checked;
            salvarAtividades(currentSubjectKey, atividades);
            renderizarAtividades();
            updatePerformanceMetrics();
            renderizarGraficoMateriaAtual();
            renderizarGraficoDesempenhoGeral();
        });
        li.appendChild(checkbox);
 
        const infoDiv = document.createElement('div');
        infoDiv.className = 'atividade-info';
 
        const title = document.createElement('h3');
        title.textContent = atividade.titulo;
        infoDiv.appendChild(title);
 
        if (atividade.descricao) {
            const description = document.createElement('p');
            description.textContent = atividade.descricao;
            infoDiv.appendChild(description);
        }
 
        if (atividade.dataEntrega) {
            const date = document.createElement('p');
            date.className = 'data-entrega';
            const dataObj = new Date(atividade.dataEntrega + 'T00:00:00');
            const formattedDate = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            date.textContent = `Entrega: ${formattedDate}`;
            infoDiv.appendChild(date);
        }
        li.appendChild(infoDiv);
 
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = '×';
        btnExcluir.className = 'btn-excluir';
        btnExcluir.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir esta atividade?')) {
                atividades.splice(index, 1);
                salvarAtividades(currentSubjectKey, atividades);
                renderizarAtividades();
                updatePerformanceMetrics();
                renderizarGraficoMateriaAtual();
                renderizarGraficoDesempenhoGeral();
            }
        });
        li.appendChild(btnExcluir);
        lista.appendChild(li);
    });
}
 
function getColorByDueDate(dueDate, isConcluida) {
    if (isConcluida) {
        return 'concluida';
    }
 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
 
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 
    if (diffDays < 1) {
        return 'atrasada';
    } else if (diffDays <= 4) {
        return 'proximo-vencimento';
    } else {
        return 'futuro';
    }
}
 
// Adicionar Atividade
document.getElementById('atividade-form').addEventListener('submit', function(event) {
    event.preventDefault();
 
    if (!currentSubjectKey) {
        console.error("Erro: currentSubjectKey não está definido.");
        alert("Erro ao adicionar atividade. Por favor, selecione uma matéria.");
        return;
    }
 
    const titulo = document.getElementById('titulo-atividade').value.trim();
    const descricao = document.getElementById('descricao-atividade').value.trim();
    const dataEntrega = document.getElementById('data-entrega').value;
 
    if (titulo === "") {
        alert("Por favor, preencha o título da atividade.");
        return;
    }
 
    let atividades = carregarAtividades(currentSubjectKey);
    const novaAtividade = {
        titulo: titulo,
        descricao: descricao,
        dataEntrega: dataEntrega,
        concluida: false
    };
    atividades.push(novaAtividade);
    salvarAtividades(currentSubjectKey, atividades);
 
    document.getElementById('atividade-form').reset();
    renderizarAtividades();
    updatePerformanceMetrics();
    renderizarGraficoMateriaAtual();
    renderizarGraficoDesempenhoGeral();
 
    console.log(`Atividade "${titulo}" salva em ${currentSubjectKey}. Dados salvos:`, JSON.parse(localStorage.getItem(currentSubjectKey)));
});
 
// --- FUNÇÃO DE COMPARTILHAMENTO GERAL ---
document.addEventListener('DOMContentLoaded', () => {
  const shareAllBtn = document.getElementById('shareAllBtn');
 
  if (shareAllBtn) {
    shareAllBtn.addEventListener('click', async () => {
      const atividadesPorMateria = [];
 
      for (const displayName in materias) {
        const materiaKey = materias[displayName];
        let atividades = [];
        try {
          atividades = JSON.parse(localStorage.getItem(materiaKey)) || [];
        } catch (e) {
          console.error(`Erro ao parsear atividades para a chave: ${materiaKey}`, e);
          continue;
        }

        let atividadesText = `📘 *${displayName}*\n`;
 
        if (atividades.length > 0) {
          atividades.forEach(atividade => {
            const entrega = atividade.dataEntrega ? atividade.dataEntrega : "Sem data definida";
            atividadesText += `   • ${atividade.titulo}  _(Entrega: ${entrega})_\n`;
          });
        } else {
          atividadesText += `   - Nenhuma atividade registrada.\n`;
        }
 
        atividadesPorMateria.push(atividadesText);
      }
 
      let textoCompleto = "📚 *Resumo das Minhas Atividades*\n\n";
      textoCompleto += atividadesPorMateria.join('\n');
 
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Resumo das Minhas Atividades',
            text: textoCompleto
          });
          console.log("Resumo compartilhado com sucesso!");
        } catch (error) {
          console.error("Erro ao compartilhar:", error);
        }
      } else {
        alert("A função de compartilhamento não é suportada neste navegador.");
      }
    });
  }
});
 
 
// --- GESTÃO DE CARDS DE MATÉRIAS ---
function renderSubjectCards() {
    const container = document.getElementById('subject-cards-container');
    const addNewCard = document.getElementById('addNewSubjectCard');
 
    while (container.firstChild && container.firstChild !== addNewCard) {
        container.removeChild(container.firstChild);
    }
 
    for (const displayName in materias) {
        const materiaKey = materias[displayName];
        const normalizedName = normalizeString(displayName);
        const iconPath = subjectIcons[normalizedName] || 'imagens/caderno.png';
 
        const displayMateriaName = (displayName === 'Filosofia e Sociologia') ? 'Filosofia e<br>Sociologia' : displayName;
        const isBaseSubject = baseSubjects.includes(displayName);
 
        const card = document.createElement('section');
        card.className = 'card';
        card.innerHTML = `
            <a href="#" class="subject-card-link"
               data-subject-key="${materiaKey}"
               data-subject-display-name="${displayName.replace(/"/g, '&quot;')}"
               data-subject-icon="${iconPath}">
                 <img src="${iconPath}" class="icon"/>
                 <h3 class="materia">${displayMateriaName}</h3>
            </a>
            ${!isBaseSubject ? `
            <button class="remove-subject-btn"
                    data-subject-key="${materiaKey}"
                    data-subject-display-name="${displayName.replace(/"/g, '&quot;')}"
                    aria-label="Remover ${displayName}">X</button>
            ` : ''}
        `;
        addNewCard.insertAdjacentElement('beforebegin', card);
    }
 
    addNewCard.removeEventListener('click', openModal);
    addNewCard.addEventListener('click', openModal);
 
    container.querySelectorAll('.subject-card-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const subjectKey = link.getAttribute('data-subject-key');
            const subjectDisplayName = link.getAttribute('data-subject-display-name');
            showSubjectDetail(subjectKey, subjectDisplayName);
        });
    });
 
    container.querySelectorAll('.remove-subject-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const subjectKeyToDelete = button.getAttribute('data-subject-key');
            const subjectDisplayNameToDelete = button.getAttribute('data-subject-display-name');
 
            if (baseSubjects.includes(subjectDisplayNameToDelete)) {
                alert('Não é possível remover matérias base.');
                return;
            }
 
            if (confirm(`Tem certeza que deseja remover a matéria "${subjectDisplayNameToDelete}" e todas as suas atividades? Esta ação não pode ser desfeita.`)) {
                for (const displayName in materias) {
                    if (materias[displayName] === subjectKeyToDelete) {
                        delete materias[displayName];
                        break;
                    }
                }
                const normalizedName = normalizeString(subjectDisplayNameToDelete);
                if (subjectIcons[normalizedName]) {
                    delete subjectIcons[normalizedName];
                }
                localStorage.removeItem(subjectKeyToDelete);
 
                saveMateriasData();
                renderSubjectCards();
                renderizarGraficoDesempenhoGeral();
 
                if (currentSubjectKey === subjectKeyToDelete) {
                    hideSubjectDetail();
                }
                alert(`Matéria "${subjectDisplayNameToDelete}" removida com sucesso.`);
            }
        });
    });
}
 
// --- GESTÃO DE MODAL ---
const modal = document.getElementById('newSubjectModal');
const closeButton = document.querySelector('.close-button');
const newSubjectForm = document.getElementById('newSubjectForm');
 
function openModal() {
    modal.style.display = 'flex';
}
 
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});
 
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});
 
newSubjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let subjectName = document.getElementById('subjectName').value.trim();
    const subjectIconUrl = document.getElementById('subjectIcon').value.trim();
 
    if (subjectName) {
        subjectName = subjectName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
 
        const normalizedSubjectName = normalizeString(subjectName);
        const materiaKey = `atividades${normalizedSubjectName.charAt(0).toUpperCase() + normalizedSubjectName.slice(1)}`;
 
        let subjectExists = false;
        for (const existingDisplayName in materias) {
            if (normalizeString(existingDisplayName) === normalizedSubjectName) {
                subjectExists = true;
                break;
            }
        }
 
        if (!subjectExists) {
            materias[subjectName] = materiaKey;
            subjectIcons[normalizedSubjectName] = subjectIconUrl || `https://via.placeholder.com/64/5ca3a5/FFFFFF?text=${subjectName.charAt(0).toUpperCase()}`;
            localStorage.setItem(materiaKey, JSON.stringify([]));
            saveMateriasData();
            renderSubjectCards();
            renderizarGraficoDesempenhoGeral();
            modal.style.display = 'none';
            newSubjectForm.reset();
            alert(`Matéria "${subjectName}" criada com sucesso!`);
 
        } else {
            alert('Esta matéria já existe!');
        }
    } else {
        alert('Por favor, insira o nome da matéria.');
    }
});
 
// --- VISUALIZAÇÃO DE DETALHES DA MATÉRIA ---
function showSubjectDetail(materiaKey, displayName) {
    currentSubjectKey = materiaKey;
    currentSubjectDisplayName = displayName;
 
    mainActivityView.style.display = 'none';
    subjectDetailView.style.display = 'block';
    mainTitle.textContent = 'Detalhes da Matéria';
 
    document.getElementById('currentSubjectNameDetail').textContent = displayName;
    document.getElementById('currentSubjectNamePerformance').textContent = displayName;
 
    renderizarAtividades();
    updatePerformanceMetrics();
    renderizarGraficoMateriaAtual();
 
    subjectDetailTabs[0].click();
}
 
function hideSubjectDetail() {
    mainActivityView.style.display = 'block';
    subjectDetailView.style.display = 'none';
    mainTitle.textContent = 'Suas atividades de classe';
    currentSubjectKey = null;
    currentSubjectDisplayName = null;
    renderizarGraficoDesempenhoGeral();
}
 
// Botões de voltar
document.getElementById('backToSubjectsBtn').addEventListener('click', (e) => {
    e.preventDefault();
    hideSubjectDetail();
});
document.getElementById('backToSubjectsBtn2').addEventListener('click', (e) => {
    e.preventDefault();
    hideSubjectDetail();
});
 
// --- LÓGICA DE GRÁFICOS ---
function calculatePorcentagemConclusao(materiaKey) {
  const atividades = JSON.parse(localStorage.getItem(materiaKey)) || [];
  const total = atividades.length;
  if (total === 0) return 0;
  const concluidas = atividades.filter(a => a.concluida).length;
  return (concluidas / total) * 100;
}
 
function renderizarGraficoDesempenhoGeral() {
    const ctx = document.getElementById('chartOverallPerformance');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');
 
    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];
 
    for (const displayName in materias) {
        const materiaKey = materias[displayName];
        const porcentagem = calculatePorcentagemConclusao(materiaKey);
 
        labels.push(displayName);
        data.push(porcentagem);
 
        if (porcentagem === 100) {
            backgroundColors.push('rgba(92, 163, 165, 0.7)');
            borderColors.push('rgba(92, 163, 165, 1)');
        } else if (porcentagem > 70) {
            backgroundColors.push('rgba(173, 216, 230, 0.7)');
            borderColors.push('rgba(173, 216, 230, 1)');
        } else if (porcentagem > 40) {
            backgroundColors.push('rgba(255, 206, 86, 0.7)');
            borderColors.push('rgba(255, 206, 86, 1)');
        } else {
            backgroundColors.push('rgba(255, 99, 132, 0.7)');
            borderColors.push('rgba(255, 99, 132, 1)');
        }
    }
 
    if (charts['overall']) {
        charts['overall'].destroy();
    }
 
    charts['overall'] = new Chart(canvasContext, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '% de Conclusão',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Desempenho Geral por Matéria',
                    font: { size: 18 }
                },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Porcentagem de Conclusão'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Matéria'
                    }
                }
            }
        }
    });
}
 
function updatePerformanceMetrics() {
    if (!currentSubjectKey) return;
 
    const atividades = carregarAtividades(currentSubjectKey);
    const total = atividades.length;
    const concluidas = atividades.filter(atividade => atividade.concluida).length;
    const pendentes = total - concluidas;
 
    document.getElementById('totalAtividades').textContent = total;
    document.getElementById('concluidasAtividades').textContent = concluidas;
    document.getElementById('pendentesAtividades').textContent = pendentes;
}
 
function renderizarGraficoMateriaAtual() {
    const ctx = document.getElementById('chartCurrentSubject');
    if (!ctx) {
        console.error("Canvas para o gráfico da matéria atual não encontrado.");
        return;
    }
    const canvasContext = ctx.getContext('2d');
    const atividades = carregarAtividades(currentSubjectKey);
    const porcentagemConcluida = calculatePorcentagemConclusao(currentSubjectKey);
 
    if (chartCurrentSubjectInstance) {
        chartCurrentSubjectInstance.destroy();
    }
 
    chartCurrentSubjectInstance = new Chart(canvasContext, {
        type: 'doughnut',
        data: {
            labels: ['Concluído', 'Pendente'],
            datasets: [{
                data: [atividades.filter(a => a.concluida).length, atividades.filter(a => !a.concluida).length],
                backgroundColor: ['rgba(92, 163, 165, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                borderColor: ['rgba(92, 163, 165, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${currentSubjectDisplayName} - Progresso Geral`,
                    font: { size: 18 }
                },
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((sum, current) => sum + current, 0);
                            const porcentagem = total > 0 ? (value / total * 100).toFixed(2) : 0;
                            return `${label}: ${value} (${porcentagem}%)`;
                        }
                    }
                }
            }
        }
    });
}
 
// --- INICIALIZAÇÃO DA PÁGINA ---
function setupTabs() {
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');
 
            all_content.forEach(content => content.classList.remove('active'));
            all_content[index].classList.add('active');
 
            const line = document.querySelector('.line');
            line.style.width = tab.offsetWidth + 'px';
            line.style.left = tab.offsetLeft + 'px';
 
            if (index === 1) {
                renderizarAtividadesPendentes();
            }
        });
    });
 
    subjectDetailTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            subjectDetailTabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');
 
            subjectDetailContents.forEach(content => content.classList.remove('active'));
            subjectDetailContents[index].classList.add('active');
 
            const line = document.querySelector('.line-detail');
            line.style.width = tab.offsetWidth + 'px';
            line.style.left = tab.offsetLeft + 'px';
 
            if (tab.getAttribute('data-tab-content') === 'performance-detail') {
                renderizarGraficoMateriaAtual();
            }
        });
    });
}
 
// Chamar as funções de inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    renderSubjectCards();
    tabs[0].click();
});

// --- GESTÃO DE ATIVIDADES PENDENTES ---
function renderizarAtividadesPendentes() {
    const lista = document.getElementById('lista-pendentes');
    if (!lista) return;

    lista.innerHTML = '';

    const todasAtividades = [];
    for (const displayName in materias) {
        const materiaKey = materias[displayName];
        const atividades = carregarAtividades(materiaKey).filter(a => !a.concluida);
        atividades.forEach(atividade => {
            todasAtividades.push({
                ...atividade,
                materia: displayName
            });
        });
    }

    todasAtividades.sort((a, b) => {
        if (a.dataEntrega && b.dataEntrega) {
            return new Date(a.dataEntrega) - new Date(b.dataEntrega);
        }
        if (a.dataEntrega && !b.dataEntrega) return -1;
        if (!a.dataEntrega && b.dataEntrega) return 1;
        return 0;
    });

    if (todasAtividades.length === 0) {
        lista.innerHTML = '<p>Parabéns! Nenhuma atividade pendente.</p>';
        return;
    }

    todasAtividades.forEach(atividade => {
        const li = document.createElement('li');
        li.className = `atividade-item ${getColorByDueDate(atividade.dataEntrega, false)}`;

        li.innerHTML = `
            <div class="atividade-info">
                <h3>${atividade.titulo}</h3>
                <p>Matéria: ${atividade.materia}</p>
                ${atividade.dataEntrega ? `<p class="data-entrega">Entrega: ${new Date(atividade.dataEntrega + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>` : ''}
            </div>
        `;
        lista.appendChild(li);
    });
}