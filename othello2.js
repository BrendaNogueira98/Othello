//VARIÁVEIS
let t;
var newGamePlayer;
var newGamePc;
var nvitorias = localStorage.getItem('nvitorias');
var nderrotas = localStorage.getItem('nderrotas');
var nempates = localStorage.getItem('nempates');

//FUNÇÕES DIVS
function showDiv(option) {
    document.getElementById('outras').style.display = option.value == 'computador' ? 'block' : 'none';
    document.getElementById('autent').style.display = option.value == 'jogador' ? 'block' : 'none';
}
function removeSection(id) {
    document.getElementById(id).style.display = 'none';
}
function appearSection(id) {
    document.getElementById(id).style.display = 'block';
    document.getElementById(id).style.textAlign = 'center';
}
function showHide(id) {
    let div = document.getElementById(id);
    if (div.style.display == 'block') {
        div.style.display = 'none';
    }
    else {
        div.style.display = 'block';
        div.style.textAlign = 'center';
    }
}

//FUNÇÕES JOGO
window.onload = function () {
    t = new OthelloBoard('tabuleiro');
    while (tabuleiro.firstChild) { tabuleiro.removeChild(tabuleiro.firstChild); }
}

function local(){
    if (nvitorias === null) {nvitorias=0;}
    if (nderrotas === null) {nderrotas=0;}
    if (nempates === null) {nempates=0;}
    let vitorias = document.getElementById("vitorias");
    vitorias.innerHTML = "Vitórias: " + nvitorias;
    let derrotas = document.getElementById("derrotas");
    derrotas.innerHTML = "Derrotas: " + nderrotas;
    let empates = document.getElementById("empates");
    empates.innerHTML = "Empates: " + nempates;
}

function iniciar() {
    const color = (document.getElementById("cor").selectedIndex == 0 ? "white" : "black");
    const difficulty = (document.getElementById("dificuldade").selectedIndex == 0 ? "easy" : "hard");
    const opponent = (document.getElementById("oponente").selectedIndex == 0 ? "pc" : "player");
    const tabuleiro = document.getElementById('tabuleiro');
    while (tabuleiro.firstChild) { tabuleiro.removeChild(tabuleiro.firstChild); }
    appearSection('b6');
    if (opponent == 'player') {
        newGamePlayer = new gamePlayer();
    }
    else {
        newGamePc = new gamePc(t, color, difficulty);
    }
}

function terminar(escuros, brancos, corjogador) {
    if ((corjogador == 'white' && brancos > escuros) || (corjogador == 'black' && escuros > brancos)) {
        document.getElementById("gameinfo").innerHTML = "Ganhou o jogo!";
        //alert('Ganhou o jogo');
        nvitorias++;
        localStorage.setItem('nvitorias', nvitorias);
    }
    else if ((brancos == escuros)) {
        document.getElementById("gameinfo").innerHTML = "Empatou o jogo.";
        //alert('Empatou o jogo');
        nempates++;
        localStorage.setItem('nempates', nempates);
    }
    else {
        document.getElementById("gameinfo").innerHTML = "Perdeu o jogo.";
        //alert('Perdeu o jogo');
        nderrotas++;
        localStorage.setItem('nderrotas', nderrotas);
    }
    local();
    appearSection('b1');
    appearSection('b2');
    appearSection('classificacao');
    //removeSection('b6');
    removeSection('b7');
    removeSection('estado');
    //removeSection('tabuleiro');
    const tabuleiro = document.getElementById('tabuleiro');
    while (tabuleiro.firstChild) { tabuleiro.removeChild(tabuleiro.firstChild); }
    return;
}

function desistir() {
    document.getElementById("gameinfo").innerHTML = "Desistiu do jogo.";
    nderrotas++;
    localStorage.setItem('nderrotas', nderrotas);
    local();
    appearSection('b1');
    appearSection('b2');
    appearSection('classificacao');
    //removeSection('b6');
    removeSection('b7');
    removeSection('estado');
    //removeSection('tabuleiro');
    const tabuleiro = document.getElementById('tabuleiro');
    while (tabuleiro.firstChild) {tabuleiro.removeChild(tabuleiro.firstChild); }
}

