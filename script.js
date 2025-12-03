document.addEventListener("DOMContentLoaded", () => {
    candyCrushGame();
});

function candyCrushGame() {
    // DOM Elements
    const grid = document.querySelector(".grid");
    const scoreDisplay = document.getElementById("score");
    const timerDisplay = document.getElementById("timer");
    const modeSelection = document.getElementById("modeSelection");
    const endlessButton = document.getElementById("endlessMode");
    const timedButton = document.getElementById("timedMode");
    const changeModeButton = document.getElementById("changeMode");
    const scoreBoard = document.querySelector(".scoreBoard"); // MENGAMBIL SCOREBOARD DENGAN CLASS YANG BENAR

    // Game State Variables
    const width = 8;
    let squares = []; // Diubah menjadi let karena akan direset/diisi ulang
    let score = 0;
    let currentMode = null;
    let timeLeft = 0;
    let gameInterval = null;
    let timerInterval = null;

    // Variabel Drag
    let colorBeingDragged;
    let colorBeingReplaced;
    let squareIdBeingDragged;
    let squareIdBeingReplaced;

    const candyColors = [
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/red-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/blue-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/green-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/yellow-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/orange-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/purple-candy.png)",
    ];

    // 1. Create the Game Board
    function createBoard() {
        grid.innerHTML = ""; // Clear existing grid
        squares = []; // Clear squares array
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement("div");
            square.setAttribute("draggable", true);
            square.setAttribute("id", i);
            let randomColor = Math.floor(Math.random() * candyColors.length);
            square.style.backgroundImage = candyColors[randomColor];
            grid.appendChild(square);
            squares.push(square); // KOREKSI: square.push(square) diubah menjadi squares.push(square)
        }
        // Add drag event listeners
        squares.forEach((square) => square.addEventListener("dragstart", dragStart));
        squares.forEach((square) => square.addEventListener("dragend", dragEnd));
        squares.forEach((square) => square.addEventListener("dragover", dragOver));
        squares.forEach((square) => square.addEventListener("dragenter", dragEnter)); // KOREKSI: dargEnter diubah menjadi dragEnter
        squares.forEach((square) => square.addEventListener("dragleave", dragLeave));
        squares.forEach((square) => square.addEventListener("drop", dragDrop));
    }

    // 2. Drag Functionality
    function dragStart() {
        squareIdBeingDragged = parseInt(this.id);
        colorBeingDragged = this.style.backgroundImage;
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
    }

    function dragLeave() {
        // Biarkan kosong
    }

    function dragDrop() {
        squareIdBeingReplaced = parseInt(this.id);
        colorBeingReplaced = this.style.backgroundImage;

        // Swap colors
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
        squares[squareIdBeingReplaced].style.backgroundImage = colorBeingDragged;
    }

    function dragEnd() {
        let validMoves = [
            squareIdBeingDragged - 1,
            squareIdBeingDragged + 1,
            squareIdBeingDragged - width,
            squareIdBeingDragged + width,
        ];

        let validMove = validMoves.includes(squareIdBeingReplaced);

        // Check if the move is valid and results in a match
        if (squareIdBeingReplaced && validMove) {
            squareIdBeingReplaced = null; // Reset replacement ID
        } else if (squareIdBeingReplaced && !validMove) {
            // Revert swap if the move is invalid (not adjacent)
            squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        } else {
            // Revert swap if no drop occurred (e.g., dropped outside the board)
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        }
    }

    // 3. Move Candies Down
    function moveIntoSquareBelow() {
        for (let i = 0; i < width * width - width; i++) {
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
            const isFirstRow = firstRow.includes(i);

            if (squares[i + width].style.backgroundImage === "") {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = "";
            }

            // Fill the top row with new candies
            if (isFirstRow && squares[i].style.backgroundImage === "") {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }
    }

    // 4. Check for Matches (Koreksi Logika)

    function checkRowForFour() {
        for (let i = 0; i < 64; i++) {
            let rowOfFour = [i, i + 1, i + 2, i + 3];
            const decidedColor = squares[i].style.backgroundImage;
            const isBlank = decidedColor === "";

            // Cek untuk menghindari bungkus ke baris berikutnya (width - 3 = 8 - 3 = 5)
            const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 61, 62, 63];
            if (notValid.includes(i)) continue;

            if (
                !isBlank &&
                rowOfFour.every((index) => squares[index] && squares[index].style.backgroundImage === decidedColor)
            ) {
                score += 4;
                scoreDisplay.innerHTML = score;
                rowOfFour.forEach((index) => {
                    if (squares[index]) squares[index].style.backgroundImage = "";
                });
            }
        }
    }

    function checkColumnForFour() {
        for (let i = 0; i <= 39; i++) { // Maksimum index untuk awal kolom 4 adalah 39 (4 baris dari bawah)
            let columnOfFour = [i, i + width, i + 2 * width, i + 3 * width];
            const decidedColor = squares[i].style.backgroundImage;
            const isBlank = decidedColor === "";

            if (
                !isBlank &&
                columnOfFour.every((index) => squares[index] && squares[index].style.backgroundImage === decidedColor)
            ) {
                score += 4;
                scoreDisplay.innerHTML = score;
                columnOfFour.forEach((index) => {
                    if (squares[index]) squares[index].style.backgroundImage = "";
                });
            }
        }
    }

    function checkRowForThree() {
        for (let i = 0; i < 64; i++) {
            let rowOfThree = [i, i + 1, i + 2];
            const decidedColor = squares[i].style.backgroundImage;
            const isBlank = decidedColor === "";

            // Cek untuk menghindari bungkus ke baris berikutnya (width - 2 = 8 - 2 = 6)
            const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
            if (notValid.includes(i)) continue;

            if (
                !isBlank &&
                rowOfThree.every((index) => squares[index] && squares[index].style.backgroundImage === decidedColor)
            ) {
                score += 3;
                scoreDisplay.innerHTML = score;
                rowOfThree.forEach((index) => {
                    if (squares[index]) squares[index].style.backgroundImage = "";
                });
            }
        }
    }

    function checkColumnForThree() {
        for (let i = 0; i <= 47; i++) { // Maksimum index untuk awal kolom 3 adalah 47 (3 baris dari bawah)
            let columnOfThree = [i, i + width, i + 2 * width];
            const decidedColor = squares[i].style.backgroundImage;
            const isBlank = decidedColor === "";

            if (
                !isBlank &&
                columnOfThree.every((index) => squares[index] && squares[index].style.backgroundImage === decidedColor)
            ) {
                score += 3;
                scoreDisplay.innerHTML = score;
                columnOfThree.forEach((index) => {
                    if (squares[index]) squares[index].style.backgroundImage = "";
                });
            }
        }
    }

    // Game Loop
    function gameLoop() {
        moveIntoSquareBelow(); // PENTING: Pindahkan ke atas agar permen baru turun sebelum dicek
        checkColumnForFour();
        checkRowForFour();
        checkColumnForThree();
        checkRowForThree();

        // KOREKSI: Tambahkan pengecekan kecocokan lagi setelah swap
        let matched = checkColumnForFour() || checkRowForFour() || checkColumnForThree() || checkRowForThree();
        if (squareIdBeingReplaced !== null && !matched) {
            // Revert the swap if no match was made after a move
            const draggedSquare = squares[squareIdBeingDragged];
            const replacedSquare = squares[squareIdBeingReplaced];

            const tempColor = draggedSquare.style.backgroundImage;
            draggedSquare.style.backgroundImage = replacedSquare.style.backgroundImage;
            replacedSquare.style.backgroundImage = tempColor;

            squareIdBeingReplaced = null;
        }
    }

    // Start the Game
    function startGame(mode) {
        currentMode = mode;
        modeSelection.style.display = "none";
        grid.style.display = "flex";
        scoreBoard.style.display = "flex"; // Gunakan variabel scoreBoard yang sudah di query
        createBoard();
        score = 0;
        scoreDisplay.innerHTML = score;
        gameInterval = setInterval(gameLoop, 100);

        if (mode === "timed") {
            timeLeft = 120; // 2 minutes in seconds
            updateTimerDisplay();
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    endGame();
                }
            }, 1000);
        } else {
            timerDisplay.innerHTML = ""; // Clear timer in Endless Mode
        }
    }

    // Update Timer Display
    function updateTimerDisplay() {
        if (currentMode === "timed") {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerDisplay.innerHTML = `Time Left: ${minutes}:${seconds
                .toString()
                .padStart(2, "0")}`; // KOREKSI: Hapus '1' yang tidak perlu
        } else {
            timerDisplay.innerHTML = "";
        }
    }

    //End Game (Timed Mode)
    function endGame() {
        clearInterval(gameInterval);
        squares.forEach((square) => square.setAttribute("draggable", false));
        // KOREKSI: Tampilkan kembali tombol pemilihan mode setelah alert
        alert(`Time's Up! Your score is ${score}`);
        changeMode();
    }

    // Change Mode (Reset Game)
    function changeMode() {
        clearInterval(gameInterval);
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        grid.style.display = "none";
        scoreBoard.style.display = "none"; // Gunakan variabel scoreBoard
        modeSelection.style.display = "flex"; // Show mode selection screen
    }

    // Event Listeners
    endlessButton.addEventListener("click", () => startGame("endless"));
    timedButton.addEventListener("click", () => startGame("timed"));
    changeModeButton.addEventListener("click", changeMode);

    // Pastikan Mode Selection ditampilkan saat pertama kali
    scoreBoard.style.display = "none";
    grid.style.display = "none";
    modeSelection.style.display = "flex";
}