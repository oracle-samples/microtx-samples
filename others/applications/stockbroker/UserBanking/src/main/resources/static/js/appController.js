// Working one

/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(["accUtils", 'knockout', 'ojs/ojcontext', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider',
        'ojs/ojdrawerpopup', 'ojs/ojmodule-element', 'ojs/ojknockout', "ojs/ojbutton", "ojs/ojdialog", "oj-c/text-area", "ojs/ojlabel", "ojs/ojinputtext"],
    function (accUtil, ko, Context, moduleUtils, KnockoutTemplateUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider) {

        function ControllerViewModel() {

            this.KnockoutTemplateUtils = KnockoutTemplateUtils;

            // Handle announcements sent when pages change, for Accessibility.
            this.manner = ko.observable('polite');
            this.message = ko.observable();
            announcementHandler = (event) => {
                this.message(event.detail.message);
                this.manner(event.detail.manner);
            };

            document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

            // Media queries for repsonsive layouts
            const smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
            this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
            const mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
            this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

            let userNavData = [
                {path: '', redirect: 'userdashboard'},
                {path: 'userdashboard', detail: {label: 'Account', iconClass: 'oj-ux-ico-bar-chart'}},
                {path: 'userbank', detail: {label: 'Bank', iconClass: 'icon-library'}},
                {path: 'usertrading', detail: {label: 'Trading', iconClass: 'icon-stats-dots'}}
            ];

            let adminNavData = [
                {path: '', redirect: 'adminDashboard'},
                {path: 'adminDashboard', detail: {label: 'Dashboard', iconClass: 'oj-ux-ico-bar-chart'}},
                {path: 'adminBankOperations', detail: {label: 'Bank', iconClass: 'icon-library'}}
            ];

            let anonymousNavData = [
                {path: '', redirect: 'unAuthorized'},
                {path: 'unAuthorized', detail: {label: 'Un-Authorized User', iconClass: 'oj-ux-ico-bar-chart'}}
            ];

            //This is needed to initilize the CoreRouter when application initilizes
            let navData = [
                {path: '', redirect: 'loading'},
                { path: new RegExp('.*'), detail: {label: 'Loading', iconClass: 'icon-hour-glass'} },
                // {path: 'loading', detail: {label: 'Loading', iconClass: 'icon-hour-glass'}},
            ];

            this.userprofile = ko.observable();
            this.accountId = ko.observable();
            this.username = ko.observable();
            this.userrole = ko.observable();

            // Router setup
            let router = new CoreRouter(navData, {
                urlAdapter: new UrlParamAdapter()
            });
            router.sync();


            this.moduleAdapter = new ModuleRouterAdapter(router);

            this.selection = new KnockoutRouterAdapter(router);

            let loadingPath = [{path: 'loading', detail: {label: 'Loading', iconClass: 'oj-ux-ico-bar-chart'}}]
            this.navDataArray = ko.observableArray(loadingPath);

            // Setup the navDataProvider with the routes, excluding the first redirected
            // route.
            this.navDataProvider = new ArrayDataProvider(this.navDataArray, {keyAttributes: "path"});

            accUtil.getUserProfile()
                .then(async (response) => {
                    this.userprofile(response);
                    this.accountId(response.accountId);
                    this.username(response.username);
                    this.userrole(response.role);
                    this.userLogin(response.username);

                    if (this.userrole() === 'BANK_ADMIN_ROLE') {
                        navData = adminNavData;
                    } else if (this.userrole() === 'BANK_CUSTOMER_ROLE') {
                        navData = userNavData;
                    } else {
                        navData = anonymousNavData;
                    }
                    this.navDataArray.removeAll();
                    for (let navDataEntry of navData.slice(1)) {
                        this.navDataArray.push(navDataEntry);
                    }
                    await router.reconfigure(navData, navData.slice(1));
                })
                .catch((error) => {
                    console.error(error);
                    console.error("Error getting User details from Bankapp Backend Service. Also possibly CoreRouter config failed.");
                });

            // Drawer
            self.sideDrawerOn = ko.observable(false);

            // Close drawer on medium and larger screens
            this.mdScreen.subscribe(() => {
                self.sideDrawerOn(false)
            });

            // Called by navigation drawer toggle button and after selection of nav drawer item
            this.toggleDrawer = () => {
                self.sideDrawerOn(!self.sideDrawerOn());
            }

            // Header
            // Application Name used in Branding Area
            this.appName = ko.observable("Bank and Trading Application");
            // User Info used in Global Navigation area
            this.userLogin = ko.observable();

            // Footer
            this.footerLinks = [
                {
                    name: 'About MicroTx',
                    linkId: 'aboutMicroTx',
                    linkTarget: 'https://www.oracle.com/in/database/transaction-manager-for-microservices/'
                },
                {
                    name: "Contact Us",
                    id: "contactUs",
                    linkTarget: "http://www.oracle.com/us/corporate/contact/index.html"
                },
                {name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html"},
                {name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html"},
                {
                    name: "Your Privacy Rights",
                    id: "yourPrivacyRights",
                    linkTarget: "http://www.oracle.com/us/legal/privacy/index.html"
                },
            ];

            this.userProfileMenuActionListener = (event) => {
                if (event.detail.selectedValue === "help") {
                    console.log("help");
                    window.open('https://www.oracle.com/in/database/transaction-manager-for-microservices/', '_blank');
                } else if (event.detail.selectedValue === "about") {
                    document.getElementById("aboutModalDialog").open();
                } else if (event.detail.selectedValue === "out") {
                    console.log("out");
                    window.open("/bankapp/logout", "_self");
                }
            }

            this.openAboutSection = (event) =>{
                document.getElementById("aboutModalDialog").open();
            };

            this.closeAboutDialog = (event) => {
                document.getElementById("aboutModalDialog").close();
            };

        }

        // release the application bootstrap busy state
        Context.getPageContext().getBusyContext().applicationBootstrapComplete();

        return new ControllerViewModel();
    }
);