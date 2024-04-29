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
exports.MeterCircleWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-meter-circle WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, MeterCircleWebElement.ts.
 */
var MeterCircleWebElementBase = /** @class */ (function (_super) {
    __extends(MeterCircleWebElementBase, _super);
    function MeterCircleWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>max</code> property.
     * The maximum value of the meter circle.
     * @return The value of <code>max</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getMax = function () {
        return this.getProperty('max');
    };
    /**
     * Gets the value of <code>min</code> property.
     * The minimum value of the meter circle.
     * @return The value of <code>min</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getMin = function () {
        return this.getProperty('min');
    };
    /**
     * Gets the value of <code>readonly</code> property.
     *
     * @return The value of <code>readonly</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getReadonly = function () {
        return this.getProperty('readonly');
    };
    /**
     * Sets the value of <code>value</code> property.
     * The value of the meter circle.
     * @param value The value to set for <code>value</code>
     *
     */
    MeterCircleWebElementBase.prototype.changeValue = function (value) {
        return this.setProperty('value', value);
    };
    /**
     * Gets the value of <code>value</code> property.
     * The value of the meter circle.
     * @return The value of <code>value</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getValue = function () {
        return this.getProperty('value');
    };
    /**
     * Gets the value of <code>step</code> property.
     *
     * @return The value of <code>step</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getStep = function () {
        return this.getProperty('step');
    };
    /**
     * Gets the value of <code>color</code> property.
     *
     * @return The value of <code>color</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getColor = function () {
        return this.getProperty('color');
    };
    /**
     * Gets the value of <code>indicatorSize</code> property.
     *
     * @return The value of <code>indicatorSize</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getIndicatorSize = function () {
        return this.getProperty('indicatorSize');
    };
    /**
     * Gets the value of <code>innerRadius</code> property.
     *
     * @return The value of <code>innerRadius</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getInnerRadius = function () {
        return this.getProperty('innerRadius');
    };
    /**
     * Gets the value of <code>plotArea</code> property.
     *
     * @return The value of <code>plotArea</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getPlotArea = function () {
        return this.getProperty('plotArea');
    };
    /**
     * Gets the value of <code>angleExtent</code> property.
     *
     * @return The value of <code>angleExtent</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getAngleExtent = function () {
        return this.getProperty('angleExtent');
    };
    /**
     * Gets the value of <code>startAngle</code> property.
     *
     * @return The value of <code>startAngle</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getStartAngle = function () {
        return this.getProperty('startAngle');
    };
    /**
     * Gets the value of <code>referenceLines</code> property.
     *
     * @return The value of <code>referenceLines</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getReferenceLines = function () {
        return this.getProperty('referenceLines');
    };
    /**
     * Gets the value of <code>thresholdDisplay</code> property.
     *
     * @return The value of <code>thresholdDisplay</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getThresholdDisplay = function () {
        return this.getProperty('thresholdDisplay');
    };
    /**
     * Gets the value of <code>thresholds</code> property.
     *
     * @return The value of <code>thresholds</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getThresholds = function () {
        return this.getProperty('thresholds');
    };
    /**
     * Gets the value of <code>describedBy</code> property.
     *
     * @return The value of <code>describedBy</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getDescribedBy = function () {
        return this.getProperty('describedBy');
    };
    /**
     * Gets the value of <code>labelledBy</code> property.
     *
     * @return The value of <code>labelledBy</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getLabelledBy = function () {
        return this.getProperty('labelledBy');
    };
    /**
     * Gets the value of <code>size</code> property.
     * Specifies the size of the meter circle.
     * @return The value of <code>size</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getSizeProperty = function () {
        return this.getProperty('size');
    };
    /**
     * Gets the value of <code>datatip</code> property.
     *
     * @return The value of <code>datatip</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getDatatip = function () {
        return this.getProperty('datatip');
    };
    /**
     * Gets the value of <code>transientValue</code> property.
     *
     * @return The value of <code>transientValue</code> property.
     *
     */
    MeterCircleWebElementBase.prototype.getTransientValue = function () {
        return this.getProperty('transientValue');
    };
    return MeterCircleWebElementBase;
}(elements_1.OjWebElement));
exports.MeterCircleWebElementBase = MeterCircleWebElementBase;
