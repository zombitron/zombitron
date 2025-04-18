class zombiterface6 extends window.zombitron.zombiterface5 {
    constructor(element) {
        super(element)
    }
    async initialize() {
        super.initialize();
    }
}

if (!window.zombitron) {
    window.zombitron = {};
}
window.zombitron.zombiterface = zombiterface6;