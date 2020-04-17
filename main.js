var start = 0;
var re  = new RegExp("[A-Za-z ]"); // any regex here
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
    var enteredWord = input.value;
    ar[start - 1]['entered'] = enteredWord;
    ar[start - 1]['valid'] = (enteredWord == ar[start - 1].en);
    if (ar[start - 1]['valid']) {
        score++;
    }
    console.log(enteredWord);
    if(start != ar.length) {
        if(enteredWord != '' && re.exec(enteredWord) != null) {
            changeWord(rus, def, ar);
            input.value = '';
        }
    } else {
        document.getElementById('wordContainer').style.display = 'none';
        var resHTML = '';
        ar.forEach(function(el) {
            var valid = (el.valid) ? 'valid' : '';
            resHTML += `
                        <tr class="${valid}">
                            <td>${el.en}</td>
                            <td>${el.ru}</td>
                            <td class="word-definition">${el.definition}</td>
                            <td class="word-pronunciations">${el.pronunciations}</td>
                            <td class="word-enetered">${el.entered}</td>
                        </tr>
                        `
        });
        resHTML = `<h1>${score} of ${ar.length}</h1><table class="word-table">${resHTML}</table>`;
        document.getElementById('wordResult').innerHTML = resHTML;
        console.log(ar);
    }
}
function changeWord(rus, def, ar) {
    rus.innerHTML = (ar[start].ru) ? start + 1 + '. ' + ar[start].ru : '';
    def.innerHTML = (ar[start].definition) ? ar[start].definition : '';
    document.getElementById('wordProgress').style.width = start / ar.length * 100 + '%';
    start++;
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
