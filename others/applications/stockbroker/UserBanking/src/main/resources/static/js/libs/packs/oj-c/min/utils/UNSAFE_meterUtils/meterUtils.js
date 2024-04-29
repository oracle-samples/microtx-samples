define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getThresholdColorByIndex = void 0;
    const THRESHOLD_COLORS = ['#D63B25', '#CF7C00', '#508223'];
    const getThresholdColorByIndex = (threshold, index) => {
        if (threshold.color)
            return threshold.color;
        return THRESHOLD_COLORS[index % THRESHOLD_COLORS.length];
    };
    exports.getThresholdColorByIndex = getThresholdColorByIndex;
});
