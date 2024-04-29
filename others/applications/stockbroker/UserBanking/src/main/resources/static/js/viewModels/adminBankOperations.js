let bankNavigationList = [
    {
        name: "User Accounts",
        id: "useraccounts",
        icons: "icon-uniE902",
    },
    {
        name: "Open User Account",
        id: "openaccount",
        icons: "icon-user-plus"
    },
    {
        name: "Close User Account",
        id: "closeaccount",
        icons: "icon-user-minus"
    },
    {
        name: "Branch Details",
        id: "branchdetails",
        icons: "icon-office"
    },
    {
        name: "Transactions",
        id: "transactions",
        icons: "oj-ux-ico-library"
    }
];

define(["require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider", "ojs/ojasyncvalidator-regexp", "ojs/ojconverter-datetime", "ojs/ojconverter-number",
        "ojs/ojvalidationgroup", "ojs/ojknockout", "ojs/ojnavigationlist", "ojs/ojswitcher", "ojs/ojswitch",
        "ojs/ojlabel", "ojs/ojformlayout", "ojs/ojchart", "ojs/ojtable", "ojs/ojbutton", "ojs/ojtrain",
        "ojs/ojinputtext", "ojs/ojdialog", "ojs/ojselectsingle", "ojs/ojprogress-bar"],
    function (require, exports, ko, Bootstrap, ArrayDataProvider, AsyncRegExpValidator, ojconverter_datetime_1, ojconverter_number_1) {
        function AdminBankViewModel() {
            var self = this;

            this.bankNavigationDataProvider = new ArrayDataProvider(bankNavigationList, {
                keyAttributes: "id",
            });

            this.selectedItem1 = ko.observable("useraccounts");
            this.selectedItem2 = ko.observable("useraccounts");
            this.selectedItem3 = ko.observable("useraccounts");
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

            this.onBankAdminNavigationValueChangeEvent = (event) => {
                if (event.detail.value == 'useraccounts') {
                    callGetUserAccounts()
                        .then((response) => {
                            this.bankUserAccountsDataArray(response.accounts);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting User accounts from CoreBank Service");
                        });
                } else if (event.detail.value == 'branchdetails') {
                    callGetBranchDetails()
                        .then((response) => {
                            this.branchDetailsTableDataArray(response.branches);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting Branch Details from CoreBank Service");
                        });
                } else if (event.detail.value == 'transactions') {
                    callAdminGetBankTransactionHistory()
                        .then((response) => {
                            this.bankTransactionHistoryArray(response.transactionHistories);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Error getting transaction history from CoreBank Service");
                        });
                }
            };

            //User Details
            this.bankUserAccountsDataArray = ko.observableArray([]);
            callGetUserAccounts()
                .then((response) => {
                    this.bankUserAccountsDataArray(response.accounts);
                })
                .catch((error) => {
                    console.error(error);
                    console.error("Error getting User accounts from CoreBank Service");
                });
            this.bankUserAccountsDataprovider = new ArrayDataProvider(this.bankUserAccountsDataArray, {
                keyAttributes: "accountNumber",
                implicitSort: [{attribute: "accountNumber", direction: "ascending"}],
            });


            //Open User Account
            this.openBankAccountSelectedStepValue = ko.observable("openBankAccountDetails");
            this.openBankAccountSelectedStepLabel = ko.observable("New Bank Aaccount Details");
            this.openBankAccountSelectedStepFormLabel = ko.observable("Please fill in Account Details");
            this.branchesListArray = ko.observableArray([]);

            //Create Account Request
            this.openBankAccountFirstName = ko.observable();
            this.openBankAccountMiddleName = ko.observable();
            this.openBankAccountLastName = ko.observable();
            this.openBankAccountFullName = ko.observable();
            this.openBankAccountSSN = ko.observable();
            this.openBankAccountPhoneNumber = ko.observable();
            this.openBankAccountAddress = ko.observable();
            this.openBankAccountBranchId = ko.observable();
            this.openBankAccountBranchDisplay = ko.observable();

            //Create Account Response
            this.openBankAccountRespose = ko.observable();
            this.openBankAccountMessage = ko.observable();
            this.openBankAccountTransactionId = ko.observable();

            this.isOpenBankAccountFormReadonly = ko.observable(false);

            this.isOpenBankAccountDetailsConfirmed = ko.observable(false);

            this.openBankAccountCloseCancelButton = ko.observable("Cancel");

            this.openBankAccountStepArray = ko.observableArray([
                {label: "Details", id: "openBankAccountDetails", visited: false},
                {label: "Confirmation", id: "openBankAccountConfirmation", visited: false},
                {label: "Summary", id: "openBankAccountSummary", visited: false},
            ]);

            //Open Bank account Dialog
            this.openBankAccountWiz = (event) => {
                document.getElementById("openBankAccountModalDialog").open();

                this.openBankAccountCloseCancelButton("Cancel");
                this.openBankAccountFirstName(null);
                this.openBankAccountMiddleName('');
                this.openBankAccountLastName(null);
                this.openBankAccountFullName(null);
                this.openBankAccountSSN(null);
                this.openBankAccountPhoneNumber(null);
                this.openBankAccountAddress(null);
                this.openBankAccountBranchId(null);
                this.openBankAccountBranchDisplay(null);
                this.openBankAccountRespose(null);
                this.openBankAccountMessage(null);
                this.openBankAccountTransactionId(null);

                this.isOpenBankAccountDetailsConfirmed(false);
                this.openBankAccountSelectedStepValue("openBankAccountDetails");

                this.openAccountConfirmButtonDisplay("inline-flex");
                this.openAccountProgressAnimation(false);

                var train = document.getElementById("openBankAccountTrain");
                for (var i = 0; i < this.openBankAccountStepArray().length; i++) {
                    let step = train.getStep(this.openBankAccountStepArray()[i].id);
                    step.visited = false;
                    step.messageType = null;
                    train.updateStep(step.id, step);
                }


                callGetBranches()
                    .then((response) => {
                        this.branchesListArray(response);
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Error getting branch details from CoreBank Service");
                    });
            }

            this.openBankAccountCancelWiz = (event) => {
                document.getElementById("openBankAccountModalDialog").close();

                this.openBankAccountCloseCancelButton("Cancel");
                this.openBankAccountFirstName(null);
                this.openBankAccountMiddleName('');
                this.openBankAccountLastName(null);
                this.openBankAccountFullName(null);
                this.openBankAccountSSN(null);
                this.openBankAccountPhoneNumber(null);
                this.openBankAccountAddress(null);
                this.openBankAccountBranchId(null);
                this.openBankAccountBranchDisplay(null);
                this.openBankAccountRespose(null);
                this.openBankAccountMessage(null);
                this.openBankAccountTransactionId(null);

                this.isOpenBankAccountDetailsConfirmed(false);
                this.openBankAccountSelectedStepValue("openBankAccountDetails");

                this.openAccountConfirmButtonDisplay("inline-flex");
                this.openAccountProgressAnimation(false);

                var train = document.getElementById("openBankAccountTrain");
                for (var i = 0; i < this.openBankAccountStepArray().length; i++) {
                    let step = train.getStep(this.openBankAccountStepArray()[i].id);
                    step.visited = false;
                    step.messageType = null;
                    train.updateStep(step.id, step);
                }
            };

            //Branches
            this.branchesListDP = new ArrayDataProvider(this.branchesListArray, {
                keyAttributes: "branchId",
            });

            this.onValueChangeActionForBranchSelection = (event) => {
                this.openBankAccountBranchId(event.detail.itemContext.data.branchId);
                this.openBankAccountBranchDisplay(event.detail.itemContext.data.label);
            }

            // Regex validation
            this.phoneNumberRegExpValidator = new AsyncRegExpValidator({
                pattern: "^[0-9]{10}$",
                hint: "Contact number",
                messageDetail: "Account Number must contain numbers only and must be precisely 10 digits",
            });

            this.ssnRegExpValidator = new AsyncRegExpValidator({
                pattern: "^\\d{3}-\\d{2}-\\d{4}$",
                hint: "SSN number",
                messageDetail: "SSN number must be in the format of XXX-XX-XXXX",
            });

            //Field validation
            //It is being called by the train to make sure the form is valid before moving on to the next step.

            this.openBankAccountValidate = (event) => {
                let nextStep = event.detail.toStep;
                let previousStep = event.detail.fromStep;
                let current = event.detail.getStep;
                var tracker = document.getElementById("openBankAccountTracker");
                if (tracker == null) {
                    return;
                }
                var train = document.getElementById("openBankAccountTrain");
                if (tracker.valid === "valid") {
                    if (nextStep.id === "openBankAccountSummary") {
                        if (!this.isOpenBankAccountDetailsConfirmed()) {
                            event.preventDefault();
                            previousStep.messageType = "error";
                            train.updateStep(previousStep.id, previousStep);
                        } else {
                            previousStep.messageType = "confirmation";
                            train.updateStep(previousStep.id, previousStep);
                        }
                        return;
                    } else if (previousStep.id === "openBankAccountDetails") {
                        //The previous step will have a confirmation message type icon
                        previousStep.messageType = "confirmation";
                        train.updateStep(previousStep.id, previousStep);
                        //Now the clicked step could be selected
                        this.openBankAccountSelectedStepValue(nextStep.id);
                        return;
                    } else if (previousStep.id === "openBankAccountSummary") {
                        //validation is not required for last step(openBankAccountSummary)
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
            this.openBankAccountUpdateLabelText = (event) => {
                var train = document.getElementById("openBankAccountTrain");
                let selectedStep = train.getStep(event.detail.value);
                if (selectedStep != null) {
                    this.openBankAccountSelectedStepLabel(selectedStep.label);
                }
                if (selectedStep != null && selectedStep.id == "openBankAccountDetails") {
                    this.openBankAccountSelectedStepFormLabel("Please provide the user Details");
                    this.isOpenBankAccountFormReadonly(false);
                } else if (selectedStep != null && selectedStep.id == "openBankAccountConfirmation") {
                    this.openBankAccountSelectedStepFormLabel("Please review the user Details");
                    this.openBankAccountFullName(this.openBankAccountFirstName() + ' ' + this.openBankAccountMiddleName() + ' ' + this.openBankAccountLastName());
                    this.isOpenBankAccountFormReadonly(true);
                } else if (selectedStep != null && selectedStep.id == "openBankAccountSummary") {
                    this.openBankAccountSelectedStepFormLabel("User Account Summary");
                    this.isOpenBankAccountFormReadonly(true);
                } else {
                    this.openBankAccountSelectedStepFormLabel("");
                    this.isOpenBankAccountFormReadonly(false);
                }
            };

            this.openAccountConfirmButtonDisplay = ko.observable("inline-flex");
            this.openAccountProgressAnimation = ko.observable(false);

            this.confirmOpenBankAccount = async (event) => {
                var train = document.getElementById("openBankAccountTrain");
                let openBankAccountConfirmStep = train.getStep("openBankAccountConfirmation");

                if (openBankAccountConfirmStep != null) {
                    openBankAccountConfirmStep.messageType = "confirmation";
                    train.updateStep(openBankAccountConfirmStep.id, openBankAccountConfirmStep);

                    openBankAccountRequest = {
                        "branchId": this.openBankAccountBranchId(),
                        "ssn": this.openBankAccountSSN(),
                        "firstName": this.openBankAccountFirstName(),
                        "middleName": this.openBankAccountMiddleName(),
                        "lastName": this.openBankAccountLastName(),
                        "phoneNumber": this.openBankAccountPhoneNumber(),
                        "address": this.openBankAccountAddress()
                    };

                    this.openAccountConfirmButtonDisplay("none");
                    this.openAccountProgressAnimation(true);

                    await callOpenAccount(openBankAccountRequest)
                        .then((response) => {
                            this.openBankAccountRespose(response);
                            this.openAccountConfirmButtonDisplay("inline-flex");
                            this.openAccountProgressAnimation(false);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Calling Open bank account failed");
                            this.openAccountProgressAnimation(false);
                        });
                    this.openBankAccountMessage(this.openBankAccountRespose().message);
                    this.openBankAccountTransactionId(this.openBankAccountRespose().transactionId);

                    let openBankAccountSummaryStep = train.getStep("openBankAccountSummary");
                    openBankAccountSummaryStep.messageType = "confirmation";
                    train.updateStep(openBankAccountSummaryStep.id, openBankAccountSummaryStep);
                    this.openBankAccountSelectedStepValue("openBankAccountSummary");
                    this.isOpenBankAccountDetailsConfirmed(true);
                    this.openBankAccountCloseCancelButton("Close");
                }
            };

            /**
             * Close Bank Account
             */
            this.closeBankAccountAccountId = ko.observable();
            this.closeBankAccountResponseMessage = ko.observable();
            this.closeBankAccountResponseTransactionId = ko.observable();
            this.closeBankAccountResponse = ko.observable();

            this.closeBankAccountCloseCancelButton = ko.observable("Cancel");

            this.closeBankAccountModalOpen = (event) => {
                this.closeBankAccountCloseCancelButton("Cancel");
                this.closeBankAccountAccountId(null);
                this.closeBankAccountResponseMessage(null);
                this.closeBankAccountResponse(null);
                this.closeBankAccountResponseTransactionId(null);
                document.getElementById("closeAccountModalDialog").open();

                this.showCloseAccountProgressAnimation(false);
                this.closeAccountButtonDisplay("inline-flex");
            };

            this.cancelCancelBankAccount = (event) => {
                this.closeBankAccountCloseCancelButton("Cancel");
                this.closeBankAccountAccountId(null);
                this.closeBankAccountResponseMessage(null);
                this.closeBankAccountResponse(null);
                this.closeBankAccountResponseTransactionId(null);

                this.showCloseAccountProgressAnimation(false);
                this.closeAccountButtonDisplay("inline-flex");

                document.getElementById("closeAccountModalDialog").close();
            };

            this.closeAccountButtonDisplay = ko.observable("inline-flex");
            this.showCloseAccountProgressAnimation = ko.observable(false);

            this.closeBankAccountAction = async (event) => {

                var tracker = document.getElementById("closeAccountTracker");
                if (tracker == null) {
                    return;
                }

                if (tracker.valid === "valid") {
                    this.closeAccountButtonDisplay("none");
                    this.showCloseAccountProgressAnimation(true);

                    await callCloseAccount(this.closeBankAccountAccountId())
                        .then((response) => {
                            this.closeBankAccountResponse(response);
                            this.closeAccountButtonDisplay("none");
                            this.showCloseAccountProgressAnimation(false);
                        })
                        .catch((error) => {
                            console.error(error);
                            console.error("Calling close bank account failed");
                            this.closeBankAccountResponseMessage(this.closeBankAccountResponse().message);
                            this.closeBankAccountResponseTransactionId(this.closeBankAccountResponse().transactionId);
                            this.showCloseAccountProgressAnimation(false);
                        });
                    this.closeBankAccountResponseMessage(this.closeBankAccountResponse().message);
                    this.closeBankAccountResponseTransactionId("Reference Transaction Id : " + this.closeBankAccountResponse().transactionId);
                    this.closeBankAccountCloseCancelButton("Close");
                } else {
                    event.preventDefault();
                    setTimeout(function () {
                        tracker.showMessages();
                        tracker.focusOn("@firstInvalidShown");
                    }, 0);
                    return;
                }
            };

            //Branch Details
            this.branchDetailsTableDataArray = ko.observableArray([]);
            this.branchDetailsTableDataprovider = new ArrayDataProvider(this.branchDetailsTableDataArray, {
                keyAttributes: "branchId",
                implicitSort: [{attribute: "branchId", direction: "ascending"}],
            });

            //Transaction Summary
            this.bankTransactionHistoryArray = ko.observableArray([]);
            this.bankTransactionsTableDataprovider = new ArrayDataProvider(this.bankTransactionHistoryArray, {
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

            this.maskSSN = (ssnNumbers) => {
                return ssnNumbers.replace(/\d{3}-\d{2}-(?=\d{4})/g, "XXX-XX-");
            };

            this.amountUnitConverter = new ojconverter_number_1.IntlNumberConverter({
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'symbol'
            });

        }

        return AdminBankViewModel;
    }
);
