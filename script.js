const kanji = document.getElementById("kanji");
const kanjiStage = document.getElementById("kanji-stage");
const counterValue = document.getElementById("counter-value");
const levelValue = document.getElementById("level-value");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const unlockList = document.getElementById("unlock-list");
const unlockMessage = document.getElementById("unlock-message");
const nextUnlock = document.getElementById("next-unlock");
const spinButton = document.getElementById("spin-button");
const autoRotateButton = document.getElementById("auto-rotate-button");
const resetButton = document.getElementById("reset-button");
const unlockToast = document.getElementById("unlock-toast");

const unlockSteps = [
    { count: 10, name: "色変更" },
    { count: 30, name: "自動回転" },
    { count: 50, name: "エフェクト" }
];

const kanjiColors = ["#f7fbff", "#ffd166", "#58d7ff", "#8ef6a4", "#ff8fab"];

// 回転数や自動回転の状態を覚えるための変数です。
let angle = 0;
let rotationCount = 0;
let autoRotateIntervalId = null;
let toastTimeoutId = null;

// その回数の機能が解放済みかを確認します。
function isUnlocked(stepCount) {
    return rotationCount >= stepCount;
}

// 現在のレベルは、解放済み機能の数に合わせて決めます。
function getLevel() {
    const unlockedCount = unlockSteps.filter((step) => isUnlocked(step.count)).length;
    return unlockedCount + 1;
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

// 上部ステータスバーの内容を更新します。
function updateStatusBar() {
    const nextStep = getNextStep();

    counterValue.textContent = rotationCount;
    levelValue.textContent = getLevel();
    nextUnlock.textContent = nextStep ? `あと${nextStep.count - rotationCount}回` : "解放済み";
}

// 解放一覧を並べて表示します。未解放は？？？にします。
function updateUnlockList() {
    unlockList.innerHTML = "";

    unlockSteps.forEach((step) => {
        const item = document.createElement("div");
        const unlocked = isUnlocked(step.count);

        item.className = unlocked ? "unlock-item unlocked" : "unlock-item locked";
        item.textContent = unlocked ? step.name : "？？？";
        unlockList.appendChild(item);
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

// ステージ上の説明メッセージを更新します。
function updateUnlockMessage() {
    const justUnlockedStep = getJustUnlockedStep();
    const nextStep = getNextStep();

    if (justUnlockedStep) {
        unlockMessage.textContent = `${justUnlockedStep.count}回達成。「${justUnlockedStep.name}」が解放されました。`;
        return;
    }

    if (nextStep) {
        unlockMessage.textContent = `${nextStep.count}回で「${nextStep.name}」が解放されます。`;
        return;
    }

    unlockMessage.textContent = "すべての機能が解放されました。";
}

// 解放通知を画面上に一時表示します。
function showUnlockToast(message) {
    unlockToast.textContent = message;
    unlockToast.hidden = false;

    if (toastTimeoutId !== null) {
        window.clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = window.setTimeout(() => {
        unlockToast.hidden = true;
    }, 2200);
}

// 回したときに、軽く弾むアニメーションを付けます。
function playClickAnimation() {
    kanjiStage.classList.remove("bump");
    void kanjiStage.offsetWidth;
    kanjiStage.classList.add("bump");
}

// 画面全体の表示をまとめて更新します。
function updateGameScreen() {
    updateStatusBar();
    updateUnlockList();
    updateProgressGauge();
    updateKanjiColor();
    updateKanjiEffect();
    updateAutoRotateButton();
    updateUnlockMessage();
}

// 自動回転を止める処理です。
function stopAutoRotate() {
    if (autoRotateIntervalId === null) {
        return;
    }

    window.clearInterval(autoRotateIntervalId);
    autoRotateIntervalId = null;
}

// 1回回すときの共通処理です。
function rotateKanji() {
    angle += 360;
    rotationCount += 1;
    kanji.style.transform = `rotate(${angle}deg)`;

    playClickAnimation();
    updateGameScreen();

    const unlockedStep = getJustUnlockedStep();
    if (unlockedStep) {
        showUnlockToast(`新機能解放: ${unlockedStep.name}`);
    }
}

// 文字をクリックしても回せるようにします。
kanji.addEventListener("click", () => {
    rotateKanji();
});

// 下部の回すボタンでも同じ処理を使います。
spinButton.addEventListener("click", () => {
    rotateKanji();
});

// 自動回転のオン・オフを切り替えます。
autoRotateButton.addEventListener("click", () => {
    if (!isUnlocked(30)) {
        return;
    }

    if (autoRotateIntervalId === null) {
        autoRotateIntervalId = window.setInterval(rotateKanji, 1000);
        updateAutoRotateButton();
        return;
    }

    stopAutoRotate();
    updateAutoRotateButton();
});

// リセットでゲームの進行を最初からやり直します。
resetButton.addEventListener("click", () => {
    angle = 0;
    rotationCount = 0;
    stopAutoRotate();
    kanji.style.transform = "rotate(0deg)";
    unlockToast.hidden = true;
    updateGameScreen();
});

updateGameScreen();
