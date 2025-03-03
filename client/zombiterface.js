var pancarte = null;
var container = document.querySelector('body');

var infos = { es6: false };
if (container) {
  pancarte = document.createElement('div');
  pancarte.setAttribute('style', 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #000; color: #ddd; padding: 50% 0 0 0%; font-family: sans-serif; font-size: 60px;')
  pancarte.innerHTML = '<p> Loading </p>';
  container.appendChild(pancarte);

  var socket = getSocket();
  if (socket) {
    var inter = setInterval(function () {
      if (socket.readyState == 1) { // waiting for socket connection
        clearInterval(inter);
        socket.addEventListener("error", function (event) {
          alert("Socket déconnectée > recharger la page");
        });
        loadInterface();
      }
    }, 100);
  }
} else {
  alert('Container manquant');
}

function loadInterface() {
  var commons = document.createElement('script');
  commons.type = 'text/javascript';
  commons.src = '/zombitron/client/commons.js';
  document.head.appendChild(commons);
  var s = document.createElement('script');
  if (check()) { // ES6 ok
    s.type = 'text/javascript';
    s.src = '/zombitron/client/zombiterfaceES6.js';
    infos.es6 = true;
  } else {
    s.type = 'text/javascript';
    s.src = '/zombitron/client/zombiterfaceES5.js';
  }
  document.head.appendChild(s);

  pancarte.innerHTML = '<p> Start </p><span style="width:100%; font-size:16px;">' + JSON.stringify(infos) + '</span>';
  pancarte.addEventListener('click', function () {
    pancarte.innerHTML = '...';
    start();
  }, { once: true });
  pancarte.addEventListener('touchend', function () {
    pancarte.innerHTML = '...';
    start();
  }, { once: true });
}

function start(){ // user action required first

  var inter = setInterval(function () {

    try{
      if (typeof(window.zombitron.zombiterface) != 'undefined' && typeof(window.zombitron.sensors) != 'undefined' ) {
        var zombiterface = new window.zombitron.zombiterface(container, socket);
        clearInterval(inter);
        pancarte.remove();
      }
    }catch(err){
      alert(err);
    }
  }, 100);
}

function getSocket() {
  try {
    var socketServer = '';
    if (window.location.protocol === 'https:') {
      socketServer = 'wss://';
    } else {
      socketServer = 'ws://';
    }
    socketServer += window.location.host;
    return new WebSocket(socketServer);
  } catch (e) {
    alert(JSON.stringify(e))
  }
}

function check() {
  'use strict';
  if (typeof Symbol == 'undefined') return false;
  try {
    eval('class Foo {}');
    eval('var bar = (x) => x+1');
  } catch (e) { return false; }
  return true;
}