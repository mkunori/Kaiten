const kanji = document.getElementById("kanji");
const kanjiStage = document.getElementById("kanji-stage");
const effectLayer = document.getElementById("effect-layer");
const counterValue = document.getElementById("counter-value");
const levelValue = document.getElementById("level-value");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const badgeList = document.getElementById("badge-list");
const autoRotateButton = document.getElementById("auto-rotate-button");
const resetDataButton = document.getElementById("reset-data-button");
const unlockToast = document.getElementById("unlock-toast");
const levelUpOverlay = document.getElementById("level-up-overlay");
const levelUpValue = document.getElementById("level-up-value");

const unlockSteps = [
    { count: 10, name: "色変更" },
    { count: 30, name: "自動回転" },
    { count: 50, name: "エフェクト" }
];

const badgeSteps = [
    { id: "first-spin", name: "円環の始まり", detail: "最初の回転を刻んだ", type: "rotation", count: 1 },
    { id: "spin-10", name: "微動の刻", detail: "小さな揺らぎが力を帯びる", type: "rotation", count: 10 },
    { id: "spin-50", name: "加速する円環", detail: "巡りは勢いを増していく", type: "rotation", count: 50 },
    { id: "spin-100", name: "円環の探求者", detail: "終わりなき回転の深奥に触れた", type: "rotation", count: 100 },
    { id: "unlock-auto", name: "永久機関", detail: "円環は自ら巡り始める", type: "unlock", count: 30 },
    { id: "level-3", name: "覚醒", detail: "眠っていた力が目を覚ました", type: "level", count: 3 }
];

const kanjiColors = ["#f7fbff", "#ffd166", "#58d7ff", "#8ef6a4", "#ff8fab"];
const levelThresholds = [10, 30, 50, 100];
const saveDataKey = "kaiten-save-data";

// 回転数や自動回転の状態を覚えるための変数です。
let angle = 0;
let rotationCount = 0;
let autoRotateIntervalId = null;
let toastTimeoutId = null;
let levelUpTimeoutId = null;
let particleSeed = 0;
let unlockedBadgeIds = [];

// その回数の機能が解放済みかを確認します。
function isUnlocked(stepCount) {
    return rotationCount >= stepCount;
}

// レベルは回転回数のしきい値に応じて上がります。
function getLevel() {
    let level = 1;

    levelThresholds.forEach((threshold) => {
        if (rotationCount >= threshold) {
            level += 1;
        }
    });

    return level;
}

// 次に解放される機能を探します。
function getNextStep() {
    return unlockSteps.find((step) => rotationCount < step.count) || null;
}

// 今の回転数が、ちょうど解放タイミングかを調べます。
function getJustUnlockedStep() {
    return unlockSteps.find((step) => step.count === rotationCount) || null;
}

// 現在の進行ゲージに必要な情報をまとめます。
function getProgressInfo() {
    const nextStep = getNextStep();

    if (!nextStep) {
        return {
            current: 1,
            total: 1,
            percent: 100
        };
    }

    const previousStep = unlockSteps
        .filter((step) => step.count < nextStep.count && isUnlocked(step.count))
        .at(-1);

    const startCount = previousStep ? previousStep.count : 0;
    const total = nextStep.count - startCount;
    const current = rotationCount - startCount;

    return {
        current,
        total,
        percent: (current / total) * 100
    };
}

// 今のゲーム状態を保存しやすい形にまとめます。
function createSaveData() {
    return {
        rotationCount,
        level: getLevel(),
        unlockedFeatures: unlockSteps
            .filter((step) => isUnlocked(step.count))
            .map((step) => step.name),
        unlockedBadgeIds
    };
}

// localStorageにゲーム状態を保存します。
function saveGameData() {
    try {
        const saveData = createSaveData();
        localStorage.setItem(saveDataKey, JSON.stringify(saveData));
    } catch (error) {
        console.warn("セーブに失敗しました", error);
    }
}

// localStorageにあるゲーム状態を読み込みます。
function loadGameData() {
    try {
        const savedText = localStorage.getItem(saveDataKey);

        if (!savedText) {
            return;
        }

        const savedData = JSON.parse(savedText);
        const validBadgeIds = badgeSteps.map((badge) => badge.id);

        rotationCount = typeof savedData.rotationCount === "number"
            ? Math.max(0, savedData.rotationCount)
            : 0;
        angle = rotationCount * 360;
        unlockedBadgeIds = Array.isArray(savedData.unlockedBadgeIds)
            ? savedData.unlockedBadgeIds.filter((badgeId) => validBadgeIds.includes(badgeId))
            : [];

        kanji.style.transform = `rotate(${angle}deg)`;
    } catch (error) {
        console.warn("セーブデータの読み込みに失敗しました", error);
    }
}

