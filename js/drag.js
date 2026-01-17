function startDrag(e, type) {
    // Предотвращаем множественные инициализации drag
    if (drag.active) return;
    
    drag.type = type;
    drag.el = e.currentTarget.parentElement; // карточка
    drag.from = Number(drag.el.dataset.index);
    drag.startY = e.clientY;
    drag.startX = e.clientX;
    drag.active = false;

    const handleDragMove = onDragMove.bind(null);
    const handleDragEnd = endDrag.bind(null);
    
    // Сохраняем обработчики для последующего удаления
    drag.moveHandler = handleDragMove;
    drag.endHandler = handleDragEnd;
    
    document.addEventListener('pointermove', handleDragMove);
    document.addEventListener('pointerup', handleDragEnd);
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
    
    save();

    // Удаляем обработчики событий
    if (drag.moveHandler) {
        document.removeEventListener('pointermove', drag.moveHandler);
    }
    if (drag.endHandler) {
        document.removeEventListener('pointerup', drag.endHandler);
    }

    drag.type = null;
    drag.from = null;
    drag.el = null;
    drag.active = false;
    drag.moveHandler = null;
    drag.endHandler = null;
}
