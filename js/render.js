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
        logEl.innerHTML+=`<tr><td>${e.date}</td><td>${e.reason}</td><td>${e.delta}</td><td>${e.balance}</td><td><button class="delete" onclick="deleteLogEntry(${log.length-1-idx})">✕</button></td></tr>`;
    });
}

function renderRewards() {
    rewardsEl.innerHTML = '';

    rewards.forEach((r, i) => {
    rewardsEl.innerHTML += `
        <div class="reward-card" data-index="${i}">
            <div class="drag-handle" onpointerdown="startDrag(event,'rewards')">⋮⋮</div>

            <div class="card-main">
                <div class="card-title" onpointerdown="startInlineEdit(event, 'reward', ${i}, 'name')">${r.name}</div>
                <div class="card-sub" onpointerdown="startInlineEdit(event, 'reward', ${i}, 'cost')">цена: -${r.cost}</div>
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
    const quests = currentQuestTab === 'daily' ? dailyQuests : generalQuests;

    quests.forEach((q, i) => {
    questsEl.innerHTML += `
        <div class="quest-card" data-index="${i}">
            <div class="drag-handle" onpointerdown="startDrag(event,'quests')">⋮⋮</div>

            <div class="card-main">
                <div class="card-title" onpointerdown="startInlineEdit(event, 'quest', ${i}, 'name')">${q.name}</div>
                <div class="card-sub" onpointerdown="startInlineEdit(event, 'quest', ${i}, 'reward')">награда +${q.reward}</div>
            </div>

            <div class="card-actions">
                <button class="secondary" onclick="completeQuest(${i})">✓</button>
                <button class="delete" onclick="deleteQuest(${i})">✕</button>
            </div>
        </div>
    `;
    });
}

let editTimer = null;

function startInlineEdit(e, type, index, field) {
    const el = e.currentTarget;

    editTimer = setTimeout(() => {
        enableInlineEdit(el, type, index, field);
    }, 400);

    const cancel = () => {
        clearTimeout(editTimer);
        editTimer = null;
    };

    el.onpointerup = cancel;
    el.onpointerleave = cancel;
}

function enableInlineEdit(el, type, index, field) {
    el.contentEditable = true;
    el.focus();

    const oldText = el.textContent.trim();

    // показываем только число при редактировании cost/reward
    if (field === 'cost'|| field === 'reward') {
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

function finishInlineEdit(el, type, index, field, oldText) {
    el.contentEditable = false;
    const value = el.textContent.trim();
    if (!value) {
        render();
        return;
    }

    const list = type === 'reward' ? rewards : (currentQuestTab === 'daily' ? dailyQuests : generalQuests);

    if (field === 'name') {
        list[index].name = value;
    } else if (field === 'cost' || field === 'reward') {
        const num = parseInt(value);
        if (!isNaN(num)) list[index][field] = num;
    }

    save();
    render();
}