//JOGO CONTRA COMPUTADOR
class gamePc {
    constructor(t, color, difficulty) {
        this.tabuleiro = t;
        this.brancos = 0;
        this.escuros = 0;
        this.livres = 64;
        this.content = new Array(64);
        this.area = [];
        this.color = color;
        this.difficulty = difficulty;
        let estadobrancos = document.getElementById("estadobrancos");
        let estadopretos = document.getElementById("estadopretos");
        let estadolivres = document.getElementById("estadolivres");
        removeSection('b1');
        removeSection('b2');
        removeSection('configuracao');
        removeSection('registado');
        removeSection('instrucoes');
        appearSection('b7');
        appearSection('b6');
        appearSection('estado');
        t = new OthelloBoard('tabuleiro');
        appearSection('tabuleiro');
        document.getElementById("b7").onclick = () => desistir();
        //fazer primeiras peças
        const a = [27, 28, 35, 36];
        for (const b of a) {
            if (b == 27 || b == 36) {
                this.create(b, "black");
            }
            else {
                this.create(b, "white");
            }
        }
        estadobrancos.innerHTML = "Brancos: " + this.brancos;
        estadopretos.innerHTML = "Pretos: " + this.escuros;
        estadolivres.innerHTML = "Livres: " + this.livres;
        if (this.color != "black") {
            //alert("O computador começa o jogo");
            document.getElementById("gameinfo").innerHTML = "O computador vai iniciar o jogo.";
            setTimeout(this.computer.bind(this), 1000);
        }
        else {
            document.getElementById("gameinfo").innerHTML = "Comece o jogo.";
            //alert("Comece o jogo");
        }
    }
    computer() {
        if (this.difficulty == "easy") {
            for (const p of this.area) {
                let posicao = [-9, -8, -7, -1, 1, 7, 8, 9];
                if (p % 8 == 0) { posicao = [-8, -7, 1, 8, 9]; }
                if ((p - 7) % 8 == 0) { posicao = [-9, -8, -1, 7, 8]; }
                for (const i of posicao) {
                    let l = this.check(p, (this.color == "white" ? "black" : "white"), i);
                    if (l != -1 && l != p + i) {
                        this.play(p, (this.color == "white" ? "black" : "white"));
                        return;
                    }
                }
            }
            //alert("O computador passa a jogada");
            document.getElementById("gameinfo").innerHTML = "O computador passou a jogada.";
            setTimeout(this.partida.bind((this.color == "white" ? "black" : "white")), 1000);
        }
        if (this.difficulty == "hard") {
            let max = 0;
            let soma = 0;
            let melhorpos = -1;
            for (const p of this.area) {
                let posicao = [-9, -8, -7, -1, 1, 7, 8, 9];
                if (p % 8 == 0) { posicao = [-8, -7, 1, 8, 9]; }
                if ((p - 7) % 8 == 0) { posicao = [-9, -8, -1, 7, 8]; }
                for (const i of posicao) {
                    let l = this.check(p, (this.color == "white" ? "black" : "white"), i);
                    if (l != -1 && l != p + i) {
                        let aux = p + i;
                        while (l != aux) {
                            soma++;
                            aux += i;
                        }
                    }
                }
                if (soma > max) { max = soma; melhorpos = p; }
                soma = 0;
            }
            if (melhorpos != -1) { this.play(melhorpos, (this.color == "white" ? "black" : "white")); return; }
            //alert("O computador passa a jogada");
            document.getElementById("gameinfo").innerHTML = "O computador passou a jogada.";
            setTimeout(this.partida.bind((this.color == "white" ? "black" : "white")), 1000);
        }
    }
    partida(current) {
        console.log("partida");
        estadobrancos.innerHTML = "Brancos: " + this.brancos;
        estadopretos.innerHTML = "Pretos: " + this.escuros;
        estadolivres.innerHTML = "Livres: " + this.livres;
        if (this.escuros == 0 || this.brancos == 0 || this.livres == 0) {
            //alert("Terminou o jogo");
            document.getElementById("gameinfo").innerHTML = "Terminou o jogo.";
            setTimeout(terminar, 2000, this.escuros, this.brancos, this.color);
            //setTimeout(function(){ terminar(this.escuros, this.brancos, this.color); }, 3000);
        }
        else {
            const c = [(current == 'white' ? 'black' : 'white'), current];
            console.log(c);
            for (const d of c) {
                for (const p of this.area) {
                    let posicao = [-9, -8, -7, -1, 1, 7, 8, 9];
                    if (p % 8 == 0) {
                        posicao = [-8, -7, 1, 8, 9];
                    }
                    if ((p - 7) % 8 == 0) {
                        posicao = [-9, -8, -1, 7, 8];
                    }
                    for (const i of posicao) {
                        let l = this.check(p, d, i);
                        if (l != -1 && l != p + i) {
                            console.log(d);
                            console.log('current' + current);
                            if (d == this.color && current != this.color) {
                                console.log("sua vez");
                                document.getElementById("gameinfo").innerHTML = "É a sua vez.";
                                //alert("É a sua vez");
                                return;
                            }
                            if (d != this.color && current != this.color) {
                                //alert("Sem jogadas disponíveis. Passa a vez ao Computador");
                                document.getElementById("gameinfo").innerHTML = "Sem jogadas disponíveis. Passou a vez ao computador.";
                                setTimeout(this.computer.bind(this), 500);
                                return;
                            }
                            if (d != this.color && current == this.color) {
                                document.getElementById("gameinfo").innerHTML = "É a vez do computador."
                                setTimeout(this.computer.bind(this), 500);
                                return;
                            }
                            if (d == this.color && current == this.color) {
                                //alert('Computador passou a jogada. É a sua vez.');
                                document.getElementById("gameinfo").innerHTML = "O computador passou a jogada.";
                                return;
                            }
                        }
                    }
                }
            }
            //alert(" Sem jogadas possíveis. Terminou o jogo");
            document.getElementById("gameinfo").innerHTML = "Sem jogadas possíveis. Terminou o jogo.";
            setTimeout(terminar, 2000, this.escuros, this.brancos, this.color);
            //setTimeout(function(){ terminar(this.escuros, this.brancos, this.color); }, 3000);
        }
    }
    play(pos, current) {
        //verificar se muda alguma cor
        console.log(pos);
        let mudou = -1;
        let posicao = [-8, 8, -1, 1, -7, 7, -9, 9];
        if (pos % 8 == 0) { posicao = [-8, 8, 1, -7, 9]; }
        if ((pos - 7) % 8 == 0) { posicao = [-1, -8, 8, 7, -9]; }
        for (const i of posicao) {
            let p = this.check(pos, current, i);
            if (p != -1) {
                let k = pos + i;
                //se nao for logo a posicao a seguir
                while (k != p) {
                    mudou = 0;
                    this.brancos += (current == "white" ? 1 : 0);
                    this.escuros -= (current == "white" ? 1 : 0);
                    this.brancos -= (current == "white" ? 0 : 1);
                    this.escuros += (current == "white" ? 0 : 1);
                    this.content[k].changeColor();
                    k += i;
                }
            }
        }
        if (mudou == 0) { this.create(pos, current); console.log("jogada"); setTimeout(this.partida.bind(this),1000,current); }
        else { 
            //alert("Jogada inválida: nenhuma peça virada"); 
            document.getElementById("gameinfo").innerHTML = "Jogada inválida. Tente novamente.";
        }
        console.log("brancos= " + this.brancos + " escuros= " + this.escuros + " livres= " + this.livres);
    }
    create(pos, current) {
        //area de jogo
        this.area.splice(this.area.indexOf(pos), 1);
        let posicao = [-9, -8, -7, -1, 1, 7, 8, 9];
        if (pos % 8 == 0) { posicao = [-8, -7, 1, 8, 9]; }
        if ((pos - 7) % 8 == 0) { posicao = [-9, -8, -1, 7, 8]; }
        for (const i of posicao) {
            let p = pos + i;
            let celula = document.getElementById(p.toString());
            if (this.content[p] == null && celula !== null) {
                celula.onclick = ((fun, pos, color) => { return () => fun(pos, color); })(this.play.bind(this), (pos + i), this.color);
            }
            if (this.area.indexOf(p) == -1 && this.content[p] == null && celula !== null) { this.area[this.area.length] = p; }
        }
        //criar disco
        this.content[pos] = new OthelloPiece(current);
        let celula = document.getElementById(pos.toString());
        celula.appendChild(this.content[pos].piece);
        celula.setAttribute("onclick", null);
        this.brancos += (current == "white" ? 1 : 0);
        this.escuros += (current == "white" ? 0 : 1);
        this.livres--;
    }
    //verificar jogadas se tem alguma peça igual
    check(p, current, i) {
        if (((p + i) % 8 == 0 && i == 1) || (p + i - 7) % 8 == 0 && i == -1) {
            return -1;
        }
        if (this.content[p + i] != null) {
            if (current == this.content[p + i].current) {
                return p + i;
            }
            else {
                return this.check(p + i, current, i);
            }
        }
        return -1;
    }
}

