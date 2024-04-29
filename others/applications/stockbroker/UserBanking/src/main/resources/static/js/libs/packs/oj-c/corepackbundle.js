define('oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText',["require", "exports", "preact/hooks"], function (require, exports, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useAssistiveText = void 0;
    function determineAssistiveText(help, validatorHint, helpHints, converterHint, displayOptions) {
        return ((help === null || help === void 0 ? void 0 : help.instruction) ||
            ((displayOptions === null || displayOptions === void 0 ? void 0 : displayOptions.validatorHint) === 'none' ? undefined : validatorHint) ||
            (helpHints === null || helpHints === void 0 ? void 0 : helpHints.definition) ||
            ((displayOptions === null || displayOptions === void 0 ? void 0 : displayOptions.converterHint) === 'none' ? undefined : converterHint));
    }
    function determineSyncValidatorHints(validators) {
        if (!validators.length) {
            return undefined;
        }
        const syncHints = validators
            .map((validator) => typeof validator.getHint === 'function'
            ? validator.getHint()
            : undefined)
            .filter(Boolean);
        return syncHints.join('\n');
    }
    function useAssistiveText({ addBusyState, converter, displayOptions, help, helpHints, validators }) {
        var _a, _b;
        const [validatorHint, setValidatorHint] = (0, hooks_1.useState)(!validators || !validators.length ? undefined : determineSyncValidatorHints(validators));
        const staleIdentity = (0, hooks_1.useRef)();
        (0, hooks_1.useEffect)(() => {
            if (!validators || !validators.length) {
                setValidatorHint(undefined);
                return;
            }
            setValidatorHint(determineSyncValidatorHints(validators));
            const asyncHints = validators
                .map((validator) => validator.hint)
                .filter(Boolean);
            const localStaleIdentity = (staleIdentity.current = Symbol());
            const resolver = addBusyState === null || addBusyState === void 0 ? void 0 : addBusyState('resolving the async validator hints');
            Promise.allSettled(asyncHints).then((hints) => {
                setValidatorHint((currentHints) => {
                    const treatedHints = hints
                        .map((result) => (result.status === 'fulfilled' ? result.value : undefined))
                        .filter(Boolean);
                    if (localStaleIdentity !== staleIdentity.current || !treatedHints.length) {
                        return currentHints;
                    }
                    return [currentHints, ...treatedHints].join('\n');
                });
                resolver === null || resolver === void 0 ? void 0 : resolver();
            });
        }, [validators]);
        return {
            assistiveText: determineAssistiveText(help, validatorHint, helpHints, (_b = (_a = converter === null || converter === void 0 ? void 0 : converter.getHint) === null || _a === void 0 ? void 0 : _a.call(converter)) !== null && _b !== void 0 ? _b : undefined, displayOptions),
            helpSourceLink: helpHints === null || helpHints === void 0 ? void 0 : helpHints.source,
            helpSourceText: helpHints === null || helpHints === void 0 ? void 0 : helpHints.sourceText
        };
    }
    exports.useAssistiveText = useAssistiveText;
});

define('oj-c/editable-value/utils/utils',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isShallowEqual = exports.normalizeValue = exports.treatNull = exports.createMessageFromError = void 0;
    function createMessageFromError(error) {
        if (typeof error.getMessage === 'function') {
            return {
                severity: 'error',
                detail: error.getMessage().detail
            };
        }
        return { severity: 'error', detail: error.message };
    }
    exports.createMessageFromError = createMessageFromError;
    function treatNull(value, defaultValue) {
        if (value === null) {
            return defaultValue;
        }
        return value;
    }
    exports.treatNull = treatNull;
    function normalizeValue(value) {
        if (typeof value === 'string' && value === '') {
            return null;
        }
        return value;
    }
    exports.normalizeValue = normalizeValue;
    const isShallowEqual = (a, b) => a === b || (a.length === b.length && a.every((v, i) => v === b[i]));
    exports.isShallowEqual = isShallowEqual;
});

define('oj-c/editable-value/UNSAFE_useComponentMessaging/useComponentMessaging',["require", "exports", "@oracle/oraclejet-preact/hooks/UNSAFE_useUncontrolledState", "preact/hooks", "../utils/utils"], function (require, exports, UNSAFE_useUncontrolledState_1, hooks_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useComponentMessaging = void 0;
    function useComponentMessaging({ messagesCustom: messagesCustomProp = [], onMessagesCustomChanged }) {
        const [messagesCustom, setMessagesCustom] = (0, UNSAFE_useUncontrolledState_1.useUncontrolledState)(messagesCustomProp, onMessagesCustomChanged);
        const [componentMessages, setComponentMessages] = (0, hooks_1.useState)([]);
        const [deferredComponentMessages, setDeferredComponentMessages] = (0, hooks_1.useState)([]);
        const prevMessagesCustomPropRef = (0, hooks_1.useRef)(messagesCustomProp);
        const addComponentMessage = (0, hooks_1.useCallback)((...messages) => {
            setComponentMessages((prevMessages) => [...prevMessages, ...messages]);
        }, []);
        const addDeferredComponentMessage = (0, hooks_1.useCallback)((message) => {
            setComponentMessages((prevMessages) => [...prevMessages, message]);
        }, []);
        const clearAllComponentMessages = (0, hooks_1.useCallback)(() => {
            setComponentMessages([]);
            setDeferredComponentMessages([]);
        }, []);
        const clearDeferredComponentMessages = (0, hooks_1.useCallback)(() => {
            setDeferredComponentMessages([]);
        }, []);
        const clearAllMessages = (0, hooks_1.useCallback)(() => {
            setComponentMessages([]);
            setDeferredComponentMessages([]);
            setMessagesCustom([]);
        }, []);
        const hasCustomErrorMessages = (0, hooks_1.useCallback)(() => {
            return messagesCustom.some((message) => message.severity === 'error');
        }, [messagesCustom]);
        const hasNoErrorMessages = (0, hooks_1.useCallback)(() => {
            return (componentMessages.length === 0 &&
                deferredComponentMessages.length === 0 &&
                hasCustomErrorMessages() === false);
        }, [componentMessages, deferredComponentMessages, hasCustomErrorMessages]);
        const hasHiddenMessages = (0, hooks_1.useCallback)(() => {
            return deferredComponentMessages.length !== 0;
        }, [deferredComponentMessages]);
        const showHiddenMessages = (0, hooks_1.useCallback)(() => {
            setComponentMessages((prevMessages) => [...prevMessages, ...deferredComponentMessages]);
            setDeferredComponentMessages([]);
        }, [deferredComponentMessages]);
        (0, hooks_1.useEffect)(() => {
            if (prevMessagesCustomPropRef.current === messagesCustomProp) {
                return;
            }
            prevMessagesCustomPropRef.current = messagesCustomProp;
            if ((0, utils_1.isShallowEqual)(messagesCustom, messagesCustomProp)) {
                return;
            }
            setMessagesCustom(messagesCustomProp);
        }, [messagesCustom, messagesCustomProp]);
        return (0, hooks_1.useMemo)(() => ({
            componentMessages,
            deferredComponentMessages,
            messagesCustom,
            visibleMessages: [...messagesCustom, ...componentMessages],
            addComponentMessage,
            addDeferredComponentMessage,
            clearAllComponentMessages,
            clearAllMessages,
            clearDeferredComponentMessages,
            hasCustomErrorMessages,
            hasHiddenMessages,
            hasNoErrorMessages,
            setComponentMessages,
            setDeferredComponentMessages,
            showHiddenMessages
        }), [
            componentMessages,
            deferredComponentMessages,
            messagesCustom,
            hasCustomErrorMessages,
            hasHiddenMessages,
            hasNoErrorMessages,
            showHiddenMessages
        ]);
    }
    exports.useComponentMessaging = useComponentMessaging;
});

define('oj-c/editable-value/UNSAFE_useConverter/useConverter',["require", "exports", "ojs/ojconverter-nativenumber", "preact/hooks", "@oracle/oraclejet-preact/hooks/UNSAFE_useTranslationBundle", "../utils/utils"], function (require, exports, ojconverter_nativenumber_1, hooks_1, UNSAFE_useTranslationBundle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useConverter = exports.ConverterErrorSymbol = void 0;
    exports.ConverterErrorSymbol = Symbol('ConverterError');
    function shouldSkipParse(value) {
        return value === '' || value === null;
    }
    function shouldSkipFormat(value) {
        return value === null;
    }
    function useConverter({ componentMessagingState, validationState, converter }) {
        const translations = (0, UNSAFE_useTranslationBundle_1.useTranslationBundle)('@oracle/oraclejet-preact');
        const converterParseError = translations.inputNumber_converterParseError();
        const parse = (0, hooks_1.useCallback)((displayValue) => {
            if (!converter || shouldSkipParse(displayValue)) {
                return displayValue;
            }
            try {
                return converter.parse(displayValue);
            }
            catch (error) {
                const errorMsg = (error === null || error === void 0 ? void 0 : error.cause) === ojconverter_nativenumber_1.USER_INPUT_ERROR
                    ? {
                        severity: 'error',
                        detail: converterParseError
                    }
                    : (0, utils_1.createMessageFromError)(error);
                componentMessagingState.setComponentMessages([errorMsg]);
                validationState.setValid('invalidShown');
                return exports.ConverterErrorSymbol;
            }
        }, [converter, componentMessagingState, validationState]);
        const format = (0, hooks_1.useCallback)((value, shouldSuppressError = false) => {
            var _a;
            if (!converter || shouldSkipFormat(value)) {
                return (_a = (0, utils_1.treatNull)(value, '')) !== null && _a !== void 0 ? _a : '';
            }
            try {
                return converter.format(value);
            }
            catch (error) {
                if (!shouldSuppressError) {
                    componentMessagingState.setComponentMessages([(0, utils_1.createMessageFromError)(error)]);
                    validationState.setValid('invalidShown');
                }
                return (0, utils_1.treatNull)(value, '');
            }
        }, [converter, componentMessagingState, validationState]);
        return (0, hooks_1.useMemo)(() => ({
            format,
            parse
        }), [format, parse]);
    }
    exports.useConverter = useConverter;
});

define('oj-c/editable-value/UNSAFE_useConverterLifecycle/useConverterLifecycle',["require", "exports", "preact/hooks"], function (require, exports, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useConverterLifecycle = void 0;
    function useConverterLifecycle({ converter, validationState, refreshDisplayValue, runFullValidationAndUpdateValue }) {
        const prevConverterRef = (0, hooks_1.useRef)(converter);
        (0, hooks_1.useEffect)(() => {
            if (prevConverterRef.current === converter) {
                return;
            }
            prevConverterRef.current = converter;
            const { valid } = validationState;
            switch (valid) {
                case 'invalidShown':
                    runFullValidationAndUpdateValue();
                    break;
                case 'valid':
                case 'invalidHidden':
                default:
                    refreshDisplayValue();
                    break;
            }
        }, [converter, validationState, refreshDisplayValue, runFullValidationAndUpdateValue]);
    }
    exports.useConverterLifecycle = useConverterLifecycle;
});

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/editable-value/UNSAFE_useDeferredValidators/useDeferredValidators',["require", "exports", "ojs/ojvalidator-required", "preact/hooks"], function (require, exports, ojvalidator_required_1, hooks_1) {
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

