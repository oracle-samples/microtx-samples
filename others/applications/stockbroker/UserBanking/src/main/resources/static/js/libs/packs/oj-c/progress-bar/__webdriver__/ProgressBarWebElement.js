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
exports.ProgressBarWebElement = void 0;
var ProgressBarWebElementBase_1 = require("./ProgressBarWebElementBase");
/**
 * The component WebElement for [oj-c-progress-bar](../../../oj-c/docs/oj.ProgressBar.html).
 * Do not instantiate this class directly, instead, use
 * [findProgressBar](../modules.html#findProgressBar).
 */
var ProgressBarWebElement = /** @class */ (function (_super) {
    __extends(ProgressBarWebElement, _super);
    function ProgressBarWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ProgressBarWebElement;
}(ProgressBarWebElementBase_1.ProgressBarWebElementBase));
exports.ProgressBarWebElement = ProgressBarWebElement;
