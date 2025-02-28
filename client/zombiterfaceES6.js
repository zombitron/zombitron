class Zombiterface6 {
    constructor(element, socket) {
        this.socket = socket;
        this.element = element;
        this.sensors = {};
        this.initialize();
    }

    async initialize() {
        let options = this.element.getAttribute('data-zombitron');
        if (options) {
            options = JSON.parse(options);
            if (options.orientation) {
                if (window.DeviceOrientationEvent) {
                    if (typeof (window.DeviceOrientationEvent.requestPermission) === "function") {
                        window.DeviceOrientationEvent.requestPermission().then(response => {
                            if (response == 'granted') {
                                this.initializeOrientation(options.orientation);
                            }
                        }).catch((e) => alert('permission denied'));
                    } else {
                        this.initializeOrientation(options.orientation);
                    }
                }
                else {
                    alert('l\'orientation n\'a pas pu être détectée');
                }
            }
        }

        const elements = Array.prototype.slice.call(this.element.children);
        elements.forEach((element) => {
            let element_options = element.getAttribute('data-zombitron');
            if (element_options) {
                element_options = JSON.parse(element_options);
                if (element_options.XY) {
                    this.initializeXY(element, element_options.XY);
                }
            }
        });
    }

    initializeXY(elem, options) {
        var XY = new window.zombitron.XY(elem, options);
        elem.addEventListener("touchstart", (e) => {
            this.onXYEvent(e, XY);
        });
        elem.addEventListener("touchmove", (e) => {
            this.onXYEvent(e, XY);
        });
    }

    onXYEvent(e, XY) {
        e.preventDefault();
        this.send(XY.encode(e));
    }

    initializeButton(element, options) {
        alert(options);
    }

    // initializeMatrix(element, options) {
    //     this.sensors.matrix = {
    //         type: 'sensorData',
    //         sensorType: 'matrix',
    //         data: {}
    //     }

    //     this.sensors.matrix.data[options.sequence] = options.value;
    //     var div = document.createElement('input');
    //     div.type = "checkbox";
    //     for(var i=0; i<this.sensors.matrix.data[options.sequence].length; i+=1){
    //         var el = div.cloneNode(true);
    //         el.value = i;
    //         el.checked = (this.sensors.matrix.data[options.sequence][i] == 1);

    //         el.addEventListener('change',(e) => {
    //             this.sensors.matrix.data[options.sequence][e.target.value] = + e.target.checked;
    //             this.send(this.sensors.matrix);
    //         });
    //         element.appendChild(el);
    //     }
    // }

    initializeOrientation(options) {
        this.sensors.orientation = {
            type: 'sensorData',
            sensorType: 'deviceorientation',
            data: {}
        }

        window.addEventListener("deviceorientation", (e) => {
            var valueChanged = false;
            if (options.alpha) {
                var alpha = Math.round(100 * e.alpha / 360) / 100;
                if (alpha != this.sensors.orientation.data[options.alpha]) {
                    this.sensors.orientation.data[options.alpha] = alpha;
                    valueChanged = true;
                }
            }
            if (options.beta) {
                var beta = Math.round(100 * (e.beta + 180) / 360) / 100;
                if (beta != this.sensors.orientation.data[options.beta]) {
                    this.sensors.orientation.data[options.beta] = beta;
                    valueChanged = true;
                }
            }
            if (options.gamma) {
                var gamma = Math.round(100 * (e.gamma + 90) / 180) / 100;
                if (gamma != this.sensors.orientation.data[options.gamma]) {
                    this.sensors.orientation.data[options.gamma] = gamma;
                    valueChanged = true;
                }
            }
            if (valueChanged) {
                this.send(this.sensors.orientation);
            }
        });
    }

    send(obj) {
        var blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
        this.socket.send(blob);
    }
}
if(!window.zombitron){
    window.zombitron = {};
}
window.zombitron.zombiterface = Zombiterface6;