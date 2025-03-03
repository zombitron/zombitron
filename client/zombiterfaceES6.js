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
            if (options.acceleration) {
                if (window.DeviceMotionEvent) {
                    if (typeof (window.DeviceMotionEvent.requestPermission) === "function") {
                        window.DeviceMotionEvent.requestPermission().then(response => {
                            if (response == 'granted') {
                                this.initializeAcceleration(options.acceleration);
                            }
                        }).catch((e) => alert('permission denied'));
                    } else {
                        this.initializeAcceleration(options.acceleration);
                    }
                }
                else {
                    alert('l\'acceleration n\'a pas pu être détectée');
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
        var XY = new window.zombitron.sensors.XY(elem, options);
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
        this.orientation = new window.zombitron.sensors.Orientation(options);
        window.addEventListener("deviceorientation", (e) => {
            this.onOrientationEvent(e, options);
        });
    }

    onOrientationEvent(e, options) {
        try{
            if(this.orientation.newValues(e, options)){
                this.send(this.orientation);
            }
        }catch(err){
            alert(err)
        }
    }

    onMotionEvent(e, options) {
        if(this.acceleration.newValues(e, options)){
            this.send(this.acceleration);
        }
    }

    initializeAcceleration(options) {
        this.acceleration = new window.zombitron.sensors.Motion(options);
        window.addEventListener("devicemotion", (e) => {
            this.onMotionEvent(e, options);
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