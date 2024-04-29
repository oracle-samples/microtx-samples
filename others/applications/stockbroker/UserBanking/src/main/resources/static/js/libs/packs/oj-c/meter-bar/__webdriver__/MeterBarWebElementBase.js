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
exports.MeterBarWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-meter-bar WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, MeterBarWebElement.ts.
 */
var MeterBarWebElementBase = /** @class */ (function (_super) {
    __extends(MeterBarWebElementBase, _super);
    function MeterBarWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>max</code> property.
     * The maximum value of the meter bar.
     * @return The value of <code>max</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getMax = function () {
        return this.getProperty('max');
    };
    /**
     * Gets the value of <code>min</code> property.
     * The minimum value of the meter bar.
     * @return The value of <code>min</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getMin = function () {
        return this.getProperty('min');
    };
    /**
     * Gets the value of <code>readonly</code> property.
     *
     * @return The value of <code>readonly</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getReadonly = function () {
        return this.getProperty('readonly');
    };
    /**
     * Sets the value of <code>value</code> property.
     * The value of the meter bar.
     * @param value The value to set for <code>value</code>
     *
     */
    MeterBarWebElementBase.prototype.changeValue = function (value) {
        return this.setProperty('value', value);
    };
    /**
     * Gets the value of <code>value</code> property.
     * The value of the meter bar.
     * @return The value of <code>value</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getValue = function () {
        return this.getProperty('value');
    };
    /**
     * Gets the value of <code>step</code> property.
     *
     * @return The value of <code>step</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getStep = function () {
        return this.getProperty('step');
    };
    /**
     * Gets the value of <code>color</code> property.
     *
     * @return The value of <code>color</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getColor = function () {
        return this.getProperty('color');
    };
    /**
     * Gets the value of <code>indicatorSize</code> property.
     *
     * @return The value of <code>indicatorSize</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getIndicatorSize = function () {
        return this.getProperty('indicatorSize');
    };
    /**
     * Gets the value of <code>plotArea</code> property.
     *
     * @return The value of <code>plotArea</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getPlotArea = function () {
        return this.getProperty('plotArea');
    };
    /**
     * Gets the value of <code>orientation</code> property.
     *
     * @return The value of <code>orientation</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getOrientation = function () {
        return this.getProperty('orientation');
    };
    /**
     * Gets the value of <code>referenceLines</code> property.
     *
     * @return The value of <code>referenceLines</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getReferenceLines = function () {
        return this.getProperty('referenceLines');
    };
    /**
     * Gets the value of <code>thresholdDisplay</code> property.
     *
     * @return The value of <code>thresholdDisplay</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getThresholdDisplay = function () {
        return this.getProperty('thresholdDisplay');
    };
    /**
     * Gets the value of <code>thresholds</code> property.
     *
     * @return The value of <code>thresholds</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getThresholds = function () {
        return this.getProperty('thresholds');
    };
    /**
     * Gets the value of <code>describedBy</code> property.
     *
     * @return The value of <code>describedBy</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getDescribedBy = function () {
        return this.getProperty('describedBy');
    };
    /**
     * Gets the value of <code>labelledBy</code> property.
     *
     * @return The value of <code>labelledBy</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getLabelledBy = function () {
        return this.getProperty('labelledBy');
    };
    /**
     * Gets the value of <code>size</code> property.
     * Specifies the size of the meter bar.
     * @return The value of <code>size</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getSizeProperty = function () {
        return this.getProperty('size');
    };
    /**
     * Gets the value of <code>datatip</code> property.
     *
     * @return The value of <code>datatip</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getDatatip = function () {
        return this.getProperty('datatip');
    };
    /**
     * Gets the value of <code>transientValue</code> property.
     *
     * @return The value of <code>transientValue</code> property.
     *
     */
    MeterBarWebElementBase.prototype.getTransientValue = function () {
        return this.getProperty('transientValue');
    };
    return MeterBarWebElementBase;
}(elements_1.OjWebElement));
exports.MeterBarWebElementBase = MeterBarWebElementBase;
