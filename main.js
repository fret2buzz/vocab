var start = 0;
var score = 0;
var words = '';
var newArray = [];
function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}
function nextWord(input, translation, def, ar, wordApp) {
    var enteredWord = input.value.toLowerCase().trim();
    ar[start]['entered'] = enteredWord;
    ar[start]['valid'] = (enteredWord == ar[start].en);
    if (ar[start]['valid']) {
        score++;
    }
    console.log(enteredWord);
    if(start != ar.length - 1) {
        input.value = '';
        if(enteredWord != '') {
            start++;
            changeWord(translation, def, ar);
        }
    } else {
        wordApp.style.display = 'none';
        var resHTML = '';
        ar.forEach(function(el, index) {
            var valid = (el.valid) ? 'valid' : '';
            var pronunciation = (el.pronunciations) ? el.pronunciations.split('"').join('') : '';
            var definition = (el.definition) ? el.definition : '';
            resHTML += `
                <tr class="${valid}">
                    <td>${index+1}.</td>
                    <td class="word-enetered">${el.entered}</td>
                    <td>${el.en}</td>
                    <td class="word-pronunciations">${pronunciation}</td>
                    <td>${el.translation}</td>
                    <td class="word-definition">${definition}</td>
                </tr>
            `;
        });
        resHTML = `
            <h2>Your result is ${score} of ${ar.length}</h2>
            <table class="word-table">
                <tr>
                    <th>#</th>
                    <th>Your word</th>
                    <th>English</th>
                    <th>Pronunciation</th>
                    <th>Translation</th>
                    <th>Definition</th>
                </tr>
                <tbody>
                    ${resHTML}
                </tbody>
            </table>
        `;
        document.getElementById('wordResult').innerHTML = resHTML;
        console.log(ar);
    }
}
function changeWord(translation, def, ar) {
    translation.innerHTML = (ar[start].translation) ? start + 1 + '. ' + ar[start].translation : '';
    def.innerHTML = (ar[start].definition) ? ar[start].definition : '';
    document.getElementById('wordProgress').style.width = (start + 1) / ar.length * 100 + '%';
}
function updateWordsArray(textarea, resultHTML) {
    resultHTML.innerHTML = '';
    start = 0;
    score = 0;
    var data = textarea.value.toLowerCase();
    words = Papa.parse(data,{
        delimiter: ';',
        skipEmptyLines: true,
        header: true
    });
    newArray = shuffle(words.data);
    changeWord(wordTranslation, wordDef, newArray);
}
document.addEventListener("DOMContentLoaded", () => {
    var wordApp = document.getElementById('wordApp');
    var resultHTML = document.getElementById('wordResult');
    var textarea = document.getElementById('wordCsv');
    var button = document.getElementById('button');
    var skipButton = document.getElementById('skip');
    var startButton = document.getElementById('start');
    var wordTranslation = document.getElementById('wordTranslation');
    var wordDef = document.getElementById('wordDef');
    var wordInput = document.getElementById('word');
    updateWordsArray(textarea, resultHTML, wordApp);
    button.addEventListener('click', () => {
        nextWord(wordInput, wordTranslation, wordDef, newArray, wordApp);
    });
    skipButton.addEventListener('click', () => {
        wordInput.value = '-';
        nextWord(wordInput, wordTranslation, wordDef, newArray, wordApp);
    });
    startButton.addEventListener('click', () => {
        updateWordsArray(textarea, resultHTML);
        wordApp.style.display = 'block';
        wordInput.value = '';
    });
    wordInput.addEventListener('keyup', (e) => {
        if (e.which == 13) { // enter
            button.click();
        }
    });
    console.log(newArray);
});
