const kanji = document.getElementById("kanji");
const counterValue = document.getElementById("counter-value");
const autoRotateButton = document.getElementById("auto-rotate-button");
const resetButton = document.getElementById("reset-button");

// 何度回転したかを覚えておくための変数です。
let angle = 0;
let rotationCount = 0;
let autoRotateIntervalId = null;

// 回転処理をひとまとめにして、クリックと自動回転の両方で使います。
function rotateKanji() {
    angle += 360;
    rotationCount += 1;
    kanji.style.transform = `rotate(${angle}deg)`;
    counterValue.textContent = rotationCount;
}

// 自動回転ボタンの表示を、現在のオン・オフ状態に合わせて更新します。
function updateAutoRotateButton(isEnabled) {
    autoRotateButton.textContent = isEnabled ? "自動回転: オン" : "自動回転: オフ";
    autoRotateButton.setAttribute("aria-pressed", String(isEnabled));
}

// 文字をクリックしたときに1回転させて、回転数も1増やします。
kanji.addEventListener("click", () => {
    rotateKanji();
});

// 自動回転ボタンで、一定間隔の回転をオン・オフできます。
autoRotateButton.addEventListener("click", () => {
    if (autoRotateIntervalId === null) {
        autoRotateIntervalId = window.setInterval(rotateKanji, 1000);
        updateAutoRotateButton(true);
        return;
    }

    window.clearInterval(autoRotateIntervalId);
    autoRotateIntervalId = null;
    updateAutoRotateButton(false);
});

// リセットボタンを押すと、見た目の回転と回転数の両方を0に戻します。
resetButton.addEventListener("click", () => {
    angle = 0;
    rotationCount = 0;
    kanji.style.transform = "rotate(0deg)";
    counterValue.textContent = rotationCount;
});
