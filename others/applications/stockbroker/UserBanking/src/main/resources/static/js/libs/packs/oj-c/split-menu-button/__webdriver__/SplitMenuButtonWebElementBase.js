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
exports.SplitMenuButtonWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-split-menu-button WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, SplitMenuButtonWebElement.ts.
 */
var SplitMenuButtonWebElementBase = /** @class */ (function (_super) {
    __extends(SplitMenuButtonWebElementBase, _super);
    function SplitMenuButtonWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>label</code> property.
     * Text to show in the button.
     * @return The value of <code>label</code> property.
     *
     */
    SplitMenuButtonWebElementBase.prototype.getLabel = function () {
        return this.getProperty('label');
    };
    /**
     * Gets the value of <code>items</code> property.
     * Items describe the menu items rendered by the menu button.
     * @return The value of <code>items</code> property.
     *
     */
    SplitMenuButtonWebElementBase.prototype.getItems = function () {
        return this.getProperty('items');
    };
    /**
     * Gets the value of <code>disabled</code> property.
     * Specifies that the button element should be disabled.
     * @return The value of <code>disabled</code> property.
     *
     */
    SplitMenuButtonWebElementBase.prototype.getDisabled = function () {
        return this.getProperty('disabled');
    };
    /**
     * Gets the value of <code>size</code> property.
     * Size of button
     * @return The value of <code>size</code> property.
     *
     */
    SplitMenuButtonWebElementBase.prototype.getSizeProperty = function () {
        return this.getProperty('size');
    };
    /**
     * Gets the value of <code>width</code> property.
     * Specifies that the button style width
     * @return The value of <code>width</code> property.
     *
     */
    SplitMenuButtonWebElementBase.prototype.getWidth = function () {
        return this.getProperty('width');
    };
    /**
     * Gets the value of <code>chroming</code> property.
     * Indicates in what states the button has chromings in background and border.
     * @return The value of <code>chroming</code> property.
     *
     */
    SplitMenuButtonWebElementBase.prototype.getChroming = function () {
        return this.getProperty('chroming');
    };
    return SplitMenuButtonWebElementBase;
}(elements_1.OjWebElement));
exports.SplitMenuButtonWebElementBase = SplitMenuButtonWebElementBase;
