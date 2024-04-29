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
exports.MessageToastWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-message-toast WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, MessageToastWebElement.ts.
 */
var MessageToastWebElementBase = /** @class */ (function (_super) {
    __extends(MessageToastWebElementBase, _super);
    function MessageToastWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>data</code> property.
     * Data for the Message Toast component.
     * @return The value of <code>data</code> property.
     *
     */
    MessageToastWebElementBase.prototype.getData = function () {
        return this.getProperty('data');
    };
    /**
     * Gets the value of <code>detailTemplateValue</code> property.
     * A dynamic template key or a function that determines the detail template for the current row.
     * @return The value of <code>detailTemplateValue</code> property.
     *
     */
    MessageToastWebElementBase.prototype.getDetailTemplateValue = function () {
        return this.getProperty('detailTemplateValue');
    };
    /**
     * Gets the value of <code>iconTemplateValue</code> property.
     * A dynamic template key or a function that determines the icon template for the current row.
     * @return The value of <code>iconTemplateValue</code> property.
     *
     */
    MessageToastWebElementBase.prototype.getIconTemplateValue = function () {
        return this.getProperty('iconTemplateValue');
    };
    /**
     * Gets the value of <code>offset</code> property.
     * Offset for the Message Toast component's position.
     * @return The value of <code>offset</code> property.
     *
     */
    MessageToastWebElementBase.prototype.getOffset = function () {
        return this.getProperty('offset');
    };
    /**
     * Gets the value of <code>position</code> property.
     * Position for the Message Toast component.
     * @return The value of <code>position</code> property.
     *
     */
    MessageToastWebElementBase.prototype.getPosition = function () {
        return this.getProperty('position');
    };
    return MessageToastWebElementBase;
}(elements_1.OjWebElement));
exports.MessageToastWebElementBase = MessageToastWebElementBase;
