define(["require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider",
        "ojs/ojchart", "ojs/ojinputtext", "ojs/ojlabelvalue", "ojs/ojlabel",
        "ojs/ojformlayout"],
    function (acrequire, exports, ko, Bootstrap, ArrayDataProvider) {
        function DashboardViewModel() {
            var self = this;

            //Bank Accounts PieChart
            this.bankAccountsChartGroup = ko.observable("Bank Group");
            branchStats = ko.observableArray([]);

            callGetBranchStats()
                .then((response) => {
                    branchStats(response)
                })
                .catch((error) => {
                    console.error(error);
                    console.error("Error getting Branch stats from CoreBank Service");
                });

            this.threeDChart = ko.observable("on");
            this.bankAccountsChartDataProvider = new ArrayDataProvider(branchStats, {
                keyAttributes: "id",
            });

        }

        return DashboardViewModel;
    }
);
