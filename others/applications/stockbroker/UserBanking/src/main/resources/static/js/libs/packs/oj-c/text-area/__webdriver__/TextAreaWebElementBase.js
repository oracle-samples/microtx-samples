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
exports.TextAreaWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-text-area WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, TextAreaWebElement.ts.
 */
var TextAreaWebElementBase = /** @class */ (function (_super) {
    __extends(TextAreaWebElementBase, _super);
    function TextAreaWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>autocomplete</code> property.
     * Dictates component's autocomplete state
     * @return The value of <code>autocomplete</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getAutocomplete = function () {
        return this.getProperty('autocomplete');
    };
    /**
     * Gets the value of <code>containerReadonly</code> property.
     * Specifies whether an ancestor container, like oj-form-layout, is readonly.
     * @return The value of <code>containerReadonly</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getContainerReadonly = function () {
        return this.getProperty('containerReadonly');
    };
    /**
     * Gets the value of <code>converter</code> property.
     * Specifies the converter instance.
     * @return The value of <code>converter</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getConverter = function () {
        return this.getProperty('converter');
    };
    /**
     * Gets the value of <code>disabled</code> property.
     * Specifies whether the component is disabled.
     * @return The value of <code>disabled</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getDisabled = function () {
        return this.getProperty('disabled');
    };
    /**
     * Gets the value of <code>displayOptions</code> property.
     * Display options for auxiliary content that determines whether or not it should be displayed.
     * @return The value of <code>displayOptions</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getDisplayOptions = function () {
        return this.getProperty('displayOptions');
    };
    /**
     * Gets the value of <code>help</code> property.
     * Form component help information.
     * @return The value of <code>help</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getHelp = function () {
        return this.getProperty('help');
    };
    /**
     * Gets the value of <code>helpHints</code> property.
     * The helpHints object contains a definition property and a source property.
     * @return The value of <code>helpHints</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getHelpHints = function () {
        return this.getProperty('helpHints');
    };
    /**
     * Gets the value of <code>labelEdge</code> property.
     * Specifies how the label is positioned for the component
     * @return The value of <code>labelEdge</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getLabelEdge = function () {
        return this.getProperty('labelEdge');
    };
    /**
     * Gets the value of <code>labelHint</code> property.
     * Represents a hint for rendering a label on the component.
     * @return The value of <code>labelHint</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getLabelHint = function () {
        return this.getProperty('labelHint');
    };
    /**
     * Gets the value of <code>labelStartWidth</code> property.
     * The width of the label when labelEdge is 'start'.
     * @return The value of <code>labelStartWidth</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getLabelStartWidth = function () {
        return this.getProperty('labelStartWidth');
    };
    /**
     * Gets the value of <code>labelWrapping</code> property.
     * Should the labels wrap or truncate when there is not enough available space.
     * @return The value of <code>labelWrapping</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getLabelWrapping = function () {
        return this.getProperty('labelWrapping');
    };
    /**
     * Gets the value of <code>length</code> property.
     * Defines the length limit for the field
     * @return The value of <code>length</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getLength = function () {
        return this.getProperty('length');
    };
    /**
     * Gets the value of <code>maxRows</code> property.
     * The maximum number of visible text lines of the textarea.
     * @return The value of <code>maxRows</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getMaxRows = function () {
        return this.getProperty('maxRows');
    };
    /**
     * Sets the value of <code>messagesCustom</code> property.
     * List of custom component messages
     * @param messagesCustom The value to set for <code>messagesCustom</code>
     *
     */
    TextAreaWebElementBase.prototype.changeMessagesCustom = function (messagesCustom) {
        return this.setProperty('messagesCustom', messagesCustom);
    };
    /**
     * Gets the value of <code>messagesCustom</code> property.
     * List of custom component messages
     * @return The value of <code>messagesCustom</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getMessagesCustom = function () {
        return this.getProperty('messagesCustom');
    };
    /**
     * Gets the value of <code>placeholder</code> property.
     * The placeholder text to set on the element.
     * @return The value of <code>placeholder</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getPlaceholder = function () {
        return this.getProperty('placeholder');
    };
    /**
     * Gets the value of <code>readonly</code> property.
     * Whether the component is readonly
     * @return The value of <code>readonly</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getReadonly = function () {
        return this.getProperty('readonly');
    };
    /**
     * Gets the value of <code>required</code> property.
     * Specifies whether or not the component is required.
     * @return The value of <code>required</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getRequired = function () {
        return this.getProperty('required');
    };
    /**
     * Gets the value of <code>requiredMessageDetail</code> property.
     * Overrides the default Required error message.
     * @return The value of <code>requiredMessageDetail</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getRequiredMessageDetail = function () {
        return this.getProperty('requiredMessageDetail');
    };
    /**
     * Gets the value of <code>resizeBehavior</code> property.
     * Defines the resizeBehavior of the textarea.
     * @return The value of <code>resizeBehavior</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getResizeBehavior = function () {
        return this.getProperty('resizeBehavior');
    };
    /**
     * Gets the value of <code>rows</code> property.
     * The number of visible text lines in the textarea.
     * @return The value of <code>rows</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getRows = function () {
        return this.getProperty('rows');
    };
    /**
     * Gets the value of <code>textAlign</code> property.
     * Specifies how the text is aligned within the text field
     * @return The value of <code>textAlign</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getTextAlign = function () {
        return this.getProperty('textAlign');
    };
    /**
     * Gets the value of <code>userAssistanceDensity</code> property.
     * Specifies the density of the form component's user assistance presentation.
     * @return The value of <code>userAssistanceDensity</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getUserAssistanceDensity = function () {
        return this.getProperty('userAssistanceDensity');
    };
    /**
     * Gets the value of <code>validators</code> property.
     * Specifies the validators for the component.
     * @return The value of <code>validators</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getValidators = function () {
        return this.getProperty('validators');
    };
    /**
     * Sets the value of <code>value</code> property.
     * The value of the component.
     * @param value The value to set for <code>value</code>
     *
     */
    TextAreaWebElementBase.prototype.changeValue = function (value) {
        return this.setProperty('value', value);
    };
    /**
     * Gets the value of <code>value</code> property.
     * The value of the component.
     * @return The value of <code>value</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getValue = function () {
        return this.getProperty('value');
    };
    /**
     * Gets the value of <code>rawValue</code> property.
     * Specifies how the raw value of the component
     * @return The value of <code>rawValue</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getRawValue = function () {
        return this.getProperty('rawValue');
    };
    /**
     * Gets the value of <code>valid</code> property.
     * Specifies how the valid state of the component
     * @return The value of <code>valid</code> property.
     *
     */
    TextAreaWebElementBase.prototype.getValid = function () {
        return this.getProperty('valid');
    };
    return TextAreaWebElementBase;
}(elements_1.OjWebElement));
exports.TextAreaWebElementBase = TextAreaWebElementBase;
