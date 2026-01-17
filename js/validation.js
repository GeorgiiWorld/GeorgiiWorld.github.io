/**
 * МОДУЛЬ ВАЛИДАЦИИ ДАННЫХ
 * 
 * Отвечает за проверку типов и диапазонов значений перед обработкой.
 * Все пользовательские входные данные и загруженные данные должны проходить валидацию.
 * 
 * Лучшие практики:
 * - Валидация происходит при загрузке (load) и при пользовательском вводе
 * - Все данные восстанавливаются по умолчанию при ошибке валидации
 * - Используются константы LIMITS для единого управления ограничениями
 * - Все функции имеют JSDoc комментарии с описанием параметров и возврата
 */

/**
 * Проверяет, что значение - положительное число в допустимом диапазоне
 * @param {*} value - Значение для проверки
 * @param {number} max - Максимально допустимое значение из LIMITS
 * @returns {boolean} True если число валидно
 */
function isValidNumber(value, max = LIMITS.MAX_ENTRY_BALANCE) {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && num <= max;
}

/**
 * Проверяет структуру объекта квеста
 * @param {*} quest - Объект для проверки
 * @returns {boolean} True если квест валиден (имя + награда)
 */
function isValidQuest(quest) {
    if (!quest || typeof quest !== 'object') return false;
    if (typeof quest.name !== 'string' || quest.name.trim().length === 0) return false;
    if (!isValidNumber(quest.reward, LIMITS.MAX_QUEST_REWARD)) return false;
    return true;
}

/**
 * Проверяет структуру объекта награды
 * @param {*} reward - Объект для проверки
 * @returns {boolean} True если награда валидна (имя + стоимость)
 */
function isValidReward(reward) {
    if (!reward || typeof reward !== 'object') return false;
    if (typeof reward.name !== 'string' || reward.name.trim().length === 0) return false;
    if (!isValidNumber(reward.cost, LIMITS.MAX_REWARD_COST)) return false;
    return true;
}

/**
 * Проверяет структуру записи журнала транзакций
 * @param {*} entry - Объект для проверки
 * @returns {boolean} True если запись валидна (дата, причина, дельта, баланс)
 */
function isValidLogEntry(entry) {
    if (!entry || typeof entry !== 'object') return false;
    if (typeof entry.date !== 'string' || entry.date.length === 0) return false;
    if (typeof entry.reason !== 'string' || entry.reason.length === 0) return false;
    if (!isValidNumber(Math.abs(parseInt(entry.delta)), LIMITS.MAX_ENTRY_DELTA)) return false;
    if (!isValidNumber(entry.balance, LIMITS.MAX_ENTRY_BALANCE)) return false;
    return true;
}

/**
 * Валидирует массив квестов и возвращает чистый массив
 * Фильтрует невалидные элементы и нормализует оставшиеся
 * @param {*} array - Массив для проверки
 * @returns {Array} Отфильтрованный массив валидных квестов
 */
function validateQuestsArray(array) {
    if (!Array.isArray(array)) return [];
    return array.filter(q => isValidQuest(q)).map(q => ({
        name: String(q.name).trim().substring(0, 200),
        reward: Math.abs(parseInt(q.reward))
    }));
}

/**
 * Валидирует массив наград и возвращает чистый массив
 * Фильтрует невалидные элементы и нормализует оставшиеся
 * @param {*} array - Массив для проверки
 * @returns {Array} Отфильтрованный массив валидных наград
 */
function validateRewardsArray(array) {
    if (!Array.isArray(array)) return [];
    return array.filter(r => isValidReward(r)).map(r => ({
        name: String(r.name).trim().substring(0, 200),
        cost: Math.abs(parseInt(r.cost))
    }));
}

/**
 * Валидирует массив логов и возвращает чистый массив
 * Фильтрует невалидные записи и нормализует оставшиеся
 * @param {*} array - Массив для проверки
 * @returns {Array} Отфильтрованный массив валидных записей
 */
function validateLogArray(array) {
    if (!Array.isArray(array)) return [];
    return array.filter(entry => isValidLogEntry(entry)).map(entry => ({
        date: String(entry.date),
        reason: String(entry.reason).trim().substring(0, 200),
        delta: parseInt(entry.delta),
        balance: parseInt(entry.balance)
    }));
}

/**
 * Валидирует пользовательский ввод текста
 * Обрезает пробелы и проверяет длину
 * @param {*} input - Текст для проверки
 * @param {number} maxLength - Максимальная длина из LIMITS
 * @returns {string|null} Чистый текст или null если невалиден
 */
function validateUserInput(input, maxLength = LIMITS.MAX_INPUT_LENGTH) {
    if (typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) return null;
    return trimmed;
}

/**
 * Безопасно парсит JSON с валидацией
 * @param {string} jsonString - JSON строка
 * @param {Function} validator - Функция валидации результата
 * @returns {*|null} Распарсенный объект или null если ошибка
 */
function safeJsonParse(jsonString, validator = null) {
    try {
        const data = JSON.parse(jsonString);
        return validator ? (validator(data) ? data : null) : data;
    } catch (error) {
        console.error('JSON parse error:', error.message);
        return null;
    }
}
