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
import { InputText as PreactInputText } from '@oracle/oraclejet-preact/UNSAFE_InputText';
import { DisplayOptions, Help, HelpHints } from 'oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText';
import Converter from 'ojs/ojconverter';
import Validator from 'ojs/ojvalidator';
import AsyncValidator from 'ojs/ojvalidator-async';
import { ExtendGlobalProps, ObservedGlobalProps, PropertyChanged, ReadOnlyPropertyChanged, Slot } from 'ojs/ojvcomponent';
import { Component, ComponentProps } from 'preact';
import 'css!oj-c/input-text/input-text-styles.css';
declare type PreactInputTextProps = ComponentProps<typeof PreactInputText>;
declare type Length = {
    countBy?: 'codePoint' | 'codeUnit';
    max?: number | null;
};
declare type ValidState = 'valid' | 'pending' | 'invalidHidden' | 'invalidShown';
declare type Props<V> = ObservedGlobalProps<'aria-describedby' | 'autofocus' | 'id'> & {
    autocomplete?: 'on' | 'off' | string;
    clearIcon?: 'always' | 'never' | 'conditional';
    containerReadonly?: boolean;
    converter?: Converter<V> | null;
    disabled?: boolean;
    displayOptions?: DisplayOptions;
    end?: Slot;
    help?: Help;
    helpHints?: HelpHints;
    inputPrefix?: PreactInputTextProps['prefix'];
    inputSuffix?: PreactInputTextProps['suffix'];
    labelEdge?: PreactInputTextProps['labelEdge'];
    labelHint: string;
    labelStartWidth?: string;
    labelWrapping?: 'truncate' | 'wrap';
    length?: Length;
    messagesCustom?: PreactInputTextProps['messages'];
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    requiredMessageDetail?: string;
    start?: Slot;
    textAlign?: PreactInputTextProps['textAlign'];
    userAssistanceDensity?: PreactInputTextProps['userAssistanceDensity'];
    validators?: (AsyncValidator<V> | Validator<V>)[] | null;
    value?: V | null;
    virtualKeyboard?: PreactInputTextProps['virtualKeyboard'];
    onMessagesCustomChanged?: PropertyChanged<PreactInputTextProps['messages']>;
    onRawValueChanged?: ReadOnlyPropertyChanged<string>;
    onValidChanged?: ReadOnlyPropertyChanged<ValidState>;
    onValueChanged?: PropertyChanged<V>;
};
export declare class InputText<V> extends Component<ExtendGlobalProps<Props<V>>> {
    static defaultProps: Partial<Props<any>>;
    private busyContextRef;
    private inputTextRef;
    private rootRef;
    componentDidMount(): void;
    render(props: ExtendGlobalProps<Props<V>>): import("preact").JSX.Element;
    componentWillUnmount(): void;
    reset(): void;
    showMessages(): void;
    validate(): Promise<'valid' | 'invalid'>;
    blur(): void;
    focus(): void;
}
export declare type InputTextProps<V> = Props<V>;
export {};
export interface CInputTextElement<V> extends JetElement<CInputTextElementSettableProperties<V>>, CInputTextElementSettableProperties<V> {
    readonly rawValue?: Parameters<Required<Props<V>>['onRawValueChanged']>[0];
    readonly valid?: Parameters<Required<Props<V>>['onValidChanged']>[0];
    addEventListener<T extends keyof CInputTextElementEventMap<V>>(type: T, listener: (this: HTMLElement, ev: CInputTextElementEventMap<V>[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CInputTextElementSettableProperties<V>>(property: T): CInputTextElement<V>[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CInputTextElementSettableProperties<V>>(property: T, value: CInputTextElementSettableProperties<V>[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CInputTextElementSettableProperties<V>>): void;
    setProperties(properties: CInputTextElementSettablePropertiesLenient<V>): void;
    blur: InputText<V>['blur'];
    focus: InputText<V>['focus'];
    reset: InputText<V>['reset'];
    showMessages: InputText<V>['showMessages'];
    validate: InputText<V>['validate'];
}
export namespace CInputTextElement {
    type autocompleteChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['autocomplete']>;
    type clearIconChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['clearIcon']>;
    type containerReadonlyChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['containerReadonly']>;
    type converterChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['converter']>;
    type disabledChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['disabled']>;
    type displayOptionsChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['displayOptions']>;
    type helpChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['help']>;
    type helpHintsChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['helpHints']>;
    type inputPrefixChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['inputPrefix']>;
    type inputSuffixChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['inputSuffix']>;
    type labelEdgeChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['labelEdge']>;
    type labelHintChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['labelHint']>;
    type labelStartWidthChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['labelStartWidth']>;
    type labelWrappingChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['labelWrapping']>;
    type lengthChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['length']>;
    type messagesCustomChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['messagesCustom']>;
    type placeholderChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['placeholder']>;
    type rawValueChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['rawValue']>;
    type readonlyChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['readonly']>;
    type requiredChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['required']>;
    type requiredMessageDetailChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['requiredMessageDetail']>;
    type textAlignChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['textAlign']>;
    type userAssistanceDensityChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['userAssistanceDensity']>;
    type validChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['valid']>;
    type validatorsChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['validators']>;
    type valueChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['value']>;
    type virtualKeyboardChanged<V> = JetElementCustomEventStrict<CInputTextElement<V>['virtualKeyboard']>;
}
export interface CInputTextElementEventMap<V> extends HTMLElementEventMap {
    'autocompleteChanged': JetElementCustomEventStrict<CInputTextElement<V>['autocomplete']>;
    'clearIconChanged': JetElementCustomEventStrict<CInputTextElement<V>['clearIcon']>;
    'containerReadonlyChanged': JetElementCustomEventStrict<CInputTextElement<V>['containerReadonly']>;
    'converterChanged': JetElementCustomEventStrict<CInputTextElement<V>['converter']>;
    'disabledChanged': JetElementCustomEventStrict<CInputTextElement<V>['disabled']>;
    'displayOptionsChanged': JetElementCustomEventStrict<CInputTextElement<V>['displayOptions']>;
    'helpChanged': JetElementCustomEventStrict<CInputTextElement<V>['help']>;
    'helpHintsChanged': JetElementCustomEventStrict<CInputTextElement<V>['helpHints']>;
    'inputPrefixChanged': JetElementCustomEventStrict<CInputTextElement<V>['inputPrefix']>;
    'inputSuffixChanged': JetElementCustomEventStrict<CInputTextElement<V>['inputSuffix']>;
    'labelEdgeChanged': JetElementCustomEventStrict<CInputTextElement<V>['labelEdge']>;
    'labelHintChanged': JetElementCustomEventStrict<CInputTextElement<V>['labelHint']>;
    'labelStartWidthChanged': JetElementCustomEventStrict<CInputTextElement<V>['labelStartWidth']>;
    'labelWrappingChanged': JetElementCustomEventStrict<CInputTextElement<V>['labelWrapping']>;
    'lengthChanged': JetElementCustomEventStrict<CInputTextElement<V>['length']>;
    'messagesCustomChanged': JetElementCustomEventStrict<CInputTextElement<V>['messagesCustom']>;
    'placeholderChanged': JetElementCustomEventStrict<CInputTextElement<V>['placeholder']>;
    'rawValueChanged': JetElementCustomEventStrict<CInputTextElement<V>['rawValue']>;
    'readonlyChanged': JetElementCustomEventStrict<CInputTextElement<V>['readonly']>;
    'requiredChanged': JetElementCustomEventStrict<CInputTextElement<V>['required']>;
    'requiredMessageDetailChanged': JetElementCustomEventStrict<CInputTextElement<V>['requiredMessageDetail']>;
    'textAlignChanged': JetElementCustomEventStrict<CInputTextElement<V>['textAlign']>;
    'userAssistanceDensityChanged': JetElementCustomEventStrict<CInputTextElement<V>['userAssistanceDensity']>;
    'validChanged': JetElementCustomEventStrict<CInputTextElement<V>['valid']>;
    'validatorsChanged': JetElementCustomEventStrict<CInputTextElement<V>['validators']>;
    'valueChanged': JetElementCustomEventStrict<CInputTextElement<V>['value']>;
    'virtualKeyboardChanged': JetElementCustomEventStrict<CInputTextElement<V>['virtualKeyboard']>;
}
export interface CInputTextElementSettableProperties<V> extends JetSettableProperties {
    autocomplete?: Props<V>['autocomplete'];
    clearIcon?: Props<V>['clearIcon'];
    containerReadonly?: Props<V>['containerReadonly'];
    converter?: Props<V>['converter'];
    disabled?: Props<V>['disabled'];
    displayOptions?: Props<V>['displayOptions'];
    help?: Props<V>['help'];
    helpHints?: Props<V>['helpHints'];
    inputPrefix?: Props<V>['inputPrefix'];
    inputSuffix?: Props<V>['inputSuffix'];
    labelEdge?: Props<V>['labelEdge'];
    labelHint: Props<V>['labelHint'];
    labelStartWidth?: Props<V>['labelStartWidth'];
    labelWrapping?: Props<V>['labelWrapping'];
    length?: Props<V>['length'];
    messagesCustom?: Props<V>['messagesCustom'];
    placeholder?: Props<V>['placeholder'];
    readonly?: Props<V>['readonly'];
    required?: Props<V>['required'];
    requiredMessageDetail?: Props<V>['requiredMessageDetail'];
    textAlign?: Props<V>['textAlign'];
    userAssistanceDensity?: Props<V>['userAssistanceDensity'];
    validators?: Props<V>['validators'];
    value?: Props<V>['value'];
    virtualKeyboard?: Props<V>['virtualKeyboard'];
}
export interface CInputTextElementSettablePropertiesLenient<V> extends Partial<CInputTextElementSettableProperties<V>> {
    [key: string]: any;
}
export interface InputTextIntrinsicProps extends Partial<Readonly<CInputTextElementSettableProperties<any>>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    rawValue?: never;
    valid?: never;
    children?: import('preact').ComponentChildren;
    onautocompleteChanged?: (value: CInputTextElementEventMap<any>['autocompleteChanged']) => void;
    onclearIconChanged?: (value: CInputTextElementEventMap<any>['clearIconChanged']) => void;
    oncontainerReadonlyChanged?: (value: CInputTextElementEventMap<any>['containerReadonlyChanged']) => void;
    onconverterChanged?: (value: CInputTextElementEventMap<any>['converterChanged']) => void;
    ondisabledChanged?: (value: CInputTextElementEventMap<any>['disabledChanged']) => void;
    ondisplayOptionsChanged?: (value: CInputTextElementEventMap<any>['displayOptionsChanged']) => void;
    onhelpChanged?: (value: CInputTextElementEventMap<any>['helpChanged']) => void;
    onhelpHintsChanged?: (value: CInputTextElementEventMap<any>['helpHintsChanged']) => void;
    oninputPrefixChanged?: (value: CInputTextElementEventMap<any>['inputPrefixChanged']) => void;
    oninputSuffixChanged?: (value: CInputTextElementEventMap<any>['inputSuffixChanged']) => void;
    onlabelEdgeChanged?: (value: CInputTextElementEventMap<any>['labelEdgeChanged']) => void;
    onlabelHintChanged?: (value: CInputTextElementEventMap<any>['labelHintChanged']) => void;
    onlabelStartWidthChanged?: (value: CInputTextElementEventMap<any>['labelStartWidthChanged']) => void;
    onlabelWrappingChanged?: (value: CInputTextElementEventMap<any>['labelWrappingChanged']) => void;
    onlengthChanged?: (value: CInputTextElementEventMap<any>['lengthChanged']) => void;
    onmessagesCustomChanged?: (value: CInputTextElementEventMap<any>['messagesCustomChanged']) => void;
    onplaceholderChanged?: (value: CInputTextElementEventMap<any>['placeholderChanged']) => void;
    onrawValueChanged?: (value: CInputTextElementEventMap<any>['rawValueChanged']) => void;
    onreadonlyChanged?: (value: CInputTextElementEventMap<any>['readonlyChanged']) => void;
    onrequiredChanged?: (value: CInputTextElementEventMap<any>['requiredChanged']) => void;
    onrequiredMessageDetailChanged?: (value: CInputTextElementEventMap<any>['requiredMessageDetailChanged']) => void;
    ontextAlignChanged?: (value: CInputTextElementEventMap<any>['textAlignChanged']) => void;
    onuserAssistanceDensityChanged?: (value: CInputTextElementEventMap<any>['userAssistanceDensityChanged']) => void;
    onvalidChanged?: (value: CInputTextElementEventMap<any>['validChanged']) => void;
    onvalidatorsChanged?: (value: CInputTextElementEventMap<any>['validatorsChanged']) => void;
    onvalueChanged?: (value: CInputTextElementEventMap<any>['valueChanged']) => void;
    onvirtualKeyboardChanged?: (value: CInputTextElementEventMap<any>['virtualKeyboardChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-input-text': InputTextIntrinsicProps;
        }
    }
}
