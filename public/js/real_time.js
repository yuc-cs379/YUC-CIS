'use strict';
//Make connection

//var socket = io.connect('ec2-54-202-56-225.us-west-2.compute.amazonaws.com:3000');
var socket = io.connect('http://localhost:3000');

//Query DOM
var sessionName = document.getElementById('sessionName'),
    onlineUsersList = document.getElementById('onlineUsersList'),
    message = document.getElementById('messageInput'),
    handle = document.getElementById('handle'),
    sendMessageButton = document.getElementById('sendMessageButton'),
    messagesOutput = document.getElementById('messagesOutput'),
    feedback = document.getElementById('feedback'),
    linksOutput = document.getElementById('linksOutput'),
    shareLinks = document.getElementById('shareLinksButton');

//Login users to the server
socket.on('connect', function() {
    let myDate = new Date();
    console.log('socket.io connected ' + socket.id + ' ' + getHandleName(), getHandlePass());
    socket.emit('login', {
        handle: getHandleName(),
        pass: getHandlePass(),
        sessionsId: socket.id,
        time: myDate.getHours() + ":" + myDate.getMinutes()
    });
    handle.value = getHandleName();
});

//get who is online list
socket.on('checkUsers', function(data) {
    var users = [];
    var html = '';
    data.forEach((user) => {
        users.push(user.handle);
    });
    for (var i in users) {
        html += '<p>' + (parseInt(i) + 1) + '- ' + '<strong>' + users[i] + "</strong><span class='isConnected'></span></p>";
    }
    onlineUsersList.innerHTML = html;
});

//Sending And Receiving functions
sendMessageButton.addEventListener('click', function() {
    let myDate = new Date();
    let minutes = myDate.getMinutes();

    if (minutes < 10) {
        minutes = myDate.getMinutes().toString();
        minutes = '0' + minutes;
    } else minutes = myDate.getMinutes();

    let time = myDate.getHours() + ":" + minutes;

    emitMessage(time, (callback) => {
        if (callback == 'error') {
            message.value = '';
            message.value = 'Error: limit 300 character exceeded!!';
            setTimeout(function() {
                message.value = '';
            }, 2500);
        } else {
            message.value = '';
        }

    });
});

//Sending And Receiving functions
shareLinks.addEventListener('click', function() {
    let myDate = new Date();
    let minutes = myDate.getMinutes();

    if (minutes < 10) {
        minutes = myDate.getMinutes().toString();
        minutes = '0' + minutes;
    } else minutes = myDate.getMinutes();

    let time = myDate.getHours() + ":" + minutes;

    navigator.clipboard.readText()
        .then(text => {
            let x = confirm(`are you sure want to send this link?
                ${text}?`)
            if (x) {
                socket.emit('tabs', [text]);
                linksOutput.innerHTML += `<p> <a href='${text}'>${text}</a> <sub id = 'time'>${time}</sub></p>`;
                if (typeof callback == "function") callback('done');
            }
        })
        .catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });
});

socket.on('receiveMessage', function(data) {
    feedback.innerHTML = '';
    messagesOutput.innerHTML += '<p><strong>' + data.handle +
        ':</strong> ' + data.message + "<sub id = 'time'>" + data.time + '</sub>' + '</p>';
});

//Typing functions
message.addEventListener('keypress', function() {
    socket.emit('typing', getHandleName());
});
socket.on('typing', function(data) {
    feedback.innerHTML = '<p><em>' + data + ' is typing a mesage...</em></p>';
});

//setup before functions
var typingTimer; //timer identifier
var doneTypingInterval = 1000; //time in ms, 1 second for example
//on keyup, start the countdown
message.addEventListener('keyup', function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit('clearTyping', '');
    }, doneTypingInterval);
});
//on keydown, clear the countdown
message.addEventListener('keydown', function() {
    clearTimeout(typingTimer);
});
socket.on('clearTyping', function(data) {
    feedback.innerHTML = '';
});
//////////////////

//When user click quit
$(window).bind('beforeunload', function() {
    socket.emit('logout', {
        handle: getHandleName(),
        sessionsId: socket.id
    });
    socket.disconnect();
});


//links send and receive


function getHandleName() {
    let handleName;
    name = window.location.search.split('=')[1].split('&')[0];
    // if(name.includes('%')) handleName = 'user';
    // else
    handleName = name;
    return handleName;
}

function getHandlePass() {
    return window.location.search.split('=')[2];
}

function getSessionName() {
    let sessionName;
    name = window.location.search.split('=')[2].split('&')[0];
    if (name.includes('%')) handleName = 'user';
    else sessionName = name;
    return sessionName;
}

function emitMessage(time, callback) {
    if (message.value != "") {
        if (message.value.length <= 300) {
            socket.emit('sendMessage', {
                message: message.value,
                handle: getHandleName(),
                sessionName: getSessionName(),
                time: time
            });
            if (typeof callback == "function") callback('done');
        } else {
            if (typeof callback == "function") callback('error');
        }
    }
}

/*

$('#disconnect').click(function(){
    console.log('disconnect');
    socket.emit('offline',handleName);
    socket.disconnect();
    location.href='/'
});

//Emit events
btn.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        btn.click();
    }
});

window.addEventListener("unload", ()=>{
   console.log('disconnect');
    socket.emit('offline',handleName);
    socket.disconnect();
});

btn.addEventListener('click',function(){
    if(message.value != ""){
        socket.emit('chat',{
            message: message.value,
            handle: handleName,
            id: socket.id
        });
    }
    message.value = '';
    myDate = new Date();
    time = myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds();
});

message.addEventListener('keypress',function(){
    socket.emit('typing',handle.value);
});

myDate = new Date();
var time = myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds();

socket.on('chat', function(data){
    console.log(data);
  feedback.innerHTML = ""
  output.innerHTML += '<p><strong>'+data.handle +
                      ':</strong>' + data.message +"<sub id = 'time'>"+time+'</sub>' +'</p>' ;
});

socket.on('typing',function(data){
  feedback.innerHTML = '<p><em>' + data + 'is typing a mesage...</em></p>';
});

socket.on('online',function(data){
    var users = [];
    data.forEach((user)=>{
        users.push(user + ' is connected' + '<br>');
    });
    if(users[0] == undefined) users[0]="";
    if(users[1] == undefined) users[1]="";
    document.getElementById('output2').innerHTML = users[0] + users[1] ;
});

socket.on('offline',function(data){
    data.forEach((user)=>{
        document.getElementById('output2').innerHTML = user + ' is connected' + '<br>';
    });
});

socket.on('print',function(data){
    feedback1.innerHTML += '<hr>';
    data.forEach((element,i)=>{
       feedback1.innerHTML +='<p><strong>'+ (i+1)  +":</strong> <a href='"+element+" 'target='_blank'> <em>" + element + '</p>';
        updateScroll();
    });
});

function updateScroll(){
    var element = document.getElementById("links-window");
    element.scrollTop = element.scrollHeight;
}

function printChats(){
     var myWindow = window.open('','','width=500,height=700');
    jQuery.get('http://ec2-54-202-56-225.us-west-2.compute.amazonaws.com:3000/print', function(data) {
        myWindow.document.write(data);
        myWindow.print();
    });
}

function arrBox(){
    var arr = document.getElementById('arrBox');
    arr.style.display='';
    arr.onmouseover= ()=>{
        arr.style.display='none';
    }
}
*/
