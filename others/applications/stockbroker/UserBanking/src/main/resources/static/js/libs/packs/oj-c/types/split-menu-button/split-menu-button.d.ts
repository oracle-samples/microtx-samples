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
import { SplitMenuButton as PreactSplitMenuButton } from '@oracle/oraclejet-preact/UNSAFE_SplitMenuButton';
import { ComponentProps, Component } from 'preact';
import { ExtendGlobalProps, Action, Bubbles, ObservedGlobalProps } from 'ojs/ojvcomponent';
import 'css!oj-c/split-menu-button/split-menu-button-styles.css';
import { Size } from '@oracle/oraclejet-preact/utils/UNSAFE_size';
declare type PreactSplitMenuButtonProps = ComponentProps<typeof PreactSplitMenuButton>;
export declare type SplitMenuButtonMenuItemType = 'item' | 'divider';
export declare type SplitMenuButtonMenuItem = {
    type?: SplitMenuButtonMenuItemType;
    label?: string;
    disabled?: boolean;
    onAction?: () => void;
};
declare type Props = ObservedGlobalProps<'title'> & {
    label: string;
    items?: Array<SplitMenuButtonMenuItem>;
    disabled?: boolean;
    size?: PreactSplitMenuButtonProps['size'];
    width?: Size;
    chroming?: PreactSplitMenuButtonProps['variant'];
    onOjAction?: Action & Bubbles;
};
export declare class SplitMenuButton extends Component<ExtendGlobalProps<Props>> {
    static defaultProps: Partial<Props>;
    private buttonRef;
    private renderMenu;
    render(props: ExtendGlobalProps<Props>): import("preact").JSX.Element;
    blur(): void;
    focus(): void;
    doAction(): void;
}
export {};
export interface CSplitMenuButtonElement extends JetElement<CSplitMenuButtonElementSettableProperties>, CSplitMenuButtonElementSettableProperties {
    addEventListener<T extends keyof CSplitMenuButtonElementEventMap>(type: T, listener: (this: HTMLElement, ev: CSplitMenuButtonElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CSplitMenuButtonElementSettableProperties>(property: T): CSplitMenuButtonElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CSplitMenuButtonElementSettableProperties>(property: T, value: CSplitMenuButtonElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CSplitMenuButtonElementSettableProperties>): void;
    setProperties(properties: CSplitMenuButtonElementSettablePropertiesLenient): void;
    blur: SplitMenuButton['blur'];
    doAction: SplitMenuButton['doAction'];
    focus: SplitMenuButton['focus'];
}
export namespace CSplitMenuButtonElement {
    interface ojAction extends CustomEvent<{}> {
    }
    type chromingChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['chroming']>;
    type disabledChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['disabled']>;
    type itemsChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['items']>;
    type labelChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['label']>;
    type sizeChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['size']>;
    type widthChanged = JetElementCustomEventStrict<CSplitMenuButtonElement['width']>;
}
export interface CSplitMenuButtonElementEventMap extends HTMLElementEventMap {
    'ojAction': CSplitMenuButtonElement.ojAction;
    'chromingChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['chroming']>;
    'disabledChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['disabled']>;
    'itemsChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['items']>;
    'labelChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['label']>;
    'sizeChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['size']>;
    'widthChanged': JetElementCustomEventStrict<CSplitMenuButtonElement['width']>;
}
export interface CSplitMenuButtonElementSettableProperties extends JetSettableProperties {
    chroming?: Props['chroming'];
    disabled?: Props['disabled'];
    items?: Props['items'];
    label: Props['label'];
    size?: Props['size'];
    width?: Props['width'];
}
export interface CSplitMenuButtonElementSettablePropertiesLenient extends Partial<CSplitMenuButtonElementSettableProperties> {
    [key: string]: any;
}
export interface SplitMenuButtonIntrinsicProps extends Partial<Readonly<CSplitMenuButtonElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    onojAction?: (value: CSplitMenuButtonElementEventMap['ojAction']) => void;
    onchromingChanged?: (value: CSplitMenuButtonElementEventMap['chromingChanged']) => void;
    ondisabledChanged?: (value: CSplitMenuButtonElementEventMap['disabledChanged']) => void;
    onitemsChanged?: (value: CSplitMenuButtonElementEventMap['itemsChanged']) => void;
    onlabelChanged?: (value: CSplitMenuButtonElementEventMap['labelChanged']) => void;
    onsizeChanged?: (value: CSplitMenuButtonElementEventMap['sizeChanged']) => void;
    onwidthChanged?: (value: CSplitMenuButtonElementEventMap['widthChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-split-menu-button': SplitMenuButtonIntrinsicProps;
        }
    }
}
