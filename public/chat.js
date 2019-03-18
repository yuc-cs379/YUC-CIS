//Make connection
var socket = io.connect('ec2-54-202-56-225.us-west-2.compute.amazonaws.com:3000',{'sync disconnect on unload': true });

//var socket = io.connect('localhost:3000',{'sync disconnect on unload': true });
socket.on('check', function(message) {
    console.log(message);
});

function getRoomName(){
    var location = window.location.href;
    var url = new URL(location);
    var c = url.searchParams.get("field");
return c;}
document.getElementById('title').innerHTML += ' | '+getRoomName();
//Query DOM
var message = document.getElementById('message');
    handle = document.getElementById('handle');
    btn = document.getElementById('send');
    output = document.getElementById('output');
    feedback = document.getElementById('feedback');
    feedback1 = document.getElementById('feedback1');

    name = window.location.search.split('=')[1].split('&')[0];
    if(name.includes('%')) handleName = 'user';
    else handleName = name;
    handle.value = handleName;

socket.on('connect', function() {
    socket.emit('online',handleName);
});

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
