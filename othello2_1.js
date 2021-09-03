//FUNÇÕES JOGO
function register() {
    const nick = document.getElementById("nick");
    const pass = document.getElementById("pass");
    const inicio = { nick: nick.value, pass: pass.value };
    console.log(nick.value);
    console.log(pass.value);
    fetch("http://localhost:8154/register", { method: "POST", body: JSON.stringify(inicio) })
        .then(function (response) {
            return response.json();
        })
        .then(function (myresponse) {
            if (myresponse.error) {
                document.getElementById('registado').innerHTML = myresponse.error;
            }
            else if (nick.value == '') {
                console.log('nick invalido');
                document.getElementById('registado').innerHTML = "Utilizador Inválido. Por favor, autentique-se novamente.";
                document.getElementById('b4').innerHTML = "Autenticação";
                appearSection('registado');
                appearSection('autenticacao');
            }
            else {
                document.getElementById('registado').innerHTML = "Login efetuado com sucesso";
                document.getElementById('b4').innerHTML = "Utilizador: " + nick.value;
                removeSection('autenticacao');
            }
        })
}
//JOGO CONTRA OUTRO JOGADOR
class gamePlayer {
    constructor() {
        this.nick = document.getElementById("nick").value;
        this.pass = document.getElementById("pass").value;
        this.content = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.content[i] = new Array(8);
        }
        if (this.nick == '') {
            console.log('nick invalido');
            document.getElementById('registado').innerHTML = 'Não é possível juntar-se a um novo jogo. Por favor, autentique-se.';
            appearSection('registado');
            appearSection('autenticacao');
        }
        else {
            this.join();
        }
    }
    join() {
        this.tabuleiro = new OthelloBoard2('tabuleiro');
        const juntar = { group: 54, nick: nick.value, pass: pass.value };
        fetch("http://localhost:8154/join", { method: "POST", body: JSON.stringify(juntar) })
            .then(function (response) {
                return response.json();
            })
            .then((myresponse) => { document.getElementById("b7").onclick = () => this.leave(myresponse); return myresponse;})
            .then(function (myresponse) {
                if (myresponse.error) {
                    document.getElementById("gameinfo").innerHTML = myresponse.error;
                }
                else {
                    document.getElementById('gameinfo').innerHTML = "Juntou-se com sucesso ao jogo " + myresponse.game + ".";
                    if (myresponse.color == 'dark') { document.getElementById("estadocor").innerHTML = "Joga com os discos pretos."; }
                    else if (myresponse.color == 'light') { document.getElementById("estadocor").innerHTML = "Joga com os discos brancos."; }
                    else { document.getElementById("estadocor").innerHTML = "Joga com os discos " + myresponse.color + "."; }
                    removeSection('b1');
                    removeSection('b2');
                    removeSection('configuracao');
                    removeSection('registado');
                    removeSection('instrucoes');
                    appearSection('b7');
                    appearSection('b6');
                    appearSection('estado');
                    return myresponse;
                }
            })
            .then((myresponse) => this.update(myresponse))
    }
    update(myresponse) {
        const url = "http://localhost:8154/update?nick=" + this.nick + "&game=" + myresponse.game;
        this.source = new EventSource(url);
        this.source.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.count != undefined) {
                let estadobrancos = document.getElementById("estadobrancos");
                estadobrancos.innerHTML = "Brancos: " + data.count.light;
                let estadopretos = document.getElementById("estadopretos");
                estadopretos.innerHTML = "Pretos: " + data.count.dark;
                let estadolivres = document.getElementById("estadolivres");
                estadolivres.innerHTML = "Livres: " + data.count.empty;
            }
            if (data.turn != undefined) { document.getElementById("gameinfo").innerHTML = "É a vez de " + data.turn; }
            if (data.board != undefined) { this.quadro(data.board, myresponse); }
            if (data.skip != undefined) {
                document.getElementById('gameinfo').innerHTML = "Ausência de jogadas para " + data.turn;
                if (data.turn == this.nick) {
                    let skip = document.getElementById('b8');
                    console.log(skip);
                    skip.style.display = "block";
                    skip.onclick = ((fun, res, move) => { return () => fun(res, move); })(this.notify.bind(this), myresponse, null);
                }
            }
            if (data.winner != undefined) { this.terminar(data); }
        }
    }
    notify(myresponse, move) {
        removeSection("b8");
        const nick = document.getElementById("nick");
        const pass = document.getElementById("pass");
        console.log(move);
        const inicio = { nick: nick.value, pass: pass.value, game: myresponse.game, move: move };
        fetch("http://localhost:8154/notify", { method: "POST", body: JSON.stringify(inicio) })
            .then(function (response) {
                return response.json();
            })
            .then(function (myresponse) {
                console.log(myresponse);
                if (myresponse.error) {
                    document.getElementById("gameinfo").innerHTML = myresponse.error;
                }
            })
    }
    leave(myresponse) {
        const nick = document.getElementById("nick");
        const pass = document.getElementById("pass");
        const inicio = { nick: nick.value, pass: pass.value, game: myresponse.game };
        fetch("http://localhost:8154/leave", { method: "POST", body: JSON.stringify(inicio) })
            .then(function (response) {
                return response.json();
            })
            .then(function (myresponse) {
                if (myresponse.error) {
                    document.getElementById("gameinfo").innerHTML = myresponse.error;
                }
                else {
                    document.getElementById('gameinfo').innerHTML = "Saiu com sucesso do jogo " + inicio.game;
                }
                return myresponse;
            })
            .then((myresponse) => this.terminar(myresponse));
        ranking();     
    }
    quadro(board, myresponse) {
        const incrx = [-1, 1, 0, 0, -1, -1, 1, 1];
        const incry = [0, 0, -1, 1, -1, 1, 1, -1];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let celula = document.getElementById(i.toString() + "" + j.toString());
                if (board[i][j] != "empty") {
                    if (celula.firstChild != undefined) {
                        if (this.content[i][j].current != (board[i][j] == "light" ? "white" : "black")) {
                            this.content[i][j].changeColor();
                        }

                    }
                    else {
                        this.content[i][j] = new OthelloPiece2((board[i][j] == "light" ? "white" : "black"));
                        celula.appendChild(this.content[i][j].piece);
                        celula.setAttribute("onclick", null);
                        for (let p = 0; p < 8; p++) {
                            if (i + incrx[p] >= 0 && i + incrx[p] < 8 && j + incry[p] >= 0 && j + incry[p] < 8) {
                                let celulaaux = document.getElementById((i + incrx[p]).toString() + "" + (j + incry[p]).toString());
                                if (celulaaux.firstChild == undefined) { celulaaux.onclick = ((not, res, move) => { return () => not(res, move); })(this.notify.bind(this), myresponse, { row: i + incrx[p], column: j + incry[p] }) }
                            }
                        }
                    }
                }
                else {

                    if (celula.firstChild) { celula.removeChild(celula.firstChild); this.current[i][j] = undefined; }
                }
            }
        }
    }
    terminar(data) {
        this.source.close();
        console.log(data);
        if (data.count != undefined) {
            if (data.winner == null) { document.getElementById("gameinfo").innerHTML = "O jogo acabou em empate. Pretas: " + data.count.dark + " Brancas: " + data.count.light; }
            else { document.getElementById("gameinfo").innerHTML = "O jogo acabou. " + data.winner + " ganhou. Pretas: " + data.count.dark + " Brancas: " + data.count.light; }
        }
        else {
            if (data.winner != null) {
                document.getElementById("gameinfo").innerHTML = "O jogo acabou. " + data.winner + " ganhou.";
            }
        }
        document.getElementById("estadocor").innerHTML = ""
        appearSection('b1');
        appearSection('b2');
        appearSection('classificacao');
        removeSection('b7');
        removeSection('b8');
        removeSection('estado');
        const tabuleiro = document.getElementById('tabuleiro');
        while (tabuleiro.firstChild) { tabuleiro.removeChild(tabuleiro.firstChild); }
        //ranking();
    }
}
function ranking() {
    const table = document.getElementById("table2");
    while (table.firstChild) { table.removeChild(table.firstChild); }
    fetch('http://localhost:8154/ranking', { method: 'POST', body: '{}' })
        .then(function (response) {
            return response.json();
        })
        .then(function (myresponse) {
            if (myresponse.error) {
                document.getElementById("gameinfo").innerHTML = myresponse.error;
            }
            else {
                let cab = document.createElement("tr");
                table.appendChild(cab);
                let nicks = document.createElement("th");
                cab.appendChild(nicks);
                let vics = document.createElement("th");
                cab.appendChild(vics);
                let jogs = document.createElement("th");
                cab.appendChild(jogs);
                nicks.innerHTML = 'Jogador';
                vics.innerHTML = 'Vitórias';
                jogs.innerHTML = 'Jogos';
                for (ran of myresponse.ranking) {
                    let linha = document.createElement("tr");
                    table.appendChild(linha);
                    let nick = document.createElement("td");
                    linha.appendChild(nick);
                    let vitorias = document.createElement("td");
                    linha.appendChild(vitorias);
                    let games = document.createElement("td");
                    linha.appendChild(games);
                    nick.style = "color: white";
                    vitorias.style = "color: white";
                    games.style = "color: white";
                    nick.innerHTML = ran.nick;
                    vitorias.innerHTML = ran.victories;
                    games.innerHTML = ran.games;
                }
            }
        })
}

