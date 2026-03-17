const kanji = document.getElementById("kanji");
const kanjiStage = document.getElementById("kanji-stage");
const effectLayer = document.getElementById("effect-layer");
const pageBody = document.body;
const counterValue = document.getElementById("counter-value");
const levelValue = document.getElementById("level-value");
const levelProgressValue = document.getElementById("level-progress-value");
const awakeningTitle = document.getElementById("awakening-title");
const awakeningState = document.getElementById("awakening-state");
const awakeningFill = document.getElementById("awakening-fill");
const awakeningText = document.getElementById("awakening-text");
const badgeList = document.getElementById("badge-list");
const autoRotateButton = document.getElementById("auto-rotate-button");
const resetDataButton = document.getElementById("reset-data-button");
const unlockToast = document.getElementById("unlock-toast");
const levelUpOverlay = document.getElementById("level-up-overlay");
const levelUpValue = document.getElementById("level-up-value");
const awakeningOverlay = document.getElementById("awakening-overlay");
const awakeningValue = document.getElementById("awakening-value");

const unlockSteps = [
    { count: 10, name: "色変更" },
    { count: 30, name: "自動回転" },
    { count: 50, name: "エフェクト" },
    { count: 100, name: "覚醒モード" }
];

const badgeSteps = [
    { id: "spin_1", name: "円環の始まり", detail: "最初の回転を刻んだ", type: "rotation", count: 1 },
    { id: "spin_10", name: "微動の刻", detail: "わずかな揺らぎが動きへ変わる", type: "rotation", count: 10 },
    { id: "spin_25", name: "流転の兆し", detail: "回転は静かに流れを帯びはじめる", type: "rotation", count: 25 },
    { id: "spin_50", name: "加速する円環", detail: "円は意思を持つように勢いを増す", type: "rotation", count: 50 },
    { id: "spin_100", name: "円環の探求者", detail: "回転の理を追いはじめた者", type: "rotation", count: 100 },
    { id: "spin_200", name: "共鳴する輪", detail: "幾重もの回転が響き合う", type: "rotation", count: 200 },
    { id: "spin_300", name: "流転の観測者", detail: "絶えぬ動きを見つめ続ける者", type: "rotation", count: 300 },
    { id: "spin_500", name: "永劫への接近", detail: "終わりなき巡りへ手が届きはじめる", type: "rotation", count: 500 },
    { id: "spin_700", name: "輪廻の担い手", detail: "回り続ける力をその身に宿した", type: "rotation", count: 700 },
    { id: "spin_1000", name: "永久機関の証明", detail: "回転はついに尽きぬ領域へ至る", type: "rotation", count: 1000 },
    { id: "level_5", name: "微光の目覚め", detail: "かすかな輝きが回転の奥で目を覚ます", type: "level", count: 5 },
    { id: "level_10", name: "流転の見習い", detail: "巡りの理に触れはじめた者", type: "level", count: 10 },
    { id: "level_20", name: "円環の歩み手", detail: "回転の道を確かな足取りで進みゆく", type: "level", count: 20 },
    { id: "level_30", name: "共鳴の担い手", detail: "幾つもの巡りをその身に響かせる", type: "level", count: 30 },
    { id: "level_50", name: "永劫の探求者", detail: "果てなき循環の深みを追い求める者", type: "level", count: 50 },
    { id: "level_75", name: "輪廻の継承者", detail: "巡り続ける力を受け継ぎ、その先へ運ぶ", type: "level", count: 75 },
    { id: "level_100", name: "円環の証明者", detail: "積み重ねた回転が到達を証明する", type: "level", count: 100 },
    { id: "awakening_enkankirei", name: "円環励起", detail: "円環は活性し、力を帯びる", type: "awakening", awakeningName: "円環励起" },
    { id: "awakening_rutenkakusei", name: "流転覚醒", detail: "流れは目覚め、巡りを強めていく", type: "awakening", awakeningName: "流転覚醒" },
    { id: "awakening_enkankyomei", name: "円環共鳴", detail: "幾つもの回転がひとつの響きとなる", type: "awakening", awakeningName: "円環共鳴" },
    { id: "awakening_rinnekasoku", name: "輪廻加速", detail: "巡りは熱を帯び、さらに速さを増す", type: "awakening", awakeningName: "輪廻加速" },
    { id: "awakening_kandokaiho", name: "環動解放", detail: "閉じていた循環が解き放たれる", type: "awakening", awakeningName: "環動解放" },
    { id: "awakening_complete", name: "円環の理解者", detail: "あらゆる覚醒を知り、巡りの全体像に触れた", type: "awakening-complete" }
];

