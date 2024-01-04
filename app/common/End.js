export class End {
    constructor(time) {
        this.endOverlay = document.getElementById('endOverlay');
        this.startGameButton = document.getElementById('startGameAgain');
        this.exitButton = document.getElementById('exitToMenu');
        this.saveButton = document.getElementById('saveScore');
        this.input = document.getElementById('inputName').value;
        this.score = document.getElementsByClassName('numberOfCoins')[0].innerHTML;
        this.save = false;
        this.time = time;
        this.attachButtonListeners();
    }

    attachButtonListeners() {
        this.startGameButton.addEventListener('click', () => {
            this.refresh();
        });

        this.exitButton.addEventListener('click', () => {
            this.toMainMenu();
        });

        this.saveButton.addEventListener('click', () => {
            this.input = document.getElementById('inputName').value;
            this.score = document.getElementsByClassName('numberOfCoins')[0].innerHTML;

            if(this.input !== '') {
                this.saveScore();
            } else {
                alert('Enter a valid username!');
            }            
        });
    }

    saveScore() {
        document.cookie += this.input + "," + this.time + "," + this.score + "next";
    }

    toMainMenu() {
        window.location.href = '../../index.html';
    }

    refresh() {
        //debugger;
        window.location.reload();
    }

    show(time) {
        this.time = time;
        this.endOverlay.style.display = 'block';
    }

    getState() {
        return this.endOverlay.style.display === 'block';
    }

    hide() {
        this.endOverlay.style.display = 'none';
    }
}
