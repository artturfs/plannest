let temporizador;
let emExecucao = false;
let [minutos25, segundos] = [25, 0];

// Função que atualiza o display do cronômetro 

function atualizarDisplay() {
    document.getElementById('cronometro').textContent =
        `${String(minutos25).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function iniciarParar() {
    if (emExecucao) {
        clearInterval(temporizador);
        document.getElementById('botaoIniciarParar').textContent = 'Iniciar';
    } else {
        temporizador = setInterval(() => {
            if (minutos25 === 0 && segundos === 0) {
                clearInterval(temporizador);
                document.getElementById('botaoIniciarParar').textContent = 'Iniciar';
                emExecucao = false;
                return;
            }
            if (segundos === 0) {
                if (minutos25 === 0) {
                    minutos25 = 59;
                    segundos = 59;
                } else {
                    minutos25--;
                    segundos = 59;
                }
            } else {
                segundos--;
            }
            atualizarDisplay();
        }, 1000);
        document.getElementById('botaoIniciarParar').textContent = 'Parar';
    }
    emExecucao = !emExecucao;
}

function pausaCurta() {
    clearInterval(temporizador);
    [minutos25, segundos] = [5, 0];
    atualizarDisplay();
    emExecucao = false;
    document.getElementById('botaoIniciarParar').textContent = 'Iniciar';
}

function pausaLonga() {
    clearInterval(temporizador);
    [minutos25, segundos] = [15, 0];
    atualizarDisplay();
    emExecucao = false;
    document.getElementById('botaoIniciarParar').textContent = 'Iniciar';
}

// Função que reseta o temporizador
function resetar() {
    clearInterval(temporizador); 
    [minutos25, segundos] = [25, 0];
    atualizarDisplay(); 
    emExecucao = false;
    document.getElementById('botaoIniciarParar').textContent = 'Iniciar';

}

// --- FUNÇÃO ATUALIZADA PARA ADICIONAR E EXCLUIR ATIVIDADE ---

document.getElementById('atividade-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const titulo = document.getElementById('titulo-atividade').value.trim();
    if (titulo) {
        const ul = document.getElementById('atividades-lista');
        const li = document.createElement('li');
        
        li.classList.add('atividade-item');
        
        // 1. Incluímos o botão de excluir
        li.innerHTML = `
            <input class="atividade-checkbox" type="checkbox" /> 
            <span class="atividade-texto">${titulo}</span>
            <button class="botao-excluir">&times;</button> 
        `;
        
        ul.appendChild(li);
        document.getElementById('titulo-atividade').value = '';

        // 2. Adiciona o evento para marcar como concluído
        const checkbox = li.querySelector('.atividade-checkbox');
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                li.classList.add('concluida');
            } else {
                li.classList.remove('concluida');
            }
        });

        // 3. Adiciona o evento para excluir a atividade
        const deleteButton = li.querySelector('.botao-excluir');
        deleteButton.addEventListener('click', function() {
            // Remove o item da lista (o <li>)
            li.remove();
        });
    }
});