const kanjiColors = ["#f7fbff", "#ffd166", "#58d7ff", "#8ef6a4", "#ff8fab"];
const saveDataKey = "kaiten-save-data";
const levelBaseRequirement = 20;
const levelRequirementStep = 10;
const autoRotateNormalIntervalMs = 1000;
const autoRotateAwakeningIntervalMs = 500;
const awakeningUnlockCount = 100;
const awakeningChargeMax = 10;
const awakeningMinDurationMs = 4000;
const awakeningMaxDurationMs = 10000;
const awakeningCooldownMs = 5000;
const awakeningNames = [
    "円環励起",
    "流転覚醒",
    "円環共鳴",
    "輪廻加速",
    "環動解放"
];

// 回転数や自動回転の状態を覚えるための変数です。
let angle = 0;
let rotationCount = 0;
let autoRotateIntervalId = null;
let toastTimeoutId = null;
let levelUpTimeoutId = null;
let particleSeed = 0;
let unlockedBadgeIds = [];
let awakeningCharge = 0;
let isAwakening = false;
let awakeningEndsAt = 0;
let awakeningStartedAt = 0;
let awakeningDurationMs = 0;
let currentAwakeningName = "";
let awakeningTimeoutId = null;
let awakeningTimerIntervalId = null;
let awakeningCooldownEndsAt = 0;

// その回数の機能が解放済みかを確認します。
function isUnlocked(stepCount) {
    return rotationCount >= stepCount;
}

// 次のレベルに必要な回転数を返します。
// 20 + (現在レベル - 1) × 10 の一次式です。
function getRotationsNeededForNextLevel(currentLevel) {
    return levelBaseRequirement + (currentLevel - 1) * levelRequirementStep;
}

// 総回転数から現在のレベルを計算します。
function getLevel() {
    let level = 1;
    let usedRotations = 0;

    while (true) {
        const rotationsNeeded = getRotationsNeededForNextLevel(level);

        if (rotationCount < usedRotations + rotationsNeeded) {
            return level;
        }

        usedRotations += rotationsNeeded;
        level += 1;
    }
}

// 今のレベル区間で、どれだけ進んだかを返します。
function getLevelProgress() {
    let level = 1;
    let usedRotations = 0;

    while (true) {
        const rotationsNeeded = getRotationsNeededForNextLevel(level);

        if (rotationCount < usedRotations + rotationsNeeded) {
            return {
                currentLevel: level,
                current: rotationCount - usedRotations,
                required: rotationsNeeded
            };
        }

        usedRotations += rotationsNeeded;
        level += 1;
    }
}

// 今回の回転で新しく解放された機能を調べます。
function getJustUnlockedStep(previousCount, currentCount) {
    return unlockSteps.find((step) => previousCount < step.count && currentCount >= step.count) || null;
}

// 覚醒中なら、残り時間を秒で返します。
function getAwakeningSecondsLeft() {
    if (!isAwakening) {
        return 0;
    }

    const millisecondsLeft = Math.max(0, awakeningEndsAt - Date.now());
    return Math.ceil(millisecondsLeft / 1000);
}

// クールタイム中なら、残り時間を秒で返します。
function getAwakeningCooldownSecondsLeft() {
    const millisecondsLeft = Math.max(0, awakeningCooldownEndsAt - Date.now());
    return Math.ceil(millisecondsLeft / 1000);
}

