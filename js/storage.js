function save() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('log', JSON.stringify(log));
    localStorage.setItem('quests', JSON.stringify(quests));
    localStorage.setItem('rewards', JSON.stringify(rewards));
}

function load() {
    balance = Number(localStorage.getItem('balance')) || 0;
    log = JSON.parse(localStorage.getItem('log') || '[]');
    quests = JSON.parse(localStorage.getItem('quests') || '[]');
    rewards = JSON.parse(localStorage.getItem('rewards') || '[]');
}
