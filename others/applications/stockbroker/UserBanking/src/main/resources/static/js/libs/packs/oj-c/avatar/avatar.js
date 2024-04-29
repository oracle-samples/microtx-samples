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
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_Avatar", "ojs/ojvcomponent", "css!oj-c/avatar/avatar-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_Avatar_1, ojvcomponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Avatar = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    exports.Avatar = (0, ojvcomponent_1.registerCustomElement)('oj-c-avatar', (_a) => {
        var { src, iconClass, initials, shape = 'square', background = 'neutral', size = 'md' } = _a, otherProps = __rest(_a, ["src", "iconClass", "initials", "shape", "background", "size"]);
        const icon = iconClass ? (0, jsx_runtime_1.jsx)("span", { class: iconClass }) : null;
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(UNSAFE_Avatar_1.Avatar, Object.assign({ src: src !== null && src !== void 0 ? src : undefined, background: background, size: size, initials: initials !== null && initials !== void 0 ? initials : undefined, shape: shape, accessibleLabel: otherProps['aria-label'] }, { children: icon })) }));
    }, "Avatar", { "properties": { "background": { "type": "string", "enumValues": ["neutral", "orange", "green", "teal", "blue", "slate", "pink", "purple", "lilac", "gray"] }, "initials": { "type": "string|null" }, "size": { "type": "string", "enumValues": ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] }, "src": { "type": "string|null" }, "iconClass": { "type": "string" }, "shape": { "type": "string", "enumValues": ["circle", "square"] } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["aria-label"] } }, { "shape": "square", "background": "neutral", "size": "md" }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    });
});
