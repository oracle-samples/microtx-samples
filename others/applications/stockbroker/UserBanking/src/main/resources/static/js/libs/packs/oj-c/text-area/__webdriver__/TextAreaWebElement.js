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
exports.TextAreaWebElement = void 0;
var TextAreaWebElementBase_1 = require("./TextAreaWebElementBase");
/**
 * The component WebElement for [oj-c-text-area](../../../oj-c/docs/oj.TextArea.html).
 * Do not instantiate this class directly, instead, use
 * [findTextArea](../modules.html#findTextArea).
 */
var TextAreaWebElement = /** @class */ (function (_super) {
    __extends(TextAreaWebElement, _super);
    function TextAreaWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TextAreaWebElement;
}(TextAreaWebElementBase_1.TextAreaWebElementBase));
exports.TextAreaWebElement = TextAreaWebElement;
