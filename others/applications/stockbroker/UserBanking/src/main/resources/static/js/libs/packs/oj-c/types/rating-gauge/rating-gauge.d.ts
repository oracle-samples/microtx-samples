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
import { RatingGauge as PreactRatingGauge } from '@oracle/oraclejet-preact/UNSAFE_RatingGauge';
import { ComponentProps } from 'preact';
import { ObservedGlobalProps, ReadOnlyPropertyChanged, PropertyChanged } from 'ojs/ojvcomponent';
import 'css!oj-c/rating-gauge/rating-gauge-styles.css';
declare type PreactRatingGaugeProps = ComponentProps<typeof PreactRatingGauge>;
declare type DatatipContext = {
    value: number;
};
export declare const RatingGauge: import("preact").ComponentType<import("ojs/ojvcomponent").ExtendGlobalProps<ObservedGlobalProps<"aria-label"> & {
    max?: number | undefined;
    readonly?: boolean | undefined;
    disabled?: boolean | undefined;
    changed?: boolean | undefined;
    onChangedChanged?: PropertyChanged<boolean> | undefined;
    value?: number | null | undefined;
    onValueChanged?: PropertyChanged<number | null> | undefined;
    step?: number | undefined;
    describedBy?: string | null | undefined;
    labelledBy?: string | null | undefined;
    size?: PreactRatingGaugeProps['size'];
    color?: PreactRatingGaugeProps['color'];
    datatip?: ((context: DatatipContext) => string) | undefined;
    tooltip?: string | undefined;
    onTransientValueChanged?: ReadOnlyPropertyChanged<number | undefined> | undefined;
}>>;
export {};
export interface CRatingGaugeElement extends JetElement<CRatingGaugeElementSettableProperties>, CRatingGaugeElementSettableProperties {
    readonly transientValue?: Parameters<Required<ComponentProps<typeof RatingGauge>>['onTransientValueChanged']>[0];
    addEventListener<T extends keyof CRatingGaugeElementEventMap>(type: T, listener: (this: HTMLElement, ev: CRatingGaugeElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CRatingGaugeElementSettableProperties>(property: T): CRatingGaugeElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CRatingGaugeElementSettableProperties>(property: T, value: CRatingGaugeElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CRatingGaugeElementSettableProperties>): void;
    setProperties(properties: CRatingGaugeElementSettablePropertiesLenient): void;
}
export namespace CRatingGaugeElement {
    type changedChanged = JetElementCustomEventStrict<CRatingGaugeElement['changed']>;
    type colorChanged = JetElementCustomEventStrict<CRatingGaugeElement['color']>;
    type datatipChanged = JetElementCustomEventStrict<CRatingGaugeElement['datatip']>;
    type describedByChanged = JetElementCustomEventStrict<CRatingGaugeElement['describedBy']>;
    type disabledChanged = JetElementCustomEventStrict<CRatingGaugeElement['disabled']>;
    type labelledByChanged = JetElementCustomEventStrict<CRatingGaugeElement['labelledBy']>;
    type maxChanged = JetElementCustomEventStrict<CRatingGaugeElement['max']>;
    type readonlyChanged = JetElementCustomEventStrict<CRatingGaugeElement['readonly']>;
    type sizeChanged = JetElementCustomEventStrict<CRatingGaugeElement['size']>;
    type stepChanged = JetElementCustomEventStrict<CRatingGaugeElement['step']>;
    type tooltipChanged = JetElementCustomEventStrict<CRatingGaugeElement['tooltip']>;
    type transientValueChanged = JetElementCustomEventStrict<CRatingGaugeElement['transientValue']>;
    type valueChanged = JetElementCustomEventStrict<CRatingGaugeElement['value']>;
}
export interface CRatingGaugeElementEventMap extends HTMLElementEventMap {
    'changedChanged': JetElementCustomEventStrict<CRatingGaugeElement['changed']>;
    'colorChanged': JetElementCustomEventStrict<CRatingGaugeElement['color']>;
    'datatipChanged': JetElementCustomEventStrict<CRatingGaugeElement['datatip']>;
    'describedByChanged': JetElementCustomEventStrict<CRatingGaugeElement['describedBy']>;
    'disabledChanged': JetElementCustomEventStrict<CRatingGaugeElement['disabled']>;
    'labelledByChanged': JetElementCustomEventStrict<CRatingGaugeElement['labelledBy']>;
    'maxChanged': JetElementCustomEventStrict<CRatingGaugeElement['max']>;
    'readonlyChanged': JetElementCustomEventStrict<CRatingGaugeElement['readonly']>;
    'sizeChanged': JetElementCustomEventStrict<CRatingGaugeElement['size']>;
    'stepChanged': JetElementCustomEventStrict<CRatingGaugeElement['step']>;
    'tooltipChanged': JetElementCustomEventStrict<CRatingGaugeElement['tooltip']>;
    'transientValueChanged': JetElementCustomEventStrict<CRatingGaugeElement['transientValue']>;
    'valueChanged': JetElementCustomEventStrict<CRatingGaugeElement['value']>;
}
export interface CRatingGaugeElementSettableProperties extends JetSettableProperties {
    changed?: ComponentProps<typeof RatingGauge>['changed'];
    color?: ComponentProps<typeof RatingGauge>['color'];
    datatip?: ComponentProps<typeof RatingGauge>['datatip'];
    describedBy?: ComponentProps<typeof RatingGauge>['describedBy'];
    disabled?: ComponentProps<typeof RatingGauge>['disabled'];
    labelledBy?: ComponentProps<typeof RatingGauge>['labelledBy'];
    max?: ComponentProps<typeof RatingGauge>['max'];
    readonly?: ComponentProps<typeof RatingGauge>['readonly'];
    size?: ComponentProps<typeof RatingGauge>['size'];
    step?: ComponentProps<typeof RatingGauge>['step'];
    tooltip?: ComponentProps<typeof RatingGauge>['tooltip'];
    value?: ComponentProps<typeof RatingGauge>['value'];
}
export interface CRatingGaugeElementSettablePropertiesLenient extends Partial<CRatingGaugeElementSettableProperties> {
    [key: string]: any;
}
export interface RatingGaugeIntrinsicProps extends Partial<Readonly<CRatingGaugeElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    transientValue?: never;
    onchangedChanged?: (value: CRatingGaugeElementEventMap['changedChanged']) => void;
    oncolorChanged?: (value: CRatingGaugeElementEventMap['colorChanged']) => void;
    ondatatipChanged?: (value: CRatingGaugeElementEventMap['datatipChanged']) => void;
    ondescribedByChanged?: (value: CRatingGaugeElementEventMap['describedByChanged']) => void;
    ondisabledChanged?: (value: CRatingGaugeElementEventMap['disabledChanged']) => void;
    onlabelledByChanged?: (value: CRatingGaugeElementEventMap['labelledByChanged']) => void;
    onmaxChanged?: (value: CRatingGaugeElementEventMap['maxChanged']) => void;
    onreadonlyChanged?: (value: CRatingGaugeElementEventMap['readonlyChanged']) => void;
    onsizeChanged?: (value: CRatingGaugeElementEventMap['sizeChanged']) => void;
    onstepChanged?: (value: CRatingGaugeElementEventMap['stepChanged']) => void;
    ontooltipChanged?: (value: CRatingGaugeElementEventMap['tooltipChanged']) => void;
    ontransientValueChanged?: (value: CRatingGaugeElementEventMap['transientValueChanged']) => void;
    onvalueChanged?: (value: CRatingGaugeElementEventMap['valueChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-rating-gauge': RatingGaugeIntrinsicProps;
        }
    }
}
