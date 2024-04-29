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
exports.ButtonWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-button WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, ButtonWebElement.ts.
 */
var ButtonWebElementBase = /** @class */ (function (_super) {
    __extends(ButtonWebElementBase, _super);
    function ButtonWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>label</code> property.
     * Text to show in the button.
     * @return The value of <code>label</code> property.
     *
     */
    ButtonWebElementBase.prototype.getLabel = function () {
        return this.getProperty('label');
    };
    /**
     * Gets the value of <code>disabled</code> property.
     * Specifies that the button element should be disabled.
     * @return The value of <code>disabled</code> property.
     *
     */
    ButtonWebElementBase.prototype.getDisabled = function () {
        return this.getProperty('disabled');
    };
    /**
     * Gets the value of <code>width</code> property.
     * Specifies that the button style width
     * @return The value of <code>width</code> property.
     *
     */
    ButtonWebElementBase.prototype.getWidth = function () {
        return this.getProperty('width');
    };
    /**
     * Gets the value of <code>display</code> property.
     * Display just the label, the icons, or all. Label is used as tooltip and should be set in all cases.
     * @return The value of <code>display</code> property.
     *
     */
    ButtonWebElementBase.prototype.getDisplay = function () {
        return this.getProperty('display');
    };
    /**
     * Gets the value of <code>size</code> property.
     * Size of button
     * @return The value of <code>size</code> property.
     *
     */
    ButtonWebElementBase.prototype.getSizeProperty = function () {
        return this.getProperty('size');
    };
    /**
     * Gets the value of <code>edge</code> property.
     * Specifies whether the button is attached to an edge. For example setting edge='bottom' can be used to attach a button to the bottom of a card. The button is then stretched to 100% width, and borders adjusted.
     * @return The value of <code>edge</code> property.
     *
     */
    ButtonWebElementBase.prototype.getEdge = function () {
        return this.getProperty('edge');
    };
    /**
     * Gets the value of <code>chroming</code> property.
     * Indicates in what states the button has variants in background and border.
     * @return The value of <code>chroming</code> property.
     *
     */
    ButtonWebElementBase.prototype.getChroming = function () {
        return this.getProperty('chroming');
    };
    return ButtonWebElementBase;
}(elements_1.OjWebElement));
exports.ButtonWebElementBase = ButtonWebElementBase;
