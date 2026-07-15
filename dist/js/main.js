function vocabApp() {
    return {
        csv: `en;translation;definition;pronunciations
scattered;раскиданный;"occurring or found at intervals or various locations rather than all together";"ˈskatəd"
paddle;весло;"a short pole with a broad blade at one or both ends, used without a rowlock to move a small boat or canoe through the water";"ˈpad(ə)l"`,
        words: [],
        index: 0,
        score: 0,
        enteredWord: '',
        finished: false,
        started: false,

        get current() {
            return this.words[this.index] || null;
        },

        get progress() {
            if (!this.words.length) return 0;
            return ((this.index + 1) / this.words.length) * 100;
        },

        shuffle(array) {
            const arr = [...array];
            let m = arr.length;
            while (m) {
                const i = Math.floor(Math.random() * m--);
                [arr[m], arr[i]] = [arr[i], arr[m]];
            }
            return arr;
        },

        focusInput() {
            this.$nextTick(() => {
                this.$refs.wordInput?.focus();
            });
        },

        parseCsv(text) {
            return Papa.parse(text.toLowerCase(), {
                delimiter: ';',
                skipEmptyLines: true,
                header: true,
            }).data;
        },

        start() {
            this.index = 0;
            this.score = 0;
            this.enteredWord = '';
            this.finished = false;
            this.words = this.shuffle(this.parseCsv(this.csv));
            this.started = true;
            this.focusInput();
        },

        submit(skip = false) {
            if (!this.current || this.finished) return;

            const entered = skip ? '-' : this.enteredWord.toLowerCase().trim();
            if (!skip && entered === '') return;

            this.current.entered = entered;
            this.current.valid = entered === this.current.en;
            if (this.current.valid) {
                this.score++;
            }

            if (this.index < this.words.length - 1) {
                this.index++;
                this.enteredWord = '';
                this.focusInput();
            } else {
                this.finished = true;
            }
        },

        pronunciation(word) {
            return word.pronunciations
                ? word.pronunciations.split('"').join('')
                : '';
        },

        init() {
            this.start();
        },
    };
}
