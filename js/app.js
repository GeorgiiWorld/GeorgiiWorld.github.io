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
    // Валидация reason с большим лимитом для системных сообщений
    const validReason = validateUserInput(reason, 500);
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
    // Сохраняем пресет для автодополнения (используем validReason чтобы избежать ошибок)
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
        alert('Введите название квеста');
        return;
    }
    
    if (!isValidNumber(reward, 50000)) {
        alert('Награда должна быть числом от 0 до 50000');
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
        alert('Введите название награды');
        return;
    }
    
    if (!isValidNumber(cost, 50000)) {
        alert('Стоимость должна быть числом от 0 до 50000');
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
    const reason = validateUserInput(document.getElementById('reason').value, 500);
    const amount = parseInt(document.getElementById('amount').value);
    
    if (!reason) {
        alert('Введите причину');
        return;
    }
    
    if (!isValidNumber(Math.abs(amount), 999999)) {
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
        if (navigator.vibrate) navigator.vibrate(20);
    }
}

/**
 * Завершает квест и добавляет очки
 */
function completeQuest(i) {
    const quests = currentQuestTab === 'daily' ? dailyQuests : generalQuests;
    const q = quests[i];
    if (addEntry('Квест завершён: ' + q.name, q.reward)) {
        if (navigator.vibrate) navigator.vibrate(20);
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
    log.splice(i, 1);
    save();
    render();
}

render();

// Инициализация свайпа для переключения вкладок квестов
let swipeStartX = 0;
let swipeStartY = 0;

document.addEventListener('touchstart', (e) => {
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const swipeEndX = e.changedTouches[0].clientX;
    const swipeEndY = e.changedTouches[0].clientY;
    const deltaX = swipeEndX - swipeStartX;
    const deltaY = Math.abs(swipeEndY - swipeStartY);
    
    // Проверяем что это горизонтальный свайп в контейнере квестов
    const questContainer = document.getElementById('quests');
    if (e.target.closest('#quests') && Math.abs(deltaX) > 50 && deltaY < 30) {
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
