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
exports.ButtonWebElement = void 0;
var ButtonWebElementBase_1 = require("./ButtonWebElementBase");
/**
 * The component WebElement for [oj-c-button](../../../oj-c/docs/oj.Button.html).
 * Do not instantiate this class directly, instead, use
 * [findButton](../modules.html#findButton).
 */
var ButtonWebElement = /** @class */ (function (_super) {
    __extends(ButtonWebElement, _super);
    function ButtonWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Put overrides here
    /**
     * Sets the value of <code>label</code> property.
     * Text to show in the button.
     * @param label The value to set for <code>label</code>
     * @deprecated Since 14.0.0. Do not use this method to change the button label. It will be removed in the next release.
     */
    ButtonWebElement.prototype.changeLabel = function (label) {
        return this.setProperty('label', label);
    };
    /**
     * Sets the value of <code>disabled</code> property.
     * Specifies that the button element should be disabled.
     * @param disabled The value to set for <code>disabled</code>
     * @deprecated Since 14.0.0. Do not use this method to disable the button. It will be removed in the next release.
     */
    ButtonWebElement.prototype.changeDisabled = function (disabled) {
        return this.setProperty('disabled', disabled);
    };
    /**
     * Sets the value of <code>width</code> property.
     * Specifies that the button style width
     * @param width The value to set for <code>width</code>
     * @deprecated Since 14.0.0. Do not use this method to change the button width. It will be removed in the next release.
     */
    ButtonWebElement.prototype.changeWidth = function (width) {
        return this.setProperty('width', width);
    };
    /**
     * Sets the value of <code>display</code> property.
     * Display just the label, the icons, or all. Label is used as tooltip and should be set in all cases.
     * @param display The value to set for <code>display</code>
     * @deprecated Since 14.0.0. Do not use this method to change the button display. It will be removed in the next release.
     */
    ButtonWebElement.prototype.changeDisplay = function (display) {
        return this.setProperty('display', display);
    };
    /**
     * Sets the value of <code>size</code> property.
     * Size of button
     * @param size The value to set for <code>size</code>
     * @deprecated Since 14.0.0. Do not use this method to change the button size. It will be removed in the next release.
     */
    ButtonWebElement.prototype.changeSizeProperty = function (size) {
        return this.setProperty('size', size);
    };
    /**
     * Sets the value of <code>edge</code> property.
     * Specifies whether the button is attached to an edge. For example setting edge='bottom' can be used to attach a button to the bottom of a card. The button is then stretched to 100% width, and borders adjusted.
     * @param edge The value to set for <code>edge</code>
     * @deprecated Since 14.0.0. Do not use this method to change the button edge. It will be removed in the next release.
     */
    ButtonWebElement.prototype.changeEdge = function (edge) {
        return this.setProperty('edge', edge);
    };
    /**
     * Sets the value of <code>chroming</code> property.
     * Indicates in what states the button has variants in background and border.
     * @param chroming The value to set for <code>chroming</code>
     * @deprecated Since 14.0.0. Do not use this method to change the button chroming. It will be removed in the next release.
     */
    ButtonWebElement.prototype.changeChroming = function (chroming) {
        return this.setProperty('chroming', chroming);
    };
    return ButtonWebElement;
}(ButtonWebElementBase_1.ButtonWebElementBase));
exports.ButtonWebElement = ButtonWebElement;
