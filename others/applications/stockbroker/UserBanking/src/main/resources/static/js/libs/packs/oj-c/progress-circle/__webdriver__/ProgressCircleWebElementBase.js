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
exports.ProgressCircleWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-progress-circle WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, ProgressCircleWebElement.ts.
 */
var ProgressCircleWebElementBase = /** @class */ (function (_super) {
    __extends(ProgressCircleWebElementBase, _super);
    function ProgressCircleWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>max</code> property.
     * The maximum allowed value.
     * @return The value of <code>max</code> property.
     *
     */
    ProgressCircleWebElementBase.prototype.getMax = function () {
        return this.getProperty('max');
    };
    /**
     * Gets the value of <code>value</code> property.
     * The value of the Progress Circle.
     * @return The value of <code>value</code> property.
     *
     */
    ProgressCircleWebElementBase.prototype.getValue = function () {
        return this.getProperty('value');
    };
    /**
     * Gets the value of <code>size</code> property.
     * Specifies the size of the progress circle.
     * @return The value of <code>size</code> property.
     *
     */
    ProgressCircleWebElementBase.prototype.getSizeProperty = function () {
        return this.getProperty('size');
    };
    return ProgressCircleWebElementBase;
}(elements_1.OjWebElement));
exports.ProgressCircleWebElementBase = ProgressCircleWebElementBase;
