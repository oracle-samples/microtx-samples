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
/// <reference types="ojvalidator-async" />
/// <reference types="ojvalidator" />
import { JetElement, JetSettableProperties, JetElementCustomEventStrict, JetSetPropertyType } from 'ojs/index';
import { GlobalProps } from 'ojs/ojvcomponent';
import 'ojs/oj-jsx-interfaces';
import { InputPassword as PreactInputPassword } from '@oracle/oraclejet-preact/UNSAFE_InputPassword';
import { DisplayOptions, Help, HelpHints } from 'oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText';
import Validator from 'ojs/ojvalidator';
import AsyncValidator from 'ojs/ojvalidator-async';
import { ExtendGlobalProps, ObservedGlobalProps, PropertyChanged, ReadOnlyPropertyChanged } from 'ojs/ojvcomponent';
import { Component, ComponentProps } from 'preact';
import 'css!oj-c/input-password/input-password-styles.css';
declare type PreactInputPasswordProps = ComponentProps<typeof PreactInputPassword>;
declare type ValidState = 'valid' | 'pending' | 'invalidHidden' | 'invalidShown';
declare type Props = ObservedGlobalProps<'aria-describedby' | 'autofocus' | 'id'> & {
    autocomplete?: 'on' | 'off' | string;
    clearIcon?: 'always' | 'never' | 'conditional';
    containerReadonly?: boolean;
    disabled?: boolean;
    displayOptions?: DisplayOptions;
    help?: Help;
    helpHints?: HelpHints;
    labelEdge?: PreactInputPasswordProps['labelEdge'];
    labelHint: string;
    labelStartWidth?: string;
    labelWrapping?: 'truncate' | 'wrap';
    maskIcon?: 'visible' | 'hidden';
    messagesCustom?: PreactInputPasswordProps['messages'];
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    requiredMessageDetail?: string;
    textAlign?: PreactInputPasswordProps['textAlign'];
    userAssistanceDensity?: PreactInputPasswordProps['userAssistanceDensity'];
    validators?: (AsyncValidator<string> | Validator<string>)[] | null;
    value?: string | null;
    onMessagesCustomChanged?: PropertyChanged<PreactInputPasswordProps['messages']>;
    onRawValueChanged?: ReadOnlyPropertyChanged<string>;
    onValidChanged?: ReadOnlyPropertyChanged<ValidState>;
    onValueChanged?: PropertyChanged<string>;
};
export declare class InputPassword extends Component<ExtendGlobalProps<Props>> {
    static defaultProps: Partial<Props>;
    private busyContextRef;
    private inputPasswordRef;
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
export declare type InputPasswordProps = Props;
export {};
export interface CInputPasswordElement extends JetElement<CInputPasswordElementSettableProperties>, CInputPasswordElementSettableProperties {
    readonly rawValue?: Parameters<Required<Props>['onRawValueChanged']>[0];
    readonly valid?: Parameters<Required<Props>['onValidChanged']>[0];
    addEventListener<T extends keyof CInputPasswordElementEventMap>(type: T, listener: (this: HTMLElement, ev: CInputPasswordElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CInputPasswordElementSettableProperties>(property: T): CInputPasswordElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CInputPasswordElementSettableProperties>(property: T, value: CInputPasswordElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CInputPasswordElementSettableProperties>): void;
    setProperties(properties: CInputPasswordElementSettablePropertiesLenient): void;
    blur: InputPassword['blur'];
    focus: InputPassword['focus'];
    reset: InputPassword['reset'];
    showMessages: InputPassword['showMessages'];
    validate: InputPassword['validate'];
}
export namespace CInputPasswordElement {
    type autocompleteChanged = JetElementCustomEventStrict<CInputPasswordElement['autocomplete']>;
    type clearIconChanged = JetElementCustomEventStrict<CInputPasswordElement['clearIcon']>;
    type containerReadonlyChanged = JetElementCustomEventStrict<CInputPasswordElement['containerReadonly']>;
    type disabledChanged = JetElementCustomEventStrict<CInputPasswordElement['disabled']>;
    type displayOptionsChanged = JetElementCustomEventStrict<CInputPasswordElement['displayOptions']>;
    type helpChanged = JetElementCustomEventStrict<CInputPasswordElement['help']>;
    type helpHintsChanged = JetElementCustomEventStrict<CInputPasswordElement['helpHints']>;
    type labelEdgeChanged = JetElementCustomEventStrict<CInputPasswordElement['labelEdge']>;
    type labelHintChanged = JetElementCustomEventStrict<CInputPasswordElement['labelHint']>;
    type labelStartWidthChanged = JetElementCustomEventStrict<CInputPasswordElement['labelStartWidth']>;
    type labelWrappingChanged = JetElementCustomEventStrict<CInputPasswordElement['labelWrapping']>;
    type maskIconChanged = JetElementCustomEventStrict<CInputPasswordElement['maskIcon']>;
    type messagesCustomChanged = JetElementCustomEventStrict<CInputPasswordElement['messagesCustom']>;
    type placeholderChanged = JetElementCustomEventStrict<CInputPasswordElement['placeholder']>;
    type rawValueChanged = JetElementCustomEventStrict<CInputPasswordElement['rawValue']>;
    type readonlyChanged = JetElementCustomEventStrict<CInputPasswordElement['readonly']>;
    type requiredChanged = JetElementCustomEventStrict<CInputPasswordElement['required']>;
    type requiredMessageDetailChanged = JetElementCustomEventStrict<CInputPasswordElement['requiredMessageDetail']>;
    type textAlignChanged = JetElementCustomEventStrict<CInputPasswordElement['textAlign']>;
    type userAssistanceDensityChanged = JetElementCustomEventStrict<CInputPasswordElement['userAssistanceDensity']>;
    type validChanged = JetElementCustomEventStrict<CInputPasswordElement['valid']>;
    type validatorsChanged = JetElementCustomEventStrict<CInputPasswordElement['validators']>;
    type valueChanged = JetElementCustomEventStrict<CInputPasswordElement['value']>;
}
export interface CInputPasswordElementEventMap extends HTMLElementEventMap {
    'autocompleteChanged': JetElementCustomEventStrict<CInputPasswordElement['autocomplete']>;
    'clearIconChanged': JetElementCustomEventStrict<CInputPasswordElement['clearIcon']>;
    'containerReadonlyChanged': JetElementCustomEventStrict<CInputPasswordElement['containerReadonly']>;
    'disabledChanged': JetElementCustomEventStrict<CInputPasswordElement['disabled']>;
    'displayOptionsChanged': JetElementCustomEventStrict<CInputPasswordElement['displayOptions']>;
    'helpChanged': JetElementCustomEventStrict<CInputPasswordElement['help']>;
    'helpHintsChanged': JetElementCustomEventStrict<CInputPasswordElement['helpHints']>;
    'labelEdgeChanged': JetElementCustomEventStrict<CInputPasswordElement['labelEdge']>;
    'labelHintChanged': JetElementCustomEventStrict<CInputPasswordElement['labelHint']>;
    'labelStartWidthChanged': JetElementCustomEventStrict<CInputPasswordElement['labelStartWidth']>;
    'labelWrappingChanged': JetElementCustomEventStrict<CInputPasswordElement['labelWrapping']>;
    'maskIconChanged': JetElementCustomEventStrict<CInputPasswordElement['maskIcon']>;
    'messagesCustomChanged': JetElementCustomEventStrict<CInputPasswordElement['messagesCustom']>;
    'placeholderChanged': JetElementCustomEventStrict<CInputPasswordElement['placeholder']>;
    'rawValueChanged': JetElementCustomEventStrict<CInputPasswordElement['rawValue']>;
    'readonlyChanged': JetElementCustomEventStrict<CInputPasswordElement['readonly']>;
    'requiredChanged': JetElementCustomEventStrict<CInputPasswordElement['required']>;
    'requiredMessageDetailChanged': JetElementCustomEventStrict<CInputPasswordElement['requiredMessageDetail']>;
    'textAlignChanged': JetElementCustomEventStrict<CInputPasswordElement['textAlign']>;
    'userAssistanceDensityChanged': JetElementCustomEventStrict<CInputPasswordElement['userAssistanceDensity']>;
    'validChanged': JetElementCustomEventStrict<CInputPasswordElement['valid']>;
    'validatorsChanged': JetElementCustomEventStrict<CInputPasswordElement['validators']>;
    'valueChanged': JetElementCustomEventStrict<CInputPasswordElement['value']>;
}
export interface CInputPasswordElementSettableProperties extends JetSettableProperties {
    autocomplete?: Props['autocomplete'];
    clearIcon?: Props['clearIcon'];
    containerReadonly?: Props['containerReadonly'];
    disabled?: Props['disabled'];
    displayOptions?: Props['displayOptions'];
    help?: Props['help'];
    helpHints?: Props['helpHints'];
    labelEdge?: Props['labelEdge'];
    labelHint: Props['labelHint'];
    labelStartWidth?: Props['labelStartWidth'];
    labelWrapping?: Props['labelWrapping'];
    maskIcon?: Props['maskIcon'];
    messagesCustom?: Props['messagesCustom'];
    placeholder?: Props['placeholder'];
    readonly?: Props['readonly'];
    required?: Props['required'];
    requiredMessageDetail?: Props['requiredMessageDetail'];
    textAlign?: Props['textAlign'];
    userAssistanceDensity?: Props['userAssistanceDensity'];
    validators?: Props['validators'];
    value?: Props['value'];
}
export interface CInputPasswordElementSettablePropertiesLenient extends Partial<CInputPasswordElementSettableProperties> {
    [key: string]: any;
}
export interface InputPasswordIntrinsicProps extends Partial<Readonly<CInputPasswordElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    rawValue?: never;
    valid?: never;
    onautocompleteChanged?: (value: CInputPasswordElementEventMap['autocompleteChanged']) => void;
    onclearIconChanged?: (value: CInputPasswordElementEventMap['clearIconChanged']) => void;
    oncontainerReadonlyChanged?: (value: CInputPasswordElementEventMap['containerReadonlyChanged']) => void;
    ondisabledChanged?: (value: CInputPasswordElementEventMap['disabledChanged']) => void;
    ondisplayOptionsChanged?: (value: CInputPasswordElementEventMap['displayOptionsChanged']) => void;
    onhelpChanged?: (value: CInputPasswordElementEventMap['helpChanged']) => void;
    onhelpHintsChanged?: (value: CInputPasswordElementEventMap['helpHintsChanged']) => void;
    onlabelEdgeChanged?: (value: CInputPasswordElementEventMap['labelEdgeChanged']) => void;
    onlabelHintChanged?: (value: CInputPasswordElementEventMap['labelHintChanged']) => void;
    onlabelStartWidthChanged?: (value: CInputPasswordElementEventMap['labelStartWidthChanged']) => void;
    onlabelWrappingChanged?: (value: CInputPasswordElementEventMap['labelWrappingChanged']) => void;
    onmaskIconChanged?: (value: CInputPasswordElementEventMap['maskIconChanged']) => void;
    onmessagesCustomChanged?: (value: CInputPasswordElementEventMap['messagesCustomChanged']) => void;
    onplaceholderChanged?: (value: CInputPasswordElementEventMap['placeholderChanged']) => void;
    onrawValueChanged?: (value: CInputPasswordElementEventMap['rawValueChanged']) => void;
    onreadonlyChanged?: (value: CInputPasswordElementEventMap['readonlyChanged']) => void;
    onrequiredChanged?: (value: CInputPasswordElementEventMap['requiredChanged']) => void;
    onrequiredMessageDetailChanged?: (value: CInputPasswordElementEventMap['requiredMessageDetailChanged']) => void;
    ontextAlignChanged?: (value: CInputPasswordElementEventMap['textAlignChanged']) => void;
    onuserAssistanceDensityChanged?: (value: CInputPasswordElementEventMap['userAssistanceDensityChanged']) => void;
    onvalidChanged?: (value: CInputPasswordElementEventMap['validChanged']) => void;
    onvalidatorsChanged?: (value: CInputPasswordElementEventMap['validatorsChanged']) => void;
    onvalueChanged?: (value: CInputPasswordElementEventMap['valueChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-input-password': InputPasswordIntrinsicProps;
        }
    }
}