// クールタイム中かどうかを調べます。
function isAwakeningCooldownActive() {
    return awakeningCooldownEndsAt > Date.now();
}

// 覚醒中の残り時間を、ゲージ用の割合で返します。
function getAwakeningTimePercent() {
    if (!isAwakening || awakeningDurationMs <= 0) {
        return 0;
    }

    const millisecondsLeft = Math.max(0, awakeningEndsAt - Date.now());
    return (millisecondsLeft / awakeningDurationMs) * 100;
}

// 通常時の蓄積ゲージを、割合で返します。
function getAwakeningChargePercent() {
    return (awakeningCharge / awakeningChargeMax) * 100;
}

// 配列の中からランダムで1つ選びます。
function getRandomItem(items) {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
}

// 覚醒時間を4秒から10秒の間でランダムに決めます。
function getRandomAwakeningDuration() {
    const range = awakeningMaxDurationMs - awakeningMinDurationMs;
    return awakeningMinDurationMs + Math.floor(Math.random() * (range + 1));
}

// 今のゲーム状態を保存しやすい形にまとめます。
function createSaveData() {
    return {
        rotationCount,
        level: getLevel(),
        unlockedFeatures: unlockSteps
            .filter((step) => isUnlocked(step.count))
            .map((step) => step.name),
        unlockedBadgeIds,
        awakeningCharge,
        isAwakening,
        awakeningEndsAt,
        awakeningStartedAt,
        awakeningDurationMs,
        currentAwakeningName,
        awakeningCooldownEndsAt
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
        awakeningCharge = typeof savedData.awakeningCharge === "number"
            ? Math.min(awakeningChargeMax, Math.max(0, savedData.awakeningCharge))
            : 0;
        isAwakening = Boolean(savedData.isAwakening);
        awakeningEndsAt = typeof savedData.awakeningEndsAt === "number"
            ? savedData.awakeningEndsAt
            : 0;
        awakeningStartedAt = typeof savedData.awakeningStartedAt === "number"
            ? savedData.awakeningStartedAt
            : 0;
        awakeningDurationMs = typeof savedData.awakeningDurationMs === "number"
            ? Math.max(0, savedData.awakeningDurationMs)
            : 0;
        currentAwakeningName = typeof savedData.currentAwakeningName === "string"
            ? savedData.currentAwakeningName
            : "";
        awakeningCooldownEndsAt = typeof savedData.awakeningCooldownEndsAt === "number"
            ? savedData.awakeningCooldownEndsAt
            : 0;

        if (isAwakening && awakeningEndsAt <= Date.now()) {
            isAwakening = false;
            awakeningStartedAt = 0;
            awakeningDurationMs = 0;
            currentAwakeningName = "";
            awakeningEndsAt = 0;
        }

        if (!isAwakening && awakeningCooldownEndsAt <= Date.now()) {
            awakeningCooldownEndsAt = 0;
        }

        kanji.style.transform = `rotate(${angle}deg)`;
    } catch (error) {
        console.warn("セーブデータの読み込みに失敗しました", error);
    }
}

// 上部ステータスバーの内容を更新します。
function updateStatusBar() {
    const levelProgress = getLevelProgress();

    counterValue.textContent = rotationCount;
    levelValue.textContent = levelProgress.currentLevel;
    levelProgressValue.textContent = `${levelProgress.current} / ${levelProgress.required}`;
}

