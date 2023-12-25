export class Menu {
    constructor() {
        this.menuOverlay = document.getElementById('menuOverlay');
        this.startGameButton = document.getElementById('startGame');
        this.exitButton = document.getElementById('exit');
        this.closeButton = document.getElementById('close');
        this.soundButton = document.getElementById('sound');
        this.attachButtonListeners();
    }

    attachButtonListeners() {
        this.closeButton.addEventListener('click', () => {
            this.hide();
        });

        this.soundButton.addEventListener('click', () => {
            console.log('Sound clicked');
        });

        this.startGameButton.addEventListener('click', () => {
            this.refresh();
        });

        this.exitButton.addEventListener('click', () => {
            this.toMainMenu();
        });
    }

    show() {
        this.menuOverlay.style.display = 'block';
    }

    toMainMenu() {
        window.location.href = '../../index.html';
    }

    hide() {
        this.menuOverlay.style.display = 'none';
    }

    refresh() {
        window.location.reload();
    }

    getState() {
        return this.menuOverlay.style.display === 'block';
    }
}
