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
import { ComponentProps } from 'preact';
import { JetElement, JetSettableProperties, JetElementCustomEventStrict, JetSetPropertyType } from 'ojs/index';
import { GlobalProps } from 'ojs/ojvcomponent';
import 'ojs/oj-jsx-interfaces';
import { ComponentChildren } from 'preact';
import { ObservedGlobalProps, Slot } from 'ojs/ojvcomponent';
import 'css!oj-c/list-item-layout/list-item-layout-styles.css';
export declare const ListItemLayout: import("preact").ComponentType<import("ojs/ojvcomponent").ExtendGlobalProps<ObservedGlobalProps<"aria-label"> & {
    children?: ComponentChildren;
    overline?: Slot;
    selector?: Slot;
    leading?: Slot;
    secondary?: Slot;
    tertiary?: Slot;
    metadata?: Slot;
    trailing?: Slot;
    action?: Slot;
    quaternary?: Slot;
    navigation?: Slot;
    inset?: "none" | "listInset" | undefined;
}>>;
export interface CListItemLayoutElement extends JetElement<CListItemLayoutElementSettableProperties>, CListItemLayoutElementSettableProperties {
    addEventListener<T extends keyof CListItemLayoutElementEventMap>(type: T, listener: (this: HTMLElement, ev: CListItemLayoutElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CListItemLayoutElementSettableProperties>(property: T): CListItemLayoutElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CListItemLayoutElementSettableProperties>(property: T, value: CListItemLayoutElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CListItemLayoutElementSettableProperties>): void;
    setProperties(properties: CListItemLayoutElementSettablePropertiesLenient): void;
}
export namespace CListItemLayoutElement {
    type insetChanged = JetElementCustomEventStrict<CListItemLayoutElement['inset']>;
}
export interface CListItemLayoutElementEventMap extends HTMLElementEventMap {
    'insetChanged': JetElementCustomEventStrict<CListItemLayoutElement['inset']>;
}
export interface CListItemLayoutElementSettableProperties extends JetSettableProperties {
    inset?: ComponentProps<typeof ListItemLayout>['inset'];
}
export interface CListItemLayoutElementSettablePropertiesLenient extends Partial<CListItemLayoutElementSettableProperties> {
    [key: string]: any;
}
export interface ListItemLayoutIntrinsicProps extends Partial<Readonly<CListItemLayoutElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    children?: import('preact').ComponentChildren;
    oninsetChanged?: (value: CListItemLayoutElementEventMap['insetChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-list-item-layout': ListItemLayoutIntrinsicProps;
        }
    }
}