// 覚醒状態の表示を更新します。
function updateAwakeningPanel() {
    if (!isUnlocked(awakeningUnlockCount)) {
        awakeningTitle.textContent = "？？？";
        awakeningState.textContent = "？？？";
        awakeningState.classList.remove("active");
        awakeningFill.style.width = "0%";
        awakeningText.textContent = "ロック中";
        return;
    }

    awakeningTitle.textContent = "覚醒状態";

    if (isAwakening) {
        awakeningState.textContent = currentAwakeningName;
        awakeningState.classList.add("active");
        awakeningFill.style.width = `${getAwakeningTimePercent()}%`;
        awakeningText.textContent = `残り ${getAwakeningSecondsLeft()} 秒`;
        return;
    }

    if (isAwakeningCooldownActive()) {
        awakeningState.textContent = "クールタイム中";
        awakeningState.classList.remove("active");
        awakeningFill.style.width = "0%";
        awakeningText.textContent = `残り ${getAwakeningCooldownSecondsLeft()} 秒`;
        return;
    }

    awakeningState.textContent = "通常";
    awakeningState.classList.remove("active");
    awakeningFill.style.width = `${getAwakeningChargePercent()}%`;
    awakeningText.textContent = `蓄積 ${awakeningCharge} / ${awakeningChargeMax}`;
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
    } else {
        kanji.classList.remove("effect-unlocked");
    }

    kanji.classList.toggle("awakening-active", isAwakening);
}

