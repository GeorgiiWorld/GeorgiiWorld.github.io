const logEl = document.getElementById('log');
const rewardsEl = document.getElementById('rewards');
const questsEl = document.getElementById('quests');

// Экранировка HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function render() {
    document.getElementById('balance').textContent = balance;
    renderLog(); renderRewards(); renderQuests();
}

function renderLog(){
    logEl.innerHTML = log.slice().reverse().map((e, idx) => {
        const actualIndex = log.length - 1 - idx;
        return `<tr>
            <td>${escapeHtml(e.date)}</td>
            <td>${escapeHtml(e.reason)}</td>
            <td>${e.delta}</td>
            <td>${e.balance}</td>
            <td><button class="delete" data-log-index="${actualIndex}">✕</button></td>
        </tr>`;
    }).join('');
    logEl.querySelectorAll('[data-log-index]').forEach(btn => {
        btn.onclick = () => deleteLogEntry(parseInt(btn.dataset.logIndex));
    });
}

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

function attachHandlers(type) {
    const container = type === 'reward' ? rewardsEl : questsEl;
    
    // Drag handlers
    container.querySelectorAll('[data-drag]').forEach(el => {
        el.onpointerdown = (e) => {
            const [index, dragType] = el.dataset.drag.split(',');
            startDrag(e, dragType);
        };
    });
    
    // Edit handlers
    container.querySelectorAll('[data-edit]').forEach(el => {
        el.onpointerdown = (e) => {
            const [editType, index, field] = el.dataset.edit.split(',');
            startInlineEdit(e, editType, parseInt(index), field);
        };
    });
    
    // Action handlers
    container.querySelectorAll('[data-action]').forEach(el => {
        el.onclick = () => {
            const [action, index] = el.dataset.action.split(',');
            actionMap[action](parseInt(index));
        };
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
    let value = el.textContent.trim();
    if (!value) {
        render();
        return;
    }

    const list = type === 'reward' ? rewards : (currentQuestTab === 'daily' ? dailyQuests : generalQuests);

    if (field === 'name') {
        // Валидируем текст при редактировании (через contentEditable может прийти странный контент)
        value = validateUserInput(value);
        if (value) list[index].name = value;
    } else if (field === 'cost' || field === 'reward') {
        const num = parseInt(value);
        if (!isNaN(num) && isValidNumber(num, 50000)) {
            list[index][field] = num;
        }
    }

    save();
    render();
}
