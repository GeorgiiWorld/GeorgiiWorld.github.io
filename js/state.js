let balance = parseInt(localStorage.getItem('balance')) || 0;
let log = JSON.parse(localStorage.getItem('log')) || [];
let presets = {};
let rewards = JSON.parse(localStorage.getItem('rewards')) || [];
let quests = JSON.parse(localStorage.getItem('quests')) || [];
let drag = {
    type: null,
    from: null,
    el: null,
    startY: 0,
    active: false
};
