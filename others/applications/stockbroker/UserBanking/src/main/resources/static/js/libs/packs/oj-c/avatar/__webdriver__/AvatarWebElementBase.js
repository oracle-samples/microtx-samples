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
exports.AvatarWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-avatar WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, AvatarWebElement.ts.
 */
var AvatarWebElementBase = /** @class */ (function (_super) {
    __extends(AvatarWebElementBase, _super);
    function AvatarWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>background</code> property.
     * Specifies the background of the avatar.
     * @return The value of <code>background</code> property.
     *
     */
    AvatarWebElementBase.prototype.getBackground = function () {
        return this.getProperty('background');
    };
    /**
     * Gets the value of <code>initials</code> property.
     * Specifies the initials of the avatar.
     * @return The value of <code>initials</code> property.
     *
     */
    AvatarWebElementBase.prototype.getInitials = function () {
        return this.getProperty('initials');
    };
    /**
     * Gets the value of <code>size</code> property.
     * Specifies the size of the avatar.
     * @return The value of <code>size</code> property.
     *
     */
    AvatarWebElementBase.prototype.getSizeProperty = function () {
        return this.getProperty('size');
    };
    /**
     * Gets the value of <code>src</code> property.
     * Specifies the source for the image of the avatar.
     * @return The value of <code>src</code> property.
     *
     */
    AvatarWebElementBase.prototype.getSrc = function () {
        return this.getProperty('src');
    };
    /**
     * Gets the value of <code>iconClass</code> property.
     * The icon class to be displayed.
     * @return The value of <code>iconClass</code> property.
     *
     */
    AvatarWebElementBase.prototype.getIconClass = function () {
        return this.getProperty('iconClass');
    };
    /**
     * Gets the value of <code>shape</code> property.
     * Specifies the shape of the avatar.
     * @return The value of <code>shape</code> property.
     *
     */
    AvatarWebElementBase.prototype.getShape = function () {
        return this.getProperty('shape');
    };
    return AvatarWebElementBase;
}(elements_1.OjWebElement));
exports.AvatarWebElementBase = AvatarWebElementBase;
