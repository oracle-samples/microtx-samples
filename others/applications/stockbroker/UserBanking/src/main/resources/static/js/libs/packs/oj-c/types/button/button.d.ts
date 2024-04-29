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
import { Button as PreactButton } from '@oracle/oraclejet-preact/UNSAFE_Button';
import { ComponentProps, Component } from 'preact';
import { ExtendGlobalProps, Action, Bubbles, ObservedGlobalProps, Slot } from 'ojs/ojvcomponent';
import 'css!oj-c/button/button-styles.css';
import { Size } from '@oracle/oraclejet-preact/utils/UNSAFE_size';
declare type PreactButtonProps = ComponentProps<typeof PreactButton>;
declare type Props = ObservedGlobalProps<'title' | 'aria-label'> & {
    label: string;
    startIcon?: Slot;
    endIcon?: Slot;
    disabled?: boolean;
    width?: Size;
    display?: PreactButtonProps['display'];
    size?: PreactButtonProps['size'];
    edge?: PreactButtonProps['edge'];
    chroming?: PreactButtonProps['variant'];
    onOjAction?: Action & Bubbles;
};
export declare class Button extends Component<ExtendGlobalProps<Props>> {
    static defaultProps: Partial<Props>;
    private buttonRef;
    render(props: ExtendGlobalProps<Props>): import("preact").JSX.Element;
    blur(): void;
    focus(): void;
}
export {};
export interface CButtonElement extends JetElement<CButtonElementSettableProperties>, CButtonElementSettableProperties {
    addEventListener<T extends keyof CButtonElementEventMap>(type: T, listener: (this: HTMLElement, ev: CButtonElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CButtonElementSettableProperties>(property: T): CButtonElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CButtonElementSettableProperties>(property: T, value: CButtonElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CButtonElementSettableProperties>): void;
    setProperties(properties: CButtonElementSettablePropertiesLenient): void;
    blur: Button['blur'];
    focus: Button['focus'];
}
export namespace CButtonElement {
    interface ojAction extends CustomEvent<{}> {
    }
    type chromingChanged = JetElementCustomEventStrict<CButtonElement['chroming']>;
    type disabledChanged = JetElementCustomEventStrict<CButtonElement['disabled']>;
    type displayChanged = JetElementCustomEventStrict<CButtonElement['display']>;
    type edgeChanged = JetElementCustomEventStrict<CButtonElement['edge']>;
    type labelChanged = JetElementCustomEventStrict<CButtonElement['label']>;
    type sizeChanged = JetElementCustomEventStrict<CButtonElement['size']>;
    type widthChanged = JetElementCustomEventStrict<CButtonElement['width']>;
}
export interface CButtonElementEventMap extends HTMLElementEventMap {
    'ojAction': CButtonElement.ojAction;
    'chromingChanged': JetElementCustomEventStrict<CButtonElement['chroming']>;
    'disabledChanged': JetElementCustomEventStrict<CButtonElement['disabled']>;
    'displayChanged': JetElementCustomEventStrict<CButtonElement['display']>;
    'edgeChanged': JetElementCustomEventStrict<CButtonElement['edge']>;
    'labelChanged': JetElementCustomEventStrict<CButtonElement['label']>;
    'sizeChanged': JetElementCustomEventStrict<CButtonElement['size']>;
    'widthChanged': JetElementCustomEventStrict<CButtonElement['width']>;
}
export interface CButtonElementSettableProperties extends JetSettableProperties {
    chroming?: Props['chroming'];
    disabled?: Props['disabled'];
    display?: Props['display'];
    edge?: Props['edge'];
    label: Props['label'];
    size?: Props['size'];
    width?: Props['width'];
}
export interface CButtonElementSettablePropertiesLenient extends Partial<CButtonElementSettableProperties> {
    [key: string]: any;
}
export interface ButtonIntrinsicProps extends Partial<Readonly<CButtonElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    children?: import('preact').ComponentChildren;
    onojAction?: (value: CButtonElementEventMap['ojAction']) => void;
    onchromingChanged?: (value: CButtonElementEventMap['chromingChanged']) => void;
    ondisabledChanged?: (value: CButtonElementEventMap['disabledChanged']) => void;
    ondisplayChanged?: (value: CButtonElementEventMap['displayChanged']) => void;
    onedgeChanged?: (value: CButtonElementEventMap['edgeChanged']) => void;
    onlabelChanged?: (value: CButtonElementEventMap['labelChanged']) => void;
    onsizeChanged?: (value: CButtonElementEventMap['sizeChanged']) => void;
    onwidthChanged?: (value: CButtonElementEventMap['widthChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-button': ButtonIntrinsicProps;
        }
    }
}
