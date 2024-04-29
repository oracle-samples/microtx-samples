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
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_RatingGauge", "ojs/ojvcomponent", "preact/hooks", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "css!oj-c/rating-gauge/rating-gauge-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_RatingGauge_1, ojvcomponent_1, hooks_1, UNSAFE_useTabbableMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RatingGauge = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    exports.RatingGauge = (0, ojvcomponent_1.registerCustomElement)('oj-c-rating-gauge', (_a) => {
        var _b, _c, _d;
        var { max = 5, value = 0, size = 'md', color = 'neutral', step = 1, readonly = false, disabled = false, changed = false } = _a, otherProps = __rest(_a, ["max", "value", "size", "color", "step", "readonly", "disabled", "changed"]);
        const [val, setVal] = (0, hooks_1.useState)(value);
        const [hoveredVal, setHoveredVal] = (0, hooks_1.useState)();
        const inputHandler = (detail) => {
            var _a;
            setHoveredVal(detail.value);
            (_a = otherProps.onTransientValueChanged) === null || _a === void 0 ? void 0 : _a.call(otherProps, detail.value);
        };
        const commitHandler = (detail) => {
            var _a, _b;
            setVal(detail.value);
            (_a = otherProps.onValueChanged) === null || _a === void 0 ? void 0 : _a.call(otherProps, detail.value);
            if (!changed) {
                (_b = otherProps.onChangedChanged) === null || _b === void 0 ? void 0 : _b.call(otherProps, true);
            }
        };
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(UNSAFE_RatingGauge_1.RatingGauge, { isReadonly: readonly, isDisabled: disabled, value: (hoveredVal != undefined ? hoveredVal : val), step: step, max: max, size: size, color: color, tooltip: otherProps.tooltip, datatip: (_b = otherProps.datatip) === null || _b === void 0 ? void 0 : _b.call(otherProps, {
                    value: hoveredVal != undefined ? hoveredVal : val
                }), onCommit: commitHandler, onInput: inputHandler, accessibleLabel: otherProps['aria-label'], ariaLabelledBy: (_c = otherProps.labelledBy) !== null && _c !== void 0 ? _c : undefined, ariaDescribedBy: (_d = otherProps.describedBy) !== null && _d !== void 0 ? _d : undefined }) }));
    }, "RatingGauge", { "properties": { "max": { "type": "number" }, "readonly": { "type": "boolean" }, "disabled": { "type": "boolean" }, "changed": { "type": "boolean", "writeback": true }, "value": { "type": "number|null", "writeback": true }, "step": { "type": "number" }, "describedBy": { "type": "string|null" }, "labelledBy": { "type": "string|null" }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] }, "color": { "type": "string", "enumValues": ["neutral", "gold"] }, "datatip": { "type": "function" }, "tooltip": { "type": "string" }, "transientValue": { "type": "number", "readOnly": true, "writeback": true } }, "extension": { "_WRITEBACK_PROPS": ["changed", "value", "transientValue"], "_READ_ONLY_PROPS": ["transientValue"], "_OBSERVED_GLOBAL_PROPS": ["aria-label"] } }, { "max": 5, "value": 0, "size": "md", "color": "neutral", "step": 1, "readonly": false, "disabled": false, "changed": false }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    }, { consume: [UNSAFE_useTabbableMode_1.TabbableModeContext] });
});