// 上部ステータスバーの内容を更新します。
function updateStatusBar() {
    counterValue.textContent = rotationCount;
    levelValue.textContent = getLevel();
}

// 実績バッジ一覧を表示します。未獲得のものはロック表示にします。
function updateBadgeList() {
    badgeList.innerHTML = "";

    badgeSteps.forEach((badge) => {
        const item = document.createElement("div");
        const badgeName = document.createElement("span");
        const badgeDetail = document.createElement("span");
        const unlocked = unlockedBadgeIds.includes(badge.id);

        item.className = unlocked ? "badge-item unlocked" : "badge-item locked";
        badgeName.className = "badge-name";
        badgeDetail.className = "badge-detail";

        badgeName.textContent = unlocked ? badge.name : "？？？";
        badgeDetail.textContent = unlocked ? badge.detail : "ロック中";

        item.appendChild(badgeName);
        item.appendChild(badgeDetail);
        badgeList.appendChild(item);
    });
}

// 次の解放までのゲージと数値を更新します。
function updateProgressGauge() {
    const progress = getProgressInfo();

    progressText.textContent = `${progress.current} / ${progress.total}`;
    progressFill.style.width = `${progress.percent}%`;
}

// 色変更が解放されたあとだけ、文字色を切り替えます。
function updateKanjiColor() {
    if (!isUnlocked(10)) {
        kanji.style.color = "#f7fbff";
        return;
    }

    const colorIndex = rotationCount % kanjiColors.length;
    kanji.style.color = kanjiColors[colorIndex];
}

// エフェクト解放後だけ、文字に光る見た目を追加します。
function updateKanjiEffect() {
    if (isUnlocked(50)) {
        kanji.classList.add("effect-unlocked");
        return;
    }

    kanji.classList.remove("effect-unlocked");
}

// 下部の自動回転ボタンを、解放状況に応じて更新します。
function updateAutoRotateButton() {
    const autoUnlocked = isUnlocked(30);
    const isEnabled = autoRotateIntervalId !== null;

    autoRotateButton.hidden = false;
    autoRotateButton.disabled = !autoUnlocked;
    autoRotateButton.setAttribute("aria-pressed", String(isEnabled));

    if (!autoUnlocked) {
        autoRotateButton.textContent = "自動回転: 未解放";
        return;
    }

    autoRotateButton.textContent = isEnabled ? "自動回転: ON" : "自動回転: OFF";
}

