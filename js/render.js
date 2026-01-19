/**
 * МОДУЛЬ ОТРИСОВКИ (РЕНДЕРИНГА)
 * 
 * Отвечает за обновление пользовательского интерфейса на основе состояния приложения.
 * Все входные данные экранируются для защиты от XSS.
 * 
 * Лучшие практики:
 * - HTML-элементы кэшируются в переменные при загрузке
 * - Функция escapeHtml() защищает от XSS уязвимостей
 * - Используется data-* атрибуты для привязки логики к элементам
 * - Event delegation вместо inline onclick обработчиков
 */

const logEl = document.getElementById('log');
const rewardsEl = document.getElementById('rewards');
const questsEl = document.getElementById('quests');
const balanceEl = document.getElementById('balance');

/**
 * Экранирует HTML-символы для защиты от XSS атак
 * Преобразует пользовательский ввод в безопасный HTML
 * @param {string} text - Текст для экранирования
 * @returns {string} Экранированный HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Главная функция отрисовки - обновляет весь UI
 * Вызывается после любого изменения состояния
 */
function render() {
    balanceEl.textContent = balance;
    renderLog();
    renderRewards();
    renderQuests();
}

/**
 * Отрисовывает журнал транзакций в обратном порядке
 * Все пользовательские данные экранируются через escapeHtml()
 * Использует data-* атрибуты для обработки событий
 */
function renderLog() {
    logEl.innerHTML = log.slice().reverse().map((e, idx) => {
        const actualIndex = log.length - 1 - idx;
        return `<tr>
            <td>${escapeHtml(e.date).replace(/\n/g, '<br>')}</td>
            <td>${escapeHtml(e.reason)}</td>
            <td>${e.delta}</td>
            <td>${e.balance}</td>
            <td><button class="delete" data-log-index="${actualIndex}">✕</button></td>
        </tr>`;
    }).join('');
    attachLogHandlers();
}

/**
 * Привязывает обработчики событий к кнопкам удаления в журнале
 * Использует event delegation вместо inline onclick
 */
function attachLogHandlers() {
    logEl.querySelectorAll('[data-log-index]').forEach(btn => {
        btn.onclick = () => deleteLogEntry(parseInt(btn.dataset.logIndex));
    });
}

/**
 * Отрисовывает список наград с кнопками покупки
 * Каждая награда содержит drag-handle, name и cost
 */
function renderRewards() {
    rewardsEl.innerHTML = rewards.map((r, i) => `
        <div class="reward-card" data-index="${i}">
            <div class="drag-handle" data-drag="${i},rewards">⋮⋮</div>
            <div class="card-main">
                <div class="card-title" data-edit="reward,${i},name">${escapeHtml(r.name)}</div>
                <div class="card-sub" data-edit="reward,${i},cost">цена: -${r.cost}</div>
            </div>
            <div class="card-actions">
                <button class="secondary" data-action="buyReward,${i}">✓</button>
                <button class="delete" data-action="deleteReward,${i}">✕</button>
            </div>
        </div>
    `).join('');
    
    attachHandlers('reward');
}

/**
 * Отрисовывает список квестов активной вкладки (дневные или основные)
 * Каждый квест содержит drag-handle, name и reward
 */
function renderQuests() {
    const quests = currentQuestTab === 'daily' ? dailyQuests : generalQuests;
    questsEl.innerHTML = quests.map((q, i) => `
        <div class="quest-card" data-index="${i}">
            <div class="drag-handle" data-drag="${i},quests">⋮⋮</div>
            <div class="card-main">
                <div class="card-title" data-edit="quest,${i},name">${escapeHtml(q.name)}</div>
                <div class="card-sub" data-edit="quest,${i},reward">награда +${q.reward}</div>
            </div>
            <div class="card-actions">
                <button class="secondary" data-action="completeQuest,${i}">✓</button>
                <button class="delete" data-action="deleteQuest,${i}">✕</button>
            </div>
        </div>
    `).join('');
    
    attachHandlers('quest');
}

/**
 * Привязывает обработчики событий к элементам карточек (drag, edit, actions)
 * Использует data-* атрибуты для передачи данных из HTML
 * @param {string} type - Тип элементов ('reward' или 'quest')
 */
