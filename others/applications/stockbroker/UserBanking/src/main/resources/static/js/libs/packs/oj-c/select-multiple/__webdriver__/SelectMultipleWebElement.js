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
exports.SelectMultipleWebElement = void 0;
var SelectMultipleWebElementBase_1 = require("./SelectMultipleWebElementBase");
/**
 * The component WebElement for [oj-c-select-multiple](../../../oj-c/docs/oj.SelectMultiple.html).
 * Do not instantiate this class directly, instead, use
 * [findSelectMultiple](../modules.html#findSelectMultiple).
 */
var SelectMultipleWebElement = /** @class */ (function (_super) {
    __extends(SelectMultipleWebElement, _super);
    function SelectMultipleWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SelectMultipleWebElement;
}(SelectMultipleWebElementBase_1.SelectMultipleWebElementBase));
exports.SelectMultipleWebElement = SelectMultipleWebElement;
