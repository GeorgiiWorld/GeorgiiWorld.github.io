const logEl = document.getElementById('log');
const rewardsEl = document.getElementById('rewards');
const questsEl = document.getElementById('quests');

function render() {
    document.getElementById('balance').textContent = balance;
    renderLog(); renderRewards(); renderQuests();
}

function renderLog(){
    logEl.innerHTML='';
    log.slice().reverse().forEach((e,idx)=>{
    logEl.innerHTML+=`<tr><td>${e.date}</td><td>${e.reason}</td><td>${e.delta}</td><td>${e.balance}</td><td><button onclick="repeat(${log.length-1-idx})">↺</button></td></tr>`;
    });
}

function renderRewards() {
    rewardsEl.innerHTML = '';

    rewards.forEach((r, i) => {
    rewardsEl.innerHTML += `
        <div class="reward-card" data-index="${i}">
        <div class="drag-handle" onpointerdown="startDrag(event,'rewards')">⋮⋮</div>

        <div class="card-main">
            <div class="card-title">${r.name}</div>
            <div class="card-sub">цена: -${r.cost}</div>
        </div>

        <div class="card-actions">
            <button class="secondary" onclick="buyReward(${i})">✓</button>
            <button class="delete" onclick="deleteReward(${i})">✕</button>
        </div>
        </div>
    `;
    });
}

function renderQuests() {
    questsEl.innerHTML = '';

    quests.forEach((q, i) => {
    questsEl.innerHTML += `
        <div class="quest-card" data-index="${i}">
        <div class="drag-handle" onpointerdown="startDrag(event,'quests')">⋮⋮</div>

        <div class="card-main">
            <div class="card-title">${q.name}</div>
            <div class="card-sub">награда +${q.reward}</div>
        </div>

        <div class="card-actions">
            <button class="secondary" onclick="completeQuest(${i})">✓</button>
            <button class="delete" onclick="deleteQuest(${i})">✕</button>
        </div>
        </div>
    `;
    });
}
