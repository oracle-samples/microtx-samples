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
exports.MessageToastWebElement = void 0;
var MessageToastWebElementBase_1 = require("./MessageToastWebElementBase");
/**
 * The component WebElement for [oj-c-message-toast](../../../oj-c/docs/oj.MessageToast.html).
 * Do not instantiate this class directly, instead, use
 * [findMessageToast](../modules.html#findMessageToast).
 */
var MessageToastWebElement = /** @class */ (function (_super) {
    __extends(MessageToastWebElement, _super);
    function MessageToastWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MessageToastWebElement;
}(MessageToastWebElementBase_1.MessageToastWebElementBase));
exports.MessageToastWebElement = MessageToastWebElement;
