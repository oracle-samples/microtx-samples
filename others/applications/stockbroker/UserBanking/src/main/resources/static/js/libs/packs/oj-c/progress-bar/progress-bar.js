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
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_ProgressBar", "ojs/ojvcomponent", "css!oj-c/progress-bar/progress-bar-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_ProgressBar_1, ojvcomponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressBar = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    exports.ProgressBar = (0, ojvcomponent_1.registerCustomElement)('oj-c-progress-bar', (_a) => {
        var { max = 100, value = 0, edge = 'none' } = _a, otherProps = __rest(_a, ["max", "value", "edge"]);
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(UNSAFE_ProgressBar_1.ProgressBar, { value: value === -1 ? 'indeterminate' : value, max: max, edge: edge, accessibleLabel: otherProps['aria-valuetext'] }) }));
    }, "ProgressBar", { "properties": { "max": { "type": "number" }, "value": { "type": "number" }, "edge": { "type": "string", "enumValues": ["none", "top"] } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["aria-valuetext"] } }, { "max": 100, "value": 0, "edge": "none" }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    });
});
