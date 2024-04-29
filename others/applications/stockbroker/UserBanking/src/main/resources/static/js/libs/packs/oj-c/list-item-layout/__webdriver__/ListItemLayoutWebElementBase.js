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
exports.ListItemLayoutWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-list-item-layout WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, ListItemLayoutWebElement.ts.
 */
var ListItemLayoutWebElementBase = /** @class */ (function (_super) {
    __extends(ListItemLayoutWebElementBase, _super);
    function ListItemLayoutWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>inset</code> property.
     * Controls padding around outside of list item layouts.
     * @return The value of <code>inset</code> property.
     *
     */
    ListItemLayoutWebElementBase.prototype.getInset = function () {
        return this.getProperty('inset');
    };
    return ListItemLayoutWebElementBase;
}(elements_1.OjWebElement));
exports.ListItemLayoutWebElementBase = ListItemLayoutWebElementBase;
