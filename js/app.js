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
    if (!confirm('Отменить операцию?')) return;

    // удаляем запись
    log.splice(i, 1);

    // пересчитываем баланс
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
    render();
}

function buyReward(i) {
    const r = rewards[i];
    addEntry('Награда: ' + r.name, -r.cost);
    render();
    if (navigator.vibrate) navigator.vibrate(20);
}

function addQuest() {
    if (!questName.value || !questReward.value) return;

    quests.push({ name: questName.value, reward: parseInt(questReward.value) });
    questName.value = '';
    questReward.value = '';
    save();
    render();
}

function completeQuest(i) {
    const q = quests[i];
    addEntry('Квест завершён: ' + q.name, q.reward);
    if (navigator.vibrate) navigator.vibrate(20);
    render();
}

function deleteReward(i) {
    if (!confirm('Удалить награду?')) return;

    rewards.splice(i, 1);
    save();
    render();
}

function deleteQuest(i) {
    if (!confirm('Удалить квест?')) return;

    quests.splice(i, 1);
    save();
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

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
