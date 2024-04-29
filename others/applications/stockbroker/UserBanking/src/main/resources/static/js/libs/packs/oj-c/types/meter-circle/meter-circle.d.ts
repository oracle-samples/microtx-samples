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
import { MeterCircle as PreactMeterCircle, CenterContext } from '@oracle/oraclejet-preact/UNSAFE_MeterCircle';
import { ComponentProps } from 'preact';
import { ObservedGlobalProps, ReadOnlyPropertyChanged, PropertyChanged, TemplateSlot } from 'ojs/ojvcomponent';
import 'css!oj-c/meter-circle/meter-circle-styles.css';
declare type PreactMeterCircleProps = ComponentProps<typeof PreactMeterCircle>;
export declare type Context = CenterContext & {
    value: number | null;
};
declare type PlotArea = {
    color?: PreactMeterCircleProps['trackColor'];
    rendered?: 'on' | 'off';
};
export declare type DatatipContext = {
    value: number;
};
export declare type ThresholdDisplay = 'all' | 'plotArea' | 'indicator';
export declare const MeterCircle: import("preact").ComponentType<import("ojs/ojvcomponent").ExtendGlobalProps<ObservedGlobalProps<"aria-label"> & {
    max?: number | undefined;
    min?: number | undefined;
    readonly?: boolean | undefined;
    value?: number | null | undefined;
    onValueChanged?: PropertyChanged<number | null> | undefined;
    step?: number | undefined;
    color?: PreactMeterCircleProps['indicatorColor'];
    indicatorSize?: number | undefined;
    innerRadius?: number | undefined;
    plotArea: PlotArea;
    angleExtent?: PreactMeterCircleProps['angleExtent'];
    startAngle?: PreactMeterCircleProps['startAngle'];
    referenceLines?: PreactMeterCircleProps['referenceLines'];
    thresholdDisplay?: ThresholdDisplay | undefined;
    thresholds?: PreactMeterCircleProps['thresholds'];
    describedBy?: string | null | undefined;
    labelledBy?: string | null | undefined;
    size?: PreactMeterCircleProps['size'];
    datatip?: ((context: DatatipContext) => string | null) | undefined;
    onTransientValueChanged?: ReadOnlyPropertyChanged<number | undefined> | undefined;
    centerTemplate?: TemplateSlot<Context> | undefined;
}>>;
export {};
export interface CMeterCircleElement extends JetElement<CMeterCircleElementSettableProperties>, CMeterCircleElementSettableProperties {
    readonly transientValue?: Parameters<Required<ComponentProps<typeof MeterCircle>>['onTransientValueChanged']>[0];
    addEventListener<T extends keyof CMeterCircleElementEventMap>(type: T, listener: (this: HTMLElement, ev: CMeterCircleElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CMeterCircleElementSettableProperties>(property: T): CMeterCircleElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CMeterCircleElementSettableProperties>(property: T, value: CMeterCircleElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CMeterCircleElementSettableProperties>): void;
    setProperties(properties: CMeterCircleElementSettablePropertiesLenient): void;
}
export namespace CMeterCircleElement {
    type angleExtentChanged = JetElementCustomEventStrict<CMeterCircleElement['angleExtent']>;
    type colorChanged = JetElementCustomEventStrict<CMeterCircleElement['color']>;
    type datatipChanged = JetElementCustomEventStrict<CMeterCircleElement['datatip']>;
    type describedByChanged = JetElementCustomEventStrict<CMeterCircleElement['describedBy']>;
    type indicatorSizeChanged = JetElementCustomEventStrict<CMeterCircleElement['indicatorSize']>;
    type innerRadiusChanged = JetElementCustomEventStrict<CMeterCircleElement['innerRadius']>;
    type labelledByChanged = JetElementCustomEventStrict<CMeterCircleElement['labelledBy']>;
    type maxChanged = JetElementCustomEventStrict<CMeterCircleElement['max']>;
    type minChanged = JetElementCustomEventStrict<CMeterCircleElement['min']>;
    type plotAreaChanged = JetElementCustomEventStrict<CMeterCircleElement['plotArea']>;
    type readonlyChanged = JetElementCustomEventStrict<CMeterCircleElement['readonly']>;
    type referenceLinesChanged = JetElementCustomEventStrict<CMeterCircleElement['referenceLines']>;
    type sizeChanged = JetElementCustomEventStrict<CMeterCircleElement['size']>;
    type startAngleChanged = JetElementCustomEventStrict<CMeterCircleElement['startAngle']>;
    type stepChanged = JetElementCustomEventStrict<CMeterCircleElement['step']>;
    type thresholdDisplayChanged = JetElementCustomEventStrict<CMeterCircleElement['thresholdDisplay']>;
    type thresholdsChanged = JetElementCustomEventStrict<CMeterCircleElement['thresholds']>;
    type transientValueChanged = JetElementCustomEventStrict<CMeterCircleElement['transientValue']>;
    type valueChanged = JetElementCustomEventStrict<CMeterCircleElement['value']>;
}
export interface CMeterCircleElementEventMap extends HTMLElementEventMap {
    'angleExtentChanged': JetElementCustomEventStrict<CMeterCircleElement['angleExtent']>;
    'colorChanged': JetElementCustomEventStrict<CMeterCircleElement['color']>;
    'datatipChanged': JetElementCustomEventStrict<CMeterCircleElement['datatip']>;
    'describedByChanged': JetElementCustomEventStrict<CMeterCircleElement['describedBy']>;
    'indicatorSizeChanged': JetElementCustomEventStrict<CMeterCircleElement['indicatorSize']>;
    'innerRadiusChanged': JetElementCustomEventStrict<CMeterCircleElement['innerRadius']>;
    'labelledByChanged': JetElementCustomEventStrict<CMeterCircleElement['labelledBy']>;
    'maxChanged': JetElementCustomEventStrict<CMeterCircleElement['max']>;
    'minChanged': JetElementCustomEventStrict<CMeterCircleElement['min']>;
    'plotAreaChanged': JetElementCustomEventStrict<CMeterCircleElement['plotArea']>;
    'readonlyChanged': JetElementCustomEventStrict<CMeterCircleElement['readonly']>;
    'referenceLinesChanged': JetElementCustomEventStrict<CMeterCircleElement['referenceLines']>;
    'sizeChanged': JetElementCustomEventStrict<CMeterCircleElement['size']>;
    'startAngleChanged': JetElementCustomEventStrict<CMeterCircleElement['startAngle']>;
    'stepChanged': JetElementCustomEventStrict<CMeterCircleElement['step']>;
    'thresholdDisplayChanged': JetElementCustomEventStrict<CMeterCircleElement['thresholdDisplay']>;
    'thresholdsChanged': JetElementCustomEventStrict<CMeterCircleElement['thresholds']>;
    'transientValueChanged': JetElementCustomEventStrict<CMeterCircleElement['transientValue']>;
    'valueChanged': JetElementCustomEventStrict<CMeterCircleElement['value']>;
}
export interface CMeterCircleElementSettableProperties extends JetSettableProperties {
    angleExtent?: ComponentProps<typeof MeterCircle>['angleExtent'];
    color?: ComponentProps<typeof MeterCircle>['color'];
    datatip?: ComponentProps<typeof MeterCircle>['datatip'];
    describedBy?: ComponentProps<typeof MeterCircle>['describedBy'];
    indicatorSize?: ComponentProps<typeof MeterCircle>['indicatorSize'];
    innerRadius?: ComponentProps<typeof MeterCircle>['innerRadius'];
    labelledBy?: ComponentProps<typeof MeterCircle>['labelledBy'];
    max?: ComponentProps<typeof MeterCircle>['max'];
    min?: ComponentProps<typeof MeterCircle>['min'];
    plotArea: ComponentProps<typeof MeterCircle>['plotArea'];
    readonly?: ComponentProps<typeof MeterCircle>['readonly'];
    referenceLines?: ComponentProps<typeof MeterCircle>['referenceLines'];
    size?: ComponentProps<typeof MeterCircle>['size'];
    startAngle?: ComponentProps<typeof MeterCircle>['startAngle'];
    step?: ComponentProps<typeof MeterCircle>['step'];
    thresholdDisplay?: ComponentProps<typeof MeterCircle>['thresholdDisplay'];
    thresholds?: ComponentProps<typeof MeterCircle>['thresholds'];
    value?: ComponentProps<typeof MeterCircle>['value'];
}
export interface CMeterCircleElementSettablePropertiesLenient extends Partial<CMeterCircleElementSettableProperties> {
    [key: string]: any;
}
export interface MeterCircleIntrinsicProps extends Partial<Readonly<CMeterCircleElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    transientValue?: never;
    children?: import('preact').ComponentChildren;
    onangleExtentChanged?: (value: CMeterCircleElementEventMap['angleExtentChanged']) => void;
    oncolorChanged?: (value: CMeterCircleElementEventMap['colorChanged']) => void;
    ondatatipChanged?: (value: CMeterCircleElementEventMap['datatipChanged']) => void;
    ondescribedByChanged?: (value: CMeterCircleElementEventMap['describedByChanged']) => void;
    onindicatorSizeChanged?: (value: CMeterCircleElementEventMap['indicatorSizeChanged']) => void;
    oninnerRadiusChanged?: (value: CMeterCircleElementEventMap['innerRadiusChanged']) => void;
    onlabelledByChanged?: (value: CMeterCircleElementEventMap['labelledByChanged']) => void;
    onmaxChanged?: (value: CMeterCircleElementEventMap['maxChanged']) => void;
    onminChanged?: (value: CMeterCircleElementEventMap['minChanged']) => void;
    onplotAreaChanged?: (value: CMeterCircleElementEventMap['plotAreaChanged']) => void;
    onreadonlyChanged?: (value: CMeterCircleElementEventMap['readonlyChanged']) => void;
    onreferenceLinesChanged?: (value: CMeterCircleElementEventMap['referenceLinesChanged']) => void;
    onsizeChanged?: (value: CMeterCircleElementEventMap['sizeChanged']) => void;
    onstartAngleChanged?: (value: CMeterCircleElementEventMap['startAngleChanged']) => void;
    onstepChanged?: (value: CMeterCircleElementEventMap['stepChanged']) => void;
    onthresholdDisplayChanged?: (value: CMeterCircleElementEventMap['thresholdDisplayChanged']) => void;
    onthresholdsChanged?: (value: CMeterCircleElementEventMap['thresholdsChanged']) => void;
    ontransientValueChanged?: (value: CMeterCircleElementEventMap['transientValueChanged']) => void;
    onvalueChanged?: (value: CMeterCircleElementEventMap['valueChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-meter-circle': MeterCircleIntrinsicProps;
        }
    }
}