define('oj-c/editable-value/UNSAFE_useStaleIdentity/useStaleIdentity',["require", "exports", "preact/hooks"], function (require, exports, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useStaleIdentity = void 0;
    function useStaleIdentity() {
        const staleIdentityMap = (0, hooks_1.useRef)(new Map());
        const setStaleIdentity = (0, hooks_1.useCallback)((id) => {
            const localStaleIdentity = Symbol();
            staleIdentityMap.current.set(id, localStaleIdentity);
            return {
                isStale: () => localStaleIdentity !== staleIdentityMap.current.get(id)
            };
        }, []);
        return { setStaleIdentity };
    }
    exports.useStaleIdentity = useStaleIdentity;
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define('oj-c/editable-value/UNSAFE_useValidators/useValidators',["require", "exports", "@oracle/oraclejet-preact/hooks/UNSAFE_useUncontrolledState", "preact/hooks", "../UNSAFE_useStaleIdentity/useStaleIdentity", "../utils/utils"], function (require, exports, UNSAFE_useUncontrolledState_1, hooks_1, useStaleIdentity_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useValidators = exports.ValidationResult = void 0;
    exports.ValidationResult = {
        VALID: 'VALID',
        INVALID: 'INVALID',
        STALE: 'STALE'
    };
    function useValidators({ componentMessagingState, defaultValidState, deferredValidators = [], validators = [], addBusyState, onValidChanged }) {
        const [valid, setValid] = (0, UNSAFE_useUncontrolledState_1.useUncontrolledState)(defaultValidState, onValidChanged);
        const { setStaleIdentity } = (0, useStaleIdentity_1.useStaleIdentity)();
        (0, hooks_1.useLayoutEffect)(() => {
            if (defaultValidState !== undefined) {
                onValidChanged === null || onValidChanged === void 0 ? void 0 : onValidChanged(defaultValidState);
            }
        }, []);
        const fullValidate = (0, hooks_1.useCallback)((value, options = {}) => __awaiter(this, void 0, void 0, function* () {
            const { addComponentMessage, clearAllComponentMessages, clearAllMessages, hasCustomErrorMessages, setComponentMessages } = componentMessagingState;
            const { doNotClearMessagesCustom = false } = options;
            const hadCustomErrorMessages = hasCustomErrorMessages();
            setValid('pending');
            if (doNotClearMessagesCustom) {
                clearAllComponentMessages();
            }
            else {
                clearAllMessages();
            }
            if (validators.length === 0 && deferredValidators.length === 0) {
                if (hadCustomErrorMessages && doNotClearMessagesCustom) {
                    setValid('invalidShown');
                }
                else {
                    setValid('valid');
                }
                return true;
            }
            const errors = [];
            const maybeErrorsPromise = [];
            for (const validator of [...deferredValidators, ...validators]) {
                try {
                    const validateResult = validator.validate(value);
                    if (validateResult instanceof Promise) {
                        maybeErrorsPromise.push(validateResult.then(() => { }, (error) => (0, utils_1.createMessageFromError)(error)));
                    }
                }
                catch (error) {
                    errors.push((0, utils_1.createMessageFromError)(error));
                }
            }
            if (!errors.length && !maybeErrorsPromise.length) {
                if (hadCustomErrorMessages && doNotClearMessagesCustom) {
                    setValid('invalidShown');
                }
                else {
                    setValid('valid');
                }
                return true;
            }
            const hasSyncError = errors.length !== 0;
            if (hasSyncError) {
                setComponentMessages(errors);
                setValid('invalidShown');
            }
            if (!maybeErrorsPromise.length) {
                return !hasSyncError;
            }
            const resolver = addBusyState === null || addBusyState === void 0 ? void 0 : addBusyState('running validation');
            const { isStale } = setStaleIdentity('useValidators-validate');
            let hasAsyncError = false;
            for (const asyncValidationResult of maybeErrorsPromise) {
                const maybeValidationError = yield asyncValidationResult;
                if (maybeValidationError && !isStale()) {
                    addComponentMessage(maybeValidationError);
                    setValid('invalidShown');
                    hasAsyncError = true;
                }
            }
            if (!hasSyncError && !hasAsyncError && !isStale()) {
                if (hadCustomErrorMessages && doNotClearMessagesCustom) {
                    setValid('invalidShown');
                }
                else {
                    setValid('valid');
                }
            }
            resolver === null || resolver === void 0 ? void 0 : resolver();
            return !hasSyncError && !hasAsyncError;
        }), [componentMessagingState, deferredValidators, validators]);
        const deferredValidate = (0, hooks_1.useCallback)((value) => {
            const errors = [];
            for (const validator of deferredValidators) {
                try {
                    validator.validate(value);
                }
                catch (error) {
                    errors.push((0, utils_1.createMessageFromError)(error));
                }
            }
            if (errors.length) {
                return errors;
            }
            return undefined;
        }, [deferredValidators]);
        const validateValueOnInternalChange = (0, hooks_1.useCallback)((value, options = {}) => __awaiter(this, void 0, void 0, function* () {
            const { isStale } = setStaleIdentity('useValidationLifeCycle-validateValueOnInternalChange');
            const resolver = addBusyState === null || addBusyState === void 0 ? void 0 : addBusyState('running validateValueOnInternalChange');
            const validationResult = yield fullValidate(value, options);
            resolver === null || resolver === void 0 ? void 0 : resolver();
            if (isStale()) {
                return exports.ValidationResult.STALE;
            }
            return validationResult ? exports.ValidationResult.VALID : exports.ValidationResult.INVALID;
        }), [addBusyState, fullValidate]);
        const validateValueOnExternalChange = (0, hooks_1.useCallback)((value) => {
            const { clearAllMessages, setDeferredComponentMessages } = componentMessagingState;
            clearAllMessages();
            const maybeErrors = deferredValidate(value);
            if (maybeErrors) {
                setDeferredComponentMessages(maybeErrors);
                setValid('invalidHidden');
            }
            else {
                setValid('valid');
            }
            return exports.ValidationResult.VALID;
        }, [componentMessagingState, deferredValidate]);
        return (0, hooks_1.useMemo)(() => ({
            valid,
            setValid,
            deferredValidate,
            fullValidate,
            validateValueOnExternalChange,
            validateValueOnInternalChange
        }), [
            valid,
            deferredValidate,
            fullValidate,
            validateValueOnExternalChange,
            validateValueOnInternalChange
        ]);
    }
    exports.useValidators = useValidators;
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define('oj-c/editable-value/UNSAFE_useValidationLifecycle/useValidationLifecycle',["require", "exports", "preact/hooks", "../UNSAFE_useConverter/useConverter", "../UNSAFE_useValidators/useValidators", "../utils/utils"], function (require, exports, hooks_1, useConverter_1, useValidators_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useValidationLifecycle = void 0;
    function useValidationLifecycle({ componentMessagingState, deferredValidators, validationState, validators, getValueForValidation, setValueAfterValidation }) {
        const prevDeferredValidatorsRef = (0, hooks_1.useRef)(deferredValidators);
        const prevValidatorsRef = (0, hooks_1.useRef)(validators);
        const prevMessagesCustomRef = (0, hooks_1.useRef)(componentMessagingState.messagesCustom);
        const runFullValidationAndUpdateValue = (0, hooks_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
            const { valid, validateValueOnInternalChange } = validationState;
            const value = getValueForValidation(valid);
            if (value === useConverter_1.ConverterErrorSymbol) {
                return;
            }
            const validationResult = yield validateValueOnInternalChange(value, {
                doNotClearMessagesCustom: true
            });
            if (validationResult === useValidators_1.ValidationResult.VALID) {
                setValueAfterValidation(value);
            }
        }), [validationState, getValueForValidation, setValueAfterValidation]);
        (0, hooks_1.useEffect)(() => {
            const value = getValueForValidation('valid');
            if (value === useConverter_1.ConverterErrorSymbol) {
                return;
            }
            const { deferredValidate, setValid } = validationState;
            const { hasCustomErrorMessages, setDeferredComponentMessages } = componentMessagingState;
            const maybeErrors = deferredValidate(value);
            if (maybeErrors) {
                setDeferredComponentMessages(maybeErrors);
                setValid('invalidHidden');
            }
            if (hasCustomErrorMessages()) {
                setValid('invalidShown');
            }
        }, []);
        (0, hooks_1.useEffect)(() => {
            if (prevDeferredValidatorsRef.current === deferredValidators) {
                return;
            }
            const { valid, deferredValidate, setValid } = validationState;
            const { clearDeferredComponentMessages, setDeferredComponentMessages } = componentMessagingState;
            prevDeferredValidatorsRef.current = deferredValidators;
            switch (valid) {
                case 'valid':
                    const value = getValueForValidation(valid);
                    if (value !== useConverter_1.ConverterErrorSymbol) {
                        const maybeErrors = deferredValidate(value);
                        if (maybeErrors) {
                            setDeferredComponentMessages(maybeErrors);
                            setValid('invalidHidden');
                        }
                    }
                    break;
                case 'invalidHidden':
                    if (deferredValidators.length === 0) {
                        setValid('valid');
                        clearDeferredComponentMessages();
                    }
                    break;
                case 'invalidShown':
                    runFullValidationAndUpdateValue();
                    break;
            }
        }, [
            deferredValidators,
            componentMessagingState,
            validationState,
            getValueForValidation,
            runFullValidationAndUpdateValue
        ]);
        (0, hooks_1.useEffect)(() => {
            if (prevValidatorsRef.current === validators) {
                return;
            }
            prevValidatorsRef.current = validators;
            switch (validationState.valid) {
                case 'invalidShown':
                    runFullValidationAndUpdateValue();
                    break;
            }
        }, [validators, validationState]);
        (0, hooks_1.useEffect)(() => {
            if ((0, utils_1.isShallowEqual)(prevMessagesCustomRef.current, componentMessagingState.messagesCustom)) {
                return;
            }
            const { messagesCustom, hasCustomErrorMessages, hasHiddenMessages, hasNoErrorMessages } = componentMessagingState;
            const { valid, setValid } = validationState;
            prevMessagesCustomRef.current = messagesCustom;
            if (hasCustomErrorMessages()) {
                setValid('invalidShown');
            }
            else if (valid === 'pending') {
                return;
            }
            else if (hasNoErrorMessages()) {
                setValid('valid');
            }
            else if (hasHiddenMessages()) {
                setValid('invalidHidden');
            }
        }, [componentMessagingState, validationState]);
        return {
            runFullValidationAndUpdateValue
        };
    }
    exports.useValidationLifecycle = useValidationLifecycle;
});

define('oj-c/editable-value/UNSAFE_useValue/useValue',["require", "exports", "@oracle/oraclejet-preact/hooks/UNSAFE_useUncontrolledState", "preact/hooks", "../utils/utils"], function (require, exports, UNSAFE_useUncontrolledState_1, hooks_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useValue = void 0;
    function useValue({ value: valueProp, format, parse, onRawValueChanged, onTransientValueChanged, onValueChanged }) {
        const [displayValue, setDisplayValue] = (0, UNSAFE_useUncontrolledState_1.useUncontrolledState)(format(valueProp, true), onRawValueChanged);
        const [value, setValue] = (0, UNSAFE_useUncontrolledState_1.useUncontrolledState)(valueProp, onValueChanged);
        (0, hooks_1.useEffect)(() => {
            if (displayValue !== undefined) {
                onRawValueChanged === null || onRawValueChanged === void 0 ? void 0 : onRawValueChanged(displayValue);
            }
        }, []);
        const [transientValue, setTransientValue] = (0, UNSAFE_useUncontrolledState_1.useUncontrolledState)(valueProp, onTransientValueChanged);
        (0, hooks_1.useEffect)(() => {
            if (valueProp !== undefined) {
                onTransientValueChanged === null || onTransientValueChanged === void 0 ? void 0 : onTransientValueChanged(valueProp);
            }
        }, []);
        return {
            displayValue,
            transientValue,
            value,
            getValueForValidation: (0, hooks_1.useCallback)((valid) => {
                if (valid !== 'invalidShown') {
                    return value;
                }
                return parse((0, utils_1.normalizeValue)(displayValue));
            }, [displayValue, value, parse]),
            setValueAfterValidation: (0, hooks_1.useCallback)((value) => {
                setValue(value);
                setDisplayValue(format(value));
            }, [format]),
            setDisplayValue,
            setTransientValue,
            setValue,
            refreshDisplayValue: (0, hooks_1.useCallback)(() => {
                setDisplayValue(format(value));
            }, [value, format])
        };
    }
    exports.useValue = useValue;
});

define('oj-c/editable-value/UNSAFE_useValueLifecycle/useValueLifecycle',["require", "exports", "preact/hooks", "../UNSAFE_useValidators/useValidators"], function (require, exports, hooks_1, useValidators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useValueLifecycle = void 0;
    function useValueLifecycle({ value, valueState, format, validateValueOnExternalChange }) {
        const previousValueRef = (0, hooks_1.useRef)(value);
        (0, hooks_1.useEffect)(() => {
            const { value, setDisplayValue } = valueState;
            setDisplayValue(format(value));
        }, []);
        (0, hooks_1.useEffect)(() => {
            if (previousValueRef.current === value) {
                return;
            }
            previousValueRef.current = value;
            if (value !== undefined && value !== valueState.value) {
                const { setDisplayValue, setValue } = valueState;
                const validationResult = validateValueOnExternalChange(value);
                if (validationResult === useValidators_1.ValidationResult.VALID) {
                    setValue(value);
                    setDisplayValue(format(value));
                }
            }
        }, [value, valueState, format]);
    }
    exports.useValueLifecycle = useValueLifecycle;
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define('oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue',["require", "exports", "preact/hooks", "../UNSAFE_useComponentMessaging/useComponentMessaging", "../UNSAFE_useConverter/useConverter", "../UNSAFE_useConverterLifecycle/useConverterLifecycle", "../UNSAFE_useDeferredValidators/useDeferredValidators", "../UNSAFE_useValidationLifecycle/useValidationLifecycle", "../UNSAFE_useValidators/useValidators", "../UNSAFE_useValue/useValue", "../UNSAFE_useValueLifecycle/useValueLifecycle", "../utils/utils"], function (require, exports, hooks_1, useComponentMessaging_1, useConverter_1, useConverterLifecycle_1, useDeferredValidators_1, useValidationLifecycle_1, useValidators_1, useValue_1, useValueLifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useEditableValue = void 0;
    function useEditableValue({ ariaDescribedBy, converter, displayOptions, implicitComponentValidator, labelHint, messagesCustom, required, requiredMessageDetail, shouldNormalizeValueOnCommit = true, validators, value: valueProp, addBusyState, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged, onTransientValueChanged, wrapValueState }) {
        const componentMessagingState = (0, useComponentMessaging_1.useComponentMessaging)({
            messagesCustom,
            onMessagesCustomChanged
        });
        const { clearAllMessages, visibleMessages } = componentMessagingState;
        const deferredValidators = (0, useDeferredValidators_1.useDeferredValidators)({
            labelHint,
            required,
            requiredMessageDetail
        });
        const combinedValidators = !implicitComponentValidator
            ? validators
            : validators
                ? [implicitComponentValidator, ...validators]
                : [implicitComponentValidator];
        const validationState = (0, useValidators_1.useValidators)({
            componentMessagingState,
            defaultValidState: 'valid',
            deferredValidators,
            validators: combinedValidators,
            addBusyState,
            onValidChanged
        });
        const { validateValueOnExternalChange, validateValueOnInternalChange } = validationState;
        const { format, parse } = (0, useConverter_1.useConverter)({
            componentMessagingState,
            converter,
            validationState
        });
        const defaultValueState = (0, useValue_1.useValue)({
            value: valueProp,
            format,
            parse,
            onRawValueChanged,
            onTransientValueChanged,
            onValueChanged
        });
        const valueState = wrapValueState ? wrapValueState(defaultValueState) : defaultValueState;
        const { displayValue, value, getValueForValidation, setValueAfterValidation, refreshDisplayValue, setDisplayValue, setTransientValue, setValue } = valueState;
        const { runFullValidationAndUpdateValue } = (0, useValidationLifecycle_1.useValidationLifecycle)({
            componentMessagingState,
            validationState,
            deferredValidators,
            validators,
            getValueForValidation,
            setValueAfterValidation
        });
        (0, useConverterLifecycle_1.useConverterLifecycle)({
            converter,
            validationState,
            refreshDisplayValue,
            runFullValidationAndUpdateValue
        });
        (0, useValueLifecycle_1.useValueLifecycle)({
            value: valueProp,
            valueState,
            format,
            validateValueOnExternalChange
        });
        const normalizeAndParseValue = (0, hooks_1.useCallback)((value) => {
            return parse(shouldNormalizeValueOnCommit ? (0, utils_1.normalizeValue)(value) : value);
        }, [shouldNormalizeValueOnCommit, parse]);
        const onCommitValue = (0, hooks_1.useCallback)((value, doCommitOnValid = true) => __awaiter(this, void 0, void 0, function* () {
            const validationResult = yield validateValueOnInternalChange(value);
            if (validationResult === useValidators_1.ValidationResult.VALID && doCommitOnValid) {
                setValue(value);
            }
            return validationResult;
        }), [validateValueOnInternalChange]);
        const onCommit = (0, hooks_1.useCallback)(({ value }) => __awaiter(this, void 0, void 0, function* () {
            const parsedValueOrSymbol = normalizeAndParseValue(value);
            if (parsedValueOrSymbol === useConverter_1.ConverterErrorSymbol) {
                return;
            }
            const parsedValue = parsedValueOrSymbol;
            const validationResult = yield onCommitValue(parsedValue);
            if (validationResult === useValidators_1.ValidationResult.VALID) {
                setDisplayValue(format(parsedValue));
            }
        }), [format, onCommitValue, normalizeAndParseValue]);
        const onInput = (0, hooks_1.useCallback)(({ value }) => {
            setDisplayValue(value !== null && value !== void 0 ? value : '');
        }, []);
        const reset = (0, hooks_1.useCallback)(() => {
            clearAllMessages();
            validateValueOnExternalChange(value);
            refreshDisplayValue();
        }, [value, clearAllMessages, refreshDisplayValue, validateValueOnExternalChange]);
        const validate = (0, hooks_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
            const { fullValidate } = validationState;
            const { displayValue, value, setValueAfterValidation } = valueState;
            const newValueOrSymbol = normalizeAndParseValue(displayValue);
            if (newValueOrSymbol === useConverter_1.ConverterErrorSymbol) {
                return 'invalid';
            }
            const newValue = newValueOrSymbol;
            const resolver = addBusyState === null || addBusyState === void 0 ? void 0 : addBusyState('running component method validate');
            const validateResult = yield fullValidate(newValue);
            resolver === null || resolver === void 0 ? void 0 : resolver();
            if (validateResult) {
                if (newValue !== value) {
                    setValueAfterValidation(newValue);
                }
                return 'valid';
            }
            return 'invalid';
        }), [validationState, valueState, addBusyState, normalizeAndParseValue]);
        const showMessages = (0, hooks_1.useCallback)(() => {
            const { hasHiddenMessages, showHiddenMessages } = componentMessagingState;
            const { setValid } = validationState;
            if (hasHiddenMessages()) {
                showHiddenMessages();
                setValid('invalidShown');
            }
        }, [componentMessagingState, validationState]);
        return {
            value,
            setValue,
            displayValue,
            setDisplayValue,
            setTransientValue,
            methods: {
                reset,
                validate,
                showMessages
            },
            textFieldProps: {
                messages: (displayOptions === null || displayOptions === void 0 ? void 0 : displayOptions.messages) !== 'none' ? visibleMessages : undefined,
                value: displayValue,
                ariaDescribedBy,
                onCommit,
                onInput
            },
            onCommitValue,
            format,
            normalizeAndParseValue
        };
    }
    exports.useEditableValue = useEditableValue;
});

define('oj-c/input-number/useImplicitNumberConverter',["require", "exports", "ojs/ojconverter-nativenumber", "preact/hooks"], function (require, exports, ojconverter_nativenumber_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useImplicitNumberConverter = void 0;
    function useImplicitNumberConverter({ converter }) {
        const implicitConverter = (0, hooks_1.useMemo)(() => {
            return converter !== null && converter !== void 0 ? converter : new ojconverter_nativenumber_1.NumberConverter();
        }, [converter]);
        return implicitConverter;
    }
    exports.useImplicitNumberConverter = useImplicitNumberConverter;
});

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/input-number/useImplicitNumberRangeValidator',["require", "exports", "preact/hooks", "ojs/ojvalidator-numberrange"], function (require, exports, hooks_1, ojvalidator_numberrange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useImplicitNumberRangeValidator = void 0;
    ojvalidator_numberrange_1 = __importDefault(ojvalidator_numberrange_1);
    function useImplicitNumberRangeValidator({ converter, max, min, numberRangeExactMessageDetail, numberRangeOverflowMessageDetail, numberRangeUnderflowMessageDetail }) {
        const numberRangeValidator = (0, hooks_1.useMemo)(() => {
            if (min !== undefined || max !== undefined) {
                return new ojvalidator_numberrange_1.default({
                    converter,
                    max,
                    min,
                    messageDetail: {
                        exact: numberRangeExactMessageDetail,
                        rangeOverflow: numberRangeOverflowMessageDetail,
                        rangeUnderflow: numberRangeUnderflowMessageDetail
                    }
                });
            }
            return null;
        }, [converter, min, max]);
        return numberRangeValidator;
    }
    exports.useImplicitNumberRangeValidator = useImplicitNumberRangeValidator;
});

