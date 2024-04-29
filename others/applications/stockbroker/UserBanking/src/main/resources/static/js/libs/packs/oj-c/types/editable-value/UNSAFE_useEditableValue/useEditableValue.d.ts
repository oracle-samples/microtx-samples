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
import { ValueUpdateDetail } from '@oracle/oraclejet-preact/utils/UNSAFE_valueUpdateDetail';
import { UseComponentMessagingProps } from '../UNSAFE_useComponentMessaging/useComponentMessaging';
import { ConverterErrorSymbol, UseConverterProps } from '../UNSAFE_useConverter/useConverter';
import { UseValidatorsProps, ValidationResult } from '../UNSAFE_useValidators/useValidators';
import { UseValueProps, ValueState } from '../UNSAFE_useValue/useValue';
import { ValidatorLike } from '../UNSAFE_useValidators/useValidators';
declare type PickedComponentMessagingProps = Pick<UseComponentMessagingProps, 'messagesCustom' | 'onMessagesCustomChanged'>;
declare type PickedConverterProps<V> = Pick<UseConverterProps<V>, 'converter'>;
declare type PickedValidatorsProps<V> = Pick<UseValidatorsProps<V>, 'validators' | 'addBusyState' | 'onValidChanged'>;
declare type PickedValueProps<V> = Pick<UseValueProps<V>, 'onRawValueChanged' | 'onTransientValueChanged' | 'onValueChanged' | 'value'>;
declare type AriaProps = {
    ariaDescribedBy?: string;
};
export declare type UseEditableValueProps<V> = PickedComponentMessagingProps & PickedConverterProps<V> & PickedValidatorsProps<V> & PickedValueProps<V> & AriaProps & {
    displayOptions?: {
        messages?: 'display' | 'none';
    };
    implicitComponentValidator?: ValidatorLike<V>;
    labelHint?: string;
    required?: boolean;
    requiredMessageDetail?: string;
    shouldNormalizeValueOnCommit?: boolean;
    wrapValueState?: (valueState: ValueState<V>) => ValueState<V>;
};
export declare function useEditableValue<V>({ ariaDescribedBy, converter, displayOptions, implicitComponentValidator, labelHint, messagesCustom, required, requiredMessageDetail, shouldNormalizeValueOnCommit, validators, value: valueProp, addBusyState, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged, onTransientValueChanged, wrapValueState }: UseEditableValueProps<V>): {
    value: V;
    setValue: import("preact/hooks").StateUpdater<V>;
    displayValue: string;
    setDisplayValue: import("preact/hooks").StateUpdater<string>;
    setTransientValue: import("preact/hooks").StateUpdater<V>;
    methods: {
        reset: () => void;
        validate: () => Promise<'valid' | 'invalid'>;
        showMessages: () => void;
    };
    textFieldProps: {
        messages: import("@oracle/oraclejet-preact/UNSAFE_ComponentMessage").ComponentMessageItem[] | undefined;
        value: string;
        ariaDescribedBy: string | undefined;
        onCommit: ({ value }: ValueUpdateDetail<string>) => Promise<void>;
        onInput: ({ value }: ValueUpdateDetail<string>) => void;
    };
    onCommitValue: (value: V, doCommitOnValid?: boolean) => Promise<ValidationResult>;
    format: (value: V, shouldSuppressError?: boolean) => string | null | undefined;
    normalizeAndParseValue: (value: string) => typeof ConverterErrorSymbol | V | null;
};
export {};
