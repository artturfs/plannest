document.addEventListener("DOMContentLoaded", function () {
    const calendarDaysContent = document.querySelector(".calendar-days-content");
    const agendaDia = document.querySelector("#agenda-dia");
    const agendaTextarea = document.querySelector("#agenda-textarea");
    const diaSelecionado = document.querySelector("#dia-selecionado");

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = null;

    // Função para gerar o calendário
    function generateCalendar(month, year) {
        const calendarHeader = document.querySelector(".calendar-header");

        // Limpar conteúdo anterior
        calendarDaysContent.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Adicionar espaços vazios para o primeiro dia da semana
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement("div");
            calendarDaysContent.appendChild(emptyDay);
        }

        // Adicionar os dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add("day-number");
            dayElement.textContent = day;
            dayElement.setAttribute("data-day", day);
            dayElement.addEventListener("click", function () {
                openAgendaForDay(day, month, year);
            });
            calendarDaysContent.appendChild(dayElement);
        }

        // Atualiza o título do mês
        calendarHeader.querySelector(".month-name").textContent = `${getMonthName(month)} ${year}`;
    }

    // Função para abrir a agenda do dia
    function openAgendaForDay(day, month, year) {
        const dateString = `${day}/${month + 1}/${year}`;
        diaSelecionado.textContent = `${day} de ${getMonthName(month)} de ${year}`;
        selectedDate = `${year}-${month + 1}-${day}`;

        // Carregar as tarefas salvas
        loadTasksForDay(selectedDate);
    }

    // Função para obter o nome do mês
    function getMonthName(monthIndex) {
        const months = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return months[monthIndex];
    }

    // Função para carregar as tarefas salvas
    function loadTasksForDay(date) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || {};
        agendaTextarea.value = tasks[date] || '';
    }

    // Salvar tarefas
    document.querySelector(".agenda-form").addEventListener("submit", function (event) {
        event.preventDefault();
        if (selectedDate) {
            const task = agendaTextarea.value.trim();
            const tasks = JSON.parse(localStorage.getItem("tasks")) || {};
            if (task) {
                tasks[selectedDate] = task;
            } else {
                delete tasks[selectedDate];
            }
            localStorage.setItem("tasks", JSON.stringify(tasks));
            alert("Tarefa salva!");
        }
    });

    // Gerar o calendário ao carregar a página
    generateCalendar(currentMonth, currentYear);

    // Event listeners para troca de mês e ano
    document.querySelector("#month-select").addEventListener("change", function () {
        currentMonth = parseInt(this.value);
        generateCalendar(currentMonth, currentYear);
    });

    document.querySelector("#year-input").addEventListener("change", function () {
        currentYear = parseInt(this.value);
        generateCalendar(currentMonth, currentYear);
    });
});