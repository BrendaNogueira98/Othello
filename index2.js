
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const crypto = require('crypto');

let conf = require("./conf.js");
let updater = require("./updater.js");

const PORT = 8154;

const headers = {
    plain: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    }
};
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
            answer = doGet(pathname, req, res);
            break;
        case 'POST':
            answer = doPost(pathname);
            break;
        default:
            answer.status = 400;
    }
    if (answer.status === undefined)
        answer.status = 200;
    if (answer.style === undefined)
        answer.style = 'plain';
    if (answer.body === undefined) {
        answer.body = "{}";
    }
    res.writeHead(answer.status, headers[answer.style]);
    if (answer.style === 'plain')
        res.end(answer.body);
}).listen(PORT);

function doGet(pathname, req, res) {
    let answer = {};
    switch (pathname) {
        case '/update':
            updater.remember(res);
            req.on('close', () =>
                updater.forget(res));
            setImmediate(() =>
                updater.update(
                    conf.get()));
            answer.style = 'sse';
            break;
        default:
            answer.status = 400;
            break;
    }

    return answer;
}
function doPost(pathname, req) {
    let body = "";
    let query;
    let answer = {};
    switch (pathname,req) {
        case "/register":
            req
                .on("data", (chunk) => { body += chunk; })
                .on("end", () => {
                    try { query = JSON.parse(body);  /* processar query */ }
                    catch (err) {  /* erros de JSON */ }
                })
                .on('error', (err) => { console.log(err.message); });

            fs.readFile("registo.json", function (err, data) {
                if (!err) {
                    let dados = JSON.parse(data.toString());
                    let jaRegistado = false;
                    for (reg of dados.registo) {
                        if (reg.nick == query.nick) {
                            if (reg.pass != query.pass) {
                                answer.body = JSON.stringify({ "error": "User registered with a different password" });
                                jaRegistado = true;
                            }
                        }
                    }
                    if (!jaRegistado) {
                        dados.registo.push(query);
                    }
                }
            });
            break;
        case "/ranking":
            fs.readFile("ranking.json", function (err, data) {
                if (!err) {
                    answer.body = data.toString();
                }
            });
            break;
        case "/join":
            req.on("data", (chunk) => { body += chunk; })
                .on("end", () => {
                    try { query = JSON.parse(body);  /* processar query */ }
                    catch (err) {  /* erros de JSON */ }
                })
                .on('error', (err) => { console.log(err.message); });
            fs.readFile("dados.json", function (err, data) {
                if (!err) {
                    let dados = JSON.parse(data.toString());
                    //{"games":[{"game":hash,"jog1":nick,"jog2":nick}]}
                    if (dados.games.length == 0 || ((dados.games.length != 0) && (dados.games[dados.games.length - 1].jog2 != undefined))) {
                        games.push({ "game": hash, "jog1": query.nick, });
                        answer.body = JSON.stringify({ "game": hash, "color": "dark" });
                    }
                    else {
                        dados.games[dados.games.length - 1].jog2 = query.nick;
                        answer.body = JSON.stringify({ "game": dados.games[dados.games.length - 1].hash, "color": "light" });
                    }
                }
            });


            break;
        default:
            answer.status = 400;

    }
    return answer;
}