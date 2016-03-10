var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
    if (!(req.method === 'GET' || req.method === 'POST')) {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end();
        return;
    }
    if (req.url != '/') {
        res.writeHead(403);
        res.end();
        return;
    }
    if (req.method === 'POST') {
        if (req.headers['content-type'] != 'application/json') {
            res.writeHead(415, {'Content-Type': 'text/plain'});
            res.end('POST data was not sent as JSON');
        } else {
            var postData = [];
            req.on('data', function(chunk) {
                postData.push(chunk.toString());
            });
            req.on('end', function() {
                try {
                    postData = JSON.parse(postData.join());
                } catch (err) {
                    res.writeHead(400, {'Content-Type': 'text/plain'});
                    res.end('Could not parse JSON: ' + err);
                    return;
                }
                if (!postData.postVar) {
                    res.writeHead(400, {'Content-Type': 'text/html'});
                    fs.createReadStream('./error.html').pipe(res);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(makeResponse(req, postData.postVar));
                    res.end();
                }
            });
        }
    } else if (req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(makeResponse(req));
        res.end();
    }
}).listen(8000, function() {
    console.log('Server listening on port 8000');
});


function makeResponse(req, paramValue) {
    var languageHeader = req.headers['accept-language'];
    var language = languageHeader ? languageHeader.split(',')[0] : undefined;
    var htmlSnippets = {
        openDoc: '<!DOCTYPE html><html><meta charset="utf-8"><body><p>',
        languageLabel: 'Your language is: ',
        methodLabel: '<br>You sent a: ',
        parameterLabel: '<br>Your POST variable value: ',
        closeDoc: '</p></body></html>' 
    };
    var basicResponse = htmlSnippets.openDoc + htmlSnippets.languageLabel +language + htmlSnippets.methodLabel + req.method;
    if (req.method === 'POST') {
        var parameterInfo = htmlSnippets.parameterLabel + paramValue;
        return basicResponse + parameterInfo + htmlSnippets.closeDoc;
    } else {
        return basicResponse + htmlSnippets.closeDoc;
    }
}

