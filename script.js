document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById('start-button');
    const viewRankingButton = document.getElementById('view-ranking-button');
    const restartButton = document.getElementById('restart-button');
    const backButton = document.getElementById('back-button');

    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const rankingScreen = document.getElementById('ranking-screen');

    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const rankingList = document.getElementById('ranking-list');

    let player1Name = "Verde";
    let player2Name = "Vermelho";
    let currentPlayer = "O";
    let currentSymbol = "O";
    let isGameActive = true;
    let gameState = Array(9).fill(null);

    // Carregar estado do jogo ao inicializar
    loadGameState();

    if (startButton) {
        startButton.addEventListener('click', () => {
            const player1Input = document.getElementById('player1').value.trim();
            const player2Input = document.getElementById('player2').value.trim();

            player1Name = player1Input === "" ? "Verde" : player1Input;
            player2Name = player2Input === "" ? "Vermelho" : player2Input;

            startScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            currentPlayer = player1Name;
            currentSymbol = "O";
            statusMessage.textContent = `Vez de ${currentPlayer} (Verde)`;
            isGameActive = true;
            gameState = Array(9).fill(null);

            cells.forEach(cell => {
                cell.textContent = "";
                cell.style.backgroundColor = "white";
                cell.addEventListener('click', handleClick, { once: true });
            });

            saveGameState();
        });
    }

    if (viewRankingButton) {
        viewRankingButton.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            rankingScreen.classList.remove('hidden');
            loadRanking();
        });
    }

    if (restartButton) {
        restartButton.addEventListener('click', () => {
            startScreen.classList.remove('hidden');
            gameScreen.classList.add('hidden');
            localStorage.removeItem('gameState'); // Limpa o estado do jogo
        });
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            rankingScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
        });
    }

    function handleClick(e) {
        const cell = e.target;
        const cellIndex = Array.from(cells).indexOf(cell);

        if (gameState[cellIndex] === null && isGameActive) {
            gameState[cellIndex] = currentSymbol;

            cell.textContent = currentSymbol;
            cell.style.backgroundColor = currentSymbol === "O" ? "green" : "red";

            saveGameState(); // Salvar o estado do jogo após cada jogada

            if (checkWin(currentSymbol)) {
                endGame(`${currentPlayer} venceu!`);
                updateRanking(currentPlayer);
            } else if (isDraw()) {
                endGame("Empate!");
                updateRanking(null, true);
            } else {
                currentPlayer = currentPlayer === player1Name ? player2Name : player1Name;
                currentSymbol = currentSymbol === "O" ? "X" : "O";
                statusMessage.textContent = `Vez de ${currentPlayer} (${currentSymbol === "O" ? "Verde" : "Vermelho"})`;

                saveGameState(); // Salvar o estado após troca de jogador
            }
        }
    }

    function checkWin(symbol) {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winningConditions.some(combination => {
            return combination.every(index => gameState[index] === symbol);
        });
    }

    function isDraw() {
        return gameState.every(cell => cell !== null);
    }

    function endGame(message) {
        isGameActive = false;
        statusMessage.textContent = message;

        setTimeout(() => {
            gameScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
            localStorage.removeItem('gameState'); // Limpa o estado do jogo ao final da partida
        }, 1000);
    }

    function updateRanking(winner, isDraw = false) {
        let ranking = JSON.parse(localStorage.getItem('ranking')) || {};

        if (!isDraw) {
            ranking[winner] = ranking[winner] ? ranking[winner] + 1 : 1;
        } else {
            ranking[player1Name] = ranking[player1Name] ? ranking[player1Name] + 1 : 1;
            ranking[player2Name] = ranking[player2Name] ? ranking[player2Name] + 1 : 1;
        }

        localStorage.setItem('ranking', JSON.stringify(ranking));
        loadRanking();
    }

    function loadRanking() {
        let ranking = JSON.parse(localStorage.getItem('ranking')) || {};
        rankingList.innerHTML = "";

        Object.keys(ranking).forEach(player => {
            const listItem = document.createElement('li');
            listItem.textContent = `${player}: ${ranking[player]} vitórias`;
            rankingList.appendChild(listItem);
        });
    }

    function saveGameState() {
        const gameData = {
            player1Name,
            player2Name,
            currentPlayer,
            currentSymbol,
            isGameActive,
            gameState
        };
        localStorage.setItem('gameState', JSON.stringify(gameData));
    }

    function loadGameState() {
        const savedGameState = JSON.parse(localStorage.getItem('gameState'));
        if (savedGameState) {
            player1Name = savedGameState.player1Name;
            player2Name = savedGameState.player2Name;
            currentPlayer = savedGameState.currentPlayer;
            currentSymbol = savedGameState.currentSymbol;
            isGameActive = savedGameState.isGameActive;
            gameState = savedGameState.gameState;

            startScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            statusMessage.textContent = `Vez de ${currentPlayer} (${currentSymbol === "O" ? "Verde" : "Vermelho"})`;

            cells.forEach((cell, index) => {
                if (gameState[index]) {
                    cell.textContent = gameState[index];
                    cell.style.backgroundColor = gameState[index] === "O" ? "green" : "red";
                    cell.removeEventListener('click', handleClick);
                } else {
                    cell.textContent = "";
                    cell.style.backgroundColor = "white";
                    cell.addEventListener('click', handleClick, { once: true });
                }
            });
        }
    }
});
