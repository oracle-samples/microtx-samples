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
exports.ProgressCircleWebElement = void 0;
var ProgressCircleWebElementBase_1 = require("./ProgressCircleWebElementBase");
/**
 * The component WebElement for [oj-c-progress-circle](../../../oj-c/docs/oj.ProgressCircle.html).
 * Do not instantiate this class directly, instead, use
 * [findProgressCircle](../modules.html#findProgressCircle).
 */
var ProgressCircleWebElement = /** @class */ (function (_super) {
    __extends(ProgressCircleWebElement, _super);
    function ProgressCircleWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ProgressCircleWebElement;
}(ProgressCircleWebElementBase_1.ProgressCircleWebElementBase));
exports.ProgressCircleWebElement = ProgressCircleWebElement;
