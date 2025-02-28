if (!window.zombitron) {
    window.zombitron = {};
}

window.zombitron.XY = function (element, options) {
    this.element = element;
    this.options = options;
}

window.zombitron.XY.prototype = {
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