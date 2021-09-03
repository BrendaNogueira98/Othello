let http = require('http');
let path = require('path');
let url = require('url');
let fs = require('fs');
let crypto = require('crypto');

let conf = require("./conf.js");
let updater = require("./updater.js");
let modelo = require("./modulo.js");
let model = require("./model.js");

let PORT = 8154;

const { deprecate } = require('util');

const date = new Date();
const value = date.getTime().toString();

const hash = crypto
    .createHash('md5')
    .update(value)
    .digest('hex');

http.createServer(function (req, res) {
    const preq = url.parse(req.url, true);
    const pathname = preq.pathname;
    let answer = {};
    switch (req.method) {
        case 'GET':
            doGet(preq, req, res);
            break;
        case 'POST':
            doPost(pathname, req, res);
            break;
        default:
            answer.status = 400;
            updater.complete(answer, res);
    }

}).listen(PORT);


function doGet(preq, req, res) {
    let pathname = preq.pathname;
    let query = preq.query;
    let answer = {};
    
   // const board = t.board;
    switch (pathname) {
        case '/update':
            updater.remember(res);
            answer.style = 'sse';
            req.on("data", (chunk) => { body += chunk; })
                .on("end", () => {
                    try { query = JSON.parse(body);  /* processar query */ }
                    catch (err) {  /* erros de JSON */ }
                })

                .on('error', (err) => { console.log(err.message); });

            setImmediate(() => {
                fs.readFile("games.json", (err, data) => {
                    if (!err) {
                        let dados = JSON.parse(data.toString());
                        let invalid = true;

                        //dados.games.push({ "game": query.game, "board": model.board,  });

                        //answer.body = JSON.stringify({ "game": hash, "color": "dark" });

                        for (gam of dados.games) {
                            console.log("gam.game "+gam.game+" query.game "+query.game);
                            if ((gam.game).toString() == (query.game).toString()) {
                                
                                if ((gam.jog2 === undefined && ((gam.jog1).toString() == (query.nick).toString() || (gam.jog2).toString() == (query.nick).toString()))) {
                                    invalid = false;
                                  
                                    //answer.body = {};
                                    //invalid = false;

                                }
                                else if ((gam.jog2) != undefined && ((gam.jog1) == (query.nick) || (gam.jog2) == (query.nick))) {
                                    
                                    if(gam.t===undefined){gam.t=new model;}
                                    //if (gam.board === undefined) { gam.board = gam.t.board;}
                                    if (gam.turn === undefined) { gam.turn = gam.jog1; }
                                    gam.count = { "light": gam.t.light, "dark": gam.t.dark, "empty": gam.t.empty }
                                    
                                    answer.body = JSON.stringify(({ "turn": gam.turn, "winner": gam.winner, "board": gam.t.board, "count": gam.count }));
                                    invalid = false;
                                    updater.update(answer.body);
                                    
                                }
                               
                                fs.writeFile("games.json", JSON.stringify(dados), function (err) {
                                    if (err) { console.log(err); }

                                });
                            }

                        }
                        if (invalid) {
                            answer.status = 400;
                            answer.body = JSON.stringify(({ "error": "Invalid game reference" }));

                        }
                    
                    req.on('close', () => updater.forget(res));
                        

                    }

                });

            });

            //updater.complete(answer, res); 

            //updater.complete(answer, res);

           break;
        default:
            answer.status = 400;
            break;

    }
    updater.complete(answer, res);

}

 

