// fix footer position to the bottom
$(document).ready( function() {
  $('#footer1').css('margin-top',
    $(document).height()
    - ( $('#header').height() + $('#content').height() )
    - $('#footer').height()
  );
});
// to prevent scrolling when hover on top of text box
$( '.scrollable' ).on( 'mousewheel DOMMouseScroll', function ( e ) {
  var e0 = e.originalEvent,
      delta = e0.wheelDelta || -e0.detail;

  this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
  e.preventDefault();
});

///////// printing
function validateLinks(tag){
  var messages= $.get( "txt/messages.txt", ()=>{messagesBoolean =true;}).fail(()=>{messagesBoolean=false;});
  var links= $.get( "txt/links.txt", ()=>{linksBoolean =true;}).fail(()=>{linksBoolean=false;});

  if(tag.id=='downloadMessages'){
    $.when(messages).done(function() {
      // alert('TODO download the file');
      //console.log();
      download('Messages',messages.responseText)
    }).fail(()=>{
      alert('false');
    });
  }
  if(tag.id=='downloadLinks'){
    $.when(links).done(function() {
      // alert('TODO download the file');
      // console.log(links);
      download('Links',links.responseText)
    }).fail(()=>{
      alert('false');
    });
  }

  if(tag.id=='print'){
    $.when(messages,links).done(function() {
      print();
    }).fail(()=>{
      if (messages.status==200 || links.status==200) print();
      else alert('Error:\n Nothing to print!!');
    });
  }
}
function print(){
  var iframe = $('#txt');
  iframe.attr('src','txt/messages.txt');
  iframe.src = iframe.src;
  iframe.on('load', function(){
    window.frames["txt"].focus();
    window.frames["txt"].print();
  });
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
