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
exports.AvatarWebElement = void 0;
var AvatarWebElementBase_1 = require("./AvatarWebElementBase");
/**
 * The component WebElement for [oj-c-avatar](../../../oj-c/docs/oj.Avatar.html).
 * Do not instantiate this class directly, instead, use
 * [findAvatar](../modules.html#findAvatar).
 */
var AvatarWebElement = /** @class */ (function (_super) {
    __extends(AvatarWebElement, _super);
    function AvatarWebElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AvatarWebElement;
}(AvatarWebElementBase_1.AvatarWebElementBase));
exports.AvatarWebElement = AvatarWebElement;
