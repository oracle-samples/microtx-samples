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
exports.SplitMenuButtonWebElement = void 0;
var SplitMenuButtonWebElementBase_1 = require("./SplitMenuButtonWebElementBase");
/**
 * The component WebElement for [oj-c-meter-circle](../../../oj-c/docs/oj.MeterCircle.html).
 * Do not instantiate this class directly, instead, use
 * [findMeterCircle](../modules.html#findMeterCircle).
 */
var SplitMenuButtonWebElement = /** @class */ (function (_super) {
    __extends(SplitMenuButtonWebElement, _super);
    function SplitMenuButtonWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SplitMenuButtonWebElement;
}(SplitMenuButtonWebElementBase_1.SplitMenuButtonWebElementBase));
exports.SplitMenuButtonWebElement = SplitMenuButtonWebElement;
