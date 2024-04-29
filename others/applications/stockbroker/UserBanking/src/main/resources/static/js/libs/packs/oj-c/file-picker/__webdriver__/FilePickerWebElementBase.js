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
exports.FilePickerWebElementBase = void 0;
var elements_1 = require("@oracle/oraclejet-webdriver/elements");
/**
 * This is the base class for oj-c-file-picker WebElement, and is generated from the
 * component's metadata. Do not modify these contents since they'll be replaced
 * during the next generation.
 * Put overrides into the WebElements's subclass, FilePickerWebElement.ts.
 */
var FilePickerWebElementBase = /** @class */ (function (_super) {
    __extends(FilePickerWebElementBase, _super);
    function FilePickerWebElementBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets the value of <code>accept</code> property.
     * An array of strings of allowed MIME types or file extensions that can be uploaded. If not specified, accept all file types
     * @return The value of <code>accept</code> property.
     *
     */
    FilePickerWebElementBase.prototype.getAccept = function () {
        return this.getProperty('accept');
    };
    /**
     * Gets the value of <code>capture</code> property.
     * Specifies the preferred facing mode for the device's media capture mechanism.
     * @return The value of <code>capture</code> property.
     *
     */
    FilePickerWebElementBase.prototype.getCapture = function () {
        return this.getProperty('capture');
    };
    /**
     * Gets the value of <code>disabled</code> property.
     * Disables the filepicker if set to true
     * @return The value of <code>disabled</code> property.
     *
     */
    FilePickerWebElementBase.prototype.getDisabled = function () {
        return this.getProperty('disabled');
    };
    /**
     * Gets the value of <code>primaryText</code> property.
     * The primary text for the default file picker.
     * @return The value of <code>primaryText</code> property.
     *
     */
    FilePickerWebElementBase.prototype.getPrimaryText = function () {
        return this.getProperty('primaryText');
    };
    /**
     * Gets the value of <code>secondaryText</code> property.
     * The secondary text for the default file picker.
     * @return The value of <code>secondaryText</code> property.
     *
     */
    FilePickerWebElementBase.prototype.getSecondaryText = function () {
        return this.getProperty('secondaryText');
    };
    /**
     * Gets the value of <code>selectionMode</code> property.
     * Whether to allow single or multiple file selection.
     * @return The value of <code>selectionMode</code> property.
     *
     */
    FilePickerWebElementBase.prototype.getSelectionMode = function () {
        return this.getProperty('selectionMode');
    };
    return FilePickerWebElementBase;
}(elements_1.OjWebElement));
exports.FilePickerWebElementBase = FilePickerWebElementBase;
