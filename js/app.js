/**
 * ОСНОВНОЙ МОДУЛЬ ПРИЛОЖЕНИЯ (app.js)
 * 
 * Отвечает за бизнес-логику:
 * - Управление квестами и наградами
 * - Ведение журнала транзакций
 * - Обработка пользовательских действий
 * 
 * Архитектура:
 * 1. load() - инициализация при загрузке страницы
 * 2. actionMap - маршрутизация действий из UI
 * 3. Функции добавления данных (addQuest, addReward, logCustom)
 * 4. Функции редактирования данных (completeQuest, buyReward, deleteQuest, deleteReward)
 * 5. Функции управления состоянием (switchQuestTab, resetAll)
 * 
 * Лучшие практики:
 * - Все действия должны пройти валидацию перед сохранением
 * - Вызов save() и render() в конце каждой операции
 * - Использование LIMITS для управления ограничениями
 * - Защита от отрицательного баланса
 */

load();

// Map с доступными действиями (должна быть после load() чтобы функции были определены)
const actionMap = {
    buyReward: (i) => buyReward(i),
    deleteReward: (i) => deleteReward(i),
    completeQuest: (i) => completeQuest(i),
    deleteQuest: (i) => deleteQuest(i)
};

/**
 * Добавляет новую запись в журнал
 * @param {string} reason - Причина операции
 * @param {number} delta - Изменение баланса
 * @returns {boolean} True если успешно
 */
function addEntry(reason, delta) {
    const validReason = validateUserInput(reason, LIMITS.MAX_REASON_LENGTH);
    if (!validReason) return false;
    
    const numDelta = parseInt(delta);
    if (isNaN(numDelta)) return false;
    
    if (balance + numDelta < 0) {
        alert('Недостаточно очков!');
        return false;
    }
    
    balance += numDelta;
    log.push({ 
        date: new Date().toLocaleString(), 
        reason: validReason, 
        delta: numDelta > 0 ? '+' + numDelta : numDelta, 
        balance 
    });
    const key = validReason + '|' + numDelta;
    presets[key] = (presets[key] || 0) + 1;
    save();
    return true;
}

/**
 * Добавляет новый квест
 */
function addQuest() {
    const name = validateUserInput(document.getElementById('questName').value);
    const reward = parseInt(document.getElementById('questReward').value);
    
    if (!name) {
        alert(`Введите название квеста до ${LIMITS.MAX_INPUT_LENGTH} символов`);
        return;
    }
    
    if (!isValidNumber(reward, LIMITS.MAX_QUEST_REWARD)) {
        alert(`Награда должна быть числом от 0 до ${LIMITS.MAX_QUEST_REWARD}`);
        return;
    }

    const newQuest = { name, reward };
    if (currentQuestTab === 'daily') {
        dailyQuests.push(newQuest);
    } else {
        generalQuests.push(newQuest);
    }
    document.getElementById('questName').value = '';
    document.getElementById('questReward').value = '';
    save();
    renderQuests();
}

/**
 * Добавляет новую награду
 */
function addReward() {
    const name = validateUserInput(document.getElementById('rewardName').value);
    const cost = parseInt(document.getElementById('rewardCost').value);
    
    if (!name) {
        alert(`Введите название награды до ${LIMITS.MAX_INPUT_LENGTH} символов`);
        return;
    }
    
    if (!isValidNumber(cost, LIMITS.MAX_REWARD_COST)) {
        alert(`Стоимость должна быть числом от 0 до ${LIMITS.MAX_REWARD_COST}`);
        return;
    }

    rewards.push({ name, cost });
    document.getElementById('rewardName').value = '';
    document.getElementById('rewardCost').value = '';
    save();
    renderRewards();
}

/**
 * Добавляет запись вручную (доход/расход)
 */
function logCustom() {
    const reason = validateUserInput(document.getElementById('reason').value, LIMITS.MAX_REASON_LENGTH);
    const amount = parseInt(document.getElementById('amount').value);
    
    if (!reason) {
        alert('Введите причину');
        return;
    }
    
    if (!isValidNumber(Math.abs(amount), LIMITS.MAX_ENTRY_DELTA)) {
        alert('Сумма должна быть числом');
        return;
    }
    
    if (addEntry(reason, amount)) {
        document.getElementById('reason').value = '';
        document.getElementById('amount').value = '';
        render();
    }
}

/**
 * Покупает награду и вычитает очки
 */
function buyReward(i) {
    const r = rewards[i];
    if (addEntry('Награда: ' + r.name, -r.cost)) {
        render();
        if (navigator.vibrate) navigator.vibrate(LIMITS.VIBRATE_DRAG_START);
    }
}

/**
 * Завершает квест и добавляет очки
 */
function completeQuest(i) {
    const quests = currentQuestTab === 'daily' ? dailyQuests : generalQuests;
    const q = quests[i];
    if (addEntry('Квест завершён: ' + q.name, q.reward)) {
        if (navigator.vibrate) navigator.vibrate(LIMITS.VIBRATE_DRAG_START);
        render();
    }
}

/**
 * Удаляет награду
 */
function deleteReward(i) {
    const r = rewards[i];
    if (!confirm(`Удалить награду "${r.name}" ?`)) return;
    rewards.splice(i, 1);
    save();
    renderRewards();
}

/**
 * Удаляет квест
 */
function deleteQuest(i) {
    const quests = currentQuestTab === 'daily' ? dailyQuests : generalQuests;
    const q = quests[i];
    if (!confirm(`Удалить квест "${q.name}"?`)) return;
    quests.splice(i, 1);
    save();
    renderQuests();
}

/**
 * Переключает вкладку квестов
 */
function switchQuestTab(tab) {
    currentQuestTab = tab;
    document.getElementById('dailyTabBtn').classList.toggle('active', tab === 'daily');
    document.getElementById('generalTabBtn').classList.toggle('active', tab === 'general');
    document.getElementById('quests').dataset.tab = tab;
    render();
}

/**
 * Сбрасывает баланс, журнал и пресеты
 */
function resetAll() {
    if (!confirm('Сбросить баланс и журнал?')) return;
    balance = 0;
    log = [];
    presets = {};
    localStorage.removeItem('balance');
    localStorage.removeItem('log');
    localStorage.removeItem('presets');
    render();
}

/**
 * Удаляет запись из журнала
 */
function deleteLogEntry(i) {
    const entry = log[i];
    if (!confirm(`Удалить запись "${entry.reason}"?`)) return;
    log.splice(i, 1);
    balance = 0;
    for (let entry of log) {
        const delta = parseInt(entry.delta);
        balance += delta;
        entry.balance = balance;
    }
    save();
    render();
}

render();

// Инициализация свайпа для переключения вкладок квестов
document.addEventListener('touchstart', (e) => {
    swipe.startX = e.touches[0].clientX;
    swipe.startY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const swipeEndX = e.changedTouches[0].clientX;
    const swipeEndY = e.changedTouches[0].clientY;
    const deltaX = swipeEndX - swipe.startX;
    const deltaY = Math.abs(swipeEndY - swipe.startY);
    
    // Проверяем горизонтальный свайп в контейнере квестов
    if (e.target.closest('#quests') && Math.abs(deltaX) > LIMITS.SWIPE_THRESHOLD && deltaY < LIMITS.SWIPE_VERTICAL_THRESHOLD) {
        if (deltaX > 0 && currentQuestTab === 'general') {
            switchQuestTab('daily');
        } else if (deltaX < 0 && currentQuestTab === 'daily') {
            switchQuestTab('general');
        }
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
