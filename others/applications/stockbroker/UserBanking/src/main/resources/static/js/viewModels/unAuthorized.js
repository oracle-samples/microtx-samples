define(["require", "exports", "knockout", "ojs/ojbootstrap", "appController",
        "ojs/ojinputtext", "ojs/ojlabelvalue", "ojs/ojlabel", "ojs/ojformlayout"],
    function (acrequire, exports, ko, Bootstrap, appController) {
        function UnAuthorizedAccessViewModel() {
            var self = this;
            this.accountId = ko.observable();
            this.accountId(appController.accountId());
        }
        return UnAuthorizedAccessViewModel;
    }
);