function attachHandlers(type) {
    const container = type === 'reward' ? rewardsEl : questsEl;
    
    // Drag handlers - обработка drag-and-drop для переупорядочивания
    container.querySelectorAll('[data-drag]').forEach(el => {
        el.onpointerdown = (e) => {
            const [index, dragType] = el.dataset.drag.split(',');
            startDrag(e, dragType);
        };
    });
    
    // Edit handlers - обработка inline редактирования на двойное нажатие
    container.querySelectorAll('[data-edit]').forEach(el => {
        el.onpointerdown = (e) => {
            const [editType, index, field] = el.dataset.edit.split(',');
            startInlineEdit(e, editType, parseInt(index), field);
        };
    });
    
    // Action handlers - обработка кнопок действий (покупка, завершение, удаление)
    container.querySelectorAll('[data-action]').forEach(el => {
        el.onclick = () => {
            const [action, index] = el.dataset.action.split(',');
            actionMap[action](parseInt(index));
        };
    });
}

let editTimer = null;

/**
 * Инициирует inline редактирование с задержкой двойного клика
 * Ждёт второго клика в течение LIMITS.DOUBLE_TAP_TIMEOUT
 * @param {Event} e - Событие pointer
 * @param {string} type - Тип элемента ('quest' или 'reward')
 * @param {number} index - Индекс в массиве
 * @param {string} field - Поле для редактирования ('name', 'cost', 'reward')
 */
function startInlineEdit(e, type, index, field) {
    const el = e.currentTarget;

    editTimer = setTimeout(() => {
        enableInlineEdit(el, type, index, field);
    }, LIMITS.DOUBLE_TAP_TIMEOUT);

    const cancel = () => {
        clearTimeout(editTimer);
        editTimer = null;
    };

    el.onpointerup = cancel;
    el.onpointerleave = cancel;
}

/**
 * Включает режим inline редактирования для элемента
 * Делает элемент contentEditable и устанавливает обработчики событий
 * @param {HTMLElement} el - Элемент для редактирования
 * @param {string} type - Тип элемента ('quest' или 'reward')
 * @param {number} index - Индекс в массиве
 * @param {string} field - Поле для редактирования ('name', 'cost', 'reward')
 */
function enableInlineEdit(el, type, index, field) {
    el.contentEditable = true;
    el.focus();

    const oldText = el.textContent.trim();

    // Показываем только число при редактировании cost/reward для удобства
    if (field === 'cost' || field === 'reward') {
        const list = type === 'reward' ? rewards : (currentQuestTab === 'daily' ? dailyQuests : generalQuests);
        el.textContent = list[index][field];
    }

    el.onblur = () => finishInlineEdit(el, type, index, field, oldText);

    el.onkeydown = e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            el.blur();
        }
        if (e.key === 'Escape') {
            el.textContent = oldText;
            el.blur();
        }
    };
}

/**
 * Завершает inline редактирование элемента
 * Валидирует новое значение перед сохранением
 * @param {HTMLElement} el - Редактируемый элемент
 * @param {string} type - Тип элемента ('quest' или 'reward')
 * @param {number} index - Индекс в массиве
 * @param {string} field - Поле для редактирования ('name', 'cost', 'reward')
 * @param {string} oldText - Старое значение для восстановления при ошибке
 */
function finishInlineEdit(el, type, index, field, oldText) {
    el.contentEditable = false;
    let value = el.textContent.trim();
    if (!value) {
        render();
        return;
    }

    const list = type === 'reward' ? rewards : (currentQuestTab === 'daily' ? dailyQuests : generalQuests);

    if (field === 'name') {
        value = validateUserInput(value);
        if (value) list[index].name = value;
    } else if (field === 'cost' || field === 'reward') {
        const num = parseInt(value);
        const maxVal = field === 'cost' ? LIMITS.MAX_REWARD_COST : LIMITS.MAX_QUEST_REWARD;
        if (!isNaN(num) && isValidNumber(num, maxVal)) {
            list[index][field] = num;
        }
    }

    save();
    render();
}