class OthelloBoard {
    constructor(id) {
        const parent = document.getElementById(id);
        parent.className = "tabuleiro";
        for (let i = 0; i < 64; i++) {
            let cell = document.createElement('div');
            cell.className = "celula";
            parent.appendChild(cell);
            cell.innerHTML = '&nbsp;';
            cell.setAttribute("id", i.toString());
            cell.onclick = function () {
                //alert("Não está na área de jogo");
                document.getElementById("gameinfo").innerHTML = "Não está na área de jogo. Tente novamente.";
            }
        }
    }
}
class OthelloPiece{
    constructor(current){
        this.piece = document.createElement("div");
        this.piece.className = "disco";
        this.current = current;
        this.piece.setAttribute("style", "background: " + current);
    }
    changeColor() {
        this.parent = this.piece.parentNode;
        console.log(this.parent);
        this.parent.removeChild(this.piece);
        this.piece = document.createElement("canvas");
        this.piece.className = "piece";
        this.parent.appendChild(this.piece);
        this.tamanho = window.innerWidth;
        this.pixel = (3.45*this.tamanho)/100;
        this.gc = this.piece.getContext("2d");
        this.piece.width = this.pixel;
        this.piece.height = this.pixel;
        this.factor = 1;
        this.rodar();
    }
    rodar() {
        this.cor = this.current;
        this.girar();
        
        if(this.factor > 0) {
            this.factor -= 0.1; 
            setTimeout(this.rodar.bind(this),25);
        }
        else {
         this.rodar2();
        }
    }
    rodar2() {
        this.cor = (this.current == "black"? "white": "black");
        this.girar();
        if(this.factor < 1){
            this.factor += 0.1; 
            setTimeout(this.rodar2.bind(this),25);
        }
        else{
            setTimeout(this.reset.bind(this),25);
        }
    }
    girar() {
        this.piece.width = this.piece.width;
        this.gc.beginPath();
        this.gc.translate(0, (this.pixel-(this.pixel*this.factor))/2);
        this.gc.scale(1,this.factor);
        this.gc.arc(this.pixel/2, this.pixel/2, this.pixel/2, 0, 2*Math.PI, true); 
        this.gc.fillStyle = this.cor;
        this.gc.fill();
    }
    reset() {
        this.parent.removeChild(this.piece);
        this.piece = document.createElement("div");
        this.parent.appendChild(this.piece);
        this.piece.className = "disco";
        this.current = (this.current == "black"? "white": "black");
        this.piece.setAttribute("style", "background: " + this.current);
        this.parent.appendChild(this.piece);
    }
}