let responses = [];

module.exports.remember = function (response) {
    responses.push(response);
}

module.exports.forget = function (response) {
    let pos = responses.findIndex((resp) => resp === response);
    if (pos > -1)
        responses.splice(pos, 1);
}

module.exports.update = function (message) {
    for (let response of responses) {
       response.write("data: "+ message+"\n\n");
       //console.log("estou no update");
    }
}

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

module.exports.complete = function (answer, res) {
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
   /* if (answer.style === 'sse')
        res.write(answer.body);*/
}

let crypto = require('crypto');

module.exports.encrypt = function (pass) {
    var algorithm = 'aes-256-ctr';
    var key = Buffer.alloc(32, 0);
    var iv = Buffer.alloc(16, 0);
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    try {
        var crypted = cipher.update(pass, 'utf8', 'hex');
        crypted += cipher.final('hex');
    } catch (e) {
        return;
    }
    return crypted;
}