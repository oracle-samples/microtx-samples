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
exports.RatingGaugeWebElement = void 0;
var RatingGaugeWebElementBase_1 = require("./RatingGaugeWebElementBase");
/**
 * The component WebElement for [oj-c-rating-gauge](../../../oj-c/docs/oj.RatingGauge.html).
 * Do not instantiate this class directly, instead, use
 * [findRatingGauge](../modules.html#findRatingGauge).
 */
var RatingGaugeWebElement = /** @class */ (function (_super) {
    __extends(RatingGaugeWebElement, _super);
    function RatingGaugeWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RatingGaugeWebElement;
}(RatingGaugeWebElementBase_1.RatingGaugeWebElementBase));
exports.RatingGaugeWebElement = RatingGaugeWebElement;