class OthelloBoard2 {
    constructor(id) {
        const parent = document.getElementById(id);
        parent.className = "tabuleiro";
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let cell = document.createElement('div');
                cell.className = "celula";
                parent.appendChild(cell);
                cell.setAttribute("id", i.toString() + "" + j.toString());
                cell.onclick = function () {
                    document.getElementById("gameinfo").innerHTML = "Não está na área de jogo. Tente novamente.";
                }
            }

        }
    }
}
class OthelloPiece2 {
    constructor(current) {
        this.piece = document.createElement("div");
        this.piece.className = "disco";
        this.current = current;
        this.piece.setAttribute("style", "background: " + current);
    }
    changeColor() {
        this.parent = this.piece.parentNode;
        this.parent.removeChild(this.piece);
        this.piece = document.createElement("canvas");
        this.piece.className = "piece";
        this.parent.appendChild(this.piece);
        this.tamanho = window.innerWidth;
        this.pixel = (3.45 * this.tamanho) / 100;
        this.gc = this.piece.getContext("2d");
        this.piece.width = this.pixel;
        this.piece.height = this.pixel;
        this.factor = 1;
        this.rodar();
    }
    rodar() {
        this.cor = this.current;
        this.girar();

        if (this.factor > 0) {
            this.factor -= 0.1; setTimeout(this.rodar.bind(this), 25);
        }
        else {
            this.rodar2();
        }

    }
    rodar2() {
        this.cor = (this.current == "black" ? "white" : "black");
        this.girar();
        if (this.factor < 1) {
            this.factor += 0.1;
            setTimeout(this.rodar2.bind(this), 25);
        }
        else {
            setTimeout(this.reset.bind(this), 25);
        }
    }
    girar() {
        this.piece.width = this.piece.width;
        this.gc.beginPath();
        this.gc.translate(0, (this.pixel - (this.pixel * this.factor)) / 2);
        this.gc.scale(1, this.factor);
        this.gc.arc(this.pixel / 2, this.pixel / 2, this.pixel / 2, 0, 2 * Math.PI, true);
        this.gc.fillStyle = this.cor;
        this.gc.fill();
    }
    reset() {
        this.parent.removeChild(this.piece);
        this.piece = document.createElement("div");
        this.parent.appendChild(this.piece);
        this.piece.className = "disco";
        this.current = (this.current == "black" ? "white" : "black");
        this.piece.setAttribute("style", "background: " + this.current);
        this.parent.appendChild(this.piece);
    }
}