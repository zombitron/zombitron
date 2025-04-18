if (!window.zombitron) {
    window.zombitron = {};
}

var sensors = {};

sensors.initialize = function (element, options, callback) {
    var obj;
    if (options.type) {
        switch (options.type) {
            case 'sliderxy':
                obj = new sensors.SliderXY(element, options, callback);
                obj.init();
                break;
            case 'slider':
                obj = new sensors.Slider(element, options, callback);
                obj.init();
                break;
            case 'button':
                obj = new sensors.Button(element, options, callback);
                obj.init();
                break;
            default:
                console.error('Unknown input type : ' + options.type);
                break;
        }
    }
    else {
        console.log("unknown touch input type");
    }
}

sensors.Touch = function (element, options, callback) {
    this.element = element;
    this.options = options;
    this.eventCallback = callback;
}

sensors.Touch.prototype = {
    init: function () {
        this.initEventListeners();
        this.element.classList.add('zombitronelem', this.options.type);
        this.element.classList.add(this.options.type);
        this.initView();
    },
    initEventListeners: function () {
        this.element.addEventListener("touchstart", function (e) {
            e.preventDefault();
            this.onTouchStart(e);
        }.bind(this));

        this.element.addEventListener("touchend", function (e) {
            e.preventDefault();
            this.onTouchEnd(e);
        }.bind(this));
    },
    initView: function () {
        return
    },
    getTouchPosition: function (e) {
        var rect = this.element.getBoundingClientRect();
        return {
            x: (e.touches[0].clientX - rect.left) / rect.width,
            y: (e.touches[0].clientY - rect.top) / rect.height
        };
    },
    onTouchStart: function (e) {
        return
    },
    onTouchEnd: function (e) {
        return
    },
    encode: function () {
        return {
            type: 'sensorData',
            sensorType: this.options.type,
            data: {}
        };
    },
    clamp: function (v, min, max) {
        return Math.min(max, Math.max(min, v));
    },
    getWidth: function (element) {
        return parseInt(window.getComputedStyle(element).getPropertyValue('width'));
    },
    getHeight: function (element) {
        return parseInt(window.getComputedStyle(element).getPropertyValue('height'));
    }
}

//////////// Slider XY //////////////
sensors.SliderXY = function (element, options, callback) {
    this.element = element;
    this.options = options;
    this.eventCallback = callback;
    this.value = { x: 0, y: 0 };
}

sensors.SliderXY.prototype = new sensors.Touch();

sensors.SliderXY.prototype.initEventListeners = function () {
    sensors.Touch.prototype.initEventListeners.call(this);
    this.element.addEventListener("touchmove", function (e) {
        e.preventDefault();
        this.onTouchMove(e);
    }.bind(this));
}

sensors.SliderXY.prototype.onTouchMove = function (e) {
    this.updateValues(e);
    this.eventCallback(this.encode());
}

sensors.SliderXY.prototype.onTouchStart = function (e) {
    this.updateValues(e);
    this.eventCallback(this.encode());
}

sensors.SliderXY.prototype.initView = function () {
    if (this.options.cursor != false) {
        this.cursor = document.createElement('div');
        this.cursor.classList.add('cursor');
        this.element.appendChild(this.cursor);
    }
}

sensors.SliderXY.prototype.updateView = function () {
    if (this.cursor) {
        this.cursor.style.left = this.setRelativePosLeft(this.cursor, this.value.x);
        this.cursor.style.top = this.setRelativePosTop(this.cursor, this.value.y);
    }
}

sensors.SliderXY.prototype.setRelativePosLeft = function (elem, value) {
    return - this.getWidth(elem) / 2 + (this.clamp(value, 0, 1) * this.getWidth(this.element)) + "px";
}

sensors.SliderXY.prototype.setRelativePosTop = function (elem, value) {
    return - this.getHeight(elem) / 2 + (this.clamp(value, 0, 1) * this.getHeight(this.element)) + "px";
}

sensors.SliderXY.prototype.updateValues = function (e) {
    var touchpos = this.getTouchPosition(e);
    this.value.x = this.clamp(Math.round(100 * touchpos.x) / 100, 0, 1);
    this.value.y = this.clamp(Math.round(100 * touchpos.y) / 100, 0, 1);
    this.updateView();
}

sensors.SliderXY.prototype.encode = function () {
    var touchObj = sensors.Touch.prototype.encode.call(this);
    touchObj.data[this.options.x] = this.value.x;
    touchObj.data[this.options.y] = this.value.y;
    return touchObj;
}

//////////// Slider //////////////
sensors.Slider = function (element, options, callback) {
    this.element = element;
    this.options = options;
    this.eventCallback = callback;
    this.value = 0;
}

sensors.Slider.prototype = new sensors.SliderXY();

