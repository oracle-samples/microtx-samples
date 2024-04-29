var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_MeterBar", "ojs/ojvcomponent", "preact/hooks", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "../utils/UNSAFE_meterUtils/meterUtils", "css!oj-c/meter-bar/meter-bar-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_MeterBar_1, ojvcomponent_1, hooks_1, UNSAFE_useTabbableMode_1, meterUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MeterBar = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    exports.MeterBar = (0, ojvcomponent_1.registerCustomElement)('oj-c-meter-bar', (_a) => {
        var _b, _c, _d, _e, _f;
        var { max = 100, value = 0, min = 0, size = 'md', orientation = 'horizontal', step = 1, indicatorSize = 1, readonly = false, thresholdDisplay = 'indicator' } = _a, props = __rest(_a, ["max", "value", "min", "size", "orientation", "step", "indicatorSize", "readonly", "thresholdDisplay"]);
        const [hoveredVal, setHoveredVal] = (0, hooks_1.useState)();
        const inputHandler = (detail) => {
            var _a;
            setHoveredVal(detail.value);
            (_a = props.onTransientValueChanged) === null || _a === void 0 ? void 0 : _a.call(props, detail.value);
        };
        const commitHandler = (detail) => {
            var _a;
            (_a = props.onValueChanged) === null || _a === void 0 ? void 0 : _a.call(props, detail.value);
        };
        const thresholds = (_b = props.thresholds) === null || _b === void 0 ? void 0 : _b.map((threshold, index) => {
            return Object.assign(Object.assign({}, threshold), { color: (0, meterUtils_1.getThresholdColorByIndex)(threshold, index) });
        });
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ class: `oj-c-meter-bar-${orientation}` }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_MeterBar_1.MeterBar, { value: (hoveredVal != undefined ? hoveredVal : value), step: step, max: max, min: min, size: size, orientation: orientation, indicatorSize: indicatorSize, datatip: props.datatip
                    ? props.datatip({
                        value: hoveredVal != undefined ? hoveredVal : value
                    })
                    : props.datatip, onCommit: readonly ? undefined : commitHandler, onInput: readonly ? undefined : inputHandler, length: '100%', thresholds: thresholds, referenceLines: props.referenceLines, thresholdDisplay: thresholdDisplay === 'plotArea' ? 'track' : thresholdDisplay, indicatorColor: props.color, trackColor: (_c = props.plotArea) === null || _c === void 0 ? void 0 : _c.color, isTrackRendered: ((_d = props.plotArea) === null || _d === void 0 ? void 0 : _d.rendered) !== 'off', accessibleLabel: props['aria-label'], ariaLabelledBy: (_e = props.labelledBy) !== null && _e !== void 0 ? _e : undefined, ariaDescribedBy: (_f = props.describedBy) !== null && _f !== void 0 ? _f : undefined }) })));
    }, "MeterBar", { "properties": { "max": { "type": "number" }, "min": { "type": "number" }, "readonly": { "type": "boolean" }, "value": { "type": "number|null", "writeback": true }, "step": { "type": "number" }, "color": { "type": "string" }, "indicatorSize": { "type": "number" }, "plotArea": { "type": "object", "properties": { "color": { "type": "string" }, "rendered": { "type": "string", "enumValues": ["on", "off"] } } }, "orientation": { "type": "string", "enumValues": ["vertical", "horizontal"] }, "referenceLines": { "type": "Array<object>" }, "thresholdDisplay": { "type": "string", "enumValues": ["all", "plotArea", "indicator"] }, "thresholds": { "type": "Array<object>" }, "describedBy": { "type": "string|null" }, "labelledBy": { "type": "string|null" }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] }, "datatip": { "type": "function" }, "transientValue": { "type": "number", "readOnly": true, "writeback": true } }, "extension": { "_WRITEBACK_PROPS": ["value", "transientValue"], "_READ_ONLY_PROPS": ["transientValue"], "_OBSERVED_GLOBAL_PROPS": ["aria-label"] } }, { "max": 100, "value": 0, "min": 0, "size": "md", "orientation": "horizontal", "step": 1, "indicatorSize": 1, "readonly": false, "thresholdDisplay": "indicator" }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    }, { consume: [UNSAFE_useTabbableMode_1.TabbableModeContext] });
});
