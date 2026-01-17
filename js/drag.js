/**
 * МОДУЛЬ DRAG-AND-DROP И УПРАВЛЕНИЯ ПОРЯДКОМ
 * 
 * Отвечает за переупорядочивание квестов и наград через drag-and-drop.
 * Также обрабатывает горизонтальный свайп для переключения вкладок.
 * 
 * Лучшие практики:
 * - Эффективное управление event listener (добавление/удаление)
 * - Предотвращение множественных инициализаций drag через флаг drag.active
 * - Использование document.elementFromPoint() для обнаружения цели
 * - Haptic feedback (вибрация) для лучшего UX
 */

/**
 * Инициирует drag-and-drop операцию
 * Устанавливает обработчики для перемещения и окончания drag
 * @param {Event} e - Событие pointerdown
 * @param {string} type - Тип перетаскивания ('quests' или 'rewards')
 */
function startDrag(e, type) {
    if (drag.active) return;
    
    drag.type = type;
    drag.el = e.currentTarget.parentElement;
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

/**
 * Обрабатывает движение мыши/касание во время drag
 * Переупорядочивает элементы при пересечении с другими
 * @param {Event} e - Событие pointermove
 */
function onDragMove(e) {
    const deltaY = Math.abs(e.clientY - drag.startY);
    const deltaX = Math.abs(e.clientX - drag.startX);

    if (!drag.active) {
        if (deltaY < LIMITS.DRAG_THRESHOLD && deltaX < LIMITS.DRAG_THRESHOLD) return;
        drag.active = true;
        drag.el.classList.add('dragging');

        if (navigator.vibrate) navigator.vibrate(LIMITS.VIBRATE_DRAG_START);
    }

    // Если это свайп по квестам (горизонтальное движение)
    if (drag.type === 'quests' && deltaX > deltaY) {
        return;
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
        navigator.vibrate(LIMITS.VIBRATE_DRAG_MOVE);
    }

    drag.from = to;
    render();
}

/**
 * Завершает drag-and-drop операцию
 * Удаляет CSS класс dragging и очищает обработчики событий
 * Сохраняет новый порядок элементов
 * @param {Event} e - Событие pointerup
 */
function endDrag(e) {
    if (drag.el) drag.el.classList.remove('dragging');
    
    save();

    // Удаляем обработчики событий
    if (drag.moveHandler) {
        document.removeEventListener('pointermove', drag.moveHandler);
        drag.moveHandler = null;
    }
    if (drag.endHandler) {
        document.removeEventListener('pointerup', drag.endHandler);
        drag.endHandler = null;
    }

    drag.el = null;
    drag.type = null;
    drag.from = null;
    drag.active = false;
}
