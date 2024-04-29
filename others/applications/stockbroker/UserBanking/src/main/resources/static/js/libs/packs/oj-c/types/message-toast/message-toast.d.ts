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
import { MessageToast as PreactMessageToast, MessageToastItem as PreactMessageToastItem } from '@oracle/oraclejet-preact/UNSAFE_MessageToast';
import { DataProvider, ItemMetadata } from 'ojs/ojdataprovider';
import { Action, DynamicTemplateSlots } from 'ojs/ojvcomponent';
import { ComponentProps } from 'preact';
import 'css!./message-toast-styles.css';
declare type CloseActionDetail<K, D> = {
    data: D;
    key: K;
    metadata?: ItemMetadata<K>;
};
declare type PreactMessageToastProps = ComponentProps<typeof PreactMessageToast>;
export declare type MessageToastItem = PreactMessageToastItem;
export declare type MessageToastTemplateContext<K, D> = {
    data: D;
    key: K;
    metadata?: ItemMetadata<K>;
};
export declare type MessageToastProps<Key = string | number, Data = MessageToastItem> = {
    data: DataProvider<Key, Data>;
    detailTemplateValue?: PreactMessageToastProps['detailRendererKey'];
    iconTemplateValue?: PreactMessageToastProps['iconRendererKey'];
    messageTemplates?: DynamicTemplateSlots<MessageToastTemplateContext<Key, Data>>;
    offset?: PreactMessageToastProps['offset'];
    position?: PreactMessageToastProps['position'];
    onOjClose?: Action<CloseActionDetail<Key, Data>>;
};
export declare const MessageToast: import("preact").ComponentType<import("ojs/ojvcomponent").ExtendGlobalProps<MessageToastProps<string | number, PreactMessageToastItem>>>;
export {};
export interface CMessageToastElement extends JetElement<CMessageToastElementSettableProperties>, CMessageToastElementSettableProperties {
    addEventListener<T extends keyof CMessageToastElementEventMap>(type: T, listener: (this: HTMLElement, ev: CMessageToastElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CMessageToastElementSettableProperties>(property: T): CMessageToastElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CMessageToastElementSettableProperties>(property: T, value: CMessageToastElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CMessageToastElementSettableProperties>): void;
    setProperties(properties: CMessageToastElementSettablePropertiesLenient): void;
}
export namespace CMessageToastElement {
    interface ojClose<Key = string | number, Data = MessageToastItem> extends CustomEvent<CloseActionDetail<Key, Data> & {}> {
    }
    type dataChanged = JetElementCustomEventStrict<CMessageToastElement['data']>;
    type detailTemplateValueChanged = JetElementCustomEventStrict<CMessageToastElement['detailTemplateValue']>;
    type iconTemplateValueChanged = JetElementCustomEventStrict<CMessageToastElement['iconTemplateValue']>;
    type offsetChanged = JetElementCustomEventStrict<CMessageToastElement['offset']>;
    type positionChanged = JetElementCustomEventStrict<CMessageToastElement['position']>;
}
export interface CMessageToastElementEventMap extends HTMLElementEventMap {
    'ojClose': CMessageToastElement.ojClose;
    'dataChanged': JetElementCustomEventStrict<CMessageToastElement['data']>;
    'detailTemplateValueChanged': JetElementCustomEventStrict<CMessageToastElement['detailTemplateValue']>;
    'iconTemplateValueChanged': JetElementCustomEventStrict<CMessageToastElement['iconTemplateValue']>;
    'offsetChanged': JetElementCustomEventStrict<CMessageToastElement['offset']>;
    'positionChanged': JetElementCustomEventStrict<CMessageToastElement['position']>;
}
export interface CMessageToastElementSettableProperties<Key = string | number, Data = MessageToastItem> extends JetSettableProperties {
    data: MessageToastProps<Key, Data>['data'];
    detailTemplateValue?: MessageToastProps<Key, Data>['detailTemplateValue'];
    iconTemplateValue?: MessageToastProps<Key, Data>['iconTemplateValue'];
    offset?: MessageToastProps<Key, Data>['offset'];
    position?: MessageToastProps<Key, Data>['position'];
}
export interface CMessageToastElementSettablePropertiesLenient<Key = string | number, Data = MessageToastItem> extends Partial<CMessageToastElementSettableProperties<Key, Data>> {
    [key: string]: any;
}
export interface MessageToastIntrinsicProps extends Partial<Readonly<CMessageToastElementSettableProperties<any, any>>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    children?: import('preact').ComponentChildren;
    onojClose?: (value: CMessageToastElementEventMap['ojClose']) => void;
    ondataChanged?: (value: CMessageToastElementEventMap['dataChanged']) => void;
    ondetailTemplateValueChanged?: (value: CMessageToastElementEventMap['detailTemplateValueChanged']) => void;
    oniconTemplateValueChanged?: (value: CMessageToastElementEventMap['iconTemplateValueChanged']) => void;
    onoffsetChanged?: (value: CMessageToastElementEventMap['offsetChanged']) => void;
    onpositionChanged?: (value: CMessageToastElementEventMap['positionChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-message-toast': MessageToastIntrinsicProps;
        }
    }
}
