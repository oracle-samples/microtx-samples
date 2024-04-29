var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "preact/jsx-runtime", "@jest/globals", "@oracle/oraclejet-preact/UNSAFE_Environment", "@oracle/oraclejet-preact/utils/UNSAFE_matchTranslationBundle", "@testing-library/preact", "@testing-library/user-event", "../input-text"], function (require, exports, jsx_runtime_1, globals_1, UNSAFE_Environment_1, UNSAFE_matchTranslationBundle_1, preact_1, user_event_1, input_text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    user_event_1 = __importDefault(user_event_1);
    (0, globals_1.describe)('oj-c InputText', () => {
        let env;
        const locale = (0, UNSAFE_matchTranslationBundle_1.matchTranslationBundle)(['en'], new Set(['en-US', 'en']));
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const { default: translations } = yield new Promise((resolve_1, reject_1) => { require([`@oracle/oraclejet-preact/resources/nls/${locale}/bundle.js`], resolve_1, reject_1); }).then(__importStar);
            env =
                env ||
                    {
                        translations: { '@oracle/oraclejet-preact': translations }
                    };
        }));
        (0, globals_1.test)('sets initial value', () => {
            const testValue = 'foo';
            const content = (0, preact_1.render)((0, jsx_runtime_1.jsx)(UNSAFE_Environment_1.RootEnvironmentProvider, Object.assign({ environment: env }, { children: (0, jsx_runtime_1.jsx)(input_text_1.InputText, { value: testValue }) })));
            const input = content.getByRole('textbox');
            (0, globals_1.expect)(input.value).toEqual(testValue);
        });
        (0, globals_1.test)('changes value', (done) => {
            function onValueChanged(value) {
                (0, globals_1.expect)(value).toEqual(testValue);
                done();
            }
            const testValue = 'foobar';
            const content = (0, preact_1.render)((0, jsx_runtime_1.jsx)(UNSAFE_Environment_1.RootEnvironmentProvider, Object.assign({ environment: env }, { children: (0, jsx_runtime_1.jsx)(input_text_1.InputText, { onValueChanged: onValueChanged }) })));
            const input = content.getByRole('textbox');
            user_event_1.default.click(input);
            user_event_1.default.keyboard(`${testValue}{enter}`);
        });
        (0, globals_1.afterEach)(preact_1.cleanup);
    });
});