define('oj-c/input-number/stepBasisUtils',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.determineSteppedValue = void 0;
    function determineSteppedValue(step, stepOpt, currentParsedValue, initialValue, maxOpt, minOpt) {
        const precision = _precision(stepOpt, initialValue, minOpt);
        if (precision > 0) {
            const power = Math.pow(10, precision);
            const minOptPower = minOpt !== undefined ? Math.round(minOpt * power) : minOpt;
            const maxOptPower = maxOpt != null ? Math.round(maxOpt * power) : maxOpt;
            const stepOptPower = Math.round(stepOpt * power);
            const adjustValuePower = _adjustValueForZeroPrecision(Math.round(step * power), stepOptPower, Math.round(currentParsedValue * power), initialValue !== undefined && initialValue !== null
                ? Math.round(initialValue * power)
                : initialValue, maxOptPower, minOptPower);
            return adjustValuePower / power;
        }
        return _adjustValueForZeroPrecision(step, stepOpt, currentParsedValue, initialValue, maxOpt, minOpt);
    }
    exports.determineSteppedValue = determineSteppedValue;
    function _adjustValueForZeroPrecision(step, stepOpt, currentParsedValue, initialValue, maxOpt, minOpt) {
        let stepBase = minOpt != null ? minOpt : initialValue;
        if (stepBase === null || stepBase === undefined) {
            stepBase = 0;
        }
        try {
            currentParsedValue = parseFloat(currentParsedValue.toFixed(0));
        }
        catch (e) {
            if (e instanceof TypeError) {
                currentParsedValue = +currentParsedValue;
            }
        }
        let aboveMin = currentParsedValue - stepBase;
        let rounded = Math.round(aboveMin / stepOpt) * stepOpt;
        rounded = parseFloat(rounded.toFixed(0));
        const multiple = rounded === aboveMin;
        let newValue;
        if (!multiple) {
            if (step < 0) {
                aboveMin = Math.ceil(aboveMin / stepOpt) * stepOpt;
            }
            else {
                aboveMin = Math.floor(aboveMin / stepOpt) * stepOpt;
            }
            newValue = stepBase + aboveMin + step;
        }
        else {
            newValue = currentParsedValue + step;
        }
        newValue = parseFloat(newValue.toFixed(0));
        if (minOpt != null && newValue < minOpt) {
            return minOpt;
        }
        if (maxOpt != null && newValue > maxOpt) {
            let validMax = Math.floor((maxOpt - stepBase) / stepOpt) * stepOpt + stepBase;
            validMax = parseFloat(validMax.toFixed(0));
            return validMax;
        }
        return newValue;
    }
    function _precision(stepOpt, initialValue, minOpt) {
        let precision = _precisionOf(stepOpt);
        if (minOpt != null) {
            precision = Math.max(precision, _precisionOf(minOpt));
        }
        if (initialValue != null) {
            precision = Math.max(precision, _precisionOf(initialValue));
        }
        return precision;
    }
    function _precisionOf(num) {
        const str = num.toString();
        const decimal = str.indexOf('.');
        return decimal === -1 ? 0 : str.length - decimal - 1;
    }
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
define('oj-c/input-number/useNumberInputTextPreact',["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue", "oj-c/editable-value/UNSAFE_useValidators/useValidators", "./useImplicitNumberConverter", "./useImplicitNumberRangeValidator", "preact/hooks", "oj-c/editable-value/utils/utils", "./stepBasisUtils"], function (require, exports, useEditableValue_1, useValidators_1, useImplicitNumberConverter_1, useImplicitNumberRangeValidator_1, hooks_1, utils_1, stepBasisUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useNumberInputTextPreact = void 0;
    function useNumberInputTextPreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, converter: propConverter, disabled, displayOptions, inputPrefix, inputSuffix, labelEdge, labelHint, labelStartWidth, max, messagesCustom, min, numberRangeExactMessageDetail, numberRangeOverflowMessageDetail, numberRangeUnderflowMessageDetail, placeholder, readonly, required, requiredMessageDetail, step, textAlign, userAssistanceDensity, validators, value: propValue, virtualKeyboard, onMessagesCustomChanged, onRawValueChanged, onTransientValueChanged, onValidChanged, onValueChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "converter", "disabled", "displayOptions", "inputPrefix", "inputSuffix", "labelEdge", "labelHint", "labelStartWidth", "max", "messagesCustom", "min", "numberRangeExactMessageDetail", "numberRangeOverflowMessageDetail", "numberRangeUnderflowMessageDetail", "placeholder", "readonly", "required", "requiredMessageDetail", "step", "textAlign", "userAssistanceDensity", "validators", "value", "virtualKeyboard", "onMessagesCustomChanged", "onRawValueChanged", "onTransientValueChanged", "onValidChanged", "onValueChanged"]);
        const minTreatNull = (0, utils_1.treatNull)(min);
        const maxTreatNull = (0, utils_1.treatNull)(max);
        const converter = (0, useImplicitNumberConverter_1.useImplicitNumberConverter)({
            converter: propConverter
        });
        const implicitComponentValidator = (0, useImplicitNumberRangeValidator_1.useImplicitNumberRangeValidator)({
            converter,
            max: maxTreatNull,
            min: minTreatNull,
            numberRangeExactMessageDetail,
            numberRangeOverflowMessageDetail,
            numberRangeUnderflowMessageDetail
        });
        const { onCommitValue, format, normalizeAndParseValue, methods, textFieldProps, value, setValue, displayValue, setDisplayValue, setTransientValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            converter,
            displayOptions,
            implicitComponentValidator,
            messagesCustom,
            required,
            requiredMessageDetail,
            validators,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onRawValueChanged,
            onTransientValueChanged,
            onValidChanged,
            onValueChanged
        });
        const hasMin = minTreatNull !== undefined;
        const hasMax = maxTreatNull !== undefined;
        const initialValue = (0, hooks_1.useRef)((0, utils_1.treatNull)(propValue));
        if (propValue !== value) {
            initialValue.current = (0, utils_1.treatNull)(propValue);
        }
        const [valueNow, setValueNow] = (0, hooks_1.useState)((0, utils_1.treatNull)(value) || undefined);
        (0, hooks_1.useEffect)(() => {
            setValueNow((0, utils_1.treatNull)(value));
            setTransientValue(value);
        }, [value]);
        const [valueText, setValueText] = (0, hooks_1.useState)(displayValue || undefined);
        (0, hooks_1.useEffect)(() => {
            if (value === null) {
                setValueText(undefined);
            }
            else {
                const formattedValue = format(value);
                setValueText(formattedValue);
            }
        }, [value, converter]);
        const onCommit = (0, hooks_1.useCallback)(({ value }) => __awaiter(this, void 0, void 0, function* () {
            const parsedValueOrSymbol = normalizeAndParseValue(value);
            const parsedValue = parsedValueOrSymbol;
            if (typeof parsedValueOrSymbol === 'symbol') {
                setValueNow(undefined);
                setValueText(value);
                return;
            }
            const validationResult = yield onCommitValue(parsedValue);
            if (validationResult === useValidators_1.ValidationResult.VALID) {
                const formattedValue = format(parsedValue);
                setDisplayValue(formattedValue);
            }
            else {
                setValueNow(parsedValue);
                setValueText(value);
            }
        }), [format, normalizeAndParseValue, onCommitValue]);
        const textFieldPropsWithOverride = Object.assign(Object.assign({}, textFieldProps), { onCommit });
        const doStep = (0, hooks_1.useCallback)((direction, doCommit) => __awaiter(this, void 0, void 0, function* () {
            if (step === undefined) {
                return;
            }
            const displayValueToStep = displayValue || '0';
            const parsedValueOrSymbol = normalizeAndParseValue(displayValueToStep);
            if (typeof parsedValueOrSymbol === 'symbol') {
                return;
            }
            const parsedValue = parsedValueOrSymbol;
            let newSteppedValue;
            if (direction !== undefined) {
                const stepValue = direction === 'increase' ? step : -1 * step;
                newSteppedValue = (0, stepBasisUtils_1.determineSteppedValue)(stepValue, step, parsedValue, initialValue.current, maxTreatNull, minTreatNull);
            }
            else {
                newSteppedValue = parsedValue;
            }
            const validationResult = yield onCommitValue(newSteppedValue, doCommit);
            if (validationResult === useValidators_1.ValidationResult.VALID) {
                setTransientValue(newSteppedValue);
            }
            const formattedValue = format(newSteppedValue);
            setDisplayValue(formattedValue);
            setValueText(formattedValue);
            setValueNow(newSteppedValue);
        }), [value, displayValue, format, normalizeAndParseValue, onCommitValue]);
        const handleStep = (0, hooks_1.useCallback)(({ direction }) => __awaiter(this, void 0, void 0, function* () {
            const doCommit = true;
            doStep(direction, doCommit);
        }), [doStep]);
        const handleSpin = (0, hooks_1.useCallback)(({ direction }) => __awaiter(this, void 0, void 0, function* () {
            const doCommit = false;
            doStep(direction, doCommit);
        }), [doStep]);
        const handleSpinComplete = (0, hooks_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
            const doCommit = true;
            doStep(undefined, doCommit);
        }), [displayValue, normalizeAndParseValue, onCommitValue]);
        return {
            value,
            setValue,
            methods,
            inputNumberProps: Object.assign({ ariaValueMax: maxTreatNull, ariaValueMin: minTreatNull, ariaValueNow: valueNow !== null && valueNow !== void 0 ? valueNow : undefined, ariaValueText: valueText !== '' ? valueText : undefined, autoComplete: autocomplete, autoFocus: autofocus, hasSteppers: step !== undefined && step > 0, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && (0, utils_1.treatNull)(value) === undefined, label: labelHint, labelEdge,
                labelStartWidth, onSpin: step ? handleSpin : undefined, onSpinComplete: step ? handleSpinComplete : undefined, onStep: step ? handleStep : undefined, placeholder, prefix: inputPrefix, suffix: inputSuffix, isStepDownDisabled: disabled ||
                    (hasMin &&
                        ((valueNow !== undefined && valueNow <= minTreatNull) ||
                            (displayValue === '' && minTreatNull === 0))), isStepUpDisabled: disabled ||
                    (hasMax &&
                        ((valueNow !== undefined && valueNow >= maxTreatNull) ||
                            (displayValue === '' && maxTreatNull === 0))), textAlign,
                userAssistanceDensity,
                virtualKeyboard }, textFieldPropsWithOverride)
        };
    }
    exports.useNumberInputTextPreact = useNumberInputTextPreact;
});


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/input-number/input-number',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/hooks/UNSAFE_useFormContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormVariantContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "@oracle/oraclejet-preact/UNSAFE_NumberInputText", "oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText", "ojs/ojcontext", "ojs/ojvcomponent", "ojs/ojvcomponent-binding", "preact", "preact/compat", "preact/hooks", "./useNumberInputTextPreact", "css!oj-c/input-number/input-number-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_useFormContext_1, UNSAFE_useFormVariantContext_1, UNSAFE_useTabbableMode_1, UNSAFE_NumberInputText_1, useAssistiveText_1, ojcontext_1, ojvcomponent_1, ojvcomponent_binding_1, preact_1, compat_1, hooks_1, useNumberInputTextPreact_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputNumber = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    const FunctionalInputNumber = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, converter, displayOptions, help, helpHints, validators } = props;
        const inputNumberRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-input-number id=${props.id} is ${desc}`
            });
        }, []);
        const { inputNumberProps, methods } = (0, useNumberInputTextPreact_1.useNumberInputTextPreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = inputNumberRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = inputNumberRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            converter,
            displayOptions,
            help,
            helpHints,
            validators
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_NumberInputText_1.NumberInputText, Object.assign({ ref: inputNumberRef }, assistiveTextProps, inputNumberProps, { variant: variant })));
    });
    let InputNumber = class InputNumber extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.busyContextRef = (0, preact_1.createRef)();
            this.inputNumberRef = (0, preact_1.createRef)();
            this.rootRef = (0, preact_1.createRef)();
        }
        componentDidMount() {
            this.busyContextRef.current = ojcontext_1.default.getContext(this.rootRef.current).getBusyContext();
        }
        render(props) {
            const containerProps = {
                isFormLayout: props.containerReadonly !== undefined,
                isReadonly: props.containerReadonly,
                labelWrapping: props.labelWrapping
            };
            if (props.step !== undefined && props.step < 0) {
                throw new Error('step must be a positive number');
            }
            if (props.min != null && props.max != null && props.max < props.min) {
                throw new Error('max cannot be less than min');
            }
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: props.id, ref: this.rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useFormContext_1.FormContext.Provider, Object.assign({ value: containerProps }, { children: (0, jsx_runtime_1.jsx)(FunctionalInputNumber, Object.assign({ busyContextRef: this.busyContextRef, ref: this.inputNumberRef }, props)) })) })));
        }
        componentWillUnmount() {
            this.busyContextRef.current = null;
        }
        reset() {
            var _a;
            (_a = this.inputNumberRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        }
        showMessages() {
            var _a;
            (_a = this.inputNumberRef.current) === null || _a === void 0 ? void 0 : _a.showMessages();
        }
        validate() {
            var _a;
            return (_a = this.inputNumberRef.current) === null || _a === void 0 ? void 0 : _a.validate();
        }
        blur() {
            var _a;
            (_a = this.inputNumberRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.inputNumberRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    InputNumber.defaultProps = {
        autocomplete: 'on',
        converter: null,
        disabled: false,
        displayOptions: {
            converterHint: 'display',
            messages: 'display',
            validatorHint: 'display'
        },
        help: {
            instruction: ''
        },
        helpHints: {
            definition: '',
            source: '',
            sourceText: undefined
        },
        messagesCustom: [],
        readonly: false,
        required: false,
        userAssistanceDensity: 'reflow',
        validators: [],
        value: null,
        virtualKeyboard: 'auto'
    };
    InputNumber._metadata = { "properties": { "autocomplete": { "type": "string" }, "containerReadonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "converter": { "type": "object|null" }, "disabled": { "type": "boolean" }, "displayOptions": { "type": "object", "properties": { "converterHint": { "type": "string", "enumValues": ["display", "none"] }, "messages": { "type": "string", "enumValues": ["display", "none"] }, "validatorHint": { "type": "string", "enumValues": ["display", "none"] } } }, "help": { "type": "object", "properties": { "instruction": { "type": "string" } } }, "helpHints": { "type": "object", "properties": { "definition": { "type": "string" }, "source": { "type": "string" }, "sourceText": { "type": "string" } } }, "inputPrefix": { "type": "string" }, "inputSuffix": { "type": "string" }, "labelEdge": { "type": "string", "enumValues": ["start", "none", "top", "inside"], "binding": { "consume": { "name": "containerLabelEdge" } } }, "labelHint": { "type": "string" }, "labelStartWidth": { "type": "string", "binding": { "consume": { "name": "labelWidth" } } }, "labelWrapping": { "type": "string", "enumValues": ["wrap", "truncate"], "binding": { "consume": { "name": "labelWrapping" } } }, "max": { "type": "number|null" }, "min": { "type": "number|null" }, "messagesCustom": { "type": "Array<object>", "writeback": true }, "numberRangeExactMessageDetail": { "type": "string" }, "numberRangeOverflowMessageDetail": { "type": "string" }, "numberRangeUnderflowMessageDetail": { "type": "string" }, "placeholder": { "type": "string" }, "readonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "required": { "type": "boolean" }, "requiredMessageDetail": { "type": "string" }, "step": { "type": "number" }, "textAlign": { "type": "string", "enumValues": ["start", "right", "end"] }, "userAssistanceDensity": { "type": "string", "enumValues": ["reflow", "efficient"], "binding": { "consume": { "name": "containerUserAssistanceDensity" } } }, "validators": { "type": "Array<object>|null" }, "value": { "type": "number|null", "writeback": true }, "virtualKeyboard": { "type": "string", "enumValues": ["number", "text", "auto"] }, "rawValue": { "type": "string", "readOnly": true, "writeback": true }, "transientValue": { "type": "number", "readOnly": true, "writeback": true }, "valid": { "type": "string", "enumValues": ["valid", "pending", "invalidHidden", "invalidShown"], "readOnly": true, "writeback": true } }, "extension": { "_WRITEBACK_PROPS": ["messagesCustom", "rawValue", "transientValue", "valid", "value"], "_READ_ONLY_PROPS": ["rawValue", "transientValue", "valid"], "_OBSERVED_GLOBAL_PROPS": ["aria-describedby", "autofocus", "id"] }, "methods": { "reset": {}, "showMessages": {}, "validate": {}, "blur": {}, "focus": {} } };
    InputNumber._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    InputNumber._consumedContexts = [UNSAFE_useFormVariantContext_1.FormVariantContext, UNSAFE_useTabbableMode_1.TabbableModeContext];
    InputNumber = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-input-number')
    ], InputNumber);
    exports.InputNumber = InputNumber;
});

define('oj-c/input-number',["require", "exports", "./input-number/input-number"], function (require, exports, input_number_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputNumber = void 0;
    Object.defineProperty(exports, "InputNumber", { enumerable: true, get: function () { return input_number_1.InputNumber; } });
});

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
define('oj-c/input-password/useInputPasswordPreact',["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue"], function (require, exports, useEditableValue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useInputPasswordPreact = void 0;
    function useInputPasswordPreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, clearIcon = 'never', disabled, displayOptions, labelEdge, labelHint, labelStartWidth, maskIcon, messagesCustom, placeholder, readonly, required, requiredMessageDetail, textAlign, userAssistanceDensity, validators, value: propValue, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "clearIcon", "disabled", "displayOptions", "labelEdge", "labelHint", "labelStartWidth", "maskIcon", "messagesCustom", "placeholder", "readonly", "required", "requiredMessageDetail", "textAlign", "userAssistanceDensity", "validators", "value", "onMessagesCustomChanged", "onRawValueChanged", "onValidChanged", "onValueChanged"]);
        const { methods, textFieldProps, value, setValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            displayOptions,
            messagesCustom,
            required,
            requiredMessageDetail,
            validators,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onRawValueChanged,
            onValidChanged,
            onValueChanged
        });
        const hasNoValue = value === null || (typeof value === 'string' && value === '');
        const hasClearIcon = clearIcon === 'conditional' ? 'conditionally' : clearIcon;
        const hasRevealToggle = maskIcon === 'hidden' ? 'never' : 'always';
        return {
            value,
            setValue,
            methods,
            inputPasswordProps: Object.assign({ autoComplete: autocomplete, autoFocus: autofocus, hasClearIcon: hasClearIcon, hasRevealToggle, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && hasNoValue, label: labelHint, labelEdge: labelEdge, labelStartWidth,
                placeholder,
                textAlign,
                userAssistanceDensity }, textFieldProps)
        };
    }
    exports.useInputPasswordPreact = useInputPasswordPreact;
});


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/input-password/input-password',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/hooks/UNSAFE_useFormContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormVariantContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "@oracle/oraclejet-preact/UNSAFE_InputPassword", "oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText", "ojs/ojcontext", "ojs/ojvcomponent", "ojs/ojvcomponent-binding", "preact", "preact/compat", "preact/hooks", "./useInputPasswordPreact", "css!oj-c/input-password/input-password-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_useFormContext_1, UNSAFE_useFormVariantContext_1, UNSAFE_useTabbableMode_1, UNSAFE_InputPassword_1, useAssistiveText_1, ojcontext_1, ojvcomponent_1, ojvcomponent_binding_1, preact_1, compat_1, hooks_1, useInputPasswordPreact_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputPassword = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    const FunctionalInputPassword = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, displayOptions, help, helpHints, validators } = props;
        const inputPasswordRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-input-password id=${props.id} is ${desc}`
            });
        }, [props.id]);
        const { inputPasswordProps, methods } = (0, useInputPasswordPreact_1.useInputPasswordPreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            displayOptions,
            help,
            helpHints,
            validators
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_InputPassword_1.InputPassword, Object.assign({ ref: inputPasswordRef }, assistiveTextProps, inputPasswordProps, { variant: variant })));
    });
    let InputPassword = class InputPassword extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.busyContextRef = (0, preact_1.createRef)();
            this.inputPasswordRef = (0, preact_1.createRef)();
            this.rootRef = (0, preact_1.createRef)();
        }
        componentDidMount() {
            this.busyContextRef.current = ojcontext_1.default.getContext(this.rootRef.current).getBusyContext();
        }
        render(props) {
            const containerProps = {
                isFormLayout: props.containerReadonly !== undefined,
                isReadonly: props.containerReadonly,
                labelWrapping: props.labelWrapping
            };
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: props.id, ref: this.rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useFormContext_1.FormContext.Provider, Object.assign({ value: containerProps }, { children: (0, jsx_runtime_1.jsx)(FunctionalInputPassword, Object.assign({ busyContextRef: this.busyContextRef, ref: this.inputPasswordRef }, props)) })) })));
        }
        componentWillUnmount() {
            this.busyContextRef.current = null;
        }
        reset() {
            var _a;
            (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        }
        showMessages() {
            var _a;
            (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.showMessages();
        }
        validate() {
            var _a;
            return (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.validate();
        }
        blur() {
            var _a;
            (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    InputPassword.defaultProps = {
        autocomplete: 'on',
        clearIcon: 'never',
        maskIcon: 'visible',
        disabled: false,
        displayOptions: {
            converterHint: 'display',
            messages: 'display',
            validatorHint: 'display'
        },
        help: {
            instruction: ''
        },
        helpHints: {
            definition: '',
            source: '',
            sourceText: undefined
        },
        messagesCustom: [],
        readonly: false,
        required: false,
        userAssistanceDensity: 'reflow',
        validators: [],
        value: null
    };
    InputPassword._metadata = { "properties": { "autocomplete": { "type": "string" }, "clearIcon": { "type": "string", "enumValues": ["always", "never", "conditional"] }, "containerReadonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "disabled": { "type": "boolean" }, "displayOptions": { "type": "object", "properties": { "converterHint": { "type": "string", "enumValues": ["display", "none"] }, "messages": { "type": "string", "enumValues": ["display", "none"] }, "validatorHint": { "type": "string", "enumValues": ["display", "none"] } } }, "help": { "type": "object", "properties": { "instruction": { "type": "string" } } }, "helpHints": { "type": "object", "properties": { "definition": { "type": "string" }, "source": { "type": "string" }, "sourceText": { "type": "string" } } }, "labelEdge": { "type": "string", "enumValues": ["start", "none", "top", "inside"], "binding": { "consume": { "name": "containerLabelEdge" } } }, "labelHint": { "type": "string" }, "labelStartWidth": { "type": "string", "binding": { "consume": { "name": "labelWidth" } } }, "labelWrapping": { "type": "string", "enumValues": ["wrap", "truncate"], "binding": { "consume": { "name": "labelWrapping" } } }, "maskIcon": { "type": "string", "enumValues": ["hidden", "visible"] }, "messagesCustom": { "type": "Array<object>", "writeback": true }, "placeholder": { "type": "string" }, "readonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "required": { "type": "boolean" }, "requiredMessageDetail": { "type": "string" }, "textAlign": { "type": "string", "enumValues": ["start", "right", "end"] }, "userAssistanceDensity": { "type": "string", "enumValues": ["reflow", "efficient"], "binding": { "consume": { "name": "containerUserAssistanceDensity" } } }, "validators": { "type": "Array<object>|null" }, "value": { "type": "string|null", "writeback": true }, "rawValue": { "type": "string", "readOnly": true, "writeback": true }, "valid": { "type": "string", "enumValues": ["valid", "pending", "invalidHidden", "invalidShown"], "readOnly": true, "writeback": true } }, "extension": { "_WRITEBACK_PROPS": ["messagesCustom", "rawValue", "valid", "value"], "_READ_ONLY_PROPS": ["rawValue", "valid"], "_OBSERVED_GLOBAL_PROPS": ["aria-describedby", "autofocus", "id"] }, "methods": { "reset": {}, "showMessages": {}, "validate": {}, "blur": {}, "focus": {} } };
    InputPassword._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    InputPassword._consumedContexts = [UNSAFE_useFormVariantContext_1.FormVariantContext, UNSAFE_useTabbableMode_1.TabbableModeContext];
    InputPassword = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-input-password')
    ], InputPassword);
    exports.InputPassword = InputPassword;
});

define('oj-c/input-password',["require", "exports", "./input-password/input-password"], function (require, exports, input_password_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputPassword = void 0;
    Object.defineProperty(exports, "InputPassword", { enumerable: true, get: function () { return input_password_1.InputPassword; } });
});

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
define('oj-c/input-text/useInputTextPreact',["require", "exports", "oj-c/editable-value/utils/utils", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue"], function (require, exports, utils_1, useEditableValue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useInputTextPreact = void 0;
    function useInputTextPreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, clearIcon = 'never', converter, disabled, displayOptions, end, inputPrefix, inputSuffix, labelEdge, labelHint, labelStartWidth, length, messagesCustom, placeholder, readonly, required, requiredMessageDetail, start, textAlign, userAssistanceDensity, validators, value: propValue, virtualKeyboard, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "clearIcon", "converter", "disabled", "displayOptions", "end", "inputPrefix", "inputSuffix", "labelEdge", "labelHint", "labelStartWidth", "length", "messagesCustom", "placeholder", "readonly", "required", "requiredMessageDetail", "start", "textAlign", "userAssistanceDensity", "validators", "value", "virtualKeyboard", "onMessagesCustomChanged", "onRawValueChanged", "onValidChanged", "onValueChanged"]);
        const { methods, textFieldProps, value, setValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            converter,
            displayOptions,
            messagesCustom,
            required,
            requiredMessageDetail,
            validators,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onRawValueChanged,
            onValidChanged,
            onValueChanged
        });
        const hasNoValue = value === null || (typeof value === 'string' && value === '');
        const hasClearIcon = clearIcon === 'conditional' ? 'conditionally' : clearIcon;
        return {
            value,
            setValue,
            methods,
            inputTextProps: Object.assign({ autoComplete: autocomplete, autoFocus: autofocus, hasClearIcon, endContent: end, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && hasNoValue, label: labelHint, labelEdge,
                labelStartWidth, maxLength: (0, utils_1.treatNull)(length === null || length === void 0 ? void 0 : length.max), maxLengthUnit: length === null || length === void 0 ? void 0 : length.countBy, placeholder, prefix: inputPrefix, startContent: start, suffix: inputSuffix, textAlign,
                userAssistanceDensity,
                virtualKeyboard }, textFieldProps)
        };
    }
    exports.useInputTextPreact = useInputTextPreact;
});


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/input-text/input-text',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/hooks/UNSAFE_useFormContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormVariantContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "@oracle/oraclejet-preact/UNSAFE_InputText", "oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText", "ojs/ojcontext", "ojs/ojvcomponent", "ojs/ojvcomponent-binding", "preact", "preact/compat", "preact/hooks", "./useInputTextPreact", "css!oj-c/input-text/input-text-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_useFormContext_1, UNSAFE_useFormVariantContext_1, UNSAFE_useTabbableMode_1, UNSAFE_InputText_1, useAssistiveText_1, ojcontext_1, ojvcomponent_1, ojvcomponent_binding_1, preact_1, compat_1, hooks_1, useInputTextPreact_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputText = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    const FunctionalInputText = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, converter, displayOptions, help, helpHints, validators } = props;
        const inputTextRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-input-text id=${props.id} is ${desc}`
            });
        }, []);
        const { inputTextProps, methods } = (0, useInputTextPreact_1.useInputTextPreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = inputTextRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = inputTextRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            converter,
            displayOptions,
            help,
            helpHints,
            validators
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_InputText_1.InputText, Object.assign({ ref: inputTextRef }, assistiveTextProps, inputTextProps, { variant: variant })));
    });
    let InputText = class InputText extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.busyContextRef = (0, preact_1.createRef)();
            this.inputTextRef = (0, preact_1.createRef)();
            this.rootRef = (0, preact_1.createRef)();
        }
        componentDidMount() {
            this.busyContextRef.current = ojcontext_1.default.getContext(this.rootRef.current).getBusyContext();
        }
        render(props) {
            const containerProps = {
                isFormLayout: props.containerReadonly !== undefined,
                isReadonly: props.containerReadonly,
                labelWrapping: props.labelWrapping
            };
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: props.id, ref: this.rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useFormContext_1.FormContext.Provider, Object.assign({ value: containerProps }, { children: (0, jsx_runtime_1.jsx)(FunctionalInputText, Object.assign({ busyContextRef: this.busyContextRef, ref: this.inputTextRef }, props)) })) })));
        }
        componentWillUnmount() {
            this.busyContextRef.current = null;
        }
        reset() {
            var _a;
            (_a = this.inputTextRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        }
        showMessages() {
            var _a;
            (_a = this.inputTextRef.current) === null || _a === void 0 ? void 0 : _a.showMessages();
        }
        validate() {
            var _a;
            return (_a = this.inputTextRef.current) === null || _a === void 0 ? void 0 : _a.validate();
        }
        blur() {
            var _a;
            (_a = this.inputTextRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.inputTextRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    InputText.defaultProps = {
        autocomplete: 'on',
        clearIcon: 'never',
        converter: null,
        disabled: false,
        displayOptions: {
            converterHint: 'display',
            messages: 'display',
            validatorHint: 'display'
        },
        help: {
            instruction: ''
        },
        helpHints: {
            definition: '',
            source: '',
            sourceText: undefined
        },
        length: {
            countBy: 'codePoint',
            max: null
        },
        messagesCustom: [],
        readonly: false,
        required: false,
        userAssistanceDensity: 'reflow',
        validators: [],
        value: null,
        virtualKeyboard: 'auto'
    };
    InputText._metadata = { "properties": { "autocomplete": { "type": "string" }, "clearIcon": { "type": "string", "enumValues": ["always", "never", "conditional"] }, "containerReadonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "converter": { "type": "object|null" }, "disabled": { "type": "boolean" }, "displayOptions": { "type": "object", "properties": { "converterHint": { "type": "string", "enumValues": ["display", "none"] }, "messages": { "type": "string", "enumValues": ["display", "none"] }, "validatorHint": { "type": "string", "enumValues": ["display", "none"] } } }, "help": { "type": "object", "properties": { "instruction": { "type": "string" } } }, "helpHints": { "type": "object", "properties": { "definition": { "type": "string" }, "source": { "type": "string" }, "sourceText": { "type": "string" } } }, "inputPrefix": { "type": "string" }, "inputSuffix": { "type": "string" }, "labelEdge": { "type": "string", "enumValues": ["start", "none", "top", "inside"], "binding": { "consume": { "name": "containerLabelEdge" } } }, "labelHint": { "type": "string" }, "labelStartWidth": { "type": "string", "binding": { "consume": { "name": "labelWidth" } } }, "labelWrapping": { "type": "string", "enumValues": ["wrap", "truncate"], "binding": { "consume": { "name": "labelWrapping" } } }, "length": { "type": "object", "properties": { "countBy": { "type": "string", "enumValues": ["codePoint", "codeUnit"] }, "max": { "type": "number|null" } } }, "messagesCustom": { "type": "Array<object>", "writeback": true }, "placeholder": { "type": "string" }, "readonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "required": { "type": "boolean" }, "requiredMessageDetail": { "type": "string" }, "textAlign": { "type": "string", "enumValues": ["start", "right", "end"] }, "userAssistanceDensity": { "type": "string", "enumValues": ["reflow", "efficient"], "binding": { "consume": { "name": "containerUserAssistanceDensity" } } }, "validators": { "type": "Array<object>|null" }, "value": { "type": "any", "writeback": true }, "virtualKeyboard": { "type": "string", "enumValues": ["number", "text", "auto", "search", "email", "tel", "url"] }, "rawValue": { "type": "string", "readOnly": true, "writeback": true }, "valid": { "type": "string", "enumValues": ["valid", "pending", "invalidHidden", "invalidShown"], "readOnly": true, "writeback": true } }, "slots": { "end": {}, "start": {} }, "extension": { "_WRITEBACK_PROPS": ["messagesCustom", "rawValue", "valid", "value"], "_READ_ONLY_PROPS": ["rawValue", "valid"], "_OBSERVED_GLOBAL_PROPS": ["aria-describedby", "autofocus", "id"] }, "methods": { "reset": {}, "showMessages": {}, "validate": {}, "blur": {}, "focus": {} } };
    InputText._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    InputText._consumedContexts = [UNSAFE_useFormVariantContext_1.FormVariantContext, UNSAFE_useTabbableMode_1.TabbableModeContext];
    InputText = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-input-text')
    ], InputText);
    exports.InputText = InputText;
});

define('oj-c/input-text',["require", "exports", "./input-text/input-text"], function (require, exports, input_text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputText = void 0;
    Object.defineProperty(exports, "InputText", { enumerable: true, get: function () { return input_text_1.InputText; } });
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define('oj-c/hooks/UNSAFE_useDataProvider/utils',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUpdatedItemsFromMutationDetail = void 0;
    function getUpdatedItemsFromMutationDetail(detail, currentData, dataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { add, remove, update } = detail !== null && detail !== void 0 ? detail : {};
            const keyIndexMap = new Map();
            for (const [index, item] of currentData.entries()) {
                keyIndexMap.set(item.key, index);
            }
            let mutatedData = [...currentData];
            if (remove) {
                mutatedData = removeItemsFromDetail(remove, mutatedData, keyIndexMap);
            }
            if (add) {
                mutatedData = yield addItemsFromDetail(add, mutatedData, keyIndexMap, dataProvider);
            }
            if (update) {
                mutatedData = yield updateItemsFromDetail(update, mutatedData, keyIndexMap, dataProvider);
            }
            return mutatedData;
        });
    }
    exports.getUpdatedItemsFromMutationDetail = getUpdatedItemsFromMutationDetail;
    function addItemsAtEnd(itemsToAdd, itemMetadataToAdd, items) {
        const indices = new Array(itemsToAdd.length).fill(-1);
        return addItemsAtIndices(indices, itemsToAdd, itemMetadataToAdd, items);
    }
    function addItemsAtIndices(indices, itemsToAdd, itemMetadataToAdd, items) {
        const returnItems = [...items];
        indices.forEach((addAtIndex, index) => {
            var _a;
            const addItem = {
                data: itemsToAdd[index],
                key: (_a = itemMetadataToAdd[index]) === null || _a === void 0 ? void 0 : _a.key,
                metadata: itemMetadataToAdd[index]
            };
            if (addAtIndex >= 0) {
                returnItems.splice(addAtIndex, 0, addItem);
            }
            else {
                returnItems.push(addItem);
            }
        });
        return returnItems;
    }
    function addItemsBeforeKeys(beforeKeys, itemsToAdd, items, keyIndexMap) {
        const addIndices = [];
        const itemMetadataToAdd = [];
        beforeKeys.forEach((key) => {
            addIndices.push(getIndexByKey(keyIndexMap, key));
            itemMetadataToAdd.push({ key });
        });
        return addItemsAtIndices(addIndices, itemsToAdd, itemMetadataToAdd, items);
    }
    function addItemsFromDetail(detail, items, keyIndexMap, dataProvider) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { addBeforeKeys, data, indexes, keys, metadata } = detail;
            let mutatedData = [...items];
            let treatedData = data || [];
            let treatedMetaData = metadata || [];
            if (treatedData.length === 0 && (keys === null || keys === void 0 ? void 0 : keys.size)) {
                const fetchResults = (_a = (yield fetchDataByKeys(dataProvider, keys))) !== null && _a !== void 0 ? _a : [];
                treatedData = fetchResults.map((itemContext) => itemContext.data);
                treatedMetaData = fetchResults.map((itemContext) => itemContext.metadata);
            }
            if (treatedMetaData.length === 0 && (keys === null || keys === void 0 ? void 0 : keys.size)) {
                treatedMetaData = [...keys].map((key) => ({ key }));
            }
            if (treatedData.length) {
                if (indexes === null || indexes === void 0 ? void 0 : indexes.length) {
                    mutatedData = addItemsAtIndices(indexes, treatedData, treatedMetaData, mutatedData);
                }
                else if (addBeforeKeys === null || addBeforeKeys === void 0 ? void 0 : addBeforeKeys.length) {
                    mutatedData = addItemsBeforeKeys(addBeforeKeys, treatedData, mutatedData, keyIndexMap);
                }
                else {
                    mutatedData = addItemsAtEnd(treatedData, treatedMetaData, mutatedData);
                }
            }
            return mutatedData;
        });
    }
    function fetchDataByKeys(dataProvider, keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchedData = [];
            const results = (yield dataProvider.fetchByKeys({ keys })).results;
            for (const key of keys) {
                if (results.has(key)) {
                    const result = results.get(key);
                    fetchedData.push(Object.assign(Object.assign({}, result), { key }));
                }
            }
            return fetchedData;
        });
    }
    function getIndexByKey(keyIndexMap, key) {
        if (keyIndexMap.has(key)) {
            return keyIndexMap.get(key);
        }
        return -1;
    }
    function removeItemsAtIndices(indices, items) {
        const returnItems = [...items];
        indices.sort((a, b) => b - a);
        indices.forEach((index) => {
            if (index < returnItems.length) {
                returnItems.splice(index, 1);
            }
        });
        return returnItems;
    }
    function removeItemsAtKeys(keys, items, keyIndexMap) {
        const indicesToRemove = [];
        keys.forEach((key) => {
            const index = getIndexByKey(keyIndexMap, key);
            if (index !== -1) {
                indicesToRemove.push(index);
            }
        });
        return removeItemsAtIndices(indicesToRemove, items);
    }
    function removeItemsFromDetail(detail, items, keyIndexMap) {
        const { indexes, keys } = detail;
        let mutatedData = [...items];
        if (indexes === null || indexes === void 0 ? void 0 : indexes.length) {
            mutatedData = removeItemsAtIndices(indexes, mutatedData);
        }
        else if (keys === null || keys === void 0 ? void 0 : keys.size) {
            mutatedData = removeItemsAtKeys(keys, mutatedData, keyIndexMap);
        }
        return mutatedData;
    }
    function updateItemsAtIndices(indices, itemsToUpdate, itemMetadataToUpdate, items) {
        const returnItems = [...items];
        indices.forEach((updateAtIndex, index) => {
            var _a;
            if (returnItems[updateAtIndex]) {
                const addItem = {
                    data: itemsToUpdate[index],
                    key: (_a = itemMetadataToUpdate[index]) === null || _a === void 0 ? void 0 : _a.key,
                    metadata: itemMetadataToUpdate[index]
                };
                returnItems.splice(updateAtIndex, 1, addItem);
            }
        });
        return returnItems;
    }
    function updateItemsAtKeys(keys, itemsToUpdate, itemMetadataToUpdate, items, keyIndexMap) {
        const returnItems = [...items];
        keys.forEach((key) => {
            var _a;
            const index = getIndexByKey(keyIndexMap, key);
            const addItem = {
                data: itemsToUpdate[index],
                key: (_a = itemMetadataToUpdate[index]) === null || _a === void 0 ? void 0 : _a.key,
                metadata: itemMetadataToUpdate[index]
            };
            if (index >= 0) {
                returnItems.splice(index, 1, addItem);
            }
        });
        return returnItems;
    }
    function updateItemsFromDetail(detail, items, keyIndexMap, dataProvider) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { data, indexes, keys, metadata } = detail;
            let mutatedData = [...items];
            let treatedData = data || [];
            let treatedMetaData = metadata || [];
            if (treatedData.length === 0 && (keys === null || keys === void 0 ? void 0 : keys.size)) {
                const fetchResults = (_a = (yield fetchDataByKeys(dataProvider, keys))) !== null && _a !== void 0 ? _a : [];
                treatedData = fetchResults.map((itemContext) => itemContext.data);
                treatedMetaData = fetchResults.map((itemContext) => itemContext.metadata);
            }
            if (treatedMetaData.length === 0 && (keys === null || keys === void 0 ? void 0 : keys.size)) {
                treatedMetaData = [...keys].map((key) => ({ key }));
            }
            if (treatedData.length) {
                if (indexes === null || indexes === void 0 ? void 0 : indexes.length) {
                    mutatedData = updateItemsAtIndices(indexes, treatedData, treatedMetaData, mutatedData);
                }
                else if (keys === null || keys === void 0 ? void 0 : keys.size) {
                    mutatedData = updateItemsAtKeys(keys, treatedData, treatedMetaData, mutatedData, keyIndexMap);
                }
            }
            return mutatedData;
        });
    }
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
define('oj-c/hooks/UNSAFE_useDataProvider/DataProviderHandler',["require", "exports", "./utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataProviderHandler = void 0;
    class DataProviderHandler {
        constructor(dataProvider, addBusyState, callback) {
            this.handleMutateEvent = (event) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { detail } = event;
                const resolver = this.addBusyState('updating data from mutation event');
                const updatedData = yield (0, utils_1.getUpdatedItemsFromMutationDetail)(detail, this.currentData, this.dataProvider);
                resolver === null || resolver === void 0 ? void 0 : resolver();
                this.currentData = updatedData;
                (_b = (_a = this.callback) === null || _a === void 0 ? void 0 : _a.onDataUpdated) === null || _b === void 0 ? void 0 : _b.call(_a, updatedData);
            });
            this.handleRefreshEvent = () => {
                this._fetchDataAndNotify();
            };
            this.addBusyState = addBusyState;
            this.callback = callback;
            this.dataProvider = dataProvider;
            this.currentData = [];
            dataProvider.addEventListener('refresh', this.handleRefreshEvent);
            dataProvider.addEventListener('mutate', this.handleMutateEvent);
            this._fetchDataAndNotify();
        }
        destroy() {
            this.callback = undefined;
            this.currentData = [];
            this.dataProvider.removeEventListener('refresh', this.handleRefreshEvent);
            this.dataProvider.removeEventListener('mutate', this.handleMutateEvent);
        }
        _fetchData() {
            var e_1, _a;
            return __awaiter(this, void 0, void 0, function* () {
                const fetchedData = [];
                const asyncIterable = this.dataProvider.fetchFirst({ size: -1 });
                try {
                    for (var asyncIterable_1 = __asyncValues(asyncIterable), asyncIterable_1_1; asyncIterable_1_1 = yield asyncIterable_1.next(), !asyncIterable_1_1.done;) {
                        const results = asyncIterable_1_1.value;
                        const contextArray = results.data.map((item, index) => {
                            return {
                                data: item,
                                key: results.metadata[index].key,
                                metadata: results.metadata[index]
                            };
                        });
                        fetchedData.push(...contextArray);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return)) yield _a.call(asyncIterable_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                this.currentData = fetchedData.slice();
                return fetchedData;
            });
        }
        _fetchDataAndNotify() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                const resolver = this.addBusyState('fetching data');
                const fetchedData = yield this._fetchData();
                (_b = (_a = this.callback) === null || _a === void 0 ? void 0 : _a.onDataUpdated) === null || _b === void 0 ? void 0 : _b.call(_a, fetchedData);
                resolver();
            });
        }
    }
    exports.DataProviderHandler = DataProviderHandler;
});

define('oj-c/hooks/UNSAFE_useDataProvider/useDataProvider',["require", "exports", "preact/hooks", "./DataProviderHandler"], function (require, exports, hooks_1, DataProviderHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useDataProvider = void 0;
    function useDataProvider({ addBusyState, data }) {
        const [fetchedData, setFetchedData] = (0, hooks_1.useState)([]);
        const dataProviderHandler = (0, hooks_1.useRef)();
        (0, hooks_1.useEffect)(() => {
            if (data !== undefined) {
                dataProviderHandler.current = new DataProviderHandler_1.DataProviderHandler(data, addBusyState, {
                    onDataUpdated: setFetchedData
                });
            }
            return () => {
                var _a;
                (_a = dataProviderHandler.current) === null || _a === void 0 ? void 0 : _a.destroy();
                dataProviderHandler.current = undefined;
            };
        }, [data, addBusyState]);
        return {
            data: fetchedData
        };
    }
    exports.useDataProvider = useDataProvider;
});


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/message-toast/message-toast',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/hooks/UNSAFE_useMessagesContext", "@oracle/oraclejet-preact/UNSAFE_MessageToast", "oj-c/hooks/UNSAFE_useDataProvider/useDataProvider", "ojs/ojcontext", "ojs/ojvcomponent", "preact/hooks", "css!./message-toast-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_useMessagesContext_1, UNSAFE_MessageToast_1, useDataProvider_1, ojcontext_1, ojvcomponent_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageToast = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    exports.MessageToast = (0, ojvcomponent_1.registerCustomElement)('oj-c-message-toast', ({ data, detailTemplateValue, iconTemplateValue, messageTemplates, offset = 0, position = 'bottom', onOjClose }) => {
        const initialRender = (0, hooks_1.useRef)(true);
        const rootRef = (0, hooks_1.useRef)();
        const [dpKey, setDpKey] = (0, hooks_1.useState)(Symbol());
        const addBusyState = (0, hooks_1.useCallback)((description = 'MessageToast: busyState') => {
            return rootRef.current
                ? ojcontext_1.default.getContext(rootRef.current).getBusyContext().addBusyState({ description })
                : () => { };
        }, []);
        (0, hooks_1.useEffect)(() => {
            if (initialRender.current) {
                initialRender.current = false;
                return;
            }
            setDpKey(Symbol());
        }, [data]);
        const { data: dataArr } = (0, useDataProvider_1.useDataProvider)({
            data,
            addBusyState
        });
        const messagesContext = (0, hooks_1.useMemo)(() => ({ addBusyState }), []);
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ ref: rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useMessagesContext_1.MessagesContext.Provider, Object.assign({ value: messagesContext }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_MessageToast_1.MessageToast, { data: dataArr, detailRendererKey: detailTemplateValue, iconRendererKey: iconTemplateValue, offset: offset, onClose: onOjClose, position: position, renderers: messageTemplates }, dpKey) })) })));
    }, "MessageToast", { "properties": { "data": { "type": "object" }, "detailTemplateValue": { "type": "string|function" }, "iconTemplateValue": { "type": "string|function" }, "offset": { "type": "number|object" }, "position": { "type": "string", "enumValues": ["bottom", "top", "top-start", "top-end", "bottom-start", "bottom-end", "top-left", "top-right", "bottom-left", "bottom-right"] } }, "extension": { "_DYNAMIC_SLOT": { "prop": "messageTemplates", "isTemplate": 1 } }, "events": { "ojClose": {} } }, { "offset": 0, "position": "bottom" }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    });
});

define('oj-c/message-toast',["require", "exports", "./message-toast/message-toast"], function (require, exports, message_toast_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageToast = void 0;
    Object.defineProperty(exports, "MessageToast", { enumerable: true, get: function () { return message_toast_1.MessageToast; } });
});

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
define('oj-c/text-area/useTextAreaAutosizePreact',["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue"], function (require, exports, useEditableValue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useTextAreaAutosizePreact = void 0;
    function useTextAreaAutosizePreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, converter, disabled, displayOptions, labelEdge, labelHint, labelStartWidth, length, maxRows, messagesCustom, placeholder, readonly, required, requiredMessageDetail, resizeBehavior, rows, textAlign, userAssistanceDensity, validators, value: propValue, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "converter", "disabled", "displayOptions", "labelEdge", "labelHint", "labelStartWidth", "length", "maxRows", "messagesCustom", "placeholder", "readonly", "required", "requiredMessageDetail", "resizeBehavior", "rows", "textAlign", "userAssistanceDensity", "validators", "value", "onMessagesCustomChanged", "onRawValueChanged", "onValidChanged", "onValueChanged"]);
        const { methods, textFieldProps, value, setValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            converter,
            displayOptions,
            messagesCustom,
            required,
            requiredMessageDetail,
            validators,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onRawValueChanged,
            onValidChanged,
            onValueChanged
        });
        const hasNoValue = value === null || (typeof value === 'string' && value === '');
        return {
            value,
            setValue,
            methods,
            textAreaProps: Object.assign({ autoComplete: autocomplete, autoFocus: autofocus, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && hasNoValue, label: labelHint, labelEdge,
                labelStartWidth, maxLength: (length === null || length === void 0 ? void 0 : length.max) ? length.max : undefined, maxLengthCounter: length === null || length === void 0 ? void 0 : length.counter, maxLengthUnit: length === null || length === void 0 ? void 0 : length.countBy, maxRows: maxRows === -1 ? undefined : maxRows, minRows: rows, placeholder, resize: resizeBehavior, textAlign,
                userAssistanceDensity }, textFieldProps)
        };
    }
    exports.useTextAreaAutosizePreact = useTextAreaAutosizePreact;
});

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
define('oj-c/text-area/useTextAreaPreact',["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue"], function (require, exports, useEditableValue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useTextAreaPreact = void 0;
    function useTextAreaPreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, converter, disabled, displayOptions, labelEdge, labelHint, labelStartWidth, length, messagesCustom, placeholder, readonly, required, requiredMessageDetail, resizeBehavior, rows, textAlign, userAssistanceDensity, validators, value: propValue, onMessagesCustomChanged, onRawValueChanged, onValueChanged, onValidChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "converter", "disabled", "displayOptions", "labelEdge", "labelHint", "labelStartWidth", "length", "messagesCustom", "placeholder", "readonly", "required", "requiredMessageDetail", "resizeBehavior", "rows", "textAlign", "userAssistanceDensity", "validators", "value", "onMessagesCustomChanged", "onRawValueChanged", "onValueChanged", "onValidChanged"]);
        const { methods, textFieldProps, value, setValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            converter,
            displayOptions,
            messagesCustom,
            required,
            requiredMessageDetail,
            validators,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onRawValueChanged,
            onValidChanged,
            onValueChanged
        });
        const hasNoValue = value === null || (typeof value === 'string' && value === '');
        return {
            value,
            setValue,
            methods,
            textAreaProps: Object.assign({ autoComplete: autocomplete, autoFocus: autofocus, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && hasNoValue, label: labelHint, labelEdge,
                labelStartWidth, maxLength: (length === null || length === void 0 ? void 0 : length.max) ? length.max : undefined, maxLengthUnit: length === null || length === void 0 ? void 0 : length.countBy, maxLengthCounter: length === null || length === void 0 ? void 0 : length.counter, resize: resizeBehavior != 'none' ? resizeBehavior : undefined, rows,
                placeholder,
                textAlign,
                userAssistanceDensity }, textFieldProps)
        };
    }
    exports.useTextAreaPreact = useTextAreaPreact;
});


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/text-area/text-area',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/hooks/UNSAFE_useFormContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormVariantContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "@oracle/oraclejet-preact/UNSAFE_TextArea", "@oracle/oraclejet-preact/UNSAFE_TextAreaAutosize", "oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText", "ojs/ojcontext", "ojs/ojvcomponent", "ojs/ojvcomponent-binding", "preact", "preact/compat", "preact/hooks", "./useTextAreaAutosizePreact", "./useTextAreaPreact", "css!oj-c/text-area/text-area-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_useFormContext_1, UNSAFE_useFormVariantContext_1, UNSAFE_useTabbableMode_1, UNSAFE_TextArea_1, UNSAFE_TextAreaAutosize_1, useAssistiveText_1, ojcontext_1, ojvcomponent_1, ojvcomponent_binding_1, preact_1, compat_1, hooks_1, useTextAreaAutosizePreact_1, useTextAreaPreact_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextArea = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    const FunctionalTextArea = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, converter, displayOptions, help, helpHints, validators } = props;
        const textAreaRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-text-area id=${props.id} is ${desc}`
            });
        }, []);
        const { textAreaProps, methods } = (0, useTextAreaPreact_1.useTextAreaPreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = textAreaRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = textAreaRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            converter,
            displayOptions,
            help,
            helpHints,
            validators
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_TextArea_1.TextArea, Object.assign({ ref: textAreaRef }, assistiveTextProps, textAreaProps, { variant: variant })));
    });
    const FunctionalTextAreaAutosize = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, converter, help, helpHints, validators } = props;
        const textAreaAutosizeRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-text-area id=${props.id} is ${desc}`
            });
        }, []);
        const { textAreaProps, methods } = (0, useTextAreaAutosizePreact_1.useTextAreaAutosizePreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = textAreaAutosizeRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = textAreaAutosizeRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            converter,
            help,
            helpHints,
            validators
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_TextAreaAutosize_1.TextAreaAutosize, Object.assign({ ref: textAreaAutosizeRef }, assistiveTextProps, textAreaProps, { variant: variant })));
    });
    let TextArea = class TextArea extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.busyContextRef = (0, preact_1.createRef)();
            this.textAreaRef = (0, preact_1.createRef)();
            this.rootRef = (0, preact_1.createRef)();
        }
        componentDidMount() {
            this.busyContextRef.current = ojcontext_1.default.getContext(this.rootRef.current).getBusyContext();
        }
        render(props) {
            const containerProps = {
                isFormLayout: props.containerReadonly !== undefined,
                isReadonly: props.containerReadonly,
                labelWrapping: props.labelWrapping
            };
            const FunctionalComp = props.maxRows ? FunctionalTextAreaAutosize : FunctionalTextArea;
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: props.id, ref: this.rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useFormContext_1.FormContext.Provider, Object.assign({ value: containerProps }, { children: (0, jsx_runtime_1.jsx)(FunctionalComp, Object.assign({ busyContextRef: this.busyContextRef, ref: this.textAreaRef }, props)) })) })));
        }
        componentWillUnmount() {
            this.busyContextRef.current = null;
        }
        reset() {
            var _a;
            (_a = this.textAreaRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        }
        showMessages() {
            var _a;
            (_a = this.textAreaRef.current) === null || _a === void 0 ? void 0 : _a.showMessages();
        }
        validate() {
            var _a;
            return (_a = this.textAreaRef.current) === null || _a === void 0 ? void 0 : _a.validate();
        }
        blur() {
            var _a;
            (_a = this.textAreaRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.textAreaRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    TextArea.defaultProps = {
        autocomplete: 'on',
        converter: null,
        disabled: false,
        displayOptions: {
            converterHint: 'display',
            messages: 'display',
            validatorHint: 'display'
        },
        help: {
            instruction: ''
        },
        helpHints: {
            definition: '',
            source: '',
            sourceText: undefined
        },
        length: {
            countBy: 'codePoint',
            max: null
        },
        messagesCustom: [],
        readonly: false,
        required: false,
        resizeBehavior: 'none',
        userAssistanceDensity: 'reflow',
        validators: [],
        value: null
    };
    TextArea._metadata = { "properties": { "autocomplete": { "type": "string" }, "containerReadonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "converter": { "type": "object|null" }, "disabled": { "type": "boolean" }, "displayOptions": { "type": "object", "properties": { "converterHint": { "type": "string", "enumValues": ["display", "none"] }, "messages": { "type": "string", "enumValues": ["display", "none"] }, "validatorHint": { "type": "string", "enumValues": ["display", "none"] } } }, "help": { "type": "object", "properties": { "instruction": { "type": "string" } } }, "helpHints": { "type": "object", "properties": { "definition": { "type": "string" }, "source": { "type": "string" }, "sourceText": { "type": "string" } } }, "labelEdge": { "type": "string", "enumValues": ["start", "none", "top", "inside"], "binding": { "consume": { "name": "containerLabelEdge" } } }, "labelHint": { "type": "string" }, "labelStartWidth": { "type": "string", "binding": { "consume": { "name": "labelWidth" } } }, "labelWrapping": { "type": "string", "enumValues": ["wrap", "truncate"], "binding": { "consume": { "name": "labelWrapping" } } }, "length": { "type": "object", "properties": { "countBy": { "type": "string", "enumValues": ["codePoint", "codeUnit"] }, "counter": { "type": "string", "enumValues": ["none", "remaining"] }, "max": { "type": "number|null" } } }, "maxRows": { "type": "number" }, "messagesCustom": { "type": "Array<object>", "writeback": true }, "placeholder": { "type": "string" }, "readonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "required": { "type": "boolean" }, "requiredMessageDetail": { "type": "string" }, "resizeBehavior": { "type": "string", "enumValues": ["none", "vertical", "horizontal", "both"] }, "rows": { "type": "number" }, "textAlign": { "type": "string", "enumValues": ["start", "right", "end"] }, "userAssistanceDensity": { "type": "string", "enumValues": ["reflow", "efficient"], "binding": { "consume": { "name": "containerUserAssistanceDensity" } } }, "validators": { "type": "Array<object>|null" }, "value": { "type": "any", "writeback": true }, "rawValue": { "type": "string", "readOnly": true, "writeback": true }, "valid": { "type": "string", "enumValues": ["valid", "pending", "invalidHidden", "invalidShown"], "readOnly": true, "writeback": true } }, "extension": { "_WRITEBACK_PROPS": ["messagesCustom", "rawValue", "valid", "value"], "_READ_ONLY_PROPS": ["rawValue", "valid"], "_OBSERVED_GLOBAL_PROPS": ["aria-describedby", "autofocus", "id"] }, "methods": { "reset": {}, "showMessages": {}, "validate": {}, "blur": {}, "focus": {} } };
    TextArea._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    TextArea._consumedContexts = [UNSAFE_useFormVariantContext_1.FormVariantContext, UNSAFE_useTabbableMode_1.TabbableModeContext];
    TextArea = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-text-area')
    ], TextArea);
    exports.TextArea = TextArea;
});

define('oj-c/text-area',["require", "exports", "./text-area/text-area"], function (require, exports, text_area_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextArea = void 0;
    Object.defineProperty(exports, "TextArea", { enumerable: true, get: function () { return text_area_1.TextArea; } });
});


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
define('oj-c/progress-bar/progress-bar',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_ProgressBar", "ojs/ojvcomponent", "css!oj-c/progress-bar/progress-bar-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_ProgressBar_1, ojvcomponent_1) {
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

define('oj-c/progress-bar',["require", "exports", "./progress-bar/progress-bar"], function (require, exports, progress_bar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressBar = void 0;
    Object.defineProperty(exports, "ProgressBar", { enumerable: true, get: function () { return progress_bar_1.ProgressBar; } });
});


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
define('oj-c/progress-circle/progress-circle',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_ProgressCircle", "ojs/ojvcomponent", "css!oj-c/progress-circle/progress-circle-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_ProgressCircle_1, ojvcomponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressCircle = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    exports.ProgressCircle = (0, ojvcomponent_1.registerCustomElement)('oj-c-progress-circle', (_a) => {
        var { max = 100, value = 0, size = 'md' } = _a, otherProps = __rest(_a, ["max", "value", "size"]);
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(UNSAFE_ProgressCircle_1.ProgressCircle, { value: value === -1 ? 'indeterminate' : value, max: max, size: size, accessibleLabel: otherProps['aria-valuetext'] }) }));
    }, "ProgressCircle", { "properties": { "max": { "type": "number" }, "value": { "type": "number" }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["aria-valuetext"] } }, { "max": 100, "value": 0, "size": "md" }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    });
});

define('oj-c/progress-circle',["require", "exports", "./progress-circle/progress-circle"], function (require, exports, progress_circle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressCircle = void 0;
    Object.defineProperty(exports, "ProgressCircle", { enumerable: true, get: function () { return progress_circle_1.ProgressCircle; } });
});


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
define('oj-c/avatar/avatar',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_Avatar", "ojs/ojvcomponent", "css!oj-c/avatar/avatar-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_Avatar_1, ojvcomponent_1) {
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

define('oj-c/avatar',["require", "exports", "./avatar/avatar"], function (require, exports, avatar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Avatar = void 0;
    Object.defineProperty(exports, "Avatar", { enumerable: true, get: function () { return avatar_1.Avatar; } });
});


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
define('oj-c/button/button',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_Button", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "preact", "preact/hooks", "preact/compat", "ojs/ojvcomponent", "css!oj-c/button/button-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_Button_1, UNSAFE_useTabbableMode_1, preact_1, hooks_1, compat_1, ojvcomponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Button = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    const FunctionalButton = (0, compat_1.forwardRef)((props, ref) => {
        const buttonRef = (0, hooks_1.useRef)();
        (0, hooks_1.useImperativeHandle)(ref, () => ({
            focus: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus(); },
            blur: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }
        }), []);
        return (0, jsx_runtime_1.jsx)(UNSAFE_Button_1.Button, Object.assign({ ref: buttonRef }, props));
    });
    let Button = class Button extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.buttonRef = (0, preact_1.createRef)();
        }
        render(props) {
            const widthSize = { width: props.edge === 'bottom' ? '100%' : props.width };
            const _a = Object.assign({}, props), { chroming: variant, disabled: isDisabled, onOjAction: onAction, 'aria-label': accessibleLabel, width: throwAwayWidth } = _a, otherProps = __rest(_a, ["chroming", "disabled", "onOjAction", 'aria-label', "width"]);
            return props.width || props.edge !== 'none' ? ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ style: widthSize }, { children: (0, jsx_runtime_1.jsx)(FunctionalButton, Object.assign({ ref: this.buttonRef, variant: variant, isDisabled: isDisabled, width: '100%', onAction: onAction, accessibleLabel: accessibleLabel }, otherProps)) }))) : ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(FunctionalButton, Object.assign({ ref: this.buttonRef, variant: variant, isDisabled: isDisabled, width: '100%', onAction: onAction, accessibleLabel: accessibleLabel }, otherProps)) }));
        }
        blur() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    Button.defaultProps = {
        chroming: 'outlined',
        disabled: false,
        size: 'md',
        display: 'all',
        endIcon: null,
        startIcon: null,
        edge: 'none'
    };
    Button._metadata = { "properties": { "label": { "type": "string" }, "disabled": { "type": "boolean" }, "width": { "type": "number|string" }, "display": { "type": "string", "enumValues": ["label", "icons", "all"] }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] }, "edge": { "type": "string", "enumValues": ["none", "bottom"] }, "chroming": { "type": "string", "enumValues": ["borderless", "outlined", "solid", "callToAction", "danger"] } }, "slots": { "startIcon": {}, "endIcon": {} }, "events": { "ojAction": { "bubbles": true } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["title", "aria-label"] }, "methods": { "blur": {}, "focus": {} } };
    Button._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    Button._consumedContexts = [UNSAFE_useTabbableMode_1.TabbableModeContext];
    Button = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-button')
    ], Button);
    exports.Button = Button;
});

define('oj-c/button',["require", "exports", "./button/button"], function (require, exports, button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Button = void 0;
    Object.defineProperty(exports, "Button", { enumerable: true, get: function () { return button_1.Button; } });
});


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
define('oj-c/rating-gauge/rating-gauge',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_RatingGauge", "ojs/ojvcomponent", "preact/hooks", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "css!oj-c/rating-gauge/rating-gauge-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_RatingGauge_1, ojvcomponent_1, hooks_1, UNSAFE_useTabbableMode_1) {
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

define('oj-c/rating-gauge',["require", "exports", "./rating-gauge/rating-gauge"], function (require, exports, rating_gauge_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RatingGauge = void 0;
    Object.defineProperty(exports, "RatingGauge", { enumerable: true, get: function () { return rating_gauge_1.RatingGauge; } });
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define('oj-c/hooks/UNSAFE_useListData/useListData',["require", "exports", "ojs/ojdataproviderfactory", "preact/hooks"], function (require, exports, ojdataproviderfactory_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useListData = void 0;
    const initialState = Object.freeze({
        status: 'loading',
        data: null
    });
    const defaultOptions = {
        isInitialFetchDeferred: false
    };
    const DEFAULT_FETCH_SIZE = 25;
    const useListData = (data, options = defaultOptions) => {
        const fetchNextRef = (0, hooks_1.useRef)(null);
        const totalSizeRef = (0, hooks_1.useRef)(0);
        const isDoneRef = (0, hooks_1.useRef)(false);
        const iteratorRef = (0, hooks_1.useRef)(null);
        const fetchSize = options.fetchSize && options.fetchSize > 0 ? options.fetchSize : DEFAULT_FETCH_SIZE;
        if (!data) {
            const emptyListState = getEmptyState('exact');
            return [emptyListState, (_) => Promise.resolve()];
        }
        const dataProvider = (0, hooks_1.useMemo)(() => wrapData(data), [data]);
        const [state, dispatch] = (0, hooks_1.useReducer)(reducer, initialState);
        const fetchRange = (0, hooks_1.useCallback)((range) => __awaiter(void 0, void 0, void 0, function* () {
            const fetchOptions = {
                attributes: options.attributes,
                sortCriteria: options.sortCriteria,
                filterCriterion: options.filterCriterion,
                offset: range.offset,
                size: range.count
            };
            try {
                const result = yield dataProvider.fetchByOffset(fetchOptions);
                const results = result['results'];
                const sizePrecision = isDoneRef.current === true ? 'exact' : 'atLeast';
                dispatch({
                    status: 'success',
                    data: {
                        offset: range.offset,
                        data: results,
                        totalSize: totalSizeRef.current,
                        sizePrecision: sizePrecision
                    }
                });
            }
            catch (error) {
                dispatch({
                    status: 'error',
                    error: error
                });
            }
        }), [dataProvider, options.attributes, options.filterCriterion, options.sortCriteria]);
        const loadInitial = (0, hooks_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
            dispatch({ status: 'loading', data: null });
            const iterator = dataProvider
                .fetchFirst({
                attributes: options.attributes,
                sortCriteria: options.sortCriteria,
                filterCriterion: options.filterCriterion,
                size: fetchSize
            })[Symbol.asyncIterator]();
            iteratorRef.current = iterator;
            try {
                const result = yield iterator.next();
                totalSizeRef.current = result.value.data.length;
                if (result.done !== undefined) {
                    isDoneRef.current = result.done;
                }
                const initialFetchSize = options.initialRowsFetched && options.initialRowsFetched > 0
                    ? options.initialRowsFetched
                    : fetchSize;
                fetchRange({ offset: 0, count: Math.min(totalSizeRef.current, initialFetchSize) });
            }
            catch (error) {
                dispatch({
                    status: 'error',
                    error: error
                });
                iteratorRef.current = null;
            }
        }), [
            dataProvider,
            fetchRange,
            options.attributes,
            options.filterCriterion,
            options.sortCriteria,
            options.fetchSize
        ]);
        const loadRange = (0, hooks_1.useCallback)((range) => __awaiter(void 0, void 0, void 0, function* () {
            if (iteratorRef.current === null) {
                loadInitial();
            }
            else {
                const endIndex = range.offset + range.count;
                if (endIndex > totalSizeRef.current) {
                    if (fetchNextRef.current == null) {
                        const promise = fetchNextUntilThresholdOrDone(iteratorRef, totalSizeRef.current, endIndex);
                        fetchNextRef.current = promise;
                        try {
                            const value = yield promise;
                            if (value.done !== undefined) {
                                isDoneRef.current = value.done;
                            }
                            const total = value.total;
                            if (total > 0) {
                                totalSizeRef.current = total;
                                fetchRange({
                                    offset: range.offset,
                                    count: Math.min(totalSizeRef.current - range.offset, range.count)
                                });
                            }
                            fetchNextRef.current = null;
                        }
                        catch (error) {
                            dispatch({
                                status: 'error',
                                error: error
                            });
                            fetchNextRef.current = null;
                        }
                    }
                }
                else {
                    fetchRange(range);
                }
            }
        }), [state, loadInitial, fetchRange]);
        const resetAndLoad = (0, hooks_1.useCallback)(() => {
            iteratorRef.current = null;
            fetchNextRef.current = null;
            totalSizeRef.current = 0;
            isDoneRef.current = false;
            if (options.initialRowsFetched === 0) {
                dispatch(getEmptyState('atLeast'));
            }
            else if (!options.isInitialFetchDeferred) {
                loadInitial();
            }
            else {
                dispatch({ status: 'loading', data: null });
            }
        }, [loadInitial, options.isInitialFetchDeferred, options.initialRowsFetched]);
        (0, hooks_1.useEffect)(() => {
            resetAndLoad();
        }, [resetAndLoad]);
        const handleMutation = (0, hooks_1.useCallback)((event) => {
            if (state.status === 'success' && state.data) {
                const dataState = state.data;
                let shouldUpdate = false;
                if (event.detail.add) {
                    const itemsInserted = handleAddRemoveMutation(event.detail.add, dataState, options, true);
                    totalSizeRef.current = totalSizeRef.current + itemsInserted;
                    shouldUpdate = itemsInserted > 0 || dataState.sizePrecision === 'exact';
                    if (itemsInserted === 0) {
                        isDoneRef.current = false;
                    }
                }
                if (event.detail.remove) {
                    const itemsRemoved = handleAddRemoveMutation(event.detail.remove, dataState, options, false);
                    totalSizeRef.current = totalSizeRef.current - itemsRemoved;
                    shouldUpdate = shouldUpdate || itemsRemoved > 0;
                }
                if (event.detail.update) {
                    shouldUpdate =
                        shouldUpdate || handleUpdateMutation(event.detail.update, dataState, options);
                }
                if (shouldUpdate) {
                    fetchRange({ offset: dataState.offset, count: dataState.data.length });
                }
            }
        }, [state, options, fetchRange]);
        const handleRefresh = (0, hooks_1.useCallback)((event) => {
            var _a;
            let adjustment = -1;
            const disregardAfterKey = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.disregardAfterKey;
            if (disregardAfterKey && state.status === 'success') {
                const index = state.data.data.findIndex((value) => {
                    return value.metadata.key === disregardAfterKey;
                });
                if (index > -1) {
                    adjustment = state.data.data.length - index - 1;
                }
                if (adjustment === 0 && state.data.data.length >= fetchSize) {
                    return;
                }
            }
            if (adjustment > -1 && state.status === 'success') {
                totalSizeRef.current = totalSizeRef.current - adjustment;
                loadRange({
                    offset: state.data.offset,
                    count: Math.max(state.data.data.length, fetchSize)
                });
            }
            else {
                resetAndLoad();
            }
        }, [state, resetAndLoad]);
        (0, hooks_1.useEffect)(() => {
            dataProvider.addEventListener('refresh', handleRefresh);
            dataProvider.addEventListener('mutate', handleMutation);
            return () => {
                dataProvider.removeEventListener('refresh', handleRefresh);
                dataProvider.removeEventListener('mutate', handleMutation);
            };
        }, [dataProvider, resetAndLoad, handleMutation]);
        return [state, loadRange];
    };
    exports.useListData = useListData;
    const wrapData = (data) => {
        const configuration = {
            fetchFirst: { caching: 'visitedByCurrentIterator' }
        };
        return (0, ojdataproviderfactory_1.getEnhancedDataProvider)(data, configuration);
    };
    const reducer = (state, action) => {
        if (state.status === action.status && action.status === 'loading') {
            return state;
        }
        return action;
    };
    const fetchNextUntilThresholdOrDone = (iteratorRef, current, threshold) => __awaiter(void 0, void 0, void 0, function* () {
        return yield fetchNextRecursive(iteratorRef, current, threshold);
    });
    const fetchNextRecursive = (iteratorRef, currentCount, threshold) => __awaiter(void 0, void 0, void 0, function* () {
        const currentIterator = iteratorRef.current;
        if (currentIterator === null) {
            return { total: -1, done: undefined };
        }
        const result = yield currentIterator.next();
        if (currentIterator === iteratorRef.current) {
            currentCount += result.value.data.length;
            if (currentCount >= threshold || result.done) {
                return { total: currentCount, done: result.done };
            }
            return fetchNextRecursive(iteratorRef, currentCount, threshold);
        }
        return { total: -1, done: undefined };
    });
    const getEmptyState = (precision) => {
        return {
            status: 'success',
            data: {
                offset: 0,
                data: [],
                totalSize: 0,
                sizePrecision: precision
            }
        };
    };
    const handleAddRemoveMutation = (detail, dataState, options, isAdd) => {
        var _a;
        let itemCount = 0;
        if (isIndexesAvailable(detail, options)) {
            const indexes = isAdd ? (_a = detail.indexes) === null || _a === void 0 ? void 0 : _a.sort() : detail.indexes;
            let endIndex = dataState.totalSize - 1;
            indexes === null || indexes === void 0 ? void 0 : indexes.forEach((index) => {
                if (index <= endIndex) {
                    itemCount = itemCount += 1;
                    if (isAdd) {
                        endIndex = endIndex += 1;
                    }
                }
            });
        }
        else {
        }
        return itemCount;
    };
    const handleUpdateMutation = (detail, dataState, options) => {
        if (isIndexesAvailable(detail, options)) {
            const indexes = detail.indexes ? detail.indexes : [];
            const startIndex = dataState.offset;
            const endIndex = startIndex + dataState.data.length;
            for (let i = 0; i < indexes.length; i++) {
                if (indexes[i] >= startIndex && indexes[i] < endIndex) {
                    return true;
                }
            }
        }
        else {
        }
        return false;
    };
    const isIndexesAvailable = (detail, options) => {
        return detail.indexes && options.sortCriteria == null && options.filterCriterion == null;
    };
});

define('oj-c/select-common/utils/utils',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isEmpty = exports.DEFAULT_VALUE_ITEMS = exports.DEFAULT_VALUE_ITEM = exports.DEFAULT_VALUE = exports.DEFAULT_ITEM_CONTEXT = void 0;
    exports.DEFAULT_ITEM_CONTEXT = null;
    exports.DEFAULT_VALUE = null;
    exports.DEFAULT_VALUE_ITEM = null;
    exports.DEFAULT_VALUE_ITEMS = null;
    function isEmpty(value) {
        if (!value)
            return true;
        if (Array.isArray(value))
            return value.length === 0;
        if (value instanceof Set || value instanceof Map)
            return value.size === 0;
        return false;
    }
    exports.isEmpty = isEmpty;
});

define('oj-c/select-common/UNSAFE_useDataProviderListeners/useDataProviderListeners',["require", "exports", "@oracle/oraclejet-preact/utils/UNSAFE_logger", "preact/hooks", "../utils/utils"], function (require, exports, UNSAFE_logger_1, hooks_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useDataProviderListeners = void 0;
    function cloneValue(value) {
        return value instanceof Set ? new Set(value.values()) : value;
    }
    function cloneValueItem(valueItem) {
        return valueItem instanceof Map ? new Map(valueItem.entries()) : Object.assign({}, valueItem);
    }
    function compareValues(value, valueToCompare) {
        if ((value instanceof Set && valueToCompare instanceof Set) ||
            (value instanceof Map && valueToCompare instanceof Map)) {
            return value.size === valueToCompare.size;
        }
        if (typeof value === 'object' && typeof valueToCompare === 'object') {
            return value.key === valueToCompare.key;
        }
        return value === valueToCompare;
    }
    function containsValue(value, query) {
        return value instanceof Set ? value.has(query) : value != null && value === query;
    }
    function deleteFromValue(value, toDelete) {
        if (value instanceof Set || value instanceof Map) {
            value.delete(toDelete);
            return value;
        }
        if (typeof value === 'number' || typeof value === 'string') {
            if (value === toDelete) {
                return utils_1.DEFAULT_VALUE;
            }
            return value;
        }
        if (typeof value === 'object' && value.key === toDelete) {
            return utils_1.DEFAULT_VALUE_ITEMS;
        }
        return value;
    }
    function useDataProviderListeners({ dataProvider, setValue, setValueToSync, setValueItemsToSync, value, valueItems }) {
        const isSelectMultiple = value instanceof Set;
        const handleRefresh = (0, hooks_1.useCallback)(() => {
            if (!(0, utils_1.isEmpty)(value)) {
                setValueToSync(cloneValue(value));
                setValueItemsToSync(utils_1.DEFAULT_VALUE_ITEMS);
            }
        }, [value]);
        const handleMutation = (0, hooks_1.useCallback)((event) => {
            if ((0, utils_1.isEmpty)(value)) {
                return;
            }
            let newVal = cloneValue(value);
            if (event.detail.remove != null) {
                const keys = event.detail.remove.keys;
                keys.forEach((key) => {
                    if (containsValue(newVal, key)) {
                        newVal = deleteFromValue(newVal, key);
                        UNSAFE_logger_1.Logger.warn(`
              ${isSelectMultiple ? 'SelectMultiple' : 'SelectSingle'}: selected value removed from data provider: ${key}`);
                    }
                });
                if (compareValues(newVal, value)) {
                    setValue(!(0, utils_1.isEmpty)(newVal) ? newVal : utils_1.DEFAULT_VALUE);
                    setValueToSync(!(0, utils_1.isEmpty)(newVal) ? newVal : utils_1.DEFAULT_VALUE);
                }
            }
            if ((0, utils_1.isEmpty)(newVal)) {
                return;
            }
            if (event.detail.update != null) {
                const keys = event.detail.update.keys;
                let newValueItems = (0, utils_1.isEmpty)(valueItems)
                    ? valueItems
                    : cloneValueItem(valueItems);
                keys.forEach((key) => {
                    if (containsValue(newVal, key)) {
                        newValueItems = deleteFromValue(newValueItems, key);
                    }
                });
                if (compareValues(newValueItems, valueItems)) {
                    setValueToSync(newVal);
                    setValueItemsToSync(!(0, utils_1.isEmpty)(newValueItems) ? newValueItems : utils_1.DEFAULT_VALUE_ITEMS);
                }
            }
        }, [value, valueItems]);
        (0, hooks_1.useEffect)(() => {
            dataProvider === null || dataProvider === void 0 ? void 0 : dataProvider.addEventListener('refresh', handleRefresh);
            dataProvider === null || dataProvider === void 0 ? void 0 : dataProvider.addEventListener('mutate', handleMutation);
            return () => {
                dataProvider === null || dataProvider === void 0 ? void 0 : dataProvider.removeEventListener('refresh', handleRefresh);
                dataProvider === null || dataProvider === void 0 ? void 0 : dataProvider.removeEventListener('mutate', handleMutation);
            };
        }, [dataProvider, handleMutation, handleRefresh]);
    }
    exports.useDataProviderListeners = useDataProviderListeners;
});

define('oj-c/select-common/UNSAFE_useWrapDataProvider/useWrapDataProvider',["require", "exports", "ojs/ojdataproviderfactory", "preact/hooks"], function (require, exports, ojdataproviderfactory_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useWrapDataProvider = void 0;
    function useWrapDataProvider(data) {
        const dataProvider = (0, hooks_1.useMemo)(() => {
            return data
                ? (0, ojdataproviderfactory_1.getEnhancedDataProvider)(data, {
                    fetchFirst: { caching: 'visitedByCurrentIterator' }
                })
                : data;
        }, [data]);
        return dataProvider;
    }
    exports.useWrapDataProvider = useWrapDataProvider;
});

define('oj-c/select-common/UNSAFE_useWrapValueState/useWrapValueState',["require", "exports", "preact/hooks", "../utils/utils"], function (require, exports, hooks_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useWrapValueState = void 0;
    function useWrapValueState({ arItemContexts, isLoading, preactValueItems, setPreactValueItems }) {
        const getValueForValidationFunc = (0, hooks_1.useCallback)((valueForValidation) => {
            return (valid) => {
                if (valid === 'invalidShown' && !isLoading) {
                    return (0, utils_1.isEmpty)(preactValueItems) ? null : valueForValidation;
                }
                return valueForValidation;
            };
        }, [isLoading, preactValueItems]);
        const refreshDisplayValue = (0, hooks_1.useCallback)(() => {
            setPreactValueItems(arItemContexts);
        }, [arItemContexts]);
        const wrapValueState = (0, hooks_1.useCallback)((valueState) => {
            return Object.assign(Object.assign({}, valueState), { getValueForValidation: getValueForValidationFunc(valueState.value), refreshDisplayValue });
        }, [getValueForValidationFunc, refreshDisplayValue]);
        return { wrapValueState };
    }
    exports.useWrapValueState = useWrapValueState;
});

define('oj-c/select-multiple/useSyncValueAndValueItems',["require", "exports", "@oracle/oraclejet-preact/utils/UNSAFE_logger", "oj-c/select-common/utils/utils", "preact/hooks"], function (require, exports, UNSAFE_logger_1, utils_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useSyncValueAndValueItems = void 0;
    function useSyncValueAndValueItems({ addBusyState, dataProvider, setIsLoading, setValue, setValueItems, value, valueItems }) {
        const prevValueRef = (0, hooks_1.useRef)(value);
        const prevValueItemsRef = (0, hooks_1.useRef)(valueItems);
        const hasValue = value && value instanceof Set && value.size > 0;
        const hasValueItems = valueItems && valueItems.size > 0;
        const latestFetchRef = (0, hooks_1.useRef)(null);
        const syncValueItemsToValue = (0, hooks_1.useCallback)(() => {
            if (!hasValue) {
                if (hasValueItems) {
                    setValueItems(utils_1.DEFAULT_VALUE_ITEMS);
                }
                return;
            }
            const arValues = Array.from(value.keys());
            const valuesToFetch = arValues.reduce((accum, currKey) => {
                if (!hasValueItems || !valueItems.has(currKey)) {
                    accum.push(currKey);
                }
                return accum;
            }, []);
            if (valuesToFetch.length === 0) {
                const newValItems = new Map();
                value.forEach((currKey) => {
                    newValItems.set(currKey, valueItems.get(currKey));
                });
                setValueItems(newValItems);
                return;
            }
            setIsLoading(true);
            const resolveBusyState = addBusyState('useSyncValueItems: calling fetchByKeys');
            const latestFetch = {};
            latestFetchRef.current = latestFetch;
            dataProvider
                .fetchByKeys({ keys: new Set(valuesToFetch) })
                .then((fbkResults) => {
                if (latestFetch === latestFetchRef.current) {
                    const newValueItems = handleFetchByKeysResults(value, valueItems, fbkResults.results);
                    setValueItems(newValueItems);
                }
            })
                .catch((reason) => {
                if (latestFetch === latestFetchRef.current) {
                    UNSAFE_logger_1.Logger.error(`SelectMultiple: fetchByKeys promise rejected: ${reason}`);
                }
            })
                .finally(() => {
                if (latestFetch === latestFetchRef.current) {
                    setIsLoading(false);
                }
                resolveBusyState();
            });
        }, [dataProvider, hasValue, hasValueItems, value, valueItems]);
        const syncValueToValueItems = (0, hooks_1.useCallback)(() => {
            if (!hasValueItems) {
                if (hasValue) {
                    setValue(utils_1.DEFAULT_VALUE);
                }
                return;
            }
            const arValueItemsKeys = Array.from(valueItems.keys());
            const valueItemsKeys = new Set(arValueItemsKeys);
            if (!value || !(value instanceof Set) || value.size !== valueItemsKeys.size) {
                setValue(valueItemsKeys);
                return;
            }
            const arValueKeys = Array.from(value.keys());
            const isDifferent = arValueItemsKeys.some((key, index) => key !== arValueKeys[index]);
            if (isDifferent) {
                setValue(valueItemsKeys);
            }
        }, [hasValue, hasValueItems, value, valueItems]);
        (0, hooks_1.useEffect)(() => {
            if (hasValue) {
                syncValueItemsToValue();
            }
            else if (hasValueItems) {
                syncValueToValueItems();
            }
        }, []);
        (0, hooks_1.useEffect)(() => {
            if (value !== prevValueRef.current && valueItems !== prevValueItemsRef.current) {
                prevValueRef.current = value;
                prevValueItemsRef.current = valueItems;
                if (value) {
                    syncValueItemsToValue();
                }
                else {
                    syncValueToValueItems();
                }
            }
            else if (value !== prevValueRef.current) {
                prevValueRef.current = value;
                syncValueItemsToValue();
            }
            else if (valueItems !== prevValueItemsRef.current) {
                prevValueItemsRef.current = valueItems;
                syncValueToValueItems();
            }
        }, [value, valueItems]);
    }
    exports.useSyncValueAndValueItems = useSyncValueAndValueItems;
    function handleFetchByKeysResults(value, valueItems, fetchByKeysResults) {
        const arKeys = Array.from(value.keys());
        return arKeys.reduce((accumMap, currKey) => {
            if (valueItems && valueItems.has(currKey)) {
                accumMap.set(currKey, valueItems.get(currKey));
                return accumMap;
            }
            const item = fetchByKeysResults.get(currKey);
            if (!item) {
                throw new Error(`oj-c-select-multiple: could not fetch data for key ${currKey}`);
            }
            accumMap.set(currKey, {
                key: currKey,
                data: item.data,
                metadata: item.metadata ? item.metadata : { currKey }
            });
            return accumMap;
        }, new Map());
    }
});

define('oj-c/select-multiple/useValueItems',["require", "exports", "@oracle/oraclejet-preact/hooks/UNSAFE_useUncontrolledState", "preact/hooks"], function (require, exports, UNSAFE_useUncontrolledState_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useValueItems = void 0;
    function useValueItems(propValueItems, onValueItemsChanged) {
        const [valueItems, setValueItems] = (0, UNSAFE_useUncontrolledState_1.useUncontrolledState)(propValueItems, onValueItemsChanged);
        (0, hooks_1.useEffect)(() => {
            if (valueItems !== propValueItems) {
                setValueItems(propValueItems);
            }
        }, [propValueItems]);
        const preactValueItems = (0, hooks_1.useMemo)(() => {
            return valueItems ? Array.from(valueItems.values()) : undefined;
        }, [valueItems]);
        return {
            valueItems,
            setValueItems,
            preactValueItems
        };
    }
    exports.useValueItems = useValueItems;
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
define('oj-c/select-multiple/useSelectMultiplePreact',["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue", "oj-c/editable-value/UNSAFE_useValidators/useValidators", "oj-c/hooks/UNSAFE_useListData/useListData", "oj-c/select-common/UNSAFE_useDataProviderListeners/useDataProviderListeners", "oj-c/select-common/UNSAFE_useWrapDataProvider/useWrapDataProvider", "oj-c/select-common/UNSAFE_useWrapValueState/useWrapValueState", "oj-c/select-common/utils/utils", "ojs/ojdataprovider", "preact/hooks", "./useSyncValueAndValueItems", "./useValueItems"], function (require, exports, useEditableValue_1, useValidators_1, useListData_1, useDataProviderListeners_1, useWrapDataProvider_1, useWrapValueState_1, utils_1, ojdataprovider_1, hooks_1, useSyncValueAndValueItems_1, useValueItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useSelectMultiplePreact = void 0;
    function useSelectMultiplePreact(_a, addBusyState) {
        var { data: propData, disabled, displayOptions, itemText, labelEdge, labelHint, labelStartWidth, messagesCustom, placeholder, readonly, required, textAlign, userAssistanceDensity, value: propValue, valueItems: propValueItems, virtualKeyboard, onMessagesCustomChanged, onValidChanged, onValueChanged, onValueItemsChanged } = _a, otherProps = __rest(_a, ["data", "disabled", "displayOptions", "itemText", "labelEdge", "labelHint", "labelStartWidth", "messagesCustom", "placeholder", "readonly", "required", "textAlign", "userAssistanceDensity", "value", "valueItems", "virtualKeyboard", "onMessagesCustomChanged", "onValidChanged", "onValueChanged", "onValueItemsChanged"]);
        const [filterCriterion, setFilterCriterion] = (0, hooks_1.useState)(undefined);
        const [isLoading, setIsLoading] = (0, hooks_1.useState)(false);
        const { valueItems, setValueItems, preactValueItems: arItemContexts } = (0, useValueItems_1.useValueItems)(propValueItems, onValueItemsChanged);
        const [preactValueItems, setPreactValueItems] = (0, hooks_1.useState)(arItemContexts);
        (0, hooks_1.useEffect)(() => {
            setPreactValueItems(arItemContexts);
        }, [arItemContexts]);
        const { wrapValueState } = (0, useWrapValueState_1.useWrapValueState)({
            arItemContexts,
            isLoading,
            preactValueItems,
            setPreactValueItems
        });
        const { methods, onCommitValue, setValue, textFieldProps, value } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            displayOptions,
            messagesCustom,
            required,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onValidChanged,
            onValueChanged,
            wrapValueState
        });
        const { ariaDescribedBy, messages } = textFieldProps;
        const hasNoValue = value === null || (value instanceof Set && value.size === 0);
        const dataProvider = (0, useWrapDataProvider_1.useWrapDataProvider)(propData);
        const [valueToSync, setValueToSync] = (0, hooks_1.useState)(value);
        const [valueItemsToSync, setValueItemsToSync] = (0, hooks_1.useState)(valueItems);
        (0, hooks_1.useEffect)(() => {
            setValueToSync(value);
        }, [value]);
        (0, hooks_1.useEffect)(() => {
            setValueItemsToSync(valueItems);
        }, [valueItems]);
        (0, useDataProviderListeners_1.useDataProviderListeners)({
            dataProvider,
            setValue: setValue,
            setValueToSync: setValueToSync,
            setValueItemsToSync,
            value: value,
            valueItems
        });
        (0, useSyncValueAndValueItems_1.useSyncValueAndValueItems)({
            addBusyState,
            dataProvider: dataProvider,
            setIsLoading,
            setValue: setValue,
            setValueItems,
            value: valueToSync,
            valueItems: valueItemsToSync
        });
        const [listDataState, onLoadRange] = (0, useListData_1.useListData)(dataProvider, {
            filterCriterion,
            initialRowsFetched: 0
        });
        const onCommit = (0, hooks_1.useCallback)((detail) => __awaiter(this, void 0, void 0, function* () {
            const validationResult = yield onCommitValue((detail.value && detail.value.size > 0 ? detail.value : utils_1.DEFAULT_VALUE));
            if (validationResult === useValidators_1.ValidationResult.INVALID) {
                setPreactValueItems(undefined);
            }
        }), [onCommitValue]);
        const onFilter = (0, hooks_1.useCallback)(({ searchText }) => {
            const fc = searchText && searchText.length > 0
                ? ojdataprovider_1.FilterFactory.getFilter({ filterDef: { text: searchText } })
                : undefined;
            setFilterCriterion(fc);
        }, []);
        return {
            methods,
            selectMultipleProps: {
                ariaDescribedBy,
                data: listDataState.data,
                isDisabled: disabled,
                isLoading,
                isReadonly: readonly,
                isRequired: required,
                isRequiredShown: required && hasNoValue,
                itemText,
                label: labelHint,
                labelEdge,
                labelStartWidth,
                messages,
                onCommit,
                onFilter,
                onLoadRange,
                placeholder,
                textAlign,
                userAssistanceDensity,
                valueItems: preactValueItems,
                virtualKeyboard
            }
        };
    }
    exports.useSelectMultiplePreact = useSelectMultiplePreact;
});


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/select-multiple/select-multiple',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_SelectMultiple", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "ojs/ojcontext", "ojs/ojvcomponent", "ojs/ojvcomponent-binding", "preact", "preact/compat", "preact/hooks", "oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText", "./useSelectMultiplePreact", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormVariantContext", "css!oj-c/select-multiple/select-multiple-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_SelectMultiple_1, UNSAFE_useTabbableMode_1, ojcontext_1, ojvcomponent_1, ojvcomponent_binding_1, preact_1, compat_1, hooks_1, useAssistiveText_1, useSelectMultiplePreact_1, UNSAFE_useFormContext_1, UNSAFE_useFormVariantContext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectMultiple = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    const FunctionalSelectMultiple = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, displayOptions, help, helpHints } = props;
        const selectMultipleRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-select-multiple id=${props.id}: ${desc}`
            });
        }, []);
        const { selectMultipleProps, methods } = (0, useSelectMultiplePreact_1.useSelectMultiplePreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            displayOptions,
            help,
            helpHints
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_SelectMultiple_1.SelectMultiple, Object.assign({ ref: selectMultipleRef }, assistiveTextProps, selectMultipleProps, { variant: variant })));
    });
    let SelectMultiple = class SelectMultiple extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.busyContextRef = (0, preact_1.createRef)();
            this.selectMultipleRef = (0, preact_1.createRef)();
            this.rootRef = (0, preact_1.createRef)();
        }
        componentDidMount() {
            this.busyContextRef.current = ojcontext_1.default.getContext(this.rootRef.current).getBusyContext();
        }
        render(props) {
            const containerProps = {
                isFormLayout: props.containerReadonly !== undefined,
                isReadonly: props.containerReadonly,
                labelWrapping: props.labelWrapping
            };
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: props.id, ref: this.rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useFormContext_1.FormContext.Provider, Object.assign({ value: containerProps }, { children: (0, jsx_runtime_1.jsx)(FunctionalSelectMultiple, Object.assign({ busyContextRef: this.busyContextRef, ref: this.selectMultipleRef }, props)) })) })));
        }
        componentWillUnmount() {
            this.busyContextRef.current = null;
        }
        reset() {
            var _a;
            (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        }
        showMessages() {
            var _a;
            (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.showMessages();
        }
        validate() {
            var _a;
            return (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.validate();
        }
        blur() {
            var _a;
            (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    SelectMultiple.defaultProps = {
        data: null,
        disabled: false,
        displayOptions: {
            messages: 'display'
        },
        help: {
            instruction: ''
        },
        helpHints: {
            definition: '',
            source: '',
            sourceText: undefined
        },
        messagesCustom: [],
        readonly: false,
        required: false,
        userAssistanceDensity: 'reflow',
        value: null,
        valueItems: null,
        virtualKeyboard: 'auto'
    };
    SelectMultiple._metadata = { "properties": { "containerReadonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "data": { "type": "object|null" }, "disabled": { "type": "boolean" }, "displayOptions": { "type": "object", "properties": { "messages": { "type": "string", "enumValues": ["display", "none"] } } }, "help": { "type": "object", "properties": { "instruction": { "type": "string" } } }, "helpHints": { "type": "object", "properties": { "definition": { "type": "string" }, "source": { "type": "string" }, "sourceText": { "type": "string" } } }, "itemText": { "type": "string|number|function" }, "labelEdge": { "type": "string", "enumValues": ["start", "none", "top", "inside"], "binding": { "consume": { "name": "containerLabelEdge" } } }, "labelHint": { "type": "string" }, "labelStartWidth": { "type": "string", "binding": { "consume": { "name": "labelWidth" } } }, "labelWrapping": { "type": "string", "enumValues": ["wrap", "truncate"], "binding": { "consume": { "name": "labelWrapping" } } }, "messagesCustom": { "type": "Array<object>", "writeback": true }, "placeholder": { "type": "string" }, "readonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "required": { "type": "boolean" }, "requiredMessageDetail": { "type": "string" }, "textAlign": { "type": "string", "enumValues": ["start", "right", "end"] }, "userAssistanceDensity": { "type": "string", "enumValues": ["reflow", "efficient"], "binding": { "consume": { "name": "containerUserAssistanceDensity" } } }, "value": { "type": "object|null", "writeback": true }, "valueItems": { "type": "object|null", "writeback": true }, "virtualKeyboard": { "type": "string", "enumValues": ["number", "text", "auto", "search", "email", "tel", "url"] }, "valid": { "type": "string", "enumValues": ["valid", "pending", "invalidHidden", "invalidShown"], "readOnly": true, "writeback": true } }, "extension": { "_WRITEBACK_PROPS": ["messagesCustom", "valid", "value", "valueItems"], "_READ_ONLY_PROPS": ["valid"], "_OBSERVED_GLOBAL_PROPS": ["aria-describedby", "id"] }, "methods": { "reset": {}, "showMessages": {}, "validate": {}, "blur": {}, "focus": {} } };
    SelectMultiple._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    SelectMultiple._consumedContexts = [UNSAFE_useFormVariantContext_1.FormVariantContext, UNSAFE_useTabbableMode_1.TabbableModeContext];
    SelectMultiple = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-select-multiple')
    ], SelectMultiple);
    exports.SelectMultiple = SelectMultiple;
});

define('oj-c/select-multiple',["require", "exports", "./select-multiple/select-multiple"], function (require, exports, select_multiple_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectMultiple = void 0;
    Object.defineProperty(exports, "SelectMultiple", { enumerable: true, get: function () { return select_multiple_1.SelectMultiple; } });
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define('oj-c/select-single/useSyncValueAndValueItem',["require", "exports", "@oracle/oraclejet-preact/utils/UNSAFE_logger", "oj-c/editable-value/UNSAFE_useStaleIdentity/useStaleIdentity", "oj-c/select-common/utils/utils", "preact/hooks"], function (require, exports, UNSAFE_logger_1, useStaleIdentity_1, utils_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useSyncValueAndValueItem = void 0;
    function useSyncValueAndValueItem({ addBusyState, dataProvider, setIsLoading, setValue, setValueItem, value, valueItem }) {
        const prevValueRef = (0, hooks_1.useRef)(value);
        const prevValueItemsRef = (0, hooks_1.useRef)(valueItem);
        const { setStaleIdentity } = (0, useStaleIdentity_1.useStaleIdentity)();
        const hasValue = value != null;
        const hasValueItem = valueItem != null;
        const syncValueItemToValue = (0, hooks_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
            if (!hasValue) {
                if (hasValueItem) {
                    setValueItem(utils_1.DEFAULT_VALUE_ITEM);
                }
                return;
            }
            if (value != null && valueItem != null && valueItem.key === value) {
                setValueItem(Object.assign({}, valueItem));
                return;
            }
            if (!dataProvider) {
                return;
            }
            setIsLoading(true);
            const resolveBusyState = addBusyState('useSyncValueItem: calling fetchByKeys');
            const { isStale } = setStaleIdentity('useSyncValueItem:fetchByKeys');
            try {
                const fetchResults = yield dataProvider.fetchByKeys({ keys: new Set([value]) });
                if (!isStale()) {
                    const newValueItems = handleFetchByKeysResults(value, valueItem, fetchResults.results);
                    setValueItem(newValueItems);
                }
            }
            catch (reason) {
                if (!isStale()) {
                    UNSAFE_logger_1.Logger.error(`SelectMultiple: fetchByKeys promise rejected: ${reason}`);
                }
            }
            if (!isStale()) {
                setIsLoading(false);
            }
            resolveBusyState();
        }), [dataProvider, hasValue, hasValueItem, value, valueItem]);
        const syncValueToValueItem = (0, hooks_1.useCallback)(() => {
            if (!hasValueItem) {
                if (hasValue) {
                    setValue(utils_1.DEFAULT_VALUE);
                }
                return;
            }
            if (valueItem.key !== value) {
                setValue(valueItem.key);
                return;
            }
        }, [hasValue, hasValueItem, value, valueItem]);
        (0, hooks_1.useEffect)(() => {
            if (hasValue) {
                syncValueItemToValue();
            }
            else if (hasValueItem) {
                syncValueToValueItem();
            }
        }, []);
        (0, hooks_1.useEffect)(() => {
            if (value !== prevValueRef.current && valueItem !== prevValueItemsRef.current) {
                prevValueRef.current = value;
                prevValueItemsRef.current = valueItem;
                if (value) {
                    syncValueItemToValue();
                }
                else {
                    syncValueToValueItem();
                }
            }
            else if (value !== prevValueRef.current) {
                prevValueRef.current = value;
                syncValueItemToValue();
            }
            else if (valueItem !== prevValueItemsRef.current) {
                prevValueItemsRef.current = valueItem;
                syncValueToValueItem();
            }
        }, [value, valueItem]);
    }
    exports.useSyncValueAndValueItem = useSyncValueAndValueItem;
    function handleFetchByKeysResults(value, valueItem, fetchByKeysResults) {
        if (valueItem && valueItem.key === value) {
            return valueItem;
        }
        const item = fetchByKeysResults.get(value);
        if (!item) {
            throw new Error(`oj-c-select-single: could not fetch data for key ${value}`);
        }
        return {
            key: value,
            data: item.data,
            metadata: item.metadata ? item.metadata : { key: value }
        };
    }
});

define('oj-c/select-single/useValueItem',["require", "exports", "@oracle/oraclejet-preact/hooks/UNSAFE_useUncontrolledState", "preact/hooks"], function (require, exports, UNSAFE_useUncontrolledState_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useValueItem = void 0;
    function useValueItem(propValueItem, onValueItemsChanged) {
        const [valueItem, setValueItem] = (0, UNSAFE_useUncontrolledState_1.useUncontrolledState)(propValueItem, onValueItemsChanged);
        (0, hooks_1.useEffect)(() => {
            if (valueItem !== propValueItem) {
                setValueItem(propValueItem);
            }
        }, [propValueItem]);
        return {
            valueItem,
            setValueItem
        };
    }
    exports.useValueItem = useValueItem;
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
define('oj-c/select-single/useSelectSinglePreact',["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue", "oj-c/editable-value/UNSAFE_useValidators/useValidators", "oj-c/editable-value/utils/utils", "oj-c/hooks/UNSAFE_useListData/useListData", "oj-c/select-common/UNSAFE_useDataProviderListeners/useDataProviderListeners", "oj-c/select-common/UNSAFE_useWrapDataProvider/useWrapDataProvider", "oj-c/select-common/UNSAFE_useWrapValueState/useWrapValueState", "oj-c/select-common/utils/utils", "ojs/ojdataprovider", "preact/hooks", "./useSyncValueAndValueItem", "./useValueItem"], function (require, exports, useEditableValue_1, useValidators_1, utils_1, useListData_1, useDataProviderListeners_1, useWrapDataProvider_1, useWrapValueState_1, utils_2, ojdataprovider_1, hooks_1, useSyncValueAndValueItem_1, useValueItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useSelectSinglePreact = void 0;
    function useSelectSinglePreact(_a, addBusyState) {
        var { data: propData, disabled, displayOptions, itemText, labelEdge, labelHint, labelStartWidth, messagesCustom, placeholder, readonly, required, textAlign, userAssistanceDensity, value: propValue, valueItem: propValueItem, virtualKeyboard, onMessagesCustomChanged, onOjValueAction, onValidChanged, onValueChanged, onValueItemChanged } = _a, otherProps = __rest(_a, ["data", "disabled", "displayOptions", "itemText", "labelEdge", "labelHint", "labelStartWidth", "messagesCustom", "placeholder", "readonly", "required", "textAlign", "userAssistanceDensity", "value", "valueItem", "virtualKeyboard", "onMessagesCustomChanged", "onOjValueAction", "onValidChanged", "onValueChanged", "onValueItemChanged"]);
        const [filterCriterion, setFilterCriterion] = (0, hooks_1.useState)(undefined);
        const [isLoading, setIsLoading] = (0, hooks_1.useState)(false);
        const { valueItem, setValueItem } = (0, useValueItem_1.useValueItem)(propValueItem, onValueItemChanged);
        const [preactValueItem, setPreactValueItem] = (0, hooks_1.useState)(valueItem);
        (0, hooks_1.useEffect)(() => {
            setPreactValueItem(valueItem);
        }, [valueItem]);
        const { wrapValueState } = (0, useWrapValueState_1.useWrapValueState)({
            arItemContexts: valueItem,
            isLoading,
            preactValueItems: preactValueItem,
            setPreactValueItems: setPreactValueItem
        });
        const { methods, onCommitValue, setValue, textFieldProps, value } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            displayOptions,
            messagesCustom,
            required,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onValidChanged,
            onValueChanged,
            wrapValueState
        });
        const { ariaDescribedBy, messages } = textFieldProps;
        const hasNoValue = value === null;
        const dataProvider = (0, useWrapDataProvider_1.useWrapDataProvider)(propData);
        const [valueToSync, setValueToSync] = (0, hooks_1.useState)(value);
        const [valueItemToSync, setValueItemToSync] = (0, hooks_1.useState)(valueItem);
        (0, hooks_1.useEffect)(() => {
            setValueToSync(value);
        }, [value]);
        (0, hooks_1.useEffect)(() => {
            setValueItemToSync(valueItem);
        }, [valueItem]);
        (0, useDataProviderListeners_1.useDataProviderListeners)({
            dataProvider,
            setValue,
            setValueToSync,
            setValueItemsToSync: setValueItemToSync,
            value,
            valueItems: valueItem
        });
        (0, useSyncValueAndValueItem_1.useSyncValueAndValueItem)({
            addBusyState,
            dataProvider: dataProvider,
            setIsLoading,
            setValue,
            setValueItem,
            value: valueToSync,
            valueItem: valueItemToSync
        });
        const [listDataState, onLoadRange] = (0, useListData_1.useListData)(dataProvider, {
            filterCriterion,
            initialRowsFetched: 0
        });
        const onCommit = (0, hooks_1.useCallback)(({ previousValue, value }) => __awaiter(this, void 0, void 0, function* () {
            const validationResult = yield onCommitValue(value != null ? value : utils_2.DEFAULT_VALUE);
            if (validationResult === useValidators_1.ValidationResult.INVALID) {
                setPreactValueItem(undefined);
            }
            else if (validationResult === useValidators_1.ValidationResult.VALID && listDataState.status === 'success') {
                if (value == null) {
                    onOjValueAction === null || onOjValueAction === void 0 ? void 0 : onOjValueAction({
                        itemContext: utils_2.DEFAULT_ITEM_CONTEXT,
                        previousValue: previousValue !== null && previousValue !== void 0 ? previousValue : utils_2.DEFAULT_VALUE,
                        value: utils_2.DEFAULT_VALUE
                    });
                }
                else if (value === (valueItem === null || valueItem === void 0 ? void 0 : valueItem.key)) {
                    onOjValueAction === null || onOjValueAction === void 0 ? void 0 : onOjValueAction({
                        itemContext: valueItem,
                        previousValue: previousValue !== null && previousValue !== void 0 ? previousValue : utils_2.DEFAULT_VALUE,
                        value
                    });
                }
                else {
                    const data = listDataState.data.data;
                    let item = data.find((item) => item.metadata.key === value);
                    if (item === undefined) {
                        const fetchResults = yield dataProvider.fetchByKeys({ keys: new Set([value]) });
                        item = fetchResults.results.get(value);
                    }
                    const itemContext = {
                        data: item.data,
                        key: item.metadata.key,
                        metadata: item.metadata
                    };
                    onOjValueAction === null || onOjValueAction === void 0 ? void 0 : onOjValueAction({
                        itemContext: itemContext,
                        previousValue: previousValue !== null && previousValue !== void 0 ? previousValue : utils_2.DEFAULT_VALUE,
                        value: value !== null && value !== void 0 ? value : utils_2.DEFAULT_VALUE
                    });
                }
            }
        }), [dataProvider, listDataState, valueItem, onCommitValue, onOjValueAction]);
        const onFilter = (0, hooks_1.useCallback)(({ searchText }) => {
            const fc = searchText && searchText.length > 0
                ? ojdataprovider_1.FilterFactory.getFilter({ filterDef: { text: searchText } })
                : undefined;
            setFilterCriterion(fc);
        }, []);
        return {
            methods,
            selectSingleProps: {
                ariaDescribedBy,
                data: listDataState.data,
                isDisabled: disabled,
                isLoading,
                isReadonly: readonly,
                isRequired: required,
                isRequiredShown: required && hasNoValue,
                itemText,
                label: labelHint,
                labelEdge,
                labelStartWidth,
                messages,
                onCommit,
                onFilter,
                onLoadRange,
                placeholder,
                textAlign,
                userAssistanceDensity,
                valueItem: (0, utils_1.treatNull)(preactValueItem, undefined),
                virtualKeyboard
            }
        };
    }
    exports.useSelectSinglePreact = useSelectSinglePreact;
});


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/select-single/select-single',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/hooks/UNSAFE_useFormContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormVariantContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "@oracle/oraclejet-preact/UNSAFE_SelectSingle", "oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText", "ojs/ojcontext", "ojs/ojvcomponent", "ojs/ojvcomponent-binding", "preact", "preact/compat", "preact/hooks", "./useSelectSinglePreact", "css!./select-single-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_useFormContext_1, UNSAFE_useFormVariantContext_1, UNSAFE_useTabbableMode_1, UNSAFE_SelectSingle_1, useAssistiveText_1, ojcontext_1, ojvcomponent_1, ojvcomponent_binding_1, preact_1, compat_1, hooks_1, useSelectSinglePreact_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectSingle = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    const FunctionalSelectSingle = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, displayOptions, help, helpHints } = props;
        const selectSingleRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-select-single id=${props.id}: ${desc}`
            });
        }, []);
        const { selectSingleProps, methods } = (0, useSelectSinglePreact_1.useSelectSinglePreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = selectSingleRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = selectSingleRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            displayOptions,
            help,
            helpHints
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_SelectSingle_1.SelectSingle, Object.assign({ ref: selectSingleRef }, assistiveTextProps, selectSingleProps, { variant: variant })));
    });
    let SelectSingle = class SelectSingle extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.busyContextRef = (0, preact_1.createRef)();
            this.selectSingleRef = (0, preact_1.createRef)();
            this.rootRef = (0, preact_1.createRef)();
        }
        componentDidMount() {
            this.busyContextRef.current = ojcontext_1.default.getContext(this.rootRef.current).getBusyContext();
        }
        render(props) {
            const containerProps = {
                isFormLayout: props.containerReadonly !== undefined,
                isReadonly: props.containerReadonly,
                labelWrapping: props.labelWrapping
            };
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: props.id, ref: this.rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useFormContext_1.FormContext.Provider, Object.assign({ value: containerProps }, { children: (0, jsx_runtime_1.jsx)(FunctionalSelectSingle, Object.assign({ busyContextRef: this.busyContextRef, ref: this.selectSingleRef }, props)) })) })));
        }
        componentWillUnmount() {
            this.busyContextRef.current = null;
        }
        reset() {
            var _a;
            (_a = this.selectSingleRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        }
        showMessages() {
            var _a;
            (_a = this.selectSingleRef.current) === null || _a === void 0 ? void 0 : _a.showMessages();
        }
        validate() {
            var _a;
            return (_a = this.selectSingleRef.current) === null || _a === void 0 ? void 0 : _a.validate();
        }
        blur() {
            var _a;
            (_a = this.selectSingleRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.selectSingleRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    SelectSingle.defaultProps = {
        data: null,
        disabled: false,
        displayOptions: {
            messages: 'display'
        },
        help: {
            instruction: ''
        },
        helpHints: {
            definition: '',
            source: '',
            sourceText: undefined
        },
        messagesCustom: [],
        readonly: false,
        required: false,
        userAssistanceDensity: 'reflow',
        value: null,
        valueItem: null,
        virtualKeyboard: 'auto'
    };
    SelectSingle._metadata = { "properties": { "containerReadonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "data": { "type": "object|null" }, "disabled": { "type": "boolean" }, "displayOptions": { "type": "object", "properties": { "messages": { "type": "string", "enumValues": ["display", "none"] } } }, "help": { "type": "object", "properties": { "instruction": { "type": "string" } } }, "helpHints": { "type": "object", "properties": { "definition": { "type": "string" }, "source": { "type": "string" }, "sourceText": { "type": "string" } } }, "itemText": { "type": "string|number|function" }, "labelEdge": { "type": "string", "enumValues": ["start", "none", "top", "inside"], "binding": { "consume": { "name": "containerLabelEdge" } } }, "labelHint": { "type": "string" }, "labelStartWidth": { "type": "string", "binding": { "consume": { "name": "labelWidth" } } }, "labelWrapping": { "type": "string", "enumValues": ["wrap", "truncate"], "binding": { "consume": { "name": "labelWrapping" } } }, "messagesCustom": { "type": "Array<object>", "writeback": true }, "placeholder": { "type": "string" }, "readonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "required": { "type": "boolean" }, "requiredMessageDetail": { "type": "string" }, "textAlign": { "type": "string", "enumValues": ["start", "right", "end"] }, "userAssistanceDensity": { "type": "string", "enumValues": ["reflow", "efficient"], "binding": { "consume": { "name": "containerUserAssistanceDensity" } } }, "value": { "type": "any", "writeback": true }, "valueItem": { "type": "object|null", "properties": { "data": { "type": "any" }, "key": { "type": "any" }, "metadata": { "type": "object", "properties": { "indexFromParent": { "type": "number" }, "isLeaf": { "type": "boolean" }, "key": { "type": "any" }, "message": { "type": "object", "properties": { "detail": { "type": "string" }, "severity": { "type": "number|string", "enumValues": ["error", "confirmation", "info", "warning", "fatal"] }, "summary": { "type": "string" } } }, "parentKey": { "type": "any" }, "suggestion": { "type": "object" }, "treeDepth": { "type": "number" } } } }, "writeback": true }, "virtualKeyboard": { "type": "string", "enumValues": ["number", "text", "auto", "search", "email", "tel", "url"] }, "valid": { "type": "string", "enumValues": ["valid", "pending", "invalidHidden", "invalidShown"], "readOnly": true, "writeback": true } }, "events": { "ojValueAction": {} }, "extension": { "_WRITEBACK_PROPS": ["messagesCustom", "valid", "value", "valueItem"], "_READ_ONLY_PROPS": ["valid"], "_OBSERVED_GLOBAL_PROPS": ["aria-describedby", "id"] }, "methods": { "reset": {}, "showMessages": {}, "validate": {}, "blur": {}, "focus": {} } };
    SelectSingle._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    SelectSingle._consumedContexts = [UNSAFE_useFormVariantContext_1.FormVariantContext, UNSAFE_useTabbableMode_1.TabbableModeContext];
    SelectSingle = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-select-single')
    ], SelectSingle);
    exports.SelectSingle = SelectSingle;
});

define('oj-c/select-single',["require", "exports", "./select-single/select-single"], function (require, exports, select_single_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectSingle = void 0;
    Object.defineProperty(exports, "SelectSingle", { enumerable: true, get: function () { return select_single_1.SelectSingle; } });
});


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
define('oj-c/collapsible/collapsible',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_Collapsible", "ojs/ojvcomponent", "preact/hooks", "ojs/ojcontext", "css!oj-c/collapsible/collapsible-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_Collapsible_1, ojvcomponent_1, hooks_1, ojcontext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Collapsible = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    exports.Collapsible = (0, ojvcomponent_1.registerCustomElement)('oj-c-collapsible', (props) => {
        const { id, children, disabled, expanded, iconPosition, variant, header } = props;
        const rootRef = (0, hooks_1.useRef)(null);
        const didMountRef = (0, hooks_1.useRef)(false);
        const resolveBusyState = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = ojcontext_1.default.getContext(rootRef.current)
                .getBusyContext()) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-collapsible: id='${id}' is ${desc}.`
            });
        }, []);
        (0, hooks_1.useEffect)(() => {
            if (!didMountRef.current) {
                didMountRef.current = true;
                return;
            }
            if (resolveBusyState.current) {
                resolveBusyState.current();
            }
            resolveBusyState.current = addBusyState('animating');
        }, [expanded]);
        const toggleHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            let target = event.target;
            for (; target && target !== (rootRef === null || rootRef === void 0 ? void 0 : rootRef.current); target = target.parentElement) {
                if (target.getAttribute('data-oj-clickthrough') === 'disabled') {
                    return;
                }
            }
            const beforeProp = event.value ? props.onOjBeforeExpand : props.onOjBeforeCollapse;
            try {
                yield (beforeProp === null || beforeProp === void 0 ? void 0 : beforeProp(event));
                (_a = props.onExpandedChanged) === null || _a === void 0 ? void 0 : _a.call(props, event.value);
            }
            catch (_) {
            }
        });
        const transitionEndHandler = (event) => {
            const expandedProp = event.value ? props.onOjExpand : props.onOjCollapse;
            expandedProp === null || expandedProp === void 0 ? void 0 : expandedProp(event);
            if (resolveBusyState.current) {
                resolveBusyState.current();
                resolveBusyState.current = undefined;
            }
        };
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: id, ref: rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_Collapsible_1.Collapsible, Object.assign({ header: header, iconPosition: iconPosition, variant: variant, isExpanded: expanded, isDisabled: disabled, onToggle: toggleHandler, onTransitionEnd: transitionEndHandler }, { children: children })) })));
    }, "Collapsible", { "slots": { "": {}, "header": {} }, "properties": { "disabled": { "type": "boolean" }, "expanded": { "type": "boolean", "writeback": true }, "iconPosition": { "type": "string", "enumValues": ["start", "end"] }, "variant": { "type": "string", "enumValues": ["basic", "horizontal-rule"] } }, "events": { "ojBeforeCollapse": { "cancelable": true }, "ojBeforeExpand": { "cancelable": true }, "ojCollapse": {}, "ojExpand": {} }, "extension": { "_WRITEBACK_PROPS": ["expanded"], "_READ_ONLY_PROPS": [], "_OBSERVED_GLOBAL_PROPS": ["id"] } }, undefined, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    });
});

