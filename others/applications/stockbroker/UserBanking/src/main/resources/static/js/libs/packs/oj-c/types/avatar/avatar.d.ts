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
import { Avatar as PreactAvatar } from '@oracle/oraclejet-preact/UNSAFE_Avatar';
import { ComponentProps } from 'preact';
import { ObservedGlobalProps } from 'ojs/ojvcomponent';
import 'css!oj-c/avatar/avatar-styles.css';
declare type PreactAvatarProps = ComponentProps<typeof PreactAvatar>;
export declare const Avatar: import("preact").ComponentType<import("ojs/ojvcomponent").ExtendGlobalProps<ObservedGlobalProps<"aria-label"> & {
    background?: PreactAvatarProps['background'];
    initials?: string | null | undefined;
    size?: PreactAvatarProps['size'];
    src?: string | null | undefined;
    iconClass?: string | undefined;
    shape?: PreactAvatarProps['shape'];
}>>;
export {};
export interface CAvatarElement extends JetElement<CAvatarElementSettableProperties>, CAvatarElementSettableProperties {
    addEventListener<T extends keyof CAvatarElementEventMap>(type: T, listener: (this: HTMLElement, ev: CAvatarElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CAvatarElementSettableProperties>(property: T): CAvatarElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CAvatarElementSettableProperties>(property: T, value: CAvatarElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CAvatarElementSettableProperties>): void;
    setProperties(properties: CAvatarElementSettablePropertiesLenient): void;
}
export namespace CAvatarElement {
    type backgroundChanged = JetElementCustomEventStrict<CAvatarElement['background']>;
    type iconClassChanged = JetElementCustomEventStrict<CAvatarElement['iconClass']>;
    type initialsChanged = JetElementCustomEventStrict<CAvatarElement['initials']>;
    type shapeChanged = JetElementCustomEventStrict<CAvatarElement['shape']>;
    type sizeChanged = JetElementCustomEventStrict<CAvatarElement['size']>;
    type srcChanged = JetElementCustomEventStrict<CAvatarElement['src']>;
}
export interface CAvatarElementEventMap extends HTMLElementEventMap {
    'backgroundChanged': JetElementCustomEventStrict<CAvatarElement['background']>;
    'iconClassChanged': JetElementCustomEventStrict<CAvatarElement['iconClass']>;
    'initialsChanged': JetElementCustomEventStrict<CAvatarElement['initials']>;
    'shapeChanged': JetElementCustomEventStrict<CAvatarElement['shape']>;
    'sizeChanged': JetElementCustomEventStrict<CAvatarElement['size']>;
    'srcChanged': JetElementCustomEventStrict<CAvatarElement['src']>;
}
export interface CAvatarElementSettableProperties extends JetSettableProperties {
    background?: ComponentProps<typeof Avatar>['background'];
    iconClass?: ComponentProps<typeof Avatar>['iconClass'];
    initials?: ComponentProps<typeof Avatar>['initials'];
    shape?: ComponentProps<typeof Avatar>['shape'];
    size?: ComponentProps<typeof Avatar>['size'];
    src?: ComponentProps<typeof Avatar>['src'];
}
export interface CAvatarElementSettablePropertiesLenient extends Partial<CAvatarElementSettableProperties> {
    [key: string]: any;
}
export interface AvatarIntrinsicProps extends Partial<Readonly<CAvatarElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    onbackgroundChanged?: (value: CAvatarElementEventMap['backgroundChanged']) => void;
    oniconClassChanged?: (value: CAvatarElementEventMap['iconClassChanged']) => void;
    oninitialsChanged?: (value: CAvatarElementEventMap['initialsChanged']) => void;
    onshapeChanged?: (value: CAvatarElementEventMap['shapeChanged']) => void;
    onsizeChanged?: (value: CAvatarElementEventMap['sizeChanged']) => void;
    onsrcChanged?: (value: CAvatarElementEventMap['srcChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-avatar': AvatarIntrinsicProps;
        }
    }
}
