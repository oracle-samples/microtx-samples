var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "preact/jsx-runtime", "@jest/globals", "@testing-library/preact", "@testing-library/user-event", "../button"], function (require, exports, jsx_runtime_1, globals_1, preact_1, user_event_1, button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    user_event_1 = __importDefault(user_event_1);
    (0, globals_1.describe)('oj-c Button', () => {
        (0, globals_1.test)('invokes onClick listener', (done) => {
            function onClick(evt) {
                (0, globals_1.expect)(evt.target).toEqual(button);
                done();
            }
            const content = (0, preact_1.render)((0, jsx_runtime_1.jsx)(button_1.Button, Object.assign({ onOjAction: onClick }, { children: "Click me" })));
            const button = content.getByRole('button');
            user_event_1.default.click(button);
        });
        (0, globals_1.afterEach)(preact_1.cleanup);
    });
});