define('oj-c/collapsible',["require", "exports", "./collapsible/collapsible"], function (require, exports, collapsible_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Collapsible = void 0;
    Object.defineProperty(exports, "Collapsible", { enumerable: true, get: function () { return collapsible_1.Collapsible; } });
});

define('oj-c/utils/UNSAFE_focusTabUtils/focusUtils',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFirstTabStop = exports.focusFirstTabStop = void 0;
    const focusFirstTabStop = (element) => {
        if (!element)
            return;
        const focusElement = (0, exports.getFirstTabStop)(element);
        if (focusElement) {
            focusElement.focus();
        }
        return focusElement;
    };
    exports.focusFirstTabStop = focusFirstTabStop;
    const getFirstTabStop = (element) => {
        const tabbable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (tabbable && tabbable.length > 0) {
            return tabbable[0];
        }
        return null;
    };
    exports.getFirstTabStop = getFirstTabStop;
});


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
define('oj-c/file-picker/file-picker',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_FilePicker", "preact/hooks", "preact/compat", "ojs/ojvcomponent", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "../utils/UNSAFE_focusTabUtils/focusUtils", "css!oj-c/file-picker/file-picker-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_FilePicker_1, hooks_1, compat_1, ojvcomponent_1, UNSAFE_useTabbableMode_1, focusUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilePicker = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    const getPrimaryText = (primaryText) => {
        if (typeof primaryText === 'function') {
            return primaryText();
        }
        return primaryText;
    };
    const getSecondaryText = (secondaryText, selectionMode) => {
        if (typeof secondaryText === 'function') {
            return secondaryText({ selectionMode: selectionMode });
        }
        return secondaryText;
    };
    exports.FilePicker = (0, ojvcomponent_1.registerCustomElement)('oj-c-file-picker', (0, compat_1.forwardRef)((_a, ref) => {
        var { capture = 'none', disabled = false, selectionMode = 'multiple' } = _a, otherProps = __rest(_a, ["capture", "disabled", "selectionMode"]);
        const onCommit = (0, hooks_1.useCallback)((event) => {
            var _a;
            (_a = otherProps.onOjBeforeSelect) === null || _a === void 0 ? void 0 : _a.call(otherProps, { files: event.files }).then(() => {
                var _a;
                (_a = otherProps.onOjSelect) === null || _a === void 0 ? void 0 : _a.call(otherProps, { files: event.files });
            }, (messages) => {
                var _a;
                (_a = otherProps.onOjInvalidSelect) === null || _a === void 0 ? void 0 : _a.call(otherProps, { messages: messages, until: null });
            });
        }, [otherProps.onOjBeforeSelect, otherProps.onOjSelect, otherProps.onOjInvalidSelect]);
        (0, hooks_1.useImperativeHandle)(ref, () => ({
            focus: () => (0, focusUtils_1.focusFirstTabStop)(rootRef.current),
            blur: () => {
                var _a;
                const focusElement = document.activeElement;
                if ((_a = rootRef.current) === null || _a === void 0 ? void 0 : _a.contains(focusElement)) {
                    focusElement.blur();
                }
            }
        }));
        const rootRef = (0, hooks_1.useRef)(null);
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ ref: rootRef, class: otherProps.trigger ? 'oj-c-file-picker-with-trigger' : undefined }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_FilePicker_1.FilePicker, Object.assign({ capture: capture, isDisabled: disabled, selectionMode: selectionMode, onCommit: onCommit, onReject: otherProps.onOjInvalidSelect, accept: otherProps.accept, primaryText: getPrimaryText(otherProps.primaryText), secondaryText: getSecondaryText(otherProps.secondaryText, selectionMode), accessibleLabel: otherProps['aria-label'], width: "100%" }, { children: otherProps.trigger })) })));
    }), "FilePicker", { "properties": { "accept": { "type": "Array<string>" }, "capture": { "type": "string", "enumValues": ["none", "user", "environment", "implementation"] }, "disabled": { "type": "boolean" }, "primaryText": { "type": "string|function" }, "secondaryText": { "type": "string|function" }, "selectionMode": { "type": "string", "enumValues": ["multiple", "single"] } }, "slots": { "trigger": {} }, "events": { "ojBeforeSelect": { "cancelable": true }, "ojInvalidSelect": {}, "ojSelect": {} }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["aria-label"] }, "methods": { "focus": {}, "blur": {} } }, { "capture": "none", "disabled": false, "selectionMode": "multiple" }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    }, { consume: [UNSAFE_useTabbableMode_1.TabbableModeContext] });
});