// 覚醒中は背景の色味も切り替えて、強化状態を見やすくします。
function updateAwakeningBackground() {
    pageBody.classList.toggle("awakening-mode", isAwakening);
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
function showBadgeToast(badge) {
    const message = `実績解除：${badge.name}\n${badge.detail}`;
    showToast(message, "badge-toast");
}

// 覚醒名に対応する実績を探します。
function findAwakeningBadge(awakeningName) {
    return badgeSteps.find((badge) => (
        badge.type === "awakening" && badge.awakeningName === awakeningName
    )) || null;
}

// 5種類の覚醒実績をすべて持っているか調べます。
function hasAllAwakeningBadges() {
    const awakeningBadges = badgeSteps.filter((badge) => badge.type === "awakening");

    return awakeningBadges.every((badge) => unlockedBadgeIds.includes(badge.id));
}

// 覚醒開始時の実績を判定します。
function checkAwakeningBadges(awakeningName) {
    const newBadges = [];
    const awakeningBadge = findAwakeningBadge(awakeningName);

    if (awakeningBadge && !unlockedBadgeIds.includes(awakeningBadge.id)) {
        unlockedBadgeIds.push(awakeningBadge.id);
        newBadges.push(awakeningBadge);
    }

    const completeBadge = badgeSteps.find((badge) => badge.type === "awakening-complete");

    if (completeBadge && !unlockedBadgeIds.includes(completeBadge.id) && hasAllAwakeningBadges()) {
        unlockedBadgeIds.push(completeBadge.id);
        newBadges.push(completeBadge);
    }

    return newBadges;
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

// 覚醒開始時は中央に大きな演出を表示します。
function showAwakeningOverlay() {
    awakeningValue.textContent = currentAwakeningName || "覚醒";
    awakeningOverlay.hidden = false;
    awakeningOverlay.classList.remove("show");
    void awakeningOverlay.offsetWidth;
    awakeningOverlay.classList.add("show");

    window.setTimeout(() => {
        awakeningOverlay.hidden = true;
    }, 1600);
}

// エフェクト用のリングを追加します。
function createRingEffect(isSpecial) {
    const ring = document.createElement("span");

    ring.className = isSpecial || isAwakening ? "ring-effect special" : "ring-effect";
    ring.addEventListener("animationend", () => {
        ring.remove();
    });
    effectLayer.appendChild(ring);
}

// エフェクト用のパーティクルを追加します。
function createParticleEffect(isSpecial) {
    const particle = document.createElement("span");
    const angleDegree = (particleSeed * 47) % 360;
    const boosted = isSpecial || isAwakening;
    const distance = boosted ? 78 + (particleSeed % 28) : 52 + (particleSeed % 20);
    const moveX = Math.cos((angleDegree * Math.PI) / 180) * distance;
    const moveY = Math.sin((angleDegree * Math.PI) / 180) * distance;

    particleSeed += 1;
    particle.className = boosted ? "particle special" : "particle";
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
    kanji.classList.remove("surge");
    void kanjiStage.offsetWidth;
    kanjiStage.classList.add("bump");
    kanjiStage.classList.add("flash");
    kanji.classList.add("surge");

    createRingEffect(isSpecial);

    const particleCount = isSpecial || isAwakening ? 14 : 8;
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

// 覚醒中の残り時間表示を定期的に更新します。
function startAwakeningTimerDisplay() {
    if (awakeningTimerIntervalId !== null) {
        window.clearInterval(awakeningTimerIntervalId);
    }

    awakeningTimerIntervalId = window.setInterval(() => {
        if (!isAwakening && !isAwakeningCooldownActive()) {
            window.clearInterval(awakeningTimerIntervalId);
            awakeningTimerIntervalId = null;
            return;
        }

        updateAwakeningPanel();
    }, 250);
}

// 覚醒モードを終了して通常状態へ戻します。
function endAwakeningMode() {
    if (!isAwakening) {
        return;
    }

    isAwakening = false;
    currentAwakeningName = "";
    awakeningStartedAt = 0;
    awakeningDurationMs = 0;
    awakeningEndsAt = 0;
    awakeningCooldownEndsAt = Date.now() + awakeningCooldownMs;
    kanjiStage.classList.remove("flash");

    if (awakeningTimeoutId !== null) {
        window.clearTimeout(awakeningTimeoutId);
        awakeningTimeoutId = null;
    }

    if (awakeningTimerIntervalId !== null) {
        window.clearInterval(awakeningTimerIntervalId);
        awakeningTimerIntervalId = null;
    }

    updateGameScreen();
    refreshAutoRotateSpeed();
    startAwakeningTimerDisplay();
    saveGameData();
}

// 覚醒モードを自動発動します。
function startAwakeningMode() {
    isAwakening = true;
    awakeningCharge = 0;
    currentAwakeningName = getRandomItem(awakeningNames);
    awakeningDurationMs = getRandomAwakeningDuration();
    awakeningStartedAt = Date.now();
    awakeningEndsAt = awakeningStartedAt + awakeningDurationMs;
    const newAwakeningBadges = checkAwakeningBadges(currentAwakeningName);
    showToast(`${currentAwakeningName} 発動`);
    showAwakeningOverlay();
    playRewardEffect();
    updateGameScreen();
    refreshAutoRotateSpeed();
    startAwakeningTimerDisplay();
    saveGameData();

    if (newAwakeningBadges.length > 0) {
        showBadgeToast(newAwakeningBadges[0]);
        playRewardEffect();
    }

    if (awakeningTimeoutId !== null) {
        window.clearTimeout(awakeningTimeoutId);
    }

    awakeningTimeoutId = window.setTimeout(() => {
        endAwakeningMode();
    }, awakeningDurationMs);
}

// 画面全体の表示をまとめて更新します。
function updateGameScreen() {
    updateStatusBar();
    updateAwakeningPanel();
    updateBadgeList();
    updateKanjiColor();
    updateKanjiEffect();
    updateAwakeningBackground();
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

// 今の状態に応じた自動回転の間隔を返します。
function getAutoRotateIntervalMs() {
    if (isAwakening) {
        return autoRotateAwakeningIntervalMs;
    }

    return autoRotateNormalIntervalMs;
}

// 指定した間隔で自動回転を開始します。
function startAutoRotateWithInterval(intervalMs) {
    autoRotateIntervalId = window.setInterval(() => {
        rotateKanji({ playEffect: false, isManualSpin: false });
    }, intervalMs);
}

// 自動回転を開始します。すでに動いているときは何もしません。
function startAutoRotate() {
    if (autoRotateIntervalId !== null) {
        return;
    }

    startAutoRotateWithInterval(getAutoRotateIntervalMs());
}

// 自動回転中なら、今の状態に合わせて速度を更新します。
function refreshAutoRotateSpeed() {
    if (autoRotateIntervalId === null) {
        return;
    }

    stopAutoRotate();
    startAutoRotateWithInterval(getAutoRotateIntervalMs());
    updateAutoRotateButton();
}

// 手動クリック時だけ覚醒ゲージをためます。
function addAwakeningChargeByManualSpin() {
    if (isAwakening || !isUnlocked(awakeningUnlockCount) || isAwakeningCooldownActive()) {
        return;
    }

    awakeningCharge = Math.min(awakeningChargeMax, awakeningCharge + 1);
}

// 手動クリック時だけ覚醒モードへの突入判定を行います。
function tryStartAwakeningByManualSpin() {
    if (isAwakening || !isUnlocked(awakeningUnlockCount) || isAwakeningCooldownActive()) {
        return;
    }

    if (awakeningCharge >= awakeningChargeMax) {
        startAwakeningMode();
    }
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

        if (badge.type === "level" && currentLevel >= badge.count) {
            unlockedBadgeIds.push(badge.id);
            newBadges.push(badge);
        }
    });

    return newBadges;
}

// 1回回すときの共通処理です。
function rotateKanji(options = {}) {
    const { playEffect = true, isManualSpin = false } = options;
    const previousCount = rotationCount;
    const previousLevel = getLevel();
    const spinAmount = isAwakening ? 2 : 1;

    angle += 360;
    rotationCount += spinAmount;
    kanji.style.transform = `rotate(${angle}deg)`;

    if (isManualSpin) {
        addAwakeningChargeByManualSpin();
        tryStartAwakeningByManualSpin();
    }

    const unlockedStep = getJustUnlockedStep(previousCount, rotationCount);
    const currentLevel = getLevel();
    const levelUpHappened = currentLevel > previousLevel;

    if (playEffect || isAwakening) {
        playClickAnimation(Boolean(unlockedStep) || levelUpHappened);
    }

    const newBadges = checkNewBadges();
    updateGameScreen();

    if (unlockedStep) {
        if (unlockedStep.count === 30) {
            startAutoRotate();
            updateAutoRotateButton();
        }

        showToast(`新機能解放: ${unlockedStep.name}`);
        playRewardEffect();
    }

    if (levelUpHappened) {
        showLevelUpOverlay(currentLevel);
        playRewardEffect();
    }

    if (newBadges.length > 0) {
        showBadgeToast(newBadges[0]);
        playRewardEffect();
    }

    saveGameData();
}

// 文字をクリックしても回せるようにします。
kanji.addEventListener("click", () => {
    rotateKanji({ playEffect: false, isManualSpin: true });
});

// 自動回転のオン・オフを切り替えます。
autoRotateButton.addEventListener("click", () => {
    if (!isUnlocked(30)) {
        return;
    }

    if (autoRotateIntervalId === null) {
        startAutoRotate();
        updateAutoRotateButton();
        return;
    }

    stopAutoRotate();
    updateAutoRotateButton();
});

// データリセットは保存データも削除して最初から遊び直します。
resetDataButton.addEventListener("click", () => {
    endAwakeningMode();
    angle = 0;
    rotationCount = 0;
    unlockedBadgeIds = [];
    isAwakening = false;
    awakeningEndsAt = 0;
    awakeningStartedAt = 0;
    awakeningDurationMs = 0;
    currentAwakeningName = "";
    awakeningCharge = 0;
    awakeningCooldownEndsAt = 0;
    stopAutoRotate();
    kanji.style.transform = "rotate(0deg)";
    unlockToast.hidden = true;
    levelUpOverlay.hidden = true;
    awakeningOverlay.hidden = true;
    effectLayer.innerHTML = "";
    localStorage.removeItem(saveDataKey);
    updateGameScreen();
});

loadGameData();

if (isAwakening) {
    const remainingTime = Math.max(0, awakeningEndsAt - Date.now());
    startAwakeningTimerDisplay();
    awakeningTimeoutId = window.setTimeout(() => {
        endAwakeningMode();
    }, remainingTime);
} else if (isAwakeningCooldownActive()) {
    startAwakeningTimerDisplay();
}

updateGameScreen();
levelUpOverlay.hidden = true;
awakeningOverlay.hidden = true;
