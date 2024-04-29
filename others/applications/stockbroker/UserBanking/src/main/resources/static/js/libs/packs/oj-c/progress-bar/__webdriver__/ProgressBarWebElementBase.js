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
exports.ProgressBarWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-progress-bar WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, ProgressBarWebElement.ts.
 */
var ProgressBarWebElementBase = /** @class */ (function (_super) {
    __extends(ProgressBarWebElementBase, _super);
    function ProgressBarWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>max</code> property.
     * The maximum allowed value.
     * @return The value of <code>max</code> property.
     *
     */
    ProgressBarWebElementBase.prototype.getMax = function () {
        return this.getProperty('max');
    };
    /**
     * Gets the value of <code>value</code> property.
     * The value of the Progress Bar.
     * @return The value of <code>value</code> property.
     *
     */
    ProgressBarWebElementBase.prototype.getValue = function () {
        return this.getProperty('value');
    };
    /**
     * Gets the value of <code>edge</code> property.
     * Specifies whether the progress bar is on the top edge of a container
     * @return The value of <code>edge</code> property.
     *
     */
    ProgressBarWebElementBase.prototype.getEdge = function () {
        return this.getProperty('edge');
    };
    return ProgressBarWebElementBase;
}(elements_1.OjWebElement));
exports.ProgressBarWebElementBase = ProgressBarWebElementBase;
