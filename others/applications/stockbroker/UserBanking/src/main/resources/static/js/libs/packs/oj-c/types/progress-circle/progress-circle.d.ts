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
import { ProgressCircle as PreactProgressCircle } from '@oracle/oraclejet-preact/UNSAFE_ProgressCircle';
import { ComponentProps } from 'preact';
import { ObservedGlobalProps } from 'ojs/ojvcomponent';
import 'css!oj-c/progress-circle/progress-circle-styles.css';
declare type PreactProgressCircleProps = ComponentProps<typeof PreactProgressCircle>;
export declare const ProgressCircle: import("preact").ComponentType<import("ojs/ojvcomponent").ExtendGlobalProps<ObservedGlobalProps<"aria-valuetext"> & {
    max?: number | undefined;
    value?: number | undefined;
    size?: PreactProgressCircleProps['size'];
}>>;
export {};
export interface CProgressCircleElement extends JetElement<CProgressCircleElementSettableProperties>, CProgressCircleElementSettableProperties {
    addEventListener<T extends keyof CProgressCircleElementEventMap>(type: T, listener: (this: HTMLElement, ev: CProgressCircleElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CProgressCircleElementSettableProperties>(property: T): CProgressCircleElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CProgressCircleElementSettableProperties>(property: T, value: CProgressCircleElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CProgressCircleElementSettableProperties>): void;
    setProperties(properties: CProgressCircleElementSettablePropertiesLenient): void;
}
export namespace CProgressCircleElement {
    type maxChanged = JetElementCustomEventStrict<CProgressCircleElement['max']>;
    type sizeChanged = JetElementCustomEventStrict<CProgressCircleElement['size']>;
    type valueChanged = JetElementCustomEventStrict<CProgressCircleElement['value']>;
}
export interface CProgressCircleElementEventMap extends HTMLElementEventMap {
    'maxChanged': JetElementCustomEventStrict<CProgressCircleElement['max']>;
    'sizeChanged': JetElementCustomEventStrict<CProgressCircleElement['size']>;
    'valueChanged': JetElementCustomEventStrict<CProgressCircleElement['value']>;
}
export interface CProgressCircleElementSettableProperties extends JetSettableProperties {
    max?: ComponentProps<typeof ProgressCircle>['max'];
    size?: ComponentProps<typeof ProgressCircle>['size'];
    value?: ComponentProps<typeof ProgressCircle>['value'];
}
export interface CProgressCircleElementSettablePropertiesLenient extends Partial<CProgressCircleElementSettableProperties> {
    [key: string]: any;
}
export interface ProgressCircleIntrinsicProps extends Partial<Readonly<CProgressCircleElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    onmaxChanged?: (value: CProgressCircleElementEventMap['maxChanged']) => void;
    onsizeChanged?: (value: CProgressCircleElementEventMap['sizeChanged']) => void;
    onvalueChanged?: (value: CProgressCircleElementEventMap['valueChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-progress-circle': ProgressCircleIntrinsicProps;
        }
    }
}
