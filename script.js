const kanji = document.getElementById("kanji");
const counterValue = document.getElementById("counter-value");
const resetButton = document.getElementById("reset-button");

// 何度回転したかを覚えておくための変数です。
let angle = 0;
let rotationCount = 0;

// 文字をクリックしたときに1回転させて、回転数も1増やします。
kanji.addEventListener("click", () => {
    angle += 360;
    rotationCount += 1;
    kanji.style.transform = `rotate(${angle}deg)`;
    counterValue.textContent = rotationCount;
});

// リセットボタンを押すと、見た目の回転と回転数の両方を0に戻します。
resetButton.addEventListener("click", () => {
    angle = 0;
    rotationCount = 0;
    kanji.style.transform = "rotate(0deg)";
    counterValue.textContent = rotationCount;
});
