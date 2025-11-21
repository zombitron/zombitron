var pancarte = null;
var container = document.querySelector('#container');
var started = false;
var infos = { es6: false };
var options = {
  requestFullscreen: true,
  reloadOnDoubleClick: true
};

if (!window.zombitron) {
    window.zombitron = {};
}

window.zombitron.zombiterface = null;

if (container) {
  pancarte = document.createElement('div');
  pancarte.setAttribute('style', 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #000; color: #ddd; padding: 50% 0 0 0%; font-family: sans-serif; font-size: 60px;')
  pancarte.innerHTML = '<p> Loading </p>';
  container.appendChild(pancarte);
  try {
    loadInterface();
  } catch (e) {
    alert(e);
  }
} else {
  alert('Container manquant');
}

function loadInterface() {
  var sensors = document.createElement('script');
  sensors.type = 'text/javascript';
  sensors.src = '/zombitron/client/sensors.js';
  document.head.appendChild(sensors);

  var zombiscript = document.createElement('script');
  zombiscript.type = 'text/javascript';
  zombiscript.src = '/zombitron/client/commons.js';
  document.head.appendChild(zombiscript);

  var stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.type = 'text/css';
  stylesheet.media = 'screen';
  stylesheet.href = '/zombitron/client/style.css';
  document.head.insertBefore(stylesheet, document.head.firstChild);

  var inter = setInterval(function () {
    if (window.zombitron.zombiterface5) {
      clearInterval(inter);
      var s = document.createElement('script');
      if (check()) { // ES6 ok
        s.type = 'text/javascript';
        s.src = '/zombitron/client/zombiterfaceES6.js';
        infos.es6 = true;
        document.head.appendChild(s);
      } else {
        window.zombitron.zombiterfaceclass = window.zombitron.zombiterface5;
      }
      
      pancarte.innerHTML = '<p> Start </p><span style="width:100%; font-size:16px;">' + JSON.stringify(infos) + '</span>';
      pancarte.addEventListener('click', function (event) {
        event.preventDefault;

        if (document.fullscreenEnabled && options.requestFullscreen) {
          container.requestFullscreen();
        }
        pancarte.innerHTML = '...';
        start();
      }, { once: true, passive: false });
      pancarte.addEventListener('touchend', function () {
        pancarte.innerHTML = '...';
        start();
      }, { once: true });
    }
  }, 100);
}

var tapedTwice = false;

function tapHandler(event) {
    if(event.target.id == 'container'){
      if(!tapedTwice) {
          tapedTwice = true;
          setTimeout( function() { tapedTwice = false; }, 300 );
          return false;
      }
      event.preventDefault();
      //action on double tap goes below
      window.location.reload()
    }
 }

function start() { // user action required first
  if(options.reloadOnDoubleClick){
      container.addEventListener("touchstart", tapHandler);
  }
  var inter = setInterval(function () {
    try {
      if (typeof (window.zombitron.zombiterfaceclass) != 'undefined' && typeof (window.zombitron.sensors) != 'undefined' && !started) {
        started = true;
        clearInterval(inter);
        window.zombitron.zombiterface = new window.zombitron.zombiterfaceclass(container);
        var evt = new CustomEvent('zombiterfaceready', {});
        window.dispatchEvent(evt);
        pancarte.remove();
      }
    } catch (err) {
      alert(err);
    }
  }, 100);
}

function check() {
  'use strict';
  if (typeof Symbol == 'undefined') return false;
  try {
    eval('class Foo {}');
    eval('async function Foo(){}');
    eval('var bar = (x) => x+1');
  } catch (e) { return false; }
  return true;
}