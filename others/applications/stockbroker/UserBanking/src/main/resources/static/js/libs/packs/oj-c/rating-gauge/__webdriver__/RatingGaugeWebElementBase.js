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
exports.RatingGaugeWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-rating-gauge WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, RatingGaugeWebElement.ts.
 */
var RatingGaugeWebElementBase = /** @class */ (function (_super) {
    __extends(RatingGaugeWebElementBase, _super);
    function RatingGaugeWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>max</code> property.
     * The maximum value of the gauge.
     * @return The value of <code>max</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getMax = function () {
        return this.getProperty('max');
    };
    /**
     * Gets the value of <code>readonly</code> property.
     *
     * @return The value of <code>readonly</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getReadonly = function () {
        return this.getProperty('readonly');
    };
    /**
     * Gets the value of <code>disabled</code> property.
     *
     * @return The value of <code>disabled</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getDisabled = function () {
        return this.getProperty('disabled');
    };
    /**
     * Sets the value of <code>changed</code> property.
     * Whether there has been a value entered by the user even if it is the same as the initial value.
     * @param changed The value to set for <code>changed</code>
     *
     */
    RatingGaugeWebElementBase.prototype.changeChanged = function (changed) {
        return this.setProperty('changed', changed);
    };
    /**
     * Gets the value of <code>changed</code> property.
     * Whether there has been a value entered by the user even if it is the same as the initial value.
     * @return The value of <code>changed</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getChanged = function () {
        return this.getProperty('changed');
    };
    /**
     * Sets the value of <code>value</code> property.
     * The value of the Rating Gauge.
     * @param value The value to set for <code>value</code>
     *
     */
    RatingGaugeWebElementBase.prototype.changeValue = function (value) {
        return this.setProperty('value', value);
    };
    /**
     * Gets the value of <code>value</code> property.
     * The value of the Rating Gauge.
     * @return The value of <code>value</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getValue = function () {
        return this.getProperty('value');
    };
    /**
     * Gets the value of <code>step</code> property.
     *
     * @return The value of <code>step</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getStep = function () {
        return this.getProperty('step');
    };
    /**
     * Gets the value of <code>describedBy</code> property.
     *
     * @return The value of <code>describedBy</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getDescribedBy = function () {
        return this.getProperty('describedBy');
    };
    /**
     * Gets the value of <code>labelledBy</code> property.
     *
     * @return The value of <code>labelledBy</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getLabelledBy = function () {
        return this.getProperty('labelledBy');
    };
    /**
     * Gets the value of <code>size</code> property.
     * Specifies the size of the rating gauge items.
     * @return The value of <code>size</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getSizeProperty = function () {
        return this.getProperty('size');
    };
    /**
     * Gets the value of <code>color</code> property.
     * Specifies the color of the rating gauge items.
     * @return The value of <code>color</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getColor = function () {
        return this.getProperty('color');
    };
    /**
     * Gets the value of <code>datatip</code> property.
     *
     * @return The value of <code>datatip</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getDatatip = function () {
        return this.getProperty('datatip');
    };
    /**
     * Gets the value of <code>tooltip</code> property.
     *
     * @return The value of <code>tooltip</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getTooltip = function () {
        return this.getProperty('tooltip');
    };
    /**
     * Gets the value of <code>transientValue</code> property.
     *
     * @return The value of <code>transientValue</code> property.
     *
     */
    RatingGaugeWebElementBase.prototype.getTransientValue = function () {
        return this.getProperty('transientValue');
    };
    return RatingGaugeWebElementBase;
}(elements_1.OjWebElement));
exports.RatingGaugeWebElementBase = RatingGaugeWebElementBase;
