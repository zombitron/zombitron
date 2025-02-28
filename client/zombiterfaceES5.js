if(!window.zombitron){
    window.zombitron = {};
}
window.zombitron.zombiterface = function (element, socket) {
    this.socket = socket;
    this.element = element;
    this.sensors = {};
    this.initialize();
}

window.zombitron.zombiterface.prototype = {
    initialize: function () {
        // initializing interfaces
        var options = this.element.getAttribute('data-zombitron');
        if (options) {
            options = JSON.parse(options);
            if (options.orientation) {
                if (DeviceOrientationEvent != 'undefined') {
                    if(typeof (DeviceOrientationEvent.requestPermission) === "function"){
                        var callback = this.initializeOrientation(options.orientation);
                        DeviceOrientationEvent.requestPermission(callback);
                    } else {
                        this.initializeOrientation(options.orientation);
                    }
                }
                else {
                    alert('l\'orientation n\'a pas pu être détectée');
                }
            }
        }
        
        var elements = Array.prototype.slice.call(this.element.children);
        elements.forEach(function (element) {
            var element_options = element.getAttribute('data-zombitron');
            if (element_options) {
                element_options = JSON.parse(element_options);
                if(element_options.XY) {
                    this.initializeXY(element, element_options.XY);
                }
                if(element_options.matrix) {
                    this.initializeMatrix(element, element_options.matrix);
                }
            }
        }.bind(this));
    },
    initializeXY: function (element, options) {
        var XY = new window.zombitron.XY(element, options);
        element.addEventListener("touchstart", function (e) {
            this.onXYEvent(e, XY);
        }.bind(this));
        element.addEventListener("touchmove", function (e) {
            this.onXYEvent(e, XY);
        }.bind(this));
    },
    onXYEvent: function (e, XY) {
        e.preventDefault();
        this.send(XY.encode(e));
    },
    initializeButton: function (element, options) {
        alert(options);
    },
    initializeMatrix: function (element, options) {
        this.sensors.matrix = {
            type: 'sensorData',
            sensorType: 'matrix',
            data: {}
        }
        
        this.sensors.matrix.data[options.sequence] = options.value;
        var div = document.createElement('input');
        div.type = "checkbox";
        for(var i=0; i<this.sensors.matrix.data[options.sequence].length; i+=1){
            var el = div.cloneNode(true);
            el.value = i;
            el.checked = (this.sensors.matrix.data[options.sequence][i] == 1);

            el.addEventListener('change', function(e){
                this.sensors.matrix.data[options.sequence][e.target.value] = + e.target.checked;
                this.send(this.sensors.matrix);
            }.bind(this));
            element.appendChild(el);
        }
    },

    initializeOrientation: function (options) {
        this.sensors.orientation = {
            type: 'sensorData',
            sensorType: 'deviceorientation',
            data: {}
        }

        window.addEventListener("deviceorientation", function (e) {
            var valueChanged = false;
            if (options.alpha) {
                var alpha = Math.round(100 * e.alpha / 360) / 100;
                if(alpha != this.sensors.orientation.data[options.alpha]) {
                    this.sensors.orientation.data[options.alpha] = alpha;
                    valueChanged = true;
                }
            }
            if (options.beta) {
                var beta = Math.round(100 * (e.beta + 180) / 360) / 100;
                if(beta != this.sensors.orientation.data[options.beta]) {
                    this.sensors.orientation.data[options.beta] = beta;
                    valueChanged = true;
                }
            }
            if (options.gamma) {
                var gamma = Math.round(100 * (e.gamma + 90) / 180) / 100;
                if(gamma != this.sensors.orientation.data[options.gamma]) {
                    this.sensors.orientation.data[options.gamma] = gamma;
                    valueChanged = true;
                }
            }
            if(valueChanged){
                this.send(this.sensors.orientation);
            }
        }.bind(this));
    },
    send: function (obj) {
        var blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
        this.socket.send(blob);
    }
}
