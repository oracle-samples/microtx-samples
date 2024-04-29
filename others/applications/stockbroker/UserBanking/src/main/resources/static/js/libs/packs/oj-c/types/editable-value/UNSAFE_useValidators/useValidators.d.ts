/*
Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data
(collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the
Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell,
offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be
included in all copies or substantial portions of the Software. **

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/// <reference types="ojvalidator" />
/// <reference types="ojvalidator-async" />
import { ComponentMessageItem } from '@oracle/oraclejet-preact/UNSAFE_ComponentMessage';
import Validator from 'ojs/ojvalidator';
import AsyncValidator from 'ojs/ojvalidator-async';
import { StateUpdater } from 'preact/hooks';
import { ComponentMessagingState } from '../UNSAFE_useComponentMessaging/useComponentMessaging';
export declare const ValidationResult: {
    readonly VALID: "VALID";
    readonly INVALID: "INVALID";
    readonly STALE: "STALE";
};
export declare type ValidationResult = typeof ValidationResult[keyof typeof ValidationResult];
export declare type ValidState = 'valid' | 'pending' | 'invalidHidden' | 'invalidShown';
export declare type ValidatorLike<V> = Validator<V> | AsyncValidator<V>;
export declare type ValidationOptions = {
    doNotClearMessagesCustom?: boolean;
};
export declare type ValidationState<V> = {
    valid: ValidState;
    setValid: StateUpdater<ValidState>;
    deferredValidate: (value: V) => void | ComponentMessageItem[];
    fullValidate: (value: V, options?: ValidationOptions) => Promise<boolean>;
    validateValueOnInternalChange: (value: V, options?: ValidationOptions) => Promise<ValidationResult>;
    validateValueOnExternalChange: (value: V) => ValidationResult;
};
export declare type UseValidatorsProps<V> = {
    componentMessagingState: ComponentMessagingState;
    defaultValidState?: ValidState;
    deferredValidators?: ValidatorLike<V>[];
    validators?: ValidatorLike<V>[];
    addBusyState?: (desc?: string) => () => void;
    onValidChanged?: (valid: ValidState) => void;
};
export declare function useValidators<V>({ componentMessagingState, defaultValidState, deferredValidators, validators, addBusyState, onValidChanged }: UseValidatorsProps<V>): ValidationState<V>;
