var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "ojs/ojvalidator-required", "preact/hooks"], function (require, exports, ojvalidator_required_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useDeferredValidators = void 0;
    ojvalidator_required_1 = __importDefault(ojvalidator_required_1);
    function useDeferredValidators({ labelHint, required, requiredMessageDetail }) {
        const requiredValidator = (0, hooks_1.useMemo)(() => {
            if (required) {
                return new ojvalidator_required_1.default({
                    label: labelHint,
                    messageDetail: requiredMessageDetail
                });
            }
            return null;
        }, [required]);
        return (0, hooks_1.useMemo)(() => [requiredValidator].filter(Boolean), [requiredValidator]);
    }
    exports.useDeferredValidators = useDeferredValidators;
});
