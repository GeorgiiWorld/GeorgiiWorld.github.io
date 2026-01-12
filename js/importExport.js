document.getElementById('exportBtn')
    .addEventListener('click', exportData);

function exportData() {
    const data = {
        balance,
        log,
        quests,
        rewards,
        presets,
        version: 1,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questbook.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('importFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);

            if (!confirm('Заменить текущие данные импортированными?')) return;

            balance = data.balance ?? 0;
            log = Array.isArray(data.log) ? data.log : [];
            quests = Array.isArray(data.quests) ? data.quests : [];
            rewards = Array.isArray(data.rewards) ? data.rewards : [];
            presets = data.presets ?? {};

            save();
            render();
        } catch (err) {
            alert('Ошибка импорта: неверный файл');
        }
    };

    reader.readAsText(file);
    e.target.value = ''; // позволяет импортировать тот же файл повторно
});
