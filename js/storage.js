function save() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('log', JSON.stringify(log));
    localStorage.setItem('dailyQuests', JSON.stringify(dailyQuests));
    localStorage.setItem('generalQuests', JSON.stringify(generalQuests));
    localStorage.setItem('rewards', JSON.stringify(rewards));
}

function load() {
    balance = Number(localStorage.getItem('balance')) || 0;
    log = JSON.parse(localStorage.getItem('log') || '[]');
    dailyQuests = JSON.parse(localStorage.getItem('dailyQuests') || '[]');
    generalQuests = JSON.parse(localStorage.getItem('generalQuests') || '[]');
    rewards = JSON.parse(localStorage.getItem('rewards') || '[]');
    
    // Миграция старых квестов в общие (если они есть)
    const oldQuests = JSON.parse(localStorage.getItem('quests') || '[]');
    if (oldQuests.length > 0 && generalQuests.length === 0) {
        generalQuests = oldQuests;
        save();
        localStorage.removeItem('quests');
    }
}
