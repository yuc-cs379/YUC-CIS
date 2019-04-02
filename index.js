var express = require('express');
var socket = require('socket.io');

//App setup
var app = express();
var server = app.listen(3000, function() {
    console.log("Listening to requests on port 3000")
});

var fs = require('fs');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://ec2-54-202-56-225.us-west-2.compute.amazonaws.com:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.post('/', function(req, res) {
    var user_id = req.body;
    console.log(user_id);
});

app.get('/print', function(req, res) {
    var text = fs.readFileSync("public/txt/messages.txt").toString('utf-8');
    text = text + '\n\n'
    text = text + fs.readFileSync("public/txt/links.txt").toString('utf-8');
    res.send(text);
});

//Static files
app.use(express.static('public'));

var users = [];
var arr = [];

function removeTxtFiles() {
    if (users.length == 0) {
        fs.exists('./public/txt/messages.txt', function(exists) {
            if (exists) {
                fs.unlink('public/txt/messages.txt', function(err) {
                    if (err) throw err;
                    // if no error, file has been deleted successfully
                    console.log('File deleted!');
                });
            }
        });

        fs.exists('./public/txt/links.txt', function(exists) {
            if (exists) {
                fs.unlink('public/txt/links.txt', function(err) {
                    if (err) throw err;
                    // if no error, file has been deleted successfully
                    console.log('File deleted!');
                });
            }
        });
    }
}

//Socket setup
var io = socket(server);

function initlizeTxtFiles(data) {
    var date = new Date();
    fs.appendFileSync('public/txt/messages.txt', 'Session started at: ' + date.getHours() + ':' + date.getMinutes() + '\t Session Name: ' + data.sessionName + '\r\n ------------------------------------------------------------------------ \r\n\r\n');
    fs.appendFileSync('public/txt/links.txt', 'Session started at: ' + date.getHours() + ':' + date.getMinutes() + '\t Session Name: ' + data.sessionName + '\r\n ------------------------------------------------------------------------ \r\n\r\n');
}

//server
io.on('connection', function(socket) {
    console.log('made socket connection', socket.id);

    socket.on('login', function(data) {
        console.log(data)
        if (users.length == 0) removeTxtFiles();
        users.push(data);
        io.sockets.emit('checkUsers', users);
    });

    socket.on('logout', function(data) {
        for (var i in users) {
            if (users[i].sessionsId == data.sessionsId) {
                if (i > -1) {
                    users.splice(i, 1);
                }
            }
        }
        removeTxtFiles();
        io.sockets.emit('checkUsers', users);
    });

    socket.on('sendMessage', function(data) {
        io.sockets.emit('receiveMessage', data);
        fs.access('public/txt/messages.txt', (notExist) => {
            if (notExist) {
                initlizeTxtFiles(data);
                fs.appendFileSync('public/txt/messages.txt', data.handle + ': ' + data.message + ' (' + data.time + ')\r\n');
            } else {
                fs.appendFileSync('public/txt/messages.txt', data.handle + ': ' + data.message + ' (' + data.time + ')\r\n');
            }

        });
    });

    socket.on('typing', function(data) {
        //emit the handle is typing...
        socket.broadcast.emit('typing', data);
    });
    socket.on('clearTyping', function(data) {
        socket.broadcast.emit('clearTyping', data);
    });


    myDate = new Date();

    socket.on('tabs', function(data) {
        var time = myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds();

        fs.appendFileSync('public/txt/links.txt', time +
            ' time of first link shared' + '\r\n \r\n');
        data.forEach((link, i) => {
            fs.appendFileSync('public/txt/links.txt', i + 1 + '- ' + link + '\r\n \r\n');
        });
        io.sockets.emit('links', data);
    });

    /*
    socket.on('check', function(data){
        io.sockets.emit('check', data);
    });

    socket.on('online', function(data){
       if(users.indexOf(data) === -1) {
            users.push(data);
            console.log(data);
        }
        io.sockets.emit('online', users);
    });

    socket.on('offline', function(data){
        console.log(data + '- disconnect');
        for(var i=0; i < users.length; i++) {
           if(users[i] == data){
              users.splice(i,1);
           }
        }
        console.log(users);
        remove();
        io.sockets.emit('offline', users);
    });

    socket.on('chat', function(data){
         var time = myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds();

        fs.appendFileSync('public/txt/messages.txt', data.handle + ': ' +data.message + ' ('+ time + ')\r\n');
        io.sockets.emit('chat', data);
    });

    socket.on('typing',function(data){
        socket.broadcast.emit('typing',data);
    });

*/

}); //end of connection function
