var pancarte = null;
var container = document.querySelector('body');
var started = false;
var infos = { es6: false };
if (container) {
  pancarte = document.createElement('div');
  pancarte.setAttribute('style', 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #000; color: #ddd; padding: 50% 0 0 0%; font-family: sans-serif; font-size: 60px;')
  pancarte.innerHTML = '<p> Loading </p>';
  container.appendChild(pancarte);
  loadInterface();
} else {
  alert('Container manquant');
}

function loadInterface() {
  var sensors = document.createElement('script');
  sensors.type = 'text/javascript';
  sensors.src = '/zombitron/client/sensors.js';
  document.head.appendChild(sensors);

  var zombiterface = document.createElement('script');
  zombiterface.type = 'text/javascript';
  zombiterface.src = '/zombitron/client/commons.js';
  document.head.appendChild(zombiterface);
  pancarte.innerHTML = '<p> Start </p><span style="width:100%; font-size:16px;">' + JSON.stringify(infos) + '</span>';

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
        window.zombitron.zombiterface = window.zombitron.zombiterface5;
      }
      pancarte.addEventListener('click', function () {
        pancarte.innerHTML = '...';
        start();
      }, { once: true });
      pancarte.addEventListener('touchend', function () {
        pancarte.innerHTML = '...';
        start();
      }, { once: true });
    }
  }, 100);
}

function start() { // user action required first
  var inter = setInterval(function () {
    try {
      if (typeof (window.zombitron.zombiterface) != 'undefined' && typeof (window.zombitron.sensors) != 'undefined' && !started) {
        started = true;
        clearInterval(inter);
        var zombiter = new window.zombitron.zombiterface(container);
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
    eval('var bar = (x) => x+1');
  } catch (e) { return false; }
  return true;
}