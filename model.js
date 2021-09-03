

module.exports = class {
    constructor() {
        this.board = new Array(8);
        this.current="dark";
        for (let b = 0; b < 8; b++) {
            this.board[b] = new Array(8);
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i == 3 && j == 3) || (i == 4 && j == 4)) {
                    this.board[i][j] = "light";
                }
                else if ((i == 3 & j == 4) || (i == 4 && j == 3)) {
                    this.board[i][j] = "dark";
                }
                else {
                    this.board[i][j] = "empty";
                }
            }
        }
        this.light = 2;
        this.dark = 2;
        this.empty = 60;
    }
   
}