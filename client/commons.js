if (!window.zombitron) {
    window.zombitron = {};
}

var sensors = {};
sensors.XY = function (element, options) {
    this.element = element;
    this.options = options;
}

sensors.XY.prototype = {
    encode: function (e) {
        var rect = this.element.getBoundingClientRect();
        var XYObj = {
            type: 'sensorData',
            sensorType: 'XY',
            data: {}
        };

        for (var i = 0; i < e.touches.length; i += 1) {
            var x = (e.touches[i].clientX - rect.left) / rect.width;
            var y = (e.touches[i].clientY - rect.top) / rect.height;
            if (i == 0 && this.options.x1) {
                XYObj.data[this.options['x1']] = Math.round(100 * x) / 100;
            }
            if (i == 0 && this.options.y1) {
                XYObj.data[this.options['y1']] = Math.round(100 * y) / 100;
            }
        }
        return XYObj;
    }
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
    changed: function (newval) {
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
    compute: function (e, param) {
        return e[param];
    },
    update: function (e, options) {
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
    this.sensorType = 'deviceacceleration'
    this.params = ['x', 'y', 'z'];
}
sensors.Motion.prototype = new sensors.IMU();
sensors.Motion.prototype.compute = function (event, param) {
    return Math.round(100 * event.acceleration[param] / 360) / 100;
}
window.zombitron.sensors = sensors;