// 通知を画面上に一時表示します。
function showToast(message, variant = "") {
    unlockToast.className = variant;
    unlockToast.textContent = message;
    unlockToast.hidden = false;

    if (toastTimeoutId !== null) {
        window.clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = window.setTimeout(() => {
        unlockToast.hidden = true;
    }, 2200);
}

// バッジ獲得時は通知の色を少し変えます。
function showBadgeToast(message) {
    showToast(message, "badge-toast");
}

// レベルアップ時は中央付近に大きく表示します。
function showLevelUpOverlay(level) {
    levelUpValue.textContent = `Lv.${level}`;
    levelUpOverlay.hidden = false;
    levelUpOverlay.classList.remove("show");
    void levelUpOverlay.offsetWidth;
    levelUpOverlay.classList.add("show");

    if (levelUpTimeoutId !== null) {
        window.clearTimeout(levelUpTimeoutId);
    }

    levelUpTimeoutId = window.setTimeout(() => {
        levelUpOverlay.hidden = true;
    }, 1300);
}

// エフェクト用のリングを追加します。
function createRingEffect(isSpecial) {
    const ring = document.createElement("span");

    ring.className = isSpecial ? "ring-effect special" : "ring-effect";
    ring.addEventListener("animationend", () => {
        ring.remove();
    });
    effectLayer.appendChild(ring);
}

// エフェクト用のパーティクルを追加します。
function createParticleEffect(isSpecial) {
    const particle = document.createElement("span");
    const angleDegree = (particleSeed * 47) % 360;
    const distance = isSpecial ? 78 + (particleSeed % 28) : 52 + (particleSeed % 20);
    const moveX = Math.cos((angleDegree * Math.PI) / 180) * distance;
    const moveY = Math.sin((angleDegree * Math.PI) / 180) * distance;

    particleSeed += 1;
    particle.className = isSpecial ? "particle special" : "particle";
    particle.style.setProperty("--move-x", `${moveX.toFixed(1)}px`);
    particle.style.setProperty("--move-y", `${moveY.toFixed(1)}px`);
    particle.addEventListener("animationend", () => {
        particle.remove();
    });
    effectLayer.appendChild(particle);
}

// 回したときに、弾みと光りを付けます。
function playClickAnimation(isSpecial = false) {
    kanjiStage.classList.remove("bump");
    kanjiStage.classList.remove("flash");
    kanji.classList.remove("pop");
    void kanjiStage.offsetWidth;
    kanjiStage.classList.add("bump");
    kanjiStage.classList.add("flash");
    kanji.classList.add("pop");

    createRingEffect(isSpecial);

    const particleCount = isSpecial ? 14 : 8;
    for (let index = 0; index < particleCount; index += 1) {
        createParticleEffect(isSpecial);
    }
}

// 解放や実績獲得時は、通常より少し豪華な演出を追加します。
function playRewardEffect() {
    createRingEffect(true);

    for (let index = 0; index < 12; index += 1) {
        createParticleEffect(true);
    }
}

// 画面全体の表示をまとめて更新します。
function updateGameScreen() {
    updateStatusBar();
    updateBadgeList();
    updateProgressGauge();
    updateKanjiColor();
    updateKanjiEffect();
    updateAutoRotateButton();
}

// 自動回転を止める処理です。
function stopAutoRotate() {
    if (autoRotateIntervalId === null) {
        return;
    }

    window.clearInterval(autoRotateIntervalId);
    autoRotateIntervalId = null;
}

// 条件を満たした実績があるかを調べます。
function checkNewBadges() {
    const currentLevel = getLevel();
    const newBadges = [];

    badgeSteps.forEach((badge) => {
        if (unlockedBadgeIds.includes(badge.id)) {
            return;
        }

        if (badge.type === "rotation" && rotationCount >= badge.count) {
            unlockedBadgeIds.push(badge.id);
            newBadges.push(badge);
            return;
        }

        if (badge.type === "unlock" && isUnlocked(badge.count)) {
            unlockedBadgeIds.push(badge.id);
            newBadges.push(badge);
            return;
        }

        if (badge.type === "level" && currentLevel >= badge.count) {
            unlockedBadgeIds.push(badge.id);
            newBadges.push(badge);
        }
    });

    return newBadges;
}

// 1回回すときの共通処理です。
function rotateKanji(options = {}) {
    const { playEffect = true } = options;
    const previousLevel = getLevel();

    angle += 360;
    rotationCount += 1;
    kanji.style.transform = `rotate(${angle}deg)`;
    const unlockedStep = getJustUnlockedStep();
    const currentLevel = getLevel();
    const levelUpHappened = currentLevel > previousLevel;

    if (playEffect) {
        playClickAnimation(Boolean(unlockedStep) || levelUpHappened);
    }

    const newBadges = checkNewBadges();
    updateGameScreen();

    if (unlockedStep) {
        showToast(`新機能解放: ${unlockedStep.name}`);
        playRewardEffect();
    }

    if (levelUpHappened) {
        showLevelUpOverlay(currentLevel);
        playRewardEffect();
    }

    if (newBadges.length > 0) {
        showBadgeToast(`実績解除：${newBadges[0].name}`);
        playRewardEffect();
    }

    saveGameData();
}

// 文字をクリックしても回せるようにします。
kanji.addEventListener("click", () => {
    rotateKanji({ playEffect: false });
});

// 自動回転のオン・オフを切り替えます。
autoRotateButton.addEventListener("click", () => {
    if (!isUnlocked(30)) {
        return;
    }

    if (autoRotateIntervalId === null) {
        autoRotateIntervalId = window.setInterval(() => {
            rotateKanji({ playEffect: false });
        }, 1000);
        updateAutoRotateButton();
        return;
    }

    stopAutoRotate();
    updateAutoRotateButton();
});

// データリセットは保存データも削除して最初から遊び直します。
resetDataButton.addEventListener("click", () => {
    angle = 0;
    rotationCount = 0;
    unlockedBadgeIds = [];
    stopAutoRotate();
    kanji.style.transform = "rotate(0deg)";
    unlockToast.hidden = true;
    levelUpOverlay.hidden = true;
    effectLayer.innerHTML = "";
    localStorage.removeItem(saveDataKey);
    updateGameScreen();
});

loadGameData();
updateGameScreen();
levelUpOverlay.hidden = true;
