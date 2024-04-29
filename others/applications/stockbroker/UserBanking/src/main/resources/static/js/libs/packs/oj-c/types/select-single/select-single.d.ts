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
import { JetElement, JetSettableProperties, JetElementCustomEventStrict, JetSetPropertyType } from 'ojs/index';
import { GlobalProps } from 'ojs/ojvcomponent';
import 'ojs/oj-jsx-interfaces';
import { SelectSingle as PreactSelectSingle } from '@oracle/oraclejet-preact/UNSAFE_SelectSingle';
import { DisplayOptions, Help, HelpHints } from 'oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText';
import { ItemContext } from 'ojs/ojcommontypes';
import { DataProvider } from 'ojs/ojdataprovider';
import { Action, ExtendGlobalProps, ObservedGlobalProps, PropertyChanged, ReadOnlyPropertyChanged } from 'ojs/ojvcomponent';
import { Component, ComponentProps } from 'preact';
import 'css!./select-single-styles.css';
declare type PreactSelectSingleProps = ComponentProps<typeof PreactSelectSingle>;
declare type ValidState = 'valid' | 'pending' | 'invalidHidden' | 'invalidShown';
declare type ValueActionPayload<V, D> = {
    itemContext: ItemContext<V, D> | null;
    previousValue: V | null;
    value: V | null;
};
declare type Props<V extends string | number, D extends Record<string, any>> = ObservedGlobalProps<'aria-describedby' | 'id'> & {
    containerReadonly?: boolean;
    data?: DataProvider<V, D> | null;
    disabled?: boolean;
    displayOptions?: Omit<DisplayOptions, 'converterHint' | 'validatorHint'>;
    help?: Help;
    helpHints?: HelpHints;
    itemText: keyof D | ((itemContext: ItemContext<V, D>) => string);
    labelEdge?: PreactSelectSingleProps['labelEdge'];
    labelHint: string;
    labelStartWidth?: string;
    labelWrapping?: 'truncate' | 'wrap';
    messagesCustom?: PreactSelectSingleProps['messages'];
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    requiredMessageDetail?: string;
    textAlign?: PreactSelectSingleProps['textAlign'];
    userAssistanceDensity?: PreactSelectSingleProps['userAssistanceDensity'];
    value?: V | null;
    valueItem?: ItemContext<V, D> | null;
    virtualKeyboard?: PreactSelectSingleProps['virtualKeyboard'];
    onMessagesCustomChanged?: PropertyChanged<PreactSelectSingleProps['messages']>;
    onValidChanged?: ReadOnlyPropertyChanged<ValidState>;
    onValueChanged?: PropertyChanged<V | null | undefined>;
    onValueItemChanged?: PropertyChanged<ItemContext<V, D> | null | undefined>;
    onOjValueAction?: Action<ValueActionPayload<V, D>>;
};
export declare class SelectSingle<V extends string | number, D extends Record<string, any>> extends Component<ExtendGlobalProps<Props<V, D>>> {
    static defaultProps: Pick<Props<any, any>, 'data' | 'disabled' | 'displayOptions' | 'help' | 'helpHints' | 'messagesCustom' | 'readonly' | 'required' | 'requiredMessageDetail' | 'userAssistanceDensity' | 'value' | 'valueItem' | 'virtualKeyboard'>;
    private busyContextRef;
    private selectSingleRef;
    private rootRef;
    componentDidMount(): void;
    render(props: ExtendGlobalProps<Props<V, D>>): import("preact").JSX.Element;
    componentWillUnmount(): void;
    reset(): void;
    showMessages(): void;
    validate(): Promise<'valid' | 'invalid'>;
    blur(): void;
    focus(): void;
}
export declare type SelectSingleProps<V extends string | number, D extends Record<string, any>> = Props<V, D>;
export {};
export interface CSelectSingleElement<V extends string | number, D extends Record<string, any>> extends JetElement<CSelectSingleElementSettableProperties<V, D>>, CSelectSingleElementSettableProperties<V, D> {
    readonly valid?: Parameters<Required<Props<V, D>>['onValidChanged']>[0];
    addEventListener<T extends keyof CSelectSingleElementEventMap<V, D>>(type: T, listener: (this: HTMLElement, ev: CSelectSingleElementEventMap<V, D>[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CSelectSingleElementSettableProperties<V, D>>(property: T): CSelectSingleElement<V, D>[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CSelectSingleElementSettableProperties<V, D>>(property: T, value: CSelectSingleElementSettableProperties<V, D>[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CSelectSingleElementSettableProperties<V, D>>): void;
    setProperties(properties: CSelectSingleElementSettablePropertiesLenient<V, D>): void;
    blur: SelectSingle<V, D>['blur'];
    focus: SelectSingle<V, D>['focus'];
    reset: SelectSingle<V, D>['reset'];
    showMessages: SelectSingle<V, D>['showMessages'];
    validate: SelectSingle<V, D>['validate'];
}
export namespace CSelectSingleElement {
    interface ojValueAction<V extends string | number, D extends Record<string, any>> extends CustomEvent<ValueActionPayload<V, D> & {}> {
    }
    type containerReadonlyChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['containerReadonly']>;
    type dataChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['data']>;
    type disabledChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['disabled']>;
    type displayOptionsChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['displayOptions']>;
    type helpChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['help']>;
    type helpHintsChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['helpHints']>;
    type itemTextChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['itemText']>;
    type labelEdgeChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['labelEdge']>;
    type labelHintChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['labelHint']>;
    type labelStartWidthChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['labelStartWidth']>;
    type labelWrappingChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['labelWrapping']>;
    type messagesCustomChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['messagesCustom']>;
    type placeholderChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['placeholder']>;
    type readonlyChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['readonly']>;
    type requiredChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['required']>;
    type requiredMessageDetailChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['requiredMessageDetail']>;
    type textAlignChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['textAlign']>;
    type userAssistanceDensityChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['userAssistanceDensity']>;
    type validChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['valid']>;
    type valueChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['value']>;
    type valueItemChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['valueItem']>;
    type virtualKeyboardChanged<V extends string | number, D extends Record<string, any>> = JetElementCustomEventStrict<CSelectSingleElement<V, D>['virtualKeyboard']>;
}
export interface CSelectSingleElementEventMap<V extends string | number, D extends Record<string, any>> extends HTMLElementEventMap {
    'ojValueAction': CSelectSingleElement.ojValueAction<V, D>;
    'containerReadonlyChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['containerReadonly']>;
    'dataChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['data']>;
    'disabledChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['disabled']>;
    'displayOptionsChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['displayOptions']>;
    'helpChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['help']>;
    'helpHintsChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['helpHints']>;
    'itemTextChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['itemText']>;
    'labelEdgeChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['labelEdge']>;
    'labelHintChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['labelHint']>;
    'labelStartWidthChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['labelStartWidth']>;
    'labelWrappingChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['labelWrapping']>;
    'messagesCustomChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['messagesCustom']>;
    'placeholderChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['placeholder']>;
    'readonlyChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['readonly']>;
    'requiredChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['required']>;
    'requiredMessageDetailChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['requiredMessageDetail']>;
    'textAlignChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['textAlign']>;
    'userAssistanceDensityChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['userAssistanceDensity']>;
    'validChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['valid']>;
    'valueChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['value']>;
    'valueItemChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['valueItem']>;
    'virtualKeyboardChanged': JetElementCustomEventStrict<CSelectSingleElement<V, D>['virtualKeyboard']>;
}
export interface CSelectSingleElementSettableProperties<V extends string | number, D extends Record<string, any>> extends JetSettableProperties {
    containerReadonly?: Props<V, D>['containerReadonly'];
    data?: Props<V, D>['data'];
    disabled?: Props<V, D>['disabled'];
    displayOptions?: Props<V, D>['displayOptions'];
    help?: Props<V, D>['help'];
    helpHints?: Props<V, D>['helpHints'];
    itemText: Props<V, D>['itemText'];
    labelEdge?: Props<V, D>['labelEdge'];
    labelHint: Props<V, D>['labelHint'];
    labelStartWidth?: Props<V, D>['labelStartWidth'];
    labelWrapping?: Props<V, D>['labelWrapping'];
    messagesCustom?: Props<V, D>['messagesCustom'];
    placeholder?: Props<V, D>['placeholder'];
    readonly?: Props<V, D>['readonly'];
    required?: Props<V, D>['required'];
    requiredMessageDetail?: Props<V, D>['requiredMessageDetail'];
    textAlign?: Props<V, D>['textAlign'];
    userAssistanceDensity?: Props<V, D>['userAssistanceDensity'];
    value?: Props<V, D>['value'];
    valueItem?: Props<V, D>['valueItem'];
    virtualKeyboard?: Props<V, D>['virtualKeyboard'];
}
export interface CSelectSingleElementSettablePropertiesLenient<V extends string | number, D extends Record<string, any>> extends Partial<CSelectSingleElementSettableProperties<V, D>> {
    [key: string]: any;
}
export interface SelectSingleIntrinsicProps extends Partial<Readonly<CSelectSingleElementSettableProperties<any, any>>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    valid?: never;
    onojValueAction?: (value: CSelectSingleElementEventMap<any, any>['ojValueAction']) => void;
    oncontainerReadonlyChanged?: (value: CSelectSingleElementEventMap<any, any>['containerReadonlyChanged']) => void;
    ondataChanged?: (value: CSelectSingleElementEventMap<any, any>['dataChanged']) => void;
    ondisabledChanged?: (value: CSelectSingleElementEventMap<any, any>['disabledChanged']) => void;
    ondisplayOptionsChanged?: (value: CSelectSingleElementEventMap<any, any>['displayOptionsChanged']) => void;
    onhelpChanged?: (value: CSelectSingleElementEventMap<any, any>['helpChanged']) => void;
    onhelpHintsChanged?: (value: CSelectSingleElementEventMap<any, any>['helpHintsChanged']) => void;
    onitemTextChanged?: (value: CSelectSingleElementEventMap<any, any>['itemTextChanged']) => void;
    onlabelEdgeChanged?: (value: CSelectSingleElementEventMap<any, any>['labelEdgeChanged']) => void;
    onlabelHintChanged?: (value: CSelectSingleElementEventMap<any, any>['labelHintChanged']) => void;
    onlabelStartWidthChanged?: (value: CSelectSingleElementEventMap<any, any>['labelStartWidthChanged']) => void;
    onlabelWrappingChanged?: (value: CSelectSingleElementEventMap<any, any>['labelWrappingChanged']) => void;
    onmessagesCustomChanged?: (value: CSelectSingleElementEventMap<any, any>['messagesCustomChanged']) => void;
    onplaceholderChanged?: (value: CSelectSingleElementEventMap<any, any>['placeholderChanged']) => void;
    onreadonlyChanged?: (value: CSelectSingleElementEventMap<any, any>['readonlyChanged']) => void;
    onrequiredChanged?: (value: CSelectSingleElementEventMap<any, any>['requiredChanged']) => void;
    onrequiredMessageDetailChanged?: (value: CSelectSingleElementEventMap<any, any>['requiredMessageDetailChanged']) => void;
    ontextAlignChanged?: (value: CSelectSingleElementEventMap<any, any>['textAlignChanged']) => void;
    onuserAssistanceDensityChanged?: (value: CSelectSingleElementEventMap<any, any>['userAssistanceDensityChanged']) => void;
    onvalidChanged?: (value: CSelectSingleElementEventMap<any, any>['validChanged']) => void;
    onvalueChanged?: (value: CSelectSingleElementEventMap<any, any>['valueChanged']) => void;
    onvalueItemChanged?: (value: CSelectSingleElementEventMap<any, any>['valueItemChanged']) => void;
    onvirtualKeyboardChanged?: (value: CSelectSingleElementEventMap<any, any>['virtualKeyboardChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-select-single': SelectSingleIntrinsicProps;
        }
    }
}
