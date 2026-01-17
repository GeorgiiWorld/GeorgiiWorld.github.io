/**
 * Модуль валидации данных
 * Проверяет типы и диапазоны значений перед обработкой
 */

/**
 * Проверяет, является ли значение положительным целым числом
 * @param {*} value - Значение для проверки
 * @param {number} [max=999999] - Максимальное значение
 * @returns {boolean} True если валидно
 */
function isValidNumber(value, max = 999999) {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && num <= max;
}

/**
 * Проверяет квест на валидность
 * @param {*} quest - Объект квеста для проверки
 * @returns {boolean} True если валидно
 */
function isValidQuest(quest) {
    if (!quest || typeof quest !== 'object') return false;
    if (typeof quest.name !== 'string' || quest.name.trim().length === 0) return false;
    if (!isValidNumber(quest.reward, 50000)) return false;
    return true;
}

/**
 * Проверяет награду на валидность
 * @param {*} reward - Объект награды для проверки
 * @returns {boolean} True если валидно
 */
function isValidReward(reward) {
    if (!reward || typeof reward !== 'object') return false;
    if (typeof reward.name !== 'string' || reward.name.trim().length === 0) return false;
    if (!isValidNumber(reward.cost, 50000)) return false;
    return true;
}

/**
 * Проверяет запись логов на валидность
 * @param {*} entry - Объект записи для проверки
 * @returns {boolean} True если валидно
 */
function isValidLogEntry(entry) {
    if (!entry || typeof entry !== 'object') return false;
    if (typeof entry.date !== 'string' || entry.date.length === 0) return false;
    if (typeof entry.reason !== 'string' || entry.reason.length === 0) return false;
    if (!isValidNumber(Math.abs(parseInt(entry.delta)), 999999)) return false;
    if (!isValidNumber(entry.balance, 999999)) return false;
    return true;
}

/**
 * Валидирует массив квестов
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
 * Валидирует массив наград
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
 * Валидирует массив логов
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
 * Валидирует строки пользовательского ввода
 * @param {string} input - Строка для проверки
 * @param {number} [maxLength=200] - Максимальная длина
 * @returns {string|null} Очищенная строка или null если невалидна
 */
function validateUserInput(input, maxLength = 200) {
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
