"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.InputNumberWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-input-number WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, InputNumberWebElement.ts.
 */
var InputNumberWebElementBase = /** @class */ (function (_super) {
    __extends(InputNumberWebElementBase, _super);
    function InputNumberWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>autocomplete</code> property.
     * Dictates component's autocomplete state
     * @return The value of <code>autocomplete</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getAutocomplete = function () {
        return this.getProperty('autocomplete');
    };
    /**
     * Gets the value of <code>containerReadonly</code> property.
     * Specifies whether an ancestor container, like oj-form-layout, is readonly.
     * @return The value of <code>containerReadonly</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getContainerReadonly = function () {
        return this.getProperty('containerReadonly');
    };
    /**
     * Gets the value of <code>converter</code> property.
     * Specifies the converter instance.
     * @return The value of <code>converter</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getConverter = function () {
        return this.getProperty('converter');
    };
    /**
     * Gets the value of <code>disabled</code> property.
     * Specifies whether the component is disabled.
     * @return The value of <code>disabled</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getDisabled = function () {
        return this.getProperty('disabled');
    };
    /**
     * Gets the value of <code>displayOptions</code> property.
     * Display options for auxiliary content that determines whether or not it should be displayed.
     * @return The value of <code>displayOptions</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getDisplayOptions = function () {
        return this.getProperty('displayOptions');
    };
    /**
     * Gets the value of <code>help</code> property.
     * Form component help information.
     * @return The value of <code>help</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getHelp = function () {
        return this.getProperty('help');
    };
    /**
     * Gets the value of <code>helpHints</code> property.
     * The helpHints object contains a definition property and a source property.
     * @return The value of <code>helpHints</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getHelpHints = function () {
        return this.getProperty('helpHints');
    };
    /**
     * Gets the value of <code>inputPrefix</code> property.
     * The text before the input text.
     * @return The value of <code>inputPrefix</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getInputPrefix = function () {
        return this.getProperty('inputPrefix');
    };
    /**
     * Gets the value of <code>inputSuffix</code> property.
     * The text after the input text.
     * @return The value of <code>inputSuffix</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getInputSuffix = function () {
        return this.getProperty('inputSuffix');
    };
    /**
     * Gets the value of <code>labelEdge</code> property.
     * Specifies how the label is positioned for the component
     * @return The value of <code>labelEdge</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getLabelEdge = function () {
        return this.getProperty('labelEdge');
    };
    /**
     * Gets the value of <code>labelHint</code> property.
     * Represents a hint for rendering a label on the component.
     * @return The value of <code>labelHint</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getLabelHint = function () {
        return this.getProperty('labelHint');
    };
    /**
     * Gets the value of <code>labelStartWidth</code> property.
     * The width of the label when labelEdge is 'start'.
     * @return The value of <code>labelStartWidth</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getLabelStartWidth = function () {
        return this.getProperty('labelStartWidth');
    };
    /**
     * Gets the value of <code>labelWrapping</code> property.
     * Should the labels wrap or truncate when there is not enough available space.
     * @return The value of <code>labelWrapping</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getLabelWrapping = function () {
        return this.getProperty('labelWrapping');
    };
    /**
     * Gets the value of <code>max</code> property.
     * The maximum allowed value
     * @return The value of <code>max</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getMax = function () {
        return this.getProperty('max');
    };
    /**
     * Gets the value of <code>min</code> property.
     * The maximum allowed value
     * @return The value of <code>min</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getMin = function () {
        return this.getProperty('min');
    };
    /**
     * Sets the value of <code>messagesCustom</code> property.
     * List of custom component messages
     * @param messagesCustom The value to set for <code>messagesCustom</code>
     *
     */
    InputNumberWebElementBase.prototype.changeMessagesCustom = function (messagesCustom) {
        return this.setProperty('messagesCustom', messagesCustom);
    };
    /**
     * Gets the value of <code>messagesCustom</code> property.
     * List of custom component messages
     * @return The value of <code>messagesCustom</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getMessagesCustom = function () {
        return this.getProperty('messagesCustom');
    };
    /**
     * Gets the value of <code>numberRangeExactMessageDetail</code> property.
     * Overrides the default NumberRangeValidator's exact message detail.
     * @return The value of <code>numberRangeExactMessageDetail</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getNumberRangeExactMessageDetail = function () {
        return this.getProperty('numberRangeExactMessageDetail');
    };
    /**
     * Gets the value of <code>numberRangeOverflowMessageDetail</code> property.
     * Overrides the default NumberRangeValidator's exact message detail.
     * @return The value of <code>numberRangeOverflowMessageDetail</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getNumberRangeOverflowMessageDetail = function () {
        return this.getProperty('numberRangeOverflowMessageDetail');
    };
    /**
     * Gets the value of <code>numberRangeUnderflowMessageDetail</code> property.
     * Overrides the default NumberRangeValidator's exact message detail.
     * @return The value of <code>numberRangeUnderflowMessageDetail</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getNumberRangeUnderflowMessageDetail = function () {
        return this.getProperty('numberRangeUnderflowMessageDetail');
    };
    /**
     * Gets the value of <code>placeholder</code> property.
     * The placeholder text to set on the element.
     * @return The value of <code>placeholder</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getPlaceholder = function () {
        return this.getProperty('placeholder');
    };
    /**
     * Gets the value of <code>readonly</code> property.
     * Whether the component is readonly
     * @return The value of <code>readonly</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getReadonly = function () {
        return this.getProperty('readonly');
    };
    /**
     * Gets the value of <code>required</code> property.
     * Specifies whether or not the component is required.
     * @return The value of <code>required</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getRequired = function () {
        return this.getProperty('required');
    };
    /**
     * Gets the value of <code>requiredMessageDetail</code> property.
     * Overrides the default Required error message.
     * @return The value of <code>requiredMessageDetail</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getRequiredMessageDetail = function () {
        return this.getProperty('requiredMessageDetail');
    };
    /**
     * Gets the value of <code>step</code> property.
     * Specifies the amount to increase or decrease the value when moving in step increments. If 0, no step functionality.
     * @return The value of <code>step</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getStep = function () {
        return this.getProperty('step');
    };
    /**
     * Gets the value of <code>textAlign</code> property.
     * Specifies how the text is aligned within the text field
     * @return The value of <code>textAlign</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getTextAlign = function () {
        return this.getProperty('textAlign');
    };
    /**
     * Gets the value of <code>userAssistanceDensity</code> property.
     * Specifies the density of the form component's user assistance presentation.
     * @return The value of <code>userAssistanceDensity</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getUserAssistanceDensity = function () {
        return this.getProperty('userAssistanceDensity');
    };
    /**
     * Gets the value of <code>validators</code> property.
     * Specifies the validators for the component.
     * @return The value of <code>validators</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getValidators = function () {
        return this.getProperty('validators');
    };
    /**
     * Sets the value of <code>value</code> property.
     * The value of the component.
     * @param value The value to set for <code>value</code>
     *
     */
    InputNumberWebElementBase.prototype.changeValue = function (value) {
        return this.setProperty('value', value);
    };
    /**
     * Gets the value of <code>value</code> property.
     * The value of the component.
     * @return The value of <code>value</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getValue = function () {
        return this.getProperty('value');
    };
    /**
     * Gets the value of <code>virtualKeyboard</code> property.
     * The type of virtual keyboard to display for entering a value on mobile browsers
     * @return The value of <code>virtualKeyboard</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getVirtualKeyboard = function () {
        return this.getProperty('virtualKeyboard');
    };
    /**
     * Gets the value of <code>rawValue</code> property.
     * Specifies how the raw value of the component
     * @return The value of <code>rawValue</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getRawValue = function () {
        return this.getProperty('rawValue');
    };
    /**
     * Gets the value of <code>transientValue</code> property.
     * Specifies the transient value of the component
     * @return The value of <code>transientValue</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getTransientValue = function () {
        return this.getProperty('transientValue');
    };
    /**
     * Gets the value of <code>valid</code> property.
     * Specifies how the valid state of the component
     * @return The value of <code>valid</code> property.
     *
     */
    InputNumberWebElementBase.prototype.getValid = function () {
        return this.getProperty('valid');
    };
    return InputNumberWebElementBase;
}(elements_1.OjWebElement));
exports.InputNumberWebElementBase = InputNumberWebElementBase;
