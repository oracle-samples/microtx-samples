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
exports.SelectMultipleWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-select-multiple WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, SelectMultipleWebElement.ts.
 */
var SelectMultipleWebElementBase = /** @class */ (function (_super) {
    __extends(SelectMultipleWebElementBase, _super);
    function SelectMultipleWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>containerReadonly</code> property.
     * Specifies whether an ancestor container, like oj-form-layout, is readonly.
     * @return The value of <code>containerReadonly</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getContainerReadonly = function () {
        return this.getProperty('containerReadonly');
    };
    /**
     * Gets the value of <code>data</code> property.
     * Specifies whether the component is disabled.
     * @return The value of <code>data</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getData = function () {
        return this.getProperty('data');
    };
    /**
     * Gets the value of <code>disabled</code> property.
     * Specifies whether the component is disabled.
     * @return The value of <code>disabled</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getDisabled = function () {
        return this.getProperty('disabled');
    };
    /**
     * Gets the value of <code>displayOptions</code> property.
     * Display options for auxiliary content that determines whether or not it should be displayed.
     * @return The value of <code>displayOptions</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getDisplayOptions = function () {
        return this.getProperty('displayOptions');
    };
    /**
     * Gets the value of <code>help</code> property.
     * Form component help information.
     * @return The value of <code>help</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getHelp = function () {
        return this.getProperty('help');
    };
    /**
     * Gets the value of <code>helpHints</code> property.
     * The helpHints object contains a definition property and a source property.
     * @return The value of <code>helpHints</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getHelpHints = function () {
        return this.getProperty('helpHints');
    };
    /**
     * Gets the value of <code>itemText</code> property.
     * Specifies how to get the text string to render for a data item.
     * @return The value of <code>itemText</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getItemText = function () {
        return this.getProperty('itemText');
    };
    /**
     * Gets the value of <code>labelEdge</code> property.
     * Specifies how the label is positioned for the component
     * @return The value of <code>labelEdge</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getLabelEdge = function () {
        return this.getProperty('labelEdge');
    };
    /**
     * Gets the value of <code>labelHint</code> property.
     * Represents a hint for rendering a label on the component.
     * @return The value of <code>labelHint</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getLabelHint = function () {
        return this.getProperty('labelHint');
    };
    /**
     * Gets the value of <code>labelStartWidth</code> property.
     * The width of the label when labelEdge is 'start'
     * @return The value of <code>labelStartWidth</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getLabelStartWidth = function () {
        return this.getProperty('labelStartWidth');
    };
    /**
     * Gets the value of <code>labelWrapping</code> property.
     * Should the labels wrap or truncate when there is not enough available space.
     * @return The value of <code>labelWrapping</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getLabelWrapping = function () {
        return this.getProperty('labelWrapping');
    };
    /**
     * Sets the value of <code>messagesCustom</code> property.
     * List of custom component messages
     * @param messagesCustom The value to set for <code>messagesCustom</code>
     *
     */
    SelectMultipleWebElementBase.prototype.changeMessagesCustom = function (messagesCustom) {
        return this.setProperty('messagesCustom', messagesCustom);
    };
    /**
     * Gets the value of <code>messagesCustom</code> property.
     * List of custom component messages
     * @return The value of <code>messagesCustom</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getMessagesCustom = function () {
        return this.getProperty('messagesCustom');
    };
    /**
     * Gets the value of <code>placeholder</code> property.
     * The placeholder text to set on the element.
     * @return The value of <code>placeholder</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getPlaceholder = function () {
        return this.getProperty('placeholder');
    };
    /**
     * Gets the value of <code>readonly</code> property.
     * Whether the component is readonly
     * @return The value of <code>readonly</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getReadonly = function () {
        return this.getProperty('readonly');
    };
    /**
     * Gets the value of <code>required</code> property.
     * Specifies whether or not the component is required.
     * @return The value of <code>required</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getRequired = function () {
        return this.getProperty('required');
    };
    /**
     * Gets the value of <code>requiredMessageDetail</code> property.
     * Overrides the default Required error message.
     * @return The value of <code>requiredMessageDetail</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getRequiredMessageDetail = function () {
        return this.getProperty('requiredMessageDetail');
    };
    /**
     * Gets the value of <code>textAlign</code> property.
     * Specifies how the text is aligned within the text field
     * @return The value of <code>textAlign</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getTextAlign = function () {
        return this.getProperty('textAlign');
    };
    /**
     * Gets the value of <code>userAssistanceDensity</code> property.
     * Specifies the density of the form component's user assistance presentation.
     * @return The value of <code>userAssistanceDensity</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getUserAssistanceDensity = function () {
        return this.getProperty('userAssistanceDensity');
    };
    /**
     * Sets the value of <code>value</code> property.
     * The value of the component.
     * @param value The value to set for <code>value</code>
     *
     */
    SelectMultipleWebElementBase.prototype.changeValue = function (value) {
        return this.setProperty('value', value);
    };
    /**
     * Gets the value of <code>value</code> property.
     * The value of the component.
     * @return The value of <code>value</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getValue = function () {
        return this.getProperty('value');
    };
    /**
     * Sets the value of <code>valueItems</code> property.
     * The current value of the element and its associated data.
     * @param valueItems The value to set for <code>valueItems</code>
     *
     */
    SelectMultipleWebElementBase.prototype.changeValueItems = function (valueItems) {
        return this.setProperty('valueItems', valueItems);
    };
    /**
     * Gets the value of <code>valueItems</code> property.
     * The current value of the element and its associated data.
     * @return The value of <code>valueItems</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getValueItems = function () {
        return this.getProperty('valueItems');
    };
    /**
     * Gets the value of <code>virtualKeyboard</code> property.
     * The type of virtual keyboard to display for entering a value on mobile browsers
     * @return The value of <code>virtualKeyboard</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getVirtualKeyboard = function () {
        return this.getProperty('virtualKeyboard');
    };
    /**
     * Gets the value of <code>valid</code> property.
     * Specifies how the valid state of the component
     * @return The value of <code>valid</code> property.
     *
     */
    SelectMultipleWebElementBase.prototype.getValid = function () {
        return this.getProperty('valid');
    };
    return SelectMultipleWebElementBase;
}(elements_1.OjWebElement));
exports.SelectMultipleWebElementBase = SelectMultipleWebElementBase;
