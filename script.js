const kanji = document.getElementById("kanji");

let angle = 0;

kanji.addEventListener("click", () => {
    angle += 360;
    kanji.style.transform = `rotate(${angle}deg)`;
});