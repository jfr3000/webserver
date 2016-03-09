var http = require('http');
var it = require('tape');

it('on methods other than GET or POST responds with error', function(t){
    t.plan(1);
    var options = {
        port: 8000,
        method: 'PUT'
    };
    http.request(options, function(res) {
        t.equal(res.statusCode, 405);
    }).end();
});

it('for any POST request with postvar param sends a response with method, language, param value"', function(t) {
    t.plan(6);
    var options = {
        port: 8000,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'testlanguage, shouldnotshow; test'
        }
    };
    var req = http.request(options, function(res) {
        var resData = [];
        res.on('data', function(chunk) {
            resData.push(chunk.toString());
        });
        res.on('end', function() {
            resData = resData.join();
            t.equal(resData.indexOf('testlanguage')>-1, true);
            t.equal(resData.indexOf('shouldnotshow')>-1, false);
            t.equal(resData.indexOf('POST')>-1, true);
            t.equal(resData.indexOf('abc')>-1, true);
        
        });
        t.equal(res.statusCode, 200);
        t.equal(res.headers['content-type'], 'text/html');
    });
    req.write(JSON.stringify({"postVar": "abc"}));
    req.end();
}); 
        
it('if postVar parameter missing, sends 400 and error message', function(t) {
    t.plan(1);
    var options = {
        port: 8000,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var req = http.request(options, function(res) {
        t.equal(res.statusCode, 400);
    });
    
    req.write(JSON.stringify({"abc": "abc"}));
    req.end();
}); 

it('for GET requests sends a response with method and language', function(t) {
    t.plan(5);
    var options = {
        port: 8000,
        method: 'GET',
        headers: {
            'Accept-Language': 'testlanguage, shouldnotshow; test'
        }
    };
    var req = http.request(options, function(res) {
        var resData = [];
        res.on('data', function(chunk) {
            resData.push(chunk.toString());
        });
        res.on('end', function() {
            resData = resData.join();
            t.equal(resData.indexOf('testlanguage')>-1, true);
            t.equal(resData.indexOf('shouldnotshow')>-1, false);
            t.equal(resData.indexOf('GET')>-1, true);
        
        });
        t.equal(res.statusCode, 200);
        t.equal(res.headers['content-type'], 'text/html');
    });
    req.end();
}); 

it('only accepts requests on the index URL "/"', function(t) {
    t.plan(1);
    http.get('http://localhost:8000/home', function(res) {
        t.equal(res.statusCode, 403);
    });
});
