let bankNavigationList = [
    {
        name: "Summary",
        id: "summary",
        icons: "icon-stats-bars"
    },
    {
        name: "Fund Transfer",
        id: "fundtransfer",
        icons: "icon-tab",
    },
    {
        name: "Loans",
        id: "loan",
        icons: "icon-newspaper"
    },
    {
        name: "Bill Pay",
        id: "billpay",
        icons: "icon-uniE906"
    },
    {
        name: "Statement",
        id: "statement",
        icons: "oj-ux-ico-library"
    }
];

define(["require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider", "ojs/ojasyncvalidator-regexp", "ojs/ojconverter-datetime", "ojs/ojconverter-number", "appController",
        "ojs/ojvalidationgroup", "ojs/ojnavigationlist", "ojs/ojswitcher", "ojs/ojswitch",
        "ojs/ojlabel", "ojs/ojformlayout", "ojs/ojchart", "ojs/ojtable", "ojs/ojbutton", "ojs/ojtrain",
        "ojs/ojinputtext", "ojs/ojdialog", "ojs/ojselectsingle", "ojs/ojprogress-bar"],
    function (require, exports, ko, Bootstrap, ArrayDataProvider, AsyncRegExpValidator, ojconverter_datetime_1, ojconverter_number_1, appController) {
        function BankViewModel() {
            var self = this;

            this.accountId = ko.observable(appController.accountId());

            this.bankNavigationDataProvider = new ArrayDataProvider(bankNavigationList, {
                keyAttributes: "id",
            });

            this.selectedItem1 = ko.observable("summary");
            this.selectedItem2 = ko.observable("summary");
            this.selectedItem3 = ko.observable("summary");
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

            this.onBankingNavigationValueChangeEvent = (event) => {
                if (event.detail.value == 'summary') {
                    callGetBalance(this.accountId())
                        .then((response) => {
                            this.savingsAccountNumber(response.accountId);
                            this.savingsAccountBalance(response.accountBalance);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting User details from CoreBank Service");
                        });
                } else if (event.detail.value == 'statement') {
                    callGetBankTransactionHistory(this.accountId())
                        .then((response) => {
                            this.bankTransactionHistoryArray(response.transactionHistories);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting transaction history from CoreBank Service");
                        });
                }
            };

            this.onSwitcherValueChangeEvent = (event) => {
                // perform actions on onSwitcherValueChangeEvent
            };


            /*
             * Summary
             */
            this.savingsAccountNumber = ko.observable();
            this.savingsAccountBalance = ko.observable();
            this.savingsAccountUserName = ko.observable(appController.username());

            callGetBalance(this.accountId())
                .then((response) => {
                    this.savingsAccountNumber(response.accountId);
                    this.savingsAccountBalance(response.accountBalance);
                })
                .catch((error) => {
                    console.error(error);
                    console.error("Error getting User details from CoreBank Service");
                });

            /*
             * Fund Transfer
             */

            this.selectedStepValue = ko.observable("transferDetails");
            this.selectedStepLabel = ko.observable("Transfer Details");
            this.selectedStepFormLabel = ko.observable("Please fill in Transfer Details");
            this.recipientsAccountsArray = ko.observableArray([]);

            //Account Details
            this.recipientAccountNumber = ko.observable();
            this.transferAmount = ko.observable();
            this.transferRemarks = ko.observable();
            this.recipientAccountDisplay = ko.observable();

            this.transferTransactionId = ko.observable();
            this.transferResultMessage = ko.observable();

            this.isFormReadonly = ko.observable(false);
            this.isTransferDetailsConfirmed = ko.observable(false);


            this.stepArray = ko.observableArray([
                {label: "Details", id: "transferDetails", visited: false},
                {label: "Confirmation", id: "transferConfirmation", visited: false},
                {label: "Summary", id: "transferSummary", visited: false},
            ]);

            //Benificary details
            this.recipientAccountNumberListDP = new ArrayDataProvider(this.recipientsAccountsArray, {
                keyAttributes: "accountNumber",
            });

            this.onValueChangeActionForRecipientAccount = (event) => {
                this.recipientAccountNumber(event.detail.itemContext.data.accountNumber);
                this.recipientAccountDisplay(event.detail.itemContext.data.label);
            }

            //Field validation
            //It is being called by the train to make sure the form is valid before moving on to the next step.
            this.accountNumberRegExpValidator = new AsyncRegExpValidator({
                pattern: "^[0-9]{5}$",
                hint: "Transfer fund to Account Number",
                messageDetail: "Account Number must contain numbers only and must be 5 digits",
            });

            this.amountRegExpValidator = new AsyncRegExpValidator({
                pattern: "(^[1-9]\\d*\\.\\d+$|^[1-9]\\d*$)",
                hint: "Amount to be transferred to the account",
                messageDetail: "Transfer amount must be positive number and minimum 1 dollar",
            });

            this.validate = (event) => {
                let nextStep = event.detail.toStep;
                let previousStep = event.detail.fromStep;
                let current = event.detail.getStep;
                var tracker = document.getElementById("tracker");
                if (tracker == null) {
                    return;
                }
                var train = document.getElementById("train");
                if (tracker.valid === "valid") {
                    if (nextStep.id === "transferSummary") {
                        if (!this.isTransferDetailsConfirmed()) {
                            event.preventDefault();
                            previousStep.messageType = "error";
                            train.updateStep(previousStep.id, previousStep);
                        } else {
                            previousStep.messageType = "confirmation";
                            train.updateStep(previousStep.id, previousStep);
                        }
                        return;
                    } else if (previousStep.id === "transferDetails") {
                        //The previous step will have a confirmation message type icon
                        previousStep.messageType = "confirmation";
                        train.updateStep(previousStep.id, previousStep);
                        //Now the clicked step could be selected
                        this.selectedStepValue(nextStep.id);
                        return;
                    } else if (previousStep.id === "transferSummary") {
                        //validation is not required for last step(transferSummary)
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
            this.updateLabelText = (event) => {
                var train = document.getElementById("train");
                let selectedStep = train.getStep(event.detail.value);
                if (selectedStep != null) {
                    this.selectedStepLabel(selectedStep.label);
                }
                if (selectedStep != null && selectedStep.id == "transferDetails") {
                    this.selectedStepFormLabel("Please fill in Transfer Details");
                    this.isFormReadonly(false);
                } else if (selectedStep != null && selectedStep.id == "transferConfirmation") {
                    this.selectedStepFormLabel("Please review the Transfer Details");
                    this.isFormReadonly(true);
                } else if (selectedStep != null && selectedStep.id == "transferSummary") {
                    this.selectedStepFormLabel("Transfer Summary");
                    this.isFormReadonly(true);
                } else {
                    this.selectedStepFormLabel("");
                    this.isFormReadonly(false);
                }
            };

            this.transferResponse = ko.observable();
            this.transferConfirmButtonDisplay = ko.observable("inline-flex");
            this.showTransferProgressAnimation = ko.observable(false);

            this.confirmTransfer = async (event) => {
                var train = document.getElementById("train");
                let confirmTransferStep = train.getStep("transferConfirmation");
                let transferSummaryStep = train.getStep("transferSummary");

                if (confirmTransferStep != null) {
                    confirmTransferStep.messageType = "confirmation";
                    train.updateStep(confirmTransferStep.id, confirmTransferStep);

                    transferRequest = {
                        "fromAccountId": this.accountId(),
                        "toAccountId": this.recipientAccountNumber(),
                        "amount": this.transferAmount(),
                        "remarks": this.transferRemarks()
                    };
                    this.transferConfirmButtonDisplay("none");
                    this.showTransferProgressAnimation(true);
                    await callFundTransfer(transferRequest)
                        .then((response) => {
                            this.transferResponse(response);
                            this.transferConfirmButtonDisplay("inline-flex");
                            this.showTransferProgressAnimation(false);
                            if (response.httpStatusCode == 200) {
                                transferSummaryStep.messageType = "confirmation";
                            } else {
                                transferSummaryStep.messageType = "warning";
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Transfer failed");
                            this.showTransferProgressAnimation(false);
                        });
                    this.transferTransactionId(this.transferResponse().transactionId);
                    this.transferResultMessage(this.transferResponse().message);

                    train.updateStep(transferSummaryStep.id, transferSummaryStep);
                    this.selectedStepValue("transferSummary");
                    this.isTransferDetailsConfirmed(true);
                    this.closeTransferCancelButton("Close");
                }
            };

            //Transfer Dialog
            this.closeTransferCancelButton = ko.observable("Cancel");

            this.fundTransfer = (event) => {
                document.getElementById("transferModalDialog").open();

                this.closeTransferCancelButton("Cancel");
                this.recipientAccountNumber(null);
                this.transferAmount(null);
                this.transferRemarks(null);
                this.recipientAccountDisplay(null);

                this.transferResponse(null);
                this.transferTransactionId(null);
                this.transferResultMessage(null);

                this.isTransferDetailsConfirmed(false);
                this.selectedStepValue("transferDetails");

                this.transferConfirmButtonDisplay("inline-flex");
                this.showTransferProgressAnimation(false);

                for (var i = 0; i < this.stepArray().length; i++) {
                    let step = train.getStep(this.stepArray()[i].id);
                    step.visited = false;
                    step.messageType = null;
                    train.updateStep(step.id, step);
                }

                callGetRecipientAccountsForListing(self.accountId())
                    .then((response) => {
                        this.recipientsAccountsArray(response);
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Error getting user details from CoreBank Service");
                    });
            }

            this.cancelTransfer = (event) => {
                document.getElementById("transferModalDialog").close();

                this.closeTransferCancelButton("Cancel");
                this.recipientAccountNumber(null);
                this.transferAmount(null);
                this.transferRemarks(null);
                this.recipientAccountDisplay(null);

                this.transferResponse(null);
                this.transferTransactionId(null);
                this.transferResultMessage(null);

                this.isTransferDetailsConfirmed(false);
                this.selectedStepValue("transferDetails");
                this.transferConfirmButtonDisplay("inline-flex");
                this.showTransferProgressAnimation(false);

                for (var i = 0; i < this.stepArray().length; i++) {
                    let step = train.getStep(this.stepArray()[i].id);
                    step.visited = false;
                    step.messageType = null;
                    train.updateStep(step.id, step);
                }
            };


            /*
             * Withdraw Navigation
             * Not Implemented yet
             */


            /*
             * Deposit Navigation
             * Not Implemented yet
             */

            /**
             * Bill Pay Navigation
             * Not Implemented yet
             */

            /*
             * Transaction statement
             */
            this.bankTransactionHistoryArray = ko.observableArray([]);

            this.bankStatementTableDataprovider = new ArrayDataProvider(this.bankTransactionHistoryArray, {
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

            this.amountUnitConverter = new ojconverter_number_1.IntlNumberConverter({
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'symbol'
            });

        }

        return BankViewModel;
    }
);
