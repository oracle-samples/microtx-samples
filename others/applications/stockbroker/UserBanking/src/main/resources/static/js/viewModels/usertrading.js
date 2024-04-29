let tradingNavigationList = [
    {
        name: "Stocks",
        id: "stocks",
        icons: "icon-stats-bars"
    },
    {
        name: "Buy Stocks",
        id: "buystocks",
        icons: "icon-arrow-down-left2",
    },
    {
        name: "Sell Stocks",
        id: "sellstocks",
        icons: "icon-arrow-up-right2"
    },
    {
        name: "Statement",
        id: "statement",
        icons: "oj-ux-ico-library"
    }
];


define(["require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider", "ojs/ojasyncvalidator-regexp", "ojs/ojconverter-datetime", "ojs/ojconverter-number", "appController",
        "ojs/ojvalidationgroup", "ojs/ojknockout", "ojs/ojnavigationlist", "ojs/ojswitcher", "ojs/ojswitch",
        "ojs/ojlabel", "ojs/ojformlayout", "ojs/ojchart", "ojs/ojtable", "ojs/ojbutton", "ojs/ojtrain",
        "ojs/ojinputtext", "ojs/ojdialog", "ojs/ojselectsingle", "ojs/ojlabelvalue", "ojs/ojprogress-bar"],
    function (require, exports, ko, Bootstrap, ArrayDataProvider, AsyncRegExpValidator, ojconverter_datetime_1, ojconverter_number_1, appController) {
        function TradingViewModel() {
            var self = this;
            this.accountId = ko.observable(appController.accountId());

            this.tradingNavigationDataProvider = new ArrayDataProvider(tradingNavigationList, {
                keyAttributes: "id",
            });

            this.selectedItem1 = ko.observable("stocks");
            this.selectedItem2 = ko.observable("stocks");
            this.selectedItem3 = ko.observable("stocks");
            this.isContrastBackground = ko.observable(false);
            this.isContrastBackground.subscribe(function (newValue) {
                let navlistContainers = document.querySelectorAll(".navlistcontainer");
                Array.prototype.forEach.call(navlistContainers, (navlistContainer) => {
                    if (newValue) {
                        navlistContainer.className =
                            navlistContainer.className + " oj-bg-neutral-170 oj-color-invert";
                    } else {
                        navlistContainer.className = navlistContainer.className.replace("oj-bg-neutral-170 oj-color-invert", "");
                    }
                });
            });

            this.onTradingNavigationValueChangeEvent = (event) => {
                if (event.detail.value == 'statement') {
                    callGetStockTransactions(this.accountId())
                        .then((response) => {
                            this.stockTransactionHistoryArray(response.transactionHistories);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting transaction history from StockBroker Service");
                        });
                } else if (event.detail.value == 'stocks') {
                    callGetAvailableStocks()
                        .then((response) => {
                            this.availableStocksArray(response.stocks);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting available stocks from StockBroker Service");
                        });

                    callGetUserStocks(this.accountId())
                        .then((response) => {
                            this.userStocksArray(response.userStocks);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting user stocks from StockBroker Service");
                        });

                    callGetUserStocks(this.accountId())
                        .then((response) => {
                            this.userStocksStats(response.userStocks);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting user stocks from StockBroker Service");
                        });

                }
            };

            //Summary
            this.availableStocksArray = ko.observableArray([]);
            this.userStocksArray = ko.observableArray([]);


            callGetAvailableStocks()
                .then((response) => {
                    this.availableStocksArray(response.stocks);
                })
                .catch((error) => {
                    console.error(error);
                    console.error("Error getting available stocks from StockBroker Service");
                });

            this.availableStocksTableDataprovider = new ArrayDataProvider(this.availableStocksArray, {
                keyAttributes: "stockSymbol",
                implicitSort: [{attribute: "stockSymbol", direction: "ascending"}],
            });


            callGetUserStocks(this.accountId())
                .then((response) => {
                    this.userStocksArray(response.userStocks);
                    this.userStocksStats(response.userStocks);
                })
                .catch((error) => {
                    console.error(error);
                    console.error("Error getting user stocks from StockBroker Service");
                });

            this.userStocksTableDataprovider = new ArrayDataProvider(this.userStocksArray, {
                keyAttributes: "stockSymbol",
                implicitSort: [{attribute: "stockSymbol", direction: "ascending"}],
            });

            //User Stocks PieChart
            this.userStocksChartGroup = ko.observable("User Stocks");
            this.userStocksStats = ko.observableArray([]);

            this.threeDChart = ko.observable("on");
            this.userStocksChartDataProvider = new ArrayDataProvider(this.userStocksStats, {
                keyAttributes: "stockSymbol",
            });

//------------------------------------------------------------------------------------------------------------------------------------------------
            //Buy Stocks
            this.buyStockSelectedStepValue = ko.observable("buyStockDetails");
            this.buyStockSelectedStepLabel = ko.observable("Stock Purchase Details");
            this.buyStockSelectedStepFormLabel = ko.observable("Please fill in Stock Purchase Details");

            //Stock Purchase Details
            this.buyStockSymbol = ko.observable();
            this.buyStockUnits = ko.observable();
            this.buyStocksRemarks = ko.observable();
            this.buyStocksArray = ko.observableArray([]);

            //Stock Purchase Response
            this.buyStockResponse = ko.observable();
            this.buyStockTransactionId = ko.observable();
            this.buyStockResultMessage = ko.observable();

            this.isBuyStockFormReadonly = ko.observable(false);

            this.isBuyStockDetailsConfirmed = ko.observable(false);

            this.buyCloseCancelButton = ko.observable("Cancel");

            this.buyStockStepArray = ko.observableArray([
                {label: "Details", id: "buyStockDetails", visited: false},
                {label: "Confirmation", id: "buyStockConfirmation", visited: false},
                {label: "Summary", id: "buyStockSummary", visited: false},
            ]);


            //Buy Stocks Dialog
            this.openBuyStockWiz = (event) => {
                document.getElementById("buyStocksModalDialog").open();

                this.buyCloseCancelButton("Cancel");
                this.buyStockSymbol(null);
                this.buyStockUnits(null);
                this.buyStocksRemarks(null);
                this.selectedBuyStock(null);

                this.buyStockResponse(null);
                this.buyStockTransactionId(null);
                this.buyStockResultMessage(null);

                this.isBuyStockDetailsConfirmed(false);
                this.buyStockSelectedStepValue("buyStockDetails");

                this.buyStockConfirmButtonDisplay("inline-flex");
                this.showBuyStockProgressAnimation(false);

                var train = document.getElementById("buyStocksTrain");
                for (var i = 0; i < this.buyStockStepArray().length; i++) {
                    let step = train.getStep(this.buyStockStepArray()[i].id);
                    step.visited = false;
                    step.messageType = null;
                    train.updateStep(step.id, step);
                }

                callGetAvailableStocksForListing()
                    .then((response) => {
                        this.buyStocksArray(response);
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Error getting available stocks from StockBroker Service");
                    });

            }

            this.cancelBuyStockWiz = (event) => {
                document.getElementById("buyStocksModalDialog").close();

                this.buyCloseCancelButton("Cancel");
                this.buyStockSymbol(null);
                this.buyStockUnits(null);
                this.buyStocksRemarks(null);
                this.selectedBuyStock(null);

                this.buyStockResponse(null);
                this.buyStockTransactionId(null);
                this.buyStockResultMessage(null);

                this.isBuyStockDetailsConfirmed(false);
                this.buyStockSelectedStepValue("buyStockDetails");

                this.buyStockConfirmButtonDisplay("inline-flex");
                this.showBuyStockProgressAnimation(false);


                var train = document.getElementById("buyStocksTrain");
                for (var i = 0; i < this.buyStockStepArray().length; i++) {
                    let step = train.getStep(this.buyStockStepArray()[i].id);
                    step.visited = false;
                    step.messageType = null;
                    train.updateStep(step.id, step);
                }
            };

            // Buy Stocks Dropdown
            this.selectedBuyStock = ko.observable();
            this.buyStocksListDP = new ArrayDataProvider(this.buyStocksArray, {
                keyAttributes: "value",
            });

            this.onValueChangeActionForbuyStocks = (event) => {
                this.buyStockSymbol(event.detail.value);
                this.selectedBuyStock(event.detail.itemContext.data.label);
            }

            //Field validation
            //It is being called by the train to make sure the form is valid before moving on to the next step.

            this.stockUnitRegExpValidator = new AsyncRegExpValidator({
                pattern: "^[1-9]\\d*$",
                hint: "Number of Stock Units to be Purchased or sold",
                messageDetail: "Stock units must be positive number and minimum 1 unit",
            });

            this.buyValidate = (event) => {
                let nextStep = event.detail.toStep;
                let previousStep = event.detail.fromStep;
                let current = event.detail.getStep;
                var tracker = document.getElementById("buyTracker");
                if (tracker == null) {
                    return;
                }
                var train = document.getElementById("buyStocksTrain");
                if (tracker.valid === "valid") {
                    if (nextStep.id === "buyStockSummary") {
                        if (!this.isBuyStockDetailsConfirmed()) {
                            event.preventDefault();
                            previousStep.messageType = "error";
                            train.updateStep(previousStep.id, previousStep);
                        } else {
                            previousStep.messageType = "confirmation";
                            train.updateStep(previousStep.id, previousStep);
                        }
                        return;
                    } else if (previousStep.id === "buyStockDetails") {
                        //The previous step will have a confirmation message type icon
                        previousStep.messageType = "confirmation";
                        train.updateStep(previousStep.id, previousStep);
                        //Now the clicked step could be selected
                        this.buyStockSelectedStepValue(nextStep.id);
                        return;
                    } else if (previousStep.id === "buyStockSummary") {
                        //validation is not required for last step(buyStockSummary)
                        return;
                    } else {
                        previousStep.messageType = null;
                        previousStep.visited = false;
                        train.updateStep(previousStep.id, previousStep);
                        return;
                    }

                } else {
                    //The ojBeforeSelect can be cancelled by calling event.preventDefault().
                    event.preventDefault();
                    //The previous step will have an error message type icon
                    previousStep.messageType = "error";
                    train.updateStep(previousStep.id, previousStep);
                    // show messages on all the components
                    // that have messages hidden.
                    setTimeout(function () {
                        tracker.showMessages();
                        tracker.focusOn("@firstInvalidShown");
                    }, 0);
                    return;
                }
            };


            //field mapping
            this.buyStockUpdateLabelText = (event) => {
                var train = document.getElementById("buyStocksTrain");
                let selectedStep = train.getStep(event.detail.value);
                if (selectedStep != null) {
                    this.buyStockSelectedStepLabel(selectedStep.label);
                }
                if (selectedStep != null && selectedStep.id == "buyStockDetails") {
                    this.buyStockSelectedStepFormLabel("Please provide the details of the stock to be purchased");
                    this.isBuyStockFormReadonly(false);
                } else if (selectedStep != null && selectedStep.id == "buyStockConfirmation") {
                    this.buyStockSelectedStepFormLabel("Please review the Stock purchase details");
                    this.isBuyStockFormReadonly(true);
                } else if (selectedStep != null && selectedStep.id == "buyStockSummary") {
                    this.buyStockSelectedStepFormLabel("Stock purchase summary");
                    this.isBuyStockFormReadonly(true);
                } else {
                    this.buyStockSelectedStepFormLabel("");
                    this.isBuyStockFormReadonly(false);
                }
            };

            this.buyStockConfirmButtonDisplay = ko.observable("inline-flex");
            this.showBuyStockProgressAnimation = ko.observable(false);

            this.confirmStockPurchase = async (event) => {
                var train = document.getElementById("buyStocksTrain");
                let buyStockConfirmStep = train.getStep("buyStockConfirmation");
                let buyStockSummaryStep = train.getStep("buyStockSummary");

                if (buyStockConfirmStep != null) {
                    buyStockConfirmStep.messageType = "confirmation";
                    train.updateStep(buyStockConfirmStep.id, buyStockConfirmStep);

                    buyStockRequest = {
                        "userAccountId": this.accountId(),
                        "stockSymbol": this.buyStockSymbol(),
                        "stockUnits": this.buyStockUnits(),
                        "remarks": this.buyStocksRemarks()
                    };

                    this.buyStockConfirmButtonDisplay("none");
                    this.showBuyStockProgressAnimation(true);

                    await callPurchaseStocks(buyStockRequest)
                        .then((response) => {
                            this.buyStockResponse(response);
                            this.buyStockConfirmButtonDisplay("inline-flex");
                            this.showBuyStockProgressAnimation(false);

                            if (response.httpStatusCode == 200) {
                                buyStockSummaryStep.messageType = "confirmation";
                            } else {
                                buyStockSummaryStep.messageType = "warning";
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Transfer failed");
                            this.showBuyStockProgressAnimation(false);
                        });

                    this.buyStockTransactionId(this.buyStockResponse().transactionId);
                    this.buyStockResultMessage(this.buyStockResponse().message);

                    train.updateStep(buyStockSummaryStep.id, buyStockSummaryStep);
                    this.buyStockSelectedStepValue("buyStockSummary");
                    this.isBuyStockDetailsConfirmed(true);
                    this.buyCloseCancelButton("Close");
                }
            };

//------------------------------------------------------------------------------------------------------------------------------------------------
            //Sell Stocks
            this.sellStockSelectedStepValue = ko.observable("sellStockDetails");
            this.sellStockSelectedStepLabel = ko.observable("Stock Sell Details");
            this.sellStockSelectedStepFormLabel = ko.observable("Please fill in Stock Sell Details");

            //Stock Purchase Details
            this.sellStockSymbol = ko.observable();
            this.sellStockUnits = ko.observable();
            this.sellStocksRemarks = ko.observable();
            this.sellStocksArray = ko.observableArray([]);

            //Stock Purchase Response
            this.sellStockResponse = ko.observable();
            this.sellStockTransactionId = ko.observable();
            this.sellStockResultMessage = ko.observable();

            this.isSellStockFormReadonly = ko.observable(false);

            this.isSellStockDetailsConfirmed = ko.observable(false);

            this.sellCloseCancelButton = ko.observable("Cancel");

            this.sellStockStepArray = ko.observableArray([
                {label: "Details", id: "sellStockDetails", visited: false},
                {label: "Confirmation", id: "sellStockConfirmation", visited: false},
                {label: "Summary", id: "sellStockSummary", visited: false},
            ]);


            //Sell Stocks Dialog
            this.openSellStocksWiz = (event) => {
                document.getElementById("sellStocksModalDialog").open();

                this.sellCloseCancelButton("Cancel");
                this.sellStockSymbol(null);
                this.sellStockUnits(null);
                this.sellStocksRemarks(null);
                this.sellStocksArray([]);
                this.selectedSellStock(null);

                this.sellStockResponse(null);
                this.sellStockTransactionId(null);
                this.sellStockResultMessage(null);

                this.isSellStockDetailsConfirmed(false);
                this.sellStockSelectedStepValue("sellStockDetails");

                this.sellStockConfirmButtonDisplay("inline-flex");
                this.showSellStockProgressAnimation(false);

                var train = document.getElementById("sellStocksTrain");
                for (var i = 0; i < this.sellStockStepArray().length; i++) {
                    let step = train.getStep(this.sellStockStepArray()[i].id);
                    step.visited = false;
                    step.messageType = null;
                    train.updateStep(step.id, step);
                }

                callGetAvailableStocksForListing()
                    .then((response) => {
                        this.sellStocksArray(response);
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Error getting available stocks from StockBroker Service");
                    });
            }

            this.cancelSellStocksWiz = (event) => {
                document.getElementById("sellStocksModalDialog").close();

                this.sellCloseCancelButton("Cancel");
                this.sellStockSymbol(null);
                this.sellStockUnits(null);
                this.sellStocksRemarks(null);
                this.sellStocksArray([]);
                this.selectedSellStock(null);

                this.sellStockResponse(null);
                this.sellStockTransactionId(null);
                this.sellStockResultMessage(null);

                this.isSellStockDetailsConfirmed(false);
                this.sellStockSelectedStepValue("sellStockDetails");

                this.sellStockConfirmButtonDisplay("inline-flex");
                this.showSellStockProgressAnimation(false);

                var train = document.getElementById("sellStocksTrain");
                for (var i = 0; i < this.sellStockStepArray().length; i++) {
                    let step = train.getStep(this.sellStockStepArray()[i].id);
                    step.visited = false;
                    step.messageType = null;
                    train.updateStep(step.id, step);
                }
            };

            // Sell Stocks Dropdown
            this.selectedSellStock = ko.observable();
            this.sellStocksListDP = new ArrayDataProvider(this.sellStocksArray, {
                keyAttributes: "value",
            });

            this.onValueChangeActionForSellStocks = (event) => {
                this.sellStockSymbol(event.detail.value);
                this.selectedSellStock(event.detail.itemContext.data.label);
            }

            //Field validation
            //It is being called by the train to make sure the form is valid before moving on to the next step.

            this.sellValidate = (event) => {
                let nextStep = event.detail.toStep;
                let previousStep = event.detail.fromStep;
                let current = event.detail.getStep;
                var tracker = document.getElementById("sellTracker");
                if (tracker == null) {
                    return;
                }
                var train = document.getElementById("sellStocksTrain");
                if (tracker.valid === "valid") {
                    if (nextStep.id === "sellStockSummary") {
                        if (!this.isSellStockDetailsConfirmed()) {
                            event.preventDefault();
                            previousStep.messageType = "error";
                            train.updateStep(previousStep.id, previousStep);
                        } else {
                            previousStep.messageType = "confirmation";
                            train.updateStep(previousStep.id, previousStep);
                        }
                        return;
                    } else if (previousStep.id === "sellStockDetails") {
                        //The previous step will have a confirmation message type icon
                        previousStep.messageType = "confirmation";
                        train.updateStep(previousStep.id, previousStep);
                        //Now the clicked step could be selected
                        this.sellStockSelectedStepValue(nextStep.id);
                        return;
                    } else if (previousStep.id === "sellStockSummary") {
                        //validation is not required for last step(sellStockSummary)
                        return;
                    } else {
                        previousStep.messageType = null;
                        previousStep.visited = false;
                        train.updateStep(previousStep.id, previousStep);
                        return;
                    }

                } else {
                    //The ojBeforeSelect can be cancelled by calling event.preventDefault().
                    event.preventDefault();
                    //The previous step will have an error message type icon
                    previousStep.messageType = "error";
                    train.updateStep(previousStep.id, previousStep);
                    // show messages on all the components
                    // that have messages hidden.
                    setTimeout(function () {
                        tracker.showMessages();
                        tracker.focusOn("@firstInvalidShown");
                    }, 0);
                    return;
                }
            };

            //field mapping
            this.sellStockUpdateLabelText = (event) => {
                var train = document.getElementById("sellStocksTrain");
                let selectedStep = train.getStep(event.detail.value);
                if (selectedStep != null) {
                    this.sellStockSelectedStepLabel(selectedStep.label);
                }
                if (selectedStep != null && selectedStep.id == "sellStockDetails") {
                    this.sellStockSelectedStepFormLabel("Please provide the details of the stocks to be sold");
                    this.isSellStockFormReadonly(false);
                } else if (selectedStep != null && selectedStep.id == "sellStockConfirmation") {
                    this.sellStockSelectedStepFormLabel("Please review the stock sell details");
                    this.isSellStockFormReadonly(true);
                } else if (selectedStep != null && selectedStep.id == "sellStockSummary") {
                    this.sellStockSelectedStepFormLabel("Stock sell summary");
                    this.isSellStockFormReadonly(true);
                } else {
                    this.sellStockSelectedStepFormLabel("");
                    this.isSellStockFormReadonly(false);
                }
            };

            this.sellStockConfirmButtonDisplay = ko.observable("inline-flex");
            this.showSellStockProgressAnimation = ko.observable(false);

            this.confirmSellStock = async (event) => {
                var train = document.getElementById("sellStocksTrain");
                let sellStockConfirmStep = train.getStep("sellStockConfirmation");
                let sellStockSummaryStep = train.getStep("sellStockSummary");

                if (sellStockConfirmStep != null) {
                    sellStockConfirmStep.messageType = "confirmation";
                    train.updateStep(sellStockConfirmStep.id, sellStockConfirmStep);

                    sellStockRequest = {
                        "userAccountId": this.accountId(),
                        "stockSymbol": this.sellStockSymbol(),
                        "stockUnits": this.sellStockUnits(),
                        "remarks": this.sellStocksRemarks()
                    };

                    this.sellStockConfirmButtonDisplay("none");
                    this.showSellStockProgressAnimation(true);

                    await callSellStocks(sellStockRequest)
                        .then((response) => {
                            this.sellStockResponse(response);
                            this.sellStockConfirmButtonDisplay("inline-flex");
                            this.showSellStockProgressAnimation(false);

                            if (response.httpStatusCode == 200) {
                                sellStockSummaryStep.messageType = "confirmation";
                            } else {
                                sellStockSummaryStep.messageType = "warning";
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Transfer failed");
                            this.showSellStockProgressAnimation(false);
                        });

                    this.sellStockTransactionId(this.sellStockResponse().transactionId);
                    this.sellStockResultMessage(this.sellStockResponse().message);

                    train.updateStep(sellStockSummaryStep.id, sellStockSummaryStep);
                    this.sellStockSelectedStepValue("sellStockSummary");
                    this.isSellStockDetailsConfirmed(true);
                    this.sellCloseCancelButton("Close");
                }
            };

//------------------------------------------------------------------------------------------------------------------------------------------------
            /*
             * Transaction statement
             */
            this.stockTransactionHistoryArray = ko.observableArray([]);

            this.stockStatementTableDataprovider = new ArrayDataProvider(this.stockTransactionHistoryArray, {
                keyAttributes: "transactionTime",
                implicitSort: [{attribute: "transactionTime", direction: "descending"}],
            });

            /**
             * Templates/Converters
             */
            this.dateTimeConverter = new ojconverter_datetime_1.IntlDateTimeConverter({
                formatType: 'datetime',
                dateFormat: 'medium',
                timeFormat: 'medium'
            });

            this.stockPriceConverter = new ojconverter_number_1.IntlNumberConverter({
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'symbol'
            });

            this.currencyConverter = new ojconverter_number_1.IntlNumberConverter({
                style: "currency",
                currency: "USD",
            });
        }

        return TradingViewModel;
    }
);
