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
exports.CollapsibleWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-collapsible WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, CollapsibleWebElement.ts.
 */
var CollapsibleWebElementBase = /** @class */ (function (_super) {
    __extends(CollapsibleWebElementBase, _super);
    function CollapsibleWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>disabled</code> property.
     * Disables the collapsible if set to true
     * @return The value of <code>disabled</code> property.
     *
     */
    CollapsibleWebElementBase.prototype.getDisabled = function () {
        return this.getProperty('disabled');
    };
    /**
     * Gets the value of <code>iconPosition</code> property.
     * Controls placement of the icon in the header.
     * @return The value of <code>iconPosition</code> property.
     *
     */
    CollapsibleWebElementBase.prototype.getIconPosition = function () {
        return this.getProperty('iconPosition');
    };
    /**
     * Gets the value of <code>variant</code> property.
     * Controls display of the optional divider below the header.
     * @return The value of <code>variant</code> property.
     *
     */
    CollapsibleWebElementBase.prototype.getVariant = function () {
        return this.getProperty('variant');
    };
    return CollapsibleWebElementBase;
}(elements_1.OjWebElement));
exports.CollapsibleWebElementBase = CollapsibleWebElementBase;