define('oj-c/file-picker',["require", "exports", "./file-picker/file-picker"], function (require, exports, file_picker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilePicker = void 0;
    Object.defineProperty(exports, "FilePicker", { enumerable: true, get: function () { return file_picker_1.FilePicker; } });
});

define('oj-c/utils/UNSAFE_meterUtils/meterUtils',["require", "exports"], function (require, exports) {
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
define('oj-c/meter-bar/meter-bar',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_MeterBar", "ojs/ojvcomponent", "preact/hooks", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "../utils/UNSAFE_meterUtils/meterUtils", "css!oj-c/meter-bar/meter-bar-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_MeterBar_1, ojvcomponent_1, hooks_1, UNSAFE_useTabbableMode_1, meterUtils_1) {
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

define('oj-c/meter-bar',["require", "exports", "./meter-bar/meter-bar"], function (require, exports, meter_bar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MeterBar = void 0;
    Object.defineProperty(exports, "MeterBar", { enumerable: true, get: function () { return meter_bar_1.MeterBar; } });
});


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
define('oj-c/meter-circle/meter-circle',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_MeterCircle", "ojs/ojvcomponent", "preact/hooks", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "../utils/UNSAFE_meterUtils/meterUtils", "css!oj-c/meter-circle/meter-circle-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_MeterCircle_1, ojvcomponent_1, hooks_1, UNSAFE_useTabbableMode_1, meterUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MeterCircle = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    exports.MeterCircle = (0, ojvcomponent_1.registerCustomElement)('oj-c-meter-circle', (_a) => {
        var _b, _c, _d, _e, _f;
        var { max = 100, value = 0, min = 0, size = 'md', step = 1, readonly = false, startAngle = 90, indicatorSize = 1, angleExtent = 360, thresholdDisplay = 'indicator' } = _a, props = __rest(_a, ["max", "value", "min", "size", "step", "readonly", "startAngle", "indicatorSize", "angleExtent", "thresholdDisplay"]);
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
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(UNSAFE_MeterCircle_1.MeterCircle, Object.assign({ value: (hoveredVal != undefined ? hoveredVal : value), step: step, max: max, min: min, size: size, angleExtent: angleExtent, startAngle: startAngle, indicatorSize: indicatorSize, innerRadius: props.innerRadius, datatip: props.datatip
                    ? props.datatip({
                        value: hoveredVal != undefined ? hoveredVal : value
                    })
                    : props.datatip, onCommit: readonly ? undefined : commitHandler, onInput: readonly ? undefined : inputHandler, thresholds: thresholds, trackColor: (_c = props.plotArea) === null || _c === void 0 ? void 0 : _c.color, indicatorColor: props.color, isTrackRendered: ((_d = props.plotArea) === null || _d === void 0 ? void 0 : _d.rendered) !== 'off', referenceLines: props.referenceLines, thresholdDisplay: thresholdDisplay === 'plotArea' ? 'track' : thresholdDisplay, accessibleLabel: props['aria-label'], ariaLabelledBy: (_e = props.labelledBy) !== null && _e !== void 0 ? _e : undefined, ariaDescribedBy: (_f = props.describedBy) !== null && _f !== void 0 ? _f : undefined }, { children: (context) => {
                    var _a;
                    return (_a = props.centerTemplate) === null || _a === void 0 ? void 0 : _a.call(props, Object.assign({ value }, context));
                } })) }));
    }, "MeterCircle", { "properties": { "max": { "type": "number" }, "min": { "type": "number" }, "readonly": { "type": "boolean" }, "value": { "type": "number|null", "writeback": true }, "step": { "type": "number" }, "color": { "type": "string" }, "indicatorSize": { "type": "number" }, "innerRadius": { "type": "number" }, "plotArea": { "type": "object", "properties": { "color": { "type": "string" }, "rendered": { "type": "string", "enumValues": ["on", "off"] } } }, "angleExtent": { "type": "number" }, "startAngle": { "type": "number" }, "referenceLines": { "type": "Array<object>" }, "thresholdDisplay": { "type": "string", "enumValues": ["all", "plotArea", "indicator"] }, "thresholds": { "type": "Array<object>" }, "describedBy": { "type": "string|null" }, "labelledBy": { "type": "string|null" }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] }, "datatip": { "type": "function" }, "transientValue": { "type": "number", "readOnly": true, "writeback": true } }, "slots": { "centerTemplate": { "data": {} } }, "extension": { "_WRITEBACK_PROPS": ["value", "transientValue"], "_READ_ONLY_PROPS": ["transientValue"], "_OBSERVED_GLOBAL_PROPS": ["aria-label"] } }, { "max": 100, "value": 0, "min": 0, "size": "md", "step": 1, "readonly": false, "startAngle": 90, "indicatorSize": 1, "angleExtent": 360, "thresholdDisplay": "indicator" }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    }, { consume: [UNSAFE_useTabbableMode_1.TabbableModeContext] });
});

