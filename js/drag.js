function startDrag(e, type) {
    drag.type = type;
    drag.el = e.currentTarget.parentElement; // карточка
    drag.from = Number(drag.el.dataset.index);
    drag.startY = e.clientY;
    drag.startX = e.clientX;
    drag.active = false;

    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', endDrag);
}

function onDragMove(e) {
    const deltaY = Math.abs(e.clientY - drag.startY);
    const deltaX = Math.abs(e.clientX - drag.startX);

    // не считаем drag, пока не прошли порог
    if (!drag.active) {
        if (deltaY < 10 && deltaX < 10) return;
        drag.active = true;
        drag.el.classList.add('dragging');

        if (navigator.vibrate) navigator.vibrate(20);
    }

    // Если это свайп по квестам (горизонтальное движение)
    if (drag.type === 'quests' && deltaX > deltaY) {
        return; // не переупорядочиваем при горизонтальном свайпе
    }

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const target = drag.type === 'quests'
        ? el?.closest('.quest-card')
        : el?.closest('.reward-card');

    if (!target || target === drag.el) return;

    const to = Number(target.dataset.index);
    if (to === drag.from) return;

    const list = drag.type === 'quests' 
        ? (currentQuestTab === 'daily' ? dailyQuests : generalQuests)
        : rewards;

    const item = list.splice(drag.from, 1)[0];
    list.splice(to, 0, item);

    if (navigator.vibrate) {
        navigator.vibrate(12);
    }

    drag.from = to;
    render();
}

function endDrag(e) {
    if (drag.el) drag.el.classList.remove('dragging');
    
    // Обработка свайпа для переключения вкладок квестов
    if (drag.type === 'quests' && drag.active) {
        const deltaX = e.clientX - drag.startX;
        
        if (Math.abs(deltaX) > 50) { // минимальное расстояние свайпа
            if (deltaX > 0 && currentQuestTab === 'general') {
                // Свайп вправо - переключаемся на ежедневные квесты
                switchQuestTab('daily');
            } else if (deltaX < 0 && currentQuestTab === 'daily') {
                // Свайп влево - переключаемся на общие квесты
                switchQuestTab('general');
            }
        }
    }
    
    save();

    drag.type = null;
    drag.from = null;
    drag.el = null;
    drag.active = false;

    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', endDrag);
}
