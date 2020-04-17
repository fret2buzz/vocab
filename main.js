var start = 0;
var score = 0;
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
function nextWord(input, rus, def, ar) {
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
            changeWord(rus, def, ar);
        }
    } else {
        document.getElementById('wordContainer').style.display = 'none';
        var resHTML = '';
        ar.forEach(function(el, index) {
            var valid = (el.valid) ? 'valid' : '';
            var pronunciation = (el.pronunciations) ? el.pronunciations.split('"').join('') : '';
            var definition = (el.definition) ? el.definition : '';
            resHTML += `
                <tr class="${valid}">
                    <td>${index+1}</td>
                    <td>${el.en}</td>
                    <td class="word-pronunciations">${pronunciation}</td>
                    <td>${el.ru}</td>
                    <td class="word-definition">${definition}</td>
                    <td class="word-enetered">${el.entered}</td>
                </tr>
            `;
        });
        resHTML = `
            <h1>${score} of ${ar.length}</h1>
            <table class="word-table">
                <tr>
                    <th>#</th>
                    <th>English</th>
                    <th>Pronunciation</th>
                    <th>Russian</th>
                    <th>Definition</th>
                    <th>Your word</th>
                </tr>
                ${resHTML}
            </table>
        `;
        document.getElementById('wordResult').innerHTML = resHTML;
        console.log(ar);
    }
}
function changeWord(rus, def, ar) {
    rus.innerHTML = (ar[start].ru) ? start + 1 + '. ' + ar[start].ru : '';
    def.innerHTML = (ar[start].definition) ? ar[start].definition : '';
    document.getElementById('wordProgress').style.width = (start + 1) / ar.length * 100 + '%';
}
document.addEventListener("DOMContentLoaded", () => {
    var newArray = shuffle(words);
    var button = document.getElementById('button');
    var wordRus = document.getElementById('wordRus');
    var wordDef = document.getElementById('wordDef');
    var wordInput = document.getElementById('word');
    changeWord(wordRus, wordDef, newArray);
    button.addEventListener('click', () => {
        nextWord(wordInput, wordRus, wordDef, newArray);
    });
    wordInput.addEventListener('keyup', (e) => {
        if (e.which == 13) { // enter
            button.click();
        }
    });
    console.log(newArray);
});