sensors.Slider.prototype.initView = function () {
    sensors.SliderXY.prototype.initView.call(this);
    this.element.classList.add(this.options.orientation);
    this.progress = document.createElement('div');
    this.progress.style.position = 'absolute';
    this.progress.style.top = 0;
    this.progress.style.left = 0;
    this.progress.classList.add('progress');
    this.element.appendChild(this.progress);

    if (this.options.orientation == 'horizontal') {
        this.progress.style.height = this.getHeight(this.element) + 'px';
        if (this.cursor) {
            this.cursor.style.top = this.setRelativePosTop(this.cursor, 0.5);
        }

    } else if (this.options.orientation == 'vertical') {
        this.progress.style.width = this.getWidth(this.element) + 'px';
        if (this.cursor) {
            this.cursor.style.left = this.setRelativePosLeft(this.cursor, 0.5);
        }
    }
}

sensors.Slider.prototype.updateView = function () {
    if (this.options.orientation == 'horizontal') {
        this.progress.style.width = this.value * this.getWidth(this.element) + 'px';
        if (this.cursor) {
            this.cursor.style.left = this.setRelativePosLeft(this.cursor, this.value);
        }

    } else if (this.options.orientation == 'vertical') {
        this.progress.style.height = this.value * this.getHeight(this.element) + 'px';
        if (this.cursor) {
            this.cursor.style.top = this.setRelativePosTop(this.cursor, this.value);
        }
    }
}

sensors.Slider.prototype.updateValues = function (e) {
    var touchpos = this.getTouchPosition(e);
    if (this.options.orientation == 'horizontal') {
        this.value = this.clamp(Math.round(100 * touchpos.x) / 100, 0, 1);
    }
    else if (this.options.orientation == 'vertical') {
        this.value = this.clamp(Math.round(100 * touchpos.y) / 100, 0, 1);
    }
    this.updateView();
}

sensors.Slider.prototype.encode = function () {
    var touchObj = sensors.Touch.prototype.encode.call(this);
    touchObj.data[this.options.value] = this.value;
    return touchObj;
}

//////////// Button //////////////
sensors.Button = function (element, options, callback) {
    this.element = element;
    this.options = options;
    this.eventCallback = callback;
    this.value = false;
}

sensors.Button.prototype = new sensors.Touch();

sensors.Button.prototype.encode = function () {
    var touchObj = sensors.Touch.prototype.encode.call(this);
    touchObj.data[this.options.value] = this.value;
    return touchObj;
}

sensors.Button.prototype.onTouchStart = function (e) {
    if (this.options.toggle) {
        this.value = !this.value;
    }
    else {
        this.value = true;
    }
    this.updateView();
    this.eventCallback(this.encode());
}

sensors.Button.prototype.onTouchEnd = function (e) {
    if (!this.options.toggle) {
        this.value = false;
        this.eventCallback(this.encode());
    }
    this.updateView();
}

sensors.Button.prototype.initView = function () {
    this.on = document.createElement('div');
    this.on.style.position = 'absolute';
    this.on.style.top = 0;
    this.on.style.width = "100%";
    this.on.style.height = "100%";
    this.on.style.left = 0;
    this.on.style.visibility = "hidden";
    this.on.classList.add('on');
    this.element.appendChild(this.on);
}

sensors.Button.prototype.updateView = function () {
    this.on.style.visibility = this.value ? "visible" : "hidden";
}

sensors.IMU = function () {
    this.data = {};
    this.params = [];
}
sensors.IMU.prototype = {
    newValues: function (e, options) {
        var sensorsvalues = this.update(e, options);
        if (this.changed(sensorsvalues)) {
            this.data = sensorsvalues;
            return true;
        } else {
            return false;
        }
    },
    changed: function (newval) { // check if values changed 
        var changed = false;
        Object.keys(newval).forEach(function (param) {
            if (this.data[param]) {
                if (newval[param] !== this.data[param]) {
                    changed = true;
                }
            } else {
                changed = true;
            }
        }.bind(this));
        return changed;
    },
    compute: function (e, param) { // apply math to sensor values
        return e[param];
    },
    update: function (e, options) { // formats new values
        var sensorsvalues = {};
        this.params.forEach(function (param) {
            if (options[param]) {
                var v = 0;
                try {
                    v = this.compute(e, param);
                } catch (error) {
                    alert(error);
                }
                sensorsvalues[options[param]] = v;
            }
        }.bind(this));
        return sensorsvalues;
    }
}

sensors.Orientation = function (options) {
    this.options = options;
    this.data = {};
    this.type = 'sensorData';
    this.sensorType = 'deviceorientation';
    this.params = ['alpha', 'beta', 'gamma'];
}
sensors.Orientation.prototype = new sensors.IMU();
sensors.Orientation.prototype.compute = function (event, param) {
    return Math.round(100 * event[param] / 360) / 100;
}

sensors.Motion = function (options) {
    this.options = options;
    this.data = {};
    this.type = 'sensorData';
    this.sensorType = 'deviceacceleration';
    this.params = ['x', 'y', 'z'];
}
sensors.Motion.prototype = new sensors.IMU();
sensors.Motion.prototype.compute = function (event, param) {
    return Math.round(100 * event.acceleration[param] / 360) / 100;
}

window.zombitron.sensors = sensors;