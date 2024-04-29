define(["require", "exports", "preact/hooks"], function (require, exports, hooks_1) {
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
