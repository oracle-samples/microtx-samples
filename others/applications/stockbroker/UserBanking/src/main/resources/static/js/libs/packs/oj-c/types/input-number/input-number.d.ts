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
/// <reference types="ojconverter" />
/// <reference types="ojvalidator-async" />
/// <reference types="ojvalidator" />
import { JetElement, JetSettableProperties, JetElementCustomEventStrict, JetSetPropertyType } from 'ojs/index';
import { GlobalProps } from 'ojs/ojvcomponent';
import 'ojs/oj-jsx-interfaces';
import { NumberInputText as PreactNumberInputText } from '@oracle/oraclejet-preact/UNSAFE_NumberInputText';
import { DisplayOptions, Help, HelpHints } from 'oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText';
import Converter from 'ojs/ojconverter';
import Validator from 'ojs/ojvalidator';
import AsyncValidator from 'ojs/ojvalidator-async';
import { ExtendGlobalProps, ObservedGlobalProps, PropertyChanged, ReadOnlyPropertyChanged } from 'ojs/ojvcomponent';
import { Component, ComponentProps } from 'preact';
import 'css!oj-c/input-number/input-number-styles.css';
declare type PreactNumberInputTextProps = ComponentProps<typeof PreactNumberInputText>;
declare type ValidState = 'valid' | 'pending' | 'invalidHidden' | 'invalidShown';
declare type Props = ObservedGlobalProps<'aria-describedby' | 'autofocus' | 'id'> & {
    autocomplete?: 'on' | 'off' | string;
    containerReadonly?: boolean;
    converter?: Converter<number> | null;
    disabled?: boolean;
    displayOptions?: DisplayOptions;
    help?: Help;
    helpHints?: HelpHints;
    inputPrefix?: PreactNumberInputTextProps['prefix'];
    inputSuffix?: PreactNumberInputTextProps['suffix'];
    labelEdge?: PreactNumberInputTextProps['labelEdge'];
    labelHint: string;
    labelStartWidth?: string;
    labelWrapping?: 'truncate' | 'wrap';
    max?: number | null;
    min?: number | null;
    messagesCustom?: PreactNumberInputTextProps['messages'];
    numberRangeExactMessageDetail?: string;
    numberRangeOverflowMessageDetail?: string;
    numberRangeUnderflowMessageDetail?: string;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    requiredMessageDetail?: string;
    step?: number;
    textAlign?: PreactNumberInputTextProps['textAlign'];
    userAssistanceDensity?: PreactNumberInputTextProps['userAssistanceDensity'];
    validators?: (AsyncValidator<number> | Validator<number>)[] | null;
    value?: number | null;
    virtualKeyboard?: PreactNumberInputTextProps['virtualKeyboard'];
    onMessagesCustomChanged?: PropertyChanged<PreactNumberInputTextProps['messages']>;
    onRawValueChanged?: ReadOnlyPropertyChanged<string>;
    onTransientValueChanged?: ReadOnlyPropertyChanged<number>;
    onValidChanged?: ReadOnlyPropertyChanged<ValidState>;
    onValueChanged?: PropertyChanged<number>;
};
export declare class InputNumber extends Component<ExtendGlobalProps<Props>> {
    static defaultProps: Partial<Props>;
    private busyContextRef;
    private inputNumberRef;
    private rootRef;
    componentDidMount(): void;
    render(props: ExtendGlobalProps<Props>): import("preact").JSX.Element;
    componentWillUnmount(): void;
    reset(): void;
    showMessages(): void;
    validate(): Promise<'valid' | 'invalid'>;
    blur(): void;
    focus(): void;
}
export declare type InputNumberProps = Props;
export {};
export interface CInputNumberElement extends JetElement<CInputNumberElementSettableProperties>, CInputNumberElementSettableProperties {
    readonly rawValue?: Parameters<Required<Props>['onRawValueChanged']>[0];
    readonly transientValue?: Parameters<Required<Props>['onTransientValueChanged']>[0];
    readonly valid?: Parameters<Required<Props>['onValidChanged']>[0];
    addEventListener<T extends keyof CInputNumberElementEventMap>(type: T, listener: (this: HTMLElement, ev: CInputNumberElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CInputNumberElementSettableProperties>(property: T): CInputNumberElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CInputNumberElementSettableProperties>(property: T, value: CInputNumberElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CInputNumberElementSettableProperties>): void;
    setProperties(properties: CInputNumberElementSettablePropertiesLenient): void;
    blur: InputNumber['blur'];
    focus: InputNumber['focus'];
    reset: InputNumber['reset'];
    showMessages: InputNumber['showMessages'];
    validate: InputNumber['validate'];
}
export namespace CInputNumberElement {
    type autocompleteChanged = JetElementCustomEventStrict<CInputNumberElement['autocomplete']>;
    type containerReadonlyChanged = JetElementCustomEventStrict<CInputNumberElement['containerReadonly']>;
    type converterChanged = JetElementCustomEventStrict<CInputNumberElement['converter']>;
    type disabledChanged = JetElementCustomEventStrict<CInputNumberElement['disabled']>;
    type displayOptionsChanged = JetElementCustomEventStrict<CInputNumberElement['displayOptions']>;
    type helpChanged = JetElementCustomEventStrict<CInputNumberElement['help']>;
    type helpHintsChanged = JetElementCustomEventStrict<CInputNumberElement['helpHints']>;
    type inputPrefixChanged = JetElementCustomEventStrict<CInputNumberElement['inputPrefix']>;
    type inputSuffixChanged = JetElementCustomEventStrict<CInputNumberElement['inputSuffix']>;
    type labelEdgeChanged = JetElementCustomEventStrict<CInputNumberElement['labelEdge']>;
    type labelHintChanged = JetElementCustomEventStrict<CInputNumberElement['labelHint']>;
    type labelStartWidthChanged = JetElementCustomEventStrict<CInputNumberElement['labelStartWidth']>;
    type labelWrappingChanged = JetElementCustomEventStrict<CInputNumberElement['labelWrapping']>;
    type maxChanged = JetElementCustomEventStrict<CInputNumberElement['max']>;
    type messagesCustomChanged = JetElementCustomEventStrict<CInputNumberElement['messagesCustom']>;
    type minChanged = JetElementCustomEventStrict<CInputNumberElement['min']>;
    type numberRangeExactMessageDetailChanged = JetElementCustomEventStrict<CInputNumberElement['numberRangeExactMessageDetail']>;
    type numberRangeOverflowMessageDetailChanged = JetElementCustomEventStrict<CInputNumberElement['numberRangeOverflowMessageDetail']>;
    type numberRangeUnderflowMessageDetailChanged = JetElementCustomEventStrict<CInputNumberElement['numberRangeUnderflowMessageDetail']>;
    type placeholderChanged = JetElementCustomEventStrict<CInputNumberElement['placeholder']>;
    type rawValueChanged = JetElementCustomEventStrict<CInputNumberElement['rawValue']>;
    type readonlyChanged = JetElementCustomEventStrict<CInputNumberElement['readonly']>;
    type requiredChanged = JetElementCustomEventStrict<CInputNumberElement['required']>;
    type requiredMessageDetailChanged = JetElementCustomEventStrict<CInputNumberElement['requiredMessageDetail']>;
    type stepChanged = JetElementCustomEventStrict<CInputNumberElement['step']>;
    type textAlignChanged = JetElementCustomEventStrict<CInputNumberElement['textAlign']>;
    type transientValueChanged = JetElementCustomEventStrict<CInputNumberElement['transientValue']>;
    type userAssistanceDensityChanged = JetElementCustomEventStrict<CInputNumberElement['userAssistanceDensity']>;
    type validChanged = JetElementCustomEventStrict<CInputNumberElement['valid']>;
    type validatorsChanged = JetElementCustomEventStrict<CInputNumberElement['validators']>;
    type valueChanged = JetElementCustomEventStrict<CInputNumberElement['value']>;
    type virtualKeyboardChanged = JetElementCustomEventStrict<CInputNumberElement['virtualKeyboard']>;
}
export interface CInputNumberElementEventMap extends HTMLElementEventMap {
    'autocompleteChanged': JetElementCustomEventStrict<CInputNumberElement['autocomplete']>;
    'containerReadonlyChanged': JetElementCustomEventStrict<CInputNumberElement['containerReadonly']>;
    'converterChanged': JetElementCustomEventStrict<CInputNumberElement['converter']>;
    'disabledChanged': JetElementCustomEventStrict<CInputNumberElement['disabled']>;
    'displayOptionsChanged': JetElementCustomEventStrict<CInputNumberElement['displayOptions']>;
    'helpChanged': JetElementCustomEventStrict<CInputNumberElement['help']>;
    'helpHintsChanged': JetElementCustomEventStrict<CInputNumberElement['helpHints']>;
    'inputPrefixChanged': JetElementCustomEventStrict<CInputNumberElement['inputPrefix']>;
    'inputSuffixChanged': JetElementCustomEventStrict<CInputNumberElement['inputSuffix']>;
    'labelEdgeChanged': JetElementCustomEventStrict<CInputNumberElement['labelEdge']>;
    'labelHintChanged': JetElementCustomEventStrict<CInputNumberElement['labelHint']>;
    'labelStartWidthChanged': JetElementCustomEventStrict<CInputNumberElement['labelStartWidth']>;
    'labelWrappingChanged': JetElementCustomEventStrict<CInputNumberElement['labelWrapping']>;
    'maxChanged': JetElementCustomEventStrict<CInputNumberElement['max']>;
    'messagesCustomChanged': JetElementCustomEventStrict<CInputNumberElement['messagesCustom']>;
    'minChanged': JetElementCustomEventStrict<CInputNumberElement['min']>;
    'numberRangeExactMessageDetailChanged': JetElementCustomEventStrict<CInputNumberElement['numberRangeExactMessageDetail']>;
    'numberRangeOverflowMessageDetailChanged': JetElementCustomEventStrict<CInputNumberElement['numberRangeOverflowMessageDetail']>;
    'numberRangeUnderflowMessageDetailChanged': JetElementCustomEventStrict<CInputNumberElement['numberRangeUnderflowMessageDetail']>;
    'placeholderChanged': JetElementCustomEventStrict<CInputNumberElement['placeholder']>;
    'rawValueChanged': JetElementCustomEventStrict<CInputNumberElement['rawValue']>;
    'readonlyChanged': JetElementCustomEventStrict<CInputNumberElement['readonly']>;
    'requiredChanged': JetElementCustomEventStrict<CInputNumberElement['required']>;
    'requiredMessageDetailChanged': JetElementCustomEventStrict<CInputNumberElement['requiredMessageDetail']>;
    'stepChanged': JetElementCustomEventStrict<CInputNumberElement['step']>;
    'textAlignChanged': JetElementCustomEventStrict<CInputNumberElement['textAlign']>;
    'transientValueChanged': JetElementCustomEventStrict<CInputNumberElement['transientValue']>;
    'userAssistanceDensityChanged': JetElementCustomEventStrict<CInputNumberElement['userAssistanceDensity']>;
    'validChanged': JetElementCustomEventStrict<CInputNumberElement['valid']>;
    'validatorsChanged': JetElementCustomEventStrict<CInputNumberElement['validators']>;
    'valueChanged': JetElementCustomEventStrict<CInputNumberElement['value']>;
    'virtualKeyboardChanged': JetElementCustomEventStrict<CInputNumberElement['virtualKeyboard']>;
}
export interface CInputNumberElementSettableProperties extends JetSettableProperties {
    autocomplete?: Props['autocomplete'];
    containerReadonly?: Props['containerReadonly'];
    converter?: Props['converter'];
    disabled?: Props['disabled'];
    displayOptions?: Props['displayOptions'];
    help?: Props['help'];
    helpHints?: Props['helpHints'];
    inputPrefix?: Props['inputPrefix'];
    inputSuffix?: Props['inputSuffix'];
    labelEdge?: Props['labelEdge'];
    labelHint: Props['labelHint'];
    labelStartWidth?: Props['labelStartWidth'];
    labelWrapping?: Props['labelWrapping'];
    max?: Props['max'];
    messagesCustom?: Props['messagesCustom'];
    min?: Props['min'];
    numberRangeExactMessageDetail?: Props['numberRangeExactMessageDetail'];
    numberRangeOverflowMessageDetail?: Props['numberRangeOverflowMessageDetail'];
    numberRangeUnderflowMessageDetail?: Props['numberRangeUnderflowMessageDetail'];
    placeholder?: Props['placeholder'];
    readonly?: Props['readonly'];
    required?: Props['required'];
    requiredMessageDetail?: Props['requiredMessageDetail'];
    step?: Props['step'];
    textAlign?: Props['textAlign'];
    userAssistanceDensity?: Props['userAssistanceDensity'];
    validators?: Props['validators'];
    value?: Props['value'];
    virtualKeyboard?: Props['virtualKeyboard'];
}
export interface CInputNumberElementSettablePropertiesLenient extends Partial<CInputNumberElementSettableProperties> {
    [key: string]: any;
}
export interface InputNumberIntrinsicProps extends Partial<Readonly<CInputNumberElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    rawValue?: never;
    transientValue?: never;
    valid?: never;
    onautocompleteChanged?: (value: CInputNumberElementEventMap['autocompleteChanged']) => void;
    oncontainerReadonlyChanged?: (value: CInputNumberElementEventMap['containerReadonlyChanged']) => void;
    onconverterChanged?: (value: CInputNumberElementEventMap['converterChanged']) => void;
    ondisabledChanged?: (value: CInputNumberElementEventMap['disabledChanged']) => void;
    ondisplayOptionsChanged?: (value: CInputNumberElementEventMap['displayOptionsChanged']) => void;
    onhelpChanged?: (value: CInputNumberElementEventMap['helpChanged']) => void;
    onhelpHintsChanged?: (value: CInputNumberElementEventMap['helpHintsChanged']) => void;
    oninputPrefixChanged?: (value: CInputNumberElementEventMap['inputPrefixChanged']) => void;
    oninputSuffixChanged?: (value: CInputNumberElementEventMap['inputSuffixChanged']) => void;
    onlabelEdgeChanged?: (value: CInputNumberElementEventMap['labelEdgeChanged']) => void;
    onlabelHintChanged?: (value: CInputNumberElementEventMap['labelHintChanged']) => void;
    onlabelStartWidthChanged?: (value: CInputNumberElementEventMap['labelStartWidthChanged']) => void;
    onlabelWrappingChanged?: (value: CInputNumberElementEventMap['labelWrappingChanged']) => void;
    onmaxChanged?: (value: CInputNumberElementEventMap['maxChanged']) => void;
    onmessagesCustomChanged?: (value: CInputNumberElementEventMap['messagesCustomChanged']) => void;
    onminChanged?: (value: CInputNumberElementEventMap['minChanged']) => void;
    onnumberRangeExactMessageDetailChanged?: (value: CInputNumberElementEventMap['numberRangeExactMessageDetailChanged']) => void;
    onnumberRangeOverflowMessageDetailChanged?: (value: CInputNumberElementEventMap['numberRangeOverflowMessageDetailChanged']) => void;
    onnumberRangeUnderflowMessageDetailChanged?: (value: CInputNumberElementEventMap['numberRangeUnderflowMessageDetailChanged']) => void;
    onplaceholderChanged?: (value: CInputNumberElementEventMap['placeholderChanged']) => void;
    onrawValueChanged?: (value: CInputNumberElementEventMap['rawValueChanged']) => void;
    onreadonlyChanged?: (value: CInputNumberElementEventMap['readonlyChanged']) => void;
    onrequiredChanged?: (value: CInputNumberElementEventMap['requiredChanged']) => void;
    onrequiredMessageDetailChanged?: (value: CInputNumberElementEventMap['requiredMessageDetailChanged']) => void;
    onstepChanged?: (value: CInputNumberElementEventMap['stepChanged']) => void;
    ontextAlignChanged?: (value: CInputNumberElementEventMap['textAlignChanged']) => void;
    ontransientValueChanged?: (value: CInputNumberElementEventMap['transientValueChanged']) => void;
    onuserAssistanceDensityChanged?: (value: CInputNumberElementEventMap['userAssistanceDensityChanged']) => void;
    onvalidChanged?: (value: CInputNumberElementEventMap['validChanged']) => void;
    onvalidatorsChanged?: (value: CInputNumberElementEventMap['validatorsChanged']) => void;
    onvalueChanged?: (value: CInputNumberElementEventMap['valueChanged']) => void;
    onvirtualKeyboardChanged?: (value: CInputNumberElementEventMap['virtualKeyboardChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-input-number': InputNumberIntrinsicProps;
        }
    }
}
