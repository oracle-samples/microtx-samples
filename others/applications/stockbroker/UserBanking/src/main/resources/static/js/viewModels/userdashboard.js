define(["require", "exports", "knockout", "ojs/ojbootstrap", "appController",
        "ojs/ojinputtext", "ojs/ojlabelvalue", "ojs/ojlabel", "ojs/ojformlayout"],
    function (acrequire, exports, ko, Bootstrap, appController) {
        function DashboardViewModel() {

            var self = this;
            this.accountId = ko.observable(appController.accountId());

            this.userName = ko.observable();
            this.accountNumber = ko.observable();
            this.ssn = ko.observable();
            this.phoneNumber = ko.observable();
            this.address = ko.observable();
            this.branchId = ko.observable();

            this.branchName = ko.observable();
            this.branchPhoneNumber = ko.observable();
            this.branchAddress = ko.observable();

            callAccountDetails(this.accountId())
                .then((response) => {
                    this.userName(response.firstName + ' ' + response.middleName + ' ' + response.lastName);
                    this.branchId(response.branchId);
                    this.accountNumber(response.accountNumber);
                    this.ssn(response.ssn);
                    this.phoneNumber(response.phoneNumber);
                    this.address(response.address);

                    callBranchDetails(this.branchId())
                        .then((response) => {
                            this.branchName(response.branchName);
                            this.branchId(response.branchId);
                            this.branchPhoneNumber(response.phoneNumber);
                            this.branchAddress(response.address);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting Branch details from CoreBank Service");
                        });
                })
                .catch((error) => {
                    console.error(error);
                    console.error("Error getting User details from CoreBank Service");
                });
        }

        return DashboardViewModel;
    }
);