define('oj-c/meter-circle',["require", "exports", "./meter-circle/meter-circle"], function (require, exports, meter_circle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MeterCircle = void 0;
    Object.defineProperty(exports, "MeterCircle", { enumerable: true, get: function () { return meter_circle_1.MeterCircle; } });
});


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
define('oj-c/list-item-layout/list-item-layout',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_ListItemLayout", "ojs/ojvcomponent", "css!oj-c/list-item-layout/list-item-layout-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_ListItemLayout_1, ojvcomponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListItemLayout = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    exports.ListItemLayout = (0, ojvcomponent_1.registerCustomElement)('oj-c-list-item-layout', (_a) => {
        var { children } = _a, otherProps = __rest(_a, ["children"]);
        const primary = children;
        const insetStyle = { padding: otherProps.inset === 'none' ? '0' : '12px 16px' };
        const actionSlot = otherProps.action ? ((0, jsx_runtime_1.jsx)("div", Object.assign({ "data-oj-clickthrough": "disabled" }, { children: otherProps.action }))) : undefined;
        const navSlot = otherProps.navigation ? ((0, jsx_runtime_1.jsx)("div", Object.assign({ "data-oj-clickthrough": "disabled" }, { children: otherProps.navigation }))) : undefined;
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ style: insetStyle }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_ListItemLayout_1.ListItemLayout, { primary: primary, overline: otherProps.overline, selector: otherProps.selector, leading: otherProps.leading, secondary: otherProps.secondary, tertiary: otherProps.tertiary, metadata: otherProps.metadata, trailing: otherProps.trailing, action: actionSlot, quaternary: otherProps.quaternary, navigation: navSlot }) })) }));
    }, "ListItemLayout", { "slots": { "": {}, "overline": {}, "selector": {}, "leading": {}, "secondary": {}, "tertiary": {}, "metadata": {}, "trailing": {}, "action": {}, "quaternary": {}, "navigation": {} }, "properties": { "inset": { "type": "string", "enumValues": ["none", "listInset"] } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["aria-label"] } }, undefined, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    });
});

