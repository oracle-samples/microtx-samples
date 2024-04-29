define(["require", "exports", "preact/jsx-runtime", "@jest/globals", "@testing-library/preact", "../split-menu-button"], function (require, exports, jsx_runtime_1, globals_1, preact_1, split_menu_button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, globals_1.describe)('oj-c Split Menu Button', () => {
        (0, globals_1.test)('invokes action', (done) => {
            var _a, _b, _c;
            function onClick(evt) {
                (0, globals_1.expect)(evt.target).toEqual(button);
                done();
            }
            const content = (0, preact_1.render)((0, jsx_runtime_1.jsx)(split_menu_button_1.SplitMenuButton, { onOjAction: onClick, label: "Click me" }));
            const button = (_c = (_b = (_a = content.container.firstChild) === null || _a === void 0 ? void 0 : _a.firstChild) === null || _b === void 0 ? void 0 : _b.firstChild) === null || _c === void 0 ? void 0 : _c.firstChild;
            button === null || button === void 0 ? void 0 : button.click();
        });
        (0, globals_1.afterEach)(preact_1.cleanup);
    });
});
