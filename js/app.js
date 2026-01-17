load();

function addEntry(reason, delta) {
    if (balance + delta < 0) return;
    balance += delta;
    log.push({ date: new Date().toLocaleString(), reason, delta: delta > 0 ? '+' + delta : delta, balance });
    const key = reason + '|' + delta;
    presets[key] = (presets[key] || 0) + 1;
    save();
}

function logCustom() {
    const r = reason.value.trim();
    const a = parseInt(amount.value);
    if (!r || isNaN(a)) return;
    addEntry(r, a);
    reason.value = '';
    amount.value = '';
    render();
}

// function repeat(i) {
//     const e = log[i];
//     addEntry(e.reason, parseInt(e.delta));
//     render();
// }

function deleteLogEntry(i) {
    if (!confirm(`Отменить операцию "${log[i].reason}"?`)) return;

    log.splice(i, 1);

    balance = 0;
    for (const entry of log) {
        balance += parseInt(entry.delta);
        entry.balance = balance;
    }

    save();
    render();
}


function addReward() {
    if (!rewardName.value || !rewardCost.value) return;

    rewards.push({ name: rewardName.value, cost: parseInt(rewardCost.value) });
    rewardName.value = '';
    rewardCost.value = '';
    save();
    renderRewards();
}

function buyReward(i) {
    const r = rewards[i];
    addEntry('Награда: ' + r.name, -r.cost);
    render();
    if (navigator.vibrate) navigator.vibrate(20);
}

function addQuest() {
    if (!questName.value || !questReward.value) return;

    const newQuest = { name: questName.value, reward: parseInt(questReward.value) };
    if (currentQuestTab === 'daily') {
        dailyQuests.push(newQuest);
    } else {
        generalQuests.push(newQuest);
    }
    questName.value = '';
    questReward.value = '';
    save();
    renderQuests();
}

function completeQuest(i) {
    const quests = currentQuestTab === 'daily' ? dailyQuests : generalQuests;
    const q = quests[i];
    addEntry('Квест завершён: ' + q.name, q.reward);
    if (navigator.vibrate) navigator.vibrate(20);
    render();
}

function deleteReward(i) {
    const r = rewards[i];
    if (!confirm(`Удалить награду "${r.name}" ?`)) return;

    rewards.splice(i, 1);
    save();
    renderRewards();
}

function deleteQuest(i) {
    const quests = currentQuestTab === 'daily' ? dailyQuests : generalQuests;
    const q = quests[i];
    if (!confirm(`Удалить квест "${q.name}"?`)) return;

    quests.splice(i, 1);
    save();
    renderQuests();
}

function switchQuestTab(tab) {
    currentQuestTab = tab;
    
    // Обновляем активную кнопку
    document.getElementById('dailyTabBtn').classList.toggle('active', tab === 'daily');
    document.getElementById('generalTabBtn').classList.toggle('active', tab === 'general');
    
    // Обновляем контейнер
    const container = document.getElementById('quests');
    container.dataset.tab = tab;
    
    render();
}

function resetAll() {
    if (!confirm('Сбросить баланс и журнал?')) return;

    balance = 0;
    log = [];
    localStorage.removeItem('balance');
    localStorage.removeItem('log');
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
