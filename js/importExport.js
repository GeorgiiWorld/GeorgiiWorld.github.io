document.getElementById('exportBtn')
    .addEventListener('click', exportData);

function exportData() {
    const data = {
        balance,
        log,
        dailyQuests,
        generalQuests,
        rewards,
        presets,
        version: 2,
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

            // Устанавливаем баланс и логи
            balance = data.balance ?? 0;
            log = Array.isArray(data.log) ? data.log : [];
            rewards = Array.isArray(data.rewards) ? data.rewards : [];
            presets = data.presets ?? {};

            // Обработка ежедневных квестов (только если версия 2)
            if (data.version === 2 && Array.isArray(data.dailyQuests)) {
                dailyQuests = data.dailyQuests;
            } else {
                dailyQuests = [];
            }

            // Обработка общих квестов - совместимость со старой версией
            if (Array.isArray(data.generalQuests)) {
                // Новая структура с generalQuests
                generalQuests = data.generalQuests;
            } else if (Array.isArray(data.quests)) {
                // Старая структура с quests - переносим в generalQuests
                generalQuests = data.quests;
            } else {
                generalQuests = [];
            }

            save();
            render();
        } catch (err) {
            alert('Ошибка импорта: неверный файл');
        }
    };

    reader.readAsText(file);
    e.target.value = ''; // позволяет импортировать тот же файл повторно
});
