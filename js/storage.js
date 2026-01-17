/**
 * МОДУЛЬ ХРАНИЛИЩА (localStorage)
 * 
 * Отвечает за сохранение и загрузку данных приложения.
 * 
 * Лучшие практики:
 * - Все данные валидируются при загрузке
 * - Обработка QuotaExceededError для переполненного хранилища
 * - Миграция данных от старых версий (старый ключ "quests" -> "generalQuests")
 * - Восстановление значений по умолчанию при критической ошибке
 */

/**
 * Сохраняет все данные в localStorage
 * @throws {Error} Если localStorage недоступен
 */
function save() {
    try {
        localStorage.setItem('balance', String(balance));
        localStorage.setItem('log', JSON.stringify(log));
        localStorage.setItem('dailyQuests', JSON.stringify(dailyQuests));
        localStorage.setItem('generalQuests', JSON.stringify(generalQuests));
        localStorage.setItem('rewards', JSON.stringify(rewards));
        localStorage.setItem('presets', JSON.stringify(presets));
    } catch (error) {
        console.error('Storage save error:', error.message);
        if (error.name === 'QuotaExceededError') {
            alert('Ошибка: хранилище переполнено. Удалите старые записи.');
        } else {
            alert('Ошибка сохранения данных. Попробуйте позже.');
        }
    }
}

/**
 * Загружает все данные из localStorage с валидацией
 * Восстанавливает значения по умолчанию при ошибке
 */
function load() {
    try {
        balance = Math.max(0, parseInt(localStorage.getItem('balance')) || 0);
        log = validateLogArray(JSON.parse(localStorage.getItem('log') || '[]'));
        dailyQuests = validateQuestsArray(JSON.parse(localStorage.getItem('dailyQuests') || '[]'));
        generalQuests = validateQuestsArray(JSON.parse(localStorage.getItem('generalQuests') || '[]'));
        rewards = validateRewardsArray(JSON.parse(localStorage.getItem('rewards') || '[]'));
        presets = JSON.parse(localStorage.getItem('presets') || '{}');
        
        // Миграция старых квестов
        const oldQuests = validateQuestsArray(JSON.parse(localStorage.getItem('quests') || '[]'));
        if (oldQuests.length > 0 && generalQuests.length === 0) {
            generalQuests = oldQuests;
            save();
            localStorage.removeItem('quests');
        }
    } catch (error) {
        console.error('Storage load error:', error.message);
        // Восстанавливаем значения по умолчанию
        balance = 0;
        log = [];
        dailyQuests = [];
        generalQuests = [];
        rewards = [];
        presets = {};
        alert('Ошибка при загрузке данных. Приложение перезагружено.');
    }
}
