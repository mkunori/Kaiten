const kanji = document.getElementById("kanji");
const counterValue = document.getElementById("counter-value");
const unlockList = document.getElementById("unlock-list");
const unlockMessage = document.getElementById("unlock-message");
const nextUnlock = document.getElementById("next-unlock");
const autoRotateButton = document.getElementById("auto-rotate-button");
const resetButton = document.getElementById("reset-button");

const unlockSteps = [
    { count: 10, name: "色変更" },
    { count: 30, name: "自動回転" },
    { count: 50, name: "エフェクト" }
];

const kanjiColors = ["#222222", "#e63946", "#1d3557", "#2a9d8f", "#f4a261"];

// 何度回転したかや、自動回転の状態を覚えておくための変数です。
let angle = 0;
let rotationCount = 0;
let autoRotateIntervalId = null;
let lastUnlockedCount = 0;

// 解放済みかどうかを、回転回数から判断しやすくするための関数です。
function isColorUnlocked() {
    return rotationCount >= 10;
}

function isAutoRotateUnlocked() {
    return rotationCount >= 30;
}

function isEffectUnlocked() {
    return rotationCount >= 50;
}

// その機能が解放済みかを、必要回数から判断します。
function isUnlocked(stepCount) {
    return rotationCount >= stepCount;
}

// 回転回数の表示を更新します。
function updateCounter() {
    counterValue.textContent = rotationCount;
}

// 解放機能を並べて表示し、未解放のものは？？？にします。
function updateUnlockList() {
    unlockList.innerHTML = "";

    unlockSteps.forEach((step) => {
        const item = document.createElement("span");
        const unlocked = isUnlocked(step.count);

        item.className = unlocked ? "unlock-item unlocked" : "unlock-item locked";
        item.textContent = unlocked ? step.name : "？？？";
        unlockList.appendChild(item);
    });
}

// 色変更が解放されたあとは、回転回数に応じて文字色を変えます。
function updateKanjiColor() {
    if (!isColorUnlocked()) {
        kanji.style.color = "#222222";
        return;
    }

    const colorIndex = rotationCount % kanjiColors.length;
    kanji.style.color = kanjiColors[colorIndex];
}

// 50回解放後は、影を付けて少し派手な見た目にします。
function updateKanjiEffect() {
    if (isEffectUnlocked()) {
        kanji.classList.add("effect-unlocked");
        return;
    }

    kanji.classList.remove("effect-unlocked");
}

// 自動回転ボタンの表示とオン・オフ表示を更新します。
function updateAutoRotateButton() {
    const isEnabled = autoRotateIntervalId !== null;

    autoRotateButton.hidden = !isAutoRotateUnlocked();
    autoRotateButton.textContent = isEnabled ? "自動回転: オン" : "自動回転: オフ";
    autoRotateButton.setAttribute("aria-pressed", String(isEnabled));
}

// 次の解放まで残り何回かを表示します。
function updateNextUnlock() {
    const nextStep = unlockSteps.find((step) => rotationCount < step.count);

    if (!nextStep) {
        nextUnlock.textContent = "すべての機能が解放済みです";
        return;
    }

    const remainingCount = nextStep.count - rotationCount;
    nextUnlock.textContent = `次の解放まで あと${remainingCount}回`;
}

// 解放時のメッセージを表示します。
function updateUnlockMessage() {
    const unlockedStep = unlockSteps.find((step) => step.count === rotationCount);

    if (unlockedStep) {
        unlockMessage.textContent = `${unlockedStep.count}回達成。「${unlockedStep.name}」が解放されました。`;
        lastUnlockedCount = unlockedStep.count;
        return;
    }

    if (rotationCount === 0) {
        unlockMessage.textContent = "10回で「色変更」が解放されます。";
        return;
    }

    if (lastUnlockedCount > 0) {
        const lastStep = unlockSteps.find((step) => step.count === lastUnlockedCount);
        unlockMessage.textContent = `最新の解放: 「${lastStep.name}」`;
        return;
    }

    unlockMessage.textContent = "10回で「色変更」が解放されます。";
}

// 解放状態に合わせて、画面表示をまとめて更新します。
function updateUnlockStatus() {
    updateCounter();
    updateUnlockList();
    updateKanjiColor();
    updateKanjiEffect();
    updateAutoRotateButton();
    updateNextUnlock();
    updateUnlockMessage();
}

// 回転処理をひとまとめにして、クリックと自動回転の両方で使います。
function rotateKanji() {
    angle += 360;
    rotationCount += 1;
    kanji.style.transform = `rotate(${angle}deg)`;
    updateUnlockStatus();
}

// 自動回転を止める処理です。
function stopAutoRotate() {
    if (autoRotateIntervalId === null) {
        return;
    }

    window.clearInterval(autoRotateIntervalId);
    autoRotateIntervalId = null;
}

// 文字をクリックしたときに1回転させて、回転数も1増やします。
kanji.addEventListener("click", () => {
    rotateKanji();
});

// 自動回転ボタンで、一定間隔の回転をオン・オフできます。
autoRotateButton.addEventListener("click", () => {
    if (!isAutoRotateUnlocked()) {
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

// リセットボタンを押すと、見た目の回転と回転数の両方を0に戻します。
resetButton.addEventListener("click", () => {
    angle = 0;
    rotationCount = 0;
    lastUnlockedCount = 0;
    stopAutoRotate();
    kanji.style.transform = "rotate(0deg)";
    updateUnlockStatus();
});

updateUnlockStatus();
