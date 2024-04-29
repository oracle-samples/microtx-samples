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
import { ComponentChildren, ComponentType } from 'preact';
import { Action, CancelableAction, ExtendGlobalProps, PropertyChanged, Slot, ObservedGlobalProps } from 'ojs/ojvcomponent';
import 'css!oj-c/collapsible/collapsible-styles.css';
declare type ToggleDetail = {
    target: EventTarget | null;
};
declare type Props = ObservedGlobalProps<'id'> & {
    children: ComponentChildren;
    disabled?: boolean;
    expanded?: boolean;
    iconPosition?: 'start' | 'end';
    variant?: 'basic' | 'horizontal-rule';
    header?: Slot;
    onExpandedChanged?: PropertyChanged<boolean>;
    onOjBeforeCollapse?: CancelableAction<ToggleDetail>;
    onOjBeforeExpand?: CancelableAction<ToggleDetail>;
    onOjCollapse?: Action<ToggleDetail>;
    onOjExpand?: Action<ToggleDetail>;
};
export declare const Collapsible: ComponentType<ExtendGlobalProps<Props>>;
export {};
export interface CCollapsibleElement extends JetElement<CCollapsibleElementSettableProperties>, CCollapsibleElementSettableProperties {
    addEventListener<T extends keyof CCollapsibleElementEventMap>(type: T, listener: (this: HTMLElement, ev: CCollapsibleElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CCollapsibleElementSettableProperties>(property: T): CCollapsibleElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CCollapsibleElementSettableProperties>(property: T, value: CCollapsibleElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CCollapsibleElementSettableProperties>): void;
    setProperties(properties: CCollapsibleElementSettablePropertiesLenient): void;
}
export namespace CCollapsibleElement {
    interface ojBeforeCollapse extends CustomEvent<ToggleDetail & {
        accept: (param: Promise<void>) => void;
    }> {
    }
    interface ojBeforeExpand extends CustomEvent<ToggleDetail & {
        accept: (param: Promise<void>) => void;
    }> {
    }
    interface ojCollapse extends CustomEvent<ToggleDetail & {}> {
    }
    interface ojExpand extends CustomEvent<ToggleDetail & {}> {
    }
    type disabledChanged = JetElementCustomEventStrict<CCollapsibleElement['disabled']>;
    type expandedChanged = JetElementCustomEventStrict<CCollapsibleElement['expanded']>;
    type iconPositionChanged = JetElementCustomEventStrict<CCollapsibleElement['iconPosition']>;
    type variantChanged = JetElementCustomEventStrict<CCollapsibleElement['variant']>;
}
export interface CCollapsibleElementEventMap extends HTMLElementEventMap {
    'ojBeforeCollapse': CCollapsibleElement.ojBeforeCollapse;
    'ojBeforeExpand': CCollapsibleElement.ojBeforeExpand;
    'ojCollapse': CCollapsibleElement.ojCollapse;
    'ojExpand': CCollapsibleElement.ojExpand;
    'disabledChanged': JetElementCustomEventStrict<CCollapsibleElement['disabled']>;
    'expandedChanged': JetElementCustomEventStrict<CCollapsibleElement['expanded']>;
    'iconPositionChanged': JetElementCustomEventStrict<CCollapsibleElement['iconPosition']>;
    'variantChanged': JetElementCustomEventStrict<CCollapsibleElement['variant']>;
}
export interface CCollapsibleElementSettableProperties extends JetSettableProperties {
    disabled?: Props['disabled'];
    expanded?: Props['expanded'];
    iconPosition?: Props['iconPosition'];
    variant?: Props['variant'];
}
export interface CCollapsibleElementSettablePropertiesLenient extends Partial<CCollapsibleElementSettableProperties> {
    [key: string]: any;
}
export interface CollapsibleIntrinsicProps extends Partial<Readonly<CCollapsibleElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    children?: import('preact').ComponentChildren;
    onojBeforeCollapse?: (value: CCollapsibleElementEventMap['ojBeforeCollapse']) => void;
    onojBeforeExpand?: (value: CCollapsibleElementEventMap['ojBeforeExpand']) => void;
    onojCollapse?: (value: CCollapsibleElementEventMap['ojCollapse']) => void;
    onojExpand?: (value: CCollapsibleElementEventMap['ojExpand']) => void;
    ondisabledChanged?: (value: CCollapsibleElementEventMap['disabledChanged']) => void;
    onexpandedChanged?: (value: CCollapsibleElementEventMap['expandedChanged']) => void;
    oniconPositionChanged?: (value: CCollapsibleElementEventMap['iconPositionChanged']) => void;
    onvariantChanged?: (value: CCollapsibleElementEventMap['variantChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-collapsible': CollapsibleIntrinsicProps;
        }
    }
}
