// Константы валидации
const LIMITS = {
    MAX_QUEST_REWARD: 50000,
    MAX_REWARD_COST: 50000,
    MAX_ENTRY_BALANCE: 999999,
    MAX_ENTRY_DELTA: 999999,
    MAX_INPUT_LENGTH: 200,
    MAX_REASON_LENGTH: 500,
    DRAG_THRESHOLD: 10,
    SWIPE_THRESHOLD: 50,
    SWIPE_VERTICAL_THRESHOLD: 30,
    DOUBLE_TAP_TIMEOUT: 400,
    VIBRATE_DRAG_START: 20,
    VIBRATE_DRAG_MOVE: 12
};

// Состояние приложения
let balance = 0;
let log = [];
let presets = {};
let rewards = [];
let dailyQuests = [];
let generalQuests = [];
let currentQuestTab = 'daily';

// Состояние drag-операции
let drag = {
    type: null,
    from: null,
    el: null,
    startY: 0,
    startX: 0,
    active: false,
    moveHandler: null,
    endHandler: null
};

// Состояние свайпа
let swipe = {
    startX: 0,
    startY: 0
};