function doPost(pathname, req, res) {

    var answer = {};

    let body = '';

    let query;

    switch (pathname) {
        case '/register':
            req
                .on('data', (chunk) => { body += chunk; })
                .on('end', () => {
                    try { query = JSON.parse(body); }
                    catch (err) { }
                })
                .on('error', (err) => { console.log(err.message); });

            fs.readFile("registo.json", (err, data) => {
                if (!err) {
                    let dados = JSON.parse(data.toString());
                    let jaRegistado = false;
                    let passEncrypted = updater.encrypt(query.pass);
                    query.pass = passEncrypted;
                    for (reg of dados.registo) {
                        if ((reg.nick) == (query.nick)) {
                            if (reg.pass != query.pass) {
                                answer.body = JSON.stringify({ "error": "User registered with a different password" });
                                answer.status = 401;
                            }
                            jaregistado = true;
                        }
                    }
                    if (!jaRegistado) {
                        dados.registo.push(query);
                        fs.writeFile("registo.json", JSON.stringify(dados), function (err) {
                            if (err) { console.log(err); }
                        });
                    }
                    updater.complete(answer, res);
                }

            });
            break;

        case '/join':
            
            req
                .on('data', (chunk) => { body += chunk; })
                .on('end', () => {
                    try { query = JSON.parse(body); }
                    catch (err) { }
                })
                .on('error', (err) => { console.log(err.message); });
                let date=new Date();
                let value=date.getTime().toString();
                const hash = crypto
                             .createHash('md5')
                             .update(value)
                             .digest('hex');
            fs.readFile("games.json", (err, data) => {
                if (!err) {
                    let dados = JSON.parse(data.toString());
                    
                        
                    if (dados.games.length == 0 || ((dados.games.length != 0) && (dados.games[dados.games.length - 1].jog2 != undefined))) {
                        //console.log("criar novo jogo "+ hash);
                        dados.games.push({ "game": hash, "jog1": query.nick });
                        answer.body = JSON.stringify({ "game": hash, "color": "dark" });
                    }
                    else {
                        dados.games[dados.games.length - 1].jog2 = query.nick;
                        answer.body = JSON.stringify({ "game": dados.games[dados.games.length - 1].game, "color": "light" });
                    }
                    fs.writeFile("games.json", JSON.stringify(dados), function (err) {
                        if (err) { console.log(err); }
                    });
                    ;
                    updater.complete(answer, res);

                }

            });

            break;

        case '/notify':

            req.on("data", (chunk) => { body += chunk; })
                .on("end", () => {
                    try { query = JSON.parse(body); }
                    catch (err) { }
                })
                .on('error', (err) => { console.log(err.message); });

            fs.readFile("games.json", (err, data) => {
                if (!err) {
                    let dados = JSON.parse(data.toString());
                    let error=false;
                    if(typeof query.move!=="object"){error=true;answer.body = JSON.stringify(({ "error": "move must be an object" })); }
                    if(query.move!=null && query.move.row===undefined){error=true;answer.body = JSON.stringify(({ "error": "move lacks property row" }));}
                    if(query.move!=null && query.move.column===undefined){error=true;answer.body = JSON.stringify(({ "error": "move lacks property column"}));}
                    if(!error){
                        if(query.move!=null){
                        let row = query.move.row;
                        let column = query.move.column;
                        if(row>=0 && row <=7 && column>=0 && column<=7){
                            for (gam of dados.games) {
                                if ((gam.game).toString() == (query.game).toString()) {
                                    if ((gam.turn).toString() == (query.nick).toString()) {
                                        
                                       
                                        let retorno=play(row,column,gam.t);
                                       // console.log(retorno);
                                        if(retorno==-1){answer.body=JSON.stringify(({ "error": "nenhuma peça alterada"}));}
                                        else{gam.t=retorno; gam.turn=((gam.turn).toString()==(gam.jog1).toString() ? (gam.jog2).toString():(gam.jog1).toString());}
                                      
                                        fs.writeFile("games.json", JSON.stringify(dados), function (err) {
                                            if (err) { console.log(err); }
                                        });
                                        if (gam.t.empty == 0 || gam.t.winner==true) {
                                            if (gam.t.dark > gam.t.light) { gam.winner = gam.jog1; }
                                            else if (gam.t.dark < gam.t.light) { gam.winner = gam.jog2; }
                                            else { gam.winner = null; }
                                        }
                                        gam.count = { "light": gam.t.light, "dark": gam.t.dark, "empty": gam.t.empty }
                                        updater.update(JSON.stringify(({ "turn": gam.turn, "skip":gam.t.skip, "winner": gam.winner, "board": gam.t.board, "count": gam.count })));
                                      
                                    }
                                    else{answer.body = JSON.stringify(({ "error": "Not your turn to play" }));}
                                }
                            }
                        }
                        else if(!(row>=0 && row <=7)){answer.body = JSON.stringify(({ "error": "row should be an integer between 0 and 7" }));}
                        else if(!(column>=0 && column<=7)){answer.body = JSON.stringify(({ "error": "column should be an integer between 0 and 7" }));}
                        else{answer.body = JSON.stringify(({ "error": "column and row should be an integer between 0 and 7" }));}
                        
                    }else{
                        gam.turn=((gam.turn).toString()==(gam.jog1).toString() ? (gam.jog2).toString():(gam.jog1).toString());
                        gam.count = { "light": gam.t.light, "dark": gam.t.dark, "empty": gam.t.empty }
                        updater.update(JSON.stringify(({ "turn": gam.turn, "skip":gam.t.skip, "winner": gam.winner, "board": gam.t.board, "count": gam.count })));
                    }
                }
               
                    updater.complete(answer, res);
                }
            });

            break;

        case '/leave':
            req
                .on("data", (chunk) => { body += chunk; })
                .on("end", () => {
                    try { query = JSON.parse(body); }
                    catch (err) { }
                })
                .on('error', (err) => { console.log(err.message); });

            fs.readFile("games.json", (err, data) => {
                if (!err) {
                    let dados = JSON.parse(data.toString());
                    let i=0;
                    for (gam of dados.games) {

                        if ((gam.game).toString() == (query.game).toString() && gam.jog2 != undefined && (gam.jog1).toString() == (query.nick).toString()) {
                            if (gam.jog1 == query.nick) {
                                gam.winner = gam.jog2;
                            }
                            else {
                                gam.winner = gam.jog1;
                            }
                            dados.games.splice(i,1);
                        }
                        else if ((gam.game) == (query.game).toString() && gam.jog2 === undefined && (gam.jog1).toString() == (query.nick).toString()) {
                            gam.winner = null;
                            dados.games.splice(i,1);

                           
                        }
                        i++;
                    }
                    
                    updater.complete(answer, res);           
                    updater.update(JSON.stringify(({ "winner": gam.winner})));
                   

                }

            });

            break;

            case '/ranking':
                fs.readFile("ranking.json", (err, data) => {
                    if (!err) {
                        let dados = JSON.parse(data.toString());
                        let ranks10 = { "ranking": [] } 
                        for (let i = 0; i < 10; i++) {
                            let d = dados.ranking[i];
                            if (d != undefined){
                                console.log(d);
                                ranks10.ranking.push(d);
                            }
                        }
                        answer.body = JSON.stringify(ranks10);
                        updater.complete(answer, res);
                    }
                });
                break;

        default:

            answer.status = 400;

            break;

    }

}
function play(row,column,t){
  
    let mudou = -1;
    let posii=[-1,1,0,0,-1,-1,1,1];
    let posij=[0,0,-1,1,-1,1,-1,1];
    let difdecurrent=0;
    for (let k=0;k<8;k++) {
        let p = check(row+posii[k],column+posij[k],posii[k],posij[k],difdecurrent,t);

        if(p!=-1 && p!=0){
           t= change(row,column,posii[k],posij[k],t);
           mudou=0;
           
        }
    }
    
    if(mudou==-1){ return -1; /*JSON.stringify(({ "error": "nenhuma peça alterada"}));*/}
    else{
        t.current=(t.current=="dark"?"light":"dark");t.empty--; 
        let mudouaux = -1;
        let difdecurrent=0;
        for(let i=0;i<8;i++){
            for(let j=0;j<8;j++){
                if((t.board[i][j]).toString()=="empty"){
                    for (let k=0;k<8;k++) {
                        let p = check(i+posii[k],j+posij[k],posii[k],posij[k],difdecurrent,t);
                        if(p!=-1 && p!=0){
                           mudouaux=0;
                        }
                        }
                }
            }
        }

        console.log("mudou"+mudouaux);
        if(mudouaux==-1){t.skip=true;}
        else{if(t.skip==undefined);}
        t.current=(t.current=="dark"?"light":"dark"); 
        mudouaux = -1;
        difdecurrent=0;
        for(let i=0;i<8;i++){
            for(let j=0;j<8;j++){
                if((t.board[i][j]).toString()=="empty"){
                    for (let k=0;k<8;k++) {
                        let p = check(i+posii[k],j+posij[k],posii[k],posij[k],difdecurrent,t);
                        if(p!=-1 && p!=0){
                           mudouaux=0;
                        }
                        }
                }
            }
        }
        if(mudouaux==-1){t.winner=true;}
        else{if(t.winner==undefined);}
        console.log("t.skip"+t.skip);
        t.current=(t.current=="dark"?"light":"dark");
         return t;/*JSON.stringify(({}));*/}

}
 
function check(row,column,i,j,difdecurrent,t){
    //console.log(t.board[row][column]);
    if(row>7 || row<0 || column>7 || column<0){
        return -1;
    }
    
    else if((t.board[row][column]).toString()!="empty"){
        if((t.board[row][column]).toString()==t.current){
           
             return difdecurrent;
         }
         else{
             return check(row+i,column+j,i,j,difdecurrent+1,t);
         }
        
    }
    return -1;

}
function change(row,column,i,j,t){
    let cor=0;
    
    t.board[row][column]=(t.current=="dark"?"dark":"light");
    while(cor==0){
       
        if((t.board[row+i][column+j]).toString()!=t.current){
            
            t.light+=(t.current=="light"? 1 : 0);
            t.dark+=(t.current=="dark"? 1 : 0);
           // console.log("light "+ t.light+" dark "+ t.dark);
            t.board[row+i][column+j]=(t.current=="dark"?"dark":"light");
            row=row+i;
            column=column+j;
        }
        else{cor=1;}
    }
    return t;

}
