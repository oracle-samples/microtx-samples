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
import { FilePicker as PreactFilePicker } from '@oracle/oraclejet-preact/UNSAFE_FilePicker';
import { ComponentMessageItem } from '@oracle/oraclejet-preact/UNSAFE_ComponentMessage';
import { ComponentProps } from 'preact';
import { Action, CancelableAction, ObservedGlobalProps, Slot } from 'ojs/ojvcomponent';
import 'css!oj-c/file-picker/file-picker-styles.css';
declare type PreactFilePickerProps = ComponentProps<typeof PreactFilePicker>;
declare type Props = ObservedGlobalProps<'aria-label'> & {
    accept?: string[];
    capture?: PreactFilePickerProps['capture'];
    disabled?: boolean;
    primaryText?: string | (() => string);
    secondaryText?: string | ((fileOptions: {
        selectionMode: 'multiple' | 'single';
    }) => string);
    selectionMode?: PreactFilePickerProps['selectionMode'];
    trigger?: Slot;
    onOjBeforeSelect?: CancelableAction<BeforeDetail>;
    onOjInvalidSelect?: Action<InvalidDetail>;
    onOjSelect?: Action<SelectDetail>;
};
declare type BeforeDetail = {
    files: FileList;
};
declare type InvalidDetail = {
    messages: ComponentMessageItem[];
    until: Promise<void> | null;
};
declare type SelectDetail = {
    files: FileList;
};
export declare const FilePicker: import("preact").ComponentType<import("ojs/ojvcomponent").ExtendGlobalProps<Props>>;
export {};
export interface CFilePickerElement extends JetElement<CFilePickerElementSettableProperties>, CFilePickerElementSettableProperties {
    addEventListener<T extends keyof CFilePickerElementEventMap>(type: T, listener: (this: HTMLElement, ev: CFilePickerElementEventMap[T]) => any, options?: (boolean | AddEventListenerOptions)): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: (boolean | AddEventListenerOptions)): void;
    getProperty<T extends keyof CFilePickerElementSettableProperties>(property: T): CFilePickerElement[T];
    getProperty(property: string): any;
    setProperty<T extends keyof CFilePickerElementSettableProperties>(property: T, value: CFilePickerElementSettableProperties[T]): void;
    setProperty<T extends string>(property: T, value: JetSetPropertyType<T, CFilePickerElementSettableProperties>): void;
    setProperties(properties: CFilePickerElementSettablePropertiesLenient): void;
    blur: () => void;
    focus: () => void;
}
export namespace CFilePickerElement {
    interface ojBeforeSelect extends CustomEvent<BeforeDetail & {
        accept: (param: Promise<void>) => void;
    }> {
    }
    interface ojInvalidSelect extends CustomEvent<InvalidDetail & {}> {
    }
    interface ojSelect extends CustomEvent<SelectDetail & {}> {
    }
    type acceptChanged = JetElementCustomEventStrict<CFilePickerElement['accept']>;
    type captureChanged = JetElementCustomEventStrict<CFilePickerElement['capture']>;
    type disabledChanged = JetElementCustomEventStrict<CFilePickerElement['disabled']>;
    type primaryTextChanged = JetElementCustomEventStrict<CFilePickerElement['primaryText']>;
    type secondaryTextChanged = JetElementCustomEventStrict<CFilePickerElement['secondaryText']>;
    type selectionModeChanged = JetElementCustomEventStrict<CFilePickerElement['selectionMode']>;
}
export interface CFilePickerElementEventMap extends HTMLElementEventMap {
    'ojBeforeSelect': CFilePickerElement.ojBeforeSelect;
    'ojInvalidSelect': CFilePickerElement.ojInvalidSelect;
    'ojSelect': CFilePickerElement.ojSelect;
    'acceptChanged': JetElementCustomEventStrict<CFilePickerElement['accept']>;
    'captureChanged': JetElementCustomEventStrict<CFilePickerElement['capture']>;
    'disabledChanged': JetElementCustomEventStrict<CFilePickerElement['disabled']>;
    'primaryTextChanged': JetElementCustomEventStrict<CFilePickerElement['primaryText']>;
    'secondaryTextChanged': JetElementCustomEventStrict<CFilePickerElement['secondaryText']>;
    'selectionModeChanged': JetElementCustomEventStrict<CFilePickerElement['selectionMode']>;
}
export interface CFilePickerElementSettableProperties extends JetSettableProperties {
    accept?: ComponentProps<typeof FilePicker>['accept'];
    capture?: ComponentProps<typeof FilePicker>['capture'];
    disabled?: ComponentProps<typeof FilePicker>['disabled'];
    primaryText?: ComponentProps<typeof FilePicker>['primaryText'];
    secondaryText?: ComponentProps<typeof FilePicker>['secondaryText'];
    selectionMode?: ComponentProps<typeof FilePicker>['selectionMode'];
}
export interface CFilePickerElementSettablePropertiesLenient extends Partial<CFilePickerElementSettableProperties> {
    [key: string]: any;
}
export interface FilePickerIntrinsicProps extends Partial<Readonly<CFilePickerElementSettableProperties>>, GlobalProps, Pick<preact.JSX.HTMLAttributes, 'ref' | 'key'> {
    children?: import('preact').ComponentChildren;
    onojBeforeSelect?: (value: CFilePickerElementEventMap['ojBeforeSelect']) => void;
    onojInvalidSelect?: (value: CFilePickerElementEventMap['ojInvalidSelect']) => void;
    onojSelect?: (value: CFilePickerElementEventMap['ojSelect']) => void;
    onacceptChanged?: (value: CFilePickerElementEventMap['acceptChanged']) => void;
    oncaptureChanged?: (value: CFilePickerElementEventMap['captureChanged']) => void;
    ondisabledChanged?: (value: CFilePickerElementEventMap['disabledChanged']) => void;
    onprimaryTextChanged?: (value: CFilePickerElementEventMap['primaryTextChanged']) => void;
    onsecondaryTextChanged?: (value: CFilePickerElementEventMap['secondaryTextChanged']) => void;
    onselectionModeChanged?: (value: CFilePickerElementEventMap['selectionModeChanged']) => void;
}
declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            'oj-c-file-picker': FilePickerIntrinsicProps;
        }
    }
}
