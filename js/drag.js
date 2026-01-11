function startDrag(e, type) {
    drag.type = type;
    drag.el = e.currentTarget.parentElement; // карточка
    drag.from = Number(drag.el.dataset.index);
    drag.startY = e.clientY;
    drag.active = false;

    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', endDrag);
}

function onDragMove(e) {
    const deltaY = Math.abs(e.clientY - drag.startY);

    // не считаем drag, пока не прошли порог
    if (!drag.active) {
        if (deltaY < 10) return;
        drag.active = true;
        drag.el.classList.add('dragging');

        if (navigator.vibrate) navigator.vibrate(20);

        return;
    }

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const target = drag.type === 'quests'
        ? el?.closest('.quest-card')
        : el?.closest('.reward-card');

    if (!target || target === drag.el) return;

    const to = Number(target.dataset.index);
    if (to === drag.from) return;

    const list = drag.type === 'quests' ? quests : rewards;

    const item = list.splice(drag.from, 1)[0];
    list.splice(to, 0, item);

    if (navigator.vibrate) {
        navigator.vibrate(12);
    }

    drag.from = to;
    render();
}

function endDrag() {
    if (drag.el) drag.el.classList.remove('dragging');
    save();

    drag.type = null;
    drag.from = null;
    drag.el = null;
    drag.active = false;

    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', endDrag);
}
