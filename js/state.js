let balance = parseInt(localStorage.getItem('balance')) || 0;
let log = JSON.parse(localStorage.getItem('log')) || [];
let presets = {};
let rewards = JSON.parse(localStorage.getItem('rewards')) || [];
let dailyQuests = JSON.parse(localStorage.getItem('dailyQuests')) || [];
let generalQuests = JSON.parse(localStorage.getItem('generalQuests')) || [];
let currentQuestTab = 'daily';
let drag = {
    type: null,
    from: null,
    el: null,
    startY: 0,
    startX: 0,
    active: false
};