define('oj-c/list-item-layout',["require", "exports", "./list-item-layout/list-item-layout"], function (require, exports, list_item_layout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListItemLayout = void 0;
    Object.defineProperty(exports, "ListItemLayout", { enumerable: true, get: function () { return list_item_layout_1.ListItemLayout; } });
});


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define('oj-c/split-menu-button/split-menu-button',["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_SplitMenuButton", "@oracle/oraclejet-preact/UNSAFE_Menu", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "preact", "preact/hooks", "preact/compat", "ojs/ojvcomponent", "css!oj-c/split-menu-button/split-menu-button-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_SplitMenuButton_1, UNSAFE_Menu_1, UNSAFE_useTabbableMode_1, preact_1, hooks_1, compat_1, ojvcomponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SplitMenuButton = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    const FunctionalSplitMenuButton = (0, compat_1.forwardRef)((props, ref) => {
        const buttonRef = (0, hooks_1.useRef)(null);
        (0, hooks_1.useImperativeHandle)(ref, () => ({
            focus: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus(); },
            blur: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur(); },
            doAction: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event('ojAction', { bubbles: true })); }
        }), []);
        return (0, jsx_runtime_1.jsx)(UNSAFE_SplitMenuButton_1.SplitMenuButton, Object.assign({ ref: buttonRef }, props));
    });
    let SplitMenuButton = class SplitMenuButton extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.buttonRef = (0, preact_1.createRef)();
            this.renderMenu = (items) => {
                return items.map((item) => {
                    if (item && item.type === 'divider') {
                        return (0, jsx_runtime_1.jsx)(UNSAFE_Menu_1.MenuDivider, {});
                    }
                    else if (item.label) {
                        return ((0, jsx_runtime_1.jsx)(UNSAFE_Menu_1.MenuItem, { label: item.label, isDisabled: item.disabled, onAction: item.onAction }));
                    }
                    else {
                        return;
                    }
                });
            };
        }
        render(props) {
            const { chroming, label, disabled, size, onOjAction: onAction, items } = Object.assign({}, props);
            const widthSize = { width: props.width };
            return props.width ? ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ style: widthSize }, { children: (0, jsx_runtime_1.jsx)(FunctionalSplitMenuButton, Object.assign({ label: label, ref: this.buttonRef, variant: chroming, size: size, width: '100%', isDisabled: disabled, onAction: onAction }, { children: this.renderMenu(items) })) }))) : ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(FunctionalSplitMenuButton, Object.assign({ label: label, ref: this.buttonRef, variant: chroming, size: size, width: '100%', isDisabled: disabled, onAction: onAction }, { children: this.renderMenu(items) })) }));
        }
        blur() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
        doAction() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.doAction();
        }
    };
    SplitMenuButton.defaultProps = {
        label: '',
        chroming: 'outlined',
        disabled: false,
        size: 'md',
        items: []
    };
    SplitMenuButton._metadata = { "properties": { "label": { "type": "string" }, "items": { "type": "Array<object>" }, "disabled": { "type": "boolean" }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] }, "width": { "type": "number|string" }, "chroming": { "type": "string", "enumValues": ["outlined", "solid", "callToAction"] } }, "events": { "ojAction": { "bubbles": true } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["title"] }, "methods": { "blur": {}, "focus": {}, "doAction": {} } };
    SplitMenuButton._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    SplitMenuButton._consumedContexts = [UNSAFE_useTabbableMode_1.TabbableModeContext];
    SplitMenuButton = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-split-menu-button')
    ], SplitMenuButton);
    exports.SplitMenuButton = SplitMenuButton;
});

define('oj-c/split-menu-button',["require", "exports", "./split-menu-button/split-menu-button"], function (require, exports, split_menu_button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SplitMenuButton = void 0;
    Object.defineProperty(exports, "SplitMenuButton", { enumerable: true, get: function () { return split_menu_button_1.SplitMenuButton; } });
});

require(["oj-c/input-number","oj-c/input-password","oj-c/input-text","oj-c/message-toast","oj-c/text-area","oj-c/progress-bar","oj-c/progress-circle","oj-c/avatar","oj-c/button","oj-c/rating-gauge","oj-c/select-multiple","oj-c/select-single","oj-c/collapsible","oj-c/file-picker","oj-c/meter-bar","oj-c/meter-circle","oj-c/list-item-layout","oj-c/split-menu-button"], function(){});
define("corepackbundle", function(){});

