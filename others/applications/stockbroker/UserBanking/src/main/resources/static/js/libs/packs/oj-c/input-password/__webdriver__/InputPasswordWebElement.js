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
exports.InputPasswordWebElement = void 0;
var InputPasswordWebElementBase_1 = require("./InputPasswordWebElementBase");
/**
 * The component WebElement for [oj-c-input-password](../../../oj-c/docs/oj.InputPassword.html).
 * Do not instantiate this class directly, instead, use
 * [findInputPassword](../modules.html#findInputPassword).
 */
var InputPasswordWebElement = /** @class */ (function (_super) {
    __extends(InputPasswordWebElement, _super);
    function InputPasswordWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InputPasswordWebElement;
}(InputPasswordWebElementBase_1.InputPasswordWebElementBase));
exports.InputPasswordWebElement = InputPasswordWebElement;
