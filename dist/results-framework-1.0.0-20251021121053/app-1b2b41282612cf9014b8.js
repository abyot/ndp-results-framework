/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(2);
	
	__webpack_require__(3);
	
	__webpack_require__(4);
	
	__webpack_require__(5);
	
	__webpack_require__(6);
	
	__webpack_require__(7);
	
	__webpack_require__(8);
	
	__webpack_require__(9);
	
	__webpack_require__(10);
	
	__webpack_require__(11);
	
	__webpack_require__(12);
	
	__webpack_require__(13);
	
	__webpack_require__(14);
	
	__webpack_require__(15);
	
	__webpack_require__(16);
	
	__webpack_require__(17);
	
	__webpack_require__(18);
	
	__webpack_require__(19);
	
	__webpack_require__(20);
	
	__webpack_require__(21);
	
	__webpack_require__(22);
	
	__webpack_require__(23);
	
	__webpack_require__(24);
	
	__webpack_require__(25);
	
	__webpack_require__(26);
	
	__webpack_require__(27);
	
	__webpack_require__(28);
	
	__webpack_require__(29);
	
	__webpack_require__(30);
	
	__webpack_require__(31);
	
	__webpack_require__(32);
	
	__webpack_require__(33);
	
	__webpack_require__(34);
	
	__webpack_require__(35);
	
	__webpack_require__(36);
	
	var scriptElement = document.createElement("script");
	
	// App files
	
	
	// common files
	
	scriptElement.type = "text/javascript";
	scriptElement.src = ({"baseUrl":"http://localhost:9292","authorization":"Basic YWRtaW46ZGlzdHJpY3Q=","apiRoot":"../../..","mode":"PROD"}).apiRoot + "/api/files/script";
	document.body.appendChild(scriptElement);
	
	var cssElement = document.createElement("css");
	cssElement.type = "text/css";
	cssElement.src = ({"baseUrl":"http://localhost:9292","authorization":"Basic YWRtaW46ZGlzdHJpY3Q=","apiRoot":"../../..","mode":"PROD"}).apiRoot + "/api/files/style";
	document.body.appendChild(cssElement);
	
	jQuery(function () {
	    Dhis2HeaderBar.initHeaderBar(document.querySelector('#header'), ({"baseUrl":"http://localhost:9292","authorization":"Basic YWRtaW46ZGlzdHJpY3Q=","apiRoot":"../../..","mode":"PROD"}).apiRoot + '/api', { noLoadingIndicator: true });
	});
	
	/* App Module */
	angular.module('ndpFramework').value('DHIS2URL', ({"baseUrl":"http://localhost:9292","authorization":"Basic YWRtaW46ZGlzdHJpY3Q=","apiRoot":"../../..","mode":"PROD"}).apiRoot).config(["$httpProvider", "$routeProvider", "$translateProvider", function ($httpProvider, $routeProvider, $translateProvider) {
	
	    $httpProvider.defaults.useXDomain = true;
	    delete $httpProvider.defaults.headers.common['X-Requested-With'];
	
	    $routeProvider.when('/home', {
	        templateUrl: 'components/home/home.html',
	        controller: 'HomeController'
	    }).when('/sdg', {
	        templateUrl: 'components/sdg/sdg-status.html',
	        controller: 'SDGController'
	    }).otherwise({
	        redirectTo: '/home'
	    });
	
	    $translateProvider.preferredLanguage('en');
	    $translateProvider.useSanitizeValueStrategy('escaped');
	    $translateProvider.useLoader('i18nLoader');
	}]).run(["$rootScope", function ($rootScope) {
	    $rootScope.maxOptionSize = 1000;
	}]);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	/* global dhis2, angular, selection, i18n_ajax_login_failed, _, Promise, await */
	
	dhis2.util.namespace('dhis2.ndp');
	
	// whether current user has any organisation units
	dhis2.ndp.emptyOrganisationUnits = false;
	
	var DHIS2URL = '..';
	
	var i18n_no_orgunits = 'No organisation unit attached to current user, no data entry possible';
	var i18n_offline_notification = 'You are offline';
	var i18n_online_notification = 'You are online';
	var i18n_ajax_login_failed = 'Login failed, check your username and password and try again';
	
	var optionSetsInPromise = [];
	var attributesInPromise = [];
	dhis2.ndp.batchSize = 50;
	
	dhis2.ndp.store = null;
	dhis2.ndp.metaDataCached = dhis2.ndp.metaDataCached || false;
	dhis2.ndp.memoryOnly = $('html').hasClass('ie7') || $('html').hasClass('ie8');
	var adapters = [];
	if (dhis2.ndp.memoryOnly) {
	    adapters = [dhis2.storage.InMemoryAdapter];
	} else {
	    adapters = [dhis2.storage.IndexedDBAdapter, dhis2.storage.DomLocalStorageAdapter, dhis2.storage.InMemoryAdapter];
	}
	
	dhis2.ndp.store = new dhis2.storage.Store({
	    name: 'dhis2ndp',
	    adapters: [dhis2.storage.IndexedDBAdapter, dhis2.storage.DomSessionStorageAdapter, dhis2.storage.InMemoryAdapter],
	    objectStores: ['dataElements', 'dataElementGroups', 'dataElementGroupSets', 'dataSets', 'optionSets', 'categoryCombos', 'attributes', 'ouLevels', 'programs', 'legendSets', 'categoryOptionGroupSets', 'optionGroups', 'optionGroupSets']
	});
	
	(function ($) {
	    $.safeEach = function (arr, fn) {
	        if (arr) {
	            $.each(arr, fn);
	        }
	    };
	})(jQuery);
	
	/**
	 * Page init. The order of events is:
	 *
	 * 1. Load ouwt
	 * 2. Load meta-data (and notify ouwt)
	 *
	 */
	$(document).ready(function () {
	    $.ajaxSetup({
	        type: 'POST',
	        cache: false
	    });
	
	    $('#loaderSpan').show();
	});
	
	$(document).bind('dhis2.online', function (event, loggedIn) {
	    if (loggedIn) {
	        if (dhis2.ndp.emptyOrganisationUnits) {
	            setHeaderMessage(i18n_no_orgunits);
	        } else {
	            setHeaderDelayMessage(i18n_online_notification);
	        }
	    } else {
	        var form = ['<form style="display:inline;">', '<label for="username">Username</label>', '<input name="username" id="username" type="text" style="width: 70px; margin-left: 10px; margin-right: 10px" size="10"/>', '<label for="password">Password</label>', '<input name="password" id="password" type="password" style="width: 70px; margin-left: 10px; margin-right: 10px" size="10"/>', '<button id="login_button" type="button">Login</button>', '</form>'].join('');
	
	        setHeaderMessage(form);
	        ajax_login();
	    }
	});
	
	$(document).bind('dhis2.offline', function () {
	    if (dhis2.ndp.emptyOrganisationUnits) {
	        setHeaderMessage(i18n_no_orgunits);
	    } else {
	        setHeaderMessage(i18n_offline_notification);
	    }
	});
	
	function ajax_login() {
	    $('#login_button').bind('click', function () {
	        var username = $('#username').val();
	        var password = $('#password').val();
	
	        $.post('../dhis-web-commons-security/login.action', {
	            'j_username': username,
	            'j_password': password
	        }).success(function () {
	            var ret = dhis2.availability.syncCheckAvailability();
	
	            if (!ret) {
	                alert(i18n_ajax_login_failed);
	            }
	        });
	    });
	}
	
	// -----------------------------------------------------------------------------
	// Metadata downloading
	// -----------------------------------------------------------------------------
	dhis2.ndp.downloadDataElements = function (dataElementType) {
	    var def = $.Deferred();
	    dhis2.ndp.store.open().then(function () {
	        getMetaDataElementsByType(dataElementType).then(function (metaDes) {
	            filterMissingDataElements(metaDes).then(function (missingDes) {
	                getDataElements(missingDes).then(function () {
	                    def.resolve();
	                });
	            });
	        });
	    });
	    return def.promise();
	};
	
	dhis2.ndp.downloadGroupSets = function (code, groupSetType) {
	    var def = $.Deferred();
	    dhis2.ndp.store.open().then(function () {
	        getMetaDataElementGroupSetsByType(code, groupSetType).then(function (metaDegs) {
	            filterMissingDataElementGroupSets(metaDegs).then(function (missingDegs) {
	                getDataElementGroupSets(missingDegs).then(function (degs) {
	                    getDataElementGroups(degs).then(function (des) {
	                        getDataElements(des).then(function () {
	                            def.resolve();
	                        });
	                    });
	                });
	            });
	        });
	    });
	    return def.promise();
	};
	
	dhis2.ndp.downloadMetaData = function () {
	    DHIS2URL = ({"baseUrl":"http://localhost:9292","authorization":"Basic YWRtaW46ZGlzdHJpY3Q=","apiRoot":"../../..","mode":"PROD"}).apiRoot;
	
	    var metadataCached = JSON.parse(sessionStorage.getItem('METADATA_CACHED'));
	
	    if (metadataCached) {
	        return Promise.resolve();
	    }
	
	    console.log('Loading required meta-data');
	
	    return dhis2.ndp.store.open().then(getUserAccessibleDataSets).then(getUserAccessiblePrograms)
	
	    //fetch option sets
	    .then(getMetaOptionSets).then(filterMissingOptionSets).then(getOptionSets)
	
	    //fetch category combos
	    .then(getMetaCategoryCombos).then(filterMissingCategoryCombos).then(getCategoryCombos)
	
	    //fetch custom attributes
	    .then(getMetaAttributes).then(filterMissingAttributes).then(getAttributes)
	
	    //fetch programs
	    .then(getMetaPrograms).then(filterMissingPrograms).then(getPrograms)
	
	    //fetch legendSets
	    .then(getMetaLegendSets).then(filterMissingLegendSets).then(getLegendSets)
	
	    //fetch categoryOptionGroupSets
	    .then(getMetaCategoryOptionGroupSets).then(filterMissingCategoryOptionGroupSets).then(getCategoryOptionGroupSets)
	
	    //fetch optionGroups
	    .then(getMetaOptionGroups).then(filterMissingOptionGroups).then(getOptionGroups)
	
	    //fetch optionGroupSets
	    .then(getMetaOptionGroupSets).then(filterMissingOptionGroupSets).then(getOptionGroupSets);
	};
	
	dhis2.ndp.downloadAllMetaData = function () {
	    var metadataCached = JSON.parse(sessionStorage.getItem('ALL_METADATA_CACHED'));
	
	    if (metadataCached) {
	        return Promise.resolve();
	    }
	
	    console.log('Loading required meta-data');
	
	    return dhis2.ndp.store.open().then(getUserAccessibleDataSets).then(getUserAccessiblePrograms).then(getOrgUnitLevels).then(getSystemSetting)
	
	    //fetch data elements
	    .then(getMetaDataElements).then(filterMissingDataElements).then(getDataElements)
	
	    //fetch data element groups
	    .then(getMetaDataElementGroups).then(filterMissingDataElementGroups).then(getDataElementGroups)
	
	    //fetch data element groupsets
	    .then(getMetaDataElementGroupSets).then(filterMissingDataElementGroupSets).then(getDataElementGroupSets)
	
	    //fetch data sets
	    .then(getMetaDataSets).then(filterMissingDataSets).then(getDataSets)
	
	    //fetch option sets
	    .then(getMetaOptionSets).then(filterMissingOptionSets).then(getOptionSets)
	
	    //fetch category combos
	    .then(getMetaCategoryCombos).then(filterMissingCategoryCombos).then(getCategoryCombos)
	
	    //fetch custom attributes
	    .then(getMetaAttributes).then(filterMissingAttributes).then(getAttributes)
	
	    //fetch programs
	    .then(getMetaPrograms).then(filterMissingPrograms).then(getPrograms)
	
	    //fetch legendSets
	    .then(getMetaLegendSets).then(filterMissingLegendSets).then(getLegendSets)
	
	    //fetch categoryOptionGroupSets
	    .then(getMetaCategoryOptionGroupSets).then(filterMissingCategoryOptionGroupSets).then(getCategoryOptionGroupSets)
	
	    //fetch optionGroups
	    .then(getMetaOptionGroups).then(filterMissingOptionGroups).then(getOptionGroups);
	};
	
	function getUserAccessibleDataSets() {
	    return dhis2.metadata.getMetaObject(null, 'ACCESSIBLE_DATASETS', DHIS2URL + '/api/dataSets.json', 'fields=id,access[data[write]]&paging=false', 'sessionStorage', dhis2.ndp.store);
	}
	
	function getUserAccessiblePrograms() {
	    return dhis2.metadata.getMetaObject(null, 'ACCESSIBLE_PROGRAMS', DHIS2URL + '/api/programs.json', 'fields=id,access[data[read,write]],programStages[id,access[data[read,write]]]&paging=false', 'sessionStorage', dhis2.ndp.store);
	}
	
	function getOrgUnitLevels() {
	    dhis2.ndp.store.getKeys('ouLevels').done(function (res) {
	        if (res.length > 0) {
	            return;
	        }
	        return dhis2.metadata.getMetaObjects('ouLevels', 'organisationUnitLevels', DHIS2URL + '/api/organisationUnitLevels.json', 'fields=id,displayName,level&paging=false', 'idb', dhis2.ndp.store);
	    });
	}
	
	function getSystemSetting() {
	    if (localStorage['SYSTEM_SETTING']) {
	        return;
	    }
	    return dhis2.metadata.getMetaObject(null, 'SYSTEM_SETTING', DHIS2URL + '/api/systemSettings?key=keyUiLocale&key=keyCalendar&key=keyDateFormat&key=multiOrganisationUnitForms', '', 'localStorage', dhis2.ndp.store);
	}
	
	function getMetaCategoryCombos() {
	    return dhis2.metadata.getMetaObjectIds('categoryCombos', DHIS2URL + '/api/categoryCombos.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingCategoryCombos(objs) {
	    return dhis2.metadata.filterMissingObjIds('categoryCombos', dhis2.ndp.store, objs);
	}
	
	function getCategoryCombos(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'categoryCombos', 'categoryCombos', DHIS2URL + '/api/categoryCombos.json', 'paging=false&fields=id,displayName,code,skipTotal,isDefault,categoryOptionCombos[id,displayName,categoryOptions[displayName,id]],categories[id,displayName,code,dimension,dataDimensionType,attributeValues[value,attribute[id,name,valueType,code]],categoryOptions[id,displayName,code,attributeValues[value,attribute[id,code,valueType]]]]', 'idb', dhis2.ndp.store);
	}
	
	function getLinkedMetaDataElements(dataElements) {
	    return dhis2.metadata.getMetaObjectIds('dataElements', DHIS2URL + '/api/dataElements.json', 'paging=false&fields=id,version');
	}
	
	function getMetaDataElementsByType(type) {
	    return dhis2.metadata.getMetaObjectIds('dataElements', DHIS2URL + '/api/dataElements.json', 'paging=false&fields=id,version&filter=attributeValues.value:eq:' + type);
	}
	
	function getMetaDataElements() {
	    return dhis2.metadata.getMetaObjectIds('dataElements', DHIS2URL + '/api/dataElements.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingDataElements(objs) {
	    return dhis2.metadata.filterMissingObjIds('dataElements', dhis2.ndp.store, objs);
	}
	
	function getDataElements(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'dataElements', 'dataElements', DHIS2URL + '/api/dataElements.json', 'paging=false&fields=id,code,displayName,aggregationType,shortName,description,formName,valueType,optionSetValue,optionSet[id],legendSets[id],attributeValues[value,attribute[id,name,valueType,code]],categoryCombo[id]', 'idb', dhis2.ndp.store);
	}
	
	function getMetaDataElementGroups() {
	    return dhis2.metadata.getMetaObjectIds('dataElementGroups', DHIS2URL + '/api/dataElementGroups.json', 'paging=false&fields=id,version');
	}
	
	function getLinkedMetaDataElementGroups(groups) {
	    return dhis2.metadata.getMetaObjectIds('dataElementGroups', DHIS2URL + '/api/dataElementGroups.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingDataElementGroups(objs) {
	    return dhis2.metadata.filterMissingObjIds('dataElementGroups', dhis2.ndp.store, objs);
	}
	
	function getDataElementGroups(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'dataElementGroups', 'dataElementGroups', DHIS2URL + '/api/dataElementGroups.json', 'paging=false&fields=id,displayName,code,description,dataElements[id],attributeValues[value,attribute[id,name,valueType,code]]', 'idb', dhis2.ndp.store);
	}
	
	function getMetaDataElementGroupSetsByType(type, code) {
	    var filter = '';
	
	    if (type !== '') {
	        filter += '&filter=attributeValues.value:eq:' + type;
	    }
	
	    if (code !== '') {
	        filter += "&code:$ilike:" + code;
	    }
	
	    return dhis2.metadata.getMetaObjectIds('dataElementGroupSets', DHIS2URL + '/api/dataElementGroupSets.json', 'paging=false&fields=id,version' + filter);
	}
	
	function getMetaDataElementGroupSets() {
	    return dhis2.metadata.getMetaObjectIds('dataElementGroupSets', DHIS2URL + '/api/dataElementGroupSets.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingDataElementGroupSets(objs) {
	    return dhis2.metadata.filterMissingObjIds('dataElementGroupSets', dhis2.ndp.store, objs);
	}
	
	function getDataElementGroupSets(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'dataElementGroupSets', 'dataElementGroupSets', DHIS2URL + '/api/dataElementGroupSets.json', 'paging=false&fields=id,code,description,displayName,dataElementGroups[id,displayName],attributeValues[value,attribute[id,name,valueType,code]]', 'idb', dhis2.ndp.store);
	}
	
	function getMetaDataSets() {
	    return dhis2.metadata.getMetaObjectIds('dataSets', DHIS2URL + '/api/dataSets.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingDataSets(objs) {
	    return dhis2.metadata.filterMissingObjIds('dataSets', dhis2.ndp.store, objs);
	}
	
	function getDataSets(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'dataSets', 'dataSets', DHIS2URL + '/api/dataSets.json', 'paging=false&fields=id,periodType,displayName,version,categoryCombo[id],attributeValues[value,attribute[id,name,valueType,code]],organisationUnits[code,id],dataSetElements[id,dataElement[id]]', 'idb', dhis2.ndp.store, '');
	}
	
	function getMetaOptionSets() {
	    return dhis2.metadata.getMetaObjectIds('optionSets', DHIS2URL + '/api/optionSets.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingOptionSets(objs) {
	    return dhis2.metadata.filterMissingObjIds('optionSets', dhis2.ndp.store, objs);
	}
	
	function getOptionSets(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'optionSets', 'optionSets', DHIS2URL + '/api/optionSets.json', 'paging=false&fields=id,displayName,code,version,valueType,attributeValues[value,attribute[id,name,valueType,code]],options[id,displayName,code,attributeValues[value,attribute[id,name,valueType,code]]]', 'idb', dhis2.ndp.store);
	}
	
	function getMetaIndicatorGroups() {
	    return dhis2.metadata.getMetaObjectIds('indicatorGroups', DHIS2URL + '/api/indicatorGroups.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingIndicatorGroups(objs) {
	    return dhis2.metadata.filterMissingObjIds('indicatorGroups', dhis2.ndp.store, objs);
	}
	
	function getIndicatorGroups(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'indicatorGroups', 'indicatorGroups', DHIS2URL + '/api/indicatorGroups.json', 'paging=false&fields=id,displayName,attributeValues[value,attribute[id,name,valueType,code]],indicators[id,displayName,denominatorDescription,numeratorDescription,dimensionItem,numerator,denominator,annualized,dimensionType,indicatorType[id,displayName,factor,number]]', 'idb', dhis2.ndp.store);
	}
	
	function getMetaAttributes() {
	    return dhis2.metadata.getMetaObjectIds('attributes', DHIS2URL + '/api/attributes.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingAttributes(objs) {
	    return dhis2.metadata.filterMissingObjIds('attributes', dhis2.ndp.store, objs);
	}
	
	function getAttributes(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'attributes', 'attributes', DHIS2URL + '/api/attributes.json', 'paging=false&fields=:all,!access,!lastUpdatedBy,!lastUpdated,!created,!href,!user,!translations,!favorites,optionSet[id,displayName,code,options[id,displayName,code,sortOrder]]', 'idb', dhis2.ndp.store);
	}
	
	function getMetaPrograms() {
	    return dhis2.metadata.getMetaObjectIds('programs', DHIS2URL + '/api/programs.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingPrograms(objs) {
	    return dhis2.metadata.filterMissingObjIds('programs', dhis2.ndp.store, objs);
	}
	
	function getPrograms(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'programs', 'programs', DHIS2URL + '/api/programs.json', 'paging=false&fields=*,programSections[sortOrder,displayName,trackedEntityAttributes],programTrackedEntityAttributes[*,trackedEntityAttribute[*,attributeValues[value,attribute[id,name,valueType,code]]]],categoryCombo[id],attributeValues[value,attribute[id,name,valueType,code]],organisationUnits[id,level],programIndicators[id,displayName,analyticsType,expression],programStages[*,programStageDataElements[id,displayInReports,dataElement[*,attributeValues[value,attribute[id,name,valueType,code]]]]]', 'idb', dhis2.ndp.store, dhis2.metadata.processObject);
	}
	
	function getMetaLegendSets() {
	    return dhis2.metadata.getMetaObjectIds('legendSets', DHIS2URL + '/api/legendSets.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingLegendSets(objs) {
	    return dhis2.metadata.filterMissingObjIds('legendSets', dhis2.ndp.store, objs);
	}
	
	function getLegendSets(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'legendSets', 'legendSets', DHIS2URL + '/api/legendSets.json', 'paging=false&fields=id,code,displayName,attributeValues[value,attribute[id,name,valueType,code]],legends[id,name,startValue,endValue,color]', 'idb', dhis2.ndp.store, dhis2.metadata.processObject);
	}
	
	function getMetaCategoryOptionGroupSets() {
	    return dhis2.metadata.getMetaObjectIds('categoryOptionGroupSets', DHIS2URL + '/api/categoryOptionGroupSets.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingCategoryOptionGroupSets(objs) {
	    return dhis2.metadata.filterMissingObjIds('categoryOptionGroupSets', dhis2.ndp.store, objs);
	}
	
	function getCategoryOptionGroupSets(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'categoryOptionGroupSets', 'categoryOptionGroupSets', DHIS2URL + '/api/categoryOptionGroupSets.json', 'paging=false&fields=id,code,displayName,attributeValues[value,attribute[id,name,valueType,code]],categoryOptionGroups[id,displayName,code,categoryOptions[id,displayName,code]]', 'idb', dhis2.ndp.store, dhis2.metadata.processObject);
	}
	
	function getMetaOptionGroups() {
	    return dhis2.metadata.getMetaObjectIds('optionGroups', DHIS2URL + '/api/optionGroups.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingOptionGroups(objs) {
	    return dhis2.metadata.filterMissingObjIds('optionGroups', dhis2.ndp.store, objs);
	}
	
	function getOptionGroups(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'optionGroups', 'optionGroups', DHIS2URL + '/api/optionGroups.json', 'fields=id,displayName,code,optionSet[id],options[id,displayName,code]', 'idb', dhis2.ndp.store, dhis2.metadata.processObject);
	}
	
	function getMetaOptionGroupSets() {
	    return dhis2.metadata.getMetaObjectIds('optionGroupSets', DHIS2URL + '/api/optionGroupSets.json', 'paging=false&fields=id,version');
	}
	
	function filterMissingOptionGroupSets(objs) {
	    return dhis2.metadata.filterMissingObjIds('optionGroupSets', dhis2.ndp.store, objs);
	}
	
	function getOptionGroupSets(ids) {
	    return dhis2.metadata.getBatches(ids, dhis2.ndp.batchSize, 'optionGroupSets', 'optionGroupSets', DHIS2URL + '/api/optionGroupSets.json', 'fields=id,displayName,code,optionSet[id],optionGroups[id,displayName,code,options[id,displayName,code]]', 'idb', dhis2.ndp.store, dhis2.metadata.processObject);
	}

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = angular.module('ndpFramework', ['ui.bootstrap', 'ngRoute', 'ngCookies', 'ngSanitize', 'ngMessages', 'ndpFrameworkServices', 'ndpFrameworkFilters', 'ndpFrameworkDirectives', 'ndpFrameworkControllers', 'd2Directives', 'd2Filters', 'd2Services', 'd2Controllers', 'angularLocalStorage', 'ui.select', 'ui.select2', 'pascalprecht.translate']);

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	"use strict";
	
	/*
	 * Copyright (c) 2004-2014, University of Oslo
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are met:
	 * * Redistributions of source code must retain the above copyright notice, this
	 *   list of conditions and the following disclaimer.
	 * * Redistributions in binary form must reproduce the above copyright notice,
	 *   this list of conditions and the following disclaimer in the documentation
	 *   and/or other materials provided with the distribution.
	 * * Neither the name of the HISP project nor the names of its contributors may
	 *   be used to endorse or promote products derived from this software without
	 *   specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
	
	dhis2.util.namespace('dhis2.metadata');
	
	dhis2.metadata.custSeparator = '.';
	dhis2.metadata.formulaRegex = /#\{.+?\}/g;
	dhis2.metadata.expressionRegex = /#{.*?\}/g;
	dhis2.metadata.operatorRegex = /[#\{\}]/g;
	
	dhis2.metadata.expressionMatcher = function (obj, src, des, expressionPattern, operandPattern, src2) {
	    var match;
	    if (src2) {
	        if (obj[src] && obj[src][src2] && expressionPattern && operandPattern && obj[des]) {
	            while (match = expressionPattern.exec(obj[src][src2])) {
	                match[0] = match[0].replace(operandPattern, '');
	                obj[des].push(match[0].split('.')[0]);
	            }
	        }
	    } else {
	        if (obj[src] && expressionPattern && operandPattern && obj[des]) {
	            while (match = expressionPattern.exec(obj[src])) {
	                match[0] = match[0].replace(operandPattern, '');
	                obj[des].push(match[0]);
	            }
	        }
	    }
	
	    return obj;
	};
	
	dhis2.metadata.cartesianProduct = function (arrays) {
	
	    var i,
	        j,
	        l,
	        m,
	        a1,
	        o = [];
	    if (!arrays || arrays.length == 0) return arrays;
	
	    a1 = arrays.splice(0, 1);
	    arrays = dhis2.metadata.cartesianProduct(arrays);
	    for (i = 0, l = a1[0].length; i < l; i++) {
	        if (arrays && arrays.length) for (j = 0, m = arrays.length; j < m; j++) {
	            o.push([a1[0][i]].concat(arrays[j]));
	        } else o.push([a1[0][i]]);
	    }
	    return o;
	};
	
	dhis2.metadata.chunk = function (array, size) {
	    if (!array || !array.length || !size || size < 1) {
	        return [];
	    }
	
	    var groups = [];
	    var chunks = array.length / size;
	    for (var i = 0, j = 0; i < chunks; i++, j += size) {
	        groups[i] = array.slice(j, j + size);
	    }
	
	    return groups;
	};
	
	dhis2.metadata.processMetaDataAttribute = function (obj) {
	    if (!obj) {
	        return;
	    }
	
	    if (obj.attributeValues) {
	        for (var i = 0; i < obj.attributeValues.length; i++) {
	            if (obj.attributeValues[i].value && obj.attributeValues[i].attribute && obj.attributeValues[i].attribute.code && obj.attributeValues[i].attribute.valueType) {
	                if (obj.attributeValues[i].attribute.valueType === 'BOOLEAN' || obj.attributeValues[i].attribute.valueType === 'TRUE_ONLY') {
	                    if (obj.attributeValues[i].value === 'true') {
	                        obj[obj.attributeValues[i].attribute.code] = true;
	                    }
	                } else if (obj.attributeValues[i].attribute.valueType === 'NUMBER' && obj.attributeValues[i].value) {
	                    obj[obj.attributeValues[i].attribute.code] = parseFloat(obj.attributeValues[i].value);
	                } else {
	                    obj[obj.attributeValues[i].attribute.code] = obj.attributeValues[i].value;
	                }
	            }
	        }
	    }
	
	    //delete obj.attributeValues;
	
	    return obj;
	};
	
	dhis2.metadata.getMetaDataAttribute = function (obj) {
	    if (!obj) {
	        return;
	    }
	
	    var metaAttribute = {};
	    if (obj.attributeValues) {
	        for (var i = 0; i < obj.attributeValues.length; i++) {
	            if (obj.attributeValues[i].value && obj.attributeValues[i].attribute && obj.attributeValues[i].attribute.code && obj.attributeValues[i].attribute.valueType) {
	                if (obj.attributeValues[i].attribute.valueType === 'BOOLEAN' || obj.attributeValues[i].attribute.valueType === 'TRUE_ONLY') {
	                    if (obj.attributeValues[i].value === 'true') {
	                        metaAttribute[obj.attributeValues[i].attribute.code] = true;
	                    }
	                } else if (obj.attributeValues[i].attribute.valueType === 'NUMBER' && obj.attributeValues[i].value) {
	                    obj[obj.attributeValues[i].attribute.code] = parseInt(obj.attributeValues[i].value);
	                    metaAttribute[obj.attributeValues[i].attribute.code] = parseInt(obj.attributeValues[i].value);
	                } else {
	                    metaAttribute[obj.attributeValues[i].attribute.code] = obj.attributeValues[i].value;
	                }
	            }
	        }
	    }
	
	    //delete obj.attributeValues;
	
	    return metaAttribute;
	};
	
	dhis2.metadata.getMetaObjectIds = function (objNames, url, filter) {
	    var def = $.Deferred();
	    var objs = [];
	    $.ajax({
	        url: encodeURI(url),
	        type: 'GET',
	        data: encodeURI(filter)
	    }).done(function (response) {
	        _.each(_.values(response[objNames]), function (obj) {
	            objs.push(obj);
	        });
	        def.resolve(objs);
	    }).fail(function () {
	        def.resolve([]);
	    });
	
	    return def.promise();
	};
	
	dhis2.metadata.filterMissingObjIds = function (store, db, objs) {
	    return dhis2.metadata.filterMissingObjIdsWithCheck(store, db, objs);
	    /*var def = $.Deferred();
	     if( !objs || !objs.length || objs.length < 1){
	        def.resolve( [] );
	    }
	    else{
	        var objIds = [];
	        _.each( _.values( objs ), function ( obj ) {
	            objIds.push( obj.id );
	        });
	        def.resolve( objIds );
	    }
	     return def.promise();*/
	};
	
	dhis2.metadata.filterMissingObjIdsWithCheck = function (store, db, objs) {
	    var mainDef = $.Deferred();
	    var mainPromise = mainDef.promise();
	
	    var def = $.Deferred();
	    var promise = def.promise();
	
	    var builder = $.Deferred();
	    var build = builder.promise();
	
	    if (!objs || !objs.length || objs.length < 1) {
	        mainDef.resolve([]);
	    } else {
	        var missingObjIds = [];
	        _.each(_.values(objs), function (obj) {
	            build = build.then(function () {
	                var d = $.Deferred();
	                var p = d.promise();
	                db.get(store, obj.id).done(function (o) {
	                    if (!o) {
	                        missingObjIds.push(obj.id);
	                    } else {
	                        if (obj.version && o.version != obj.version) {
	                            missingObjIds.push(obj.id);
	                        }
	                    }
	                    d.resolve();
	                });
	
	                return p;
	            });
	        });
	
	        build.done(function () {
	            def.resolve();
	            promise = promise.done(function () {
	                mainDef.resolve(missingObjIds);
	            });
	        }).fail(function () {
	            mainDef.resolve([]);
	        });
	
	        builder.resolve();
	    }
	
	    return mainPromise;
	};
	
	dhis2.metadata.getBatches = function (ids, batchSize, store, objs, url, filter, storage, db, func) {
	    var mainDef = $.Deferred();
	    var mainPromise = mainDef.promise();
	
	    var def = $.Deferred();
	    var promise = def.promise();
	
	    var builder = $.Deferred();
	    var build = builder.promise();
	
	    if (!ids || !ids.length || ids.length < 1) {
	        mainDef.resolve([]);
	    } else {
	        var batches = dhis2.metadata.chunk(ids, batchSize);
	        var results = [];
	        _.each(_.values(batches), function (batch) {
	            promise = promise.then(function (result) {
	                if (result && result.length) {
	                    results = results.concat(result);
	                }
	                return dhis2.metadata.fetchBatchItems(batch, store, objs, url, filter, storage, db, func);
	            });
	        });
	
	        build.done(function () {
	            def.resolve();
	            promise = promise.done(function (result) {
	                if (result && result.length) {
	                    results = results.concat(result);
	                }
	                mainDef.resolve(results);
	            });
	        }).fail(function () {
	            mainDef.resolve([]);
	        });
	
	        builder.resolve();
	    }
	
	    return mainPromise;
	};
	
	dhis2.metadata.fetchBatchItems = function (batch, store, objs, url, filter, storage, db, func) {
	    var ids = '[' + batch.toString() + ']';
	    filter = filter + '&filter=id:in:' + ids;
	    return dhis2.metadata.getMetaObjects(store, objs, url, filter, storage, db, func);
	};
	
	dhis2.metadata.getMetaObjects = function (store, objs, url, filter, storage, db, func) {
	    var def = $.Deferred();
	
	    $.ajax({
	        url: encodeURI(url),
	        type: 'GET',
	        data: encodeURI(filter)
	    }).done(function (response) {
	        if (response[objs]) {
	            var count = 0;
	            _.each(_.values(response[objs]), function (obj) {
	                obj = dhis2.metadata.processMetaDataAttribute(obj);
	                if (func) {
	                    obj = func(obj, 'organisationUnits');
	                }
	                if (store === 'categoryCombos') {
	
	                    if (obj.categories) {
	                        _.each(_.values(obj.categories), function (ca) {
	                            ca = dhis2.metadata.processMetaDataAttribute(ca);
	                            if (ca.categoryOptions) {
	                                _.each(_.values(ca.categoryOptions), function (co) {
	                                    co = dhis2.metadata.processMetaDataAttribute(co);
	                                    co.mappedOrganisationUnits = [];
	                                    if (co.organisationUnits && co.organisationUnits.length > 0) {
	                                        co.mappedOrganisationUnits = $.map(co.organisationUnits, function (ou) {
	                                            return ou.id;
	                                        });
	                                    }
	                                    delete co.organisationUnits;
	                                });
	                            }
	                        });
	                    }
	
	                    if (obj.categoryOptionCombos && obj.categories) {
	                        var categoryOptions = [];
	                        _.each(_.values(obj.categories), function (cat) {
	                            if (cat.categoryOptions) {
	                                categoryOptions.push($.map(cat.categoryOptions, function (co) {
	                                    return co.displayName;
	                                }));
	                            }
	                        });
	
	                        var cocs = dhis2.metadata.cartesianProduct(categoryOptions);
	
	                        var sortedOptionCombos = [];
	                        _.each(_.values(cocs), function (coc) {
	                            for (var i = 0; i < obj.categoryOptionCombos.length; i++) {
	                                var opts = obj.categoryOptionCombos[i].displayName.split(', ');
	                                var itsc = _.intersection(opts, coc);
	                                if (itsc.length === opts.length && itsc.length === coc.length) {
	                                    sortedOptionCombos.push({ id: obj.categoryOptionCombos[i].id, displayName: coc.join(','), access: obj.categoryOptionCombos[i].access, categoryOptions: obj.categoryOptionCombos[i].categoryOptions });
	                                    break;
	                                }
	                            }
	                        });
	                        obj.categoryOptionCombos = sortedOptionCombos;
	                        /*if( obj.categoryOptionCombos.length !== sortedOptionCombos.length ){
	                            console.log(obj.displayName, ' - ', obj.categoryOptionCombos.length, ' - ', sortedOptionCombos.length);
	                        }
	                        else{
	                            obj.categoryOptionCombos = sortedOptionCombos;
	                        }*/
	                    }
	                } else if (store === 'dataSets') {
	
	                    if (obj.sections) {
	                        _.each(obj.sections, function (sec) {
	                            if (sec.indicators) {
	                                angular.forEach(sec.indicators, function (ind) {
	                                    ind = dhis2.metadata.processMetaDataAttribute(ind);
	                                    ind.params = [];
	                                    ind = dhis2.metadata.expressionMatcher(ind, 'numerator', 'params', dhis2.metadata.expressionRegex, dhis2.metadata.operatorRegex);
	                                    ind = dhis2.metadata.expressionMatcher(ind, 'denominator', 'params', dhis2.metadata.expressionRegex, dhis2.metadata.operatorRegex);
	                                });
	                            }
	                            if (sec.greyedFields) {
	                                var greyedFields = [];
	                                greyedFields = $.map(sec.greyedFields, function (gf) {
	                                    return gf.dimensionItem;
	                                });
	                                sec.greyedFields = greyedFields;
	                            }
	                        });
	                    }
	
	                    var dataElements = [];
	                    _.each(obj.dataSetElements, function (dse) {
	                        if (dse.dataElement) {
	                            dataElements.push(dhis2.metadata.processMetaDataAttribute(dse.dataElement));
	                        }
	                    });
	                    obj.dataElements = dataElements;
	                    delete obj.dataSetElements;
	                    /*var mappedOrgUnits = [];
	                    if( obj.organisationUnits && obj.organisationUnits.length > 0 ){
	                        mappedOrgUnits = $.map(obj.organisationUnits, function(ou){return ou.code;});
	                         obj.organisationUnits = mappedOrgUnits;
	                    }*/
	                } else if (store === 'validationRules') {
	                    obj.params = [];
	                    obj = dhis2.metadata.expressionMatcher(obj, 'leftSide', 'params', dhis2.metadata.expressionRegex, dhis2.metadata.operatorRegex, 'expression');
	                    obj = dhis2.metadata.expressionMatcher(obj, 'rightSide', 'params', dhis2.metadata.expressionRegex, dhis2.metadata.operatorRegex, 'expression');
	                } else if (store === 'periodTypes') {
	                    obj.id = count;
	                } else if (store === 'programs') {
	                    _.each(obj.programStages, function (stage) {
	                        _.each(stage.programStageDataElements, function (pstde) {
	                            if (pstde.dataElement) {
	                                pstde.dataElement = dhis2.metadata.processMetaDataAttribute(pstde.dataElement);
	                            }
	                        });
	                    });
	
	                    _.each(obj.programTrackedEntityAttributes, function (pta) {
	                        if (pta.trackedEntityAttribute) {
	                            pta.trackedEntityAttribute = dhis2.metadata.processMetaDataAttribute(pta.trackedEntityAttribute);
	                        }
	                    });
	                } else if (store === 'optionSets') {
	                    _.each(obj.options, function (op) {
	                        op = dhis2.metadata.processMetaDataAttribute(op);
	                    });
	                }
	                count++;
	            });
	
	            if (storage === 'idb') {
	                db.setAll(store, response[objs]);
	            }
	            if (storage === 'localStorage') {
	                localStorage[store] = JSON.stringify(response[objs]);
	            }
	            if (storage === 'sessionStorage') {
	                var SessionStorageService = angular.element('body').injector().get('SessionStorageService');
	                SessionStorageService.set(store, response[objs]);
	            }
	        }
	
	        if (storage === 'temp') {
	            def.resolve(response[objs] ? response[objs] : []);
	        } else {
	
	            if (store === 'dataElementGroupSets') {
	                var dataElementGroups = [];
	                if (response[objs]) {
	                    _.each(_.values(response[objs]), function (obj) {
	                        var _degs = $.map(obj.dataElementGroups, function (deg) {
	                            return deg.id;
	                        });
	                        dataElementGroups = dataElementGroups.concat(_degs);
	                    });
	                }
	                def.resolve(dataElementGroups);
	            } else if (store === 'dataElementGroups') {
	                var dataElements = [];
	                if (response[objs]) {
	                    _.each(_.values(response[objs]), function (obj) {
	                        var _des = $.map(obj.dataElements, function (de) {
	                            return de.id;
	                        });
	                        dataElements = dataElements.concat(_des);
	                    });
	                }
	                def.resolve(dataElements);
	            } else {
	                def.resolve();
	            }
	        }
	    }).fail(function () {
	        def.resolve(null);
	    });
	
	    return def.promise();
	};
	
	dhis2.metadata.getMetaObject = function (id, store, url, filter, storage, db, func) {
	    var def = $.Deferred();
	
	    if (id) {
	        url = url + '/' + id + '.json';
	    }
	
	    $.ajax({
	        url: encodeURI(url),
	        type: 'GET',
	        data: encodeURI(filter)
	    }).done(function (response) {
	        if (func) {
	            response = func(response);
	        }
	
	        if (store === 'ACCESSIBLE_PROGRAMS') {
	            var programStages = $.map(response.programs, function (pr) {
	                return pr.programStages;
	            });
	            var SessionStorageService = angular.element('body').injector().get('SessionStorageService');
	            SessionStorageService.set('ACCESSIBLE_PROGRAM_STAGES', { programStages: programStages });
	        }
	
	        if (storage === 'idb') {
	            if (response && response.id) {
	                db.set(store, response);
	            }
	        }
	        if (storage === 'localStorage') {
	            localStorage[store] = JSON.stringify(response);
	        }
	        if (storage === 'sessionStorage') {
	            var SessionStorageService = angular.element('body').injector().get('SessionStorageService');
	            SessionStorageService.set(store, response);
	        }
	
	        def.resolve();
	    }).fail(function () {
	        def.resolve();
	    });
	
	    return def.promise();
	};
	
	dhis2.metadata.processObject = function (obj, prop) {
	    if (obj[prop]) {
	        var oo = {};
	        _.each(_.values(obj[prop]), function (o) {
	            if (o.name) {
	                oo[o.id] = o.name;
	            } else if (o.level) {
	                oo[o.id] = o.level;
	            } else {
	                oo[o.id] = o.id;
	            }
	        });
	        obj[prop] = oo;
	    }
	    return obj;
	};
	
	dhis2.metadata.processOptionCombos = function (data) {
	
	    var getSharingSetting = function getSharingSetting(coc) {
	
	        var dWrite = true,
	            dRead = true,
	            mRead = true,
	            mWrite = true;
	
	        coc.categoryOptions.forEach(function (co) {
	            dWrite = co.access.data.write && dWrite;
	            dRead = co.access.data.read && dRead;
	            mRead = co.access.read && mRead;
	            mWrite = co.access.write && mWrite;
	            var att = dhis2.metadata.getMetaDataAttribute(co);
	            if (coc.categoryOptions.length === 1 && Object.keys(att).length > 0) {
	                for (var key in att) {
	                    coc[key] = att[key];
	                }
	            }
	        });
	
	        coc.dWrite = dWrite;
	        coc.dRead = dRead;
	        coc.mRead = mRead;
	        coc.mWrite = mWrite;
	
	        return coc;
	    };
	
	    if (data && data.categoryCombos && data.categoryCombos.length > 0) {
	        var optionCombos = {};
	        data.categoryCombos.forEach(function (cc) {
	            if (cc.categoryOptionCombos) {
	                var cocs = $.map(cc.categoryOptionCombos, function (coc) {
	                    return getSharingSetting(coc);
	                });
	                cocs.forEach(function (coc) {
	                    optionCombos[coc.id] = coc;
	                });
	            }
	        });
	
	        return optionCombos;
	    }
	
	    return data;
	};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Pagination service */
	/* global angular, dhis2, moment, Intl, parseFloat */
	
	var d2Services = angular.module('d2Services', ['ngResource'])
	
	/* Factory for loading translation strings */
	.factory('i18nLoader', ["$q", "$http", "SessionStorageService", "DHIS2URL", function ($q, $http, SessionStorageService, DHIS2URL) {
	
	    var getTranslationStrings = function getTranslationStrings(locale) {
	        var defaultUrl = 'i18n/i18n_app.properties';
	        var url = '';
	        if (locale === 'en' || !locale) {
	            url = defaultUrl;
	        } else {
	            url = 'i18n/i18n_app_' + locale + '.properties';
	        }
	
	        var tx = { locale: locale };
	
	        var promise = $http.get(url).then(function (response) {
	            tx = { locale: locale, keys: dhis2.util.parseJavaProperties(response.data) };
	            return tx;
	        }, function () {
	
	            var p = $http.get(defaultUrl).then(function (response) {
	                tx = { locale: locale, keys: dhis2.util.parseJavaProperties(response.data) };
	                return tx;
	            });
	            return p;
	        });
	        return promise;
	    };
	
	    var getLocale = function getLocale() {
	        var locale = 'en';
	
	        var promise = $http.get(DHIS2URL + '/api/systemSettings?key=keyUiLocale&key=keyCalendar&key=keyDateFormat&key=multiOrganisationUnitForms').then(function (response) {
	            SessionStorageService.set('SYSTEM_SETTING', response.data);
	            if (response.data && response.data.settings && response.data.keyUiLocale) {
	                locale = response.data.keyUiLocale;
	            }
	            return locale;
	        }, function () {
	            return locale;
	        });
	
	        return promise;
	    };
	    return function () {
	        var deferred = $q.defer(),
	            translations;
	        var userProfile = SessionStorageService.get('SYSTEM_SETTING');
	        if (userProfile && userProfile.keyUiLocale) {
	            getTranslationStrings(userProfile.keyUiLocale).then(function (response) {
	                translations = response.keys;
	                deferred.resolve(translations);
	            });
	            return deferred.promise;
	        } else {
	            getLocale().then(function (locale) {
	                getTranslationStrings(locale).then(function (response) {
	                    translations = response.keys;
	                    deferred.resolve(translations);
	                });
	            });
	            return deferred.promise;
	        }
	    };
	}]).service('AuthorityService', function () {
	    var getAuthorities = function getAuthorities(roles) {
	        var authority = {};
	        if (roles && roles.userCredentials && roles.userCredentials.userRoles) {
	            angular.forEach(roles.userCredentials.userRoles, function (role) {
	                angular.forEach(role.authorities, function (auth) {
	                    authority[auth] = true;
	                });
	            });
	        }
	        return authority;
	    };
	
	    return {
	        getUserAuthorities: function getUserAuthorities(roles) {
	            var auth = getAuthorities(roles);
	            var authority = {};
	            authority.canDeleteEvent = auth['F_TRACKED_ENTITY_DATAVALUE_DELETE'] || auth['ALL'] ? true : false;
	            authority.canAddOrUpdateEvent = auth['F_TRACKED_ENTITY_DATAVALUE_ADD'] || auth['ALL'] ? true : false;
	            authority.canSearchTei = auth['F_TRACKED_ENTITY_INSTANCE_SEARCH'] || auth['ALL'] ? true : false;
	            authority.canDeleteTei = auth['F_TRACKED_ENTITY_INSTANCE_DELETE'] || auth['ALL'] ? true : false;
	            authority.canRegisterTei = auth['F_TRACKED_ENTITY_INSTANCE_ADD'] || auth['ALL'] ? true : false;
	            authority.canEnrollTei = auth['F_PROGRAM_ENROLLMENT'] || auth['ALL'] ? true : false;
	            authority.canUnEnrollTei = auth['F_PROGRAM_UNENROLLMENT'] || auth['ALL'] ? true : false;
	            authority.canAdministerDashboard = auth['F_PROGRAM_DASHBOARD_CONFIG_ADMIN'] || auth['ALL'] ? true : false;
	            return authority;
	        }
	    };
	})
	
	/* Factory for loading external data */
	.factory('ExternalDataFactory', ["$http", function ($http) {
	
	    return {
	        get: function get(fileName) {
	            var promise = $http.get(fileName).then(function (response) {
	                return response.data;
	            });
	            return promise;
	        }
	    };
	}])
	
	/* service for wrapping sessionStorage '*/
	.service('SessionStorageService', ["$window", function ($window) {
	    return {
	        get: function get(key) {
	            return JSON.parse($window.sessionStorage.getItem(key));
	        },
	        set: function set(key, obj) {
	            $window.sessionStorage.setItem(key, JSON.stringify(obj));
	        },
	        clearAll: function clearAll() {
	            for (var key in $window.sessionStorage) {
	                $window.sessionStorage.removeItem(key);
	            }
	        }
	    };
	}])
	
	/* service for getting calendar setting */
	.service('CalendarService', ["storage", "$rootScope", function (storage, $rootScope) {
	
	    return {
	        getSetting: function getSetting() {
	
	            var dhis2CalendarFormat = { keyDateFormat: 'yyyy-MM-dd', keyCalendar: 'gregorian', momentFormat: 'YYYY-MM-DD' };
	            var storedFormat = storage.get('SYSTEM_SETTING');
	            if (angular.isObject(storedFormat) && storedFormat.keyDateFormat && storedFormat.keyCalendar) {
	                if (storedFormat.keyCalendar === 'iso8601') {
	                    storedFormat.keyCalendar = 'gregorian';
	                }
	
	                if (storedFormat.keyDateFormat === 'dd-MM-yyyy') {
	                    dhis2CalendarFormat.momentFormat = 'DD-MM-YYYY';
	                }
	
	                dhis2CalendarFormat.keyCalendar = storedFormat.keyCalendar;
	                dhis2CalendarFormat.keyDateFormat = storedFormat.keyDateFormat;
	            }
	            $rootScope.dhis2CalendarFormat = dhis2CalendarFormat;
	            return dhis2CalendarFormat;
	        }
	    };
	}])
	
	/* service for dealing with dates */
	.service('DateUtils', ["$filter", "CalendarService", function ($filter, CalendarService) {
	
	    return {
	        getDate: function getDate(dateValue) {
	            if (!dateValue) {
	                return;
	            }
	            var calendarSetting = CalendarService.getSetting();
	            dateValue = moment(dateValue, calendarSetting.momentFormat)._d;
	            return Date.parse(dateValue);
	        },
	        format: function format(dateValue) {
	            if (!dateValue) {
	                return;
	            }
	
	            var calendarSetting = CalendarService.getSetting();
	            dateValue = moment(dateValue, calendarSetting.momentFormat)._d;
	            dateValue = $filter('date')(dateValue, calendarSetting.keyDateFormat);
	            return dateValue;
	        },
	        formatToHrsMins: function formatToHrsMins(dateValue) {
	            var calendarSetting = CalendarService.getSetting();
	            var dateFormat = 'YYYY-MM-DD @ hh:mm A';
	            if (calendarSetting.keyDateFormat === 'dd-MM-yyyy') {
	                dateFormat = 'DD-MM-YYYY @ hh:mm A';
	            }
	            return moment(dateValue).format(dateFormat);
	        },
	        formatToHrsMinsSecs: function formatToHrsMinsSecs(dateValue) {
	            var calendarSetting = CalendarService.getSetting();
	            var dateFormat = 'YYYY-MM-DD @ hh:mm:ss A';
	            if (calendarSetting.keyDateFormat === 'dd-MM-yyyy') {
	                dateFormat = 'DD-MM-YYYY @ hh:mm:ss A';
	            }
	            return moment(dateValue).format(dateFormat);
	        },
	
	        getToday: function getToday() {
	            var calendarSetting = CalendarService.getSetting();
	            var tdy = $.calendars.instance(calendarSetting.keyCalendar).newDate();
	            var today = moment(tdy._year + '-' + tdy._month + '-' + tdy._day, 'YYYY-MM-DD')._d;
	            today = Date.parse(today);
	            today = $filter('date')(today, calendarSetting.keyDateFormat);
	            return today;
	        },
	        formatFromUserToApi: function formatFromUserToApi(dateValue) {
	            if (!dateValue) {
	                return;
	            }
	            var calendarSetting = CalendarService.getSetting();
	            dateValue = moment(dateValue, calendarSetting.momentFormat)._d;
	            dateValue = Date.parse(dateValue);
	            dateValue = $filter('date')(dateValue, 'yyyy-MM-dd');
	            return dateValue;
	        },
	        formatFromApiToUser: function formatFromApiToUser(dateValue) {
	            if (!dateValue) {
	                return;
	            }
	            var calendarSetting = CalendarService.getSetting();
	            if (moment(dateValue, calendarSetting.momentFormat).format(calendarSetting.momentFormat) === dateValue) {
	                return dateValue;
	            }
	            dateValue = moment(dateValue, 'YYYY-MM-DD')._d;
	            return $filter('date')(dateValue, calendarSetting.keyDateFormat);
	        },
	        getDateAfterOffsetDays: function getDateAfterOffsetDays(offSetDays) {
	            var date = new Date();
	            date.setDate(date.getDate() + offSetDays);
	            var calendarSetting = CalendarService.getSetting();
	            var tdy = $.calendars.instance(calendarSetting.keyCalendar).fromJSDate(date);
	            var dateAfterOffset = moment(tdy._year + '-' + tdy._month + '-' + tdy._day, 'YYYY-MM-DD')._d;
	            dateAfterOffset = Date.parse(dateAfterOffset);
	            dateAfterOffset = $filter('date')(dateAfterOffset, calendarSetting.keyDateFormat);
	            return dateAfterOffset;
	        },
	        getDifference: function getDifference(startDate, endDate) {
	            var firstdate = this.toMomentFormat(startDate);
	            var seconddate = this.toMomentFormat(endDate);
	            return seconddate.diff(firstdate, 'days');
	        },
	        toMomentFormat: function toMomentFormat(dateValue) {
	            if (!dateValue) {
	                return;
	            }
	
	            dateValue = $filter('trimquotes')(dateValue);
	            var calendarSetting = CalendarService.getSetting();
	            var dateValues = dateValue.split('-');
	            var _dateValue = dateValues[0] + '/' + dateValues[1] + '/' + dateValues[2];
	
	            if (calendarSetting.momentFormat === 'DD-MM-YYYY') {
	                return moment(_dateValue, 'DD/MM/YYYY');
	            }
	            return moment(_dateValue, 'YYYY/MM/DD');
	        },
	        isValid: function isValid(date) {
	            if (!date) {
	                return false;
	            }
	            var convertedDate = this.format(date);
	            return date === convertedDate;
	        }
	    };
	}])
	
	/* Service for option name<->code conversion */
	.factory('OptionSetService', function () {
	    return {
	        getCode: function getCode(options, key) {
	            if (options) {
	                for (var i = 0; i < options.length; i++) {
	                    if (key === options[i].displayName) {
	                        return options[i].code;
	                    }
	                }
	            }
	            return key;
	        },
	        getName: function getName(options, key) {
	            if (options) {
	                for (var i = 0; i < options.length; i++) {
	                    if (key === options[i].code) {
	                        return options[i].displayName;
	                    }
	                }
	            }
	            return key;
	        }
	    };
	})
	
	/* service for common utils */
	.service('CommonUtils', ["$q", "$translate", "SessionStorageService", "DateUtils", "OptionSetService", "CurrentSelection", "FileService", "DialogService", function ($q, $translate, SessionStorageService, DateUtils, OptionSetService, CurrentSelection, FileService, DialogService) {
	
	    return {
	        formatDataValue: function formatDataValue(event, val, obj, optionSets, destination) {
	            var fileNames = CurrentSelection.getFileNames();
	            if (val && obj.valueType === 'NUMBER' || obj.valueType === 'INTEGER' || obj.valueType === 'INTEGER_POSITIVE' || obj.valueType === 'INTEGER_NEGATIVE' || obj.valueType === 'INTEGER_ZERO_OR_POSITIVE') {
	                if (dhis2.validation.isNumber(val)) {
	                    if (obj.valueType === 'NUMBER') {
	                        val = parseFloat(val);
	                    } else {
	                        val = parseInt(val);
	                    }
	                }
	            }
	            if (val && obj.optionSetValue && obj.optionSet && obj.optionSet.id && optionSets[obj.optionSet.id] && optionSets[obj.optionSet.id].options) {
	                if (destination === 'USER') {
	                    val = OptionSetService.getName(optionSets[obj.optionSet.id].options, String(val));
	                } else {
	                    val = OptionSetService.getCode(optionSets[obj.optionSet.id].options, val);
	                }
	            }
	            if (val && obj.valueType === 'DATE') {
	                if (destination === 'USER') {
	                    val = DateUtils.formatFromApiToUser(val);
	                } else {
	                    val = DateUtils.formatFromUserToApi(val);
	                }
	            }
	            if (obj.valueType === 'BOOLEAN') {
	
	                if (destination === 'USER') {
	                    val = val === 'true' ? 'Yes' : 'No';
	                } else {
	                    val = val === 'yes' ? 'true' : '';
	                }
	            }
	            if (obj.valueType === 'TRUE_ONLY') {
	
	                if (destination === 'USER') {
	                    val = val === 'true' ? true : '';
	                } else {
	                    val = val === true ? 'true' : '';
	                }
	            }
	            if (event && val && destination === 'USER' && obj.valueType === 'FILE_RESOURCE') {
	                FileService.get(val).then(function (response) {
	                    if (response && response.name) {
	                        if (!fileNames[event]) {
	                            fileNames[event] = [];
	                        }
	                        fileNames[event][obj.id] = response.name;
	                        CurrentSelection.setFileNames(fileNames);
	                    }
	                });
	            }
	            return val;
	        },
	        displayBooleanAsYesNo: function displayBooleanAsYesNo(value, dataElement) {
	            if (angular.isUndefined(dataElement) || dataElement.valueType === "BOOLEAN") {
	                if (value === "true" || value === true) {
	                    return "Yes";
	                } else if (value === "false" || value === false) {
	                    return "No";
	                }
	            }
	            return value;
	        },
	        userHasValidRole: function userHasValidRole(obj, prop, userRoles) {
	            if (!obj || !prop || !userRoles) {
	                return false;
	            }
	            for (var i = 0; i < userRoles.length; i++) {
	                if (userRoles[i].authorities && userRoles[i].authorities.indexOf('ALL') !== -1) {
	                    return true;
	                }
	                if (userRoles[i][prop] && userRoles[i][prop].length > 0) {
	                    for (var j = 0; j < userRoles[i][prop].length; j++) {
	                        if (obj.id === userRoles[i][prop][j].id) {
	                            return true;
	                        }
	                    }
	                }
	            }
	            return false;
	        },
	        userHasWriteAccess: function userHasWriteAccess(storage, object, objectId) {
	            var objs = SessionStorageService.get(storage);
	            if (objs && objs.length) {
	                for (var i = 0; i < objs.length; i++) {
	                    if (objs[i].id === objectId && objs[i].access && objs[i].access.data && objs[i].access.data.write) {
	                        return true;
	                    }
	                }
	            }
	            return false;
	        },
	        userHasReadAccess: function userHasReadAccess(storage, object, objectId) {
	            var objs = SessionStorageService.get(storage);
	            objs = objs[object];
	            if (objs && objs.length) {
	                for (var i = 0; i < objs.length; i++) {
	                    if (objs[i].id === objectId && objs[i].access && objs[i].access.data && (objs[i].access.data.read || objs[i].access.data.write)) {
	                        return true;
	                    }
	                }
	            }
	            return false;
	        },
	        getUsername: function getUsername() {
	            var userProfile = SessionStorageService.get('USER_PROFILE');
	            var username = userProfile && userProfile.userCredentials && userProfile.userCredentials.username ? userProfile.userCredentials.username : '';
	            return username;
	        },
	        getProduct: function getProduct(op1, op2) {
	            op1 = dhis2.validation.isNumber(op1) ? parseInt(op1) : 0;
	            op2 = dhis2.validation.isNumber(op2) ? parseInt(op2) : 0;
	            var res = op1 * op2;
	            return res;
	        },
	        formatNumber: function formatNumber(num) {
	            if (dhis2.validation.isNumber(num)) {
	                return new Intl.NumberFormat().format(num);
	            }
	            return "";
	        },
	        getSum: function getSum(op1, op2) {
	            op1 = dhis2.validation.isNumber(op1) ? parseInt(op1) : 0;
	            op2 = dhis2.validation.isNumber(op2) ? parseInt(op2) : 0;
	            return op1 + op2;
	        },
	        getTotal: function getTotal(arr, prop) {
	            var getValue = function getValue(item) {
	                return item[prop];
	            };
	
	            var sum = function sum(a, b) {
	                return a + b;
	            };
	
	            return arr.length > 0 ? arr.map(getValue).reduce(sum) : '';
	        },
	        getPercent: function getPercent(op1, op2, turnOffPercent, turnOffDecimal) {
	            op1 = dhis2.validation.isNumber(op1) ? parseFloat(op1) : 0;
	            op2 = dhis2.validation.isNumber(op2) ? parseFloat(op2) : 0;
	            if (op2 === 0) {
	                return '';
	            }
	
	            if (op1 === 0) {
	                return turnOffPercent ? 0 : '0%';
	            }
	
	            var res = parseFloat(op1 / op2) * 100;
	            if (turnOffDecimal) {
	                res = res.toFixed(1);
	            }
	
	            return turnOffPercent ? res : res + '%';
	        },
	        getRoleHeaders: function getRoleHeaders() {
	            var headers = [];
	            headers.push({ id: 'catalyst', displayName: $translate.instant('catalyst') });
	            headers.push({ id: 'funder', displayName: $translate.instant('funder') });
	            headers.push({ id: 'responsibleMinistry', displayName: $translate.instant('responsible_ministry') });
	
	            return headers;
	        },
	        getOptionComboIdFromOptionNames: function getOptionComboIdFromOptionNames(optionComboMap, options) {
	
	            var optionNames = [];
	            angular.forEach(options, function (op) {
	                optionNames.push(op.displayName);
	            });
	
	            var selectedAttributeOcboName = optionNames.join();
	            //selectedAttributeOcboName = selectedAttributeOcboName.replace(/\,/g, ', ');
	            var selectedAttributeOcobo = optionComboMap['"' + selectedAttributeOcboName + '"'];
	
	            if (!selectedAttributeOcobo || angular.isUndefined(selectedAttributeOcobo)) {
	                selectedAttributeOcboName = optionNames.reverse().join();
	                //selectedAttributeOcboName = selectedAttributeOcboName.replace(",", ", ");
	                selectedAttributeOcobo = optionComboMap['"' + selectedAttributeOcboName + '"'];
	            }
	
	            return selectedAttributeOcobo;
	        },
	        splitRoles: function splitRoles(roles) {
	            return roles.split(",");
	        },
	        pushRoles: function pushRoles(existingRoles, roles) {
	            angular.forEach(roles, function (r) {
	                if (existingRoles.indexOf(r) === -1) {
	                    existingRoles.push(r);
	                }
	            });
	            return existingRoles;
	        },
	        extractRoles: function extractRoles(existingRoles, roles) {
	
	            return existingRoles;
	        },
	        getOptionIds: function getOptionIds(options) {
	            var optionNames = '';
	            angular.forEach(options, function (o) {
	                optionNames += o.id + ';';
	            });
	
	            return optionNames.slice(0, -1);
	        },
	        errorNotifier: function errorNotifier(response) {
	            if (response && response.data && response.data.status === 'ERROR') {
	                var dialogOptions = {
	                    headerText: response.data.status,
	                    bodyText: response.data.message ? response.data.message : $translate.instant('unable_to_fetch_data_from_server')
	                };
	                DialogService.showDialog({}, dialogOptions);
	            }
	        },
	        getNumeratorAndDenominatorIds: function getNumeratorAndDenominatorIds(ind) {
	            var expressionRegx = /[#\{\}]/g;
	            var num = ind.numerator.replace(expressionRegx, '');
	            var den = ind.denominator.replace(expressionRegx, '');
	
	            if (num.indexOf('.') === -1) {
	                num = num + '.HllvX50cXC0';
	            }
	            num = num.split('.');
	
	            if (den.indexOf('.') === -1) {
	                den = den + '.HllvX50cXC0';
	            }
	            den = den.split('.');
	            return { numerator: num[0], numeratorOptionCombo: num[1], denominator: den[0], denominatorOptionCombo: den[1] };
	        },
	        populateOuLevels: function populateOuLevels(orgUnit, ouLevels, lowestLevel) {
	            var ouModes = [{ displayName: $translate.instant('selected_level'), value: 'SELECTED', level: orgUnit.l }];
	            for (var i = orgUnit.l + 1; i <= lowestLevel; i++) {
	                var lvl = ouLevels[i];
	                ouModes.push({ value: lvl, displayName: lvl, level: i });
	            }
	            var selectedOuMode = ouModes[0];
	            return { ouModes: ouModes, selectedOuMode: selectedOuMode };
	        },
	        processDataSet: function processDataSet(ds) {
	            var dataElements = [];
	            angular.forEach(ds.dataSetElements, function (dse) {
	                if (dse.dataElement) {
	                    dataElements.push(dhis2.metadata.processMetaDataAttribute(dse.dataElement));
	                }
	            });
	            ds.dataElements = dataElements;
	            delete ds.dataSetElements;
	
	            return ds;
	        },
	        getReportName: function getReportName(reportType, reportRole, ouName, ouLevel, peName) {
	            var reportName = ouName;
	            if (ouLevel && ouLevel.value && ouLevel.value !== 'SELECTED') {
	                reportName += ' (' + ouLevel.displayName + ') ';
	            }
	
	            reportName += ' - ' + reportType;
	
	            if (reportRole && reportRole.displayNme) {
	                reportName += ' (' + reportRole.displayName + ')';
	            }
	
	            reportName += ' - ' + peName + '.xls';
	            return reportName;
	        },
	        getDataElementTotal: function getDataElementTotal(dataValues, dataElement) {
	            if (dataValues[dataElement]) {
	                dataValues[dataElement].total = 0;
	                angular.forEach(dataValues[dataElement], function (val, key) {
	                    if (key !== 'total' && val && val.value && dhis2.validation.isNumber(val.value)) {
	                        dataValues[dataElement].total += parseInt(val.value);
	                    }
	                });
	            }
	            return dataValues[dataElement];
	        },
	        getIndicatorResult: function getIndicatorResult(ind, dataValues) {
	            var denVal = 1,
	                numVal = 0;
	
	            if (ind.numerator) {
	
	                ind.numExpression = angular.copy(ind.numerator);
	                var matcher = ind.numExpression.match(dhis2.metadata.formulaRegex);
	
	                for (var k in matcher) {
	                    var match = matcher[k];
	
	                    // Remove brackets from expression to simplify extraction of identifiers
	
	                    var operand = match.replace(dhis2.metadata.operatorRegex, '');
	
	                    var isTotal = !!(operand.indexOf(dhis2.metadata.custSeparator) == -1);
	
	                    var value = '0';
	
	                    if (isTotal) {
	                        if (dataValues && dataValues[operand] && dataValues[operand].total) {
	                            value = dataValues[operand].total;
	                        }
	                    } else {
	                        var de = operand.substring(0, operand.indexOf(dhis2.metadata.custSeparator));
	                        var coc = operand.substring(operand.indexOf(dhis2.metadata.custSeparator) + 1, operand.length);
	
	                        if (dataValues && dataValues[de] && dataValues[de][coc] && dataValues[de][coc].value) {
	                            value = dataValues[de][coc].value;
	                        }
	                    }
	                    ind.numExpression = ind.numExpression.replace(match, value);
	                }
	            }
	
	            if (ind.denominator) {
	
	                ind.denExpression = angular.copy(ind.denominator);
	                var matcher = ind.denExpression.match(dhis2.metadata.formulaRegex);
	
	                for (var k in matcher) {
	                    var match = matcher[k];
	
	                    // Remove brackets from expression to simplify extraction of identifiers
	
	                    var operand = match.replace(dhis2.metadata.operatorRegex, '');
	
	                    var isTotal = !!(operand.indexOf(dhis2.metadata.custSeparator) == -1);
	
	                    var value = '0';
	
	                    if (isTotal) {
	                        if (dataValues[operand] && dataValues[operand].total) {
	                            value = dataValues[operand].total;
	                        }
	                    } else {
	                        var de = operand.substring(0, operand.indexOf(dhis2.metadata.custSeparator));
	                        var coc = operand.substring(operand.indexOf(dhis2.metadata.custSeparator) + 1, operand.length);
	
	                        if (dataValues && dataValues[de] && dataValues[de][coc] && dataValues[de][coc].value) {
	                            value = dataValues[de][coc].value;
	                        }
	                    }
	                    ind.denExpression = ind.denExpression.replace(match, value);
	                }
	            }
	
	            if (ind.numExpression) {
	                numVal = eval(ind.numExpression);
	                numVal = isNaN(numVal) ? '-' : roundTo(numVal, 1);
	            }
	
	            if (ind.denExpression) {
	                denVal = eval(ind.denExpression);
	                denVal = isNaN(denVal) ? '-' : roundTo(denVal, 1);
	            }
	
	            var factor = 1;
	
	            /*if( ind.indicatorType && ind.indicatorType.factor ){
	                factor = ind.indicatorType.factor;
	            }*/
	
	            return numVal / denVal * factor;
	        },
	        dummyPromise: function dummyPromise(res) {
	            var def = $q.defer();
	            def.resolve(res);
	            return def.promise;
	        },
	        getPerformanceOverviewHeaders: function getPerformanceOverviewHeaders() {
	
	            var ac = { order: 1, id: 'A', name: $translate.instant('achieved') + '  (>= 100%)', lRange: 100, printStyle: 'green-background', style: { "background-color": '#339D73 !important', "color": '#000' } };
	
	            var ma = { order: 2, id: 'M', name: $translate.instant('moderately_achieved') + '  (75-99%)', lRange: 75, hRange: 99, printStyle: 'yellow-background', style: { "background-color": '#F4CD4D !important', "color": '#000' } };
	
	            var na = { order: 3, id: 'N', name: $translate.instant('not_achieved') + '  (<75%)', hRange: 74, printStyle: 'red-background', style: { "background-color": '#CD615A !important', "color": '#000' } };
	
	            var nd = { order: 4, id: 'X', name: $translate.instant('no_data'), printStyle: 'grey-background', style: { "background-color": '#aaa !important', "color": '#000' } };
	
	            //var al = { id: 'All', name: $translate.instant('weighted_score'), style: {"background-color": '#fff !important', "color": '#000'}};
	
	            return [ac, ma, na, nd];
	        },
	        getFixedRanges: function getFixedRanges(isDescending) {
	            /*ranges = {
	                green: 15,
	                greenColor: '#339D73',
	                yellowStart: 15,
	                yellowEnd: 30,
	                yellowColor: '#F4CD4D',
	                red: 30,
	                redColor: '#CD615A'
	            };*/
	            var ranges = {};
	
	            if (isDescending) {
	                ranges = {
	                    green: 100,
	                    greenColor: '#339D73',
	                    yellowStart: 101,
	                    yellowEnd: 175,
	                    yellowColor: '#F4CD4D',
	                    red: 175,
	                    redColor: '#CD615A',
	                    greyColor: '#aaa'
	                };
	            } else {
	                ranges = {
	                    green: 100,
	                    greenColor: '#339D73',
	                    yellowStart: 75,
	                    yellowEnd: 99,
	                    yellowColor: '#F4CD4D',
	                    red: 74,
	                    redColor: '#CD615A',
	                    greyColor: '#aaa'
	                };
	            }
	            return ranges;
	        },
	        getFixedTrafficStyle: function getFixedTrafficStyle() {
	            var ranges = this.getFixedRanges();
	            var style = {
	                red: {
	                    inlineStyle: { "background-color": ranges.redColor },
	                    printStyle: 'red-background'
	                },
	                yellow: {
	                    inlineStyle: { "background-color": ranges.yellowColor },
	                    printStyle: 'yellow-background'
	                },
	                green: {
	                    inlineStyle: { "background-color": ranges.greenColor },
	                    printStyle: 'green-background'
	                },
	                grey: {
	                    inlineStyle: { "background-color": ranges.grey },
	                    printStyle: 'grey-background'
	                }
	            };
	            return style;
	        },
	        getTrafficColorForValue: function getTrafficColorForValue(val) {
	            var ranges = this.getFixedRanges();
	            var color = '',
	                style = {};
	            if (val === '' || val === null) {
	                color = '#aaa';
	                style.printStyle = 'grey-background';
	                style.inlineStyle = { "background-color": color };
	                return style;
	            }
	            val = Number(val);
	            if (val >= ranges.green) {
	                color = ranges.greenColor;
	                style.printStyle = 'green-background';
	            } else if (val >= ranges.yellowStart && val <= ranges.yellowEnd) {
	                color = ranges.yellowColor;
	                style.printStyle = 'yellow-background';
	            } else {
	                color = ranges.redColor;
	                style.printStyle = 'red-background';
	            }
	            style.inlineStyle = { "background-color": color };
	            return style;
	        },
	        getFormattedAnalyticsResponse: function getFormattedAnalyticsResponse(response) {
	            var data = response.data;
	            var reportData = [];
	            if (data && data.headers && data.headers.length > 0 && data.rows && data.rows.length > 0) {
	                for (var i = 0; i < data.rows.length; i++) {
	                    var r = {},
	                        d = data.rows[i];
	                    for (var j = 0; j < data.headers.length; j++) {
	
	                        if (data.headers[j].name === 'numerator' || data.headers[j].name === 'denominator') {
	                            d[j] = parseInt(d[j]);
	                        } else if (data.headers[j].name === 'value') {
	                            d[j] = parseFloat(d[j]);
	                        }
	
	                        r[data.headers[j].name] = d[j];
	                    }
	
	                    delete r.multiplier;
	                    delete r.factor;
	                    delete r.divisor;
	                    reportData.push(r);
	                }
	            }
	            return { data: reportData, metaData: data.metaData };
	        },
	        getDictionaryCompleteness: function getDictionaryCompleteness(item, headers, completeness) {
	            var size = 0;
	            angular.forEach(headers, function (header) {
	                if (item[header.id]) {
	                    size++;
	                }
	            });
	
	            item.completenessRate = '(' + size + ' / ' + headers.length + ')';
	
	            var isGreen = true;
	
	            for (var i = 0; i < completeness.green.length; i++) {
	                if (!item[completeness.green[i]] || item[completeness.green[i]] === '') {
	                    isGreen = false;
	                    break;
	                }
	            }
	
	            if (isGreen) {
	                item.completeness = 'green-background';
	                item.inlineStyle = { "background-color": '#339D73 !important' };
	                return item;
	            }
	
	            var isYellow = true;
	            for (var i = 0; i < completeness.yellow.length; i++) {
	                if (!item[completeness.yellow[i]] || item[completeness.yellow[i]] === '') {
	                    isYellow = false;
	                    break;
	                }
	            }
	
	            if (isYellow) {
	                item.completeness = 'yellow-background';
	                item.inlineStyle = { "background-color": '#F4CD4D !important' };
	                return item;
	            }
	
	            item.completeness = 'red-background';
	            item.inlineStyle = { "background-color": '#CD615A !important' };
	            return item;
	        }
	    };
	}])
	
	/* service for dealing with custom form */
	.service('CustomFormService', ["$translate", "NotificationService", function ($translate, NotificationService) {
	
	    return {
	        getForProgramStage: function getForProgramStage(programStage, programStageDataElements) {
	
	            var htmlCode = programStage.dataEntryForm ? programStage.dataEntryForm.htmlCode : null;
	
	            if (htmlCode) {
	                var inputRegex = /<input.*?\/>/g,
	                    match,
	                    inputFields = [],
	                    hasEventDate = false;
	
	                while (match = inputRegex.exec(htmlCode)) {
	                    inputFields.push(match[0]);
	                }
	
	                for (var i = 0; i < inputFields.length; i++) {
	                    var inputField = inputFields[i];
	
	                    var inputElement = $.parseHTML(inputField);
	                    var attributes = {};
	
	                    $(inputElement[0].attributes).each(function () {
	                        attributes[this.nodeName] = this.value;
	                    });
	
	                    var fieldId = '',
	                        newInputField;
	                    if (attributes.hasOwnProperty('id')) {
	
	                        if (attributes['id'] === 'executionDate') {
	                            fieldId = 'eventDate';
	                            hasEventDate = true;
	
	                            //name needs to be unique so that it can be used for validation in angularjs
	                            if (attributes.hasOwnProperty('name')) {
	                                attributes['name'] = fieldId;
	                            }
	
	                            newInputField = '<span class="hideInPrint"><input type="text" ' + this.getAttributesAsString(attributes) + ' ng-model="currentEvent.' + fieldId + '"' + ' input-field-id="' + fieldId + '"' + ' d2-date ' + ' d2-date-validator ' + ' max-date="' + 0 + '"' + ' placeholder="{{dhis2CalendarFormat.keyDateFormat}}" ' + ' ng-class="getInputNotifcationClass(prStDes.' + fieldId + '.dataElement.id,true)"' + ' blur-or-change="saveDatavalue(prStDes.' + fieldId + ')"' + ' ng-required="{{true}}"></span><span class="not-for-screen"><input type="text" value={{currentEvent.' + fieldId + '}}></span>';
	                        } else {
	                            fieldId = attributes['id'].substring(4, attributes['id'].length - 1).split("-")[1];
	
	                            //name needs to be unique so that it can be used for validation in angularjs
	                            if (attributes.hasOwnProperty('name')) {
	                                attributes['name'] = fieldId;
	                            }
	
	                            var prStDe = programStageDataElements[fieldId];
	
	                            if (prStDe && prStDe.dataElement && prStDe.dataElement.valueType) {
	
	                                var commonInputFieldProperty = this.getAttributesAsString(attributes) + ' ng-model="currentEvent.' + fieldId + '" ' + ' input-field-id="' + fieldId + '"' + ' ng-disabled="isHidden(prStDes.' + fieldId + '.dataElement.id) || selectedEnrollment.status===\'CANCELLED\' || selectedEnrollment.status===\'COMPLETED\' || currentEvent[uid]==\'uid\' || currentEvent.editingNotAllowed "' + ' ng-required="{{prStDes.' + fieldId + '.compulsory}}" ';
	
	                                //check if dataelement has optionset
	                                if (prStDe.dataElement.optionSetValue) {
	                                    var optionSetId = prStDe.dataElement.optionSet.id;
	                                    newInputField = '<span class="hideInPrint"><ui-select style="width: 100%;" theme="select2" ' + commonInputFieldProperty + ' on-select="saveDatavalue(prStDes.' + fieldId + ', outerForm.' + fieldId + ')" >' + '<ui-select-match ng-class="getInputNotifcationClass(prStDes.' + fieldId + '.dataElement.id, true)" allow-clear="true" placeholder="' + $translate.instant('select_or_search') + '">{{$select.selected.displayName || $select.selected}}</ui-select-match>' + '<ui-select-choices ' + ' repeat="option.displayName as option in optionSets.' + optionSetId + '.options | filter: $select.search | limitTo:maxOptionSize">' + '<span ng-bind-html="option.displayName | highlight: $select.search">' + '</span>' + '</ui-select-choices>' + '</ui-select></span><span class="not-for-screen"><input type="text" value={{currentEvent.' + fieldId + '}}></span>';
	                                } else {
	                                    //check data element type and generate corresponding angular input field
	                                    if (prStDe.dataElement.valueType === "NUMBER" || prStDe.dataElement.valueType === "INTEGER" || prStDe.dataElement.valueType === "INTEGER_POSITIVE" || prStDe.dataElement.valueType === "INTEGER_NEGATIVE" || prStDe.dataElement.valueType === "INTEGER_ZERO_OR_POSITIVE") {
	                                        newInputField = '<span class="hideInPrint"><input type="number" ' + ' d2-number-validator ' + ' ng-class="{{getInputNotifcationClass(prStDes.' + fieldId + '.dataElement.id, true)}}" ' + ' number-type="' + prStDe.dataElement.valueType + '" ' + ' ng-blur="saveDatavalue(prStDes.' + fieldId + ', outerForm.' + fieldId + ')"' + commonInputFieldProperty + '></span><span class="not-for-screen"><input type="text" value={{currentEvent.' + fieldId + '}}></span>';
	                                    } else if (prStDe.dataElement.valueType === "BOOLEAN") {
	                                        newInputField = '<span class="hideInPrint"><d2-radio-button ' + ' dh-required="prStDes.' + fieldId + '.compulsory" ' + ' dh-disabled="isHidden(prStDes.' + fieldId + '.dataElement.id) || selectedEnrollment.status===\'CANCELLED\' || selectedEnrollment.status===\'COMPLETED\' || currentEvent[uid]==\'uid\' || currentEvent.editingNotAllowed" ' + ' dh-value="currentEvent.' + fieldId + '" ' + ' dh-name="foo" ' + ' dh-current-element="currentElement" ' + ' dh-event="currentEvent.event" ' + ' dh-id="prStDes.' + fieldId + '.dataElement.id" ' + ' dh-click="saveDatavalue(prStDes.' + fieldId + ', currentEvent, value )" >' + ' </d2-radio-button></span> ' + '<span class="not-for-screen">' + '<label class="radio-inline"><input type="radio" value="true" ng-model="currentEvent.' + fieldId + '">{{\'yes\' | translate}}</label>' + '<label class="radio-inline"><input type="radio" value="false" ng-model="currentEvent.' + fieldId + '">{{\'no\' | translate}}</label>' + '</span>';
	                                    } else if (prStDe.dataElement.valueType === "DATE") {
	                                        var maxDate = prStDe.allowFutureDate ? '' : 0;
	                                        newInputField = '<span class="hideInPrint"><input type="text" ' + ' placeholder="{{dhis2CalendarFormat.keyDateFormat}}" ' + ' ng-class="{{getInputNotifcationClass(prStDes.' + fieldId + '.dataElement.id, true)}}" ' + ' d2-date ' + ' d2-date-validator ' + ' max-date="' + maxDate + '"' + ' blur-or-change="saveDatavalue(prStDes.' + fieldId + ', outerForm.' + fieldId + ')"' + commonInputFieldProperty + ' ></span><span class="not-for-screen"><input type="text" value={{currentEvent.' + fieldId + '}}></span>';
	                                    } else if (prStDe.dataElement.valueType === "TRUE_ONLY") {
	                                        newInputField = '<span class="hideInPrint"><input type="checkbox" ' + ' ng-class="{{getInputNotifcationClass(prStDes.' + fieldId + '.dataElement.id, true)}}" ' + ' ng-change="saveDatavalue(prStDes.' + fieldId + ', outerForm.' + fieldId + ')"' + commonInputFieldProperty + ' ></span><span class="not-for-screen"><input type="checkbox" ng-checked={{currentEvent.' + fieldId + '}}></span>';
	                                    } else if (prStDe.dataElement.valueType === "LONG_TEXT") {
	                                        newInputField = '<span class="hideInPrint"><textarea row="3" ' + ' ng-class="{{getInputNotifcationClass(prStDes.' + fieldId + '.dataElement.id, true)}}" ' + ' ng-blur="saveDatavalue(prStDes.' + fieldId + ', outerForm.' + fieldId + ')"' + commonInputFieldProperty + '></textarea></span><span class="not-for-screen"><textarea row="3" value={{currentEvent.' + fieldId + '}}></textarea></span>';
	                                    } else if (prStDe.dataElement.valueType === "FILE_RESOURCE") {
	                                        newInputField = '<span class="input-group hideInPrint">\n\
	                                                        <span ng-if="currentEvent.' + fieldId + '">\n\
	                                                            <a href ng-click="downloadFile(null, \'' + fieldId + '\', null)" title="fileNames[currentEvent.event][' + fieldId + ']" >{{fileNames[currentEvent.event][' + fieldId + '].length > 20 ? fileNames[currentEvent.event][' + fieldId + '].substring(0,20).concat(\'...\') : fileNames[currentEvent.event][' + fieldId + ']}}</a>\n\
	                                                        </span>\n\
	                                                        <span class="input-group-btn">\n\
	                                                            <span class="btn btn-grp btn-file">\n\
	                                                                <span ng-if="currentEvent.' + fieldId + '" title="{{\'delete\' | translate}}" d2-file-input-name="fileNames[currentEvent.event][' + fieldId + ']" d2-file-input-delete="currentEvent.' + fieldId + '">\n\
	                                                                    <a href ng-click="deleteFile(\'' + fieldId + '\')"><i class="fa fa-trash alert-danger"></i></a>\n\
	                                                                </span>\n\
	                                                                <span ng-if="!currentEvent.' + fieldId + '" title="{{\'upload\' | translate}}" >\n\
	                                                                    <i class="fa fa-upload"></i>\n\
	                                                                    <input  type="file" \n\
	                                                                            ' + this.getAttributesAsString(attributes) + '\n\
	                                                                            input-field-id="' + fieldId + '"\n\
	                                                                            d2-file-input-ps="currentStage"\n\
	                                                                            d2-file-input="currentEvent"\n\
	                                                                            d2-file-input-current-name="currentFileNames"\n\
	                                                                            d2-file-input-name="fileNames">\n\
	                                                                </span>\n\
	                                                            </span>\n\
	                                                        </span>\n\
	                                                    </span>';
	                                        '<span class="not-for-screen">' + '<input type="text" value={{currentEvent.' + fieldId + '}}' + '</span>';
	                                    } else if (prStDe.dataElement.valueType === "COORDINATE") {
	                                        newInputField = '<span class="hideInPrint"><d2-map ' + ' id=" ' + fieldId + '" ' + ' d2-object="currentEvent" ' + ' d2-coordinate-format="\'TEXT\'" ' + ' d2-disabled="isHidden(prStDes.' + fieldId + '.dataElement.id) || selectedEnrollment.status===\'CANCELLED\' || selectedEnrollment.status===\'COMPLETED\' || currentEvent[uid]==\'uid\' || currentEvent.editingNotAllowed" ' + ' d2-required="prStDes.' + fieldId + '.compulsory" ' + ' d2-function="saveDatavalue(arg1)" ' + ' d2-function-param-text="prStDes.' + fieldId + '" ' + ' d2-function-param-coordinate="\'LATLNG\'" > ' + '</d2-map></span>' + '<span class="not-for-screen">' + '<input type="text" value={{currentEvent.' + fieldId + '}}' + '</span>';;
	                                    } else if (prStDe.dataElement.valueType === "ORGANISATION_UNIT") {
	                                        newInputField = '<span class="hideInPrint"><d2-org-unit-tree ' + ' selected-org-unit="selectedOrgUnit" ' + ' id="{{prStDes.' + fieldId + '.dataElement.id}}" ' + ' d2-object="currentEvent" ' + ' d2-value="currentEvent.' + fieldId + '" ' + ' d2-disabled="isHidden(prStDes.' + fieldId + '.dataElement.id) || selectedEnrollment.status===\'CANCELLED\' || selectedEnrollment.status===\'COMPLETED\' || currentEvent[uid]==\'uid\' || currentEvent.editingNotAllowed" ' + ' d2-required="prStDes.' + fieldId + '.compulsory" ' + ' d2-function="saveDatavalue(prStDes.' + fieldId + ', currentEvent, value )" >' + ' </d2-org-unit-tree></span>' + '<span class="not-for-screen">' + '<input type="text" value={{currentEvent.' + fieldId + '}}' + '</span>';
	                                    } else if (prStDe.dataElement.valueType === "PHONE_NUMBER") {
	                                        newInputField = '<span class="hideInPrint"><input type="text" ' + ' ng-class="{{getInputNotifcationClass(prStDes.' + fieldId + '.dataElement.id, true)}}" ' + ' ng-blur="saveDatavalue(prStDes.' + fieldId + ', outerForm.' + fieldId + ')"' + commonInputFieldProperty + '></span><span class="not-for-screen"><input type="text" value={{currentEvent.' + fieldId + '}}></span>';
	                                    } else if (prStDe.dataElement.valueType === "TEXT") {
	                                        newInputField = '<span class="hideInPrint"><input type="text" ' + ' ng-class="{{getInputNotifcationClass(prStDes.' + fieldId + '.dataElement.id, true)}}" ' + ' ng-blur="saveDatavalue(prStDes.' + fieldId + ', outerForm.' + fieldId + ')"' + commonInputFieldProperty + '></span><span class="not-for-screen"><input type="text" value={{currentEvent.' + fieldId + '}}></span>';
	                                    } else {
	                                        newInputField = ' {{"unsupported_value_type" | translate }}: ' + prStDe.dataElement.valueType;
	                                    }
	                                }
	                            } else {
	                                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("custom_form_has_invalid_dataelement"));
	
	                                return;
	                            }
	                        }
	                        newInputField = newInputField + ' <span ng-messages="outerForm.' + fieldId + '.$error" class="required" ng-if="interacted(outerForm.' + fieldId + ')" ng-messages-include="../dhis-web-commons/angular-forms/error-messages.html"></span>';
	
	                        htmlCode = htmlCode.replace(inputField, newInputField);
	                    }
	                }
	                htmlCode = addPopOver(htmlCode, programStageDataElements);
	                return { htmlCode: htmlCode, hasEventDate: hasEventDate };
	            }
	            return null;
	        },
	        getForTrackedEntity: function getForTrackedEntity(trackedEntityForm, target) {
	            if (!trackedEntityForm) {
	                return null;
	            }
	
	            var htmlCode = trackedEntityForm.htmlCode ? trackedEntityForm.htmlCode : null;
	            if (htmlCode) {
	
	                var trackedEntityFormAttributes = [];
	                angular.forEach(trackedEntityForm.attributes, function (att) {
	                    trackedEntityFormAttributes[att.id] = att;
	                });
	
	                var inputRegex = /<input.*?\/>/g,
	                    match,
	                    inputFields = [];
	                var hasProgramDate = false;
	                while (match = inputRegex.exec(htmlCode)) {
	                    inputFields.push(match[0]);
	                }
	
	                for (var i = 0; i < inputFields.length; i++) {
	                    var inputField = inputFields[i];
	                    var inputElement = $.parseHTML(inputField);
	                    var attributes = {};
	
	                    $(inputElement[0].attributes).each(function () {
	                        attributes[this.nodeName] = this.value;
	                    });
	
	                    var attId = '',
	                        fieldName = '',
	                        newInputField,
	                        programId;
	                    if (attributes.hasOwnProperty('attributeid')) {
	                        attId = attributes['attributeid'];
	                        fieldName = attId;
	                        var att = trackedEntityFormAttributes[attId];
	
	                        if (att) {
	                            var attMaxDate = att.allowFutureDate ? '' : 0;
	                            var isTrackerAssociate = att.valueType === 'TRACKER_ASSOCIATE';
	                            var commonInputFieldProperty = ' name="' + fieldName + '"' + ' element-id="' + i + '"' + this.getAttributesAsString(attributes) + ' d2-focus-next-on-enter' + ' ng-model="selectedTei.' + attId + '" ' + ' attribute-data="attributesById.' + attId + '" ' + ' selected-program-id="selectedProgram.id" ' + ' selected-tei-id="selectedTei.trackedEntityInstance" ' + ' ng-disabled="editingDisabled || isHidden(attributesById.' + attId + '.id) || ' + isTrackerAssociate + '|| attributesById.' + attId + '.generated"' + ' d2-attribute-validator ' + ' ng-required=" ' + att.mandatory + '" ';
	
	                            //check if attribute has optionset
	                            if (att.optionSetValue) {
	                                var optionSetId = att.optionSet.id;
	                                newInputField = '<span class="hideInPrint"><ui-select theme="select2" ' + commonInputFieldProperty + '  on-select="teiValueUpdated(selectedTei,\'' + attId + '\')" >' + '<ui-select-match style="width:100%;" allow-clear="true" placeholder="' + $translate.instant('select_or_search') + '">{{$select.selected.displayName || $select.selected}}</ui-select-match>' + '<ui-select-choices ' + 'repeat="option.displayName as option in optionSets.' + optionSetId + '.options | filter: $select.search | limitTo:maxOptionSize">' + '<span ng-bind-html="option.displayName | highlight: $select.search"></span>' + '</ui-select-choices>' + '</ui-select></span><span class="not-for-screen"><input type="text" value={{selectedTei.' + attId + '}}></span>';
	                            } else {
	                                //check attribute type and generate corresponding angular input field
	                                if (att.valueType === "NUMBER" || att.valueType === "INTEGER" || att.valueType === "INTEGER_POSITIVE" || att.valueType === "INTEGER_NEGATIVE" || att.valueType === "INTEGER_ZERO_OR_POSITIVE") {
	                                    newInputField = '<span class="hideInPrint"><input type="number"' + ' d2-number-validator ' + ' number-type="' + att.valueType + '" ' + ' ng-blur="teiValueUpdated(selectedTei,\'' + attId + '\')" ' + commonInputFieldProperty + ' ></span><span class="not-for-screen"><input type="text" value={{selectedTei.' + attId + '}}></span>';
	                                } else if (att.valueType === "BOOLEAN") {
	                                    newInputField = '<span class="hideInPrint"><d2-radio-button ' + ' dh-required=" ' + (att.mandatory || att.unique) + '" ' + ' dh-disabled="editingDisabled || isHidden(attributesById.' + attId + '.id) || ' + isTrackerAssociate + '"' + ' dh-value="selectedTei.' + attId + '" ' + ' dh-name="foo" ' + ' dh-current-element="currentElement" ' + ' dh-event="currentEvent.event" ' + ' dh-id="' + attId + '" >' + ' </d2-radio-button></span>' + '<span class="not-for-screen">' + '<label class="radio-inline"><input type="radio" value="true" ng-model="selectedTei.' + attId + '">{{\'yes\' | translate}}</label>' + '<label class="radio-inline"><input type="radio" value="false" ng-model="selectedTei.' + attId + '">{{\'no\' | translate}}</label>' + '</span>';
	                                } else if (att.valueType === "DATE") {
	                                    newInputField = '<span class="hideInPrint"><input  type="text"' + ' placeholder="{{dhis2CalendarFormat.keyDateFormat}}" ' + ' max-date=" ' + attMaxDate + ' " ' + ' d2-date' + ' blur-or-change="teiValueUpdated(selectedTei,\'' + attId + '\')" ' + commonInputFieldProperty + ' ></span>' + '<span class="not-for-screen"><input type="text" value={{selectedTei.' + attId + '}}></span>';
	                                } else if (att.valueType === "TRUE_ONLY") {
	                                    newInputField = '<span class="hideInPrint"><input type="checkbox" ' + ' ng-change="teiValueUpdated(selectedTei,\'' + attId + '\')" ' + commonInputFieldProperty + ' ></span>' + '<span class="not-for-screen"><input type="checkbox" ng-checked={{selectedTei.' + attId + '}}></span>';
	                                } else if (att.valueType === "EMAIL") {
	                                    newInputField = '<span class="hideInPrint"><input type="email"' + ' ng-blur="teiValueUpdated(selectedTei,\'' + attId + '\')" ' + commonInputFieldProperty + ' >' + '<span class="not-for-screen"><input type="text" value={{selectedTei.' + attId + '}}></span>';
	                                } else if (att.valueType === "TRACKER_ASSOCIATE") {
	                                    newInputField = '<span class="input-group hideInPrint"> ' + ' <input type="text" ' + ' ng-blur="teiValueUpdated(selectedTei,\'' + attId + '\')" ' + commonInputFieldProperty + ' >' + '<span class="input-group-btn input-group-btn-no-width"> ' + '<button class="btn btn-grp default-btn-height" type="button" ' + ' title="{{\'add\' | translate}} {{attributesById.' + attId + '.displayName}}" ' + ' ng-if="!selectedTei.' + attId + '" ' + ' ng-class="{true: \'disable-clicks\'} [editingDisabled]" ' + ' ng-click="getTrackerAssociate(attributesById.' + attId + ', selectedTei.' + attId + ')" >' + '<i class="fa fa-external-link"></i> ' + '</button> ' + '<button class="btn btn-grp default-btn-height" type="button" ' + ' title="{{\'remove\' | translate}} {{attributesById.' + attId + '.displayName}}" ' + ' ng-if="selectedTei.' + attId + '" ' + ' ng-class="{true: \'disable-clicks\'} [editingDisabled]" ' + ' ng-click="selectedTei.' + attId + ' = null" >' + '<i class="fa fa-trash-o"></i> ' + '</button> ' + '</span>' + '</span>' + '<span class="not-for-screen"><input type="text" value={{selectedTei.' + attId + '}}></span>';
	                                } else if (att.valueType === "COORDINATE") {
	                                    newInputField = '<span class="hideInPrint"><d2-map ' + ' id=" ' + attId + '" ' + ' d2-object="selectedTei" ' + ' d2-value="selectedTei.' + attId + '" ' + ' d2-required=" ' + (att.mandatory || att.unique) + '" ' + ' d2-disabled="editingDisabled || isHidden(attributesById.' + attId + '.id) || ' + isTrackerAssociate + ' || attributesById.' + attId + '.generated"' + ' d2-coordinate-format="\'TEXT\'" > ' + '</d2-map></span>' + '<span class="not-for-screen"><input type="text" value={{selectedTei.' + attId + '}}></span>';
	                                } else if (att.valueType === "ORGANISATION_UNIT") {
	                                    newInputField = '<span class="hideInPrint"><d2-org-unit-tree ' + ' selected-org-unit="selectedOrgUnit" ' + ' id=" ' + attId + '" ' + ' d2-object="selectedTei" ' + ' d2-value="selectedTei.' + attId + '" ' + ' d2-required=" ' + (att.mandatory || att.unique) + '" ' + ' d2-disabled="editingDisabled || isHidden(attributesById.' + attId + '.id) || ' + isTrackerAssociate + ' || attributesById.' + attId + '.generated"' + ' d2-function="teiValueUpdated()" >' + ' </d2-org-unit-tree></span>' + '<span class="not-for-screen"><input type="text" value={{selectedTei.' + attId + '}}></span>';
	                                } else if (att.valueType === "LONG_TEXT") {
	                                    newInputField = '<span><textarea row ="3" ' + ' ng-blur="teiValueUpdated(selectedTei,\'' + attId + '\')" ' + commonInputFieldProperty + ' ></textarea></span>';
	                                } else if (att.valueType === "TEXT") {
	                                    newInputField = '<input type="text" ' + ' ng-blur="teiValueUpdated(selectedTei,\'' + attId + '\')" ' + commonInputFieldProperty + '>';
	                                } else if (att.valueType === "PHONE_NUMBER") {
	                                    newInputField = '<input type="text" ' + ' ng-blur="teiValueUpdated(selectedTei,\'' + attId + '\')" ' + commonInputFieldProperty + '>';
	                                } else {
	                                    newInputField = ' {{"unsupported_value_type" | translate }} ' + att.valueType;
	                                }
	                            }
	                        } else {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("custom_form_has_invalid_attribute"));
	                            return;
	                        }
	                    }
	
	                    if (attributes.hasOwnProperty('programid')) {
	                        hasProgramDate = true;
	                        programId = attributes['programid'];
	                        if (programId === 'enrollmentDate') {
	                            fieldName = 'dateOfEnrollment';
	                            var enMaxDate = trackedEntityForm.selectEnrollmentDatesInFuture ? '' : 0;
	                            newInputField = '<input type="text"' + ' name="' + fieldName + '"' + ' element-id="' + i + '"' + this.getAttributesAsString(attributes) + ' d2-focus-next-on-enter' + ' placeholder="{{dhis2CalendarFormat.keyDateFormat}}" ' + ' ng-model="selectedEnrollment.dateOfEnrollment" ' + ' ng-disabled="\'' + target + '\' === \'PROFILE\'"' + ' d2-date' + ' max-date="' + enMaxDate + '"' + ' ng-required="true">';
	                        }
	                        if (programId === 'dateOfIncident' && trackedEntityForm.displayIncidentDate) {
	                            fieldName = 'dateOfIncident';
	                            var inMaxDate = trackedEntityForm.selectIncidentDatesInFuture ? '' : 0;
	                            newInputField = '<input type="text"' + ' name="' + fieldName + '"' + ' element-id="' + i + '"' + this.getAttributesAsString(attributes) + ' d2-focus-next-on-enter' + ' placeholder="{{dhis2CalendarFormat.keyDateFormat}}" ' + ' ng-model="selectedEnrollment.dateOfIncident" ' + ' ng-disabled="\'' + target + '\' === \'PROFILE\'"' + ' d2-date ' + ' max-date="' + inMaxDate + '">';
	                        }
	                    }
	
	                    newInputField = newInputField + ' <span ng-messages="outerForm.' + fieldName + '.$error" class="required" ng-if="interacted(outerForm.' + fieldName + ')" ng-messages-include="../dhis-web-commons/angular-forms/error-messages.html"></span>';
	
	                    htmlCode = htmlCode.replace(inputField, newInputField);
	                }
	                htmlCode = addPopOver(htmlCode, trackedEntityFormAttributes);
	                return { htmlCode: htmlCode, hasProgramDate: hasProgramDate };
	            }
	            return null;
	        },
	        getAttributesAsString: function getAttributesAsString(attributes) {
	            if (attributes) {
	                var attributesAsString = '';
	                for (var prop in attributes) {
	                    if (prop !== 'value') {
	                        attributesAsString += prop + '="' + attributes[prop] + '" ';
	                    }
	                }
	                return attributesAsString;
	            }
	            return null;
	        }
	    };
	    /* This function inserts the d2-pop-over attributes into the tags containing d2-input-label attribute to
	     * add description and url popover to those tags */
	    function addPopOver(htmlCodeToInsertPopOver, popOverContent) {
	
	        var inputRegex = /<span.*?\/span>/g;
	        var match, tagToInsertPopOver, tagWithPopOver;
	        var htmlCode = htmlCodeToInsertPopOver;
	        while (match = inputRegex.exec(htmlCodeToInsertPopOver)) {
	            if (match[0].indexOf("d2-input-label") > -1) {
	                tagToInsertPopOver = match[0];
	                tagWithPopOver = insertPopOverSpanToTag(tagToInsertPopOver, popOverContent);
	                htmlCode = htmlCode.replace(tagToInsertPopOver, tagWithPopOver);
	            }
	        }
	        return htmlCode;
	    }
	
	    function insertPopOverSpanToTag(tagToInsertPopOverSpan, popOverContent) {
	
	        var attribute, attributes, fieldId, description, url, element, attValue;
	        var popOverSpanElement, tagWithPopOverSpan;
	
	        element = $(tagToInsertPopOverSpan);
	        attributes = element[0].attributes;
	
	        for (var index = 0; index < attributes.length; index++) {
	            if (attributes[index].name === "d2-input-label") {
	                attValue = attributes[index].value;
	                break;
	            }
	        }
	        if (attValue) {
	            popOverSpanElement = $('<span></span>');
	            popOverSpanElement.attr("d2-pop-over", "");
	            popOverSpanElement.attr("details", "{{'details'| translate}}");
	            popOverSpanElement.attr("trigger", "click");
	            popOverSpanElement.attr("placement", "right");
	            popOverSpanElement.attr("class", "popover-label");
	
	            if (attValue.indexOf("attributeId.") > -1) {
	                fieldId = attValue.split(".")[1];
	                description = popOverContent[fieldId].description ? "'" + popOverContent[fieldId].description + "'" : "undefined";
	                popOverSpanElement.attr("content", "{description: " + description + "}");
	                popOverSpanElement.attr("template", "attribute-details.html");
	            } else {
	                fieldId = attValue.split("-")[1];
	                description = popOverContent[fieldId].dataElement.description ? "'" + popOverContent[fieldId].dataElement.description + "'" : "undefined";
	                url = popOverContent[fieldId].dataElement.url ? "'" + popOverContent[fieldId].dataElement.url + "'" : "undefined";
	                popOverSpanElement.attr("content", "{description: " + description + ", url:" + url + "}");
	                popOverSpanElement.attr("template", "dataelement-details.html");
	            }
	            popOverSpanElement.html("<a href title=\"{{'details'| translate}}\" class=\"wrap-text\" tabindex=\"-1\">" + element.html() + "</a>");
	            element.html(popOverSpanElement[0].outerHTML.replace('d2-pop-over=""', 'd2-pop-over'));
	            tagWithPopOverSpan = element[0].outerHTML;
	        }
	        return tagWithPopOverSpan;
	    }
	}])
	
	/* Context menu for grid*/
	.service('ContextMenuSelectedItem', function () {
	    this.selectedItem = '';
	
	    this.setSelectedItem = function (selectedItem) {
	        this.selectedItem = selectedItem;
	    };
	
	    this.getSelectedItem = function () {
	        return this.selectedItem;
	    };
	})
	
	/* Modal service for user interaction */
	.service('ModalService', ['$modal', function ($modal) {
	
	    var modalDefaults = {
	        backdrop: true,
	        keyboard: true,
	        modalFade: true,
	        templateUrl: 'views/modal.html'
	    };
	
	    var modalOptions = {
	        closeButtonText: 'Close',
	        actionButtonText: 'OK',
	        headerText: 'Proceed?',
	        bodyText: 'Perform this action?'
	    };
	
	    this.showModal = function (customModalDefaults, customModalOptions) {
	        if (!customModalDefaults) customModalDefaults = {};
	        customModalDefaults.backdrop = 'static';
	        return this.show(customModalDefaults, customModalOptions);
	    };
	
	    this.show = function (customModalDefaults, customModalOptions) {
	        //Create temp objects to work with since we're in a singleton service
	        var tempModalDefaults = {};
	        var tempModalOptions = {};
	
	        //Map angular-ui modal custom defaults to modal defaults defined in service
	        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
	
	        //Map modal.html $scope custom properties to defaults defined in service
	        angular.extend(tempModalOptions, modalOptions, customModalOptions);
	
	        if (!tempModalDefaults.controller) {
	            tempModalDefaults.controller = function ($scope, $modalInstance) {
	                $scope.modalOptions = tempModalOptions;
	                $scope.modalOptions.ok = function (result) {
	                    $modalInstance.close(result);
	                };
	                $scope.modalOptions.close = function (result) {
	                    $modalInstance.dismiss('cancel');
	                };
	            };
	        }
	
	        return $modal.open(tempModalDefaults).result;
	    };
	}])
	
	/* Dialog service for user interaction */
	.service('DialogService', ['$modal', function ($modal) {
	
	    var dialogDefaults = {
	        backdrop: true,
	        keyboard: true,
	        backdropClick: true,
	        modalFade: true,
	        templateUrl: 'views/dialog.html'
	    };
	
	    var dialogOptions = {
	        closeButtonText: 'close',
	        actionButtonText: 'ok',
	        headerText: 'dhis2_tracker',
	        bodyText: 'Perform this action?'
	    };
	
	    this.showDialog = function (customDialogDefaults, customDialogOptions) {
	        if (!customDialogDefaults) customDialogDefaults = {};
	        customDialogDefaults.backdropClick = false;
	        return this.show(customDialogDefaults, customDialogOptions);
	    };
	
	    this.show = function (customDialogDefaults, customDialogOptions) {
	        //Create temp objects to work with since we're in a singleton service
	        var tempDialogDefaults = {};
	        var tempDialogOptions = {};
	
	        //Map angular-ui modal custom defaults to modal defaults defined in service
	        angular.extend(tempDialogDefaults, dialogDefaults, customDialogDefaults);
	
	        //Map modal.html $scope custom properties to defaults defined in service
	        angular.extend(tempDialogOptions, dialogOptions, customDialogOptions);
	
	        if (!tempDialogDefaults.controller) {
	            tempDialogDefaults.controller = function ($scope, $modalInstance) {
	                $scope.dialogOptions = tempDialogOptions;
	                $scope.dialogOptions.ok = function (result) {
	                    $modalInstance.close(result);
	                };
	            };
	        }
	
	        return $modal.open(tempDialogDefaults).result;
	    };
	}]).service('NotificationService', ["DialogService", function (DialogService) {
	    this.showNotifcationDialog = function (errorMsgheader, errorMsgBody) {
	        var dialogOptions = {
	            headerText: errorMsgheader,
	            bodyText: errorMsgBody
	        };
	        DialogService.showDialog({}, dialogOptions);
	    };
	
	    this.showNotifcationWithOptions = function (dialogDefaults, dialogOptions) {
	        DialogService.showDialog(dialogDefaults, dialogOptions);
	    };
	}]).service('Paginator', function () {
	    this.page = 1;
	    this.pageSize = 50;
	    this.itemCount = 0;
	    this.pageCount = 0;
	    this.toolBarDisplay = 5;
	
	    this.setPage = function (page) {
	        if (page > this.getPageCount()) {
	            return;
	        }
	
	        this.page = page;
	    };
	
	    this.getPage = function () {
	        return this.page;
	    };
	
	    this.setPageSize = function (pageSize) {
	        this.pageSize = pageSize;
	    };
	
	    this.getPageSize = function () {
	        return this.pageSize;
	    };
	
	    this.setItemCount = function (itemCount) {
	        this.itemCount = itemCount;
	    };
	
	    this.getItemCount = function () {
	        return this.itemCount;
	    };
	
	    this.setPageCount = function (pageCount) {
	        this.pageCount = pageCount;
	    };
	
	    this.getPageCount = function () {
	        return this.pageCount;
	    };
	
	    this.setToolBarDisplay = function (toolBarDisplay) {
	        this.toolBarDisplay = toolBarDisplay;
	    };
	
	    this.getToolBarDisplay = function () {
	        return this.toolBarDisplay;
	    };
	
	    this.lowerLimit = function () {
	        var pageCountLimitPerPageDiff = this.getPageCount() - this.getToolBarDisplay();
	
	        if (pageCountLimitPerPageDiff < 0) {
	            return 0;
	        }
	
	        if (this.getPage() > pageCountLimitPerPageDiff + 1) {
	            return pageCountLimitPerPageDiff;
	        }
	
	        var low = this.getPage() - (Math.ceil(this.getToolBarDisplay() / 2) - 1);
	
	        return Math.max(low, 0);
	    };
	}).service('GridColumnService', ["$http", "$q", "DHIS2URL", "$translate", "SessionStorageService", "NotificationService", function ($http, $q, DHIS2URL, $translate, SessionStorageService, NotificationService) {
	    var GRIDCOLUMNS_URL = DHIS2URL + '/api/userDataStore/gridColumns/';
	    return {
	        columnExists: function columnExists(cols, id) {
	            var colExists = false;
	            if (!angular.isObject(cols) || !id || angular.isObject(cols) && !cols.length) {
	                return colExists;
	            }
	
	            for (var i = 0; i < cols.length && !colExists; i++) {
	                if (cols[i].id === id) {
	                    colExists = true;
	                }
	            }
	            return colExists;
	        },
	        set: function set(gridColumns, name) {
	            var deferred = $q.defer();
	            var httpMessage = {
	                method: "put",
	                url: GRIDCOLUMNS_URL + name,
	                data: { "gridColumns": gridColumns },
	                headers: { 'Content-Type': 'application/json;charset=UTF-8' }
	            };
	
	            $http(httpMessage).then(function (response) {
	                deferred.resolve(response.data);
	            }, function (error) {
	                httpMessage.method = "post";
	                $http(httpMessage).then(function (response) {
	                    deferred.resolve(response.data);
	                }, function (error) {
	                    if (error && error.data) {
	                        deferred.resolve(error.data);
	                    } else {
	                        deferred.resolve(null);
	                    }
	                });
	            });
	            return deferred.promise;
	        },
	        get: function get(name) {
	            var promise = $http.get(GRIDCOLUMNS_URL + name).then(function (response) {
	                if (response && response.data && response.data.gridColumns) {
	                    SessionStorageService.set(name, { id: name, columns: response.data.gridColumns });
	                    return response.data.gridColumns;
	                } else {
	                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("gridColumns_invalid"));
	                    return null;
	                }
	            }, function (error) {
	                var gridColumnsFromSessionStore = SessionStorageService.get(name);
	                if (gridColumnsFromSessionStore && gridColumnsFromSessionStore.columns) {
	                    return gridColumnsFromSessionStore.columns;
	                }
	                return null;
	            });
	            return promise;
	        }
	    };
	}])
	
	/* Service for uploading/downloading file */
	.service('FileService', ["$http", "DHIS2URL", function ($http, DHIS2URL) {
	
	    return {
	        get: function get(uid) {
	            var promise = $http.get(DHIS2URL + '/api/fileResources/' + uid).then(function (response) {
	                return response.data;
	            }, function (error) {
	                return null;
	            });
	            return promise;
	        },
	        download: function download(fileName) {
	            var promise = $http.get(fileName).then(function (response) {
	                return response.data;
	            }, function (error) {
	                return null;
	            });
	            return promise;
	        },
	        upload: function upload(file) {
	            var formData = new FormData();
	            formData.append('file', file);
	            var headers = { transformRequest: angular.identity, headers: { 'Content-Type': undefined } };
	            var promise = $http.post(DHIS2URL + '/api/fileResources', formData, headers).then(function (response) {
	                return response.data;
	            }, function (error) {
	                return null;
	            });
	            return promise;
	        }
	    };
	}])
	/* Returns a function for getting rules for a specific program */
	.factory('RulesFactory', ["$q", "MetaDataFactory", "$filter", function ($q, MetaDataFactory, $filter) {
	    var staticReplacements = [{ regExp: new RegExp("([^\w\d])(and)([^\w\d])", "gi"), replacement: "$1&&$3" }, { regExp: new RegExp("([^\w\d])(or)([^\w\d])", "gi"), replacement: "$1||$3" }, { regExp: new RegExp("V{execution_date}", "g"), replacement: "V{event_date}" }];
	
	    var performStaticReplacements = function performStaticReplacements(expression) {
	        angular.forEach(staticReplacements, function (staticReplacement) {
	            expression = expression.replace(staticReplacement.regExp, staticReplacement.replacement);
	        });
	
	        return expression;
	    };
	
	    return {
	        loadRules: function loadRules(programUid) {
	            var def = $q.defer();
	            MetaDataFactory.getAll('constants').then(function (constants) {
	                MetaDataFactory.getByProgram('programIndicators', programUid).then(function (pis) {
	                    var variables = [];
	                    var programRules = [];
	                    angular.forEach(pis, function (pi) {
	                        if (pi.displayInForm) {
	                            var newAction = {
	                                id: pi.id,
	                                content: pi.displayDescription ? pi.displayDescription : pi.displayName,
	                                data: pi.expression,
	                                programRuleActionType: 'DISPLAYKEYVALUEPAIR',
	                                location: 'indicators'
	                            };
	                            var newRule = {
	                                displayName: pi.displayName,
	                                id: pi.id,
	                                shortname: pi.shortname,
	                                code: pi.code,
	                                program: pi.program,
	                                description: pi.description,
	                                condition: pi.filter ? pi.filter : 'true',
	                                programRuleActions: [newAction]
	                            };
	
	                            programRules.push(newRule);
	
	                            var variablesInCondition = newRule.condition.match(/[A#]{\w+.?\w*}/g);
	                            var variablesInData = newAction.data.match(/[A#]{\w+.?\w*}/g);
	                            var valueCountPresent = newRule.condition.indexOf("V{value_count}") >= 0 || newAction.data.indexOf("V{value_count}") >= 0;
	                            var positiveValueCountPresent = newRule.condition.indexOf("V{zero_pos_value_count}") >= 0 || newAction.data.indexOf("V{zero_pos_value_count}") >= 0;
	                            var variableObjectsCurrentExpression = [];
	
	                            var pushDirectAddressedVariable = function pushDirectAddressedVariable(variableWithCurls) {
	                                var variableName = $filter('trimvariablequalifiers')(variableWithCurls);
	                                var variableNameParts = variableName.split('.');
	
	                                var newVariableObject;
	
	                                if (variableNameParts.length === 2) {
	                                    //this is a programstage and dataelement specification. translate to program variable:
	                                    newVariableObject = {
	                                        displayName: variableName,
	                                        programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT',
	                                        dataElement: variableNameParts[1],
	                                        program: programUid,
	                                        useCodeForOptionSet: true
	                                    };
	                                } else if (variableNameParts.length === 1) {
	                                    //This is an attribute - let us translate to program variable:
	                                    newVariableObject = {
	                                        displayName: variableName,
	                                        programRuleVariableSourceType: 'TEI_ATTRIBUTE',
	                                        trackedEntityAttribute: variableNameParts[0],
	                                        program: programUid,
	                                        useCodeForOptionSet: true
	                                    };
	                                }
	
	                                variables.push(newVariableObject);
	
	                                return newVariableObject;
	                            };
	
	                            angular.forEach(variablesInCondition, function (variableInCondition) {
	                                var pushed = pushDirectAddressedVariable(variableInCondition);
	                            });
	
	                            angular.forEach(variablesInData, function (variableInData) {
	                                var pushed = pushDirectAddressedVariable(variableInData);
	
	                                //We only count the number of values in the data part of the rule
	                                //(Called expression in program indicators)
	                                variableObjectsCurrentExpression.push(pushed);
	                            });
	
	                            //Change expression or data part of the rule to match the program rules execution model
	                            if (valueCountPresent) {
	                                var valueCountText;
	                                angular.forEach(variableObjectsCurrentExpression, function (variableCurrentRule) {
	                                    if (valueCountText) {
	                                        //This is not the first value in the value count part of the expression.
	                                        valueCountText += ' + d2:count(\'' + variableCurrentRule.displayName + '\')';
	                                    } else {
	                                        //This is the first part value in the value count expression:
	                                        valueCountText = '(d2:count(\'' + variableCurrentRule.displayName + '\')';
	                                    }
	                                });
	                                //To finish the value count expression we need to close the paranthesis:
	                                valueCountText += ')';
	
	                                //Replace all occurrences of value counts in both the data and expression:
	                                newRule.condition = newRule.condition.replace(new RegExp("V{value_count}", 'g'), valueCountText);
	                                newAction.data = newAction.data.replace(new RegExp("V{value_count}", 'g'), valueCountText);
	                            }
	                            if (positiveValueCountPresent) {
	                                var zeroPosValueCountText;
	                                angular.forEach(variableObjectsCurrentExpression, function (variableCurrentRule) {
	                                    if (zeroPosValueCountText) {
	                                        //This is not the first value in the value count part of the expression.
	                                        zeroPosValueCountText += '+ d2:countifzeropos(\'' + variableCurrentRule.displayName + '\')';
	                                    } else {
	                                        //This is the first part value in the value count expression:
	                                        zeroPosValueCountText = '(d2:countifzeropos(\'' + variableCurrentRule.displayName + '\')';
	                                    }
	                                });
	                                //To finish the value count expression we need to close the paranthesis:
	                                zeroPosValueCountText += ')';
	
	                                //Replace all occurrences of value counts in both the data and expression:
	                                newRule.condition = newRule.condition.replace(new RegExp("V{zero_pos_value_count}", 'g'), zeroPosValueCountText);
	                                newAction.data = newAction.data.replace(new RegExp("V{zero_pos_value_count}", 'g'), zeroPosValueCountText);
	                            }
	
	                            newAction.data = performStaticReplacements(newAction.data);
	                            newRule.condition = performStaticReplacements(newRule.condition);
	                        }
	                    });
	
	                    var programIndicators = { rules: programRules, variables: variables };
	
	                    MetaDataFactory.getByProgram('programValidations', programUid).then(function (programValidations) {
	                        MetaDataFactory.getByProgram('programRuleVariables', programUid).then(function (programVariables) {
	                            MetaDataFactory.getByProgram('programRules', programUid).then(function (prs) {
	                                var programRules = [];
	                                angular.forEach(prs, function (rule) {
	                                    rule.actions = [];
	                                    rule.programStageId = rule.programStage && rule.programStage.id ? rule.programStage.id : null;
	                                    programRules.push(rule);
	                                });
	                                def.resolve({ constants: constants, programIndicators: programIndicators, programValidations: programValidations, programVariables: programVariables, programRules: programRules });
	                            });
	                        });
	                    });
	                });
	            });
	            return def.promise;
	        }
	    };
	}])
	/* service for building variables based on the data in users fields */
	.service('VariableService', ["DateUtils", "OptionSetService", "$filter", "$log", function (DateUtils, OptionSetService, $filter, $log) {
	    var processSingleValue = function processSingleValue(processedValue, valueType) {
	        //First clean away single or double quotation marks at the start and end of the variable name.
	        processedValue = $filter('trimquotes')(processedValue);
	
	        //Append single quotation marks in case the variable is of text or date type:
	        if (valueType === 'LONG_TEXT' || valueType === 'TEXT' || valueType === 'DATE' || valueType === 'OPTION_SET') {
	            if (processedValue) {
	                processedValue = "'" + processedValue + "'";
	            } else {
	                processedValue = "''";
	            }
	        } else if (valueType === 'BOOLEAN' || valueType === 'TRUE_ONLY') {
	            if (processedValue && eval(processedValue)) {
	                processedValue = true;
	            } else {
	                processedValue = false;
	            }
	        } else if (valueType === "INTEGER" || valueType === "NUMBER" || valueType === "INTEGER_POSITIVE" || valueType === "INTEGER_NEGATIVE" || valueType === "INTEGER_ZERO_OR_POSITIVE" || valueType === "PERCENTAGE") {
	            if (processedValue) {
	                processedValue = Number(processedValue);
	            } else {
	                processedValue = 0;
	            }
	        } else {
	            $log.warn("unknown datatype:" + valueType);
	        }
	
	        return processedValue;
	    };
	
	    var pushVariable = function pushVariable(variables, variablename, varValue, allValues, varType, variablefound, variablePrefix, variableEventDate, useCodeForOptionSet) {
	
	        var processedValues = [];
	
	        angular.forEach(allValues, function (alternateValue) {
	            processedValues.push(processSingleValue(alternateValue, varType));
	        });
	
	        variables[variablename] = {
	            variableValue: processSingleValue(varValue, varType),
	            useCodeForOptionSet: useCodeForOptionSet,
	            variableType: varType,
	            hasValue: variablefound,
	            variableEventDate: variableEventDate,
	            variablePrefix: variablePrefix,
	            allValues: processedValues
	        };
	        return variables;
	    };
	
	    var getDataElementValueOrCodeForValueInternal = function getDataElementValueOrCodeForValueInternal(useCodeForOptionSet, value, dataElementId, allDes, optionSets) {
	        return useCodeForOptionSet && allDes && allDes[dataElementId].dataElement.optionSet ? OptionSetService.getCode(optionSets[allDes[dataElementId].dataElement.optionSet.id].options, value) : value;
	    };
	
	    return {
	        processValue: function processValue(value, type) {
	            return processSingleValue(value, type);
	        },
	        getDataElementValueOrCode: function getDataElementValueOrCode(useCodeForOptionSet, event, dataElementId, allDes, optionSets) {
	            return getDataElementValueOrCodeForValueInternal(useCodeForOptionSet, event[dataElementId], dataElementId, allDes, optionSets);
	        },
	        getDataElementValueOrCodeForValue: function getDataElementValueOrCodeForValue(useCodeForOptionSet, value, dataElementId, allDes, optionSets) {
	            return getDataElementValueOrCodeForValueInternal(useCodeForOptionSet, value, dataElementId, allDes, optionSets);
	        },
	        getVariables: function getVariables(allProgramRules, executingEvent, evs, allDes, selectedEntity, selectedEnrollment, optionSets) {
	
	            var variables = {};
	
	            var programVariables = allProgramRules.programVariables;
	
	            programVariables = programVariables.concat(allProgramRules.programIndicators.variables);
	
	            angular.forEach(programVariables, function (programVariable) {
	                var dataElementId = programVariable.dataElement;
	                if (programVariable.dataElement && programVariable.dataElement.id) {
	                    dataElementId = programVariable.dataElement.id;
	                }
	
	                var trackedEntityAttributeId = programVariable.trackedEntityAttribute;
	                if (programVariable.trackedEntityAttribute && programVariable.trackedEntityAttribute.id) {
	                    trackedEntityAttributeId = programVariable.trackedEntityAttribute.id;
	                }
	
	                var programStageId = programVariable.programStage;
	                if (programVariable.programStage && programVariable.programStage.id) {
	                    programStageId = programVariable.programStage.id;
	                }
	
	                var valueFound = false;
	                //If variable evs is not defined, it means the rules is run before any events is registered, skip the types that require an event
	                if (programVariable.programRuleVariableSourceType === "DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE" && evs && evs.byStage) {
	                    if (programStageId) {
	                        var allValues = [];
	                        angular.forEach(evs.byStage[programStageId], function (event) {
	                            if (event[dataElementId] !== null) {
	                                if (angular.isDefined(event[dataElementId]) && event[dataElementId] !== "") {
	                                    var value = getDataElementValueOrCodeForValueInternal(programVariable.useCodeForOptionSet, event[dataElementId], dataElementId, allDes, optionSets);
	
	                                    allValues.push(value);
	                                    valueFound = true;
	                                    variables = pushVariable(variables, programVariable.displayName, value, allValues, allDes[dataElementId].dataElement.valueType, valueFound, '#', event.eventDate, programVariable.useCodeForOptionSet);
	                                }
	                            }
	                        });
	                    } else {
	                        $log.warn("Variable id:'" + programVariable.id + "' name:'" + programVariable.displayName + "' does not have a programstage defined," + " despite that the variable has sourcetype DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE");
	                    }
	                } else if (programVariable.programRuleVariableSourceType === "DATAELEMENT_NEWEST_EVENT_PROGRAM" && evs) {
	                    var allValues = [];
	                    angular.forEach(evs.all, function (event) {
	                        if (angular.isDefined(event[dataElementId]) && event[dataElementId] !== null && event[dataElementId] !== "") {
	                            var value = getDataElementValueOrCodeForValueInternal(programVariable.useCodeForOptionSet, event[dataElementId], dataElementId, allDes, optionSets);
	
	                            allValues.push(value);
	                            valueFound = true;
	                            variables = pushVariable(variables, programVariable.displayName, value, allValues, allDes[dataElementId].dataElement.valueType, valueFound, '#', event.eventDate, programVariable.useCodeForOptionSet);
	                        }
	                    });
	                } else if (programVariable.programRuleVariableSourceType === "DATAELEMENT_CURRENT_EVENT" && evs) {
	                    if (angular.isDefined(executingEvent[dataElementId]) && executingEvent[dataElementId] !== null && executingEvent[dataElementId] !== "") {
	                        var value = getDataElementValueOrCodeForValueInternal(programVariable.useCodeForOptionSet, executingEvent[dataElementId], dataElementId, allDes, optionSets);
	
	                        valueFound = true;
	                        variables = pushVariable(variables, programVariable.displayName, value, null, allDes[dataElementId].dataElement.valueType, valueFound, '#', executingEvent.eventDate, programVariable.useCodeForOptionSet);
	                    }
	                } else if (programVariable.programRuleVariableSourceType === "DATAELEMENT_PREVIOUS_EVENT" && evs) {
	                    //Only continue checking for a value if there is more than one event.
	                    if (evs.all && evs.all.length > 1) {
	                        var allValues = [];
	                        var previousvalue = null;
	                        var previousEventDate = null;
	                        var currentEventPassed = false;
	                        for (var i = 0; i < evs.all.length; i++) {
	                            //Store the values as we iterate through the stages
	                            //If the event[i] is not the current event, it is older(previous). Store the previous value if it exists
	                            if (!currentEventPassed && evs.all[i] !== executingEvent && angular.isDefined(evs.all[i][dataElementId]) && evs.all[i][dataElementId] !== "") {
	                                previousvalue = getDataElementValueOrCodeForValueInternal(programVariable.useCodeForOptionSet, evs.all[i][dataElementId], dataElementId, allDes, optionSets);
	                                previousEventDate = evs.all[i].eventDate;
	                                allValues.push(value);
	                                valueFound = true;
	                            } else if (evs.all[i] === executingEvent) {
	                                //We have iterated to the newest event - store the last collected variable value - if any is found:
	                                if (valueFound) {
	                                    variables = pushVariable(variables, programVariable.displayName, previousvalue, allValues, allDes[dataElementId].dataElement.valueType, valueFound, '#', previousEventDate, programVariable.useCodeForOptionSet);
	                                }
	                                //Set currentEventPassed, ending the iteration:
	                                currentEventPassed = true;
	                            }
	                        }
	                    }
	                } else if (programVariable.programRuleVariableSourceType === "TEI_ATTRIBUTE") {
	                    angular.forEach(selectedEntity.attributes, function (attribute) {
	                        if (!valueFound) {
	                            if (attribute.attribute === trackedEntityAttributeId && angular.isDefined(attribute.value) && attribute.value !== null && attribute.value !== "") {
	                                valueFound = true;
	                                //In registration, the attribute type is found in .type, while in data entry the same data is found in .valueType.
	                                //Handling here, but planning refactor in registration so it will always be .valueType
	                                variables = pushVariable(variables, programVariable.displayName, programVariable.useCodeForOptionSet ? angular.isDefined(attribute.optionSetCode) ? attribute.optionSetCode : attribute.value : attribute.value, null, attribute.type ? attribute.type : attribute.valueType, valueFound, 'A', '', programVariable.useCodeForOptionSet);
	                            }
	                        }
	                    });
	                } else if (programVariable.programRuleVariableSourceType === "CALCULATED_VALUE") {
	                    //We won't assign the calculated variables at this step. The rules execution will calculate and assign the variable.
	                } else {
	                    //If the rules was executed without events, we ended up in this else clause as expected, as most of the variables require an event to be mapped
	                    if (evs) {
	                        //If the rules was executed and events was supplied, we should have found an if clause for the the source type, and not ended up in this dead end else.
	                        $log.warn("Unknown programRuleVariableSourceType:" + programVariable.programRuleVariableSourceType);
	                    }
	                }
	
	                if (!valueFound) {
	                    //If there is still no value found, assign default value:
	                    if (dataElementId && allDes) {
	                        var dataElement = allDes[dataElementId];
	                        if (dataElement) {
	                            variables = pushVariable(variables, programVariable.displayName, "", null, dataElement.dataElement.valueType, false, '#', '', programVariable.useCodeForOptionSet);
	                        } else {
	                            $log.warn("Variable #{" + programVariable.displayName + "} is linked to a dataelement that is not part of the program");
	                            variables = pushVariable(variables, programVariable.displayName, "", null, "TEXT", false, '#', '', programVariable.useCodeForOptionSet);
	                        }
	                    } else if (programVariable.trackedEntityAttribute) {
	                        //The variable is an attribute, set correct prefix and a blank value
	                        variables = pushVariable(variables, programVariable.displayName, "", null, "TEXT", false, 'A', '', programVariable.useCodeForOptionSet);
	                    } else {
	                        //Fallback for calculated(assigned) values:
	                        variables = pushVariable(variables, programVariable.displayName, "", null, "TEXT", false, '#', '', programVariable.useCodeForOptionSet);
	                    }
	                }
	            });
	
	            //add context variables:
	            //last parameter "valuefound" is always true for event date
	            variables = pushVariable(variables, 'current_date', DateUtils.getToday(), null, 'DATE', true, 'V', '', false);
	
	            variables = pushVariable(variables, 'event_date', executingEvent.eventDate, null, 'DATE', true, 'V', '', false);
	            variables = pushVariable(variables, 'due_date', executingEvent.dueDate, null, 'DATE', true, 'V', '');
	            variables = pushVariable(variables, 'event_count', evs ? evs.all.length : 0, null, 'INTEGER', true, 'V', '', false);
	
	            variables = pushVariable(variables, 'enrollment_date', selectedEnrollment ? selectedEnrollment.enrollmentDate : '', null, 'DATE', selectedEnrollment ? true : false, 'V', '', false);
	            variables = pushVariable(variables, 'enrollment_id', selectedEnrollment ? selectedEnrollment.enrollment : '', null, 'TEXT', selectedEnrollment ? true : false, 'V', '', false);
	            variables = pushVariable(variables, 'event_id', executingEvent ? executingEvent.event : '', null, 'TEXT', executingEvent ? true : false, 'V', executingEvent ? executingEvent.eventDate : false, false);
	
	            variables = pushVariable(variables, 'incident_date', selectedEnrollment ? selectedEnrollment.incidentDate : '', null, 'DATE', selectedEnrollment ? true : false, 'V', '', false);
	            variables = pushVariable(variables, 'enrollment_count', selectedEnrollment ? 1 : 0, null, 'INTEGER', true, 'V', '', false);
	            variables = pushVariable(variables, 'tei_count', selectedEnrollment ? 1 : 0, null, 'INTEGER', true, 'V', '', false);
	
	            //Push all constant values:
	            angular.forEach(allProgramRules.constants, function (constant) {
	                variables = pushVariable(variables, constant.id, constant.value, null, 'INTEGER', true, 'C', '', false);
	            });
	
	            return variables;
	        }
	    };
	}])
	
	/* service for executing tracker rules and broadcasting results */
	.service('TrackerRulesExecutionService', ["$translate", "VariableService", "DateUtils", "NotificationService", "DHIS2EventFactory", "RulesFactory", "CalendarService", "OptionSetService", "$rootScope", "$q", "$log", "$filter", "orderByFilter", function ($translate, VariableService, DateUtils, NotificationService, DHIS2EventFactory, RulesFactory, CalendarService, OptionSetService, $rootScope, $q, $log, $filter, orderByFilter) {
	    var NUMBER_OF_EVENTS_IN_SCOPE = 10;
	
	    //Variables for storing scope and rules in memory from rules execution to rules execution:
	    var allProgramRules = false;
	    var crossEventRulesExist = false;
	    var lastEventId = null;
	    var lastEventDate = null;
	    var lastProgramId = null;
	    var eventScopeExceptCurrent = false;
	
	    var replaceVariables = function replaceVariables(expression, variablesHash) {
	        //replaces the variables in an expression with actual variable values.
	
	        //Check if the expression contains program rule variables at all(any curly braces):
	        if (expression.indexOf('{') !== -1) {
	            //Find every variable name in the expression;
	            var variablespresent = expression.match(/[A#CV]{\w+.?\w*}/g);
	            //Replace each matched variable:
	            angular.forEach(variablespresent, function (variablepresent) {
	                //First strip away any prefix and postfix signs from the variable name:
	                variablepresent = variablepresent.replace("#{", "").replace("A{", "").replace("C{", "").replace("V{", "").replace("}", "");
	
	                if (angular.isDefined(variablesHash[variablepresent])) {
	                    //Replace all occurrences of the variable name(hence using regex replacement):
	                    expression = expression.replace(new RegExp(variablesHash[variablepresent].variablePrefix + "{" + variablepresent + "}", 'g'), variablesHash[variablepresent].variableValue);
	                } else {
	                    $log.warn("Expression " + expression + " conains variable " + variablepresent + " - but this variable is not defined.");
	                }
	            });
	        }
	
	        //Check if the expression contains environment  variables
	        if (expression.indexOf('V{') !== -1) {
	            //Find every variable name in the expression;
	            var variablespresent = expression.match(/V{\w+.?\w*}/g);
	            //Replace each matched variable:
	            angular.forEach(variablespresent, function (variablepresent) {
	                //First strip away any prefix and postfix signs from the variable name:
	                variablepresent = variablepresent.replace("V{", "").replace("}", "");
	
	                if (angular.isDefined(variablesHash[variablepresent]) && variablesHash[variablepresent].variablePrefix === 'V') {
	                    //Replace all occurrences of the variable name(hence using regex replacement):
	                    expression = expression.replace(new RegExp("V{" + variablepresent + "}", 'g'), variablesHash[variablepresent].variableValue);
	                } else {
	                    $log.warn("Expression " + expression + " conains context variable " + variablepresent + " - but this variable is not defined.");
	                }
	            });
	        }
	
	        //Check if the expression contains attribute variables:
	        if (expression.indexOf('A{') !== -1) {
	            //Find every attribute in the expression;
	            var variablespresent = expression.match(/A{\w+.?\w*}/g);
	            //Replace each matched variable:
	            angular.forEach(variablespresent, function (variablepresent) {
	                //First strip away any prefix and postfix signs from the variable name:
	                variablepresent = variablepresent.replace("A{", "").replace("}", "");
	
	                if (angular.isDefined(variablesHash[variablepresent]) && variablesHash[variablepresent].variablePrefix === 'A') {
	                    //Replace all occurrences of the variable name(hence using regex replacement):
	                    expression = expression.replace(new RegExp("A{" + variablepresent + "}", 'g'), variablesHash[variablepresent].variableValue);
	                } else {
	                    $log.warn("Expression " + expression + " conains attribute " + variablepresent + " - but this attribute is not defined.");
	                }
	            });
	        }
	
	        //Check if the expression contains constants
	        if (expression.indexOf('C{') !== -1) {
	            //Find every constant in the expression;
	            var variablespresent = expression.match(/C{\w+.?\w*}/g);
	            //Replace each matched variable:
	            angular.forEach(variablespresent, function (variablepresent) {
	                //First strip away any prefix and postfix signs from the variable name:
	                variablepresent = variablepresent.replace("C{", "").replace("}", "");
	
	                if (angular.isDefined(variablesHash[variablepresent]) && variablesHash[variablepresent].variablePrefix === 'C') {
	                    //Replace all occurrences of the variable name(hence using regex replacement):
	                    expression = expression.replace(new RegExp("C{" + variablepresent + "}", 'g'), variablesHash[variablepresent].variableValue);
	                } else {
	                    $log.warn("Expression " + expression + " conains constant " + variablepresent + " - but this constant is not defined.");
	                }
	            });
	        }
	
	        return expression;
	    };
	
	    var runDhisFunctions = function runDhisFunctions(expression, variablesHash, flag) {
	        //Called from "runExpression". Only proceed with this logic in case there seems to be dhis function calls: "d2:" is present.
	        if (angular.isDefined(expression) && expression.indexOf("d2:") !== -1) {
	            var dhisFunctions = [{ name: "d2:daysBetween", parameters: 2 }, { name: "d2:weeksBetween", parameters: 2 }, { name: "d2:monthsBetween", parameters: 2 }, { name: "d2:yearsBetween", parameters: 2 }, { name: "d2:floor", parameters: 1 }, { name: "d2:modulus", parameters: 2 }, { name: "d2:concatenate" }, { name: "d2:addDays", parameters: 2 }, { name: "d2:zing", parameters: 1 }, { name: "d2:oizp", parameters: 1 }, { name: "d2:count", parameters: 1 }, { name: "d2:countIfZeroPos", parameters: 1 }, { name: "d2:countIfValue", parameters: 2 }, { name: "d2:ceil", parameters: 1 }, { name: "d2:round", parameters: 1 }, { name: "d2:hasValue", parameters: 1 }, { name: "d2:lastEventDate", parameters: 1 }, { name: "d2:validatePattern", parameters: 2 }, { name: "d2:addControlDigits", parameters: 1 }, { name: "d2:checkControlDigits", parameters: 1 }, { name: "d2:left", parameters: 2 }, { name: "d2:right", parameters: 2 }, { name: "d2:substring", parameters: 3 }, { name: "d2:split", parameters: 3 }, { name: "d2:length", parameters: 1 }];
	            var continueLooping = true;
	            //Safety harness on 10 loops, in case of unanticipated syntax causing unintencontinued looping
	            for (var i = 0; i < 10 && continueLooping; i++) {
	                var expressionUpdated = false;
	                var brokenExecution = false;
	                angular.forEach(dhisFunctions, function (dhisFunction) {
	                    //Select the function call, with any number of parameters inside single quotations, or number parameters witout quotations
	                    var regularExFunctionCall = new RegExp(dhisFunction.name + "\\( *(([\\d/\\*\\+\\-%\.]+)|( *'[^']*'))*( *, *(([\\d/\\*\\+\\-%\.]+)|'[^']*'))* *\\)", 'g');
	                    var callsToThisFunction = expression.match(regularExFunctionCall);
	                    angular.forEach(callsToThisFunction, function (callToThisFunction) {
	                        //Remove the function name and paranthesis:
	                        var justparameters = callToThisFunction.replace(/(^[^\(]+\()|\)$/g, "");
	                        //Remove white spaces before and after parameters:
	                        justparameters = justparameters.trim();
	                        //Then split into single parameters:
	                        var parameters = justparameters.match(/(('[^']+')|([^,]+))/g);
	
	                        //Show error if no parameters is given and the function requires parameters,
	                        //or if the number of parameters is wrong.
	                        if (angular.isDefined(dhisFunction.parameters)) {
	                            //But we are only checking parameters where the dhisFunction actually has a defined set of parameters(concatenate, for example, does not have a fixed number);
	                            var numParameters = parameters ? parameters.length : 0;
	
	                            if (numParameters !== dhisFunction.parameters) {
	                                $log.warn(dhisFunction.name + " was called with the incorrect number of parameters");
	
	                                //Mark this function call as broken:
	                                brokenExecution = true;
	                            }
	                        }
	
	                        //In case the function call is nested, the parameter itself contains an expression, run the expression.
	                        if (!brokenExecution && angular.isDefined(parameters) && parameters !== null) {
	                            for (var i = 0; i < parameters.length; i++) {
	                                parameters[i] = runExpression(parameters[i], dhisFunction.name, "parameter:" + i, flag, variablesHash);
	                            }
	                        }
	
	                        //Special block for d2:weeksBetween(*,*) - add such a block for all other dhis functions.
	                        if (brokenExecution) {
	                            //Function call is not possible to evaluate, remove the call:
	                            expression = expression.replace(callToThisFunction, "false");
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:daysBetween") {
	                            var firstdate = $filter('trimquotes')(parameters[0]);
	                            var seconddate = $filter('trimquotes')(parameters[1]);
	                            firstdate = moment(firstdate);
	                            seconddate = moment(seconddate);
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, seconddate.diff(firstdate, 'days'));
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:weeksBetween") {
	                            var firstdate = $filter('trimquotes')(parameters[0]);
	                            var seconddate = $filter('trimquotes')(parameters[1]);
	                            firstdate = moment(firstdate);
	                            seconddate = moment(seconddate);
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, seconddate.diff(firstdate, 'weeks'));
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:monthsBetween") {
	                            var firstdate = $filter('trimquotes')(parameters[0]);
	                            var seconddate = $filter('trimquotes')(parameters[1]);
	                            firstdate = moment(firstdate);
	                            seconddate = moment(seconddate);
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, seconddate.diff(firstdate, 'months'));
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:yearsBetween") {
	                            var firstdate = $filter('trimquotes')(parameters[0]);
	                            var seconddate = $filter('trimquotes')(parameters[1]);
	                            firstdate = moment(firstdate);
	                            seconddate = moment(seconddate);
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, seconddate.diff(firstdate, 'years'));
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:floor") {
	                            var floored = Math.floor(parameters[0]);
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, floored);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:modulus") {
	                            var dividend = Number(parameters[0]);
	                            var divisor = Number(parameters[1]);
	                            var rest = dividend % divisor;
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, rest);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:concatenate") {
	                            var returnString = "'";
	                            for (var i = 0; i < parameters.length; i++) {
	                                returnString += parameters[i];
	                            }
	                            returnString += "'";
	                            expression = expression.replace(callToThisFunction, returnString);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:addDays") {
	                            var date = $filter('trimquotes')(parameters[0]);
	                            var daystoadd = $filter('trimquotes')(parameters[1]);
	                            var newdate = DateUtils.format(moment(date, CalendarService.getSetting().momentFormat).add(daystoadd, 'days'));
	                            var newdatestring = "'" + newdate + "'";
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, newdatestring);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:zing") {
	                            var number = parameters[0];
	                            if (number < 0) {
	                                number = 0;
	                            }
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, number);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:oizp") {
	                            var number = parameters[0];
	                            var output = 1;
	                            if (number < 0) {
	                                output = 0;
	                            }
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, output);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:count") {
	                            var variableName = parameters[0];
	                            var variableObject = variablesHash[variableName];
	                            var count = 0;
	                            if (variableObject) {
	                                if (variableObject.hasValue) {
	                                    if (variableObject.allValues) {
	                                        count = variableObject.allValues.length;
	                                    } else {
	                                        //If there is a value found for the variable, the count is 1 even if there is no list of alternate values
	                                        //This happens for variables of "DATAELEMENT_CURRENT_STAGE" and "TEI_ATTRIBUTE"
	                                        count = 1;
	                                    }
	                                }
	                            } else {
	                                $log.warn("could not find variable to count: " + variableName);
	                            }
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, count);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:countIfZeroPos") {
	                            var variableName = $filter('trimvariablequalifiers')(parameters[0]);
	                            var variableObject = variablesHash[variableName];
	
	                            var count = 0;
	                            if (variableObject) {
	                                if (variableObject.hasValue) {
	                                    if (variableObject.allValues && variableObject.allValues.length > 0) {
	                                        for (var i = 0; i < variableObject.allValues.length; i++) {
	                                            if (variableObject.allValues[i] >= 0) {
	                                                count++;
	                                            }
	                                        }
	                                    } else {
	                                        //The variable has a value, but no list of alternates. This means we only compare the elements real value
	                                        if (variableObject.variableValue >= 0) {
	                                            count = 1;
	                                        }
	                                    }
	                                }
	                            } else {
	                                $log.warn("could not find variable to countifzeropos: " + variableName);
	                            }
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, count);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:countIfValue") {
	                            var variableName = parameters[0];
	                            var variableObject = variablesHash[variableName];
	
	                            var valueToCompare = VariableService.processValue(parameters[1], variableObject.variableType);
	
	                            var count = 0;
	                            if (variableObject) {
	                                if (variableObject.hasValue) {
	                                    if (variableObject.allValues) {
	                                        for (var i = 0; i < variableObject.allValues.length; i++) {
	                                            if (valueToCompare === variableObject.allValues[i]) {
	                                                count++;
	                                            }
	                                        }
	                                    } else {
	                                        //The variable has a value, but no list of alternates. This means we compare the standard variablevalue
	                                        if (valueToCompare === variableObject.variableValue) {
	                                            count = 1;
	                                        }
	                                    }
	                                }
	                            } else {
	                                $log.warn("could not find variable to countifvalue: " + variableName);
	                            }
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, count);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:ceil") {
	                            var ceiled = Math.ceil(parameters[0]);
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, ceiled);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:round") {
	                            var rounded = Math.round(parameters[0]);
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, rounded);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:hasValue") {
	                            var variableName = parameters[0];
	                            var variableObject = variablesHash[variableName];
	                            var valueFound = false;
	                            if (variableObject) {
	                                if (variableObject.hasValue) {
	                                    valueFound = true;
	                                }
	                            } else {
	                                $log.warn("could not find variable to check if has value: " + variableName);
	                            }
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, valueFound);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:lastEventDate") {
	                            var variableName = parameters[0];
	                            var variableObject = variablesHash[variableName];
	                            var valueFound = "''";
	                            if (variableObject) {
	                                if (variableObject.variableEventDate) {
	                                    valueFound = VariableService.processValue(variableObject.variableEventDate, 'DATE');
	                                } else {
	                                    $log.warn("no last event date found for variable: " + variableName);
	                                }
	                            } else {
	                                $log.warn("could not find variable to check last event date: " + variableName);
	                            }
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, valueFound);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:validatePattern") {
	                            var inputToValidate = parameters[0].toString();
	                            var pattern = parameters[1];
	                            var regEx = new RegExp(pattern, 'g');
	                            var match = inputToValidate.match(regEx);
	
	                            var matchFound = false;
	                            if (match !== null && inputToValidate === match[0]) {
	                                matchFound = true;
	                            }
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, matchFound);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:addControlDigits") {
	
	                            var baseNumber = parameters[0];
	                            var baseDigits = baseNumber.split('');
	                            var error = false;
	
	                            var firstDigit = 0;
	                            var secondDigit = 0;
	
	                            if (baseDigits && baseDigits.length < 10) {
	                                var firstSum = 0;
	                                var baseNumberLength = baseDigits.length;
	                                //weights support up to 9 base digits:
	                                var firstWeights = [3, 7, 6, 1, 8, 9, 4, 5, 2];
	                                for (var i = 0; i < baseNumberLength && !error; i++) {
	                                    firstSum += parseInt(baseDigits[i]) * firstWeights[i];
	                                }
	                                firstDigit = firstSum % 11;
	
	                                //Push the first digit to the array before continuing, as the second digit is a result of the
	                                //base digits and the first control digit.
	                                baseDigits.push(firstDigit);
	                                //Weights support up to 9 base digits plus first control digit:
	                                var secondWeights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
	                                var secondSum = 0;
	                                for (var i = 0; i < baseNumberLength + 1 && !error; i++) {
	                                    secondSum += parseInt(baseDigits[i]) * secondWeights[i];
	                                }
	                                secondDigit = secondSum % 11;
	
	                                if (firstDigit === 10) {
	                                    $log.warn("First control digit became 10, replacing with 0");
	                                    firstDigit = 0;
	                                }
	                                if (secondDigit === 10) {
	                                    $log.warn("Second control digit became 10, replacing with 0");
	                                    secondDigit = 0;
	                                }
	                            } else {
	                                $log.warn("Base nuber not well formed(" + baseNumberLength + " digits): " + baseNumber);
	                            }
	
	                            if (!error) {
	                                //Replace the end evaluation of the dhis function:
	                                expression = expression.replace(callToThisFunction, baseNumber + firstDigit + secondDigit);
	                                expressionUpdated = true;
	                            } else {
	                                //Replace the end evaluation of the dhis function:
	                                expression = expression.replace(callToThisFunction, baseNumber);
	                                expressionUpdated = true;
	                            }
	                        } else if (dhisFunction.name === "d2:checkControlDigits") {
	                            $log.warn("checkControlDigits not implemented yet");
	
	                            //Replace the end evaluation of the dhis function:
	                            expression = expression.replace(callToThisFunction, parameters[0]);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:left") {
	                            var string = String(parameters[0]);
	                            var numChars = string.length < parameters[1] ? string.length : parameters[1];
	                            var returnString = string.substring(0, numChars);
	                            returnString = VariableService.processValue(returnString, 'TEXT');
	                            expression = expression.replace(callToThisFunction, returnString);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:right") {
	                            var string = String(parameters[0]);
	                            var numChars = string.length < parameters[1] ? string.length : parameters[1];
	                            var returnString = string.substring(string.length - numChars, string.length);
	                            returnString = VariableService.processValue(returnString, 'TEXT');
	                            expression = expression.replace(callToThisFunction, returnString);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:substring") {
	                            var string = String(parameters[0]);
	                            var startChar = string.length < parameters[1] - 1 ? -1 : parameters[1];
	                            var endChar = string.length < parameters[2] ? -1 : parameters[2];
	                            if (startChar < 0 || endChar < 0) {
	                                expression = expression.replace(callToThisFunction, "''");
	                                expressionUpdated = true;
	                            } else {
	                                var returnString = string.substring(startChar, endChar);
	                                returnString = VariableService.processValue(returnString, 'TEXT');
	                                expression = expression.replace(callToThisFunction, returnString);
	                                expressionUpdated = true;
	                            }
	                        } else if (dhisFunction.name === "d2:split") {
	                            var string = String(parameters[0]);
	                            var splitArray = string.split(parameters[1]);
	                            var returnPart = "";
	                            if (splitArray.length >= parameters[2]) {
	                                returnPart = splitArray[parameters[2]];
	                            }
	                            returnPart = VariableService.processValue(returnPart, 'TEXT');
	                            expression = expression.replace(callToThisFunction, returnPart);
	                            expressionUpdated = true;
	                        } else if (dhisFunction.name === "d2:length") {
	                            expression = expression.replace(callToThisFunction, String(parameters[0]).length);
	                            expressionUpdated = true;
	                        }
	                    });
	                });
	
	                //We only want to continue looping until we made a successful replacement,
	                //and there is still occurrences of "d2:" in the code. In cases where d2: occur outside
	                //the expected d2: function calls, one unneccesary iteration will be done and the
	                //successfulExecution will be false coming back here, ending the loop. The last iteration
	                //should be zero to marginal performancewise.
	                if (expressionUpdated && expression.indexOf("d2:") !== -1) {
	                    continueLooping = true;
	                } else {
	                    continueLooping = false;
	                }
	            }
	        }
	
	        return expression;
	    };
	
	    var runExpression = function runExpression(expression, beforereplacement, identifier, flag, variablesHash) {
	        //determine if expression is true, and actions should be effectuated
	        //If DEBUG mode, use try catch and report errors. If not, omit the heavy try-catch loop.:
	        var answer = false;
	        if (flag && flag.debug) {
	            try {
	
	                var dhisfunctionsevaluated = runDhisFunctions(expression, variablesHash, flag);
	                answer = eval(dhisfunctionsevaluated);
	
	                if (flag.verbose) {
	                    $log.info("Expression with id " + identifier + " was successfully run. Original condition was: " + beforereplacement + " - Evaluation ended up as:" + expression + " - Result of evaluation was:" + answer);
	                }
	            } catch (e) {
	                $log.warn("Expression with id " + identifier + " could not be run. Original condition was: " + beforereplacement + " - Evaluation ended up as:" + expression + " - error message:" + e);
	            }
	        } else {
	            //Just run the expression. This is much faster than the debug route: http://jsperf.com/try-catch-block-loop-performance-comparison
	            var dhisfunctionsevaluated = runDhisFunctions(expression, variablesHash, flag);
	            answer = eval(dhisfunctionsevaluated);
	        }
	        return answer;
	    };
	
	    var determineValueType = function determineValueType(value) {
	        var valueType = 'TEXT';
	        if (value === 'true' || value === 'false') {
	            valueType = 'BOOLEAN';
	        } else if (angular.isNumber(value) || !isNaN(value)) {
	            if (value % 1 !== 0) {
	                valueType = 'NUMBER';
	            } else {
	                valueType = 'INTEGER';
	            }
	        }
	        return valueType;
	    };
	
	    var performCreateEventAction = function performCreateEventAction(effect, selectedEntity, selectedEnrollment, currentEvents, executingEvent, programStage) {
	        var valArray = [];
	        if (effect.data) {
	            valArray = effect.data.split(',');
	            var newEventDataValues = [];
	            var idList = { active: false };
	
	            angular.forEach(valArray, function (value) {
	                var valParts = value.split(':');
	                if (valParts && valParts.length >= 1) {
	                    var valId = valParts[0];
	
	                    //Check wether one or more fields is marked as the id to use for comparison purposes:
	                    if (valId.trim().substring(0, 4) === "[id]") {
	                        valId = valId.substring(4, valId.length);
	                        idList[valId] = true;
	                        idList.active = true;
	                    }
	
	                    var valVal = "";
	                    if (valParts.length > 1) {
	                        valVal = valParts[1];
	                    }
	                    var valueType = determineValueType(valVal);
	
	                    var processedValue = VariableService.processValue(valVal, valueType);
	                    processedValue = $filter('trimquotes')(processedValue);
	                    newEventDataValues.push({ dataElement: valId, value: processedValue });
	                    newEventDataValues[valId] = processedValue;
	                }
	            });
	
	            var valuesAlreadyExists = false;
	            angular.forEach(currentEvents, function (currentEvent) {
	                var misMatch = false;
	                angular.forEach(newEventDataValues, function (value) {
	                    var valueFound = false;
	                    angular.forEach(currentEvent.dataValues, function (currentDataValue) {
	                        //Only count as mismatch if there is no particular ID to use, or the current field is part of the same ID
	                        if (!idList.active || idList[currentDataValue.dataElement]) {
	                            if (currentDataValue.dataElement === value.dataElement) {
	                                valueFound = true;
	                                //Truthy comparison is needed to avoid false negatives for differing variable types:
	                                if (currentDataValue.value != newEventDataValues[value.dataElement]) {
	                                    misMatch = true;
	                                }
	                            }
	                        }
	                    });
	                    //Also treat no value found as a mismatch, but when ID fields is set, only concider ID fields
	                    if ((!idList.active || idList[value.dataElement]) && !valueFound) {
	                        misMatch = true;
	                    }
	                });
	                if (!misMatch) {
	                    //if no mismatches on this point, the exact same event already exists, and we dont create it.
	                    valuesAlreadyExists = true;
	                }
	            });
	
	            if (!valuesAlreadyExists) {
	                var eventDate = DateUtils.getToday();
	                var dueDate = DateUtils.getToday();
	
	                var newEvent = {
	                    trackedEntityInstance: selectedEnrollment.trackedEntityInstance,
	                    program: selectedEnrollment.program,
	                    programStage: effect.programStage.id,
	                    enrollment: selectedEnrollment.enrollment,
	                    orgUnit: selectedEnrollment.orgUnit,
	                    dueDate: dueDate,
	                    eventDate: eventDate,
	                    notes: [],
	                    dataValues: newEventDataValues,
	                    status: 'ACTIVE',
	                    event: dhis2.util.uid()
	                };
	
	                if (programStage && programStage.dontPersistOnCreate) {
	                    newEvent.notPersisted = true;
	                    newEvent.executingEvent = executingEvent;
	                    $rootScope.$broadcast("eventcreated", { event: newEvent });
	                } else {
	                    DHIS2EventFactory.create(newEvent).then(function (result) {
	                        $rootScope.$broadcast("eventcreated", { event: newEvent });
	                    });
	                }
	                //1 event created
	                return 1;
	            } else {
	                //no events created
	                return 0;
	            }
	        } else {
	            $log.warn("Cannot create event with empty content.");
	        }
	    };
	
	    var internalExecuteRules = function internalExecuteRules(allProgramRules, executingEvent, evs, allDataElements, selectedEntity, selectedEnrollment, optionSets, flag) {
	        if (allProgramRules) {
	            var variablesHash = {};
	
	            //Concatenate rules produced by indicator definitions into the other rules:
	            var rules = $filter('filter')(allProgramRules.programRules, { programStageId: null });
	
	            if (executingEvent && executingEvent.programStage) {
	                if (!rules) {
	                    rules = [];
	                }
	                rules = rules.concat($filter('filter')(allProgramRules.programRules, { programStageId: executingEvent.programStage }));
	            }
	            if (!rules) {
	                rules = [];
	            }
	            rules = rules.concat(allProgramRules.programIndicators.rules);
	
	            //Run rules in priority - lowest number first(priority null is last)
	            rules = orderByFilter(rules, 'priority');
	
	            variablesHash = VariableService.getVariables(allProgramRules, executingEvent, evs, allDataElements, selectedEntity, selectedEnrollment, optionSets);
	
	            if (angular.isObject(rules) && angular.isArray(rules)) {
	                //The program has rules, and we want to run them.
	                //Prepare repository unless it is already prepared:
	                if (angular.isUndefined($rootScope.ruleeffects)) {
	                    $rootScope.ruleeffects = {};
	                }
	
	                var ruleEffectKey = executingEvent.event ? executingEvent.event : executingEvent;
	                if (executingEvent.event && angular.isUndefined($rootScope.ruleeffects[ruleEffectKey])) {
	                    $rootScope.ruleeffects[ruleEffectKey] = {};
	                }
	
	                if (!angular.isObject(executingEvent) && angular.isUndefined($rootScope.ruleeffects[ruleEffectKey])) {
	                    $rootScope.ruleeffects[ruleEffectKey] = {};
	                }
	
	                var updatedEffectsExits = false;
	                var eventsCreated = 0;
	
	                angular.forEach(rules, function (rule) {
	                    var ruleEffective = false;
	
	                    var expression = rule.condition;
	                    //Go through and populate variables with actual values, but only if there actually is any replacements to be made(one or more "$" is present)
	                    if (expression) {
	                        if (expression.indexOf('{') !== -1) {
	                            expression = replaceVariables(expression, variablesHash);
	                        }
	                        //run expression:
	                        ruleEffective = runExpression(expression, rule.condition, "rule:" + rule.id, flag, variablesHash);
	                    } else {
	                        $log.warn("Rule id:'" + rule.id + "'' and name:'" + rule.name + "' had no condition specified. Please check rule configuration.");
	                    }
	
	                    angular.forEach(rule.programRuleActions, function (action) {
	                        //In case the effect-hash is not populated, add entries
	                        if (angular.isUndefined($rootScope.ruleeffects[ruleEffectKey][action.id])) {
	                            $rootScope.ruleeffects[ruleEffectKey][action.id] = {
	                                id: action.id,
	                                location: action.location,
	                                action: action.programRuleActionType,
	                                dataElement: action.dataElement,
	                                trackedEntityAttribute: action.trackedEntityAttribute,
	                                programStage: action.programStage,
	                                programIndicator: action.programIndicator,
	                                programStageSection: action.programStageSection && action.programStageSection.id ? action.programStageSection.id : null,
	                                content: action.content,
	                                data: action.data,
	                                ineffect: undefined
	                            };
	                        }
	
	                        //In case the rule is effective and contains specific data,
	                        //the effect be refreshed from the variables list.
	                        //If the rule is not effective we can skip this step
	                        if (ruleEffective && action.data) {
	                            //Preserve old data for comparison:
	                            var oldData = $rootScope.ruleeffects[ruleEffectKey][action.id].data;
	
	                            //The key data might be containing a dollar sign denoting that the key data is a variable.
	                            //To make a lookup in variables hash, we must make a lookup without the dollar sign in the variable name
	                            //The first strategy is to make a direct lookup. In case the "data" expression is more complex, we have to do more replacement and evaluation.
	
	                            var nameWithoutBrackets = action.data.replace('#{', '').replace('}', '');
	                            if (angular.isDefined(variablesHash[nameWithoutBrackets])) {
	                                //The variable exists, and is replaced with its corresponding value
	                                $rootScope.ruleeffects[ruleEffectKey][action.id].data = variablesHash[nameWithoutBrackets].variableValue;
	                            } else if (action.data.indexOf('{') !== -1 || action.data.indexOf('d2:') !== -1) {
	                                //Since the value couldnt be looked up directly, and contains a curly brace or a dhis function call,
	                                //the expression was more complex than replacing a single variable value.
	                                //Now we will have to make a thorough replacement and separate evaluation to find the correct value:
	                                $rootScope.ruleeffects[ruleEffectKey][action.id].data = replaceVariables(action.data, variablesHash);
	                                //In a scenario where the data contains a complex expression, evaluate the expression to compile(calculate) the result:
	                                $rootScope.ruleeffects[ruleEffectKey][action.id].data = runExpression($rootScope.ruleeffects[ruleEffectKey][action.id].data, action.data, "action:" + action.id, flag, variablesHash);
	                            }
	
	                            if (oldData !== $rootScope.ruleeffects[ruleEffectKey][action.id].data) {
	                                updatedEffectsExits = true;
	                            }
	                        }
	
	                        //Update the rule effectiveness if it changed in this evaluation;
	                        if ($rootScope.ruleeffects[ruleEffectKey][action.id].ineffect !== ruleEffective) {
	                            //There is a change in the rule outcome, we need to update the effect object.
	                            updatedEffectsExits = true;
	                            $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect = ruleEffective;
	                        }
	
	                        //In case the rule is of type CREATEEVENT, run event creation:
	                        if ($rootScope.ruleeffects[ruleEffectKey][action.id].action === "CREATEEVENT" && $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect) {
	                            if (evs && evs.byStage) {
	                                if ($rootScope.ruleeffects[ruleEffectKey][action.id].programStage) {
	                                    var createdNow = performCreateEventAction($rootScope.ruleeffects[ruleEffectKey][action.id], selectedEntity, selectedEnrollment, evs.byStage[$rootScope.ruleeffects[ruleEffectKey][action.id].programStage.id]);
	                                    eventsCreated += createdNow;
	                                } else {
	                                    $log.warn("No programstage defined for CREATEEVENT action: " + action.id);
	                                }
	                            } else {
	                                $log.warn("Events to evaluate for CREATEEVENT action: " + action.id + ". Could it have been triggered at the wrong time or during registration?");
	                            }
	                        }
	                        //In case the rule is of type "assign variable" and the rule is effective,
	                        //the variable data result needs to be applied to the correct variable:
	                        else if ($rootScope.ruleeffects[ruleEffectKey][action.id].action === "ASSIGN" && $rootScope.ruleeffects[ruleEffectKey][action.id].ineffect) {
	                                //from earlier evaluation, the data portion of the ruleeffect now contains the value of the variable to be assigned.
	                                //the content portion of the ruleeffect defines the name for the variable, when the qualidisers are removed:
	                                var variabletoassign = $rootScope.ruleeffects[ruleEffectKey][action.id].content ? $rootScope.ruleeffects[ruleEffectKey][action.id].content.replace("#{", "").replace("}", "") : null;
	
	                                if (variabletoassign && !angular.isDefined(variablesHash[variabletoassign])) {
	                                    //If a variable is mentioned in the content of the rule, but does not exist in the variables hash, show a warning:
	                                    $log.warn("Variable " + variabletoassign + " was not defined.");
	                                }
	
	                                if (variablesHash[variabletoassign]) {
	                                    var updatedValue = $rootScope.ruleeffects[ruleEffectKey][action.id].data;
	
	                                    var valueType = determineValueType(updatedValue);
	
	                                    if ($rootScope.ruleeffects[ruleEffectKey][action.id].dataElement) {
	                                        updatedValue = VariableService.getDataElementValueOrCodeForValue(variablesHash[variabletoassign].useCodeForOptionSet, updatedValue, $rootScope.ruleeffects[ruleEffectKey][action.id].dataElement.id, allDataElements, optionSets);
	                                    }
	                                    updatedValue = VariableService.processValue(updatedValue, valueType);
	
	                                    variablesHash[variabletoassign] = {
	                                        variableValue: updatedValue,
	                                        variableType: valueType,
	                                        hasValue: true,
	                                        variableEventDate: '',
	                                        variablePrefix: '#',
	                                        allValues: [updatedValue]
	                                    };
	
	                                    if (variablesHash[variabletoassign].variableValue !== updatedValue) {
	                                        //If the variable was actually updated, we assume that there is an updated ruleeffect somewhere:
	                                        updatedEffectsExits = true;
	                                    }
	                                }
	                            }
	                    });
	                });
	
	                //Broadcast rules finished if there was any actual changes to the event.
	                if (updatedEffectsExits) {
	                    $rootScope.$broadcast("ruleeffectsupdated", { event: ruleEffectKey, eventsCreated: eventsCreated });
	                }
	            }
	
	            return true;
	        }
	    };
	
	    var internalProcessEvent = function internalProcessEvent(event) {
	        event.eventDate = DateUtils.formatFromApiToUser(event.eventDate);
	
	        angular.forEach(event.dataValues, function (dataValue) {
	            event[dataValue.dataElement] = dataValue.value;
	        });
	        return event;
	    };
	
	    var internalGetOrLoadScope = function internalGetOrLoadScope(currentEvent, programStageId, orgUnitId) {
	        if (crossEventRulesExist) {
	            //If crossEventRulesExist, we need to get a scope that contains more than the current event.
	            if (lastEventId !== currentEvent.event || lastEventDate !== currentEvent.eventDate || !eventScopeExceptCurrent) {
	                //The scope might need updates, as the parameters of the event has changed
	
	                lastEventId = currentEvent.event;
	                lastEventDate = currentEvent.eventDate;
	
	                var pager = { pageSize: NUMBER_OF_EVENTS_IN_SCOPE };
	                var ordering = { field: "eventDate", direction: "desc" };
	                var filterings = [{ field: "programStage", value: programStageId }];
	                return DHIS2EventFactory.getByFilters(orgUnitId, pager, true, ordering, filterings).then(function (newestEvents) {
	                    filterings.push({ field: "dueDate", value: lastEventDate });
	                    return DHIS2EventFactory.getByFilters(orgUnitId, pager, true, ordering, filterings).then(function (previousEvents) {
	                        eventScopeExceptCurrent = [];
	                        var eventIdDictionary = {};
	                        var allEventsWithPossibleDuplicates = newestEvents.events.concat(previousEvents.events);
	                        angular.forEach(allEventsWithPossibleDuplicates, function (eventInScope) {
	                            if (currentEvent.event !== eventInScope.event && !eventIdDictionary[eventInScope.event]) {
	                                //Add event and update dictionary to avoid duplicates:
	                                eventScopeExceptCurrent.push(internalProcessEvent(eventInScope));
	                                eventIdDictionary[eventInScope.event] = true;
	                            }
	                        });
	
	                        //make a sorted list of all events to pass to rules execution service:
	                        var allEventsInScope = eventScopeExceptCurrent.concat([currentEvent]);
	                        allEventsInScope = orderByFilter(allEventsInScope, '-eventDate').reverse();
	                        var byStage = {};
	                        byStage[currentEvent.programStage] = allEventsInScope;
	                        return { all: allEventsInScope, byStage: byStage };
	                    });
	                });
	            } else {
	                //make a sorted list of all events to pass to rules execution service:
	                var allEvents = eventScopeExceptCurrent.concat([currentEvent]);
	                allEvents = orderByFilter(allEvents, '-eventDate').reverse();
	                var byStage = {};
	                byStage[currentEvent.programStage] = allEvents;
	                return $q.when({ all: allEvents, byStage: byStage });
	            }
	        } else {
	            //return a scope containing only the current event
	            var byStage = {};
	            byStage[currentEvent.programStage] = [currentEvent];
	            return $q.when({ all: [currentEvent], byStage: byStage });
	        }
	    };
	    var internalGetOrLoadRules = function internalGetOrLoadRules(programId) {
	        //If no rules is stored in memory, or this service is being called in the context of a different program, get the rules again:
	        if (allProgramRules === false || lastProgramId !== programId) {
	            return RulesFactory.loadRules(programId).then(function (rules) {
	                allProgramRules = rules;
	                lastProgramId = programId;
	
	                //Check if any of the rules is using any source type thar requires a bigger event scope
	                crossEventRulesExist = false;
	                if (rules.programVariables && rules.programVariables.length) {
	                    for (var i = 0; i < rules.programVariables.length; i++) {
	                        if (rules.programVariables[i].programRuleVariableSourceType === "DATAELEMENT_NEWEST_EVENT_PROGRAM" || rules.programVariables[i].programRuleVariableSourceType === "DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE" || rules.programVariables[i].programRuleVariableSourceType === "DATAELEMENT_PREVIOUS_EVENT") {
	                            crossEventRulesExist = true;
	                        }
	                    }
	                }
	
	                return rules;
	            });
	        } else {
	            return $q.when(allProgramRules);
	        }
	    };
	    return {
	        executeRules: function executeRules(allProgramRules, executingEvent, evs, allDataElements, selectedEntity, selectedEnrollment, optionSets, flags) {
	            internalExecuteRules(allProgramRules, executingEvent, evs, allDataElements, selectedEntity, selectedEnrollment, optionSets, flags);
	        },
	        loadAndExecuteRulesScope: function loadAndExecuteRulesScope(currentEvent, programId, programStageId, programStageDataElements, optionSets, orgUnitId, flags) {
	            internalGetOrLoadRules(programId).then(function (rules) {
	                internalGetOrLoadScope(currentEvent, programStageId, orgUnitId).then(function (scope) {
	                    internalExecuteRules(rules, currentEvent, scope, programStageDataElements, null, null, optionSets, flags);
	                });
	            });
	        },
	        processRuleEffectsForTrackedEntityAttributes: function processRuleEffectsForTrackedEntityAttributes(context, currentTei, teiOriginalValues, attributesById, optionSets) {
	            var hiddenFields = {};
	            var assignedFields = {};
	            var hiddenSections = {};
	            var warningMessages = [];
	
	            angular.forEach($rootScope.ruleeffects[context], function (effect) {
	                if (effect.ineffect) {
	                    if (effect.action === "HIDEFIELD" && effect.trackedEntityAttribute) {
	                        if (currentTei[effect.trackedEntityAttribute.id]) {
	                            //If a field is going to be hidden, but contains a value, we need to take action;
	                            if (effect.content) {
	                                //TODO: Alerts is going to be replaced with a proper display mecanism.
	                                alert(effect.content);
	                            } else {
	                                //TODO: Alerts is going to be replaced with a proper display mecanism.
	                                alert(attributesById[effect.trackedEntityAttribute.id].displayName + " was blanked out and hidden by your last action");
	                            }
	
	                            //Blank out the value:
	                            currentTei[effect.trackedEntityAttribute.id] = "";
	                        }
	
	                        hiddenFields[effect.trackedEntityAttribute.id] = true;
	                    } else if (effect.action === "SHOWERROR" && effect.trackedEntityAttribute) {
	                        if (effect.ineffect) {
	                            var headerText = $translate.instant('validation_error');
	                            var bodyText = effect.content + (effect.data ? effect.data : "");
	
	                            NotificationService.showNotifcationDialog(headerText, bodyText);
	                            if (effect.trackedEntityAttribute) {
	                                currentTei[effect.trackedEntityAttribute.id] = teiOriginalValues[effect.trackedEntityAttribute.id];
	                            }
	                        }
	                    } else if (effect.action === "SHOWWARNING" && effect.trackedEntityAttribute) {
	                        if (effect.ineffect) {
	                            var message = effect.content + (angular.isDefined(effect.data) ? effect.data : "");
	                            warningMessages.push(message);
	
	                            if (effect.trackedEntityAttribute) {
	                                warningMessages[effect.trackedEntityAttribute.id] = message;
	                            }
	                        }
	                    } else if (effect.action === "ASSIGN" && effect.trackedEntityAttribute) {
	                        var processedValue = $filter('trimquotes')(effect.data);
	
	                        if (attributesById[effect.trackedEntityAttribute.id] && attributesById[effect.trackedEntityAttribute.id].optionSet) {
	                            processedValue = OptionSetService.getName(optionSets[attributesById[effect.trackedEntityAttribute.id].optionSet.id].options, processedValue);
	                        }
	
	                        processedValue = processedValue === "true" ? true : processedValue;
	                        processedValue = processedValue === "false" ? false : processedValue;
	
	                        //For "ASSIGN" actions where we have a dataelement, we save the calculated value to the dataelement:
	                        currentTei[effect.trackedEntityAttribute.id] = processedValue;
	                        assignedFields[effect.trackedEntityAttribute.id] = true;
	                    }
	                }
	            });
	            return { currentTei: currentTei, hiddenFields: hiddenFields, hiddenSections: hiddenSections, warningMessages: warningMessages, assignedFields: assignedFields };
	        },
	        processRuleEffectsForEvent: function processRuleEffectsForEvent(eventId, currentEvent, currentEventOriginalValues, prStDes, optionSets) {
	            var hiddenFields = {};
	            var assignedFields = {};
	            var hiddenSections = {};
	            var warningMessages = [];
	
	            angular.forEach($rootScope.ruleeffects[eventId], function (effect) {
	                if (effect.ineffect) {
	                    if (effect.action === "HIDEFIELD" && effect.dataElement) {
	                        if (currentEvent[effect.dataElement.id]) {
	                            //If a field is going to be hidden, but contains a value, we need to take action;
	                            if (effect.content) {
	                                //TODO: Alerts is going to be replaced with a proper display mecanism.
	                                alert(effect.content);
	                            } else {
	                                //TODO: Alerts is going to be replaced with a proper display mecanism.
	                                alert(prStDes[effect.dataElement.id].dataElement.formName + "Was blanked out and hidden by your last action");
	                            }
	                        }
	
	                        hiddenFields[effect.dataElement.id] = true;
	                    } else if (effect.action === "HIDESECTION") {
	                        if (effect.programStageSection) {
	                            hiddenSections[effect.programStageSection] = effect.programStageSection;
	                        }
	                    } else if (effect.action === "SHOWERROR" && effect.dataElement.id) {
	                        var headerTxt = $translate.instant('validation_error');
	                        var bodyTxt = effect.content + (effect.data ? effect.data : "");
	                        NotificationService.showNotifcationDialog(headerTxt, bodyTxt);
	
	                        currentEvent[effect.dataElement.id] = currentEventOriginalValues[effect.dataElement.id];
	                    } else if (effect.action === "SHOWWARNING") {
	                        warningMessages.push(effect.content + (effect.data ? effect.data : ""));
	                    } else if (effect.action === "ASSIGN" && effect.dataElement) {
	                        var processedValue = $filter('trimquotes')(effect.data);
	
	                        if (prStDes[effect.dataElement.id] && prStDes[effect.dataElement.id].dataElement.optionSet) {
	                            processedValue = OptionSetService.getName(optionSets[prStDes[effect.dataElement.id].dataElement.optionSet.id].options, processedValue);
	                        }
	
	                        processedValue = processedValue === "true" ? true : processedValue;
	                        processedValue = processedValue === "false" ? false : processedValue;
	
	                        currentEvent[effect.dataElement.id] = processedValue;
	                        assignedFields[effect.dataElement.id] = true;
	                    }
	                }
	            });
	
	            return { currentEvent: currentEvent, hiddenFields: hiddenFields, hiddenSections: hiddenSections, warningMessages: warningMessages, assignedFields: assignedFields };
	        },
	        processRuleEffectAttribute: function processRuleEffectAttribute(context, selectedTei, tei, currentEvent, currentEventOriginialValue, affectedEvent, attributesById, prStDes, hiddenFields, hiddenSections, warningMessages, assignedFields, optionSets) {
	            //Function used from registration controller to process effects for the tracked entity instance and for the events in the same operation
	            var teiAttributesEffects = this.processRuleEffectsForTrackedEntityAttributes(context, selectedTei, tei, attributesById, optionSets);
	            teiAttributesEffects.selectedTei = teiAttributesEffects.currentTei;
	
	            if (context === "SINGLE_EVENT" && currentEvent && prStDes) {
	                var eventEffects = this.processRuleEffectsForEvent("SINGLE_EVENT", currentEvent, currentEventOriginialValue, prStDes, optionSets);
	                teiAttributesEffects.warningMessages = angular.extend(teiAttributesEffects.warningMessages, eventEffects.warningMessages);
	                teiAttributesEffects.hiddenFields = angular.extend(teiAttributesEffects.hiddenFields, eventEffects.hiddenFields);
	                teiAttributesEffects.hiddenSections = angular.extend(teiAttributesEffects.hiddenSections, eventEffects.hiddenSections);
	                teiAttributesEffects.assignedFields = angular.extend(teiAttributesEffects.assignedFields, eventEffects.assignedFields);
	                teiAttributesEffects.currentEvent = eventEffects.currentEvent;
	            }
	
	            return teiAttributesEffects;
	        }
	    };
	}])
	
	/* service for dealing with events */
	.service('DHIS2EventService', ["DateUtils", function (DateUtils) {
	    return {
	        //for simplicity of grid display, events were changed from
	        //event.datavalues = [{dataElement: dataElement, value: value}] to
	        //event[dataElement] = value
	        //now they are changed back for the purpose of storage.
	        reconstructEvent: function reconstructEvent(event, programStageDataElements) {
	            var e = {};
	
	            e.event = event.event;
	            e.status = event.status;
	            e.program = event.program;
	            e.programStage = event.programStage;
	            e.orgUnit = event.orgUnit;
	            e.eventDate = event.eventDate;
	
	            var dvs = [];
	            angular.forEach(programStageDataElements, function (prStDe) {
	                if (event.hasOwnProperty(prStDe.dataElement.id)) {
	                    dvs.push({ dataElement: prStDe.dataElement.id, value: event[prStDe.dataElement.id] });
	                }
	            });
	
	            e.dataValues = dvs;
	
	            if (event.coordinate) {
	                e.coordinate = { latitude: event.coordinate.latitude ? event.coordinate.latitude : '',
	                    longitude: event.coordinate.longitude ? event.coordinate.longitude : '' };
	            }
	
	            return e;
	        },
	        refreshList: function refreshList(eventList, currentEvent) {
	            if (!eventList || !eventList.length) {
	                return;
	            }
	            var continueLoop = true;
	            for (var i = 0; i < eventList.length && continueLoop; i++) {
	                if (eventList[i].event === currentEvent.event) {
	                    eventList[i] = currentEvent;
	                    continueLoop = false;
	                }
	            }
	            return eventList;
	        },
	        getEventExpiryStatus: function getEventExpiryStatus(event, program, selectedOrgUnit) {
	            var completedDate, today, daysAfterCompletion;
	
	            if (event.orgUnit !== selectedOrgUnit || program.completeEventsExpiryDays === 0 || !event.status) {
	                return false;
	            }
	
	            completedDate = moment(event.completedDate, 'YYYY-MM-DD');
	            today = moment(DateUtils.getToday(), 'YYYY-MM-DD');
	            daysAfterCompletion = today.diff(completedDate, 'days');
	            if (daysAfterCompletion < program.completeEventsExpiryDays) {
	                return false;
	            }
	            return true;
	        }
	    };
	}])
	
	/* current selections */
	.service('CurrentSelection', function () {
	    this.currentSelection = {};
	    this.relationshipInfo = {};
	    this.optionSets = null;
	    this.attributesById = null;
	    this.ouLevels = null;
	    this.sortedTeiIds = [];
	    this.selectedTeiEvents = null;
	    this.relationshipOwner = {};
	    this.selectedTeiEvents = [];
	    this.fileNames = [];
	    this.location = null;
	    this.advancedSearchOptions = null;
	    this.trackedEntities = null;
	
	    this.set = function (currentSelection) {
	        this.currentSelection = currentSelection;
	    };
	    this.get = function () {
	        return this.currentSelection;
	    };
	
	    this.setRelationshipInfo = function (relationshipInfo) {
	        this.relationshipInfo = relationshipInfo;
	    };
	    this.getRelationshipInfo = function () {
	        return this.relationshipInfo;
	    };
	
	    this.setOptionSets = function (optionSets) {
	        this.optionSets = optionSets;
	    };
	    this.getOptionSets = function () {
	        return this.optionSets;
	    };
	
	    this.setAttributesById = function (attributesById) {
	        this.attributesById = attributesById;
	    };
	    this.getAttributesById = function () {
	        return this.attributesById;
	    };
	
	    this.setOuLevels = function (ouLevels) {
	        this.ouLevels = ouLevels;
	    };
	    this.getOuLevels = function () {
	        return this.ouLevels;
	    };
	
	    this.setSortedTeiIds = function (sortedTeiIds) {
	        this.sortedTeiIds = sortedTeiIds;
	    };
	    this.getSortedTeiIds = function () {
	        return this.sortedTeiIds;
	    };
	
	    this.setSelectedTeiEvents = function (selectedTeiEvents) {
	        this.selectedTeiEvents = selectedTeiEvents;
	    };
	    this.getSelectedTeiEvents = function () {
	        return this.selectedTeiEvents;
	    };
	
	    this.setRelationshipOwner = function (relationshipOwner) {
	        this.relationshipOwner = relationshipOwner;
	    };
	    this.getRelationshipOwner = function () {
	        return this.relationshipOwner;
	    };
	
	    this.setFileNames = function (fileNames) {
	        this.fileNames = fileNames;
	    };
	    this.getFileNames = function () {
	        return this.fileNames;
	    };
	
	    this.setLocation = function (location) {
	        this.location = location;
	    };
	    this.getLocation = function () {
	        return this.location;
	    };
	
	    this.setAdvancedSearchOptions = function (searchOptions) {
	        this.advancedSearchOptions = searchOptions;
	    };
	    this.getAdvancedSearchOptions = function () {
	        return this.advancedSearchOptions;
	    };
	
	    this.setTrackedEntities = function (trackedEntities) {
	        this.trackedEntities = trackedEntities;
	    };
	    this.getTrackedEntities = function () {
	        return this.trackedEntities;
	    };
	
	    this.setSortColumn = function (sortColumn) {
	        if (this.advancedSearchOptions) {
	            this.advancedSearchOptions.sortColumn = sortColumn;
	        }
	    };
	
	    this.setColumnReverse = function (reverseSortStatus) {
	        if (this.advancedSearchOptions) {
	            this.advancedSearchOptions.reverse = reverseSortStatus;
	        }
	    };
	
	    this.setGridColumns = function (gridColumns) {
	        if (this.advancedSearchOptions) {
	            this.advancedSearchOptions.gridColumns = gridColumns;
	        }
	    };
	}).service('AuditHistoryDataService', ["$http", "$translate", "NotificationService", "DHIS2URL", function ($http, $translate, NotificationService, DHIS2URL) {
	    this.getAuditHistoryData = function (dataId, dataType) {
	        var url = "";
	        if (dataType === "attribute") {
	            url = "/api/audits/trackedEntityAttributeValue?tei=" + dataId + "&skipPaging=true";
	        } else {
	            url = "/api/audits/trackedEntityDataValue?psi=" + dataId + "&skipPaging=true";
	        }
	
	        var promise = $http.get(DHIS2URL + url).then(function (response) {
	            return response.data;
	        }, function (response) {
	            if (response && response.data && response.data.status === 'ERROR') {
	                var headerText = response.data.status;
	                var bodyText = response.data.message ? response.data.message : $translate.instant('unable_to_fetch_data_from_server');
	                NotificationService.showNotifcationDialog(headerText, bodyText);
	            }
	        });
	        return promise;
	    };
	}])
	
	/* Factory for fetching OrgUnit */
	.factory('OrgUnitFactory', ["$http", "DHIS2URL", "$q", "SessionStorageService", function ($http, DHIS2URL, $q, SessionStorageService) {
	    var orgUnit, orgUnitPromise, rootOrgUnitPromise, orgUnitTreePromise;
	    return {
	        getChildren: function getChildren(uid) {
	            if (orgUnit !== uid) {
	                orgUnitPromise = $http.get(DHIS2URL + '/api/organisationUnits/' + uid + '.json?fields=id,path,children[id,displayName,level,organisationUnitGroups[attributeValues[value,attribute[code]]],children[id]]&paging=false').then(function (response) {
	                    orgUnit = uid;
	                    return response.data;
	                });
	            }
	            return orgUnitPromise;
	        },
	        get: function get(uid) {
	            if (orgUnit !== uid) {
	                orgUnitPromise = $http.get(DHIS2URL + '/api/organisationUnits/' + uid + '.json?fields=id,displayName,level,path').then(function (response) {
	                    orgUnit = uid;
	                    return response.data;
	                });
	            }
	            return orgUnitPromise;
	        },
	        getViewTreeRoot: function getViewTreeRoot() {
	            if (!rootOrgUnitPromise) {
	                var url = DHIS2URL + '/api/me.json?fields=organisationUnits[id,displayName,level,path,children[id,displayName,level,children[id]]],dataViewOrganisationUnits[id,displayName,level,path,organisationUnitGroups[attributeValues[value,attribute[code]]],children[id,displayName,level,children[id]]]&paging=false';
	                rootOrgUnitPromise = $http.get(url).then(function (response) {
	                    response.data.organisationUnits = response.data.dataViewOrganisationUnits && response.data.dataViewOrganisationUnits.length > 0 ? response.data.dataViewOrganisationUnits : response.data.organisationUnits;
	                    delete response.data.dataViewOrganisationUnits;
	                    return response.data;
	                });
	            }
	            return rootOrgUnitPromise;
	        },
	        getSearchTreeRoot: function getSearchTreeRoot() {
	            if (!rootOrgUnitPromise) {
	                var url = DHIS2URL + '/api/me.json?fields=organisationUnits[id,displayName,level,path,children[id,displayName,level,children[id]]],teiSearchOrganisationUnits[id,displayName,level,path,children[id,displayName,level,children[id]]]&paging=false';
	                rootOrgUnitPromise = $http.get(url).then(function (response) {
	                    response.data.organisationUnits = response.data.teiSearchOrganisationUnits && response.data.teiSearchOrganisationUnits.length > 0 ? response.data.teiSearchOrganisationUnits : response.data.organisationUnits;
	                    delete response.data.teiSearchOrganisationUnits;
	                    return response.data;
	                });
	            }
	            return rootOrgUnitPromise;
	        },
	        getOrgUnits: function getOrgUnits(uid, fieldUrl) {
	            var url = DHIS2URL + '/api/organisationUnits.json?filter=id:eq:' + uid + '&' + fieldUrl + '&paging=false';
	            orgUnitTreePromise = $http.get(url).then(function (response) {
	                return response.data;
	            });
	            return orgUnitTreePromise;
	        },
	        getOrgUnit: function getOrgUnit(uid) {
	            var def = $q.defer();
	            var selectedOrgUnit = SessionStorageService.get('SELECTED_OU');
	            if (selectedOrgUnit) {
	                def.resolve(selectedOrgUnit);
	            } else if (uid) {
	                this.get(uid).then(function (response) {
	                    if (response.organisationUnits && response.organisationUnits[0]) {
	                        def.resolve({
	                            displayName: response.organisationUnits[0].displayName,
	                            id: response.organisationUnits[0].id
	                        });
	                    } else if (response && response.id) {
	                        def.resolve(response);
	                    } else {
	                        def.resolve(null);
	                    }
	                });
	            } else {
	                def.resolve(null);
	            }
	            return def.promise;
	        }
	    };
	}]);

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/* global moment, angular, directive, dhis2, selection */
	
	'use strict';
	
	/* Directives */
	
	var d2Directives = angular.module('d2Directives', []).directive('selectedOrgUnit', ["$timeout", function ($timeout) {
	    return {
	        restrict: 'A',
	        link: function link(scope, element, attrs) {
	
	            $("#orgUnitTree").one("ouwtLoaded", function (event, ids, names) {
	                if (dhis2.tc && dhis2.tc.metaDataCached) {
	                    $timeout(function () {
	                        scope.treeLoaded = true;
	                        scope.$apply();
	                    });
	                    selection.responseReceived();
	                } else {
	                    console.log('Finished loading orgunit tree');
	                    $("#orgUnitTree").addClass("disable-clicks"); //Disable ou selection until meta-data has downloaded
	                    $timeout(function () {
	                        scope.treeLoaded = true;
	                        scope.$apply();
	                    });
	                    //downloadMetaData();
	                }
	            });
	
	            //listen to user selection, and inform angular
	            selection.setListenerFunction(setSelectedOu, true);
	            function setSelectedOu(ids, names) {
	
	                if (ids[0] && names[0]) {
	                    var ou = { id: ids[0], displayName: names[0] };
	                    $timeout(function () {
	                        scope.selectedOrgUnit = ou;
	                        scope.$apply();
	                    });
	                }
	            }
	        }
	    };
	}]).directive('d2SetFocus', ["$timeout", function ($timeout) {
	
	    return {
	        scope: { trigger: '@d2SetFocus' },
	        link: function link(scope, element) {
	            scope.$watch('trigger', function (value) {
	                if (value === "true") {
	                    $timeout(function () {
	                        element[0].focus();
	                    });
	                }
	            });
	        }
	    };
	}]).directive('d2LeftBar', function () {
	
	    return {
	        restrict: 'E',
	        templateUrl: 'views/left-bar.html',
	        link: function link(scope, element, attrs) {
	
	            $("#searchIcon").click(function () {
	                $("#searchSpan").toggle();
	                $("#searchField").focus();
	            });
	
	            $("#searchField").autocomplete({
	                source: "../dhis-web-commons/ouwt/getOrganisationUnitsByName.action",
	                select: function select(event, ui) {
	                    $("#searchField").val(ui.item.value);
	                    selection.findByName();
	                }
	            });
	        }
	    };
	}).directive('blurOrChange', function () {
	
	    return function (scope, elem, attrs) {
	        elem.calendarsPicker({
	            onSelect: function onSelect() {
	                scope.$apply(attrs.blurOrChange);
	                $(this).change();
	            }
	        }).change(function () {
	            scope.$apply(attrs.blurOrChange);
	        });
	    };
	}).directive('d2Enter', function () {
	    return function (scope, element, attrs) {
	        element.bind("keydown keypress", function (event) {
	            if (event.which === 13) {
	                scope.$apply(function () {
	                    scope.$eval(attrs.d2Enter);
	                });
	                event.preventDefault();
	            }
	        });
	    };
	}).directive('d2PopOver', ["$compile", "$templateCache", "$translate", function ($compile, $templateCache, $translate) {
	
	    return {
	        restrict: 'EA',
	        scope: {
	            content: '=',
	            title: '@details',
	            template: "@template",
	            placement: "@placement",
	            trigger: "@trigger"
	        },
	        link: function link(scope, element, attrs) {
	            var content = $templateCache.get(scope.template);
	            content = $compile(content)(scope);
	            scope.content.heading = scope.content.value && scope.content.value.length > 20 ? scope.content.value.substring(0, 20).concat('...') : scope.content.value;
	            var options = {
	                content: content,
	                placement: scope.placement ? scope.placement : 'auto',
	                trigger: scope.trigger ? scope.trigger : 'hover',
	                html: true,
	                title: $translate.instant('_details')
	            };
	            element.popover(options);
	
	            $('body').on('click', function (e) {
	                if (!element[0].contains(e.target)) {
	                    element.popover('hide');
	                }
	            });
	        }
	    };
	}]).directive('d2Sortable', ["$timeout", function ($timeout) {
	
	    return {
	        restrict: 'A',
	        link: function link(scope, element, attrs) {
	            element.sortable({
	                connectWith: ".connectedSortable",
	                placeholder: "ui-state-highlight",
	                tolerance: "pointer",
	                handle: '.handle',
	                change: function change(event, ui) {
	                    $timeout(function () {
	                        scope.widgetsOrder = getSortedItems(ui);
	                        scope.$apply();
	                    });
	                },
	                receive: function receive(event, ui) {
	                    $timeout(function () {
	                        scope.widgetsOrder = getSortedItems(ui);
	                        scope.$apply();
	                    });
	                }
	            });
	
	            var getSortedItems = function getSortedItems(ui) {
	                var biggerWidgets = $("#biggerWidget").sortable("toArray");
	                var smallerWidgets = $("#smallerWidget").sortable("toArray");
	                var movedIsIdentifeid = false;
	
	                //look for the moved item in the bigger block
	                for (var i = 0; i < biggerWidgets.length && !movedIsIdentifeid; i++) {
	                    if (biggerWidgets[i] === "") {
	                        biggerWidgets[i] = ui.item[0].id;
	                        movedIsIdentifeid = true;
	                    }
	                }
	
	                //look for the moved item in the smaller block
	                for (var i = 0; i < smallerWidgets.length && !movedIsIdentifeid; i++) {
	                    if (smallerWidgets[i] === "") {
	                        smallerWidgets[i] = ui.item[0].id;
	                        movedIsIdentifeid = true;
	                    }
	                }
	                return { smallerWidgets: smallerWidgets, biggerWidgets: biggerWidgets };
	            };
	        }
	    };
	}]).directive('serversidePaginator', function factory() {
	
	    return {
	        restrict: 'E',
	        controller: ["$scope", "Paginator", function controller($scope, Paginator) {
	            $scope.paginator = Paginator;
	        }],
	        templateUrl: '../dhis-web-commons/angular-forms/serverside-pagination.html'
	    };
	}).directive('basicServersidePaginator', function factory() {
	
	    return {
	        restrict: 'E',
	        controller: ["$scope", "Paginator", function controller($scope, Paginator) {
	            $scope.paginator = Paginator;
	        }],
	        templateUrl: 'views/basic-serverside-pagination.html'
	    };
	}).directive('d2CustomDataEntryForm', ["$compile", function ($compile) {
	    return {
	        restrict: 'E',
	        link: function link(scope, elm, attrs) {
	            scope.$watch('customDataEntryForm', function () {
	                if (angular.isObject(scope.customDataEntryForm)) {
	                    elm.html(scope.customDataEntryForm.htmlCode);
	                    $compile(elm.contents())(scope);
	                }
	            });
	        }
	    };
	}]).directive('d2CustomRegistrationForm', ["$compile", function ($compile) {
	    return {
	        restrict: 'E',
	        link: function link(scope, elm, attrs) {
	            scope.$watch('customRegistrationForm', function () {
	                if (angular.isObject(scope.customRegistrationForm)) {
	                    elm.html(scope.customRegistrationForm.htmlCode);
	                    $compile(elm.contents())(scope);
	                }
	            });
	        }
	    };
	}])
	
	/* TODO: this directive access an element #contextMenu somewhere in the document. Looks like it has to be rewritten */
	.directive('d2ContextMenu', function () {
	
	    return {
	        restrict: 'A',
	        link: function link(scope, element, attrs) {
	            var contextMenu = $("#contextMenu");
	
	            element.click(function (e) {
	                var menuHeight = contextMenu.height();
	                var menuWidth = contextMenu.width();
	                var winHeight = $(window).height();
	                var winWidth = $(window).width();
	
	                var pageX = e.pageX;
	                var pageY = e.pageY;
	
	                contextMenu.show();
	
	                if (menuWidth + pageX > winWidth) {
	                    pageX -= menuWidth;
	                }
	
	                if (menuHeight + pageY > winHeight) {
	                    pageY -= menuHeight;
	
	                    if (pageY < 0) {
	                        pageY = e.pageY;
	                    }
	                }
	
	                contextMenu.css({
	                    left: pageX,
	                    top: pageY
	                });
	
	                return false;
	            });
	
	            contextMenu.on("click", "a", function () {
	                contextMenu.hide();
	            });
	
	            $(document).click(function () {
	                contextMenu.hide();
	            });
	        }
	    };
	}).directive('d2Date', ["CalendarService", "$parse", function (CalendarService, $parse) {
	    return {
	        restrict: 'A',
	        require: 'ngModel',
	        link: function link(scope, element, attrs, ctrl) {
	            var calendarSetting = CalendarService.getSetting();
	            var dateFormat = 'yyyy-mm-dd';
	            if (calendarSetting.keyDateFormat === 'dd-MM-yyyy') {
	                dateFormat = 'dd-mm-yyyy';
	            }
	
	            var minDate = $parse(attrs.minDate)(scope);
	            var maxDate = $parse(attrs.maxDate)(scope);
	            var calendar = $.calendars.instance(calendarSetting.keyCalendar);
	
	            var initializeDatePicker = function initializeDatePicker(sDate, eDate) {
	                element.calendarsPicker({
	                    changeMonth: true,
	                    dateFormat: dateFormat,
	                    yearRange: '-120:+30',
	                    minDate: sDate,
	                    maxDate: eDate,
	                    calendar: calendar,
	                    duration: "fast",
	                    showAnim: "",
	                    renderer: $.calendars.picker.themeRollerRenderer,
	                    onSelect: function onSelect() {
	                        $(this).change();
	                    }
	                }).change(function () {
	                    ctrl.$setViewValue(this.value);
	                    this.focus();
	                    scope.$apply();
	                });
	            };
	
	            initializeDatePicker(minDate, maxDate);
	
	            scope.$watch(attrs.minDate, function (value) {
	                element.calendarsPicker('destroy');
	                initializeDatePicker(value, $parse(attrs.maxDate)(scope));
	            });
	
	            scope.$watch(attrs.maxDate, function (value) {
	                element.calendarsPicker('destroy');
	                initializeDatePicker($parse(attrs.minDate)(scope), value);
	            });
	        }
	    };
	}]).directive('d2FileInput', ["DHIS2EventService", "DHIS2EventFactory", "FileService", "DialogService", function (DHIS2EventService, DHIS2EventFactory, FileService, DialogService) {
	
	    return {
	        restrict: "A",
	        scope: {
	            d2FileInputList: '=',
	            d2FileInput: '=',
	            d2FileInputName: '=',
	            d2FileInputCurrentName: '=',
	            d2FileInputPs: '='
	        },
	        link: function link(scope, element, attrs) {
	
	            var de = attrs.inputFieldId;
	
	            var updateModel = function updateModel() {
	
	                var update = scope.d2FileInput.event && scope.d2FileInput.event !== 'SINGLE_EVENT' ? true : false;
	
	                FileService.upload(element[0].files[0]).then(function (data) {
	
	                    if (data && data.status === 'OK' && data.response && data.response.fileResource && data.response.fileResource.id && data.response.fileResource.name) {
	
	                        scope.d2FileInput[de] = data.response.fileResource.id;
	                        scope.d2FileInputCurrentName[de] = data.response.fileResource.name;
	                        if (update) {
	                            if (!scope.d2FileInputName[scope.d2FileInput.event]) {
	                                scope.d2FileInputName[scope.d2FileInput.event] = [];
	                            }
	                            scope.d2FileInputName[scope.d2FileInput.event][de] = data.response.fileResource.name;
	
	                            var updatedSingleValueEvent = { event: scope.d2FileInput.event, dataValues: [{ value: data.response.fileResource.id, dataElement: de }] };
	                            var updatedFullValueEvent = DHIS2EventService.reconstructEvent(scope.d2FileInput, scope.d2FileInputPs.programStageDataElements);
	                            DHIS2EventFactory.updateForSingleValue(updatedSingleValueEvent, updatedFullValueEvent).then(function (data) {
	                                scope.d2FileInputList = DHIS2EventService.refreshList(scope.d2FileInputList, scope.d2FileInput);
	                            });
	                        }
	                    } else {
	                        var dialogOptions = {
	                            headerText: 'error',
	                            bodyText: 'file_upload_failed'
	                        };
	                        DialogService.showDialog({}, dialogOptions);
	                    }
	                });
	            };
	            element.bind('change', updateModel);
	        }
	    };
	}]).directive('d2FileInputDelete', ["$parse", "$timeout", "FileService", "DialogService", function ($parse, $timeout, FileService, DialogService) {
	
	    return {
	        restrict: "A",
	        link: function link(scope, element, attrs) {
	            var valueGetter = $parse(attrs.d2FileInputDelete);
	            var nameGetter = $parse(attrs.d2FileInputName);
	            var nameSetter = nameGetter.assign;
	
	            if (valueGetter(scope)) {
	                FileService.get(valueGetter(scope)).then(function (data) {
	                    if (data && data.name && data.id) {
	                        $timeout(function () {
	                            nameSetter(scope, data.name);
	                            scope.$apply();
	                        });
	                    } else {
	                        var dialogOptions = {
	                            headerText: 'error',
	                            bodyText: 'file_missing'
	                        };
	                        DialogService.showDialog({}, dialogOptions);
	                    }
	                });
	            }
	        }
	    };
	}]).directive('d2Audit', ["CurrentSelection", "MetaDataFactory", function (CurrentSelection, MetaDataFactory) {
	    return {
	        restrict: 'E',
	        template: '<span class="hideInPrint audit-icon" title="{{\'audit_history\' | translate}}" data-ng-click="showAuditHistory()">' + '<i class="glyphicon glyphicon-user""></i>' + '</span>',
	        scope: {
	            eventId: '@',
	            type: '@',
	            nameIdMap: '='
	        },
	        controller: ["$scope", "$modal", function controller($scope, $modal) {
	            $scope.showAuditHistory = function () {
	
	                var openModal = function openModal(ops) {
	                    $modal.open({
	                        templateUrl: "../dhis-web-commons/angular-forms/audit-history.html",
	                        controller: "AuditHistoryController",
	                        resolve: {
	                            eventId: function eventId() {
	                                return $scope.eventId;
	                            },
	                            dataType: function dataType() {
	                                return $scope.type;
	                            },
	                            nameIdMap: function nameIdMap() {
	                                return $scope.nameIdMap;
	                            },
	                            optionSets: function optionSets() {
	                                return ops;
	                            }
	                        }
	                    });
	                };
	
	                var optionSets = CurrentSelection.getOptionSets();
	                if (!optionSets) {
	                    optionSets = [];
	                    MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	                        angular.forEach(optionSets, function (optionSet) {
	                            optionSets[optionSet.id] = optionSet;
	                        });
	                        CurrentSelection.setOptionSets(optionSets);
	                        openModal(optionSets);
	                    });
	                } else {
	                    openModal(optionSets);
	                }
	            };
	        }]
	    };
	}]).directive('d2RadioButton', function () {
	    return {
	        restrict: 'E',
	        templateUrl: '../dhis-web-commons/angular-forms/radio-button.html',
	        scope: {
	            required: '=dhRequired',
	            value: '=dhValue',
	            disabled: '=dhDisabled',
	            name: '@dhName',
	            customOnClick: '&dhClick',
	            currentElement: '=dhCurrentElement',
	            event: '=dhEvent',
	            id: '=dhId'
	        },
	        controller: ['$scope', '$element', '$attrs', '$q', 'CommonUtils', function ($scope, $element, $attrs, $q, CommonUtils) {
	
	            $scope.status = "";
	            $scope.clickedButton = "";
	
	            $scope.valueClicked = function (buttonValue) {
	
	                $scope.clickedButton = buttonValue;
	
	                var originalValue = $scope.value;
	                var tempValue = buttonValue;
	                if ($scope.value === buttonValue) {
	                    tempValue = "";
	                }
	
	                if (angular.isDefined($scope.customOnClick)) {
	                    var promise = $scope.customOnClick({ value: tempValue });
	                    if (angular.isDefined(promise) && angular.isDefined(promise.then)) {
	                        promise.then(function (status) {
	                            if (angular.isUndefined(status) || status !== "notSaved") {
	                                $scope.status = "saved";
	                            }
	                            $scope.value = tempValue;
	                        }, function () {
	                            $scope.status = "error";
	                            $scope.value = originalValue;
	                        });
	                    } else if (angular.isDefined(promise)) {
	                        if (promise === false) {
	                            $scope.value = originalValue;
	                        } else {
	                            $scope.value = tempValue;
	                        }
	                    } else {
	                        $scope.value = tempValue;
	                    }
	                } else {
	                    $scope.value = tempValue;
	                }
	            };
	
	            $scope.getDisabledValue = function (inValue) {
	                return CommonUtils.displayBooleanAsYesNo(inValue);
	            };
	
	            $scope.getDisabledIcon = function (inValue) {
	                if (inValue === true || inValue === "true") {
	                    return "fa fa-check";
	                } else if (inValue === false || inValue === "false") {
	                    return "fa fa-times";
	                }
	                return '';
	            };
	        }],
	        link: function link(scope, element, attrs) {
	
	            scope.radioButtonColor = function (buttonValue) {
	
	                if (scope.value !== "") {
	                    if (scope.status === "saved") {
	                        if (angular.isUndefined(scope.currentElement) || scope.currentElement.id === scope.id && scope.currentElement.event === scope.event) {
	                            if (scope.clickedButton === buttonValue) {
	                                return 'radio-save-success';
	                            }
	                        }
	                        //different solution with text chosen
	                        /*else if(scope.status === "error"){
	                            if(scope.clickedButton === buttonValue){
	                                return 'radio-save-error';
	                            }
	                        }*/
	                    }
	                }
	                return 'radio-white';
	            };
	
	            scope.errorStatus = function () {
	
	                if (scope.status === 'error') {
	                    if (angular.isUndefined(scope.currentElement) || scope.currentElement.id === scope.id && scope.currentElement.event === scope.event) {
	                        return true;
	                    }
	                }
	                return false;
	            };
	
	            scope.radioButtonImage = function (buttonValue) {
	
	                if (angular.isDefined(scope.value)) {
	                    if (scope.value === buttonValue && buttonValue === "true") {
	                        return 'fa fa-stack-1x fa-check';
	                    } else if (scope.value === buttonValue && buttonValue === "false") {
	                        return 'fa fa-stack-1x fa-times';
	                    }
	                }
	                return 'fa fa-stack-1x';
	            };
	        }
	    };
	}).directive('dhis2Deselect', ["$document", function ($document) {
	    return {
	        restrict: 'A',
	        scope: {
	            onDeselected: '&dhOnDeselected',
	            id: '@dhId',
	            preSelected: '=dhPreSelected',
	            abortDeselect: '&dhAbortDeselect'
	        },
	        controller: ['$scope', '$element', '$attrs', '$q', function ($scope, $element, $attrs, $q) {
	
	            $scope.documentEventListenerSet = false;
	            $scope.elementClicked = false;
	
	            $element.on('click', function (event) {
	
	                $scope.elementClicked = true;
	                if ($scope.documentEventListenerSet === false) {
	                    $document.on('click', $scope.documentClick);
	                    $scope.documentEventListenerSet = true;
	                }
	            });
	
	            $scope.documentClick = function (event) {
	                var modalPresent = $(".modal-backdrop").length > 0;
	                var calendarPresent = $(".calendars-popup").length > 0;
	                var calendarPresentInEvent = $(event.target).parents(".calendars-popup").length > 0;
	                if ($scope.abortDeselect()) {
	                    $document.off('click', $scope.documentClick);
	                    $scope.documentEventListenerSet = false;
	                } else if ($scope.elementClicked === false && modalPresent === false && calendarPresent === false && calendarPresentInEvent === false) {
	                    $scope.onDeselected({ id: $scope.id });
	                    $scope.$apply();
	                    $document.off('click', $scope.documentClick);
	                    $scope.documentEventListenerSet = false;
	                }
	                $scope.elementClicked = false;
	            };
	
	            if (angular.isDefined($scope.preSelected) && $scope.preSelected === true) {
	                $document.on('click', $scope.documentClick);
	                $scope.documentEventListenerSet = true;
	            }
	        }],
	        link: function link(scope, element, attrs) {}
	    };
	}]).directive('d2CanMenu', function () {
	
	    return {
	        restrict: 'E',
	        templateUrl: '../dhis-web-action-mapping/angular-forms/can-menu.html',
	        link: function link(scope, element, attrs) {}
	    };
	});

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	'use strict';
	
	angular.module("d2Directives").directive('d2NumberValidator', function () {
	
	    return {
	        require: 'ngModel',
	        restrict: 'A',
	        link: function link(scope, element, attrs, ngModel) {
	
	            function setValidity(numberType, isRequired) {
	                if (numberType === 'NUMBER') {
	                    ngModel.$validators.number = function (value) {
	                        value = value === 0 ? value.toString() : value;
	                        return value === 'null' || !value ? !isRequired : dhis2.validation.isNumber(value);
	                    };
	                } else if (numberType === 'INTEGER_POSITIVE') {
	                    ngModel.$validators.posInt = function (value) {
	                        value = value === 0 ? value.toString() : value;
	                        return value === 'null' || !value ? !isRequired : dhis2.validation.isPositiveInt(value);
	                    };
	                } else if (numberType === 'INTEGER_NEGATIVE') {
	                    ngModel.$validators.negInt = function (value) {
	                        value = value === 0 ? value.toString() : value;
	                        return value === 'null' || !value ? !isRequired : dhis2.validation.isNegativeInt(value);
	                    };
	                } else if (numberType === 'INTEGER_ZERO_OR_POSITIVE') {
	                    ngModel.$validators.zeroPositiveInt = function (value) {
	                        value = value === 0 ? value.toString() : value;
	                        return value === 'null' || !value ? !isRequired : dhis2.validation.isZeroOrPositiveInt(value);
	                    };
	                } else if (numberType === 'INTEGER') {
	                    ngModel.$validators.int = function (value) {
	                        value = value === 0 ? value.toString() : value;
	                        return value === 'null' || !value ? !isRequired : dhis2.validation.isInt(value);
	                    };
	                }
	            }
	
	            var numberType = attrs.numberType;
	            var isRequired = attrs.ngRequired === 'true';
	            setValidity(numberType, isRequired);
	        }
	    };
	}).directive("d2DateValidator", ["DateUtils", "CalendarService", "$parse", function (DateUtils, CalendarService, $parse) {
	    return {
	        restrict: "A",
	        require: "ngModel",
	        link: function link(scope, element, attrs, ngModel) {
	
	            var isRequired = attrs.ngRequired === 'true';
	
	            ngModel.$validators.dateValidator = function (value) {
	                if (!value) {
	                    return !isRequired;
	                }
	                var convertedDate = DateUtils.format(angular.copy(value));
	                var isValid = value === convertedDate;
	                return isValid;
	            };
	
	            ngModel.$validators.futureDateValidator = function (value) {
	                if (!value) {
	                    return !isRequired;
	                }
	                var maxDate = $parse(attrs.maxDate)(scope);
	                var convertedDate = DateUtils.format(angular.copy(value));
	                var isValid = value === convertedDate;
	                if (isValid) {
	                    isValid = maxDate === 0 ? !moment(convertedDate).isAfter(DateUtils.getToday()) : isValid;
	                }
	                return isValid;
	            };
	        }
	    };
	}]).directive("d2CustomCoordinateValidator", function () {
	    return {
	        restrict: "A",
	        require: "ngModel",
	        link: function link(scope, element, attrs, ngModel) {
	
	            var isRequired = attrs.ngRequired === 'true';
	
	            ngModel.$validators.customCoordinateValidator = function (value) {
	                if (!value) {
	                    return !isRequired;
	                }
	
	                var coordinate = value.split(",");
	
	                if (!coordinate || coordinate.length !== 2) {
	                    return false;
	                }
	
	                if (!dhis2.validation.isNumber(coordinate[0])) {
	                    return false;
	                }
	
	                if (!dhis2.validation.isNumber(coordinate[1])) {
	                    return false;
	                }
	
	                return coordinate[0] >= -180 && coordinate[0] <= 180 && coordinate[1] >= -90 && coordinate[1] <= 90;
	            };
	        }
	    };
	}).directive("d2CoordinateValidator", function () {
	    return {
	        restrict: "A",
	        require: "ngModel",
	        link: function link(scope, element, attrs, ngModel) {
	
	            var isRequired = attrs.ngRequired === 'true';
	
	            if (attrs.name === 'latitude') {
	                ngModel.$validators.latitudeValidator = function (value) {
	                    if (!value) {
	                        return !isRequired;
	                    }
	
	                    if (!dhis2.validation.isNumber(value)) {
	                        return false;
	                    }
	                    return value >= -90 && value <= 90;
	                };
	            }
	
	            if (attrs.name === 'longitude') {
	                ngModel.$validators.longitudeValidator = function (value) {
	                    if (!value) {
	                        return !isRequired;
	                    }
	
	                    if (!dhis2.validation.isNumber(value)) {
	                        return false;
	                    }
	                    return value >= -180 && value <= 180;
	                };
	            }
	        }
	    };
	}).directive("d2OptionValidator", ["$translate", "NotificationService", function ($translate, NotificationService) {
	    return {
	        restrict: "A",
	        require: "ngModel",
	        link: function link(scope, element, attrs, ngModel) {
	
	            var isRequired = attrs.ngRequired === 'true';
	
	            ngModel.$validators.optionValidator = function (value) {
	
	                var res = !value ? !isRequired : true;
	
	                if (!res) {
	                    var headerText = $translate.instant("validation_error");
	                    var bodyText = $translate.instant("option_required");
	                    NotificationService.showNotifcationDialog(headerText, bodyText);
	                }
	                return res;
	            };
	        }
	    };
	}]).directive("d2AttributeValidator", ["$q", "TEIService", "SessionStorageService", function ($q, TEIService, SessionStorageService) {
	    return {
	        restrict: "A",
	        require: "ngModel",
	        link: function link(scope, element, attrs, ngModel) {
	
	            function uniqunessValidatior(attributeData) {
	
	                ngModel.$asyncValidators.uniqunessValidator = function (modelValue, viewValue) {
	                    var pager = { pageSize: 1, page: 1, toolBarDisplay: 5 };
	                    var deferred = $q.defer(),
	                        currentValue = modelValue || viewValue,
	                        programUrl = null,
	                        ouMode = 'ALL';
	
	                    if (currentValue) {
	
	                        attributeData.value = currentValue;
	                        var attUrl = 'filter=' + attributeData.id + ':EQ:' + attributeData.value;
	                        var ouId = SessionStorageService.get('ouSelected');
	
	                        if (attrs.selectedProgram && attributeData.programScope) {
	                            programUrl = 'program=' + attrs.selectedProgram;
	                        }
	
	                        if (attributeData.orgUnitScope) {
	                            ouMode = 'SELECTED';
	                        }
	
	                        TEIService.search(ouId, ouMode, null, programUrl, attUrl, pager, true).then(function (data) {
	                            if (attrs.selectedTeiId) {
	                                if (data && data.rows && data.rows.length && data.rows[0] && data.rows[0].length && data.rows[0][0] !== attrs.selectedTeiId) {
	                                    deferred.reject();
	                                }
	                            } else {
	                                if (data.rows.length > 0) {
	                                    deferred.reject();
	                                }
	                            }
	                            deferred.resolve();
	                        });
	                    } else {
	                        deferred.resolve();
	                    }
	
	                    return deferred.promise;
	                };
	            }
	
	            scope.$watch(attrs.ngDisabled, function (value) {
	                var attributeData = scope.$eval(attrs.attributeData);
	                if (!value) {
	                    if (attributeData && attributeData.unique && !value) {
	                        uniqunessValidatior(attributeData);
	                    }
	                }
	            });
	        }
	    };
	}]);

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Filters */
	
	var d2Filters = angular.module('d2Filters', []).filter('gridFilter', ["$filter", "CalendarService", function ($filter, CalendarService) {
	
	    return function (data, filters, filterTypes) {
	
	        if (!data) {
	            return;
	        }
	
	        if (!filters) {
	            return data;
	        } else {
	
	            var dateFilter = {},
	                textFilter = {},
	                numberFilter = {},
	                filteredData = data;
	
	            for (var key in filters) {
	
	                if (filterTypes[key] === 'DATE') {
	                    if (filters[key].start || filters[key].end) {
	                        dateFilter[key] = filters[key];
	                    }
	                } else if (filterTypes[key] === 'NUMBER' || filterTypes[key] === 'INTEGER' || filterTypes[key] === 'INTEGER_POSITIVE' || filterTypes[key] === 'INTEGER_NEGATIVE' || filterTypes[key] === 'INTEGER_ZERO_OR_POSITIVE') {
	                    if (filters[key].start || filters[key].end) {
	                        numberFilter[key] = filters[key];
	                    }
	                } else {
	                    textFilter[key] = filters[key];
	                }
	            }
	
	            filteredData = $filter('filter')(filteredData, textFilter);
	            filteredData = $filter('filter')(filteredData, dateFilter, dateComparator);
	            filteredData = $filter('filter')(filteredData, numberFilter, numberComparator);
	
	            return filteredData;
	        }
	    };
	
	    function dateComparator(data, filter) {
	        var calendarSetting = CalendarService.getSetting();
	        var start = moment(filter.start, calendarSetting.momentFormat);
	        var end = moment(filter.end, calendarSetting.momentFormat);
	        var date = moment(data, calendarSetting.momentFormat);
	
	        if (filter.start && filter.end) {
	            return Date.parse(date) <= Date.parse(end) && Date.parse(date) >= Date.parse(start);
	        }
	        return Date.parse(date) <= Date.parse(end) || Date.parse(date) >= Date.parse(start);
	    }
	
	    function numberComparator(data, filter) {
	        var start = filter.start;
	        var end = filter.end;
	
	        if (filter.start && filter.end) {
	            return data <= end && data >= start;
	        }
	        return data <= end || data >= start;
	    }
	}]).filter('multiColumnFilter', function () {
	    return function (data, filterText) {
	
	        if (!data) {
	            return;
	        }
	
	        if (!filterText) {
	            return data;
	        } else {
	
	            return data.filter(function (item) {
	                filterText = filterText.toLowerCase();
	                var name = false,
	                    code = false,
	                    vote = false;
	
	                if (item.displayName) name = item.displayName.toLowerCase().indexOf(filterText) > -1;
	                if (item.code) code = item.code.toLowerCase().indexOf(filterText) > -1;
	                if (item.vote) vote = item.vote.toLowerCase().indexOf(filterText) > -1;
	
	                return name || code || vote;
	            });
	        }
	    };
	}).filter('emptyRowFilter', ["$filter", function ($filter) {
	    return function (data, hideEmptyRow) {
	        if (!data) {
	            return;
	        }
	
	        if (!hideEmptyRow) {
	            return data;
	        } else {
	            return $filter('filter')(data, { hasData: hideEmptyRow });
	        }
	    };
	}]).filter('paginate', ["Paginator", function (Paginator) {
	    return function (input, rowsPerPage) {
	        if (!input) {
	            return input;
	        }
	
	        if (rowsPerPage) {
	            Paginator.rowsPerPage = rowsPerPage;
	        }
	
	        Paginator.itemCount = input.length;
	
	        return input.slice(parseInt(Paginator.page * Paginator.rowsPerPage), parseInt((Paginator.page + 1) * Paginator.rowsPerPage + 1) - 1);
	    };
	}])
	
	/* trim away all single and double quotes in the start and end of a string*/
	.filter('trimquotes', function () {
	    return function (input) {
	        if (!input || typeof input !== 'string' && !(input instanceof String)) {
	            return input;
	        }
	
	        var beingTrimmed = input;
	        var trimmingComplete = false;
	        //Trim until no more quotes can be removed.
	        while (!trimmingComplete) {
	            var beforeTrimming = beingTrimmed;
	            beingTrimmed = input.replace(/^'/, "").replace(/'$/, "");
	            beingTrimmed = beingTrimmed.replace(/^"/, "").replace(/"$/, "");
	
	            if (beforeTrimming.length === beingTrimmed.length) {
	                trimmingComplete = true;
	            }
	        }
	
	        return beingTrimmed;
	    };
	})
	
	/* filter out confidential attributes from a list */
	.filter('nonConfidential', function () {
	    return function (items) {
	        var filtered = [];
	        angular.forEach(items, function (item) {
	            if (!item.confidential) {
	                filtered.push(item);
	            }
	        });
	        return filtered;
	    };
	})
	
	/* trim away the qualifiers before and after a variable name */
	.filter('trimvariablequalifiers', function () {
	    return function (input) {
	        if (!input || typeof input !== 'string' && !(input instanceof String)) {
	            return input;
	        }
	
	        var trimmed = input.replace(/^[#VCAvca]{/, "").replace(/}$/, "");
	
	        return trimmed;
	    };
	}).filter('forLoop', function () {
	    return function (input, start, end) {
	        input = new Array(end - start);
	        for (var i = 0; start < end; start++, i++) {
	            input[i] = start;
	        }
	        return input;
	    };
	});

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var d2Controllers = angular.module('d2Controllers', [])
	
	//Controller for column show/hide
	.controller('ColumnDisplayController', ["$scope", "$modalInstance", "hiddenGridColumns", "gridColumns", function ($scope, $modalInstance, hiddenGridColumns, gridColumns) {
	
	    $scope.gridColumns = gridColumns;
	    $scope.hiddenGridColumns = hiddenGridColumns;
	
	    $scope.close = function () {
	        $modalInstance.close($scope.gridColumns);
	    };
	
	    $scope.showHideColumns = function (gridColumn) {
	
	        if (gridColumn.show) {
	            $scope.hiddenGridColumns--;
	        } else {
	            $scope.hiddenGridColumns++;
	        }
	    };
	}])
	
	//controller for dealing with google map
	.controller('MapController', ["$scope", "$modalInstance", "$translate", "$http", "$window", "storage", "leafletData", "CurrentSelection", "DHIS2URL", "NotificationService", "location", function ($scope, $modalInstance, $translate, $http, $window, storage, leafletData, CurrentSelection, DHIS2URL, NotificationService, location) {
	
	    $scope.location = location;
	
	    var currentLevel = 0,
	        ouLevels = CurrentSelection.getOuLevels();
	
	    $scope.maxZoom = 8;
	
	    $scope.center = { lat: 8.88, lng: -11.55, zoom: $scope.maxZoom };
	
	    var systemSetting = storage.get('SYSTEM_SETTING');
	
	    var setCoordinateLabel = '<i class="fa fa-map-marker fa-2x"></i><span class="small-horizontal-spacing">' + $translate.instant('set_coordinate') + '</span>';
	    var zoomInLabel = '<i class="fa fa-search-plus fa-2x"></i><span class="small-horizontal-spacing">' + $translate.instant('zoom_in') + '</span>';
	    var zoomOutLabel = '<i class="fa fa-search-minus fa-2x"></i><span class="small-horizontal-spacing">' + $translate.instant('zoom_out') + '</span>';
	    var centerMapLabel = '<i class="fa fa-crosshairs fa-2x"></i><span class="small-horizontal-spacing">' + $translate.instant('center_map') + '</span>';
	
	    var contextmenuItems = [{
	        text: setCoordinateLabel,
	        callback: setCoordinate,
	        index: 0
	    }, {
	        separator: true,
	        index: 1
	    }, {
	        text: zoomInLabel,
	        callback: zoomIn,
	        index: 2
	    }, {
	        text: zoomOutLabel,
	        callback: zoomOut,
	        index: 3
	    }, {
	        separator: true,
	        index: 4
	    }, {
	        text: centerMapLabel,
	        callback: centerMap,
	        index: 5
	    }];
	
	    $scope.mapDefaults = { map: {
	            contextmenu: true,
	            contextmenuWidth: 180,
	            contextmenuItems: contextmenuItems
	        } };
	
	    var geojsonMarkerOptions = {
	        radius: 15,
	        fillColor: '#ff7800',
	        color: '#000',
	        weight: 1,
	        opacity: 1,
	        fillOpacity: 0.8
	    };
	
	    var style = { fillColor: "green",
	        weight: 1,
	        opacity: 0.8,
	        color: 'black',
	        fillOpacity: 0
	    };
	
	    $scope.marker = $scope.location && $scope.location.lat && $scope.location.lng ? { m1: { lat: $scope.location.lat, lng: $scope.location.lng, draggable: true } } : {};
	
	    function userNotification(headerMessage, errorMesage) {
	        var dialogOptions = {
	            headerText: headerMessage,
	            bodyText: errorMesage
	        };
	        DialogService.showDialog({}, dialogOptions);
	        return;
	    };
	
	    function highlightFeature(e) {
	        var layer = e.target;
	
	        layer.setStyle({
	            weight: 5,
	            color: '#666',
	            dashArray: '',
	            fillOpacity: 0.5
	        });
	
	        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	            layer.bringToFront();
	        }
	    }
	
	    function resetHighlight(e) {
	        var layer = e.target;
	        layer.setStyle(style);
	    }
	
	    function pointToLayer(feature, latlng) {
	        return L.circleMarker(latlng, geojsonMarkerOptions);
	    };
	
	    function onEachFeature(feature, layer) {
	
	        layer.on("mouseover", function (e) {
	            $("#polygon-label").text(feature.properties.name);
	            //highlightFeature(e);
	        });
	        layer.on("mouseout", function (e) {
	            $("#polygon-label").text('');
	            //resetHighlight(e);
	        });
	
	        if (layer._layers) {
	            layer.eachLayer(function (l) {
	                l.bindContextMenu({
	                    contextmenu: true,
	                    contextmenuWidth: 180,
	                    contextmenuItems: [{
	                        text: setCoordinateLabel,
	                        callback: function callback(e) {
	                            setCoordinate(e, feature);
	                        },
	                        index: 0
	                    }, {
	                        separator: true,
	                        index: 1
	                    }, {
	                        text: zoomInLabel,
	                        callback: function callback(e) {
	                            zoomIn(e, feature);
	                        },
	                        index: 2
	                    }, {
	                        text: zoomOutLabel,
	                        callback: function callback(e) {
	                            zoomOut(e, feature);
	                        },
	                        index: 3,
	                        disabled: currentLevel < 1
	                    }, {
	                        separator: true,
	                        index: 4
	                    }, {
	                        text: centerMapLabel,
	                        callback: function callback(e) {
	                            centerMap(e, feature);
	                        },
	                        index: 5
	                    }]
	                });
	            });
	        } else {
	            layer.bindContextMenu({
	                contextmenu: true,
	                contextmenuWidth: 180,
	                contextmenuInheritItems: false,
	                contextmenuItems: [{
	                    text: setCoordinateLabel,
	                    callback: function callback(e) {
	                        setCoordinate(e, feature, layer);
	                    },
	                    index: 0
	                }, {
	                    separator: true,
	                    index: 1
	                }, {
	                    text: zoomInLabel,
	                    callback: function callback(e) {
	                        zoomIn(e, feature);
	                    },
	                    disabled: true,
	                    index: 2
	                }, {
	                    text: zoomOutLabel,
	                    callback: function callback(e) {
	                        zoomOut(e, feature);
	                    },
	                    index: 3
	                }, {
	                    separator: true,
	                    index: 4
	                }, {
	                    text: centerMapLabel,
	                    callback: function callback(e) {
	                        centerMap(e, feature);
	                    },
	                    index: 5
	                }]
	            });
	        }
	    }
	
	    function getGeoJsonByOuLevel(initialize, event, mode) {
	        var url = null,
	            parent = null;
	        if (initialize) {
	            currentLevel = 0;
	            url = DHIS2URL + '/organisationUnits.geojson?level=' + ouLevels[currentLevel].level;
	        } else {
	            if (mode === 'IN') {
	                currentLevel++;
	                parent = event.id;
	            }
	            if (mode === 'OUT') {
	                currentLevel--;
	                var parents = event.properties.parentGraph.substring(1, event.properties.parentGraph.length - 1).split('/');
	                parent = parents[parents.length - 2];
	            }
	
	            if (ouLevels[currentLevel] && ouLevels[currentLevel].level && parent && !initialize) {
	                url = url = DHIS2URL + '/organisationUnits.geojson?level=' + ouLevels[currentLevel].level + '&parent=' + parent;
	            }
	        }
	
	        if (url) {
	
	            $http.get(url).success(function (data) {
	
	                $scope.currentGeojson = { data: data, style: style, onEachFeature: onEachFeature, pointToLayer: pointToLayer };
	
	                leafletData.getMap().then(function (map) {
	
	                    //var L = $window.L;
	                    var latlngs = [];
	
	                    angular.forEach($scope.currentGeojson.data.features, function (feature) {
	                        if (feature.geometry.type === "Point") {
	                            //latlngs.push( L.latLng( $scope.currentGeojson.data.features[0].geometry.coordinates) );
	                            //isPoints = true;
	                        } else {
	                            for (var i in feature.geometry.coordinates) {
	                                var coord = feature.geometry.coordinates[i];
	                                for (var j in coord) {
	                                    var points = coord[j];
	                                    for (var k in points) {
	                                        latlngs.push(L.GeoJSON.coordsToLatLng(points[k]));
	                                    }
	                                }
	                            }
	                        }
	                    });
	
	                    if ($scope.location && $scope.location.lat && $scope.location.lng) {
	                        map.setView([$scope.location.lat, $scope.location.lng], $scope.maxZoom);
	                    } else {
	                        if (latlngs.length > 0) {
	                            map.fitBounds(latlngs, { maxZoom: $scope.maxZoom });
	                        }
	                    }
	                });
	            });
	        }
	    }
	
	    leafletData.getMap().then(function (map) {
	
	        if ($scope.marker && $scope.marker.m1 && $scope.marker.m1.lat && $scope.marker.m1.lng) {
	            map.setView([$scope.marker.m1.lat, $scope.marker.m1.lng], $scope.maxZoom);
	        }
	
	        var L = $window.L;
	        $scope.geocoder = L.control.geocoder(systemSetting.keyMapzenSearchApiKey ? systemSetting.keyMapzenSearchApiKey : 'search-Se1CFzK', {
	            markers: {
	                draggable: true
	            }
	        }).addTo(map);
	
	        $scope.geocoder.on('select', function (e) {
	
	            $scope.marker = {};
	            $scope.location = { lat: e.latlng.lat, lng: e.latlng.lng };
	
	            $scope.geocoder.marker.on('dragend', function (e) {
	                var c = e.target.getLatLng();
	                $scope.location = { lat: c.lat, lng: c.lng };
	            });
	        });
	    });
	
	    getGeoJsonByOuLevel(true);
	
	    function zoomMap(event, mode) {
	        if (ouLevels && ouLevels.length > 0) {
	            getGeoJsonByOuLevel(false, event, mode);
	        }
	    }
	
	    function setCoordinate(e, feature, layer) {
	        if (feature && feature.geometry && feature.geometry.type === 'Point') {
	            var m = feature.geometry.coordinates;
	            $scope.marker = { m1: { lat: m[1], lng: m[0], draggable: true } };
	        } else {
	            $scope.marker = { m1: { lat: e.latlng.lat, lng: e.latlng.lng, draggable: true } };
	        }
	
	        $scope.location = { lat: $scope.marker.m1.lat, lng: $scope.marker.m1.lng };
	    };
	
	    function zoomIn(e, feature) {
	        $scope.maxZoom += 2;
	        if (feature && feature.id) {
	            zoomMap(feature, 'IN');
	        } else {
	            $scope.center = angular.copy(e.latlng);
	            $scope.center.zoom = $scope.maxZoom;
	        }
	    };
	
	    function zoomOut(e, feature) {
	        $scope.maxZoom -= 2;
	        if (feature && feature.id) {
	            zoomMap(feature, 'OUT');
	        } else {
	            $scope.center = angular.copy(e.latlng);
	            $scope.center.zoom = $scope.maxZoom;
	        }
	    };
	
	    function centerMap(e, feature) {
	        $scope.maxZoom += 2;
	        $scope.center.lat = e.latlng.lat;
	        $scope.center.lng = e.latlng.lng;
	    };
	
	    $scope.close = function () {
	        $modalInstance.close();
	    };
	
	    $scope.captureCoordinate = function () {
	        if ($scope.location && $scope.location.lng && $scope.location.lat) {
	            $modalInstance.close($scope.location);
	        } else {
	            //notify user
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("nothing_captured"));
	            return;
	        }
	    };
	
	    $scope.$on('leafletDirectiveMarker.dragend', function (e, args) {
	        $scope.marker.m1.lng = args.model.lng;
	        $scope.marker.m1.lat = args.model.lat;
	
	        $scope.location = { lng: args.model.lng, lat: args.model.lat };
	    });
	}])
	
	//Controller for audit history
	.controller('AuditHistoryController', ["$scope", "$modalInstance", "$translate", "AuditHistoryDataService", "DateUtils", "eventId", "dataType", "nameIdMap", "optionSets", "CommonUtils", function ($scope, $modalInstance, $translate, AuditHistoryDataService, DateUtils, eventId, dataType, nameIdMap, optionSets, CommonUtils) {
	
	    $scope.model = { type: dataType,
	        name: dataType === 'dataElement' ? $translate.instant('data_element') : $translate.instant('attribute'),
	        searchPlaceholder: dataType === 'dataElement' ? $translate.instant('search_by_data_element') : $translate.instant('search_by_attribute'),
	        auditColumns: ['name', 'auditType', 'value', 'modifiedBy', 'created'], itemList: [], uniqueRows: [] };
	
	    $scope.close = function () {
	        $modalInstance.close();
	    };
	
	    AuditHistoryDataService.getAuditHistoryData(eventId, dataType).then(function (data) {
	
	        $scope.model.itemList = [];
	        $scope.model.uniqueRows = [];
	
	        var reponseData = data.trackedEntityDataValueAudits ? data.trackedEntityDataValueAudits : data.trackedEntityAttributeValueAudits ? data.trackedEntityAttributeValueAudits : null;
	
	        if (reponseData) {
	            for (var index = 0; index < reponseData.length; index++) {
	                var dataValue = reponseData[index];
	                var audit = {},
	                    obj = {};
	                if (dataType === "attribute") {
	                    if (nameIdMap[dataValue.trackedEntityAttribute.id]) {
	                        obj = nameIdMap[dataValue.trackedEntityAttribute.id];
	                        audit.name = obj.displayName;
	                        audit.valueType = obj.valueType;
	                    }
	                } else if (dataType === "dataElement") {
	                    if (nameIdMap[dataValue.dataElement.id] && nameIdMap[dataValue.dataElement.id].dataElement) {
	                        obj = nameIdMap[dataValue.dataElement.id].dataElement;
	                        audit.name = obj.displayFormName;
	                        audit.valueType = obj.valueType;
	                    }
	                }
	
	                dataValue.value = CommonUtils.formatDataValue(null, dataValue.value, obj, optionSets, 'USER');
	                audit.auditType = dataValue.auditType;
	                audit.value = dataValue.value;
	                audit.modifiedBy = dataValue.modifiedBy;
	                audit.created = DateUtils.formatToHrsMinsSecs(dataValue.created);
	
	                $scope.model.itemList.push(audit);
	                if ($scope.model.uniqueRows.indexOf(audit.name) === -1) {
	                    $scope.model.uniqueRows.push(audit.name);
	                }
	
	                if ($scope.model.uniqueRows.length > 0) {
	                    $scope.model.uniqueRows = $scope.model.uniqueRows.sort();
	                }
	            }
	        }
	    });
	}]).controller('OrgUnitTreeController', ["$scope", "$modalInstance", "OrgUnitFactory", "orgUnitId", function ($scope, $modalInstance, OrgUnitFactory, orgUnitId) {
	
	    $scope.model = { selectedOrgUnitId: orgUnitId ? orgUnitId : null };
	
	    function expandOrgUnit(orgUnit, ou) {
	        if (ou.path.indexOf(orgUnit.path) !== -1) {
	            orgUnit.show = true;
	        }
	
	        orgUnit.hasChildren = orgUnit.children && orgUnit.children.length > 0 ? true : false;
	        if (orgUnit.hasChildren) {
	            for (var i = 0; i < orgUnit.children.length; i++) {
	                if (ou.path.indexOf(orgUnit.children[i].path) !== -1) {
	                    orgUnit.children[i].show = true;
	                    expandOrgUnit(orgUnit.children[i], ou);
	                }
	            }
	        }
	        return orgUnit;
	    };
	
	    function attachOrgUnit(orgUnits, orgUnit) {
	        for (var i = 0; i < orgUnits.length; i++) {
	            if (orgUnits[i].id === orgUnit.id) {
	                orgUnits[i] = orgUnit;
	                orgUnits[i].show = true;
	                orgUnits[i].hasChildren = orgUnits[i].children && orgUnits[i].children.length > 0 ? true : false;
	                return;
	            }
	            if (orgUnits[i].children && orgUnits[i].children.length > 0) {
	                attachOrgUnit(orgUnits[i].children, orgUnit);
	            }
	        }
	        return orgUnits;
	    };
	
	    //Get orgunits for the logged in user
	    OrgUnitFactory.getViewTreeRoot().then(function (response) {
	        $scope.orgUnits = response.organisationUnits;
	        var selectedOuFetched = false;
	        var levelsFetched = 0;
	        angular.forEach($scope.orgUnits, function (ou) {
	            ou.show = true;
	            levelsFetched = ou.level;
	            if (orgUnitId && orgUnitId === ou.id) {
	                selectedOuFetched = true;
	            }
	            angular.forEach(ou.children, function (o) {
	                levelsFetched = o.level;
	                o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                if (orgUnitId && !selectedOuFetched && orgUnitId === ou.id) {
	                    selectedOuFetched = true;
	                }
	            });
	        });
	
	        levelsFetched = levelsFetched > 0 ? levelsFetched - 1 : levelsFetched;
	
	        if (orgUnitId && !selectedOuFetched) {
	            var parents = null;
	            OrgUnitFactory.get(orgUnitId).then(function (ou) {
	                if (ou && ou.path) {
	                    parents = ou.path.substring(1, ou.path.length);
	                    parents = parents.split("/");
	                    if (parents && parents.length > 0) {
	                        var url = "fields=id,displayName,path,level,";
	                        for (var i = levelsFetched; i < ou.level; i++) {
	                            url = url + "children[id,displayName,level,path,";
	                        }
	
	                        url = url.substring(0, url.length - 1);
	                        for (var i = levelsFetched; i < ou.level; i++) {
	                            url = url + "]";
	                        }
	
	                        OrgUnitFactory.getOrgUnits(parents[levelsFetched], url).then(function (response) {
	                            if (response && response.organisationUnits && response.organisationUnits[0]) {
	                                response.organisationUnits[0].show = true;
	                                response.organisationUnits[0].hasChildren = response.organisationUnits[0].children && response.organisationUnits[0].children.length > 0 ? true : false;
	                                response.organisationUnits[0] = expandOrgUnit(response.organisationUnits[0], ou);
	                                $scope.orgUnits = attachOrgUnit($scope.orgUnits, response.organisationUnits[0]);
	                            }
	                        });
	                    }
	                }
	            });
	        }
	    });
	
	    //expand/collapse of search orgunit tree
	    $scope.expandCollapse = function (orgUnit) {
	        if (orgUnit.hasChildren) {
	            //Get children for the selected orgUnit
	            OrgUnitFactory.getChildren(orgUnit.id).then(function (ou) {
	                orgUnit.show = !orgUnit.show;
	                orgUnit.hasChildren = false;
	                orgUnit.children = ou.children;
	                angular.forEach(orgUnit.children, function (ou) {
	                    ou.hasChildren = ou.children && ou.children.length > 0 ? true : false;
	                });
	            });
	        } else {
	            orgUnit.show = !orgUnit.show;
	        }
	    };
	
	    $scope.setSelectedOrgUnit = function (orgUnitId) {
	        $scope.model.selectedOrgUnitId = orgUnitId;
	    };
	
	    $scope.select = function () {
	        $modalInstance.close($scope.model.selectedOrgUnitId);
	    };
	
	    $scope.close = function () {
	        $modalInstance.close();
	    };
	}]).controller('CANMenuController', ["$scope", "CommonUtils", function ($scope, CommonUtils) {
	    $scope.icons = CommonUtils.getIcons();
	}]);

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	/* global angular, moment, dhis2, parseFloat, indexedDB */
	
	'use strict';
	
	/* Services */
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var ndpFrameworkServices = angular.module('ndpFrameworkServices', ['ngResource']).factory('DDStorageService', function () {
	    var store = new dhis2.storage.Store({
	        name: "dhis2ndp",
	        adapters: [dhis2.storage.IndexedDBAdapter, dhis2.storage.DomSessionStorageAdapter, dhis2.storage.InMemoryAdapter],
	        objectStores: ['dataElements', 'dataElementGroups', 'dataElementGroupSets', 'dataSets', 'optionSets', 'categoryCombos', 'attributes', 'ouLevels', 'programs', 'legendSets', 'categoryOptionGroupSets', 'optionGroups']
	    });
	    return {
	        currentStore: store
	    };
	})
	
	/* Context menu for grid*/
	.service('SelectedMenuService', function () {
	    this.selectedMenu = null;
	
	    this.setSelectedMenu = function (selectedMenu) {
	        this.selectedMenu = selectedMenu;
	        console.log('le menu selectd est ', selectedMenu);
	    };
	
	    this.getSelectedMenu = function () {
	        return this.selectedMenu;
	    };
	}).service('CommonDataService', function () {
	    this.clusterDataSet = null;
	
	    this.setClusterDataSet = function (clusterDataSet) {
	        this.clusterDataSet = clusterDataSet;
	    };
	
	    this.getClusterDataSet = function () {
	        return this.clusterDataSet;
	    };
	}).service('NDPMenuService', ["$http", "CommonUtils", function ($http, CommonUtils) {
	    return {
	        getMenu: function getMenu() {
	            var menuFile = 'data/ndpMenu.json';
	            //var menuFile = 'data/ndpMenuSimplified.json';
	            var promise = $http.get(menuFile).then(function (response) {
	                return response.data;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        }
	    };
	}]).service('PeriodService', ["CalendarService", "DateUtils", "orderByFilter", function (CalendarService, DateUtils, orderByFilter) {
	
	    this.getPeriods = function (periodType, periodOffset, futurePeriods) {
	        if (!periodType) {
	            return [];
	        }
	
	        var calendarSetting = CalendarService.getSetting();
	
	        dhis2.period.format = calendarSetting.keyDateFormat;
	
	        dhis2.period.calendar = $.calendars.instance(calendarSetting.keyCalendar);
	
	        dhis2.period.generator = new dhis2.period.PeriodGenerator(dhis2.period.calendar, dhis2.period.format);
	
	        dhis2.period.picker = new dhis2.period.DatePicker(dhis2.period.calendar, dhis2.period.format);
	
	        var d2Periods = dhis2.period.generator.generateReversedPeriods(periodType, periodOffset);
	
	        d2Periods = dhis2.period.generator.filterOpenPeriods(periodType, d2Periods, futurePeriods, null, null);
	
	        angular.forEach(d2Periods, function (p) {
	            p.startDate = p._startDate._year + '-' + p._startDate._month.toString().padStart(2, '0') + '-' + p._startDate._day.toString().padStart(2, '0');
	            p.endDate = p._endDate._year + '-' + p._endDate._month.toString().padStart(2, '0') + '-' + p._endDate._day.toString().padStart(2, '0');
	            p.id = p.iso;
	        });
	
	        return d2Periods;
	    };
	
	    this.getPreviousPeriod = function (periodId, allPeriods) {
	        var index = -1,
	            previousPeriod = null;
	        if (periodId && allPeriods && allPeriods.length > 0) {
	            allPeriods = orderByFilter(allPeriods, '-id').reverse();
	            for (var i = 0; i < allPeriods.length; i++) {
	                if (allPeriods[i].id === periodId) {
	                    index = i;
	                }
	            }
	            if (index > 0) {
	                previousPeriod = allPeriods[index - 1];
	            }
	        }
	        return { location: index, period: previousPeriod };
	    };
	
	    this.getForDates = function (periodType, startDate, endDate) {
	        if (!periodType) {
	            return [];
	        }
	
	        var calendarSetting = CalendarService.getSetting();
	
	        dhis2.period.format = calendarSetting.keyDateFormat;
	
	        dhis2.period.calendar = $.calendars.instance(calendarSetting.keyCalendar);
	
	        dhis2.period.generator = new dhis2.period.PeriodGenerator(dhis2.period.calendar, dhis2.period.format);
	
	        dhis2.period.picker = new dhis2.period.DatePicker(dhis2.period.calendar, dhis2.period.format);
	
	        var d2Periods = dhis2.period.generator.generateReversedPeriods(periodType, -5);
	
	        d2Periods = dhis2.period.generator.filterOpenPeriods(periodType, d2Periods, 5, null, null);
	
	        angular.forEach(d2Periods, function (p) {
	            p.id = p.iso;
	        });
	
	        return d2Periods;
	    };
	
	    this.getQuarters = function (pe) {
	        if (!pe || !pe._startDate || !pe._startDate._year || !pe._endDate || !pe._endDate._year) {
	            return [];
	        }
	        return [{
	            id: pe._startDate._year + 'Q3',
	            iso: pe._startDate._year + 'Q3',
	            name: 'Q1',
	            sortName: 'firstQuarter'
	        }, {
	            id: pe._startDate._year + 'Q4',
	            iso: pe._startDate._year + 'Q4',
	            name: 'Q2',
	            sortName: 'secondQuarter'
	        }, {
	            id: pe._endDate._year + 'Q1',
	            iso: pe._endDate._year + 'Q1',
	            name: 'Q3',
	            sortName: 'thirdQuarter'
	        }, {
	            id: pe._endDate._year + 'Q2',
	            iso: pe._endDate._year + 'Q2',
	            name: 'Q4',
	            sortName: 'fourthQuarter'
	        }];
	    };
	}])
	
	/* Factory to fetch optionSets */
	.factory('OptionSetService', ["$q", "$rootScope", "DDStorageService", function ($q, $rootScope, DDStorageService) {
	    return {
	        getAll: function getAll() {
	
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('optionSets').done(function (optionSets) {
	                    $rootScope.$apply(function () {
	                        def.resolve(optionSets);
	                    });
	                });
	            });
	
	            return def.promise;
	        },
	        get: function get(uid) {
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.get('optionSets', uid).done(function (optionSet) {
	                    $rootScope.$apply(function () {
	                        def.resolve(optionSet);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getCode: function getCode(options, key) {
	            if (options) {
	                for (var i = 0; i < options.length; i++) {
	                    if (key === options[i].displayName) {
	                        return options[i].code;
	                    }
	                }
	            }
	            return key;
	        },
	        getName: function getName(options, key) {
	            if (options) {
	                for (var i = 0; i < options.length; i++) {
	                    if (key === options[i].code) {
	                        return options[i].displayName;
	                    }
	                }
	            }
	            return key;
	        }
	    };
	}])
	
	/* Service to fetch option combos */
	.factory('OptionComboService', ["$q", "$rootScope", "DDStorageService", function ($q, $rootScope, DDStorageService) {
	    return {
	        getAll: function getAll() {
	            var def = $q.defer();
	            var optionCombos = [];
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('categoryCombos').done(function (categoryCombos) {
	                    angular.forEach(categoryCombos, function (cc) {
	                        optionCombos = optionCombos.concat(cc.categoryOptionCombos);
	                    });
	                    $rootScope.$apply(function () {
	                        def.resolve(optionCombos);
	                    });
	                });
	            });
	
	            return def.promise;
	        },
	        getMappedOptionCombos: function getMappedOptionCombos() {
	            var def = $q.defer();
	            var optionCombos = [];
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('categoryCombos').done(function (categoryCombos) {
	                    angular.forEach(categoryCombos, function (cc) {
	                        angular.forEach(cc.categoryOptionCombos, function (oco) {
	                            oco.categories = [];
	                            angular.forEach(cc.categories, function (c) {
	                                oco.categories.push({ id: c.id, displayName: c.displayName });
	                            });
	                            optionCombos[oco.id] = oco;
	                        });
	                    });
	                    $rootScope.$apply(function () {
	                        def.resolve(optionCombos);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getBtaDimensions: function getBtaDimensions() {
	            var def = $q.defer();
	            var dimension = { options: [], category: null };
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('categoryCombos').done(function (categoryCombos) {
	                    var catFound = false;
	                    for (var i = 0; i < categoryCombos.length && !catFound; i++) {
	                        for (var j = 0; j < categoryCombos[i].categories.length; j++) {
	                            if (categoryCombos[i].categories[j].btaDimension) {
	                                catFound = true;
	                                dimension.category = categoryCombos[i].categories[j].id;
	                                dimension.options = categoryCombos[i].categories[j].categoryOptions;
	                                dimension.categoryCombo = categoryCombos[i];
	                                break;
	                            }
	                        }
	                    }
	
	                    var actualDimension = null;
	                    var targetDimension = null;
	                    var baselineDimension = null;
	                    angular.forEach(dimension.options, function (op) {
	                        if (op.dimensionType === 'actual') {
	                            actualDimension = op;
	                        }
	                        if (op.dimensionType === 'target') {
	                            targetDimension = op;
	                        }
	                        if (op.dimensionType === 'baseline') {
	                            baselineDimension = op;
	                        }
	                    });
	
	                    $rootScope.$apply(function () {
	                        def.resolve({ bta: dimension, actual: actualDimension, target: targetDimension, baseline: baselineDimension });
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getBsrDimensions: function getBsrDimensions() {
	
	            var def = $q.defer();
	
	            this.getBtaDimensions().then(function (bta) {
	
	                var dimension = { options: [], category: null };
	                DDStorageService.currentStore.open().done(function () {
	                    DDStorageService.currentStore.getAll('categoryCombos').done(function (categoryCombos) {
	                        var catFound = false;
	                        for (var i = 0; i < categoryCombos.length && !catFound; i++) {
	                            for (var j = 0; j < categoryCombos[i].categories.length; j++) {
	                                if (categoryCombos[i].categories[j].bsrDimension) {
	                                    catFound = true;
	                                    dimension.category = categoryCombos[i].categories[j].id;
	                                    dimension.options = categoryCombos[i].categories[j].categoryOptions;
	                                    dimension.categoryCombo = categoryCombos[i];
	                                    break;
	                                }
	                            }
	                        }
	
	                        var plannedDimension = null;
	                        var approvedDimension = null;
	                        var releaseDimension = null;
	                        var spentDimension = null;
	                        angular.forEach(dimension.options, function (op) {
	                            if (op.dimensionType === 'planned') {
	                                plannedDimension = op;
	                            }
	                            if (op.dimensionType === 'approved') {
	                                approvedDimension = op;
	                            }
	                            if (op.dimensionType === 'release') {
	                                releaseDimension = op;
	                            }
	                            if (op.dimensionType === 'spent') {
	                                spentDimension = op;
	                            }
	                        });
	
	                        $rootScope.$apply(function () {
	                            def.resolve({ bsr: dimension, planned: plannedDimension, approved: approvedDimension, release: releaseDimension, spent: spentDimension });
	                        });
	                    });
	                });
	            });
	
	            return def.promise;
	        },
	        getLlgFinanceDimensions: function getLlgFinanceDimensions(uid, sectors) {
	            var def = $q.defer();
	            var dimension = { sectors: [], workPlans: [], programmes: [], outputs: [], fundTypes: [], optionCombos: [], programmeInfo: {}, workPlanInfo: {} };
	            angular.forEach(sectors, function (cogs) {
	                angular.forEach(cogs.categoryOptionGroups, function (cog) {
	                    dimension.workPlans.push(cog);
	                    dimension.workPlanInfo[cog.displayName] = {
	                        sector: cogs,
	                        programme: $.map(cog.categoryOptions, function (cog) {
	                            return cog;
	                        })
	                    };
	                    angular.forEach(cog.categoryOptions, function (co) {
	                        dimension.programmeInfo[co.displayName] = {
	                            sector: cogs,
	                            workPlan: cog,
	                            programme: co
	                        };
	                    });
	                });
	            });
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.get('categoryCombos', uid).done(function (categoryCombo) {
	                    if (categoryCombo && categoryCombo.categories && categoryCombo.categories.length > 0) {
	                        for (var j = 0; j < categoryCombo.categories.length; j++) {
	                            if (categoryCombo.categories[j].code === 'LLG_FIN_FT') {
	                                dimension.fundTypes = categoryCombo.categories[j].categoryOptions;
	                            } else if (categoryCombo.categories[j].code === 'LLG_FIN_OU') {
	                                dimension.outputs = categoryCombo.categories[j].categoryOptions;
	                            } else if (categoryCombo.categories[j].code === 'LLG_FIN_PR') {
	                                dimension.programmes = categoryCombo.categories[j].categoryOptions;
	                            }
	                        }
	                        angular.forEach(categoryCombo.categoryOptionCombos, function (oco) {
	                            oco.categories = [];
	                            angular.forEach(categoryCombo.categories, function (c) {
	                                oco.categories.push({ id: c.id, displayName: c.displayName, categoryCode: c.code });
	                            });
	                            dimension.optionCombos[oco.id] = oco;
	                        });
	                    }
	                    $rootScope.$apply(function () {
	                        def.resolve(dimension);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        hasTargetDimension: function hasTargetDimension(categoryCombo) {
	            if (!categoryCombo || categoryCombo.isDefault || !categoryCombo.categoryOptionCombos) {
	                return false;
	            }
	
	            for (var i = 0; i < categoryCombo.categoryOptionCombos.length; i++) {
	                if (categoryCombo.categoryOptionCombos[i].dimensionType === 'target') {
	                    return true;
	                }
	            }
	            return false;
	        }
	    };
	}])
	
	/* Factory to fetch programs */
	.factory('DataSetFactory', ["$q", "$rootScope", "storage", "DDStorageService", "orderByFilter", "CommonUtils", function ($q, $rootScope, storage, DDStorageService, orderByFilter, CommonUtils) {
	
	    return {
	        getActionDataSets: function getActionDataSets(ou) {
	            var systemSetting = storage.get('SYSTEM_SETTING');
	            var allowMultiOrgUnitEntry = systemSetting && systemSetting.multiOrganisationUnitForms ? systemSetting.multiOrganisationUnitForms : false;
	
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('dataSets').done(function (dss) {
	                    var multiDs = angular.copy(dss);
	                    var dataSets = [];
	                    var pushedDss = [];
	                    var key = 'dataSetType';
	                    angular.forEach(dss, function (ds) {
	                        ds[key] = ds[key] ? ds[key] : key;
	                        ds[key] = ds[key].toLocaleLowerCase();
	                        if (ds.id && CommonUtils.userHasWriteAccess('ACCESSIBLE_DATASETS', 'dataSets', ds.id) && ds.organisationUnits.hasOwnProperty(ou.id) && ds[key] === "action") {
	                            ds.entryMode = 'single';
	                            dataSets.push(ds);
	                        }
	                    });
	
	                    if (allowMultiOrgUnitEntry && ou.c && ou.c.length > 0) {
	
	                        angular.forEach(multiDs, function (ds) {
	                            ds[key] = ds[key] ? ds[key] : key;
	                            ds[key] = ds[key].toLocaleLowerCase();
	                            if (ds.id && CommonUtils.userHasWriteAccess('ACCESSIBLE_DATASETS', 'dataSets', ds.id)) {
	                                angular.forEach(ou.c, function (c) {
	                                    if (ds.organisationUnits.hasOwnProperty(c) && pushedDss.indexOf(ds.id) === -1 && ds[key] === "action") {
	                                        ds.entryMode = 'multiple';
	                                        dataSets.push(ds);
	                                        pushedDss.push(ds.id);
	                                    }
	                                });
	                            }
	                        });
	                    }
	                    $rootScope.$apply(function () {
	                        def.resolve(dataSets);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getTargetDataSets: function getTargetDataSets() {
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('dataSets').done(function (dss) {
	                    var dataSets = [];
	                    angular.forEach(dss, function (ds) {
	                        if (ds.id && CommonUtils.userHasWriteAccess('ACCESSIBLE_DATASETS', 'dataSets', ds.id) && ds.dataSetType && ds.dataSetType === 'targetGroup') {
	                            dataSets.push(ds);
	                        }
	                    });
	
	                    $rootScope.$apply(function () {
	                        def.resolve(dataSets);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getActionAndTargetDataSets: function getActionAndTargetDataSets() {
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('dataSets').done(function (dss) {
	                    var dataSets = [];
	                    angular.forEach(dss, function (ds) {
	                        if (ds.id && CommonUtils.userHasWriteAccess('ACCESSIBLE_DATASETS', 'dataSets', ds.id) && ds.dataSetType && (ds.dataSetType === 'targetGroup' || ds.dataSetType === 'action')) {
	                            dataSets.push(ds);
	                        }
	                    });
	
	                    $rootScope.$apply(function () {
	                        def.resolve(dataSets);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        get: function get(uid) {
	
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.get('dataSets', uid).done(function (ds) {
	                    $rootScope.$apply(function () {
	                        def.resolve(ds);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getByOu: function getByOu(ou, selectedDataSet, prop, val) {
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('dataSets').done(function (dss) {
	                    var dataSets = [];
	                    angular.forEach(dss, function (ds) {
	                        if (ds.organisationUnits.indexOf(ou.id) !== -1 && ds.id && CommonUtils.userHasWriteAccess('ACCESSIBLE_DATASETS', 'dataSets', ds.id)) {
	                            if (prop) {
	                                if (ds[prop]) {
	                                    if (ds[prop] === val) {
	                                        dataSets.push(ds);
	                                    }
	                                }
	                            } else {
	                                dataSets.push(ds);
	                            }
	                        }
	                    });
	
	                    dataSets = orderByFilter(dataSets, '-displayName').reverse();
	
	                    if (dataSets.length === 0) {
	                        selectedDataSet = null;
	                    } else if (dataSets.length === 1) {
	                        selectedDataSet = dataSets[0];
	                    } else {
	                        if (selectedDataSet) {
	                            var continueLoop = true;
	                            for (var i = 0; i < dataSets.length && continueLoop; i++) {
	                                if (dataSets[i].id === selectedDataSet.id) {
	                                    selectedDataSet = dataSets[i];
	                                    continueLoop = false;
	                                }
	                            }
	                            if (continueLoop) {
	                                selectedDataSet = null;
	                            }
	                        }
	                    }
	
	                    if (!selectedDataSet || angular.isUndefined(selectedDataSet) && dataSets.legth > 0) {
	                        selectedDataSet = dataSets[0];
	                    }
	
	                    $rootScope.$apply(function () {
	                        def.resolve({ dataSets: dataSets, selectedDataSet: selectedDataSet });
	                    });
	                });
	            });
	            return def.promise;
	        }
	    };
	}])
	
	/* Factory to fetch programs */
	.factory('ProgramFactory', ["$q", "$rootScope", "DDStorageService", "CommonUtils", "orderByFilter", function ($q, $rootScope, DDStorageService, CommonUtils, orderByFilter) {
	
	    return {
	        get: function get(uid) {
	
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.get('programs', uid).done(function (ds) {
	                    $rootScope.$apply(function () {
	                        def.resolve(ds);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getByOu: function getByOu(ou, selectedProgram) {
	            var def = $q.defer();
	
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('programs').done(function (prs) {
	                    var programs = [];
	                    angular.forEach(prs, function (pr) {
	                        if (pr.organisationUnits.hasOwnProperty(ou.id) && pr.id && CommonUtils.userHasReadAccess('ACCESSIBLE_PROGRAMS', 'programs', pr.id)) {
	                            programs.push(pr);
	                        }
	                    });
	
	                    programs = orderByFilter(programs, '-displayName').reverse();
	
	                    if (programs.length === 0) {
	                        selectedProgram = null;
	                    } else if (programs.length === 1) {
	                        selectedProgram = programs[0];
	                    } else {
	                        if (selectedProgram) {
	                            var continueLoop = true;
	                            for (var i = 0; i < programs.length && continueLoop; i++) {
	                                if (programs[i].id === selectedProgram.id) {
	                                    selectedProgram = programs[i];
	                                    continueLoop = false;
	                                }
	                            }
	                            if (continueLoop) {
	                                selectedProgram = null;
	                            }
	                        }
	                    }
	
	                    if (!selectedProgram || angular.isUndefined(selectedProgram) && programs.legth > 0) {
	                        selectedProgram = programs[0];
	                    }
	
	                    $rootScope.$apply(function () {
	                        def.resolve({ programs: programs, selectedProgram: selectedProgram });
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getAll: function getAll(store) {
	            var def = $q.defer();
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll(store).done(function (prs) {
	                    var programs = [];
	                    angular.forEach(prs, function (pr) {
	                        if (pr.id && CommonUtils.userHasReadAccess('ACCESSIBLE_PROGRAMS', 'programs', pr.id)) {
	                            programs.push(pr);
	                        }
	                    });
	                    programs = orderByFilter(programs, ['-code', '-displayName']).reverse();
	
	                    $rootScope.$apply(function () {
	                        def.resolve(programs);
	                    });
	                });
	            });
	            return def.promise;
	        }
	    };
	}])
	
	/* factory to fetch and process programValidations */
	.factory('MetaDataFactory', ["$q", "$rootScope", "DDStorageService", "orderByFilter", function ($q, $rootScope, DDStorageService, orderByFilter) {
	
	    return {
	        get: function get(store, uid) {
	            var def = $q.defer();
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.get(store, uid).done(function (obj) {
	                    $rootScope.$apply(function () {
	                        def.resolve(obj);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        set: function set(store, obj) {
	            var def = $q.defer();
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.set(store, obj).done(function (obj) {
	                    $rootScope.$apply(function () {
	                        def.resolve(obj);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getAll: function getAll(store) {
	            var def = $q.defer();
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll(store).done(function (objs) {
	                    objs = orderByFilter(objs, ['-code', '-displayName']).reverse();
	                    $rootScope.$apply(function () {
	                        def.resolve(objs);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getAllByProperty: function getAllByProperty(store, prop, val) {
	            var def = $q.defer();
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll(store).done(function (objs) {
	                    var selectedObjects = [];
	                    for (var i = 0; i < objs.length; i++) {
	                        if (objs[i][prop]) {
	                            objs[i][prop] = objs[i][prop].toLocaleLowerCase();
	                            if (objs[i][prop] === val) {
	                                selectedObjects.push(objs[i]);
	                            }
	                        }
	                    }
	
	                    $rootScope.$apply(function () {
	                        selectedObjects = orderByFilter(selectedObjects, ['-code', '-displayName']).reverse();
	                        def.resolve(selectedObjects);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getByProperty: function getByProperty(store, prop, val) {
	            var def = $q.defer();
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll(store).done(function (objs) {
	                    var selectedObject = null;
	                    for (var i = 0; i < objs.length; i++) {
	                        if (objs[i][prop]) {
	                            objs[i][prop] = objs[i][prop].toLocaleLowerCase();
	                            if (objs[i][prop] === val) {
	                                selectedObject = objs[i];
	                                break;
	                            }
	                        }
	                    }
	
	                    $rootScope.$apply(function () {
	                        def.resolve(selectedObject);
	                    });
	                });
	            });
	            return def.promise;
	        },
	        getDataElementGroups: function getDataElementGroups() {
	            var def = $q.defer();
	            var dataElementsById = {},
	                categoryCombosById = {};
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('categoryCombos').done(function (categoryCombos) {
	                    angular.forEach(categoryCombos, function (cc) {
	                        categoryCombosById[cc.id] = cc;
	                    });
	
	                    DDStorageService.currentStore.getAll('dataElements').done(function (dataElements) {
	                        angular.forEach(dataElements, function (de) {
	                            var cc = categoryCombosById[de.categoryCombo.id];
	                            de.categoryOptionCombos = cc.categoryOptionCombos;
	                            dataElementsById[de.id] = de;
	                        });
	
	                        DDStorageService.currentStore.getAll('dataElementGroups').done(function (dataElementGroups) {
	                            angular.forEach(dataElementGroups, function (deg) {
	                                angular.forEach(deg.dataElements, function (de) {
	                                    var _de = dataElementsById[de.id];
	                                    if (_de) {
	                                        de.categoryOptionCombos = _de.categoryOptionCombos ? _de.categoryOptionCombos : [];
	                                        de.displayName = _de.displayName;
	                                        de.code = _de.code;
	                                    }
	                                });
	
	                                deg.dataElements = orderByFilter(deg.dataElements, ['-code', '-displayName']).reverse();
	                            });
	                            $rootScope.$apply(function () {
	                                def.resolve(dataElementGroups);
	                            });
	                        });
	                    });
	                });
	            });
	            return def.promise;
	        }
	    };
	}]).service('ResulstChainService', ["$q", "$rootScope", "$filter", "DDStorageService", "orderByFilter", function ($q, $rootScope, $filter, DDStorageService, orderByFilter) {
	
	    return {
	        getByOptionSet: function getByOptionSet(optionSetId) {
	            var def = $q.defer();
	            DDStorageService.currentStore.open().done(function () {
	                DDStorageService.currentStore.getAll('optionGroups').done(function (objs) {
	                    var optionGroups = $filter('filter')(objs, { optionSet: { id: optionSetId } });
	                    if (!optionGroups) {
	                        console.log('need to do something here ...');
	                    }
	                    $rootScope.$apply(function () {
	                        var chain = {};
	                        angular.forEach(optionGroups, function (og) {
	                            if (og.code === 'PR') {
	                                chain.programs = og.options;
	                            }
	                            if (og.code === 'SP') {
	                                chain.subPrograms = og.options;
	                            }
	                            if (og.code === 'OJ') {
	                                chain.objectives = og.options;
	                            }
	                            if (og.code === 'IN') {
	                                chain.interventions = og.options;
	                            }
	                        });
	                        def.resolve(chain);
	                    });
	                });
	            });
	            return def.promise;
	        }
	    };
	}]).service('OrgUnitGroupSetService', ["$http", "CommonUtils", function ($http, CommonUtils) {
	    return {
	        getSectors: function getSectors() {
	            var filter = '?paging=false&fields=id,displayName,organisationUnitGroups[id,displayName,code,attributeValues[value,attribute[id,code,valueType]],organisationUnits[id,displayName,code,dataSets[dataSetElements[dataElement[dataElementGroups[groupSets[id]]]]]]],attributeValues[value,attribute[id,code,valueType]]';
	            var url = DHIS2URL + '/api/organisationUnitGroupSets.json' + encodeURI(filter);
	            var promise = $http.get(url).then(function (response) {
	                var sectors = [];
	                if (response && response.data && response.data.organisationUnitGroupSets) {
	                    var ogss = response.data.organisationUnitGroupSets;
	                    angular.forEach(ogss, function (ogs) {
	                        ogs = dhis2.metadata.processMetaDataAttribute(ogs);
	                        if (ogs.orgUnitGroupSetType && ogs.orgUnitGroupSetType === 'sector' && ogs.organisationUnitGroups.length > 0) {
	                            angular.forEach(ogs.organisationUnitGroups, function (og) {
	                                sectors.push(og);
	                            });
	                        }
	                    });
	                }
	                return sectors;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        },
	        getByGroup: function getByGroup(group) {
	            if (!group) {
	                return CommonUtils.dummyPromise([]);
	            }
	            var filter = '?paging=false&fields=id,displayName,organisationUnitGroups[id,displayName,code,attributeValues[value,attribute[id,code,valueType]],organisationUnits[id,displayName,code,dataSets[dataSetElements[dataElement[dataElementGroups[groupSets[id]]]]]]],attributeValues[value,attribute[id,code,valueType]]';
	            var url = DHIS2URL + '/api/organisationUnitGroupSets.json' + encodeURI(filter);
	            var promise = $http.get(url).then(function (response) {
	                var groups = [];
	                if (response && response.data && response.data.organisationUnitGroupSets) {
	                    var ogss = response.data.organisationUnitGroupSets;
	                    angular.forEach(ogss, function (ogs) {
	                        ogs = dhis2.metadata.processMetaDataAttribute(ogs);
	                        if (ogs.orgUnitGroupSetType && ogs.orgUnitGroupSetType === 'mdalg' && ogs.organisationUnitGroups.length > 0) {
	                            angular.forEach(ogs.organisationUnitGroups, function (og) {
	                                og = dhis2.metadata.processMetaDataAttribute(og);
	                                if (og.orgUnitGroupType && og.orgUnitGroupType === group && og.organisationUnits) {
	                                    angular.forEach(og.organisationUnits, function (ou) {
	                                        groups.push(ou.id);
	                                    });
	                                }
	                            });
	                        }
	                    });
	                }
	                return groups;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        },
	        getByGroupOrgUnitOnly: function getByGroupOrgUnitOnly(group) {
	            if (!group) {
	                return CommonUtils.dummyPromise([]);
	            }
	            var filter = '?paging=false&fields=id,displayName,organisationUnitGroups[id,displayName,code,attributeValues[value,attribute[id,code,valueType]],organisationUnits[id,displayName,code,level,parent[code,displayName]]],attributeValues[value,attribute[id,code,valueType]]';
	            var url = DHIS2URL + '/api/organisationUnitGroupSets.json' + encodeURI(filter);
	            var promise = $http.get(url).then(function (response) {
	                var groups = [];
	                if (response && response.data && response.data.organisationUnitGroupSets) {
	                    var ogss = response.data.organisationUnitGroupSets;
	                    angular.forEach(ogss, function (ogs) {
	                        ogs = dhis2.metadata.processMetaDataAttribute(ogs);
	                        if (ogs.orgUnitGroupSetType && ogs.orgUnitGroupSetType === 'mdalg' && ogs.organisationUnitGroups.length > 0) {
	                            angular.forEach(ogs.organisationUnitGroups, function (og) {
	                                og = dhis2.metadata.processMetaDataAttribute(og);
	                                if (og.orgUnitGroupType && og.orgUnitGroupType === group && og.organisationUnits) {
	                                    angular.forEach(og.organisationUnits, function (ou) {
	                                        groups[ou.id] = ou;
	                                    });
	                                }
	                            });
	                        }
	                    });
	                }
	                return groups;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        },
	        getByVote: function getByVote(id) {
	            var filter = '?paging=false&fields=id,displayName,code,dataSets[dataSetElements[dataElement[dataElementGroups[groupSets[id]]]]],attributeValues[value,attribute[id,code,valueType]]';
	            var url = DHIS2URL + '/api/organisationUnits/' + id + '.json' + encodeURI(filter);
	            var promise = $http.get(url).then(function (response) {
	                return response.data;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        }
	    };
	}]).service('Analytics', ["$q", "$http", "$filter", "$translate", "DHIS2URL", "orderByFilter", "CommonUtils", "NotificationService", function ($q, $http, $filter, $translate, DHIS2URL, orderByFilter, CommonUtils, NotificationService) {
	    return {
	        getFinancialData: function getFinancialData(url, metadata) {
	            if (url) {
	                url = DHIS2URL + '/api/dataValueSets.json?' + encodeURI(url);
	                var promise = $http.get(url).then(function (response) {
	                    var data = [],
	                        processed = [];
	                    if (response.data && response.data.dataValues && response.data.dataValues.length > 0) {
	                        angular.forEach(response.data.dataValues, function (dv) {
	                            var v = {
	                                dataElement: dv.dataElement,
	                                orgUnit: dv.orgUnit,
	                                categoryOptionCombo: dv.categoryOptionCombo,
	                                attributeOptionCombo: dv.attributeOptionCombo
	                            };
	
	                            var key = dv.dataElement + '_' + dv.orgUnit + '_' + dv.categoryOptionCombo + '_' + dv.attributeOptionCombo;
	                            if (processed.indexOf(key) === -1) {
	                                processed.push(key);
	                                var dataElement = metadata.dataElements[dv.dataElement];
	                                var oco = metadata.optionCombos[v.attributeOptionCombo];
	                                var lg = metadata.llgInfo[dv.orgUnit];
	                                if (oco && oco.displayName) {
	                                    var pr = oco.displayName.split(',');
	                                    var prInfo = metadata.programmeInfo[pr[1]];
	                                    if (prInfo) {
	                                        var res = $filter('dataFilter')(response.data.dataValues, angular.copy(v));
	                                        v.sector = prInfo.sector.displayName;
	                                        v.parentLgCode = lg && lg.parent && lg.parent.code ? lg.parent.code : '';
	                                        v.parentLgName = lg && lg.parent && lg.parent.displayName ? lg.parent.displayName : '';
	                                        v.subCounty = lg && lg.displayName ? lg.displayName : '';
	                                        v.workPlan = prInfo.workPlan.displayName;
	                                        v.fundType = pr[0];
	                                        v.programme = pr[1];
	                                        v.output = pr[2];
	                                        v.item = dataElement && dataElement.displayName || '';
	                                        v.cumFinancialYear = 0;
	
	                                        angular.forEach(metadata.periods, function (p) {
	                                            v[p.sortName] = '';
	                                        });
	                                        angular.forEach(res, function (r) {
	                                            v[metadata.periodsBySortName[r.period].sortName] = r.value;
	                                            v.cumFinancialYear = CommonUtils.getSum(v.cumFinancialYear, r.value);
	                                        });
	                                        data.push(v);
	                                    }
	                                }
	                            }
	                        });
	                    }
	                    return data;
	                }, function (response) {
	                    CommonUtils.errorNotifier(response);
	                    return response.data;
	                });
	                return promise;
	            } else {
	                var def = $q.defer();
	                def.resolve();
	                return def.promise;
	            }
	        },
	        getDataInBatch: function getDataInBatch(url, items) {
	            var def = $q.defer(),
	                promises = [],
	                batches = dhis2.metadata.chunk(items, 200);
	
	            angular.forEach(batches, function (batch) {
	                var u = DHIS2URL + '/api/analytics?' + encodeURI(url);
	                promises.push($http.get(u + '&dimension=dx:' + batch.join(';')));
	            });
	
	            $q.all(promises).then(function (response) {
	                var result = {};
	                for (var i = 0; i < response.length; i++) {
	                    var r = CommonUtils.getFormattedAnalyticsResponse(response[i]);
	                    if (i === 0) {
	                        Object.assign(result, r);
	                    } else {
	                        var _result$data;
	
	                        result.metaData.dimensions.dx.push(r.metaData.dimensions.dx);
	                        Object.assign(result.metaData.items, r.metaData.items);
	                        (_result$data = result.data).push.apply(_result$data, _toConsumableArray(r.data));
	                    }
	                }
	                def.resolve(result);
	            });
	            return def.promise;
	        },
	        getData: function getData(url) {
	            if (url) {
	                url = DHIS2URL + '/api/analytics?' + encodeURI(url);
	                var promise = $http.get(url).then(function (response) {
	                    return CommonUtils.getFormattedAnalyticsResponse(response);
	                }, function (response) {
	                    CommonUtils.errorNotifier(response);
	                    return response.data;
	                });
	                return promise;
	            } else {
	                var def = $q.defer();
	                def.resolve();
	                return def.promise;
	            }
	        },
	        processData: function processData(dataParams) {
	
	            var keyDataParams = ['data', 'metaData', 'cost', 'reportPeriods', 'bta', 'selectedDataElementGroupSets', 'dataElementGroups', 'dataElementsById', 'dataElementGroupsById'];
	
	            if (!dataParams) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_report_parameters"));
	                //return;
	            }
	
	            for (var i = 0; i < keyDataParams.length; i++) {
	                if (!dataParams[keyDataParams[i]] && keyDataParams[i] !== 'cost') {
	                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_report_parameters") + ' - ' + keyDataParams[i]);
	                    //return;
	                }
	            }
	
	            var btaDimensions = { category: dataParams.bta.category };
	            angular.forEach(dataParams.bta.options, function (op) {
	                btaDimensions[op.id] = op.dimensionType;
	            });
	
	            var reportPeriods = orderByFilter(dataParams.reportPeriods, '-id').reverse();
	            var data = dataParams.data;
	            var baseLineTargetActualDimensions = $.map(dataParams.bta.options, function (d) {
	                return d.id;
	            });
	            var dataExists = false;
	            var dataHeaders = [];
	            var performanceOverviewHeaders = dataParams.performanceOverviewHeaders;
	            var totalRows = 0,
	                dataElementRows = 0;
	            var hasPhysicalPerformanceData = false;
	            var dataElementRowIndex = {};
	            var tableRows = [];
	            var povTableRows = [];
	
	            var filterResultData = function filterResultData(header, dataElement, oc, data) {
	                if (!header || !data || !header.periodId || !header.dimensionId || !dataElement) return;
	
	                var filterParams = {
	                    dx: dataElement,
	                    pe: header.periodId,
	                    co: oc
	                };
	
	                filterParams[dataParams.bta.category] = header.dimensionId;
	                var res = $filter('dataFilter')(data, filterParams)[0];
	                return res && res.value ? res.value : '';
	            };
	
	            var filterTargetData = function filterTargetData(header, dataElement, oc, data) {
	                if (!header || !header.periodId || !dataElement || !oc || !data) return;
	                var filterParams = {
	                    dx: dataElement,
	                    pe: header.periodId,
	                    co: oc
	                };
	                filterParams[dataParams.bta.category] = dataParams.targetDimension.id;
	
	                var res = $filter('dataFilter')(data, filterParams)[0];
	                return res && res.value ? res.value : '';
	            };
	
	            var filterBudgetData = function filterBudgetData(header, dataElement, oc, data) {
	                if (!header || !data || !header.periodId || !header.dimensionId || !dataElement) return;
	
	                var filterParams = {
	                    dx: dataElement,
	                    pe: header.periodId,
	                    co: oc
	                };
	
	                filterParams[dataParams.bsr.category] = header.dimensionId;
	                var res = $filter('dataFilter')(data, filterParams)[0];
	                return res && res.value ? res.value : '';
	            };
	
	            var filterBudgetValueData = function filterBudgetValueData(header, dataElement, oc, data) {
	                if (!header || !header.periodId || !dataElement || !oc || !data) return;
	                var filterParams = {
	                    dx: dataElement,
	                    pe: header.periodId,
	                    co: oc
	                };
	                filterParams[dataParams.bsr.category] = dataParams.plannedDimension.id;
	
	                var res = $filter('dataFilter')(data, filterParams)[0];
	                return res && res.value ? res.value : '';
	            };
	
	            var valueExists = function valueExists(data, header, dataElement, isActionData) {
	                if (!header || !data || !header.periodId || !header.dimensionId || !dataElement) {
	                    return false;
	                }
	                var filterParams = {
	                    dx: dataElement,
	                    pe: header.periodId
	                };
	
	                if (isActionData) {
	                    filterParams[dataParams.bsr.category] = header.dimensionId;
	                } else {
	                    filterParams[dataParams.bta.category] = header.dimensionId;
	                }
	
	                var res = $filter('dataFilter')(data, filterParams)[0];
	                return res && res.value ? true : false;
	            };
	
	            var extractRange = function extractRange(l) {
	                var ranges = {
	                    red: null,
	                    redColor: null,
	                    yellowStart: null,
	                    yellowEnd: null,
	                    yellowColor: null,
	                    green: null,
	                    greenColor: null,
	                    isValid: false
	                };
	
	                if (l && l.isTrafficLight && l.legends && l.legends.length === 3) {
	                    for (var j = 0; j < l.legends.length; j++) {
	                        if (l.legends[j].name.toLocaleLowerCase() === 'red') {
	                            ranges.red = l.legends[j].startValue;
	                            ranges.redColor = l.legends[j].color;
	                        } else if (l.legends[j].name.toLocaleLowerCase() === 'yellow') {
	                            ranges.yellowStart = l.legends[j].startValue;
	                            ranges.yellowEnd = l.legends[j].endValue;
	                            ranges.yellowColor = l.legends[j].color;
	                        } else if (l.legends[j].name.toLocaleLowerCase() === 'green') {
	                            ranges.green = l.legends[j].endValue;
	                            ranges.greenColor = l.legends[j].color;
	                        }
	                    }
	                    ranges.isValid = true;
	                }
	                return ranges;
	            };
	
	            var getTrafficLight = function getTrafficLight(actual, target, deId, aoc) {
	                var style = {};
	                var color = "";
	                var de = dataParams.dataElementsById[deId];
	                var ranges = {};
	                if (de && de.legendSets && de.legendSets.length > 0) {
	                    for (var i = 0; i < de.legendSets.length; i++) {
	                        var l = dataParams.legendSetsById[de.legendSets[i].id];
	                        ranges = extractRange(l);
	                        if (ranges.isValid) {
	                            break;
	                        }
	                    }
	                }
	
	                if (!ranges.green || !ranges.yellowStart || !ranges.yellowEnd || !ranges.red) {
	                    var l = dataParams.defaultLegendSet;
	                    ranges = extractRange(l);
	                }
	
	                if (!ranges.green || !ranges.yellowStart || !ranges.yellowEnd || !ranges.red) {
	                    ranges = CommonUtils.getFixedRanges(de.descendingIndicatorType);
	                }
	
	                if (!dhis2.validation.isNumber(actual) || !dhis2.validation.isNumber(target)) {
	                    color = '#aaa';
	                    style.printStyle = 'grey-background';
	                } else {
	                    hasPhysicalPerformanceData = true;
	                    /*var t = CommonUtils.getPercent( Math.abs(actual - target), target, true);
	                     if ( t <= ranges.green ){
	                     color = ranges.greenColor;
	                     }
	                     else if( t > ranges.yellowStart && t <= ranges.yellowEnd ){
	                     color = ranges.yellowColor;
	                     }
	                     else if ( t > ranges.red ){
	                     color = ranges.redColor;
	                     }*/
	                    var t = CommonUtils.getPercent(actual, target, true, true);
	                    t = Number(t);
	                    if (de.descendingIndicatorType) {
	                        if (t <= ranges.green) {
	                            color = ranges.greenColor;
	                            style.printStyle = 'green-background';
	                        } else if (t >= ranges.yellowStart && t <= ranges.yellowEnd) {
	                            color = ranges.yellowColor;
	                            style.printStyle = 'yellow-background';
	                        } else {
	                            color = ranges.redColor;
	                            style.printStyle = 'red-background';
	                        }
	                    } else {
	                        if (t >= ranges.green) {
	                            color = ranges.greenColor;
	                            style.printStyle = 'green-background';
	                        } else if (t >= ranges.yellowStart && t <= ranges.yellowEnd) {
	                            color = ranges.yellowColor;
	                            style.printStyle = 'yellow-background';
	                        } else {
	                            color = ranges.redColor;
	                            style.printStyle = 'red-background';
	                        }
	                    }
	                }
	                style.inlineStyle = { "background-color": color };
	                return style;
	            };
	
	            angular.forEach(reportPeriods, function (pe) {
	                var colSpan = 0;
	                var d = $filter('filter')(data, { pe: pe.id });
	                var targetFilter = { pe: pe.id };
	                targetFilter[dataParams.bta.category] = dataParams.targetDimension.id;
	                var targetData = $filter('filter')(data, targetFilter);
	
	                pe.hasData = d && d.length > 0;
	                pe.hasTargetData = targetData && targetData.length > 0;
	
	                if (dataParams.displayActionBudgetData) {
	                    angular.forEach(dataParams.bsr.options, function (op) {
	                        colSpan++;
	                        dataHeaders.push({
	                            name: op.displayName + ' ' + $translate.instant('ugx_billion'),
	                            isRowData: true,
	                            periodId: pe.id,
	                            periodStart: pe.startDate,
	                            periodEnd: pe.endDate,
	                            dimensionId: op.id,
	                            dimension: dataParams.bsr.category });
	                    });
	
	                    //budget-planned-released-spent-percentage headers
	                    colSpan++;
	                    dataHeaders.push({
	                        name: $translate.instant('budget_released'),
	                        isRowData: false,
	                        periodId: pe.id,
	                        periodStart: pe.startDate,
	                        periodEnd: pe.endDate,
	                        denDimensionId: dataParams.plannedDimension.id,
	                        numDimensionId: dataParams.releaseDimension.id,
	                        dimensionId: dataParams.plannedDimension.id + '.' + dataParams.releaseDimension.id,
	                        dimension: dataParams.bsr.category });
	
	                    colSpan++;
	                    dataHeaders.push({
	                        name: $translate.instant('budget_spent'),
	                        isRowData: false,
	                        periodId: pe.id,
	                        periodStart: pe.startDate,
	                        periodEnd: pe.endDate,
	                        denDimensionId: dataParams.plannedDimension.id,
	                        numDimensionId: dataParams.spentDimension.id,
	                        dimensionId: dataParams.plannedDimension.id + '.' + dataParams.spentDimension.id,
	                        dimension: dataParams.bsr.category });
	
	                    colSpan++;
	                    dataHeaders.push({
	                        name: $translate.instant('release_spent'),
	                        isRowData: false,
	                        periodId: pe.id,
	                        periodStart: pe.startDate,
	                        periodEnd: pe.endDate,
	                        denDimensionId: dataParams.releaseDimension.id,
	                        numDimensionId: dataParams.spentDimension.id,
	                        dimensionId: dataParams.releaseDimension.id + '.' + dataParams.spentDimension.id,
	                        dimension: dataParams.bsr.category });
	                } else {
	                    angular.forEach(baseLineTargetActualDimensions, function (dm) {
	                        var filterParams = { pe: pe.id };
	                        filterParams[dataParams.bta.category] = dm;
	                        var d = $filter('dataFilter')(data, filterParams);
	                        if (d && d.length > 0) {
	                            colSpan++;
	                            dataHeaders.push({
	                                periodId: pe.id,
	                                periodStart: pe.startDate,
	                                periodEnd: pe.endDate,
	                                dimensionId: dm,
	                                dimension: dataParams.bta.category });
	                        }
	                    });
	                }
	                if (pe.hasData) {
	                    pe.colSpan = colSpan;
	                }
	            });
	
	            if (Object.keys(data).length === 0) {
	                dataExists = false;
	            } else {
	                dataExists = true;
	                var completenessNum = 0,
	                    completenessDen = 0;
	
	                angular.forEach(dataParams.selectedDataElementGroupSets, function (degs) {
	                    degs.expected = {};
	                    degs.available = {};
	
	                    var generateCompletenessInfo = function generateCompletenessInfo(degs, isActionData) {
	                        angular.forEach(degs.dataElementGroups, function (deg) {
	                            var _deg = $filter('filter')(dataParams.dataElementGroups, { id: deg.id })[0];
	                            angular.forEach(_deg.dataElements, function (de) {
	                                angular.forEach(dataHeaders, function (dh) {
	                                    var id = [dh.periodId, dh.dimensionId].join('-');
	                                    if (!degs.available[id]) {
	                                        degs.available[id] = 0;
	                                    }
	                                    if (!degs.expected[id]) {
	                                        degs.expected[id] = 0;
	                                    }
	
	                                    degs.expected[id]++;
	                                    completenessDen++;
	                                    if (valueExists(data, dh, de.id, isActionData)) {
	                                        degs.available[id]++;
	                                        completenessNum++;
	                                    }
	                                });
	                            });
	                        });
	                    };
	
	                    generateCompletenessInfo(degs, dataParams.displayActionBudgetData);
	
	                    angular.forEach(degs.dataElementGroups, function (_deg) {
	                        var deg = dataParams.dataElementGroupsById[_deg.id];
	                        if (deg && deg.dataElements && deg.dataElements.length > 0) {
	                            var deCount = 0;
	                            var pov = {};
	                            var povPercent = {};
	                            angular.forEach(deg.dataElements, function (de) {
	                                angular.forEach(de.categoryOptionCombos, function (oc) {
	                                    deCount++;
	                                    dataElementRows++;
	                                    var tableRow = {
	                                        dataElementCode: de.code,
	                                        dataElementId: de.id,
	                                        dataElement: de.displayName + (oc.displayName === 'default' ? '' : ' - ' + oc.displayName),
	                                        dataElementGroup: deg.displayName,
	                                        dataElementGroupSet: degs.displayName,
	                                        values: {},
	                                        hasData: false,
	                                        styles: {}
	                                    };
	                                    tableRows.push(tableRow);
	                                    angular.forEach(dataHeaders, function (dh) {
	                                        if (dataParams.displayActionBudgetData) {
	                                            if (dh.dimensionId === dataParams.plannedDimension.id) {
	                                                dh.hasBudgetData = true;
	                                            }
	                                            if (dh.isRowData) {
	                                                var bVal = filterBudgetData(dh, de.id, oc.id, data);
	                                                if (bVal !== '') {
	                                                    tableRow.hasData = true;
	                                                }
	                                                tableRow.values[dh.dimensionId + '.' + dh.periodId] = bVal;
	                                            } else {
	                                                var dhId = dataParams.plannedDimension.id + '.' + dataParams.releaseDimension.id;
	                                                if (dh.dimensionId === dhId) {
	                                                    var rh = angular.copy(dh);
	                                                    rh.dimensionId = dataParams.releaseDimension.id;
	                                                    var ph = angular.copy(dh);
	                                                    ph.dimensionId = dataParams.plannedDimension.id;
	                                                    var rv = filterBudgetData(rh, de.id, oc.id, data);
	                                                    var pv = filterBudgetData(ph, de.id, oc.id, data);
	
	                                                    var trafficLight = getTrafficLight(rv, pv, de.id, dh.dimensionId);
	                                                    tableRow.styles[dh.dimensionId + '.' + dh.periodId] = trafficLight;
	
	                                                    if (!pov[deg.id + '-' + 'A-' + dh.periodId]) {
	                                                        pov[deg.id + '-' + 'A-' + dh.periodId] = 0;
	                                                    }
	
	                                                    if (!pov[deg.id + '-' + 'M-' + dh.periodId]) {
	                                                        pov[deg.id + '-' + 'M-' + dh.periodId] = 0;
	                                                    }
	
	                                                    if (!pov[deg.id + '-' + 'N-' + dh.periodId]) {
	                                                        pov[deg.id + '-' + 'N-' + dh.periodId] = 0;
	                                                    }
	
	                                                    if (!pov[deg.id + '-' + 'X-' + dh.periodId]) {
	                                                        pov[deg.id + '-' + 'X-' + dh.periodId] = 0;
	                                                    }
	
	                                                    if (!rv || !pv) {
	                                                        pov[deg.id + '-' + 'X-' + dh.periodId] += 1;
	                                                    } else {
	                                                        var t = CommonUtils.getPercent(rv, pv, true, true);
	                                                        t = Number(t);
	                                                        if (t >= 100) {
	                                                            pov[deg.id + '-' + 'A-' + dh.periodId] += 1;
	                                                        } else if (t >= 75 && t <= 99) {
	                                                            pov[deg.id + '-' + 'M-' + dh.periodId] += 1;
	                                                        } else {
	                                                            pov[deg.id + '-' + 'N-' + dh.periodId] += 1;
	                                                        }
	                                                    }
	                                                }
	                                            }
	                                        } else {
	                                            if (dh.dimensionId === dataParams.targetDimension.id) {
	                                                dh.hasResultData = true;
	                                            }
	                                            var val = filterResultData(dh, de.id, oc.id, data);
	                                            if (val !== '') {
	                                                tableRow.hasData = true;
	                                            }
	                                            var trafficLight = "";
	                                            if (dh.dimensionId === dataParams.actualDimension.id) {
	                                                var targetValue = filterTargetData(dh, de.id, oc.id, data);
	                                                trafficLight = getTrafficLight(val, targetValue, de.id, dh.dimensionId);
	                                            }
	                                            tableRow.styles[dh.dimensionId + '.' + dh.periodId] = trafficLight;
	                                            tableRow.values[dh.dimensionId + '.' + dh.periodId] = val;
	
	                                            if (dh.dimensionId === dataParams.actualDimension.id) {
	                                                var ah = angular.copy(dh);
	                                                ah.dimensionId = dataParams.actualDimension.id;
	                                                var th = angular.copy(dh);
	                                                th.dimensionId = dataParams.targetDimension.id;
	                                                var av = filterResultData(ah, de.id, oc.id, data);
	                                                var tv = filterTargetData(th, de.id, oc.id, data);
	
	                                                if (!pov[deg.id + '-' + 'A-' + dh.periodId]) {
	                                                    pov[deg.id + '-' + 'A-' + dh.periodId] = 0;
	                                                }
	
	                                                if (!pov[deg.id + '-' + 'M-' + dh.periodId]) {
	                                                    pov[deg.id + '-' + 'M-' + dh.periodId] = 0;
	                                                }
	
	                                                if (!pov[deg.id + '-' + 'N-' + dh.periodId]) {
	                                                    pov[deg.id + '-' + 'N-' + dh.periodId] = 0;
	                                                }
	
	                                                if (!pov[deg.id + '-' + 'X-' + dh.periodId]) {
	                                                    pov[deg.id + '-' + 'X-' + dh.periodId] = 0;
	                                                }
	
	                                                if (!av || !tv) {
	                                                    pov[deg.id + '-' + 'X-' + dh.periodId] += 1;
	                                                } else {
	                                                    var t = CommonUtils.getPercent(av, tv, true, true);
	                                                    if (t >= 100) {
	                                                        pov[deg.id + '-' + 'A-' + dh.periodId] += 1;
	                                                    } else if (t >= 75 && t <= 99) {
	                                                        pov[deg.id + '-' + 'M-' + dh.periodId] += 1;
	                                                    } else {
	                                                        pov[deg.id + '-' + 'N-' + dh.periodId] += 1;
	                                                    }
	                                                }
	                                            }
	                                        }
	                                    });
	                                    dataElementRowIndex[de.id] = dataElementRows;
	                                    angular.forEach(performanceOverviewHeaders, function (ph) {
	                                        var v = pov[deg.id + '-' + ph.id + '-' + ph.period];
	                                        var prcnt = CommonUtils.getPercent(v, deg.dataElements.length, true, true);
	                                        povPercent[deg.id + '-' + ph.id + '-' + ph.period] = prcnt;
	                                    });
	                                });
	                            });
	                            var povTableRow = {
	                                dataElementSize: deCount,
	                                dataElementGroup: deg.displayName,
	                                dataElementGroupId: deg.id,
	                                dataElementGroupSet: degs.displayName,
	                                pov: pov,
	                                povPercent: povPercent
	                            };
	                            povTableRows.push(povTableRow);
	                        }
	                    });
	                });
	            }
	
	            return {
	                dataExists: dataExists,
	                dataHeaders: dataHeaders,
	                reportPeriods: reportPeriods,
	                totalRows: totalRows,
	                hasPhysicalPerformanceData: hasPhysicalPerformanceData,
	                completenessNum: completenessNum,
	                completenessDen: completenessDen,
	                selectedDataElementGroupSets: dataParams.selectedDataElementGroupSets,
	                dataElementRowIndex: dataElementRowIndex,
	                tableRows: tableRows,
	                povTableRows: povTableRows
	            };
	        }
	    };
	}]).service('FinancialDataService', ["$http", "CommonUtils", function ($http, CommonUtils) {
	    return {
	        getLocalData: function getLocalData(fileName) {
	            var promise = $http.get(fileName).then(function (response) {
	                return response.data;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        }
	    };
	}]).service('EventService', ["$http", "$q", "orderByFilter", "DHIS2URL", "CommonUtils", "DateUtils", "OptionSetService", function ($http, $q, orderByFilter, DHIS2URL, CommonUtils, DateUtils, OptionSetService) {
	    return {
	        getByOrgUnitAndProgram: function getByOrgUnitAndProgram(orgUnit, ouMode, program, optionSets, dataElementsById) {
	            var url = DHIS2URL + '/api/events.json?' + 'paging=false&orgUnit=' + orgUnit + '&ouMode=' + ouMode + '&program=' + program;
	            var promise = $http.get(url).then(function (response) {
	                var events = response.data && response.data.events ? response.data.events : [];
	                var faqs = [];
	                if (response && response.data && response.data.events) {
	                    angular.forEach(events, function (ev) {
	                        if (ev.dataValues) {
	                            var faq = {
	                                eventDate: ev.eventDate,
	                                event: ev.event
	                            };
	                            angular.forEach(ev.dataValues, function (dv) {
	                                var de = dataElementsById[dv.dataElement];
	                                var val = dv.value;
	                                if (val && de) {
	                                    val = CommonUtils.formatDataValue(null, val, de, optionSets, 'USER');
	                                    if (de.code === 'FAQ') {
	                                        faq.faq = val;
	                                    }
	                                    if (de.code === 'FAQ_RESPONSE') {
	                                        faq.faqResponse = val;
	                                    }
	                                }
	                            });
	                        }
	                        faqs.push(faq);
	                    });
	                }
	                faqs = orderByFilter(faqs, '-eventDate').reverse();
	                return faqs;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	            });
	
	            return promise;
	        }
	    };
	}]).service('DocumentService', ["$http", "$q", "DHIS2URL", "CommonUtils", "DateUtils", "FileService", "OptionSetService", function ($http, $q, DHIS2URL, CommonUtils, DateUtils, FileService, OptionSetService) {
	
	    var bytesToSize = function bytesToSize(bytes) {
	        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	        if (bytes === 0) return '0 Byte';
	        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	    };
	
	    var processDocuments = function processDocuments(events) {
	        var documents = {};
	        if (events && events.length > 0) {
	            angular.forEach(events, function (ev) {
	                if (ev && ev.dataValues) {
	                    var doc = {
	                        dateUploaded: DateUtils.formatFromApiToUser(ev.eventDate),
	                        uploadedBy: ev.storedBy,
	                        event: ev.event
	                    };
	
	                    angular.forEach(ev.dataValues, function (dv) {
	                        if (dv.dataElement && dv.value) {
	                            doc.value = dv.value;
	                            FileService.get(dv.value).then(function (res) {
	                                doc.name = res.displayName || '';
	                                doc.size = bytesToSize(res.contentLength || 0);
	                                doc.type = res.contentType || 'undefined';
	                                doc.path = '/events/files?dataElementUid=' + dv.dataElement + '&eventUid=' + ev.event;
	                            });
	                        }
	                    });
	
	                    documents[ev.event] = doc;
	                }
	            });
	        }
	        return documents;
	    };
	
	    var skipPaging = "&skipPaging=true";
	
	    var getByOrgUnitAndProgram = function getByOrgUnitAndProgram(orgUnit, ouMode, program, typeDataElement, fileDataElement, optionSets, dataElementById) {
	        var url = DHIS2URL + '/api/events.json?' + 'orgUnit=' + orgUnit + '&ouMode=' + ouMode + '&program=' + program + skipPaging;
	        var promise = $http.get(url).then(function (response) {
	            var events = response.data && response.data.events ? response.data.events : [];
	            var documents = [];
	            if (response && response.data && response.data.events) {
	                angular.forEach(events, function (ev) {
	                    var doc = {
	                        dateUploaded: DateUtils.formatFromApiToUser(ev.eventDate),
	                        uploadedBy: ev.storedBy,
	                        event: ev.event
	                    };
	
	                    if (ev.dataValues) {
	                        angular.forEach(ev.dataValues, function (dv) {
	                            if (dv.dataElement === typeDataElement.id) {
	                                doc.folder = dv.value;
	                            } else if (dv.dataElement === fileDataElement.id) {
	                                doc.value = dv.value;
	                                FileService.get(dv.value).then(function (res) {
	                                    doc.name = res.displayName || '';
	                                    doc.size = bytesToSize(res.contentLength || 0);
	                                    doc.type = res.contentType || 'undefined';
	                                    doc.path = '/events/files?dataElementUid=' + dv.dataElement + '&eventUid=' + ev.event;
	                                    doc.mda = ev.orgUnitName;
	                                });
	                            } else {
	                                var val = dv.value;
	                                var de = dataElementById[dv.dataElement];
	
	                                if (de && de.optionSetValue) {
	                                    val = OptionSetService.getName(optionSets[de.optionSet.id].options, String(val));
	                                }
	
	                                doc[dv.dataElement] = val;
	                            }
	                        });
	                    }
	                    documents.push(doc);
	                });
	            }
	            return documents;
	        }, function (response) {
	            CommonUtils.errorNotifier(response);
	        });
	
	        return promise;
	    };
	
	    var get = function get(eventUid) {
	        var promise = $http.get(DHIS2URL + '/api/events/' + eventUid + '.json').then(function (response) {
	            return response.data;
	        });
	        return promise;
	    };
	
	    var create = function create(dhis2Event) {
	        var promise = $http.post(DHIS2URL + '/api/events.json', dhis2Event).then(function (response) {
	            return response.data;
	        });
	        return promise;
	    };
	
	    var deleteEvent = function deleteEvent(dhis2Event) {
	        var promise = $http.delete(DHIS2URL + '/api/events/' + dhis2Event.event).then(function (response) {
	            return response.data;
	        });
	        return promise;
	    };
	
	    var update = function update(dhis2Event) {
	        var promise = $http.put(DHIS2URL + '/api/events/' + dhis2Event.event, dhis2Event).then(function (response) {
	            return response.data;
	        });
	        return promise;
	    };
	
	    var getMultiple = function getMultiple(eventIds) {
	        var def = $q.defer();
	        var promises = [];
	        angular.forEach(eventIds, function (eventId) {
	            promises.push(get(eventId));
	        });
	
	        $q.all(promises).then(function (_events) {
	            def.resolve(processDocuments(_events));
	        });
	        return def.promise;
	    };
	
	    return {
	        get: get,
	        create: create,
	        deleteEvent: deleteEvent,
	        update: update,
	        getMultiple: getMultiple,
	        getByOrgUnitAndProgram: getByOrgUnitAndProgram,
	        getForMultipleOptionCombos: function getForMultipleOptionCombos(orgUnit, mode, pr, attributeCategoryUrl, optionCombos, startDate, endDate) {
	            var def = $q.defer();
	            var promises = [],
	                events = [];
	            angular.forEach(optionCombos, function (oco) {
	                promises.push(getByOrgUnitAndProgram(orgUnit, mode, pr, attributeCategoryUrl, oco.id, startDate, endDate));
	            });
	
	            $q.all(promises).then(function (_events) {
	                angular.forEach(_events, function (evs) {
	                    events = events.concat(evs);
	                });
	
	                def.resolve(events);
	            });
	            return def.promise;
	        },
	        getForMultiplePrograms: function getForMultiplePrograms(orgUnit, mode, programs, attributeCategoryUrl, startDate, endDate) {
	            var def = $q.defer();
	            var promises = [],
	                events = [];
	            angular.forEach(programs, function (pr) {
	                promises.push(getByOrgUnitAndProgram(orgUnit, mode, pr.id, attributeCategoryUrl, null, startDate, endDate));
	            });
	
	            $q.all(promises).then(function (_events) {
	                angular.forEach(_events, function (evs) {
	                    events = events.concat(evs);
	                });
	
	                def.resolve(events);
	            });
	            return def.promise;
	        }
	    };
	}]).service('ProjectService', ["$http", "orderByFilter", "DateUtils", "CommonUtils", "OptionSetService", function ($http, orderByFilter, DateUtils, CommonUtils, OptionSetService) {
	    return {
	        getByProgram: function getByProgram(pager, filter, orgUnit, program, optionSets, attributesById, dataElementsById) {
	            var url = DHIS2URL + '/api/tracker/trackedEntities.json?ouMode=DESCENDANTS&order=created:desc&fields=*&orgUnit=' + orgUnit.id + '&program=' + program.id;
	
	            if (pager) {
	                var pgSize = pager.pageSize ? pager.pageSize : 50;
	                var pg = pager.page ? pager.page : 1;
	                pgSize = pgSize > 1 ? pgSize : 1;
	                pg = pg > 1 ? pg : 1;
	                url += '&pageSize=' + pgSize + '&page=' + pg + '&totalPages=false';
	            }
	
	            if (filter) {
	                url += "&" + filter;
	            }
	
	            var promise = $http.get(url).then(function (response) {
	                var teis = response.data && response.data.instances ? response.data.instances : [];
	                var pager = {};
	                if (response.data && response.data.page && response.data.pageSize) {
	                    pager.page = response.data.page;
	                    pager.pageSize = response.data.pageSize;
	                    pager.total = 1;
	                    pager.pageCount = 1;
	                }
	                var projects = [];
	                angular.forEach(teis, function (tei) {
	                    var startDate = '',
	                        endDate = '';
	                    if (tei.attributes) {
	                        var project = {
	                            orgUnit: tei.orgUnit,
	                            trackedEntityInstance: tei.trackedEntity,
	                            style: {}
	                        };
	                        angular.forEach(tei.attributes, function (att) {
	                            var attribute = attributesById[att.attribute];
	                            var val = att.value;
	                            if (attribute) {
	                                val = CommonUtils.formatDataValue(null, val, attribute, optionSets, 'USER');
	                                if (attribute.code === 'AT_PL_START_DATE') {
	                                    startDate = val;
	                                }
	                                if (attribute.code === 'AT_PL_END_DATE') {
	                                    endDate = val;
	                                }
	
	                                if (attribute.code === 'AT_PRIORITY' && att.value) {
	                                    var style = CommonUtils.getFixedTrafficStyle();
	                                    if (att.value === 'High') {
	                                        project.style[att.attribute] = style.red;
	                                    }
	                                    if (att.value === 'Normal') {
	                                        project.style[att.attribute] = style.yellow;
	                                    }
	                                    if (att.value === 'Low') {
	                                        project.style[att.attribute] = style.green;
	                                    }
	                                }
	                            }
	                            project[att.attribute] = val;
	                        });
	                        if (startDate !== '' && endDate !== '') {
	                            var duration = DateUtils.getDifference(startDate, endDate);
	                            project.duration = isNaN(duration) ? '' : Math.floor(duration / 30);
	                        }
	                    }
	                    if (tei.enrollments && tei.enrollments.length === 1) {
	                        project.vote = tei.enrollments[0].orgUnitName;
	                        if (tei.enrollments[0].events) {
	                            tei.enrollments[0].events = orderByFilter(tei.enrollments[0].events, '-occurredAt').reverse();
	                            var len = tei.enrollments[0].events.length;
	                            var ev = tei.enrollments[0].events[len - 1];
	                            if (ev && ev.dataValues && CommonUtils.userHasReadAccess('ACCESSIBLE_PROGRAM_STAGES', 'programStages', ev.programStage)) {
	                                project.status = {};
	                                angular.forEach(ev.dataValues, function (dv) {
	                                    if (dataElementsById[dv.dataElement]) {
	                                        var de = dataElementsById[dv.dataElement];
	                                        var val = dv.value;
	                                        if (de) {
	                                            val = CommonUtils.formatDataValue(null, val, de, optionSets, 'USER');
	                                        }
	                                        if (de.code === 'AT_RATING' && val !== '') {
	                                            var style = CommonUtils.getTrafficColorForValue(val);
	                                            project.style[dv.dataElement] = {
	                                                inlineStyle: style.inlineStyle,
	                                                printStyle: style.printStyle
	                                            };
	                                        }
	                                        if (de.code === 'AT_PROGRESS_STATUS' && val !== '') {
	                                            var style = CommonUtils.getFixedTrafficStyle();
	                                            if (dv.value === 'Not started') {
	                                                project.style[dv.dataElement] = style.red;
	                                            }
	                                            if (dv.value === 'In progress') {
	                                                project.style[dv.dataElement] = style.yellow;
	                                            }
	                                            if (dv.value === ' Completed') {
	                                                project.style[dv.dataElement] = style.green;
	                                            }
	                                            if (dv.value === 'Cancelled') {
	                                                project.style[dv.dataElement] = style.grey;
	                                            }
	                                        }
	                                        if (de.code === 'AT_DELAYED' && val !== '') {
	                                            var style = CommonUtils.getFixedTrafficStyle();
	                                            if (dv.value === 'true') {
	                                                project.style[dv.dataElement] = style.red;
	                                            }
	                                            if (dv.value === 'false') {
	                                                project.style[dv.dataElement] = style.green;
	                                            }
	                                        }
	                                        project.status[dv.dataElement] = val;
	                                    }
	                                });
	                            }
	                        }
	                    }
	                    if (tei.relationships && tei.relationships.length > 0) {
	                        project.relationships = [];
	                        angular.forEach(tei.relationships, function (r) {
	                            project.relationships.push(r.to.trackedEntity);
	                        });
	                    }
	                    projects.push(project);
	                });
	                return { projects: projects, pager: pager };
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	            });
	            return promise;
	        },
	        getKpi: function getKpi(ids, optionSets, attributesById, dataElementsById) {
	            var url = DHIS2URL + '/api/trackedEntityInstances.json?trackedEntityInstance=' + ids + '&fields=*';
	            var promise = $http.get(url).then(function (response) {
	                var kpis = [];
	                if (response.data.trackedEntityInstances && response.data.trackedEntityInstances.length > 1) {
	                    angular.forEach(response.data.trackedEntityInstances, function (tei) {
	                        if (tei.enrollments && tei.enrollments[0] && tei.enrollments[0].events) {
	                            var kpi = {};
	                            var events = tei.enrollments[0].events;
	                            events = orderByFilter(events, '-eventDate');
	                            if (events[0] && CommonUtils.userHasReadAccess('ACCESSIBLE_PROGRAM_STAGES', 'programStages', events[0].programStage)) {
	                                kpi.eventDate = DateUtils.formatFromApiToUser(events[0].eventDate);
	                                angular.forEach(events[0].dataValues, function (dv) {
	                                    var de = dataElementsById[dv.dataElement];
	                                    var val = dv.value;
	                                    if (de) {
	                                        val = CommonUtils.formatDataValue(events[0], val, de, optionSets, 'USER');
	                                    }
	                                    kpi[dv.dataElement] = val;
	                                });
	                            }
	                            kpis.push(kpi);
	                        }
	                    });
	                }
	                return kpis;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	            });
	            return promise;
	        },
	        getProjectKpi: function getProjectKpi(project, ind) {
	            var indVal = 0,
	                numerator = null;
	            var indRegex = /[A#]{\w+.?\w*}/g;
	            if (ind.expression) {
	
	                var expression = angular.copy(ind.expression);
	                var matcher = expression.match(indRegex);
	
	                for (var k in matcher) {
	                    var match = matcher[k];
	
	                    var operand = match.replace(dhis2.metadata.operatorRegex, '');
	
	                    if (!numerator) {
	                        numerator = operand.substring(1, operand.length);
	                    }
	                    var value = project[operand.substring(1, operand.length)];
	
	                    expression = expression.replace(match, value);
	                }
	                indVal = eval(expression);
	                indVal = isNaN(indVal) ? '-' : parseFloat(indVal * 100).toFixed(2) + '%';
	            }
	
	            return { value: indVal, numerator: numerator };
	        }
	    };
	}]).service('DataValueService', ["$http", "CommonUtils", function ($http, CommonUtils) {
	    return {
	        getDataValueSet: function getDataValueSet(params) {
	            var promise = $http.get('../api/dataValueSets.json?' + params).then(function (response) {
	                return response.data;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        }
	    };
	}]).service('ClusterDataService', ["$q", "$filter", "$translate", "orderByFilter", "NotificationService", "CommonUtils", "Analytics", "FinancialDataService", function ($q, $filter, $translate, orderByFilter, NotificationService, CommonUtils, Analytics, FinancialDataService) {
	    return {
	        getData: function getData(params) {
	            if (!params) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster_params"));
	                return;
	            }
	
	            if (!params.selectedOrgUnit || !params.selectedOrgUnit.id) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	                return;
	            }
	
	            if (!params.selectedCluster || !params.selectedCluster.options || !params.selectedCluster.options.length) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
	                return;
	            }
	
	            if (!params.selectedFiscalYear) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_fiscal_year"));
	                return;
	            }
	
	            var clusterPeriods = [params.selectedFiscalYear];
	            var clusterDataElementGroupSets = [];
	            var clusterGroups = [];
	            angular.forEach(params.selectedCluster.options, function (op) {
	                var filter = { ndpProgramme: op.code };
	                var degss = $filter('filter')(params.dataElementGroupSets, filter, true);
	                angular.forEach(degss, function (degs) {
	                    clusterDataElementGroupSets.push(degs);
	                    angular.forEach(degs.dataElementGroups, function (deg) {
	                        var _deg = $filter('filter')(params.allDataElementGroups, { indicatorGroupType: params.indicatorGroupType, id: deg.id }, true);
	                        if (_deg.length > 0) {
	                            clusterGroups.push(_deg[0]);
	                        }
	                    });
	                });
	            });
	
	            clusterGroups = orderByFilter(clusterGroups, '-code').reverse();
	            var analyticsUrl = '';
	            if (clusterGroups && clusterGroups.length > 0 && clusterPeriods.length > 0) {
	                analyticsUrl += '&filter=ou:' + params.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	
	                if (params.displayActionBudgetData) {
	                    analyticsUrl += '&dimension=co&dimension=' + params.bsr.category + ':' + $.map(params.budgetSpentReleaseDimensions, function (dm) {
	                        return dm;
	                    }).join(';');
	                } else {
	                    analyticsUrl += '&dimension=co&dimension=' + params.bta.category + ':' + $.map(params.baseLineTargetActualDimensions, function (dm) {
	                        return dm;
	                    }).join(';');
	                }
	
	                analyticsUrl += '&dimension=pe:' + $.map(clusterPeriods, function (pe) {
	                    return pe.id;
	                }).join(';');
	
	                var pHeaders = CommonUtils.getPerformanceOverviewHeaders();
	                var prds = orderByFilter(clusterPeriods, '-id').reverse();
	                var clusterPerformanceOverviewHeaders = [];
	                angular.forEach(prds, function (pe) {
	                    angular.forEach(pHeaders, function (p) {
	                        var h = angular.copy(p);
	                        h.period = pe.id;
	                        clusterPerformanceOverviewHeaders.push(h);
	                    });
	                });
	
	                var dataElementGroupsById = clusterGroups.reduce(function (map, obj) {
	                    map[obj.id] = obj;
	                    return map;
	                }, {});
	
	                var des = [];
	                angular.forEach(clusterGroups, function (deg) {
	                    des.push('DE_GROUP-' + deg.id);
	                });
	                //analyticsUrl += '&dimension=dx:' + des.join(';');
	
	                var def = $q.defer();
	
	                var res = { hasClusterData: false };
	                var clusterData = {};
	                FinancialDataService.getLocalData('data/cost.json').then(function (cost) {
	                    Analytics.getDataInBatch(analyticsUrl, des).then(function (response) {
	                        if (response && response.data && response.metaData) {
	                            res.clusterMetaData = response.metaData;
	                            res.hasClusterData = true;
	
	                            var dataParams = {
	                                data: response.data,
	                                metaData: response.metaData,
	                                reportPeriods: angular.copy(clusterPeriods),
	                                bta: params.bta,
	                                actualDimension: params.actualDimension,
	                                targetDimension: params.targetDimension,
	                                baselineDimension: params.baselineDimension,
	                                selectedDataElementGroupSets: clusterDataElementGroupSets,
	                                selectedDataElementGroup: params.selectedKra,
	                                dataElementGroups: clusterGroups,
	                                maxPeriod: clusterPeriods.slice(-1)[0],
	                                allPeriods: clusterPeriods,
	                                dataElementGroupsById: dataElementGroupsById,
	                                dataElementsById: params.dataElementsById,
	                                cost: cost,
	                                legendSetsById: params.legendSetsById,
	                                defaultLegendSet: params.defaultLegendSet,
	                                performanceOverviewHeaders: clusterPerformanceOverviewHeaders,
	                                displayActionBudgetData: params.displayActionBudgetData,
	                                bsr: params.bsr,
	                                plannedDimension: params.plannedDimension,
	                                approvedDimension: params.approvedDimension,
	                                spentDimension: params.spentDimension,
	                                releaseDimension: params.releaseDimension
	                            };
	
	                            var processedData = Analytics.processData(dataParams);
	                            var clusterColumnId = params.actualDimension.id + '.' + params.selectedFiscalYear.id;
	                            if (params.displayActionBudgetData) {
	                                clusterColumnId = params.plannedDimension.id + '.' + params.releaseDimension.id + '.' + params.selectedFiscalYear.id;
	                            }
	
	                            angular.forEach(params.selectedCluster.options, function (op) {
	                                if (params.indicatorGroupType === 'output') {
	                                    op.code = 'OP' + op.code;
	                                } else if (params.indicatorGroupType === 'output4action') {
	                                    op.code = 'AC' + op.code;
	                                }
	                                var clusterProgramData = $filter('startsWith')(processedData.tableRows, { dataElementCode: op.code });
	                                if (!clusterData[op.code]) {
	                                    clusterData[op.code] = { size: clusterProgramData.length, A: { value: 0 }, M: { value: 0 }, N: { value: 0 }, X: { value: 0 } };
	                                }
	
	                                angular.forEach(clusterProgramData, function (cpd) {
	                                    var st = cpd.styles[clusterColumnId];
	                                    if (st && st.printStyle) {
	                                        if (st.printStyle === 'green-background') {
	                                            clusterData[op.code].A.value += 1;
	                                            clusterData[op.code].A.pcnt = CommonUtils.getPercent(clusterData[op.code].A.value, clusterData[op.code].size, false, true);
	                                        } else if (st.printStyle === 'yellow-background') {
	                                            clusterData[op.code].M.value += 1;
	                                            clusterData[op.code].M.pcnt = CommonUtils.getPercent(clusterData[op.code].M.value, clusterData[op.code].size, false, true);
	                                        } else if (st.printStyle === 'red-background') {
	                                            clusterData[op.code].N.value += 1;
	                                            clusterData[op.code].N.pcnt = CommonUtils.getPercent(clusterData[op.code].N.value, clusterData[op.code].size, false, true);
	                                        } else {
	                                            clusterData[op.code].X.value += 1;
	                                            clusterData[op.code].X.pcnt = CommonUtils.getPercent(clusterData[op.code].X.value, clusterData[op.code].size, false, true);
	                                        }
	                                    }
	                                });
	                            });
	                        }
	                        res.clusterData = clusterData;
	                        res.clusterPerformanceOverviewHeaders = clusterPerformanceOverviewHeaders;
	                        def.resolve(res);
	                    });
	                });
	                return def.promise;
	            }
	        }
	    };
	}]).service('DictionaryService', ["$http", "DHIS2URL", "CommonUtils", function ($http, DHIS2URL, CommonUtils) {
	    var processDataElement = function processDataElement(de, headers, completeness, categoryCombosById) {
	        var cc = categoryCombosById[de.categoryCombo.id];
	        de.disaggregation = !cc || cc.isDefault ? '-' : cc.displayName;
	        var vote = [];
	        var periodType = [];
	
	        for (var i = 0; i < de.dataSetElements.length; i++) {
	            var ds = de.dataSetElements[i].dataSet;
	            var pt = ds.periodType === 'FinancialJuly' ? 'Fiscal year' : ds.periodType;
	            if (periodType.indexOf(pt) === -1) {
	                periodType.push(pt);
	            }
	            if (ds.organisationUnits) {
	                var votes = ds.organisationUnits.map(function (ou) {
	                    return ou.code;
	                });
	                angular.forEach(votes, function (v) {
	                    if (vote.indexOf(v) === -1) {
	                        vote.push(v);
	                    }
	                });
	            }
	        }
	
	        if (vote && vote.length > 0) {
	            vote = vote.sort();
	            if (vote.length > 10) {
	                de.orgUnit = vote.slice(0, 5);
	                de.orgUnit.push('...');
	                de.orgUnit = de.orgUnit.join(', ');
	            }
	            de.vote = vote.join(', ');
	        }
	
	        if (periodType && periodType.length > 0) {
	            periodType = periodType.sort();
	            de.periodType = periodType.join(', ');
	        }
	
	        if (de.dataElementGroups && de.dataElementGroups.length > 0) {
	            de.indicatorGroups = [];
	            angular.forEach(de.dataElementGroups, function (deg) {
	                de.indicatorGroups.push(deg.displayName);
	                if (deg.groupSets && deg.groupSets.length > 0) {
	                    de.indicatorGroupSets = [];
	                    angular.forEach(deg.groupSets, function (gs) {
	                        de.indicatorGroupSets.push(gs.displayName);
	
	                        if (deg.groupSets && deg.groupSets.length > 0) {
	                            de.indicatorGroupSets = [];
	                        }
	                    });
	                }
	            });
	        }
	        de = CommonUtils.getDictionaryCompleteness(de, headers, completeness);
	        return de;
	    };
	    return {
	        getDataElements: function getDataElements(pager, headers, completeness, categoryCombosById, filter, order) {
	            var params = 'fields=id,code,aggregationType,displayName,shortName,description,formName,valueType,optionSetValue,optionSet[id],legendSets[id],attributeValues[value,attribute[id,name,valueType,code]],categoryCombo[id,isDefault],dataElementGroups[id,displayName,attributeValues[value,attribute[id,name,valueType,code]],groupSets[id,displayName,attributeValues[value,attribute[id,name,valueType,code]]]],dataSetElements[dataSet[id,name,periodType,organisationUnits[id,code,displayName]]]';
	            var url = DHIS2URL + '/api/dataElements.json?' + params;
	
	            if (filter) {
	                url = DHIS2URL + '/api/dataElements.json?' + 'filter=identifiable:token:' + filter + '&' + params;
	            }
	
	            if (order) {
	                url += '&order=' + order.name + ':' + order.direction;
	            }
	            if (pager) {
	                var pgSize = pager.pageSize ? pager.pageSize : 50;
	                var pg = pager.page ? pager.page : 1;
	                pgSize = pgSize > 1 ? pgSize : 1;
	                pg = pg > 1 ? pg : 1;
	                url += '&pageSize=' + pgSize + '&page=' + pg + '&totalPages=true';
	            }
	
	            url = encodeURI(url);
	            var promise = $http.get(url).then(function (response) {
	                if (response.data && response.data.dataElements) {
	                    var result = {
	                        dataElements: [],
	                        dataElementsById: {},
	                        totalDataElements: 0,
	                        pager: response.data.pager
	                    };
	
	                    var dataElements = response.data.dataElements;
	                    angular.forEach(dataElements, function (de) {
	                        var d = processDataElement(de, headers, completeness, categoryCombosById);
	                        result.dataElementsById[de.id] = d;
	                        result.dataElements.push(d);
	                    });
	
	                    result.totalDataElements = result.dataElements.length;
	                }
	                return result;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        },
	        getDataElement: function getDataElement(id, headers, completeness, categoryCombosById) {
	            var url = DHIS2URL + '/api/dataElements/' + id + '.json?' + 'fields=id,code,aggregationType,displayName,shortName,description,formName,valueType,optionSetValue,optionSet[id],legendSets[id],attributeValues[value,attribute[id,name,valueType,code]],categoryCombo[id,isDefault],dataElementGroups[id,displayName,attributeValues[value,attribute[id,name,valueType,code]],groupSets[id,displayName,attributeValues[value,attribute[id,name,valueType,code]]]],dataSetElements[dataSet[id,name,periodType,organisationUnits[id,code,displayName]]]';
	            url = encodeURI(url);
	            var promise = $http.get(url).then(function (response) {
	                if (response && response.data) {
	                    return processDataElement(response.data, headers, completeness, categoryCombosById);
	                }
	                return response.data;
	            }, function (response) {
	                CommonUtils.errorNotifier(response);
	                return response.data;
	            });
	            return promise;
	        }
	    };
	}]);

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Filters */
	
	var ndpFrameworkFilters = angular.module('ndpFrameworkFilters', []).filter('fileSize', function () {
	    return function (bytes) {
	
	        if (!bytes) {
	            return;
	        }
	        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	        if (bytes === 0) return '0 Byte';
	        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	    };
	}).filter('documentFilter', function () {
	    return function (data, folder, programme, programmeDataElement) {
	        if (!data) {
	            return;
	        }
	
	        if (!folder) {
	            return data;
	        } else {
	            return data.filter(function (item) {
	                var f = false,
	                    p = true;
	                if (item.folder) f = item.folder.indexOf(folder) > -1;
	                if (programme && item[programmeDataElement.id]) {
	                    p = item[programmeDataElement.id].indexOf(programme.displayName) > -1;
	                }
	                return f && p;
	            });
	        }
	    };
	}).filter('dataFilter', function () {
	    return function (data, obj) {
	        if (!data) {
	            return;
	        }
	        if (!obj) {
	            return data;
	        } else {
	            return data.filter(function (item) {
	                var match = true;
	                for (var k in obj) {
	                    if (obj[k]) {
	                        match = match && item[k] === obj[k];
	                        if (!match) {
	                            return match;
	                        }
	                    }
	                }
	                return match;
	            });
	        }
	    };
	}).filter('getFirst', function () {
	    return function (data, obj) {
	        if (!data) {
	            return;
	        }
	        if (!obj) {
	            return data;
	        } else {
	            var res = data.filter(function (item) {
	                var match = true;
	                for (var k in obj) {
	                    match = match && item[k] === obj[k];
	                    if (!match) {
	                        return match;
	                    }
	                }
	                return match;
	            });
	            if (res && res.length > 0) {
	                return res[0];
	            }
	            return null;
	        }
	    };
	}).filter('startsWith', function () {
	    return function (data, obj) {
	        if (!data) {
	            return;
	        }
	        if (!obj) {
	            return data;
	        } else {
	            return data.filter(function (item) {
	                var match = true;
	                for (var k in obj) {
	                    if (item[k] && obj && obj[k]) {
	                        match = match && item[k].toLowerCase().indexOf(obj[k].toLowerCase()) === 0;
	                    }
	                    if (!match) {
	                        return match;
	                    }
	                }
	                return match;
	            });
	        }
	    };
	});

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	/* global directive, selection, dhis2, angular */
	
	'use strict';
	
	/* Directives */
	
	var ndpFrameworkDirectives = angular.module('ndpFrameworkDirectives', []).directive('d2Blur', function () {
	    return function (scope, elem, attrs) {
	        elem.change(function () {
	            scope.$apply(attrs.d2Blur);
	        });
	    };
	}).directive('equalHeightNavTabs', ["$timeout", function ($timeout) {
	    return function (scope, element, attrs) {
	        $timeout(function () {
	            var tabMenus = '.nav.nav-tabs.nav-justified';
	            $(tabMenus).each(function () {
	                $(this).addClass('hideInPrint');
	            });
	
	            var highest = 0;
	            var selector = '.nav-tabs.nav-justified > li > a';
	            $(selector).each(function () {
	                var h = $(this).height();
	                if (h > highest) {
	                    highest = $(this).height();
	                }
	            });
	            if (highest > 0) {
	                $(".nav-tabs.nav-justified > li > a").height(highest);
	            }
	        });
	    };
	}]).directive('carouselControls', function () {
	    return {
	        restrict: 'A',
	        link: function link(scope, element, attrs) {
	            scope.goNext = function () {
	                element.isolateScope().next();
	            };
	            scope.goPrev = function () {
	                element.isolateScope().prev();
	            };
	        }
	    };
	}).directive('d2MultiSelect', ["$q", function ($q) {
	    return {
	        restrict: 'E',
	        require: 'ngModel',
	        scope: {
	            selectedLabel: "@",
	            availableLabel: "@",
	            displayAttr: "@",
	            available: "=",
	            model: "=ngModel"
	        },
	        template: '<div class="row">' + '<div class="col-sm-5">' + '<div class="select-list-labels">{{ availableLabel }}</div>' + '<div><select class="multiSelectAvailable" ng-dblclick="add()" ng-model="selected.available" multiple ng-options="e as e[displayAttr] for e in available | filter:filterText | orderBy: \'id\'"></select></div>' + '</div>' + '<div class="col-sm-2">' + '<div class="select-list-buttons">' + '<button title="{{\'select\' | translate}}" class="btn btn-primary btn-block" ng-click="add()" ng-disabled="selected.available.length == 0">' + '<i class="fa fa-angle-right"></i>' + '</button>' + '<div class="small-vertical-spacing">' + '<button title="{{\'select_all\' | translate}}" class="btn btn-success btn-block" ng-click="addAll()" ng-disabled="available.length == 0">' + '<i class="fa fa-angle-double-right"></i>' + '</button>' + '</div>' + '</div>' + '<div class="small-vertical-spacing">' + '<button title="{{\'remove\' | translate}}" class="btn btn-warning btn-block" ng-click="remove()" ng-disabled="selected.current.length == 0">' + '<i class="fa fa-angle-left"></i>' + '</button>' + '</div>' + '<div class="small-vertical-spacing">' + '<button title="{{\'remove_all\' | translate}}" class="btn btn-danger btn-block" ng-click="removeAll()" ng-disabled="model.length == 0">' + '<i class="fa fa-angle-double-left"></i>' + '</button>' + '</div>' + '</div>' + '<div class="col-sm-5">' + '<div class="select-list-labels">{{ selectedLabel }}<span class="required">*</span></div>' + '<div><select class="multiSelectSelected" ng-dblclick="remove()" name="multiSelectSelected" ng-model="selected.current" multiple ng-options="e as e[displayAttr] for e in model | orderBy: \'id\'"></select></div>' + '</div>' + '</div>',
	        link: function link(scope, elm, attrs) {
	            scope.selected = {
	                available: [],
	                current: []
	            };
	
	            // Handles cases where scope data hasn't been initialized yet
	            var dataLoading = function dataLoading(scopeAttr) {
	                var loading = $q.defer();
	                if (scope[scopeAttr]) {
	                    loading.resolve(scope[scopeAttr]);
	                } else {
	                    scope.$watch(scopeAttr, function (newValue, oldValue) {
	                        if (newValue !== undefined) loading.resolve(newValue);
	                    });
	                }
	                return loading.promise;
	            };
	
	            // Filters out items in original that are also in toFilter. Compares by reference.
	            var filterOut = function filterOut(original, toFilter) {
	                var filtered = [];
	                angular.forEach(original, function (entity) {
	                    var match = false;
	                    for (var i = 0; i < toFilter.length; i++) {
	                        if (toFilter[i][attrs.displayAttr] === entity[attrs.displayAttr]) {
	                            match = true;
	                            break;
	                        }
	                    }
	                    if (!match) {
	                        filtered.push(entity);
	                    }
	                });
	                return filtered;
	            };
	
	            scope.refreshAvailable = function () {
	                scope.available = filterOut(scope.available, scope.model);
	                scope.selected.available = [];
	                scope.selected.current = [];
	            };
	
	            scope.add = function () {
	                scope.model = scope.model.concat(scope.selected.available);
	                scope.refreshAvailable();
	            };
	
	            scope.addAll = function () {
	                scope.model = scope.model.concat(scope.available);
	                scope.refreshAvailable();
	            };
	
	            scope.remove = function () {
	                scope.available = scope.available.concat(scope.selected.current);
	                scope.model = filterOut(scope.model, scope.selected.current);
	                scope.refreshAvailable();
	            };
	
	            scope.removeAll = function () {
	                scope.available = scope.available.concat(scope.model);
	                scope.model = [];
	                scope.refreshAvailable();
	            };
	
	            $q.all([dataLoading("model"), dataLoading("available")]).then(function (results) {
	                scope.refreshAvailable();
	            });
	        }
	    };
	}]);

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	/* global angular */
	
	'use strict';
	
	/* Controllers */
	
	var ndpFrameworkControllers = angular.module('ndpFrameworkControllers', []);

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	/* global ndpFramework, dhis2 */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('ActionOutputController', ["$scope", "$translate", "$modal", "$filter", "DateUtils", "orderByFilter", "NotificationService", "SelectedMenuService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "ResulstChainService", "CommonUtils", "DataValueService", "ClusterDataService", "Analytics", function ($scope, $translate, $modal, $filter, DateUtils, orderByFilter, NotificationService, SelectedMenuService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, ResulstChainService, CommonUtils, DataValueService, ClusterDataService, Analytics) {
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        dataElementsById: [],
	        optionSetsById: [],
	        optionSets: [],
	        legendSetsById: [],
	        defaultLegendSet: null,
	        objectives: [],
	        ndpObjectives: [],
	        ndpProgrammes: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        selectedSubProgramme: null,
	        selectedPeriods: [],
	        periods: [],
	        allPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        //        selectedPeriodType: 'FinancialJuly',
	        selectedPeriodType: 'Yearly',
	        explanations: [],
	        commentRow: {}
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'financialPerformance', title: 'financial_performance', order: 1, view: 'components/action/financial-performance.html', active: true, class: 'main-horizontal-menu' },
	    //{id: 'clusterPerformance', title: 'cluster_performance', order: 2, view: 'components/action/cluster-performance.html', class: 'main-horizontal-menu'},
	    //        {id: 'clusterPerformance', title: 'cluster_performance', order: 2, view: 'views/cluster/cluster-performance.html', class: 'main-horizontal-menu'},
	    { id: 'completeness', title: 'completeness', order: 2, view: 'components/action/completeness.html', class: 'main-horizontal-menu' }];
	
	    //Get orgunits for the logged in user
	    OrgUnitFactory.getViewTreeRoot().then(function (response) {
	        $scope.orgUnits = response.organisationUnits;
	        angular.forEach($scope.orgUnits, function (ou) {
	            ou.show = true;
	            angular.forEach(ou.children, function (o) {
	                o.hasChildren = o.children && o.children.length > 0 ? true : false;
	            });
	        });
	        $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	    });
	
	    $scope.getOutputs = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { indicatorGroupType: 'output4action', id: deg.id }, true);
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    $scope.$on('MENU', function () {
	        $scope.populateMenu();
	    });
	
	    $scope.$watch('model.selectedNdpProgram', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
	            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedSubProgramme = null;
	        $scope.model.selectedObjective = null;
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedNdpProgram)) {
	            if ($scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code) {
	                //                $scope.model.subProgrammes = $filter('startsWith')($scope.model.subProgrammes, {code: $scope.model.selectedNdpProgram.code});
	                //                $scope.model.piapObjectives = $filter('startsWith')($scope.model.piapObjectives, {code: $scope.model.selectedNdpProgram.code});
	                //                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedNdpProgram.code});
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedSubProgramme', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedObjective = null;
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedSubProgramme)) {
	            if ($scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code) {
	                //                $scope.model.piapObjectives = $filter('startsWith')($scope.model.piapObjectives, {code: $scope.model.selectedSubProgramme.code});
	                //                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedSubProgramme.code});
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedObjective', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedObjective)) {
	            if ($scope.model.selectedObjective && $scope.model.selectedObjective.code) {
	                //                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedObjective.code});
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedCluster', function () {
	        $scope.resetDataView();
	    });
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    dhis2.ndp.downloadGroupSets('sub-intervention4action').then(function () {
	
	        MetaDataFactory.getAll('legendSets').then(function (legendSets) {
	
	            /*angular.forEach(legendSets, function(legendSet){
	                if ( legendSet.isTrafficLight ){
	                    $scope.model.defaultLegendSet = legendSet;
	                }
	                $scope.model.legendSetsById[legendSet.id] = legendSet;
	            });*/
	
	            MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	                $scope.model.optionSets = optionSets;
	
	                angular.forEach(optionSets, function (optionSet) {
	                    $scope.model.optionSetsById[optionSet.id] = optionSet;
	                });
	
	                $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	                if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                    return;
	                }
	
	                $scope.model.piapResultsChain = $filter('getFirst')($scope.model.optionSets, { code: 'piapResultsChain' });
	                if (!$scope.model.piapResultsChain || !$scope.model.piapResultsChain.code || !$scope.model.piapResultsChain.options || $scope.model.piapResultsChain.options.length < 1) {
	                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_piap_results_chain_configuration"));
	                    return;
	                }
	
	                ResulstChainService.getByOptionSet($scope.model.piapResultsChain.id).then(function (chain) {
	                    $scope.model.resultsFrameworkChain = chain;
	                    $scope.model.ndpProgrammes = $scope.model.resultsFrameworkChain.programs;
	                    $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
	                    $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	                    $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	
	                    MetaDataFactory.getAll('optionGroupSets').then(function (optionGroupSets) {
	
	                        $scope.model.optionGroupSets = optionGroupSets;
	
	                        OptionComboService.getBtaDimensions().then(function (btaResponse) {
	
	                            if (!btaResponse || !btaResponse.bta || !btaResponse.baseline || !btaResponse.actual || !btaResponse.target) {
	                                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                                return;
	                            }
	
	                            $scope.model.bta = btaResponse.bta;
	                            $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                                return d.id;
	                            });
	                            $scope.model.actualDimension = btaResponse.actual;
	                            $scope.model.targetDimension = btaResponse.target;
	                            $scope.model.baselineDimension = btaResponse.baseline;
	
	                            OptionComboService.getBsrDimensions().then(function (bsrResponse) {
	
	                                if (!bsrResponse || !bsrResponse.bsr || !bsrResponse.planned || !bsrResponse.approved || !bsrResponse.spent || !bsrResponse.release) {
	                                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bsr_dimensions"));
	                                    return;
	                                }
	
	                                $scope.model.bsr = bsrResponse.bsr;
	                                $scope.model.budgetSpentReleaseDimensions = $.map($scope.model.bsr.options, function (d) {
	                                    return d.id;
	                                });
	                                $scope.model.plannedDimension = bsrResponse.planned;
	                                $scope.model.approvedDimension = bsrResponse.approved;
	                                $scope.model.spentDimension = bsrResponse.spent;
	                                $scope.model.releaseDimension = bsrResponse.release;
	
	                                MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                                    $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                                        map[obj.id] = obj;
	                                        return map;
	                                    }, {});
	
	                                    MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                                        $scope.model.dataElementGroups = dataElementGroups;
	
	                                        MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sub-intervention4action').then(function (dataElementGroupSets) {
	                                            $scope.model.dataElementGroupSets = dataElementGroupSets;
	
	                                            var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                                            periods = periods.reverse();
	                                            $scope.model.allPeriods = angular.copy(periods);
	                                            $scope.model.periods = periods;
	
	                                            //                                            var selectedPeriodNames = ['2020/21'];
	                                            var selectedPeriodNames = ['2023'];
	                                            var today = DateUtils.getToday();
	                                            //                                            $scope.model.selectedFiscalYear = '';
	                                            angular.forEach($scope.model.periods, function (pe) {
	                                                if (pe.startDate <= today && pe.endDate <= today) {
	                                                    $scope.model.selectedFiscalYear = pe;
	                                                }
	                                            });
	
	                                            if ($scope.model.selectedFiscalYear) {
	                                                selectedPeriodNames = [$scope.model.selectedFiscalYear.name];
	                                            }
	
	                                            angular.forEach($scope.model.periods, function (pe) {
	                                                if (selectedPeriodNames.indexOf(pe.name) > -1) {
	                                                    $scope.model.selectedPeriods.push(pe);
	                                                }
	                                            });
	
	                                            $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders();
	                                            $scope.model.metaDataCached = true;
	                                            $scope.populateMenu();
	                                        });
	                                    });
	                                });
	                            });
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedNdpProgram = null;
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	        }
	
	        //        var sectorsOpgs = $filter('getFirst')($scope.model.optionGroupSets, {code: $scope.model.selectedMenu.ndp + '_CLUSTER'});
	        //
	        //        $scope.model.clusters = sectorsOpgs && sectorsOpgs.optionGroups ? sectorsOpgs.optionGroups : [];
	        //        if( !$scope.model.clusters || !$scope.model.clusters.length || !$scope.model.clusters.length === 0 ){
	        //            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster_configuration"));
	        //            return;
	        //        }
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getPeriods = function (mode) {
	        var periods = [];
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	
	        var periodsById = {};
	        angular.forEach($scope.model.periods, function (p) {
	            periodsById[p.id] = p;
	        });
	
	        angular.forEach(periods, function (p) {
	            if (!periodsById[p.id]) {
	                periodsById[p.id] = p;
	            }
	        });
	
	        $scope.model.periods = Object.values(periodsById);
	
	        $scope.model.periods = $scope.model.periods.reverse();
	
	        $scope.model.allPeriods = angular.copy($scope.model.periods);
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        var selectedResultsLevel = $scope.model.selectedNdpProgram.code;
	
	        //        if ( $scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code ){
	        //            selectedResultsLevel = $scope.model.selectedSubProgramme.code;
	        //        }
	        //
	        //        if ( $scope.model.selectedObjective && $scope.model.selectedObjective.code ){
	        //            selectedResultsLevel = $scope.model.selectedObjective.code;
	        //        }
	
	        //        if ( $scope.model.selectedIntervention && $scope.model.selectedIntervention.code ){
	        //            selectedResultsLevel = $scope.model.selectedIntervention.code;
	        //        }
	
	        $scope.model.selectedDataElementGroupSets = $filter('startsWith')($scope.model.dataElementGroupSets, { code: 'SA' + selectedResultsLevel });
	        $scope.getOutputs();
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_output"));
	            return;
	        }
	
	        $scope.getBasePeriod();
	
	        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bsr.category + ':' + $.map($scope.model.budgetSpentReleaseDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods.concat($scope.model.basePeriod), function (pe) {
	                return pe.id;
	            }).join(';');
	
	            $scope.model.dataElementGroupsById = $scope.model.dataElementGroup.reduce(function (map, obj) {
	                map[obj.id] = obj;
	                return map;
	            }, {});
	
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	            Analytics.getData(analyticsUrl).then(function (data) {
	                if (data && data.data && data.metaData) {
	                    $scope.model.data = data.data;
	                    $scope.model.metaData = data.metaData;
	                    $scope.model.reportReady = true;
	                    $scope.model.reportStarted = false;
	
	                    var dataParams = {
	                        data: data.data,
	                        metaData: data.metaData,
	                        reportPeriods: angular.copy($scope.model.selectedPeriods),
	                        bta: $scope.model.bta,
	                        actualDimension: $scope.model.actualDimension,
	                        targetDimension: $scope.model.targetDimension,
	                        baselineDimension: $scope.model.baselineDimension,
	                        bsr: $scope.model.bsr,
	                        plannedDimension: $scope.model.plannedDimension,
	                        approvedDimension: $scope.model.approvedDimension,
	                        spentDimension: $scope.model.spentDimension,
	                        releaseDimension: $scope.model.releaseDimension,
	                        selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                        selectedDataElementGroup: $scope.model.selectedKra,
	                        dataElementGroups: $scope.model.dataElementGroups,
	                        basePeriod: $scope.model.basePeriod,
	                        maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                        allPeriods: $scope.model.allPeriods,
	                        dataElementGroupsById: $scope.model.dataElementGroupsById,
	                        dataElementsById: $scope.model.dataElementsById,
	                        legendSetsById: $scope.model.legendSetsById,
	                        defaultLegendSet: $scope.model.defaultLegendSet,
	                        displayActionBudgetData: true
	                    };
	
	                    var processedData = Analytics.processData(dataParams);
	
	                    $scope.model.dataHeaders = processedData.dataHeaders;
	                    $scope.model.reportPeriods = processedData.reportPeriods;
	                    $scope.model.dataExists = processedData.dataExists;
	                    $scope.model.hasPhysicalPerformanceData = processedData.hasPhysicalPerformanceData;
	                    $scope.model.selectedDataElementGroupSets = processedData.selectedDataElementGroupSets;
	                    $scope.model.numerator = processedData.completenessNum;
	                    $scope.model.denominator = processedData.completenessDen;
	                    $scope.model.dataElementRowIndex = processedData.dataElementRowIndex;
	                    $scope.model.tableRows = [];
	                    $scope.model.povTableRows = processedData.povTableRows;
	
	                    angular.forEach(processedData.tableRows, function (row) {
	                        angular.forEach($scope.model.dataHeaders, function (dh) {
	                            if (!dh.isRowData) {
	                                if (!row.values || !dh || !dh.denDimensionId || !dh.periodId) {
	                                    return;
	                                }
	                                var num = row.values[dh.numDimensionId + '.' + dh.periodId];
	                                var den = row.values[dh.denDimensionId + '.' + dh.periodId];
	                                var percent = CommonUtils.getPercent(num, den, true, true);
	                                row.values[dh.dimensionId + '.' + dh.periodId] = percent;
	                                row.styles[dh.dimensionId + '.' + dh.periodId] = CommonUtils.getTrafficColorForValue(percent);
	                            }
	                        });
	                        $scope.model.tableRows.push(row);
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getClusterData = function () {
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if (!$scope.model.selectedCluster || !$scope.model.selectedCluster.options || !$scope.model.selectedCluster.options.length) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
	            return;
	        }
	
	        if (!$scope.model.selectedFiscalYear) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_fiscal_year"));
	            return;
	        }
	
	        $scope.model.clusterReportReady = false;
	        $scope.model.clusterReportStarted = true;
	        $scope.model.reportReady = false;
	        $scope.model.reportStarted = true;
	
	        dhis2.ndp.downloadGroupSets('sub-intervention4action').then(function () {
	
	            MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                    map[obj.id] = obj;
	                    return map;
	                }, {});
	
	                MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                    $scope.model.allDataElementGroups = dataElementGroups;
	                    $scope.model.dataElementGroups = dataElementGroups;
	
	                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sub-intervention4action').then(function (dataElementGroupSets) {
	                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	
	                        $scope.model.metaDataCached = true;
	
	                        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	                            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	                        }
	
	                        $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	                        $scope.getOutputs();
	
	                        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	                            return;
	                        }
	
	                        if (!$scope.model.selectedCluster || !$scope.model.selectedCluster.options || !$scope.model.selectedCluster.options.length) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
	                            return;
	                        }
	
	                        if (!$scope.model.selectedFiscalYear) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_fiscal_year"));
	                            return;
	                        }
	
	                        var params = {
	                            indicatorGroupType: 'output4action',
	                            selectedOrgUnit: $scope.selectedOrgUnit,
	                            selectedCluster: $scope.model.selectedCluster,
	                            selectedFiscalYear: $scope.model.selectedFiscalYear,
	                            allDataElementGroups: $scope.model.allDataElementGroups,
	                            dataElementGroupSets: $scope.model.dataElementGroupSets,
	                            bta: $scope.model.bta,
	                            baseLineTargetActualDimensions: $scope.model.baseLineTargetActualDimensions,
	                            actualDimension: $scope.model.actualDimension,
	                            targetDimension: $scope.model.targetDimension,
	                            baselineDimension: $scope.model.baselineDimension,
	                            selectedDataElementGroupSets: $scope.model.clusterDataElementGroupSets,
	                            selectedDataElementGroup: $scope.model.selectedKra,
	                            dataElementsById: $scope.model.dataElementsById,
	                            legendSetsById: $scope.model.legendSetsById,
	                            defaultLegendSet: $scope.model.defaultLegendSet,
	                            bsr: $scope.model.bsr,
	                            budgetSpentReleaseDimensions: $scope.model.budgetSpentReleaseDimensions,
	                            plannedDimension: $scope.model.plannedDimension,
	                            approvedDimension: $scope.model.approvedDimension,
	                            spentDimension: $scope.model.spentDimension,
	                            releaseDimension: $scope.model.releaseDimension,
	                            displayActionBudgetData: true
	                        };
	
	                        ClusterDataService.getData(params).then(function (result) {
	                            $scope.model.clusterReportReady = true;
	                            $scope.model.clusterReportStarted = false;
	                            $scope.model.reportReady = true;
	                            $scope.model.reportStarted = false;
	                            $scope.model.clusterData = result.clusterData;
	                            $scope.model.hasClusterData = result.hasClusterData;
	                            $scope.model.clusterPerformanceOverviewHeaders = result.clusterPerformanceOverviewHeaders;
	                        });
	                    });
	                });
	            });
	        });
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById(name).innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedNdpProgram.displayName + " - action";
	
	        if (name) {
	            reportName += " - " + name;
	        }
	
	        reportName += ".xls";
	
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                },
	                fullFetched: function fullFetched() {
	                    return false;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getExplanations = function () {
	        $scope.model.showExplanation = !$scope.model.showExplanation;
	        if ($scope.model.showExplanation && $scope.model.explanations.length === 0) {
	            var dataValueSetUrl = 'orgUnit=' + $scope.selectedOrgUnit.id;
	            dataValueSetUrl += '&children=true';
	            dataValueSetUrl += '&startDate=' + $scope.model.selectedPeriods[0].startDate;
	            dataValueSetUrl += '&endDate=' + $scope.model.selectedPeriods.slice(-1)[0].endDate;
	
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                dataValueSetUrl += '&dataElementGroup=' + deg.id;
	            });
	
	            DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                if (response && response.dataValues) {
	                    angular.forEach(response.dataValues, function (dv) {
	                        if (dv.comment) {
	                            dv.comment = JSON.parse(dv.comment);
	                            if (dv.comment.explanation) {
	                                $scope.model.explanations.push({
	                                    dataElement: dv.dataElement,
	                                    order: $scope.model.dataElementRowIndex[dv.dataElement],
	                                    comment: dv.comment.explanation
	                                });
	                            }
	                        }
	                    });
	
	                    $scope.model.explanations = orderByFilter($scope.model.explanations, '-order').reverse();
	                    var index = 1;
	                    angular.forEach($scope.model.explanations, function (exp) {
	                        $scope.model.commentRow[exp.dataElement] = index;
	                        index++;
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getCoverage = function (numerator, denominator) {
	        return CommonUtils.getPercent(numerator, denominator, false, true);
	    };
	
	    $scope.currentView = $scope.model.horizontalMenus.find(function (m) {
	        return m.active;
	    }).view;
	    $scope.resetTheView = function (menu, $event) {
	        $scope.model.horizontalMenus.forEach(function (m) {
	            m.active = false;
	        });
	
	        menu.active = true;
	
	        $scope.currentView = menu.view;
	    };
	}]);

/***/ }),
/* 15 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	/* global ndpFramework */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('ClusterController', ["$scope", "$translate", "$modal", "$filter", "orderByFilter", "NotificationService", "SelectedMenuService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "Analytics", "CommonUtils", "DataValueService", "FinancialDataService", function ($scope, $translate, $modal, $filter, orderByFilter, NotificationService, SelectedMenuService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, Analytics, CommonUtils, DataValueService, FinancialDataService) {
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        dataElementsById: [],
	        optionSetsById: [],
	        optionSets: [],
	        legendSetsById: [],
	        defaultLegendSet: null,
	        ndpProgrammes: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        performanceOverviewHeaders: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        selectedPeriods: [],
	        periods: [],
	        allPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly',
	        displayProjectOutputs: true,
	        displayDepartmentOutPuts: true,
	        explanations: [],
	        commentRow: {},
	        clusters: []
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'target', title: 'targets', order: 1, view: 'components/outcome/results.html', active: true, class: 'main-horizontal-menu' }, { id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/outcome/physical-performance.html', class: 'main-horizontal-menu' }, { id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/outcome/performance-overview.html', class: 'main-horizontal-menu' }, { id: 'clusterPerformance', title: 'cluster_performance', order: 4, view: 'components/outcome/cluster-performance.html', class: 'main-horizontal-menu' }, { id: 'completeness', title: 'completeness', order: 5, view: 'components/outcome/completeness.html', class: 'main-horizontal-menu' }];
	
	    //Get orgunits for the logged in user
	    OrgUnitFactory.getViewTreeRoot().then(function (response) {
	        $scope.orgUnits = response.organisationUnits;
	        angular.forEach($scope.orgUnits, function (ou) {
	            ou.show = true;
	            angular.forEach(ou.children, function (o) {
	                o.hasChildren = o.children && o.children.length > 0 ? true : false;
	            });
	        });
	        $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	    });
	
	    $scope.getOutcomes = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { indicatorGroupType: 'outcome', id: deg.id }, true);
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    $scope.$on('MENU', function () {
	        //$scope.populateMenu();
	    });
	
	    $scope.$watch('model.selectedNdpProgram', function () {
	        $scope.resetDataView();
	        $scope.model.objectives = [];
	        $scope.model.selectedDataElementGroupSets = [];
	        if (angular.isObject($scope.model.selectedNdpProgram)) {
	            if ($scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code) {
	                var filter = { ndpProgramme: $scope.model.selectedNdpProgram.code };
	                $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, filter, true);
	                $scope.getOutcomes();
	            }
	        }
	    });
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    dhis2.ndp.downloadGroupSets('objective').then(function () {
	
	        MetaDataFactory.getAll('legendSets').then(function (legendSets) {
	
	            /*angular.forEach(legendSets, function(legendSet){
	                if ( legendSet.isTrafficLight ){
	                    $scope.model.defaultLegendSet = legendSet;
	                }
	                $scope.model.legendSetsById[legendSet.id] = legendSet;
	            });*/
	
	            MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	                $scope.model.optionSets = optionSets;
	
	                angular.forEach(optionSets, function (optionSet) {
	                    $scope.model.optionSetsById[optionSet.id] = optionSet;
	                });
	
	                $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	                if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                    return;
	                }
	
	                OptionComboService.getBtaDimensions().then(function (response) {
	
	                    if (!response || !response.bta || !response.baseline || !response.actual || !response.target) {
	                        NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                        return;
	                    }
	
	                    $scope.model.bta = response.bta;
	                    $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                        return d.id;
	                    });
	                    $scope.model.actualDimension = response.actual;
	                    $scope.model.targetDimension = response.target;
	                    $scope.model.baselineDimension = response.baseline;
	
	                    MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                        $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                            map[obj.id] = obj;
	                            return map;
	                        }, {});
	
	                        MetaDataFactory.getAll('optionGroupSets').then(function (optionGroupSets) {
	
	                            $scope.model.optionGroupSets = optionGroupSets;
	
	                            MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                                $scope.model.allDataElementGroups = dataElementGroups;
	                                $scope.model.dataElementGroups = dataElementGroups;
	
	                                MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'objective').then(function (dataElementGroupSets) {
	                                    $scope.model.dataElementGroupSets = dataElementGroupSets;
	                                    $scope.model.dataElementGroupSets = orderByFilter($scope.model.dataElementGroupSets, ['-code', '-displayName']).reverse();
	
	                                    var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                                    $scope.model.allPeriods = angular.copy(periods);
	                                    $scope.model.periods = periods;
	
	                                    var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	
	                                    angular.forEach($scope.model.periods, function (pe) {
	                                        if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                            $scope.model.selectedPeriods.push(pe);
	                                        }
	                                    });
	
	                                    $scope.model.metaDataCached = true;
	                                    $scope.populateMenu();
	                                    $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders();
	                                });
	                            });
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedNdpProgram = null;
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            var prs = $filter('filter')($scope.model.optionSets, { ndp: $scope.model.selectedMenu.ndp, isNDPProgramme: true }, true);
	            if (!prs || prs.length !== 1) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_program_config") + ' - ' + $scope.model.selectedMenu.ndp);
	                return;
	            } else {
	                $scope.model.ndpProgram = prs[0];
	            }
	
	            var sectorsOpgs = $filter('getFirst')($scope.model.optionGroupSets, { code: $scope.model.selectedMenu.ndp + '_CLUSTER' });
	
	            $scope.model.clusters = sectorsOpgs && sectorsOpgs.optionGroups ? sectorsOpgs.optionGroups : [];
	            //            if( !$scope.model.clusters || !$scope.model.clusters.length || !$scope.model.clusters.length === 0 ){
	            //                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster_configuration"));
	            //                return;
	            //            }
	        }
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getPeriods = function (mode) {
	        var periods = [];
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	
	        var periodsById = {};
	        angular.forEach($scope.model.periods, function (p) {
	            periodsById[p.id] = p;
	        });
	
	        angular.forEach(periods, function (p) {
	            if (!periodsById[p.id]) {
	                periodsById[p.id] = p;
	            }
	        });
	
	        $scope.model.periods = Object.values(periodsById);
	
	        $scope.model.allPeriods = angular.copy($scope.model.periods);
	    };
	
	    $scope.getClusterData = function () {
	        $scope.model.clusterReportReady = true;
	        $scope.model.hasClusterData = true;
	        var clusterOutcomes = [];
	        angular.forEach($scope.model.selectedCluster.options, function (op) {
	            var filter = { ndpProgramme: op.code };
	            var degss = $filter('filter')($scope.model.dataElementGroupSets, filter, true);
	            angular.forEach(degss, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    var _deg = $filter('filter')($scope.model.allDataElementGroups, { indicatorGroupType: 'outcome', id: deg.id }, true);
	                    if (_deg.length > 0) {
	                        clusterOutcomes.push(_deg[0]);
	                    }
	                });
	            });
	        });
	
	        clusterOutcomes = orderByFilter(clusterOutcomes, '-code').reverse();
	        console.log('clusterOutcomes:  ', clusterOutcomes);
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById(name).innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedNdpProgram.displayName + " - objectives";
	
	        if (name) {
	            reportName += " - " + name;
	        }
	
	        reportName += ".xls";
	
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                },
	                fullFetched: function fullFetched() {
	                    return false;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getExplanations = function () {
	        $scope.model.showExplanation = !$scope.model.showExplanation;
	        if ($scope.model.showExplanation && $scope.model.explanations.length === 0) {
	            var dataValueSetUrl = 'orgUnit=' + $scope.selectedOrgUnit.id;
	            dataValueSetUrl += '&children=true';
	            dataValueSetUrl += '&startDate=' + $scope.model.selectedPeriods[0].startDate;
	            dataValueSetUrl += '&endDate=' + $scope.model.selectedPeriods.slice(-1)[0].endDate;
	
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                dataValueSetUrl += '&dataElementGroup=' + deg.id;
	            });
	
	            DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                if (response && response.dataValues) {
	                    angular.forEach(response.dataValues, function (dv) {
	                        if (dv.comment) {
	                            dv.comment = JSON.parse(dv.comment);
	                            if (dv.comment.explanation) {
	                                $scope.model.explanations.push({
	                                    dataElement: dv.dataElement,
	                                    order: $scope.model.dataElementRowIndex[dv.dataElement],
	                                    comment: dv.comment.explanation
	                                });
	                            }
	                        }
	                    });
	
	                    $scope.model.explanations = orderByFilter($scope.model.explanations, '-order').reverse();
	                    var index = 1;
	                    angular.forEach($scope.model.explanations, function (exp) {
	                        $scope.model.commentRow[exp.dataElement] = index;
	                        index++;
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getCoverage = function (numerator, denominator) {
	        return CommonUtils.getPercent(numerator, denominator, false, true);
	    };
	
	    $scope.getHeaderClass = function (header) {
	        return header.style;
	    };
	}]);

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	/* global angular, dhis2, ndpFramework */
	
	'use strict';
	
	var ndpFramework = angular.module('ndpFramework');
	
	//Controller for settings page
	ndpFramework.controller('CompletenessController', ["$scope", "$modal", "$filter", "$translate", "orderByFilter", "PeriodService", "OrgUnitFactory", "MetaDataFactory", "NotificationService", "OptionComboService", "CommonUtils", "Analytics", function ($scope, $modal, $filter, $translate, orderByFilter, PeriodService, OrgUnitFactory, MetaDataFactory, NotificationService, OptionComboService, CommonUtils, Analytics) {
	
	    $scope.model = {
	        metaDataCached: false,
	        dataElementGroups: [],
	        dataElementGroupSets: [],
	        optionSets: [],
	        optionSetsById: [],
	        objectives: [],
	        ndp: null,
	        programs: [],
	        selectedNdp: null,
	        selectedProgram: null,
	        periods: [],
	        selectedPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly'
	    };
	
	    //Get orgunits for the logged in user
	    OrgUnitFactory.getViewTreeRoot().then(function (response) {
	        $scope.orgUnits = response.organisationUnits;
	        angular.forEach($scope.orgUnits, function (ou) {
	            ou.show = true;
	            angular.forEach(ou.children, function (o) {
	                o.hasChildren = o.children && o.children.length > 0 ? true : false;
	            });
	        });
	        $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	    });
	
	    $scope.$watch('model.selectedNDP', function () {
	        $scope.model.selectedDataElementGroupSets = [];
	        $scope.model.dataElementGroup = [];
	        $scope.model.selectedProgram = null;
	        $scope.model.objectives = [];
	        if (angular.isObject($scope.model.selectedNDP) && $scope.model.selectedNDP.id && $scope.model.selectedNDP.code) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedNDP.code, indicatorGroupSetType: 'program' }, true);
	            $scope.model.ndpProgram = $filter('filter')($scope.model.optionSets, { ndp: $scope.model.selectedNDP.code, isNDPProgramme: true }, true)[0];
	        }
	    });
	
	    $scope.$watch('model.selectedProgram', function () {
	        $scope.model.dataElementGroup = [];
	        $scope.model.objectives = [];
	        $scope.model.selectedDataElementGroupSets = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedProgram) && $scope.model.selectedProgram.code) {
	            $scope.model.objectives = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedNDP.code, indicatorGroupSetType: 'objective', ndpProgramme: $scope.model.selectedProgram.code }, true);
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.objectives);
	            angular.forEach($scope.model.objectives, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        }
	    });
	
	    $scope.$watch('model.selectedObjective', function () {
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedObjective) && $scope.model.selectedObjective.id) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { id: $scope.model.selectedObjective.id });
	            angular.forEach($scope.model.selectedObjective.dataElementGroups, function (deg) {
	                $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	            });
	        } else {
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.objectives);
	            angular.forEach($scope.model.objectives, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        }
	    });
	
	    dhis2.ndp.downloadGroupSets('objective').then(function () {
	
	        MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	            $scope.model.optionSets = optionSets;
	
	            angular.forEach(optionSets, function (optionSet) {
	                $scope.model.optionSetsById[optionSet.id] = optionSet;
	            });
	
	            OptionComboService.getBtaDimensions().then(function (bta) {
	
	                if (!bta || !bta.category || !bta.options || bta.options.length !== 3) {
	                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                    return;
	                }
	
	                $scope.model.bta = bta;
	                $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                    return d.id;
	                });
	
	                MetaDataFactory.getAll('dataElementGroupSets').then(function (dataElementGroupSets) {
	                    $scope.model.dataElementGroupSets = dataElementGroupSets;
	
	                    MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	                        $scope.model.dataElementGroups = dataElementGroups;
	
	                        $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	
	                        var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	
	                        angular.forEach($scope.model.periods, function (pe) {
	                            if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                $scope.model.selectedPeriods.push(pe);
	                            }
	                        });
	
	                        $scope.model.ndp = $filter('filter')($scope.model.optionSets, { code: 'ndp' })[0];
	                    });
	                });
	            });
	        });
	    }, function () {
	        console.log('error');
	    });
	
	    $scope.getPeriods = function (mode) {
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getCompleteness = function () {
	
	        if (!$scope.model.selectedNDP) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp"));
	            return;
	        }
	
	        if (!$scope.model.selectedProgram) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_programme"));
	            return;
	        }
	
	        if (!$scope.model.dataElementGroup || $scope.model.dataElementGroup.length === 0) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("program_missing_objective"));
	            return;
	        }
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if (!$scope.model.selectedPeriods || !$scope.model.selectedPeriods.length === 0) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_period"));
	            return;
	        }
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	        analyticsUrl += '&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	            return dm;
	        }).join(';');
	        analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods, function (pe) {
	            return pe.id;
	        }).join(';');
	
	        var des = [];
	        angular.forEach($scope.model.dataElementGroup, function (deg) {
	            angular.forEach(deg.dataElements, function (de) {
	                des.push(de.id);
	            });
	        });
	
	        analyticsUrl += '&dimension=dx:' + des.join(';');
	
	        Analytics.getData(analyticsUrl).then(function (data) {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            $scope.model.data = data.data;
	            $scope.model.metaData = data.metaData;
	            $scope.model.reportReady = true;
	            $scope.model.reportStarted = false;
	            $scope.model.dataHeaders = [];
	            angular.forEach($scope.model.selectedPeriods, function (pe) {
	                var colSpan = 0;
	                var d = $filter('filter')($scope.model.data, { pe: pe.id });
	                pe.hasData = d && d.length > 0;
	                angular.forEach($scope.model.baseLineTargetActualDimensions, function (dm) {
	                    var filterParams = { pe: pe.id };
	                    filterParams[$scope.model.bta.category] = dm;
	                    var d = $filter('dataFilter')($scope.model.data, filterParams);
	                    if (d && d.length > 0) {
	                        colSpan++;
	                        $scope.model.dataHeaders.push({ periodId: pe.id, dimensionId: dm, dimension: $scope.model.bta.category });
	                    }
	                });
	                pe.colSpan = colSpan;
	            });
	
	            if (Object.keys($scope.model.data).length === 0) {
	                $scope.model.dataExists = false;
	                return;
	            } else {
	                $scope.model.dataExists = true;
	                $scope.model.numerator = 0;
	                $scope.model.denominator = 0;
	                angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	                    degs.expected = {};
	                    degs.available = {};
	                    angular.forEach(degs.dataElementGroups, function (deg) {
	                        var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0];
	                        angular.forEach(_deg.dataElements, function (de) {
	                            angular.forEach($scope.model.dataHeaders, function (dh) {
	                                var id = [dh.periodId, dh.dimensionId].join('-');
	                                if (!degs.available[id]) {
	                                    degs.available[id] = 0;
	                                }
	                                if (!degs.expected[id]) {
	                                    degs.expected[id] = 0;
	                                }
	
	                                degs.expected[id]++;
	                                $scope.model.denominator++;
	                                if ($scope.valueExists(dh, de.id)) {
	                                    degs.available[id]++;
	                                    $scope.model.numerator++;
	                                }
	                            });
	                        });
	                    });
	                });
	            }
	        });
	    };
	
	    $scope.valueExists = function (header, dataElement) {
	        if (!header || !$scope.model.data || !header.periodId || !header.dimensionId || !dataElement) {
	            return false;
	        }
	        var filterParams = {
	            dx: dataElement,
	            pe: header.periodId
	        };
	
	        filterParams[$scope.model.bta.category] = header.dimensionId;
	        var res = $filter('dataFilter')($scope.model.data, filterParams)[0];
	        return res && res.value ? true : false;
	    };
	
	    $scope.getCoverage = function (numerator, denominator) {
	        return CommonUtils.getPercent(numerator, denominator, false, true);
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = "Completeness" + " .xls";
	        if (name) {
	            reportName = name + ' completeness.xls';
	        }
	        saveAs(blob, reportName);
	    };
	}]);

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	/* global angular, dhis2, ndpFramework */
	
	'use strict';
	
	var ndpFramework = angular.module('ndpFramework');
	
	//Controller for settings page
	ndpFramework.controller('DictionaryController', ["$scope", "$modal", "$filter", "$translate", "Paginator", "NotificationService", "SessionStorageService", "SelectedMenuService", "MetaDataFactory", "DictionaryService", function ($scope, $modal, $filter, $translate, Paginator, NotificationService, SessionStorageService, SelectedMenuService, MetaDataFactory, DictionaryService) {
	
	    $scope.model = {
	        data: null,
	        dataElements: [],
	        dataElementsById: [],
	        dataElementGroups: [],
	        dataElementGroupSets: [],
	        selectedDataElementGroups: [],
	        selectedDataElementGroupSets: [],
	        classificationGroupSets: [],
	        classificationGroups: [],
	        classificationDataElements: [],
	        baseLineTargetActualDimensions: [],
	        dataSetsById: {},
	        categoryCombosById: {},
	        optionSets: [],
	        optionSetsById: [],
	        dictionaryItems: [],
	        attributes: [],
	        selectedPeriodType: 'FinancialJuly',
	        selectedDataElementGroup: null,
	        selectedDictionary: null,
	        dictionaryHeaders: [],
	        ndp: null,
	        ndpProgram: null,
	        selectedNDP: null,
	        selectedProgram: null,
	        groupSetSize: {},
	        financialPerformance: true,
	        showProjectDetails: false,
	        classificationGroup: null,
	        completeness: {
	            green: ['displayName', 'code', 'periodType', 'computationMethod', 'indicatorType', 'preferredDataSource', 'rationale', 'responsibilityForIndicator', 'unit'],
	            yellow: ['displayName', 'code', 'accountabilityForIndicator', 'computationMethod', 'preferredDataSource', 'unit'],
	            invalid: ['isProgrammeDocument', 'isDocumentFolder']
	        }
	    };
	
	    //Paging
	    $scope.pager = { pageSize: 50, page: 1, toolBarDisplay: 5 };
	
	    //    $scope.model.horizontalMenus = [
	    //        {id: 'default', title: 'ndp_indicator', order: 1, view: 'components/dictionary/default.html', active: true, class: 'main-horizontal-menu'},
	    //        {id: 'classification', title: 'indicator_classification', order: 2, view: 'components/dictionary/classification.html', class: 'main-horizontal-menu'}
	    //    ];
	    //
	    $scope.model.horizontalMenus = [{ id: 'default', title: 'ndp_indicator', order: 1, view: 'components/dictionary/default.html', active: true, class: 'main-horizontal-menu' }];
	
	    $scope.$on('MENU', function () {
	        $scope.populateMenu();
	    });
	
	    $scope.populateMenu = function () {
	        $scope.resetView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	    };
	
	    $scope.getDataElementGroupSetsForNdp = function () {
	        $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	        if (angular.isObject($scope.model.selectedNDP) && $scope.model.selectedNDP.code) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedNDP.code }, true);
	            $scope.model.ndpProgram = $filter('filter')($scope.model.optionSets, { ndp: $scope.model.selectedNDP.code, isNDPProgramme: true }, true)[0];
	        }
	
	        $scope.model.selectedDataElementGroups = [];
	
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                $scope.model.selectedDataElementGroups.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	            });
	        });
	    };
	
	    $scope.getSelectedDataElementGroups = function () {
	        $scope.model.dataElements = [];
	        var available = [];
	        angular.forEach($scope.model.selectedDataElementGroups, function (deg) {
	            angular.forEach(deg.dataElements, function (de) {
	                var _de = $scope.model.dataElementsById[de.id];
	                if (_de && available.indexOf(de.id) === -1) {
	                    $scope.model.dataElements.push(_de);
	                    available.push(de.id);
	                }
	            });
	        });
	    };
	
	    $scope.$watch('model.selectedProgram', function () {
	        $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	        $scope.model.selectedDataElementGroups = angular.copy($scope.model.dataElementGroups);
	        if (angular.isObject($scope.model.selectedProgram) && $scope.model.selectedProgram.code) {
	            $scope.model.selectedDataElementGroups = [];
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedNDP.code, ndpProgramme: $scope.model.selectedProgram.code }, true);
	
	            angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.selectedDataElementGroups.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        }
	
	        $scope.getSelectedDataElementGroups();
	    });
	
	    $scope.$watch('model.selectedClassification', function () {
	
	        $scope.model.classificationGroups = angular.copy($scope.model.dataElementGroups);
	
	        if (angular.isObject($scope.model.selectedClassification) && $scope.model.selectedClassification.id) {
	            $scope.model.classificationGroups = [];
	            var _deg = $filter('filter')($scope.model.dataElementGroups, { id: $scope.model.selectedClassification.id });
	            if (_deg && _deg.length > 0) {
	                $scope.model.classificationGroups.push(_deg[0]);
	            }
	        } else {
	            $scope.model.classificationGroups = [];
	            $scope.model.classificationGroupSets = angular.copy([$scope.model.classificationGroup]);
	            if ($scope.model.classificationGroup && $scope.model.classificationGroup.dataElementGroups) {
	                angular.forEach($scope.model.classificationGroup.dataElementGroups, function (deg) {
	                    var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                    if (_deg && _deg.length > 0) {
	                        $scope.model.classificationGroups.push(_deg[0]);
	                    }
	                });
	            }
	        }
	        //$scope.getClassificationGroups();
	    });
	
	    $scope.fetchIndicators = function () {
	        $scope.model.reportReady = false;
	        $scope.model.reportStarted = true;
	        $scope.model.dataElements = [];
	        $scope.model.totalDataElements = 0;
	        DictionaryService.getDataElements($scope.pager, $scope.model.dictionaryHeaders, $scope.model.completeness, $scope.model.categoryCombosById, $scope.model.filterText, $scope.sortHeader).then(function (response) {
	            if (response && response.dataElements) {
	                $scope.model.dataElementsById = response.dataElementsById;
	                $scope.model.dataElements = response.dataElements;
	                $scope.model.totalDataElements = response.totalDataElements;
	            }
	
	            console.log("++++++++++++++++++ $scope.model.dataElements : ", $scope.model.dataElements);
	
	            if (response.pager) {
	                response.pager.pageSize = response.pager.pageSize ? response.pager.pageSize : $scope.pager.pageSize;
	                $scope.pager = response.pager;
	                $scope.pager.toolBarDisplay = 5;
	
	                Paginator.setPage($scope.pager.page);
	                Paginator.setPageCount($scope.pager.pageCount);
	                Paginator.setPageSize($scope.pager.pageSize);
	                Paginator.setItemCount($scope.pager.total);
	                $scope.model.totalDataElements = $scope.pager.total;
	            }
	            $scope.model.reportReady = true;
	            $scope.model.reportStarted = false;
	        });
	    };
	
	    dhis2.ndp.downloadMetaData().then(function () {
	        SessionStorageService.set('METADATA_CACHED', true);
	
	        MetaDataFactory.getAll('attributes').then(function (attributes) {
	
	            $scope.model.attributes = attributes;
	
	            MetaDataFactory.getAll('categoryCombos').then(function (categoryCombos) {
	                angular.forEach(categoryCombos, function (cc) {
	                    $scope.model.categoryCombosById[cc.id] = cc;
	                });
	
	                MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	                    $scope.model.optionSets = optionSets;
	                    angular.forEach(optionSets, function (optionSet) {
	                        $scope.model.optionSetsById[optionSet.id] = optionSet;
	                    });
	
	                    $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	                    if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                        NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                        return;
	                    }
	
	                    $scope.model.ndpProgram = $filter('filter')(optionSets, { code: 'ndpIIIProgram' })[0];
	
	                    $scope.sortHeader = { id: 'displayName', name: 'name', colSize: "col-sm-1", show: true, fetch: false, direction: 'asc' };
	                    $scope.model.dictionaryHeaders = [{ id: 'displayName', name: 'name', colSize: "col-sm-1", show: true, fetch: false, sortable: true, direction: 'asc' }, { id: 'code', name: 'code', colSize: "col-sm-1", show: true, fetch: false, sortable: true }, { id: 'aggregationType', name: 'aggregationType', colSize: "col-sm-1", show: true, fetch: false, direction: 'asc' }, { id: 'disaggregation', name: 'disaggregation', colSize: "col-sm-1", show: true, fetch: false }, { id: 'valueType', name: 'valueType', colSize: "col-sm-1", show: true, fetch: false }, { id: 'periodType', name: 'frequency', colSize: "col-sm-1", show: true, fetch: false }, { id: 'vote', name: 'vote', colSize: 'col-sm-1', show: true, fetch: false }];
	
	                    //                    angular.forEach($scope.model.attributes, function(att){
	                    //                        if(att['dataElementAttribute'] && $scope.model.completeness.invalid.indexOf(att.code) === -1 ){
	                    //                            var header = {id: att.code, name: att.name, show: false, fetch: true, colSize: "col-sm-1"};
	                    //                            $scope.model.dictionaryHeaders.push(header);
	                    //                        }
	                    //                    });
	
	                    $scope.populateMenu();
	                    $scope.fetchIndicators();
	                });
	            });
	        });
	    });
	
	    $scope.jumpToPage = function () {
	        if ($scope.pager && $scope.pager.page && $scope.pager.pageCount && $scope.pager.page > $scope.pager.pageCount) {
	            $scope.pager.page = $scope.pager.pageCount;
	        }
	        $scope.fetchIndicators();
	    };
	
	    $scope.resetPageSize = function () {
	        $scope.pager.page = 1;
	        $scope.fetchIndicators();
	    };
	
	    $scope.getPage = function (page) {
	        $scope.pager.page = page;
	        $scope.fetchIndicators();
	    };
	
	    $scope.sortItems = function (header) {
	        if ($scope.sortHeader && $scope.sortHeader.id === header.id) {
	            if ($scope.sortHeader.direction === 'desc') {
	                $scope.sortHeader.direction = 'asc';
	            } else {
	                $scope.sortHeader.direction = 'desc';
	            }
	        } else {
	            $scope.sortHeader = header;
	            $scope.sortHeader.direction = 'asc';
	        }
	        $scope.fetchIndicators();
	    };
	
	    $scope.filterIndicators = function () {
	        $scope.fetchIndicators();
	    };
	
	    $scope.showDetails = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                },
	                fullFetched: function fullFetched() {
	                    return true;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.showHideColumns = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'views/column-modal.html',
	            controller: 'ColumnDisplayController',
	            resolve: {
	                gridColumns: function gridColumns() {
	                    return $scope.model.dictionaryHeaders;
	                },
	                hiddenGridColumns: function hiddenGridColumns() {
	                    return $filter('filter')($scope.model.dictionaryHeaders, { show: false }).length;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (gridColumns) {
	            $scope.model.dictionaryHeaders = gridColumns;
	        });
	    };
	
	    $scope.itemExists = function (item) {
	        return $scope.model.selectedDataElementGroups.indexOf(item) !== -1;
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = "indicator-dictionary.xls";
	        if (name) {
	            reportName = name + '.xls';
	        }
	        saveAs(blob, reportName);
	    };
	
	    $scope.resetView = function (horizontalMenu) {
	        $scope.model.selectedProgram = null;
	        $scope.model.filterText = null;
	    };
	
	    $scope.currentView = $scope.model.horizontalMenus.find(function (m) {
	        return m.active;
	    }).view;
	    $scope.resetTheView = function (menu, $event) {
	        $scope.model.horizontalMenus.forEach(function (m) {
	            m.active = false;
	        });
	
	        menu.active = true;
	
	        $scope.currentView = menu.view;
	    };
	}]);

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	/* global ndpFramework */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('DictionaryDetailsController', ["$scope", "$modalInstance", "dictionaryItem", "fullFetched", "DictionaryService", "MetaDataFactory", function ($scope, $modalInstance, dictionaryItem, fullFetched, DictionaryService, MetaDataFactory) {
	
	    $scope.dictionaryItem = dictionaryItem;
	    $scope.model = {
	        completeness: {
	            green: ['displayName', 'code', 'periodType', 'computationMethod', 'indicatorType', 'preferredDataSource', 'rationale', 'responsibilityForIndicator', 'unit'],
	            yellow: ['displayName', 'code', 'accountabilityForIndicator', 'computationMethod', 'preferredDataSource', 'unit'],
	            invalid: ['isProgrammeDocument', 'isDocumentFolder']
	        },
	        dictionaryHeaders: [{ id: 'displayName', name: 'name', colSize: "col-sm-1", show: true, fetch: false }, { id: 'code', name: 'code', colSize: "col-sm-1", show: true, fetch: false }, { id: 'aggregationType', name: 'aggregationType', colSize: "col-sm-1", show: true, fetch: false }, { id: 'disaggregation', name: 'disaggregation', colSize: "col-sm-1", show: true, fetch: false }, { id: 'valueType', name: 'valueType', colSize: "col-sm-1", show: true, fetch: false }, { id: 'periodType', name: 'frequency', colSize: "col-sm-1", show: true, fetch: false }, { id: 'vote', name: 'vote', colSize: 'col-sm-1', show: true, fetch: false }],
	        categoryCombosById: {}
	    };
	
	    MetaDataFactory.getAll('categoryCombos').then(function (categoryCombos) {
	        angular.forEach(categoryCombos, function (cc) {
	            $scope.model.categoryCombosById[cc.id] = cc;
	        });
	
	        MetaDataFactory.getAll('attributes').then(function (attributes) {
	            $scope.model.attributes = attributes;
	            angular.forEach($scope.model.attributes, function (att) {
	                if (att['dataElementAttribute'] && $scope.model.completeness.invalid.indexOf(att.code) === -1) {
	                    var header = { id: att.code, name: att.name, show: false, fetch: true, colSize: "col-sm-1" };
	                    //                    $scope.model.dictionaryHeaders.push(header);
	                }
	            });
	        });
	    });
	
	    $scope.model.dictionaryItem = dictionaryItem;
	    $scope.model.fullFetched = fullFetched;
	
	    if ($scope.dictionaryItem && !$scope.model.fullFetched) {
	        DictionaryService.getDataElement($scope.dictionaryItem, $scope.model.dictionaryHeaders, $scope.model.completeness, $scope.model.categoryCombosById).then(function (response) {
	            $scope.model.dictionaryItem = response;
	        });
	    }
	
	    $scope.close = function () {
	        $modalInstance.close();
	    };
	}]);

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	/* global ndpFramework */
	ndpFramework.controller('DataValueExplanationController', ["$scope", "$modalInstance", "$filter", "$window", "DHIS2URL", "item", "DataValueService", "DocumentService", "MetaDataFactory", function ($scope, $modalInstance, $filter, $window, DHIS2URL, item, DataValueService, DocumentService, MetaDataFactory) {
	
	    $scope.selectedItem = {};
	    $scope.fetchExplanation = true;
	    $scope.categoryCombosById = [];
	    $scope.dataPeriods = [];
	    $scope.dataVotes = [];
	    $scope.votesById = {};
	
	    if (!item || !item.details || !item.period || !item.aoc || !item.coc) {
	        $scope.fetchExplanation = false;
	    } else {
	        $scope.dataElementId = item.details;
	        $scope.period = item.period;
	        $scope.aoc = item.aoc;
	        $scope.coc = item.coc;
	
	        $scope.selectedItem = {
	            dataElementId: item.details,
	            period: item.period,
	            aoc: item.aoc,
	            coc: item.coc.id
	        };
	
	        MetaDataFactory.getAll('categoryCombos').then(function (categoryCombos) {
	            angular.forEach(categoryCombos, function (cc) {
	                $scope.categoryCombosById[cc.id] = cc;
	            });
	            MetaDataFactory.getAll('dataSets').then(function (dataSets) {
	
	                angular.forEach(dataSets, function (ds) {
	                    ds.dataElements = ds.dataElements.map(function (de) {
	                        return de.id;
	                    });
	                });
	
	                MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	                    for (var j = 0; j < dataElements.length; j++) {
	                        var de = dataElements[j];
	                        if (de.id === $scope.selectedItem.dataElementId) {
	                            de.votes = [];
	                            de.periodTypes = [];
	                            de.dataSets = [];
	
	                            de.decc = $scope.categoryCombosById[de.categoryCombo.id];
	                            for (var k = 0; k < de.decc.categoryOptionCombos.length; k++) {
	                                if (de.decc.categoryOptionCombos[k].id === $scope.selectedItem.coc) {
	                                    $scope.selectedCoc = de.decc.categoryOptionCombos[k];
	                                    break;
	                                }
	                            }
	
	                            for (var i = 0; i < dataSets.length; i++) {
	                                var ds = dataSets[i];
	                                if (ds && ds.dataElements.indexOf(de.id) !== -1) {
	                                    de.dscc = $scope.categoryCombosById[ds.categoryCombo.id];
	                                    for (var l = 0; l < de.dscc.categoryOptionCombos.length; l++) {
	                                        var opts = $.map(de.dscc.categoryOptionCombos[l].categoryOptions, function (op) {
	                                            return op.id;
	                                        });
	                                        if (opts.indexOf($scope.selectedItem.aoc) !== -1) {
	                                            $scope.selectedAoc = de.dscc.categoryOptionCombos[l];
	                                            break;
	                                        }
	                                    }
	
	                                    if (de.periodTypes.indexOf(ds.periodType) === -1) {
	                                        de.periodTypes.push(ds.periodType);
	                                    }
	                                    angular.forEach(ds.organisationUnits, function (ou) {
	                                        $scope.votesById[ou.id] = ou;
	                                        if (de.votes.indexOf(ou.id) === -1) {
	                                            de.votes.push(ou.id);
	                                        }
	                                    });
	                                    de.dataSets.push(ds.id);
	                                }
	                            }
	
	                            if (de.decc.isDefault) {
	                                $scope.selectedItem.displayName = de.displayName;
	                            } else {
	                                $scope.selectedItem.displayName = de.displayName + ' - ' + $scope.selectedCoc.displayName;
	                            }
	
	                            $scope.selectedItem.dscc = de.dscc;
	                            $scope.selectedItem.orgUnits = de.votes;
	                            $scope.selectedItem.dataSets = de.dataSets;
	                            $scope.selectedItem.periodTypes = de.periodTypes;
	
	                            break;
	                        }
	                    }
	
	                    var dataValueSetUrl = 'dataSet=' + $scope.selectedItem.dataSets.join(',');
	                    dataValueSetUrl += '&orgUnit=' + $scope.selectedItem.orgUnits.join(',');
	                    dataValueSetUrl += '&startDate=' + $scope.period.startDate;
	                    dataValueSetUrl += '&endDate=' + $scope.period.endDate;
	
	                    var pushedVotes = [];
	                    var pushedPeriods = [];
	                    DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                        if (response.dataValues && response.dataValues.length > 0) {
	                            var params = {
	                                dataElement: $scope.selectedItem.dataElementId,
	                                categoryOptionCombo: $scope.selectedCoc.id
	                            };
	
	                            if ($scope.selectedAoc && $scope.selectedAoc.id) {
	                                params.attributeOptionCombo = $scope.selectedAoc.id;
	                            }
	
	                            $scope.dataValues = $filter('filter')(response.dataValues, params);
	
	                            var eventIds = [];
	
	                            angular.forEach($scope.dataValues, function (dv) {
	                                if (dv.comment) {
	                                    dv.comment = JSON.parse(dv.comment);
	
	                                    if (dv.comment.attachment) {
	                                        angular.forEach(dv.comment.attachment, function (att) {
	                                            eventIds.push(att);
	                                        });
	                                    };
	                                }
	
	                                if (pushedVotes.indexOf(dv.orgUnit) === -1) {
	                                    pushedVotes.push(dv.orgUnit);
	                                    $scope.dataVotes.push($scope.votesById[dv.orgUnit]);
	                                }
	                                if (pushedPeriods.indexOf(dv.period) === -1) {
	                                    pushedPeriods.push(dv.period);
	                                    $scope.dataPeriods.push({ id: dv.period, name: dv.period });
	                                }
	                            });
	
	                            $scope.documents = {};
	                            if (eventIds.length > 0) {
	                                DocumentService.getMultiple(eventIds).then(function (docs) {
	                                    $scope.documents = docs;
	                                });
	                            }
	                        }
	                    });
	                });
	            });
	        });
	    }
	
	    $scope.downloadFile = function (path, e) {
	        if (path) {
	            $window.open(DHIS2URL + path, '_blank', '');
	        }
	        if (e) {
	            e.stopPropagation();
	            e.preventDefault();
	        }
	    };
	
	    $scope.close = function () {
	        $modalInstance.close();
	    };
	}]);

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	/* global angular, dhis2, docLibrary */
	
	'use strict';
	
	var ndpFramework = angular.module('ndpFramework');
	
	//Controller for settings page
	ndpFramework.controller('FaqController', ["$scope", "$translate", "$filter", "NotificationService", "EventService", "MetaDataFactory", "OrgUnitFactory", function ($scope, $translate, $filter, NotificationService, EventService, MetaDataFactory, OrgUnitFactory) {
	
	    $scope.model = {
	        optionSets: null,
	        events: [],
	        dataElements: [],
	        programmeDataElement: null,
	        showFaqResponse: false,
	        selectedFaq: null,
	        faqs: []
	    };
	
	    /*$scope.model.horizontalMenus = [
	        {id: 'faq', title: 'faq_title', order: 1, view: 'components/faq/faq.html', active: true, class: 'main-horizontal-menu'}
	    ];*/
	
	    MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	        $scope.model.optionSets = optionSets.reduce(function (map, obj) {
	            map[obj.id] = obj;
	            return map;
	        }, {});
	
	        MetaDataFactory.getAll('programs').then(function (programs) {
	            $scope.model.programs = $filter('filter')(programs, { programType: 'WITHOUT_REGISTRATION', programDomain: 'faq' }, true);
	
	            //Get orgunits for the logged in user
	            OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                $scope.orgUnits = response.organisationUnits;
	                angular.forEach($scope.orgUnits, function (ou) {
	                    ou.show = true;
	                    angular.forEach(ou.children, function (o) {
	                        o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                    });
	                });
	                $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	            });
	        });
	    });
	
	    //watch for selection of program
	    $scope.$watch('model.selectedProgram', function () {
	        $scope.model.selectedProgramStage = null;
	        $scope.model.faqs = [];
	        if (angular.isObject($scope.model.selectedProgram) && $scope.model.selectedProgram.id) {
	            $scope.loadProgramDetails();
	        }
	    });
	
	    $scope.loadProgramDetails = function () {
	        $scope.model.selectedProgramStage = null;
	        $scope.model.faqs = [];
	        if ($scope.model.selectedProgram && $scope.model.selectedProgram.id && $scope.model.selectedProgram.programStages.length > 0) {
	            $scope.model.selectedProgramStage = $scope.model.selectedProgram.programStages[0];
	
	            var prDes = $scope.model.selectedProgramStage.programStageDataElements;
	
	            $scope.model.dynamicHeaders = [{ id: 'faq', displayName: $translate.instant('faq_title') }];
	            $scope.model.dataElements = [];
	            angular.forEach(prDes, function (prDe) {
	                $scope.model.dataElements[prDe.dataElement.id] = prDe.dataElement;
	            });
	
	            $scope.fetchEvents();
	        }
	    };
	
	    $scope.fetchEvents = function () {
	
	        if ($scope.selectedOrgUnit && $scope.selectedOrgUnit.id && $scope.model.selectedProgram && $scope.model.selectedProgram.id) {
	
	            EventService.getByOrgUnitAndProgram($scope.selectedOrgUnit.id, 'DESCENDANTS', $scope.model.selectedProgram.id, $scope.model.optionSets, $scope.model.dataElements).then(function (events) {
	                $scope.model.faqs = events;
	            });
	        }
	    };
	
	    $scope.showFaqResponse = function (faq) {
	        if ($scope.model.selectedFaq && $scope.model.selectedFaq.event === faq.event) {
	            $scope.model.showFaqResponse = !$scope.model.showFaqResponse;
	            $scope.model.selectedFaq = null;
	        } else {
	            $scope.model.showFaqResponse = true;
	            $scope.model.selectedFaq = faq;
	        }
	    };
	
	    $scope.resetView = function () {
	        $scope.model.selectedProgram = null;
	    };
	}]);

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	/* global ndpFramework, dhis2 */
	ndpFramework.controller('GoalController', ["$scope", "$translate", "$modal", "$filter", "orderByFilter", "NotificationService", "SelectedMenuService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "Analytics", "CommonUtils", "FinancialDataService", "DataValueService", function ($scope, $translate, $modal, $filter, orderByFilter, NotificationService, SelectedMenuService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, Analytics, CommonUtils, FinancialDataService, DataValueService) {
	
	    $scope.showReportFilters = false;
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        dataElements: [],
	        dataElementsById: [],
	        kra: [],
	        goals: [],
	        selectedKra: null,
	        selectedGoal: null,
	        dataElementGroups: [],
	        baseLineTargetActualDimensions: [],
	        performanceOverviewHeaders: [],
	        categoryCombosById: {},
	        optionSets: [],
	        optionSetsById: [],
	        dictionaryItems: [],
	        selectedPeriods: [],
	        periods: [],
	        allPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly',
	        groupSetSize: {},
	        physicalPerformance: true,
	        financialPerformance: true,
	        showProjectDetails: false,
	        showExplanation: false,
	        explanations: [],
	        commentRow: {}
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'target', title: 'targets', order: 1, view: 'components/goal/results.html', active: true, class: 'main-horizontal-menu' }, { id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/goal/physical-performance.html', class: 'main-horizontal-menu' }, { id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/goal/performance-overview.html', class: 'main-horizontal-menu' }, { id: 'completeness', title: 'completeness', order: 4, view: 'components/goal/completeness.html', class: 'main-horizontal-menu' }];
	
	    $scope.$watch('model.selectedGoal', function () {
	        $scope.model.selectedKra = null;
	        $scope.model.kras = [];
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedGoal) && $scope.model.selectedGoal.id) {
	            angular.forEach($scope.model.selectedGoal.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	
	            $scope.model.kras = $scope.model.selectedGoal.dataElementGroups;
	        } else {
	            angular.forEach($scope.model.dataElementGroupSets, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                    if (_deg.length > 0) {
	                        $scope.model.dataElementGroup.push(_deg[0]);
	                    }
	                });
	            });
	        }
	    });
	
	    $scope.$on('MENU', function () {
	        $scope.populateMenu();
	    });
	
	    $scope.$watch('model.selectedKra', function () {
	        $scope.resetDataView();
	        $scope.model.dataElementGroup = [];
	        if (angular.isObject($scope.model.selectedKra) && $scope.model.selectedKra.id) {
	            var _deg = $filter('filter')($scope.model.dataElementGroups, { id: $scope.model.selectedKra.id });
	            if (_deg.length > 0) {
	                $scope.model.dataElementGroup.push(_deg[0]);
	            }
	            $scope.getAnalyticsData();
	        } else {
	            $scope.getGoals();
	        }
	    });
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    $scope.getGoals = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.dataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                if (_deg.length > 0) {
	                    _deg[0].dataElementGroupSetName = degs.displayName;
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    dhis2.ndp.downloadGroupSets('goal').then(function () {
	
	        OptionComboService.getBtaDimensions().then(function (response) {
	
	            if (!response || !response.bta || !response.baseline || !response.actual || !response.target) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                return;
	            }
	
	            $scope.model.bta = response.bta;
	            $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                return d.id;
	            });
	            $scope.model.actualDimension = response.actual;
	            $scope.model.targetDimension = response.target;
	            $scope.model.baselineDimension = response.baseline;
	
	            MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                    map[obj.id] = obj;
	                    return map;
	                }, {});
	
	                MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                    $scope.model.dataElementGroups = dataElementGroups;
	
	                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'goal').then(function (dataElementGroupSets) {
	                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	                        $scope.model.dataElementGroupSets = orderByFilter($scope.model.dataElementGroupSets, '-displayName').reverse();
	
	                        var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                        $scope.model.allPeriods = angular.copy(periods);
	                        $scope.model.periods = periods;
	
	                        var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	
	                        angular.forEach($scope.model.periods, function (pe) {
	                            if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                $scope.model.selectedPeriods.push(pe);
	                            }
	                        });
	
	                        //Get orgunits for the logged in user
	                        OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                            $scope.orgUnits = response.organisationUnits;
	                            angular.forEach($scope.orgUnits, function (ou) {
	                                ou.show = true;
	                                angular.forEach(ou.children, function (o) {
	                                    o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                                });
	                            });
	
	                            $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	                            $scope.model.metaDataCached = true;
	                            $scope.populateMenu();
	                            $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders();
	                        });
	                    });
	                });
	            });
	        });
	    }, function () {
	        console.log('error');
	    });
	
	    $scope.populateMenu = function () {
	
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedGoal = null;
	        $scope.model.selectedKra = null;
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            if ($scope.model.dataElementGroupSets && $scope.model.dataElementGroupSets.length === 1) {
	                $scope.model.selectedGoal = $scope.model.dataElementGroupSets[0];
	            } else {
	                $scope.getGoals();
	            }
	        }
	    };
	
	    $scope.getPeriods = function (mode) {
	        var periods = [];
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	
	        var periodsById = {};
	        angular.forEach($scope.model.periods, function (p) {
	            periodsById[p.id] = p;
	        });
	
	        angular.forEach(periods, function (p) {
	            if (!periodsById[p.id]) {
	                periodsById[p.id] = p;
	            }
	        });
	
	        $scope.model.periods = Object.values(periodsById);
	
	        $scope.model.allPeriods = angular.copy($scope.model.periods);
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if (!$scope.model.dataElementGroup || $scope.model.dataElementGroup.length === 0) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_goal"));
	            return;
	        }
	
	        $scope.getBasePeriod();
	
	        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods.concat($scope.model.basePeriod), function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var pHeaders = CommonUtils.getPerformanceOverviewHeaders();
	            $scope.model.pHeadersLength = pHeaders.length;
	            var prds = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            $scope.model.performanceOverviewHeaders = [];
	            angular.forEach(prds, function (pe) {
	                angular.forEach(pHeaders, function (p) {
	                    var h = angular.copy(p);
	                    h.period = pe.id;
	                    $scope.model.performanceOverviewHeaders.push(h);
	                });
	            });
	
	            $scope.model.dataElementGroupsById = $scope.model.dataElementGroup.reduce(function (map, obj) {
	                map[obj.id] = obj;
	                return map;
	            }, {});
	
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	            FinancialDataService.getLocalData('data/cost.json').then(function (cost) {
	                $scope.model.cost = cost;
	
	                Analytics.getData(analyticsUrl).then(function (data) {
	                    if (data && data.data && data.metaData) {
	                        $scope.model.data = data.data;
	                        $scope.model.metaData = data.metaData;
	                        $scope.model.reportReady = true;
	                        $scope.model.reportStarted = false;
	
	                        var dataParams = {
	                            data: data.data,
	                            metaData: data.metaData,
	                            reportPeriods: angular.copy($scope.model.selectedPeriods),
	                            bta: $scope.model.bta,
	                            selectedDataElementGroupSets: $scope.model.dataElementGroupSets,
	                            selectedDataElementGroup: $scope.model.selectedKra,
	                            dataElementGroups: $scope.model.dataElementGroups,
	                            basePeriod: $scope.model.basePeriod,
	                            targetDimension: $scope.model.targetDimension,
	                            baselineDimension: $scope.model.baselineDimension,
	                            actualDimension: $scope.model.actualDimension,
	                            maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                            allPeriods: $scope.model.allPeriods,
	                            dataElementGroupsById: $scope.model.dataElementGroupsById,
	                            dataElementsById: $scope.model.dataElementsById,
	                            cost: $scope.model.cost,
	                            displayVision2040: true,
	                            performanceOverviewHeaders: $scope.model.performanceOverviewHeaders,
	                            displayActionBudgetData: false
	                        };
	
	                        var processedData = Analytics.processData(dataParams);
	                        $scope.model.dataHeaders = processedData.dataHeaders;
	                        $scope.model.reportPeriods = processedData.reportPeriods;
	                        $scope.model.dataExists = processedData.dataExists;
	                        $scope.model.selectedDataElementGroupSets = processedData.selectedDataElementGroupSets;
	                        $scope.model.hasPhysicalPerformanceData = processedData.hasPhysicalPerformanceData;
	                        $scope.model.numerator = processedData.completenessNum;
	                        $scope.model.denominator = processedData.completenessDen;
	                        $scope.model.dataElementRowIndex = processedData.dataElementRowIndex;
	                        $scope.model.tableRows = processedData.tableRows;
	                        $scope.model.povTableRows = processedData.povTableRows;
	                    }
	                });
	            });
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById(name).innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedMenu.displayName;
	
	        if (name) {
	            reportName += " - " + name;
	        }
	
	        reportName += ".xls";
	
	        saveAs(blob, reportName);
	    };
	
	    $scope.getExplanations = function () {
	        $scope.model.showExplanation = !$scope.model.showExplanation;
	        if ($scope.model.showExplanation && $scope.model.explanations.length === 0) {
	            var dataValueSetUrl = 'orgUnit=' + $scope.selectedOrgUnit.id;
	            dataValueSetUrl += '&children=true';
	            dataValueSetUrl += '&startDate=' + $scope.model.selectedPeriods[0].startDate;
	            dataValueSetUrl += '&endDate=' + $scope.model.selectedPeriods.slice(-1)[0].endDate;
	
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                dataValueSetUrl += '&dataElementGroup=' + deg.id;
	            });
	
	            DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                if (response && response.dataValues) {
	                    angular.forEach(response.dataValues, function (dv) {
	                        if (dv.comment) {
	                            dv.comment = JSON.parse(dv.comment);
	                            if (dv.comment.explanation) {
	                                $scope.model.explanations.push({
	                                    dataElement: dv.dataElement,
	                                    order: $scope.model.dataElementRowIndex[dv.dataElement],
	                                    comment: dv.comment.explanation
	                                });
	                            }
	                        }
	                    });
	
	                    $scope.model.explanations = orderByFilter($scope.model.explanations, '-order').reverse();
	                    var index = 1;
	                    angular.forEach($scope.model.explanations, function (exp) {
	                        $scope.model.commentRow[exp.dataElement] = index;
	                        index++;
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                },
	                fullFetched: function fullFetched() {
	                    return false;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getCoverage = function (numerator, denominator) {
	        return CommonUtils.getPercent(numerator, denominator, false, true);
	    };
	
	    $scope.getHeaderClass = function (header) {
	        return header.style;
	    };
	}]);

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	/* global angular, dhis2, ndpFramework */
	
	'use strict';
	
	var ndpFramework = angular.module('ndpFramework');
	
	//Controller for settings page
	ndpFramework.controller('HomeController', ["$rootScope", "$scope", "$modal", "$translate", "$filter", "SessionStorageService", "SelectedMenuService", "NotificationService", "NDPMenuService", "MetaDataFactory", function ($rootScope, $scope, $modal, $translate, $filter, SessionStorageService, SelectedMenuService, NotificationService, NDPMenuService, MetaDataFactory) {
	
	    $scope.model = {
	        metaDataCached: false,
	        dataElementGroups: [],
	        dataElementGroupSets: [],
	        dataElementGroup: [],
	        optionSets: [],
	        optionSetsById: [],
	        selectedNDP: null,
	        ndp: null,
	        slides: []
	    };
	
	    var start = new Date();
	    $rootScope.DHIS2URL = ({"baseUrl":"http://localhost:9292","authorization":"Basic YWRtaW46ZGlzdHJpY3Q=","apiRoot":"../../..","mode":"PROD"}).apiRoot;
	    dhis2.ndp.downloadMetaData().then(function () {
	        var end = new Date();
	        SessionStorageService.set('METADATA_CACHED', true);
	        console.log('Finished loading metadata in about ', Math.floor((end - start) / 1000), ' - secs');
	
	        MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	            $scope.model.ndp = $filter('getFirst')(optionSets, { code: 'ndp' });
	
	            if (!$scope.model.ndp || !$scope.model.ndp.code || !$scope.model.ndp.options || $scope.model.ndp.options.length < 1) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                return;
	            }
	
	            var currentNDP = $filter('filter')($scope.model.ndp.options, { isCurrentNDP: true });
	            if (currentNDP && currentNDP.length && currentNDP.length === 1) {
	                $scope.model.selectedNDP = currentNDP[0];
	            } else {
	                $scope.model.selectedNDP = $scope.model.ndp.options[0];
	            }
	
	            $scope.model.metaDataCached = true;
	
	            //            for( var i=1; i<=12; i++ ){
	            //                $scope.model.slides.push({
	            //                    id: i,
	            //                    type: 'IMG',
	            //                    path: 'images/NDPIII/' + i + '.png',
	            //                    style: 'background-image:url(images/NDPIII/' + i + '.png)'
	            //                });
	            //            }
	
	            for (var i = 1; i <= 3; i++) {
	                $scope.model.slides.push({
	                    id: i,
	                    type: 'IMG',
	                    path: 'images/NDPIII/' + i + '.jpeg',
	                    style: 'background-image:url(images/NDPIII/' + i + '.jpeg)'
	                });
	            }
	
	            NDPMenuService.getMenu().then(function (menu) {
	                $scope.model.menuItems = [{
	                    id: 'navigation',
	                    order: 0,
	                    displayName: $translate.instant('navigation'),
	                    root: true,
	                    show: true,
	                    children: menu
	                }];
	            });
	        });
	    });
	
	    $scope.$watch('model.selectedNDP', function () {
	        $scope.model.selectedMenu = null;
	    });
	
	    $scope.setSelectedMenu = function (menu) {
	
	        if (menu.address) {
	            window.location.href = menu.address;
	        } else {
	            if (!menu.hasNoNDP && !$scope.model.selectedNDP) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("please_selected_ndp"));
	                return;
	            }
	
	            if ($scope.model.selectedMenu && $scope.model.selectedMenu.id === menu.id) {
	                $scope.model.selectedMenu = null;
	            } else {
	                $scope.model.selectedMenu = menu;
	                if ($scope.model.selectedNDP && $scope.model.selectedNDP.code) {
	                    $scope.model.selectedMenu.ndp = $scope.model.selectedNDP.code;
	                }
	            }
	            SelectedMenuService.setSelectedMenu($scope.model.selectedMenu);
	            $scope.$broadcast('MENU', $scope.model.selectedMenu);
	        }
	    };
	
	    $scope.setBottomMenu = function (menu) {
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.domain === menu) {
	            $scope.model.selectedMenu = null;
	        } else {
	            $scope.model.selectedMenu = { domain: menu, view: $scope.model.bottomMenu[menu] };
	        }
	    };
	
	    $scope.goToMenu = function (menuLink) {
	        window.location.href = menuLink;
	    };
	
	    $scope.getMenuStyle = function (menu) {
	        var style = menu.class + ' horizontal-menu font-16';
	        if (menu.active) {
	            style += ' active-horizontal-menu';
	        }
	        return style;
	    };
	
	    $scope.getTreeMenuStyle = function (menuItem) {
	        var style = "";
	        if (menuItem) {
	            if (menuItem.id !== 'SPACE') {
	                style += 'active-menu-item';
	            }
	        }
	
	        return style;
	    };
	
	    $scope.settings = function () {
	
	        var modalInstance = $modal.open({
	            templateUrl: 'components/settings/settings-modal.html',
	            controller: 'SettingsController'
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.isSubMenuOpen = {
	        NPD: false
	    };
	    $scope.toggleSubMenu = function (menuName) {
	        $scope.isSubMenuOpen[menuName] = !$scope.isSubMenuOpen[menuName];
	    };
	}]);

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('IntermediateOutcomeController', ["$scope", "$translate", "$modal", "$filter", "orderByFilter", "NotificationService", "SelectedMenuService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "ResulstChainService", "CommonUtils", "DateUtils", "DataValueService", "ClusterDataService", "Analytics", function ($scope, $translate, $modal, $filter, orderByFilter, NotificationService, SelectedMenuService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, ResulstChainService, CommonUtils, DateUtils, DataValueService, ClusterDataService, Analytics) {
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        dataElementsById: [],
	        optionSetsById: [],
	        optionSets: [],
	        legendSetsById: [],
	        defaultLegendSet: null,
	        objectives: [],
	        ndpObjectives: [],
	        ndpProgrammes: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        performanceOverviewHeaders: [],
	        dataElementGroups: [],
	        allDataElementGroups: [],
	        selectedNdpProgram: null,
	        selectedPeriods: [],
	        periods: [],
	        allPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly',
	        displayProjectOutputs: true,
	        displayDepartmentOutPuts: true,
	        explanations: [],
	        commentRow: {}
	    };
	
	    //    $scope.model.horizontalMenus = [
	    //        {id: 'result', title: 'targets', order: 1, view: 'components/intermediate-outcome/results.html', active: true, class: 'main-horizontal-menu'},
	    //        {id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/intermediate-outcome/physical-performance.html', class: 'main-horizontal-menu'},
	    //        {id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/intermediate-outcome/performance-overview.html', class: 'main-horizontal-menu'},
	    //        {id: 'clusterPerformance', title: 'cluster_performance', order: 4, view: 'views/cluster/cluster-performance.html', class: 'main-horizontal-menu'},
	    //        {id: 'completeness', title: 'completeness', order: 5, view: 'components/intermediate-outcome/completeness.html', class: 'main-horizontal-menu'}
	    //    ];
	
	    $scope.model.horizontalMenus = [{ id: 'result', title: 'targets', order: 1, view: 'components/intermediate-outcome/results.html', active: true, class: 'main-horizontal-menu' }, { id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/intermediate-outcome/physical-performance.html', class: 'main-horizontal-menu' }, { id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/intermediate-outcome/performance-overview.html', class: 'main-horizontal-menu' }, { id: 'completeness', title: 'completeness', order: 4, view: 'components/intermediate-outcome/completeness.html', class: 'main-horizontal-menu' }];
	
	    //Get orgunits for the logged in user
	    OrgUnitFactory.getViewTreeRoot().then(function (response) {
	        $scope.orgUnits = response.organisationUnits;
	        angular.forEach($scope.orgUnits, function (ou) {
	            ou.show = true;
	            angular.forEach(ou.children, function (o) {
	                o.hasChildren = o.children && o.children.length > 0 ? true : false;
	            });
	        });
	        $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	    });
	
	    $scope.getOutcomes = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { indicatorGroupType: 'intermediateOutcome', id: deg.id }, true);
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    $scope.getObjectives = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	
	        $scope.model.subProgrammes = $scope.model.dataElementGroup;
	    };
	
	    $scope.$on('MENU', function () {
	        $scope.populateMenu();
	    });
	
	    $scope.$watch('model.selectedNdpProgram', function () {
	        $scope.model.selectedKra = null;
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedObjective) && $scope.model.selectedObjective.id) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { id: $scope.model.selectedObjective.id });
	            angular.forEach($scope.model.selectedObjective.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	
	            $scope.model.subProgrammes = $scope.model.selectedObjective.dataElementGroups;
	        } else {
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	            angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                    if (_deg.length > 0) {
	                        $scope.model.dataElementGroup.push(_deg[0]);
	                    }
	                });
	            });
	        }
	    });
	
	    $scope.$watch('model.selectedSubProgramme', function () {
	        $scope.resetDataView();
	        $scope.model.dataElementGroup = [];
	        if (angular.isObject($scope.model.selectedKra) && $scope.model.selectedKra.id) {
	            var _deg = $filter('filter')($scope.model.dataElementGroups, { id: $scope.model.selectedKra.id });
	            if (_deg.length > 0) {
	                $scope.model.dataElementGroup.push(_deg[0]);
	            }
	
	            $scope.getAnalyticsData();
	        } else {
	            $scope.getObjectives();
	        }
	    });
	
	    //    $scope.$watch('model.selectedNdpProgram', function(){
	    //        $scope.resetDataView();
	    //
	    //        if( $scope.model.resultsFrameworkChain && $scope.model.resultsFrameworkChain.subPrograms ){
	    //            $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
	    //        }
	    //
	    //        $scope.model.selectedSubProgramme = null;
	    //        if( angular.isObject($scope.model.selectedNdpProgram) ){
	    //            if( $scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code ){
	    //                $scope.model.subProgrammes = $filter('startsWith')($scope.model.subProgrammes, {code: $scope.model.selectedNdpProgram.code});
	    //            }
	    //        }
	    //    });
	    //
	    //    $scope.$watch('model.selectedSubProgramme', function(){
	    //        $scope.resetDataView();
	    //    });
	    //
	    //    $scope.$watch('model.selectedCluster', function(){
	    //        $scope.resetDataView();
	    //    });
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    //    dhis2.ndp.downloadGroupSets( 'sub-programme' ).then(function(){
	    //
	    //        MetaDataFactory.getAll('legendSets').then(function(legendSets){
	    //
	    //            /*angular.forEach(legendSets, function(legendSet){
	    //                if ( legendSet.isTrafficLight ){
	    //                    $scope.model.defaultLegendSet = legendSet;
	    //                }
	    //                $scope.model.legendSetsById[legendSet.id] = legendSet;
	    //            });*/
	    //
	    //            MetaDataFactory.getAll('optionSets').then(function(optionSets){
	    //
	    //                $scope.model.optionSets = optionSets;
	    //
	    //                angular.forEach(optionSets, function(optionSet){
	    //                    $scope.model.optionSetsById[optionSet.id] = optionSet;
	    //                });
	    //
	    //                $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, {code: 'ndp'});
	    //
	    //                if( !$scope.model.ndp || !$scope.model.ndp.code ){
	    //                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	    //                    return;
	    //                }
	    //
	    //                $scope.model.piapResultsChain = $filter('getFirst')($scope.model.optionSets, {code: 'piapResultsChain'});
	    //                if( !$scope.model.piapResultsChain || !$scope.model.piapResultsChain.code || !$scope.model.piapResultsChain.options || $scope.model.piapResultsChain.options.length < 1 ){
	    //                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_piap_results_chain_configuration"));
	    //                    return;
	    //                }
	    //
	    //                ResulstChainService.getByOptionSet( $scope.model.piapResultsChain.id ).then(function(chain){
	    //                    $scope.model.resultsFrameworkChain = chain;
	    //                    $scope.model.ndpProgrammes = $scope.model.resultsFrameworkChain.programs;
	    //                    $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
	    //
	    //                    OptionComboService.getBtaDimensions().then(function( response ){
	    //
	    //                        if( !response || !response.bta || !response.baseline || !response.actual || !response.target ){
	    //                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	    //                            return;
	    //                        }
	    //
	    //                        $scope.model.bta = response.bta;
	    //                        $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function(d){return d.id;});
	    //                        $scope.model.actualDimension = response.actual;
	    //                        $scope.model.targetDimension = response.target;
	    //                        $scope.model.baselineDimension = response.baseline;
	    //
	    //                        MetaDataFactory.getAll('dataElements').then(function(dataElements){
	    //
	    //                            $scope.model.dataElementsById = dataElements.reduce( function(map, obj){
	    //                                map[obj.id] = obj;
	    //                                return map;
	    //                            }, {});
	    //
	    //                            MetaDataFactory.getAll('optionGroupSets').then(function(optionGroupSets){
	    //
	    //                                $scope.model.optionGroupSets = optionGroupSets;
	    //
	    //                                MetaDataFactory.getDataElementGroups().then(function(dataElementGroups){
	    //
	    //                                    $scope.model.allDataElementGroups = dataElementGroups;
	    //                                    $scope.model.dataElementGroups = dataElementGroups;
	    //
	    //                                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sub-programme').then(function(dataElementGroupSets){
	    //                                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	    //
	    //                                        var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	    //                                        $scope.model.allPeriods = angular.copy( periods );
	    //                                        $scope.model.periods = periods;
	    //
	    //                                        var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	    //                                        var today = DateUtils.getToday();
	    //                                        angular.forEach($scope.model.periods, function(pe){
	    //                                            if ( pe.startDate <= today && pe.endDate >= today ){
	    //                                                $scope.model.selectedFiscalYear = pe;
	    //                                            }
	    //                                            if(selectedPeriodNames.indexOf(pe.displayName) > -1 ){
	    //                                                $scope.model.selectedPeriods.push(pe);
	    //                                            }
	    //                                        });
	    //
	    //                                        $scope.model.metaDataCached = true;
	    //                                        $scope.populateMenu();
	    //                                        $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders();
	    //                                    });
	    //                                });
	    //                            });
	    //                        });
	    //
	    //                    });
	    //
	    //                });
	    //            });
	    //        });
	    //    });
	
	    dhis2.ndp.downloadGroupSets('resultsFrameworkObjective').then(function () {
	
	        OptionComboService.getBtaDimensions().then(function (response) {
	
	            if (!response || !response.bta || !response.baseline || !response.actual || !response.target) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                return;
	            }
	
	            $scope.model.bta = response.bta;
	            $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                return d.id;
	            });
	            $scope.model.actualDimension = response.actual;
	            $scope.model.targetDimension = response.target;
	            $scope.model.baselineDimension = response.baseline;
	
	            MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                    map[obj.id] = obj;
	                    return map;
	                }, {});
	
	                MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                    $scope.model.dataElementGroups = dataElementGroups;
	
	                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'resultsframeworkobjective').then(function (dataElementGroupSets) {
	                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	                        $scope.model.dataElementGroupSets = orderByFilter($scope.model.dataElementGroupSets, '-displayName').reverse();
	
	                        var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                        $scope.model.allPeriods = angular.copy(periods);
	                        $scope.model.periods = periods;
	
	                        var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	
	                        angular.forEach($scope.model.periods, function (pe) {
	                            if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                $scope.model.selectedPeriods.push(pe);
	                            }
	                        });
	
	                        //Get orgunits for the logged in user
	                        OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                            $scope.orgUnits = response.organisationUnits;
	                            angular.forEach($scope.orgUnits, function (ou) {
	                                ou.show = true;
	                                angular.forEach(ou.children, function (o) {
	                                    o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                                });
	                            });
	                            $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	                            $scope.model.metaDataCached = true;
	                            $scope.populateMenu();
	                            $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders();
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenuOld = function () {
	
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedNdpProgram = null;
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	        }
	
	        var sectorsOpgs = $filter('getFirst')($scope.model.optionGroupSets, { code: $scope.model.selectedMenu.ndp + '_CLUSTER' });
	
	        $scope.model.clusters = sectorsOpgs && sectorsOpgs.optionGroups ? sectorsOpgs.optionGroups : [];
	        if (!$scope.model.clusters || !$scope.model.clusters.length || !$scope.model.clusters.length === 0) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster_configuration"));
	            return;
	        }
	    };
	
	    $scope.populateMenu = function () {
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedNdpProgram = null;
	        $scope.model.selectedKra = null;
	        $scope.resetDataView();
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            $scope.model.ndpProgrammes = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	            if ($scope.model.dataElementGroupSets && $scope.model.dataElementGroupSets.length === 1) {
	                $scope.model.selectedNdpProgram = $scope.model.dataElementGroupSets[0];
	            } else {
	                $scope.getObjectives();
	            }
	        }
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.clusterData = null;
	        $scope.model.reportReady = false;
	        $scope.model.clusterReportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getPeriods = function (mode) {
	        var periods = [];
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	
	        var periodsById = {};
	        angular.forEach($scope.model.periods, function (p) {
	            periodsById[p.id] = p;
	        });
	
	        angular.forEach(periods, function (p) {
	            if (!periodsById[p.id]) {
	                periodsById[p.id] = p;
	            }
	        });
	
	        $scope.model.periods = Object.values(periodsById);
	
	        $scope.model.allPeriods = angular.copy($scope.model.periods);
	    };
	
	    $scope.getAnalyticsDataOld = function () {
	
	        $scope.model.data = null;
	        $scope.resetDataView();
	
	        var analyticsUrl = '';
	
	        var selectedResultsLevel = $scope.model.selectedNdpProgram.code;
	
	        if ($scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code) {
	            selectedResultsLevel = $scope.model.selectedSubProgramme.code;
	        }
	
	        $scope.model.selectedDataElementGroupSets = $filter('startsWith')($scope.model.dataElementGroupSets, { code: selectedResultsLevel });
	        $scope.getOutcomes();
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_outcome_output"));
	            return;
	        }
	
	        $scope.getBasePeriod();
	
	        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods.concat($scope.model.basePeriod), function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var pHeaders = CommonUtils.getPerformanceOverviewHeaders();
	            $scope.model.pHeadersLength = pHeaders.length;
	            var prds = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            $scope.model.performanceOverviewHeaders = [];
	            angular.forEach(prds, function (pe) {
	                angular.forEach(pHeaders, function (p) {
	                    var h = angular.copy(p);
	                    h.period = pe.id;
	                    $scope.model.performanceOverviewHeaders.push(h);
	                });
	            });
	
	            $scope.model.dataElementGroupsById = $scope.model.dataElementGroup.reduce(function (map, obj) {
	                map[obj.id] = obj;
	                return map;
	            }, {});
	
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	            Analytics.getData(analyticsUrl).then(function (data) {
	                if (data && data.data && data.metaData) {
	                    $scope.model.data = data.data;
	                    $scope.model.metaData = data.metaData;
	                    $scope.model.reportReady = true;
	                    $scope.model.reportStarted = false;
	
	                    var dataParams = {
	                        data: data.data,
	                        metaData: data.metaData,
	                        reportPeriods: angular.copy($scope.model.selectedPeriods),
	                        bta: $scope.model.bta,
	                        actualDimension: $scope.model.actualDimension,
	                        targetDimension: $scope.model.targetDimension,
	                        baselineDimension: $scope.model.baselineDimension,
	                        selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                        selectedDataElementGroup: $scope.model.selectedKra,
	                        dataElementGroups: $scope.model.dataElementGroups,
	                        basePeriod: $scope.model.basePeriod,
	                        maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                        allPeriods: $scope.model.allPeriods,
	                        dataElementGroupsById: $scope.model.dataElementGroupsById,
	                        dataElementsById: $scope.model.dataElementsById,
	                        legendSetsById: $scope.model.legendSetsById,
	                        defaultLegendSet: $scope.model.defaultLegendSet,
	                        performanceOverviewHeaders: $scope.model.performanceOverviewHeaders,
	                        displayActionBudgetData: false
	                    };
	
	                    var processedData = Analytics.processData(dataParams);
	                    $scope.model.dataHeaders = processedData.dataHeaders;
	                    $scope.model.reportPeriods = processedData.reportPeriods;
	                    $scope.model.dataExists = processedData.dataExists;
	                    $scope.model.selectedDataElementGroupSets = processedData.selectedDataElementGroupSets;
	                    $scope.model.hasPhysicalPerformanceData = processedData.hasPhysicalPerformanceData;
	                    $scope.model.numerator = processedData.completenessNum;
	                    $scope.model.denominator = processedData.completenessDen;
	                    $scope.model.dataElementRowIndex = processedData.dataElementRowIndex;
	                    $scope.model.tableRows = processedData.tableRows;
	                    $scope.model.povTableRows = processedData.povTableRows;
	                }
	            });
	        }
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if (!$scope.model.dataElementGroup || $scope.model.dataElementGroup.length === 0) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_objective"));
	            return;
	        }
	
	        $scope.getBasePeriod();
	
	        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	            return;
	        }
	
	        console.log($scope.model.dataElementGroup);
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods.concat($scope.model.basePeriod), function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var pHeaders = CommonUtils.getPerformanceOverviewHeaders();
	            $scope.model.pHeadersLength = pHeaders.length;
	            var prds = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            $scope.model.performanceOverviewHeaders = [];
	            angular.forEach(prds, function (pe) {
	                angular.forEach(pHeaders, function (p) {
	                    var h = angular.copy(p);
	                    h.period = pe.id;
	                    $scope.model.performanceOverviewHeaders.push(h);
	                });
	            });
	
	            $scope.model.dataElementGroupsById = $scope.model.dataElementGroup.reduce(function (map, obj) {
	                map[obj.id] = obj;
	                return map;
	            }, {});
	
	            var des = [];
	            $scope.model.theRows = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	
	            Analytics.getData(analyticsUrl).then(function (data) {
	                if (data && data.data && data.metaData) {
	                    $scope.model.data = data.data;
	                    $scope.model.metaData = data.metaData;
	                    $scope.model.reportReady = true;
	                    $scope.model.reportStarted = false;
	
	                    var dataParams = {
	                        data: data.data,
	                        metaData: data.metaData,
	                        reportPeriods: angular.copy($scope.model.selectedPeriods),
	                        bta: $scope.model.bta,
	                        actualDimension: $scope.model.actualDimension,
	                        targetDimension: $scope.model.targetDimension,
	                        baselineDimension: $scope.model.baselineDimension,
	                        selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                        selectedDataElementGroup: $scope.model.selectedKra,
	                        dataElementGroups: $scope.model.dataElementGroups,
	                        basePeriod: $scope.model.basePeriod,
	                        maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                        allPeriods: $scope.model.allPeriods,
	                        dataElementGroupsById: $scope.model.dataElementGroupsById,
	                        dataElementsById: $scope.model.dataElementsById,
	                        legendSetsById: $scope.model.legendSetsById,
	                        defaultLegendSet: $scope.model.defaultLegendSet,
	                        performanceOverviewHeaders: $scope.model.performanceOverviewHeaders,
	                        displayActionBudgetData: false
	                    };
	
	                    var processedData = Analytics.processData(dataParams);
	                    $scope.model.dataHeaders = processedData.dataHeaders;
	                    $scope.model.reportPeriods = processedData.reportPeriods;
	                    $scope.model.dataExists = processedData.dataExists;
	                    $scope.model.selectedDataElementGroupSets = processedData.selectedDataElementGroupSets;
	                    $scope.model.hasPhysicalPerformanceData = processedData.hasPhysicalPerformanceData;
	                    $scope.model.numerator = processedData.completenessNum;
	                    $scope.model.denominator = processedData.completenessDen;
	                    $scope.model.dataElementRowIndex = processedData.dataElementRowIndex;
	                    $scope.model.tableRows = processedData.tableRows;
	                    $scope.model.povTableRows = processedData.povTableRows;
	                }
	            });
	        }
	    };
	
	    $scope.getClusterData = function () {
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if (!$scope.model.selectedCluster || !$scope.model.selectedCluster.options || !$scope.model.selectedCluster.options.length) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
	            return;
	        }
	
	        if (!$scope.model.selectedFiscalYear) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_fiscal_year"));
	            return;
	        }
	
	        var params = {
	            indicatorGroupType: 'intermediateOutcome',
	            selectedOrgUnit: $scope.selectedOrgUnit,
	            selectedCluster: $scope.model.selectedCluster,
	            selectedFiscalYear: $scope.model.selectedFiscalYear,
	            allDataElementGroups: $scope.model.allDataElementGroups,
	            dataElementGroupSets: $scope.model.dataElementGroupSets,
	            bta: $scope.model.bta,
	            baseLineTargetActualDimensions: $scope.model.baseLineTargetActualDimensions,
	            actualDimension: $scope.model.actualDimension,
	            targetDimension: $scope.model.targetDimension,
	            baselineDimension: $scope.model.baselineDimension,
	            selectedDataElementGroupSets: $scope.model.clusterDataElementGroupSets,
	            selectedDataElementGroup: $scope.model.selectedKra,
	            dataElementsById: $scope.model.dataElementsById,
	            legendSetsById: $scope.model.legendSetsById,
	            defaultLegendSet: $scope.model.defaultLegendSet
	        };
	
	        $scope.model.clusterReportReady = false;
	        $scope.model.clusterReportStarted = true;
	        ClusterDataService.getData(params).then(function (result) {
	            $scope.model.clusterReportReady = true;
	            $scope.model.clusterReportStarted = false;
	            $scope.model.clusterData = result.clusterData;
	            $scope.model.hasClusterData = result.hasClusterData;
	            $scope.model.clusterPerformanceOverviewHeaders = result.clusterPerformanceOverviewHeaders;
	        });
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById(name).innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedNdpProgram.displayName + " - intermediate outcome";
	
	        if (name) {
	            reportName += " - " + name;
	        }
	
	        reportName += ".xls";
	
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                },
	                fullFetched: function fullFetched() {
	                    return false;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getExplanations = function () {
	        $scope.model.showExplanation = !$scope.model.showExplanation;
	        if ($scope.model.showExplanation && $scope.model.explanations.length === 0) {
	            var dataValueSetUrl = 'orgUnit=' + $scope.selectedOrgUnit.id;
	            dataValueSetUrl += '&children=true';
	            dataValueSetUrl += '&startDate=' + $scope.model.selectedPeriods[0].startDate;
	            dataValueSetUrl += '&endDate=' + $scope.model.selectedPeriods.slice(-1)[0].endDate;
	
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                dataValueSetUrl += '&dataElementGroup=' + deg.id;
	            });
	
	            DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                if (response && response.dataValues) {
	                    angular.forEach(response.dataValues, function (dv) {
	                        if (dv.comment) {
	                            dv.comment = JSON.parse(dv.comment);
	                            if (dv.comment.explanation) {
	                                $scope.model.explanations.push({
	                                    dataElement: dv.dataElement,
	                                    order: $scope.model.dataElementRowIndex[dv.dataElement],
	                                    comment: dv.comment.explanation
	                                });
	                            }
	                        }
	                    });
	
	                    $scope.model.explanations = orderByFilter($scope.model.explanations, '-order').reverse();
	                    var index = 1;
	                    angular.forEach($scope.model.explanations, function (exp) {
	                        $scope.model.commentRow[exp.dataElement] = index;
	                        index++;
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getCoverage = function (numerator, denominator) {
	        return CommonUtils.getPercent(numerator, denominator, false, true);
	    };
	
	    $scope.getHeaderClass = function (header) {
	        return header.style;
	    };
	}]);

/***/ }),
/* 24 */
/***/ (function(module, exports) {

	/* global angular, dhis2, docLibrary */
	
	'use strict';
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('LibraryController', ["$scope", "$translate", "$filter", "$window", "$modal", "NotificationService", "DocumentService", "MetaDataFactory", "OrgUnitFactory", "DHIS2URL", function ($scope, $translate, $filter, $window, $modal, NotificationService, DocumentService, MetaDataFactory, OrgUnitFactory, DHIS2URL) {
	
	    $scope.model = {
	        optionSets: null,
	        fileDataElement: null,
	        typeDataElement: null,
	        descDataElement: null,
	        selectedOptionSet: null,
	        events: [],
	        ndpDocumentFolders: [],
	        programDocumentFolders: [],
	        selectedNdpDocumentFolder: null,
	        selectedProgrammeDocumentFolder: null,
	        fileInput: null,
	        showFileUpload: false,
	        dataElements: [],
	        dynamicHeaders: [],
	        isProgrammeDocument: false,
	        selectedNdpProgram: null,
	        programmeDataElement: null
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'ndp_doc', title: 'ndp_documents', order: 1, view: 'components/library/ndp-documents.html', active: true, class: 'main-horizontal-menu'
	        //        {id: 'prg_doc', title: 'program_documents', order: 2, view: 'components/library/program-documents.html', active: true, class: 'main-horizontal-menu'}
	    }];
	
	    $scope.model.staticHeaders = [{ id: 'name', title: 'file_name' }, { id: 'size', title: 'file_size' }, { id: 'dateUploaded', title: 'date_uploaded' }, { id: 'uploadedBy', title: 'uploaded_by' }, { id: 'mda', title: 'mda' }];
	
	    MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	        $scope.model.optionSets = optionSets.reduce(function (map, obj) {
	            map[obj.id] = obj;
	            return map;
	        }, {});
	
	        MetaDataFactory.getAllByProperty('programs', 'programType', 'without_registration').then(function (programs) {
	            $scope.model.programs = programs;
	            angular.forEach(programs, function (pr) {
	                if (pr.documentFolderType === 'general') {
	                    $scope.model.ndpDocumentFolders.push(pr);
	                } else if (pr.documentFolderType === 'programme') {
	                    $scope.model.programDocumentFolders.push(pr);
	                }
	            });
	
	            //Get orgunits for the logged in user
	            OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                $scope.orgUnits = response.organisationUnits;
	                angular.forEach($scope.orgUnits, function (ou) {
	                    ou.show = true;
	                    angular.forEach(ou.children, function (o) {
	                        o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                    });
	                });
	                $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	            });
	        });
	    });
	
	    //watch for selection of program
	    $scope.$watch('model.selectedProgram', function () {
	        $scope.model.selectedProgramStage = null;
	        $scope.model.selectedOptionSet = null;
	        $scope.model.selectedNdpProgram = null;
	        $scope.model.isProgrammeDocument = false;
	        $scope.model.documents = [];
	        if (angular.isObject($scope.model.selectedProgram) && $scope.model.selectedProgram.id) {
	            $scope.loadProgramDetails();
	        }
	    });
	
	    $scope.loadProgramDetails = function () {
	        $scope.model.selectedProgramStage = null;
	        $scope.model.selectedOptionSet = null;
	        $scope.model.selectedNdpProgram = null;
	        $scope.model.isProgrammeDocument = false;
	        $scope.model.documents = [];
	        if ($scope.model.selectedProgram && $scope.model.selectedProgram.id && $scope.model.selectedProgram.programStages.length > 0) {
	            if ($scope.model.selectedProgram.programStages.length > 1) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_document_folder"));
	                return;
	            }
	
	            $scope.model.selectedProgramStage = $scope.model.selectedProgram.programStages[0];
	
	            var prDes = $scope.model.selectedProgramStage.programStageDataElements;
	
	            var docDe = $filter('filter')(prDes, { dataElement: { valueType: 'FILE_RESOURCE' } });
	            var typeDe = $filter('filter')(prDes, { dataElement: { isDocumentFolder: true } });
	            var progDe = $filter('filter')(prDes, { dataElement: { isProgrammeDocument: true } });
	
	            if (docDe.length !== 1 || typeDe.length !== 1) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_document_folder_configuration"));
	                return;
	            }
	
	            if (progDe.length === 1) {
	                $scope.model.isProgrammeDocument = true;
	                $scope.model.programmeDataElement = progDe[0].dataElement;
	            };
	
	            $scope.model.fileDataElement = docDe[0].dataElement;
	            $scope.model.typeDataElement = typeDe[0].dataElement;
	            $scope.model.selectedOptionSet = $scope.model.optionSets[$scope.model.typeDataElement.optionSet.id];
	
	            $scope.model.dynamicHeaders = [];
	            $scope.model.dataElements = [];
	            angular.forEach(prDes, function (prDe) {
	                $scope.model.dataElements[prDe.dataElement.id] = prDe.dataElement;
	                if (prDe.dataElement.valueType !== 'FILE_RESOURCE' && !prDe.dataElement.isDocumentFolder && !prDe.dataElement.isProgrammeDocument) {
	                    $scope.model.dynamicHeaders.push(prDe.dataElement);
	                }
	            });
	
	            if (!$scope.model.selectedOptionSet || $scope.model.selectedOptionSet.lenth === 0) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_document_types"));
	                return;
	            }
	
	            $scope.fetchEvents();
	        }
	    };
	
	    $scope.fetchEvents = function () {
	
	        if ($scope.selectedOrgUnit && $scope.selectedOrgUnit.id && $scope.model.selectedProgram && $scope.model.selectedProgram.id) {
	
	            DocumentService.getByOrgUnitAndProgram($scope.selectedOrgUnit.id, 'DESCENDANTS', $scope.model.selectedProgram.id, $scope.model.typeDataElement, $scope.model.fileDataElement, $scope.model.optionSets, $scope.model.dataElements).then(function (events) {
	                $scope.model.documents = events;
	            });
	        }
	    };
	
	    $scope.downloadFile = function (path, e) {
	        if (path) {
	            $window.open(DHIS2URL + path, '_blank', '');
	        }
	        if (e) {
	            e.stopPropagation();
	            e.preventDefault();
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.loadProgramDetails();
	            }
	        });
	    };
	
	    $scope.resetView = function () {
	        $scope.model.selectedProgram = null;
	    };
	
	    $scope.currentView = $scope.model.horizontalMenus.find(function (m) {
	        return m.active;
	    }).view;
	    $scope.resetTheView = function (menu, $event) {
	        $scope.model.horizontalMenus.forEach(function (m) {
	            m.active = false;
	        });
	
	        menu.active = true;
	
	        $scope.currentView = menu.view;
	    };
	}]);

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	/* global ndpFramework */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('LLGController', ["$scope", "$translate", "$modal", "$filter", "NotificationService", "SelectedMenuService", "orderByFilter", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "Analytics", "OptionComboService", "OrgUnitGroupSetService", function ($scope, $translate, $modal, $filter, NotificationService, SelectedMenuService, orderByFilter, PeriodService, MetaDataFactory, OrgUnitFactory, Analytics, OptionComboService, OrgUnitGroupSetService) {
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        optionSetsById: [],
	        optionSets: [],
	        legendSetsById: [],
	        defaultLegendSet: null,
	        sectors: [],
	        selectedVote: null,
	        selectedSector: null,
	        interventions: [],
	        objectives: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        selectedPeriods: [],
	        periods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly'
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'physicalPerformance', title: 'physical_performance', order: 1, view: 'components/llg/physical-performance.html', active: true, class: 'main-horizontal-menu' },
	    //{id: 'budgetPerformance', title: 'budget_performance', order: 2, view: 'components/llg/budget-performance.html', class: 'main-horizontal-menu'},
	    { id: 'financialPerformance', title: 'financial_performance', order: 2, view: 'components/llg/finance-performance.html', class: 'main-horizontal-menu' }, { id: 'dashboard', title: 'dashboard', order: 3, view: 'components/llg/dashboard.html', class: 'main-horizontal-menu' }];
	
	    $scope.$watch('selectedOrgUnit', function () {
	        $scope.resetDataView();
	        if (angular.isObject($scope.selectedOrgUnit) && $scope.selectedOrgUnit.id) {
	            OrgUnitGroupSetService.getByVote($scope.selectedOrgUnit.id).then(function (data) {
	                $scope.model.selectedVote = data;
	                $scope.getInterventions();
	            });
	        }
	    });
	
	    $scope.$watch('model.selectedNDP', function () {
	        $scope.model.selectedNdpProgram = null;
	        $scope.model.ndpProgram = null;
	        $scope.model.objectives = [];
	        $scope.model.subPrograms = [];
	        $scope.model.selectedSubProgramme = null;
	        $scope.model.selectedDataElementGroupSets = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedNDP) && $scope.model.selectedNDP.id && $scope.model.selectedNDP.code) {
	            $scope.model.ndpProgram = $filter('getFirst')($scope.model.optionSets, { ndp: $scope.model.selectedNDP.code, isNDPProgramme: true }, true);
	
	            $scope.getInterventions();
	        }
	    });
	
	    $scope.$watch('model.selectedNdpProgram', function () {
	        $scope.model.objectives = [];
	        $scope.model.subPrograms = [];
	        $scope.model.selectedSubProgramme = null;
	        $scope.model.selectedDataElementGroupSets = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedNdpProgram)) {
	            if ($scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code) {
	                $scope.model.objectives = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp, indicatorGroupSetType: $scope.model.selectedMenu.code, ndpProgramme: $scope.model.selectedNdpProgram.code }, true);
	                $scope.model.subPrograms = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp, indicatorGroupSetType: 'sub-programme', ndpProgramme: $scope.model.selectedNdpProgram.code }, true);
	                $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.objectives);
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedObjective', function () {
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        $scope.model.selectedIntervention = null;
	        if ($scope.model.selectedObjective) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { programObjective: $scope.model.selectedObjective });
	            angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        } else {
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.interventions);
	            angular.forEach($scope.model.interventions, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        }
	    });
	
	    $scope.$watch('model.selectedIntervention', function () {
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedIntervention) && $scope.model.selectedIntervention.id) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { id: $scope.model.selectedIntervention.id });
	            angular.forEach($scope.model.selectedIntervention.dataElementGroups, function (deg) {
	                $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	            });
	        } else {
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.interventions);
	            angular.forEach($scope.model.interventions, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        }
	    });
	
	    //Get orgunits for the logged in user
	    OrgUnitFactory.getViewTreeRoot().then(function (response) {
	        $scope.orgUnits = response.organisationUnits;
	        angular.forEach($scope.orgUnits, function (ou) {
	            ou.show = true;
	            angular.forEach(ou.children, function (o) {
	                o.hasChildren = o.children && o.children.length > 0 ? true : false;
	            });
	        });
	        $scope.selectedOrgUnit = null;
	
	        OrgUnitGroupSetService.getByGroup('llg').then(function (llgs) {
	            $scope.model.llgs = llgs;
	
	            MetaDataFactory.getAll('legendSets').then(function (legendSets) {
	
	                angular.forEach(legendSets, function (legendSet) {
	                    if (legendSet.isTrafficLight) {
	                        $scope.model.defaultLegendSet = legendSet;
	                    }
	                    $scope.model.legendSetsById[legendSet.id] = legendSet;
	                });
	
	                MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	                    $scope.model.optionSets = optionSets;
	
	                    angular.forEach(optionSets, function (optionSet) {
	                        $scope.model.optionSetsById[optionSet.id] = optionSet;
	                    });
	
	                    $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	                    if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                        NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                        return;
	                    }
	
	                    OptionComboService.getBtaDimensions().then(function (bta) {
	
	                        if (!bta || !bta.category || !bta.options || bta.options.length !== 3) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                            return;
	                        }
	
	                        $scope.model.bta = bta;
	                        $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                            return d.id;
	                        });
	                        $scope.model.actualDimension = null;
	                        $scope.model.targetDimension = null;
	                        $scope.model.baselineDimension = null;
	                        angular.forEach(bta.options, function (op) {
	                            if (op.dimensionType === 'actual') {
	                                $scope.model.actualDimension = op;
	                            }
	                            if (op.dimensionType === 'target') {
	                                $scope.model.targetDimension = op;
	                            }
	                            if (op.dimensionType === 'baseline') {
	                                $scope.model.baselineDimension = op;
	                            }
	                        });
	
	                        MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                            $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                                map[obj.id] = obj;
	                                return map;
	                            }, {});
	
	                            MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                                $scope.model.dataElementGroups = dataElementGroups;
	
	                                MetaDataFactory.getAll('dataElementGroupSets').then(function (dataElementGroupSets) {
	
	                                    $scope.model.dataElementGroupSets = dataElementGroupSets;
	
	                                    var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                                    $scope.model.allPeriods = angular.copy(periods);
	                                    $scope.model.periods = periods;
	
	                                    var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	
	                                    angular.forEach($scope.model.periods, function (pe) {
	                                        if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                            $scope.model.selectedPeriods.push(pe);
	                                        }
	                                    });
	
	                                    $scope.model.metaDataCached = true;
	
	                                    $scope.populateMenu();
	                                });
	                            });
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp) {
	            $scope.model.selectedNDP = $filter('getFirst')($scope.model.ndp.options, { code: $scope.model.selectedMenu.ndp });
	        }
	    };
	
	    $scope.getObjectives = function () {
	        $scope.model.objectives = [];
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            if (degs.programObjective && $scope.model.objectives.indexOf(degs.programObjective) === -1) {
	                $scope.model.objectives.push(degs.programObjective);
	            }
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	            });
	        });
	    };
	
	    $scope.getInterventions = function () {
	        $scope.model.selectedDataElementGroupSets = [];
	        $scope.model.objectives = [];
	        $scope.model.dataElementGroup = [];
	
	        if ($scope.model.selectedVote && $scope.model.selectedVote.dataSets.length > 0) {
	            var groupSetIds = [];
	            angular.forEach($scope.model.selectedVote.dataSets, function (ds) {
	                angular.forEach(ds.dataSetElements, function (dse) {
	                    angular.forEach(dse.dataElement.dataElementGroups, function (deg) {
	                        angular.forEach(deg.groupSets, function (degs) {
	                            if (groupSetIds.indexOf(degs.id) === -1) {
	                                groupSetIds.push(degs.id);
	                            }
	                        });
	                    });
	                });
	            });
	
	            angular.forEach(groupSetIds, function (groupSetId) {
	                $scope.model.selectedDataElementGroupSets.push($filter('filter')($scope.model.dataElementGroupSets, { id: groupSetId })[0]);
	            });
	
	            if ($scope.model.selectedNDP && $scope.model.selectedNDP.code) {
	                $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.selectedDataElementGroupSets, { indicatorGroupSetType: 'intervention', ndp: $scope.model.selectedNDP.code }, true);
	            } else {
	                $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.selectedDataElementGroupSets, { indicatorGroupSetType: 'intervention' }, true);
	            }
	
	            $scope.getOutputs();
	        }
	    };
	
	    $scope.getOutputs = function () {
	        $scope.model.selectedDataElementGroupSets = $scope.model.selectedDataElementGroupSets.filter(function (obj) {
	            return obj.dataElementGroups && obj.dataElementGroups.length && obj.dataElementGroups.length > 0;
	        });
	
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { indicatorGroupType: 'output', id: deg.id }, true);
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    $scope.resetView = function (horizontalMenu) {
	        $scope.model.activeHorizontalMenu = horizontalMenu;
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getPeriods = function (mode) {
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	    };
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	        }
	
	        if ($scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_invervention"));
	        }
	
	        $scope.getBasePeriod();
	
	        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods, function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	            Analytics.getData(analyticsUrl).then(function (data) {
	                if (data && data.data && data.metaData) {
	                    $scope.model.data = data.data;
	                    $scope.model.metaData = data.metaData;
	                    $scope.model.reportReady = true;
	                    $scope.model.reportStarted = false;
	
	                    var dataParams = {
	                        data: data.data,
	                        metaData: data.metaData,
	                        reportPeriods: angular.copy($scope.model.selectedPeriods),
	                        bta: $scope.model.bta,
	                        actualDimension: $scope.model.actualDimension,
	                        targetDimension: $scope.model.targetDimension,
	                        baselineDimension: $scope.model.baselineDimension,
	                        selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                        selectedDataElementGroup: $scope.model.selectedKra,
	                        dataElementGroups: $scope.model.dataElementGroups,
	                        basePeriod: $scope.model.basePeriod,
	                        maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                        allPeriods: $scope.model.allPeriods,
	                        dataElementsById: $scope.model.dataElementsById,
	                        cost: $scope.model.cost,
	                        legendSetsById: $scope.model.legendSetsById,
	                        defaultLegendSet: $scope.model.defaultLegendSet
	                    };
	
	                    var processedData = Analytics.processData(dataParams);
	
	                    $scope.model.dataHeaders = processedData.dataHeaders;
	                    $scope.model.reportPeriods = processedData.reportPeriods;
	                    $scope.model.dataExists = processedData.dataExists || false;
	                    $scope.model.resultData = processedData.resultData || [];
	                    $scope.model.performanceData = processedData.performanceData || [];
	                    $scope.model.physicalPerformanceData = processedData.physicalPerformanceData || [];
	                    $scope.model.cumulativeData = processedData.cumulativeData || [];
	                }
	            });
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return $scope.model.llgs;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.filterData = function (header, dataElement) {
	        if (!header || !$scope.model.data || !header.periodId || !header.dimensionId || !dataElement) return;
	        var res = $filter('filter')($scope.model.data, { dx: dataElement, Duw5yep8Vae: header.dimensionId, pe: header.periodId })[0];
	        return res && res.value ? res.value : '';
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedNdpProgram.displayName + " - interventions" + " .xls";
	        if (name) {
	            reportName = name + ' performance.xls';
	        }
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	}]);

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('LOGController', ["$scope", "$translate", "$modal", "$filter", "NotificationService", "SelectedMenuService", "orderByFilter", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "Analytics", "OptionComboService", "OrgUnitGroupSetService", function ($scope, $translate, $modal, $filter, NotificationService, SelectedMenuService, orderByFilter, PeriodService, MetaDataFactory, OrgUnitFactory, Analytics, OptionComboService, OrgUnitGroupSetService) {
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        optionSetsById: [],
	        optionSets: [],
	        legendSetsById: [],
	        defaultLegendSet: null,
	        sectors: [],
	        selectedVote: null,
	        selectedSector: null,
	        interventions: [],
	        objectives: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        selectedPeriods: [],
	        periods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly'
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'physicalPerformance', title: 'physical_performance', order: 1, view: 'components/log/physical-performance.html', active: true, class: 'main-horizontal-menu' }, { id: 'budgetPerformance', title: 'budget_performance', order: 2, view: 'components/log/budget-performance.html', class: 'main-horizontal-menu' }, { id: 'dashboard', title: 'dashboard', order: 3, view: 'components/log/dashboard.html', class: 'main-horizontal-menu' }];
	
	    $scope.$watch('selectedOrgUnit', function () {
	        $scope.resetDataView();
	        if (angular.isObject($scope.selectedOrgUnit) && $scope.selectedOrgUnit.id) {
	            OrgUnitGroupSetService.getByVote($scope.selectedOrgUnit.id).then(function (data) {
	                $scope.model.selectedVote = data;
	                $scope.getInterventions();
	            });
	        }
	    });
	
	    $scope.$watch('model.selectedNdpProgram', function () {
	        $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.voteDataElementGroupSets);
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedNdpProgram)) {
	            if ($scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code) {
	                $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.voteDataElementGroupSets, { ndpProgramme: $scope.model.selectedNdpProgram.code }, true);
	            }
	        }
	        $scope.getOutputs();
	    });
	
	    $scope.$watch('model.selectedObjective', function () {
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        $scope.model.selectedIntervention = null;
	        if ($scope.model.selectedObjective) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { programObjective: $scope.model.selectedObjective });
	            angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        } else {
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.interventions);
	            angular.forEach($scope.model.interventions, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        }
	    });
	
	    $scope.$watch('model.selectedIntervention', function () {
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedIntervention) && $scope.model.selectedIntervention.id) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { id: $scope.model.selectedIntervention.id });
	            angular.forEach($scope.model.selectedIntervention.dataElementGroups, function (deg) {
	                $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	            });
	        } else {
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.interventions);
	            angular.forEach($scope.model.interventions, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    $scope.model.dataElementGroup.push($filter('filter')($scope.model.dataElementGroups, { id: deg.id })[0]);
	                });
	            });
	        }
	    });
	
	    dhis2.ndp.downloadGroupSets('intervention').then(function () {
	
	        //Get orgunits for the logged in user
	        OrgUnitFactory.getViewTreeRoot().then(function (response) {
	            $scope.orgUnits = response.organisationUnits;
	            angular.forEach($scope.orgUnits, function (ou) {
	                ou.show = true;
	                angular.forEach(ou.children, function (o) {
	                    o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                });
	            });
	            $scope.selectedOrgUnit = null;
	
	            OrgUnitGroupSetService.getByGroup('lg').then(function (lgs) {
	                $scope.model.lgs = lgs;
	
	                MetaDataFactory.getAll('legendSets').then(function (legendSets) {
	
	                    angular.forEach(legendSets, function (legendSet) {
	                        if (legendSet.isTrafficLight) {
	                            $scope.model.defaultLegendSet = legendSet;
	                        }
	                        $scope.model.legendSetsById[legendSet.id] = legendSet;
	                    });
	
	                    MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	                        $scope.model.optionSets = optionSets;
	
	                        angular.forEach(optionSets, function (optionSet) {
	                            $scope.model.optionSetsById[optionSet.id] = optionSet;
	                        });
	
	                        $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	                        if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                            return;
	                        }
	
	                        $scope.model.resultsFrameworkLevel = $filter('getFirst')($scope.model.optionSets, { code: 'RFL' });
	                        if (!$scope.model.resultsFrameworkLevel || !$scope.model.resultsFrameworkLevel.code) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_results_framework_level_configuration"));
	                            return;
	                        }
	
	                        $scope.model.piapResultsChain = $filter('getFirst')($scope.model.optionSets, { code: 'piapResultsChain' });
	                        if (!$scope.model.piapResultsChain || !$scope.model.piapResultsChain.code || !$scope.model.piapResultsChain.options || $scope.model.piapResultsChain.options.length < 1) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_piap_results_chain_configuration"));
	                            return;
	                        }
	
	                        $scope.model.piapResultsChainByCode = $scope.model.piapResultsChain.options.reduce(function (map, obj) {
	                            map[obj.code] = obj;
	                            return map;
	                        }, {});
	
	                        $scope.model.ndpProgrammes = $filter('filter')($scope.model.piapResultsChain.options, { resultsFrameworkLevel: 'PR' }, true);
	                        $scope.model.subProgrammes = $filter('filter')($scope.model.piapResultsChain.options, { resultsFrameworkLevel: 'S' }, true);
	                        $scope.model.piapObjectives = $filter('filter')($scope.model.piapResultsChain.options, { resultsFrameworkLevel: 'O' }, true);
	                        $scope.model.interventions = $filter('filter')($scope.model.piapResultsChain.options, { resultsFrameworkLevel: 'IN' }, true);
	
	                        OptionComboService.getBtaDimensions().then(function (bta) {
	
	                            if (!bta || !bta.category || !bta.options || bta.options.length !== 3) {
	                                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                                return;
	                            }
	
	                            $scope.model.bta = bta;
	                            $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                                return d.id;
	                            });
	                            $scope.model.actualDimension = null;
	                            $scope.model.targetDimension = null;
	                            $scope.model.baselineDimension = null;
	                            angular.forEach(bta.options, function (op) {
	                                if (op.dimensionType === 'actual') {
	                                    $scope.model.actualDimension = op;
	                                }
	                                if (op.dimensionType === 'target') {
	                                    $scope.model.targetDimension = op;
	                                }
	                                if (op.dimensionType === 'baseline') {
	                                    $scope.model.baselineDimension = op;
	                                }
	                            });
	
	                            MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                                $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                                    map[obj.id] = obj;
	                                    return map;
	                                }, {});
	
	                                MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	                                    $scope.model.dataElementGroups = dataElementGroups;
	
	                                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'intervention').then(function (dataElementGroupSets) {
	                                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	                                        $scope.model.dataElementGroupSets = orderByFilter($scope.model.dataElementGroupSets, '-displayName').reverse();
	
	                                        var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                                        $scope.model.allPeriods = angular.copy(periods);
	                                        $scope.model.periods = periods;
	
	                                        var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	
	                                        angular.forEach($scope.model.periods, function (pe) {
	                                            if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                                $scope.model.selectedPeriods.push(pe);
	                                            }
	                                        });
	
	                                        $scope.model.metaDataCached = true;
	                                        $scope.populateMenu();
	                                    });
	                                });
	                            });
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            $scope.model.ndpProgram = $filter('getFirst')($scope.model.optionSets, { ndp: $scope.model.selectedMenu.ndp, isNDPProgramme: true }, true);
	        }
	    };
	
	    $scope.getInterventions = function () {
	        $scope.model.voteDataElementGroupSets = [];
	        $scope.model.objectives = [];
	        $scope.model.dataElementGroup = [];
	        if ($scope.model.selectedVote && $scope.model.selectedVote.dataSets.length > 0) {
	            var groupSetIds = [];
	            angular.forEach($scope.model.selectedVote.dataSets, function (ds) {
	                angular.forEach(ds.dataSetElements, function (dse) {
	                    angular.forEach(dse.dataElement.dataElementGroups, function (deg) {
	                        angular.forEach(deg.groupSets, function (degs) {
	                            if (groupSetIds.indexOf(degs.id) === -1) {
	                                groupSetIds.push(degs.id);
	                            }
	                        });
	                    });
	                });
	            });
	
	            angular.forEach(groupSetIds, function (groupSetId) {
	                var degs = $filter('getFirst')($scope.model.dataElementGroupSets, { id: groupSetId }, true);
	                if (degs && degs.id) {
	                    $scope.model.voteDataElementGroupSets.push(degs);
	                }
	            });
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.voteDataElementGroupSets);
	            $scope.getOutputs();
	        }
	    };
	
	    $scope.getOutputs = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('getFirst')($scope.model.dataElementGroups, { indicatorGroupType: 'output', id: deg.id }, true);
	                if (_deg && _deg.id) {
	                    $scope.model.dataElementGroup.push(_deg);
	                }
	            });
	        });
	    };
	
	    $scope.resetView = function (horizontalMenu) {
	        $scope.model.activeHorizontalMenu = horizontalMenu;
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getPeriods = function (mode) {
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	    };
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	        }
	
	        if ($scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_invervention"));
	        }
	
	        $scope.getBasePeriod();
	
	        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods, function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	            Analytics.getData(analyticsUrl).then(function (data) {
	                if (data && data.data && data.metaData) {
	                    $scope.model.data = data.data;
	                    $scope.model.metaData = data.metaData;
	                    $scope.model.reportReady = true;
	                    $scope.model.reportStarted = false;
	
	                    var dataParams = {
	                        data: data.data,
	                        metaData: data.metaData,
	                        reportPeriods: angular.copy($scope.model.selectedPeriods),
	                        bta: $scope.model.bta,
	                        actualDimension: $scope.model.actualDimension,
	                        targetDimension: $scope.model.targetDimension,
	                        baselineDimension: $scope.model.baselineDimension,
	                        selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                        selectedDataElementGroup: $scope.model.selectedKra,
	                        dataElementGroups: $scope.model.dataElementGroups,
	                        basePeriod: $scope.model.basePeriod,
	                        maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                        allPeriods: $scope.model.allPeriods,
	                        dataElementsById: $scope.model.dataElementsById,
	                        cost: $scope.model.cost,
	                        legendSetsById: $scope.model.legendSetsById,
	                        defaultLegendSet: $scope.model.defaultLegendSet
	                    };
	
	                    var processedData = Analytics.processData(dataParams);
	
	                    $scope.model.dataHeaders = processedData.dataHeaders;
	                    $scope.model.reportPeriods = processedData.reportPeriods;
	                    $scope.model.dataExists = processedData.dataExists || false;
	                    $scope.model.resultData = processedData.resultData || [];
	                    $scope.model.performanceData = processedData.performanceData || [];
	                    $scope.model.physicalPerformanceData = processedData.physicalPerformanceData || [];
	                    $scope.model.cumulativeData = processedData.cumulativeData || [];
	                }
	            });
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return $scope.model.lgs;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.filterData = function (header, dataElement) {
	        if (!header || !$scope.model.data || !header.periodId || !header.dimensionId || !dataElement) return;
	        var res = $filter('filter')($scope.model.data, { dx: dataElement, Duw5yep8Vae: header.dimensionId, pe: header.periodId })[0];
	        return res && res.value ? res.value : '';
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedNdpProgram.displayName + " - interventions" + " .xls";
	        if (name) {
	            reportName = name + ' performance.xls';
	        }
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	}]);

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('MDAController', ["$scope", "$translate", "$modal", "$filter", "NotificationService", "SelectedMenuService", "orderByFilter", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "Analytics", "ResulstChainService", "OptionComboService", "OrgUnitGroupSetService", function ($scope, $translate, $modal, $filter, NotificationService, SelectedMenuService, orderByFilter, PeriodService, MetaDataFactory, OrgUnitFactory, Analytics, ResulstChainService, OptionComboService, OrgUnitGroupSetService) {
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        optionSetsById: [],
	        optionSets: [],
	        legendSetsById: [],
	        defaultLegendSet: null,
	        sectors: [],
	        selectedVote: null,
	        selectedSector: null,
	        interventions: [],
	        objectives: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        selectedPeriods: [],
	        periods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly'
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'physicalPerformance', title: 'physical_performance', order: 1, view: 'components/mda/physical-performance.html', active: true, class: 'main-horizontal-menu' }, { id: 'budgetPerformance', title: 'budget_performance', order: 2, view: 'components/mda/budget-performance.html', class: 'main-horizontal-menu' }, { id: 'dashboard', title: 'dashboard', order: 4, view: 'components/mda/dashboard.html', class: 'main-horizontal-menu' }];
	
	    $scope.$watch('selectedOrgUnit', function () {
	        $scope.resetDataView();
	        if (angular.isObject($scope.selectedOrgUnit) && $scope.selectedOrgUnit.id) {
	            OrgUnitGroupSetService.getByVote($scope.selectedOrgUnit.id).then(function (data) {
	                $scope.model.selectedVote = data;
	                $scope.getInterventions();
	            });
	        }
	    });
	
	    $scope.$watch('model.selectedNdpProgram', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
	            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedSubProgramme = null;
	        $scope.model.selectedObjective = null;
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedNdpProgram)) {
	            if ($scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code) {
	                $scope.model.subProgrammes = $filter('startsWith')($scope.model.subProgrammes, { code: $scope.model.selectedNdpProgram.code });
	                $scope.model.piapObjectives = $filter('startsWith')($scope.model.piapObjectives, { code: $scope.model.selectedNdpProgram.code });
	                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, { code: $scope.model.selectedNdpProgram.code });
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedSubProgramme', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedObjective = null;
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedSubProgramme)) {
	            if ($scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code) {
	                $scope.model.piapObjectives = $filter('startsWith')($scope.model.piapObjectives, { code: $scope.model.selectedSubProgramme.code });
	                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, { code: $scope.model.selectedSubProgramme.code });
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedObjective', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedObjective)) {
	            if ($scope.model.selectedObjective && $scope.model.selectedObjective.code) {
	                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, { code: $scope.model.selectedObjective.code });
	            }
	        }
	    });
	
	    dhis2.ndp.downloadGroupSets('sub-intervention').then(function () {
	
	        //Get orgunits for the logged in user
	        OrgUnitFactory.getViewTreeRoot().then(function (response) {
	            $scope.orgUnits = response.organisationUnits;
	            angular.forEach($scope.orgUnits, function (ou) {
	                ou.show = true;
	                angular.forEach(ou.children, function (o) {
	                    o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                });
	            });
	            $scope.selectedOrgUnit = null;
	
	            OrgUnitGroupSetService.getByGroup('mda').then(function (mdas) {
	                $scope.model.mdas = mdas;
	
	                MetaDataFactory.getAll('legendSets').then(function (legendSets) {
	
	                    angular.forEach(legendSets, function (legendSet) {
	                        if (legendSet.isTrafficLight) {
	                            $scope.model.defaultLegendSet = legendSet;
	                        }
	                        $scope.model.legendSetsById[legendSet.id] = legendSet;
	                    });
	
	                    MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	                        $scope.model.optionSets = optionSets;
	
	                        angular.forEach(optionSets, function (optionSet) {
	                            $scope.model.optionSetsById[optionSet.id] = optionSet;
	                        });
	
	                        $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	                        if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                            return;
	                        }
	
	                        $scope.model.piapResultsChain = $filter('getFirst')($scope.model.optionSets, { code: 'piapResultsChain' });
	                        if (!$scope.model.piapResultsChain || !$scope.model.piapResultsChain.code || !$scope.model.piapResultsChain.options || $scope.model.piapResultsChain.options.length < 1) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_piap_results_chain_configuration"));
	                            return;
	                        }
	
	                        ResulstChainService.getByOptionSet($scope.model.piapResultsChain.id).then(function (chain) {
	                            $scope.model.resultsFrameworkChain = chain;
	                            $scope.model.ndpProgrammes = $scope.model.resultsFrameworkChain.programs;
	                            $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
	                            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	                            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	
	                            OptionComboService.getBtaDimensions().then(function (bta) {
	
	                                if (!bta || !bta.category || !bta.options || bta.options.length !== 3) {
	                                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                                    return;
	                                }
	
	                                $scope.model.bta = bta;
	                                $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                                    return d.id;
	                                });
	                                $scope.model.actualDimension = null;
	                                $scope.model.targetDimension = null;
	                                $scope.model.baselineDimension = null;
	                                angular.forEach(bta.options, function (op) {
	                                    if (op.dimensionType === 'actual') {
	                                        $scope.model.actualDimension = op;
	                                    }
	                                    if (op.dimensionType === 'target') {
	                                        $scope.model.targetDimension = op;
	                                    }
	                                    if (op.dimensionType === 'baseline') {
	                                        $scope.model.baselineDimension = op;
	                                    }
	                                });
	
	                                MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                                    $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                                        map[obj.id] = obj;
	                                        return map;
	                                    }, {});
	
	                                    MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                                        $scope.model.dataElementGroups = dataElementGroups;
	
	                                        MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sub-intervention').then(function (dataElementGroupSets) {
	                                            $scope.model.dataElementGroupSets = dataElementGroupSets;
	
	                                            var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                                            $scope.model.allPeriods = angular.copy(periods);
	                                            $scope.model.periods = periods;
	
	                                            var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	
	                                            angular.forEach($scope.model.periods, function (pe) {
	                                                if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                                    $scope.model.selectedPeriods.push(pe);
	                                                }
	                                            });
	
	                                            $scope.model.metaDataCached = true;
	                                            $scope.populateMenu();
	
	                                            /*$scope.model.dashboardName = 'Sub-Programme Outputs';
	                                            DashboardService.getByName( $scope.model.dashboardName ).then(function( result ){
	                                                $scope.model.dashboardItems = result.dashboardItems;
	                                                $scope.model.charts = result.charts;
	                                                $scope.model.tables = result.tables;
	                                                $scope.model.maps = result.maps;
	                                                $scope.model.dashboardFetched = true;
	                                            });*/
	                                        });
	                                    });
	                                });
	                            });
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    /*dhis2.ndp.downloadGroupSets( 'intervention' ).then(function(){
	         //Get orgunits for the logged in user
	        OrgUnitFactory.getViewTreeRoot().then(function(response) {
	            $scope.orgUnits = response.organisationUnits;
	            angular.forEach($scope.orgUnits, function(ou){
	                ou.show = true;
	                angular.forEach(ou.children, function(o){
	                    o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                });
	            });
	            $scope.selectedOrgUnit = null;
	             OrgUnitGroupSetService.getByGroup('mda').then(function(mdas){
	                $scope.model.mdas = mdas;
	                 MetaDataFactory.getAll('legendSets').then(function(legendSets){
	                     angular.forEach(legendSets, function(legendSet){
	                        if ( legendSet.isTrafficLight ){
	                            $scope.model.defaultLegendSet = legendSet;
	                        }
	                        $scope.model.legendSetsById[legendSet.id] = legendSet;
	                    });
	                     MetaDataFactory.getAll('optionSets').then(function(optionSets){
	                         $scope.model.optionSets = optionSets;
	                         angular.forEach(optionSets, function(optionSet){
	                            $scope.model.optionSetsById[optionSet.id] = optionSet;
	                        });
	                         $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, {code: 'ndp'});
	                         if( !$scope.model.ndp || !$scope.model.ndp.code ){
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                            return;
	                        }
	                         $scope.model.resultsFrameworkLevel = $filter('getFirst')($scope.model.optionSets, {code: 'RFL'});
	                        if( !$scope.model.resultsFrameworkLevel || !$scope.model.resultsFrameworkLevel.code ){
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_results_framework_level_configuration"));
	                            return;
	                        }
	                         $scope.model.piapResultsChain = $filter('getFirst')($scope.model.optionSets, {code: 'piapResultsChain'});
	                        if( !$scope.model.piapResultsChain || !$scope.model.piapResultsChain.code || !$scope.model.piapResultsChain.options || $scope.model.piapResultsChain.options.length < 1 ){
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_piap_results_chain_configuration"));
	                            return;
	                        }
	                         $scope.model.piapResultsChainByCode = $scope.model.piapResultsChain.options.reduce( function(map, obj){
	                            map[obj.code] = obj;
	                            return map;
	                        }, {});
	                         $scope.model.ndpProgrammes = $filter('filter')($scope.model.piapResultsChain.options, {resultsFrameworkLevel: 'PR'}, true);
	                        $scope.model.subProgrammes = $filter('filter')($scope.model.piapResultsChain.options, {resultsFrameworkLevel: 'S'}, true);
	                        $scope.model.piapObjectives = $filter('filter')($scope.model.piapResultsChain.options, {resultsFrameworkLevel: 'O'}, true);
	                        $scope.model.interventions = $filter('filter')($scope.model.piapResultsChain.options, {resultsFrameworkLevel: 'IN'}, true);
	                         OptionComboService.getBtaDimensions().then(function( bta ){
	                             if( !bta || !bta.category || !bta.options || bta.options.length !== 3 ){
	                                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                                return;
	                            }
	                             $scope.model.bta = bta;
	                            $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function(d){return d.id;});
	                            $scope.model.actualDimension = null;
	                            $scope.model.targetDimension = null;
	                            $scope.model.baselineDimension = null;
	                            angular.forEach(bta.options, function(op){
	                                if ( op.dimensionType === 'actual' ){
	                                    $scope.model.actualDimension = op;
	                                }
	                                if ( op.dimensionType === 'target' ){
	                                    $scope.model.targetDimension = op;
	                                }
	                                if ( op.dimensionType === 'baseline' ){
	                                    $scope.model.baselineDimension = op;
	                                }
	                            });
	                             MetaDataFactory.getAll('dataElements').then(function(dataElements){
	                                 $scope.model.dataElementsById = dataElements.reduce( function(map, obj){
	                                    map[obj.id] = obj;
	                                    return map;
	                                }, {});
	                                  MetaDataFactory.getDataElementGroups().then(function(dataElementGroups){
	                                    $scope.model.dataElementGroups = dataElementGroups;
	                                     MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'intervention').then(function(dataElementGroupSets){
	                                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	                                        $scope.model.dataElementGroupSets = orderByFilter( $scope.model.dataElementGroupSets, '-displayName').reverse();
	                                         var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                                        $scope.model.allPeriods = angular.copy( periods );
	                                        $scope.model.periods = periods;
	                                         var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	                                         angular.forEach($scope.model.periods, function(pe){
	                                            if(selectedPeriodNames.indexOf(pe.displayName) > -1 ){
	                                               $scope.model.selectedPeriods.push(pe);
	                                            }
	                                        });
	                                         $scope.model.metaDataCached = true;
	                                        $scope.populateMenu();
	                                    });
	                                });
	                            });
	                        });
	                    });
	                });
	            });
	        });
	    });*/
	
	    $scope.populateMenu = function () {
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            $scope.model.ndpProgram = $filter('getFirst')($scope.model.optionSets, { ndp: $scope.model.selectedMenu.ndp, isNDPProgramme: true }, true);
	        }
	    };
	
	    $scope.getInterventions = function () {
	        $scope.model.voteDataElementGroupSets = [];
	        $scope.model.objectives = [];
	        $scope.model.dataElementGroup = [];
	        if ($scope.model.selectedVote && $scope.model.selectedVote.dataSets.length > 0) {
	            var groupSetIds = [];
	            angular.forEach($scope.model.selectedVote.dataSets, function (ds) {
	                angular.forEach(ds.dataSetElements, function (dse) {
	                    angular.forEach(dse.dataElement.dataElementGroups, function (deg) {
	                        angular.forEach(deg.groupSets, function (degs) {
	                            if (groupSetIds.indexOf(degs.id) === -1) {
	                                groupSetIds.push(degs.id);
	                            }
	                        });
	                    });
	                });
	            });
	
	            angular.forEach(groupSetIds, function (groupSetId) {
	                var degs = $filter('getFirst')($scope.model.dataElementGroupSets, { id: groupSetId }, true);
	                if (degs && degs.id) {
	                    $scope.model.voteDataElementGroupSets.push(degs);
	                }
	            });
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.voteDataElementGroupSets);
	            $scope.getOutputs();
	        }
	    };
	
	    $scope.getOutputs = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { indicatorGroupType: 'output', id: deg.id }, true);
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    $scope.resetView = function (horizontalMenu) {
	        $scope.model.activeHorizontalMenu = horizontalMenu;
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getPeriods = function (mode) {
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	    };
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        var selectedResultsLevel = $scope.model.selectedNdpProgram.code;
	
	        if ($scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code) {
	            selectedResultsLevel = $scope.model.selectedSubProgramme.code;
	        }
	
	        if ($scope.model.selectedObjective && $scope.model.selectedObjective.code) {
	            selectedResultsLevel = $scope.model.selectedObjective.code;
	        }
	
	        if ($scope.model.selectedIntervention && $scope.model.selectedIntervention.code) {
	            selectedResultsLevel = $scope.model.selectedIntervention.code;
	        }
	
	        $scope.model.selectedDataElementGroupSets = $filter('startsWith')($scope.model.dataElementGroupSets, { code: selectedResultsLevel });
	        $scope.getOutputs();
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_output"));
	            return;
	        }
	
	        $scope.getBasePeriod();
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods, function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	            Analytics.getData(analyticsUrl).then(function (data) {
	                if (data && data.data && data.metaData) {
	                    $scope.model.data = data.data;
	                    $scope.model.metaData = data.metaData;
	                    $scope.model.reportReady = true;
	                    $scope.model.reportStarted = false;
	
	                    var dataParams = {
	                        data: data.data,
	                        metaData: data.metaData,
	                        reportPeriods: angular.copy($scope.model.selectedPeriods),
	                        bta: $scope.model.bta,
	                        actualDimension: $scope.model.actualDimension,
	                        targetDimension: $scope.model.targetDimension,
	                        baselineDimension: $scope.model.baselineDimension,
	                        selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                        selectedDataElementGroup: $scope.model.selectedKra,
	                        dataElementGroups: $scope.model.dataElementGroups,
	                        basePeriod: $scope.model.basePeriod,
	                        maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                        allPeriods: $scope.model.allPeriods,
	                        dataElementsById: $scope.model.dataElementsById,
	                        cost: $scope.model.cost,
	                        legendSetsById: $scope.model.legendSetsById,
	                        defaultLegendSet: $scope.model.defaultLegendSet
	                    };
	
	                    var processedData = Analytics.processData(dataParams);
	
	                    $scope.model.dataHeaders = processedData.dataHeaders;
	                    $scope.model.reportPeriods = processedData.reportPeriods;
	                    $scope.model.dataExists = processedData.dataExists || false;
	                    $scope.model.resultData = processedData.resultData || [];
	                    $scope.model.performanceData = processedData.performanceData || [];
	                    $scope.model.physicalPerformanceData = processedData.physicalPerformanceData || [];
	                    $scope.model.cumulativeData = processedData.cumulativeData || [];
	                }
	            });
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return $scope.model.mdas;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.filterData = function (header, dataElement) {
	        if (!header || !$scope.model.data || !header.periodId || !header.dimensionId || !dataElement) return;
	        var res = $filter('filter')($scope.model.data, { dx: dataElement, Duw5yep8Vae: header.dimensionId, pe: header.periodId })[0];
	        return res && res.value ? res.value : '';
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedNdpProgram.displayName + " - interventions" + " .xls";
	        if (name) {
	            reportName = name + ' performance.xls';
	        }
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	}]);

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('ObjectiveController', ["$rootScope", "$scope", "$translate", "$modal", "$filter", "orderByFilter", "NotificationService", "SelectedMenuService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "Analytics", "CommonUtils", "FinancialDataService", "DataValueService", function ($rootScope, $scope, $translate, $modal, $filter, orderByFilter, NotificationService, SelectedMenuService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, Analytics, CommonUtils, FinancialDataService, DataValueService) {
	
	    $scope.showReportFilters = false;
	
	    $rootScope.DHIS2URL = ({"baseUrl":"http://localhost:9292","authorization":"Basic YWRtaW46ZGlzdHJpY3Q=","apiRoot":"../../..","mode":"PROD"}).apiRoot;
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        dataElements: [],
	        dataElementsById: [],
	        kra: [],
	        objectives: [],
	        selectedKra: null,
	        selectedObjective: null,
	        selectedDataElementGroupSets: [],
	        dataElementGroups: [],
	        baseLineTargetActualDimensions: [],
	        performanceOverviewHeaders: [],
	        dataSetsById: {},
	        categoryCombosById: {},
	        optionSets: [],
	        optionSetsById: [],
	        dictionaryItems: [],
	        selectedPeriods: [],
	        periods: [],
	        allPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        //        selectedPeriodType: 'FinancialJuly',
	        selectedPeriodType: 'Yearly',
	        groupSetSize: {},
	        physicalPerformance: true,
	        financialPerformance: true,
	        showProjectDetails: false,
	        showExplanation: false,
	        explanations: [],
	        commentRow: {}
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'target', title: 'targets', order: 1, view: 'components/objective/results.html', active: true, class: 'main-horizontal-menu' }, { id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/objective/physical-performance.html', class: 'main-horizontal-menu' }, { id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/objective/performance-overview.html', class: 'main-horizontal-menu' }, { id: 'completeness', title: 'completeness', order: 4, view: 'components/objective/completeness.html', class: 'main-horizontal-menu' }];
	
	    $scope.$watch('model.selectedObjective', function () {
	        $scope.model.selectedKra = null;
	        $scope.model.kras = [];
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedObjective) && $scope.model.selectedObjective.id) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { id: $scope.model.selectedObjective.id });
	            angular.forEach($scope.model.selectedObjective.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	
	            $scope.model.kras = $scope.model.selectedObjective.dataElementGroups;
	        } else {
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	            angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                    if (_deg.length > 0) {
	                        $scope.model.dataElementGroup.push(_deg[0]);
	                    }
	                });
	            });
	        }
	    });
	
	    $scope.$on('MENU', function () {
	        $scope.populateMenu();
	    });
	
	    $scope.$watch('model.selectedKra', function () {
	        $scope.resetDataView();
	        $scope.model.dataElementGroup = [];
	        if (angular.isObject($scope.model.selectedKra) && $scope.model.selectedKra.id) {
	            var _deg = $filter('filter')($scope.model.dataElementGroups, { id: $scope.model.selectedKra.id });
	            if (_deg.length > 0) {
	                $scope.model.dataElementGroup.push(_deg[0]);
	            }
	            $scope.getAnalyticsData();
	        } else {
	            $scope.getObjectives();
	        }
	    });
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    $scope.getObjectives = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    dhis2.ndp.downloadGroupSets('resultsFrameworkObjective').then(function () {
	
	        OptionComboService.getBtaDimensions().then(function (response) {
	
	            if (!response || !response.bta || !response.baseline || !response.actual || !response.target) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                return;
	            }
	
	            $scope.model.bta = response.bta;
	            $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                return d.id;
	            });
	            $scope.model.actualDimension = response.actual;
	            $scope.model.targetDimension = response.target;
	            $scope.model.baselineDimension = response.baseline;
	
	            MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                    map[obj.id] = obj;
	                    return map;
	                }, {});
	
	                MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                    $scope.model.dataElementGroups = dataElementGroups;
	
	                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'resultsframeworkobjective').then(function (dataElementGroupSets) {
	                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	                        $scope.model.dataElementGroupSets = orderByFilter($scope.model.dataElementGroupSets, '-displayName').reverse();
	
	                        var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                        $scope.model.allPeriods = angular.copy(periods);
	                        $scope.model.periods = periods;
	
	                        //                        var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	                        var selectedPeriodNames = ['2023', '2024', '2025', '2026', '2027'];
	
	                        angular.forEach($scope.model.periods, function (pe) {
	                            //                            if(selectedPeriodNames.indexOf(pe.displayName) > -1 ){
	                            if (selectedPeriodNames.indexOf(pe.name) > -1) {
	                                $scope.model.selectedPeriods.push(pe);
	                            }
	                        });
	
	                        //Get orgunits for the logged in user
	                        OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                            $scope.orgUnits = response.organisationUnits;
	                            angular.forEach($scope.orgUnits, function (ou) {
	                                ou.show = true;
	                                angular.forEach(ou.children, function (o) {
	                                    o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                                });
	                            });
	                            $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	                            $scope.model.metaDataCached = true;
	                            $scope.populateMenu();
	                            $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders();
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedObjective = null;
	        $scope.model.selectedKra = null;
	        $scope.resetDataView();
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	            if ($scope.model.dataElementGroupSets && $scope.model.dataElementGroupSets.length === 1) {
	                $scope.model.selectedObjective = $scope.model.dataElementGroupSets[0];
	            } else {
	                $scope.getObjectives();
	            }
	        }
	    };
	
	    $scope.getPeriods = function (mode) {
	        var periods = [];
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	
	        var periodsById = {};
	        angular.forEach($scope.model.periods, function (p) {
	            periodsById[p.id] = p;
	        });
	
	        angular.forEach(periods, function (p) {
	            if (!periodsById[p.id]) {
	                periodsById[p.id] = p;
	            }
	        });
	
	        $scope.model.periods = Object.values(periodsById);
	
	        $scope.model.allPeriods = angular.copy($scope.model.periods);
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if (!$scope.model.dataElementGroup || $scope.model.dataElementGroup.length === 0) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_objective"));
	            return;
	        }
	
	        $scope.getBasePeriod();
	
	        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods.concat($scope.model.basePeriod), function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var pHeaders = CommonUtils.getPerformanceOverviewHeaders();
	            $scope.model.pHeadersLength = pHeaders.length;
	            var prds = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            $scope.model.performanceOverviewHeaders = [];
	            angular.forEach(prds, function (pe) {
	                angular.forEach(pHeaders, function (p) {
	                    var h = angular.copy(p);
	                    h.period = pe.id;
	                    $scope.model.performanceOverviewHeaders.push(h);
	                });
	            });
	
	            $scope.model.dataElementGroupsById = $scope.model.dataElementGroup.reduce(function (map, obj) {
	                map[obj.id] = obj;
	                return map;
	            }, {});
	
	            var des = [];
	            $scope.model.theRows = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	            FinancialDataService.getLocalData('data/cost.json').then(function (cost) {
	                $scope.model.cost = cost;
	                Analytics.getData(analyticsUrl).then(function (data) {
	                    if (data && data.data && data.metaData) {
	                        $scope.model.data = data.data;
	                        $scope.model.metaData = data.metaData;
	                        $scope.model.reportReady = true;
	                        $scope.model.reportStarted = false;
	
	                        var dataParams = {
	                            data: data.data,
	                            metaData: data.metaData,
	                            reportPeriods: angular.copy($scope.model.selectedPeriods),
	                            bta: $scope.model.bta,
	                            selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                            selectedDataElementGroup: $scope.model.selectedKra,
	                            dataElementGroups: $scope.model.dataElementGroups,
	                            basePeriod: $scope.model.basePeriod,
	                            targetDimension: $scope.model.targetDimension,
	                            baselineDimension: $scope.model.baselineDimension,
	                            actualDimension: $scope.model.actualDimension,
	                            maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                            allPeriods: $scope.model.allPeriods,
	                            dataElementGroupsById: $scope.model.dataElementGroupsById,
	                            dataElementsById: $scope.model.dataElementsById,
	                            cost: $scope.model.cost,
	                            displayVision2040: true,
	                            performanceOverviewHeaders: $scope.model.performanceOverviewHeaders,
	                            displayActionBudgetData: false
	                        };
	
	                        var processedData = Analytics.processData(dataParams);
	                        $scope.model.dataHeaders = processedData.dataHeaders;
	                        $scope.model.reportPeriods = processedData.reportPeriods;
	                        $scope.model.dataExists = processedData.dataExists;
	                        $scope.model.selectedDataElementGroupSets = processedData.selectedDataElementGroupSets;
	                        $scope.model.hasPhysicalPerformanceData = processedData.hasPhysicalPerformanceData;
	                        $scope.model.numerator = processedData.completenessNum;
	                        $scope.model.denominator = processedData.completenessDen;
	                        $scope.model.dataElementRowIndex = processedData.dataElementRowIndex;
	                        $scope.model.tableRows = processedData.tableRows;
	                        $scope.model.povTableRows = processedData.povTableRows;
	                        $scope.model.hasEmptyRows = processedData.tableRows.hasEmptyRows;
	                    }
	                });
	            });
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById(name).innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedMenu.displayName;
	
	        if (name) {
	            reportName += " - " + name;
	        }
	
	        reportName += ".xls";
	
	        saveAs(blob, reportName);
	    };
	
	    $scope.getExplanations = function () {
	        $scope.model.showExplanation = !$scope.model.showExplanation;
	        if ($scope.model.showExplanation && $scope.model.explanations.length === 0) {
	            var dataValueSetUrl = 'orgUnit=' + $scope.selectedOrgUnit.id;
	            dataValueSetUrl += '&children=true';
	            dataValueSetUrl += '&startDate=' + $scope.model.selectedPeriods[0].startDate;
	            dataValueSetUrl += '&endDate=' + $scope.model.selectedPeriods.slice(-1)[0].endDate;
	
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                dataValueSetUrl += '&dataElementGroup=' + deg.id;
	            });
	
	            DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                if (response && response.dataValues) {
	                    angular.forEach(response.dataValues, function (dv) {
	                        if (dv.comment) {
	                            dv.comment = JSON.parse(dv.comment);
	                            if (dv.comment.explanation) {
	                                $scope.model.explanations.push({
	                                    dataElement: dv.dataElement,
	                                    order: $scope.model.dataElementRowIndex[dv.dataElement],
	                                    comment: dv.comment.explanation
	                                });
	                            }
	                        }
	                    });
	
	                    $scope.model.explanations = orderByFilter($scope.model.explanations, '-order').reverse();
	                    var index = 1;
	                    angular.forEach($scope.model.explanations, function (exp) {
	                        $scope.model.commentRow[exp.dataElement] = index;
	                        index++;
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                },
	                fullFetched: function fullFetched() {
	                    return false;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getExplanations = function () {
	        $scope.model.showExplanation = !$scope.model.showExplanation;
	        if ($scope.model.showExplanation && $scope.model.explanations.length === 0) {
	            var dataValueSetUrl = 'orgUnit=' + $scope.selectedOrgUnit.id;
	            dataValueSetUrl += '&children=true';
	            dataValueSetUrl += '&startDate=' + $scope.model.selectedPeriods[0].startDate;
	            dataValueSetUrl += '&endDate=' + $scope.model.selectedPeriods.slice(-1)[0].endDate;
	
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                dataValueSetUrl += '&dataElementGroup=' + deg.id;
	            });
	
	            DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                if (response && response.dataValues) {
	                    angular.forEach(response.dataValues, function (dv) {
	                        if (dv.comment) {
	                            dv.comment = JSON.parse(dv.comment);
	                            if (dv.comment.explanation) {
	                                $scope.model.explanations.push({
	                                    dataElement: dv.dataElement,
	                                    order: $scope.model.dataElementRowIndex[dv.dataElement],
	                                    comment: dv.comment.explanation
	                                });
	                            }
	                        }
	                    });
	
	                    $scope.model.explanations = orderByFilter($scope.model.explanations, '-order').reverse();
	                    var index = 1;
	                    angular.forEach($scope.model.explanations, function (exp) {
	                        $scope.model.commentRow[exp.dataElement] = index;
	                        index++;
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getCoverage = function (numerator, denominator) {
	        return CommonUtils.getPercent(numerator, denominator, false, true);
	    };
	
	    $scope.getHeaderClass = function (header) {
	        return header.style;
	    };
	
	    $scope.currentView = $scope.model.horizontalMenus.find(function (m) {
	        return m.active;
	    }).view;
	    $scope.resetTheView = function (menu, $event) {
	        $scope.model.horizontalMenus.forEach(function (m) {
	            m.active = false;
	        });
	
	        menu.active = true;
	
	        $scope.currentView = menu.view;
	    };
	}]);

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('OutcomeController', ["$rootScope", "$scope", "$translate", "$modal", "$filter", "orderByFilter", "NotificationService", "SelectedMenuService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "Analytics", "CommonUtils", "DataValueService", "FinancialDataService", "ClusterDataService", "DateUtils", function ($rootScope, $scope, $translate, $modal, $filter, orderByFilter, NotificationService, SelectedMenuService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, Analytics, CommonUtils, DataValueService, FinancialDataService, ClusterDataService, DateUtils) {
	
	    $rootScope.DHIS2URL = ({"baseUrl":"http://localhost:9292","authorization":"Basic YWRtaW46ZGlzdHJpY3Q=","apiRoot":"../../..","mode":"PROD"}).apiRoot;
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        dataElementsById: [],
	        optionSetsById: [],
	        optionSets: [],
	        legendSetsById: [],
	        defaultLegendSet: null,
	        ndpProgrammes: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        performanceOverviewHeaders: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        selectedPeriods: [],
	        periods: [],
	        allPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly',
	        displayProjectOutputs: true,
	        displayDepartmentOutPuts: true,
	        explanations: [],
	        commentRow: {},
	        clusters: []
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'target', title: 'targets', order: 1, view: 'components/outcome/results.html', active: true, class: 'main-horizontal-menu' }, { id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/outcome/physical-performance.html', class: 'main-horizontal-menu' }, { id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/outcome/performance-overview.html', class: 'main-horizontal-menu' }, { id: 'clusterPerformance', title: 'cluster_performance', order: 4, view: 'views/cluster/cluster-performance.html', class: 'main-horizontal-menu' }, { id: 'completeness', title: 'completeness', order: 5, view: 'components/outcome/completeness.html', class: 'main-horizontal-menu' }];
	
	    //Get orgunits for the logged in user
	    OrgUnitFactory.getViewTreeRoot().then(function (response) {
	        $scope.orgUnits = response.organisationUnits;
	        angular.forEach($scope.orgUnits, function (ou) {
	            ou.show = true;
	            angular.forEach(ou.children, function (o) {
	                o.hasChildren = o.children && o.children.length > 0 ? true : false;
	            });
	        });
	        $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	    });
	
	    $scope.getOutcomes = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { indicatorGroupType: 'outcome', id: deg.id }, true);
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    $scope.$on('MENU', function () {
	        //$scope.populateMenu();
	    });
	
	    $scope.$watch('model.selectedNdpProgram', function () {
	        $scope.resetDataView();
	        $scope.model.objectives = [];
	        $scope.model.selectedDataElementGroupSets = [];
	        if (angular.isObject($scope.model.selectedNdpProgram)) {
	            if ($scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code) {
	                var filter = { ndpProgramme: $scope.model.selectedNdpProgram.code };
	                $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, filter, true);
	                $scope.getOutcomes();
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedCluster', function () {
	        $scope.resetDataView();
	    });
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            var p = $scope.model.selectedPeriods[0];
	            var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	            $scope.model.basePeriod = res.period;
	            location = res.location;
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    dhis2.ndp.downloadGroupSets('objective').then(function () {
	
	        MetaDataFactory.getAll('legendSets').then(function (legendSets) {
	
	            /*angular.forEach(legendSets, function(legendSet){
	                if ( legendSet.isTrafficLight ){
	                    $scope.model.defaultLegendSet = legendSet;
	                }
	                $scope.model.legendSetsById[legendSet.id] = legendSet;
	            });*/
	
	            MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	                $scope.model.optionSets = optionSets;
	
	                angular.forEach(optionSets, function (optionSet) {
	                    $scope.model.optionSetsById[optionSet.id] = optionSet;
	                });
	
	                $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	                if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                    return;
	                }
	
	                OptionComboService.getBtaDimensions().then(function (response) {
	
	                    if (!response || !response.bta || !response.baseline || !response.actual || !response.target) {
	                        NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                        return;
	                    }
	
	                    $scope.model.bta = response.bta;
	                    $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                        return d.id;
	                    });
	                    $scope.model.actualDimension = response.actual;
	                    $scope.model.targetDimension = response.target;
	                    $scope.model.baselineDimension = response.baseline;
	
	                    MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                        $scope.model.allDataElements = dataElements;
	
	                        $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                            map[obj.id] = obj;
	                            return map;
	                        }, {});
	
	                        MetaDataFactory.getAll('optionGroupSets').then(function (optionGroupSets) {
	
	                            $scope.model.optionGroupSets = optionGroupSets;
	
	                            MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                                $scope.model.allDataElementGroups = dataElementGroups;
	                                $scope.model.dataElementGroups = dataElementGroups;
	
	                                MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'objective').then(function (dataElementGroupSets) {
	                                    $scope.model.dataElementGroupSets = dataElementGroupSets;
	                                    $scope.model.dataElementGroupSets = orderByFilter($scope.model.dataElementGroupSets, ['-code', '-displayName']).reverse();
	
	                                    var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                                    $scope.model.allPeriods = angular.copy(periods);
	                                    $scope.model.periods = periods;
	
	                                    var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	                                    var today = DateUtils.getToday();
	                                    angular.forEach($scope.model.periods, function (pe) {
	                                        if (pe.startDate <= today && pe.endDate >= today) {
	                                            $scope.model.selectedFiscalYear = pe;
	                                        }
	                                        if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                            $scope.model.selectedPeriods.push(pe);
	                                        }
	                                    });
	
	                                    $scope.model.metaDataCached = true;
	                                    $scope.populateMenu();
	                                    $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders();
	                                });
	                            });
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedNdpProgram = null;
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            var prs = $filter('filter')($scope.model.optionSets, { ndp: $scope.model.selectedMenu.ndp, isNDPProgramme: true }, true);
	            if (!prs || prs.length !== 1) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_program_config") + ' - ' + $scope.model.selectedMenu.ndp);
	                return;
	            } else {
	                $scope.model.ndpProgram = prs[0];
	            }
	
	            var sectorsOpgs = $filter('getFirst')($scope.model.optionGroupSets, { code: $scope.model.selectedMenu.ndp + '_CLUSTER' });
	
	            $scope.model.clusters = sectorsOpgs && sectorsOpgs.optionGroups ? sectorsOpgs.optionGroups : [];
	            //            if( !$scope.model.clusters || !$scope.model.clusters.length || !$scope.model.clusters.length === 0 ){
	            //                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster_configuration"));
	            //                return;
	            //            }
	        }
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.clusterData = null;
	        $scope.model.reportReady = false;
	        $scope.model.clusterReportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getPeriods = function (mode) {
	        var periods = [];
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	
	        var periodsById = {};
	        angular.forEach($scope.model.periods, function (p) {
	            periodsById[p.id] = p;
	        });
	
	        angular.forEach(periods, function (p) {
	            if (!periodsById[p.id]) {
	                periodsById[p.id] = p;
	            }
	        });
	
	        $scope.model.periods = Object.values(periodsById);
	
	        $scope.model.allPeriods = angular.copy($scope.model.periods);
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_outcome"));
	            return;
	        }
	
	        $scope.getBasePeriod();
	
	        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods.concat($scope.model.basePeriod), function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var pHeaders = CommonUtils.getPerformanceOverviewHeaders();
	            $scope.model.pHeadersLength = pHeaders.length;
	            var prds = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            $scope.model.performanceOverviewHeaders = [];
	            angular.forEach(prds, function (pe) {
	                angular.forEach(pHeaders, function (p) {
	                    var h = angular.copy(p);
	                    h.period = pe.id;
	                    $scope.model.performanceOverviewHeaders.push(h);
	                });
	            });
	
	            $scope.model.dataElementGroupsById = $scope.model.dataElementGroup.reduce(function (map, obj) {
	                map[obj.id] = obj;
	                return map;
	            }, {});
	
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            $scope.model.reportReady = false;
	            $scope.model.reportStarted = true;
	            FinancialDataService.getLocalData('data/cost.json').then(function (cost) {
	                $scope.model.cost = cost;
	
	                Analytics.getData(analyticsUrl).then(function (data) {
	                    if (data && data.data && data.metaData) {
	                        $scope.model.data = data.data;
	                        $scope.model.metaData = data.metaData;
	                        $scope.model.reportReady = true;
	                        $scope.model.reportStarted = false;
	
	                        var dataParams = {
	                            data: data.data,
	                            metaData: data.metaData,
	                            reportPeriods: angular.copy($scope.model.selectedPeriods),
	                            bta: $scope.model.bta,
	                            actualDimension: $scope.model.actualDimension,
	                            targetDimension: $scope.model.targetDimension,
	                            baselineDimension: $scope.model.baselineDimension,
	                            selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                            selectedDataElementGroup: $scope.model.selectedKra,
	                            dataElementGroups: $scope.model.dataElementGroups,
	                            basePeriod: $scope.model.basePeriod,
	                            maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                            allPeriods: $scope.model.allPeriods,
	                            dataElementGroupsById: $scope.model.dataElementGroupsById,
	                            dataElementsById: $scope.model.dataElementsById,
	                            cost: $scope.model.cost,
	                            legendSetsById: $scope.model.legendSetsById,
	                            defaultLegendSet: $scope.model.defaultLegendSet,
	                            performanceOverviewHeaders: $scope.model.performanceOverviewHeaders,
	                            displayActionBudgetData: false
	                        };
	
	                        var processedData = Analytics.processData(dataParams);
	                        $scope.model.dataHeaders = processedData.dataHeaders;
	                        $scope.model.reportPeriods = processedData.reportPeriods;
	                        $scope.model.dataExists = processedData.dataExists;
	                        $scope.model.selectedDataElementGroupSets = processedData.selectedDataElementGroupSets;
	                        $scope.model.hasPhysicalPerformanceData = processedData.hasPhysicalPerformanceData;
	                        $scope.model.numerator = processedData.completenessNum;
	                        $scope.model.denominator = processedData.completenessDen;
	                        $scope.model.dataElementRowIndex = processedData.dataElementRowIndex;
	                        $scope.model.tableRows = processedData.tableRows;
	                        $scope.model.povTableRows = processedData.povTableRows;
	                    }
	                });
	            });
	        }
	    };
	
	    $scope.getClusterData = function () {
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if (!$scope.model.selectedCluster || !$scope.model.selectedCluster.options || !$scope.model.selectedCluster.options.length) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
	            return;
	        }
	
	        if (!$scope.model.selectedFiscalYear) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_fiscal_year"));
	            return;
	        }
	
	        var params = {
	            indicatorGroupType: 'outcome',
	            selectedOrgUnit: $scope.selectedOrgUnit,
	            selectedCluster: $scope.model.selectedCluster,
	            selectedFiscalYear: $scope.model.selectedFiscalYear,
	            allDataElementGroups: $scope.model.allDataElementGroups,
	            dataElementGroupSets: $scope.model.dataElementGroupSets,
	            bta: $scope.model.bta,
	            baseLineTargetActualDimensions: $scope.model.baseLineTargetActualDimensions,
	            actualDimension: $scope.model.actualDimension,
	            targetDimension: $scope.model.targetDimension,
	            baselineDimension: $scope.model.baselineDimension,
	            selectedDataElementGroupSets: $scope.model.clusterDataElementGroupSets,
	            selectedDataElementGroup: $scope.model.selectedKra,
	            dataElementsById: $scope.model.dataElementsById,
	            legendSetsById: $scope.model.legendSetsById,
	            defaultLegendSet: $scope.model.defaultLegendSet
	        };
	
	        $scope.model.clusterReportReady = false;
	        $scope.model.clusterReportStarted = true;
	        ClusterDataService.getData(params).then(function (result) {
	            $scope.model.clusterReportReady = true;
	            $scope.model.clusterReportStarted = false;
	            $scope.model.clusterData = result.clusterData;
	            $scope.model.hasClusterData = result.hasClusterData;
	            $scope.model.clusterPerformanceOverviewHeaders = result.clusterPerformanceOverviewHeaders;
	        });
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById(name).innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedNdpProgram.displayName + " - objectives";
	
	        if (name) {
	            reportName += " - " + name;
	        }
	
	        reportName += ".xls";
	
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                },
	                fullFetched: function fullFetched() {
	                    return false;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getExplanations = function () {
	        $scope.model.showExplanation = !$scope.model.showExplanation;
	        if ($scope.model.showExplanation && $scope.model.explanations.length === 0) {
	            var dataValueSetUrl = 'orgUnit=' + $scope.selectedOrgUnit.id;
	            dataValueSetUrl += '&children=true';
	            dataValueSetUrl += '&startDate=' + $scope.model.selectedPeriods[0].startDate;
	            dataValueSetUrl += '&endDate=' + $scope.model.selectedPeriods.slice(-1)[0].endDate;
	
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                dataValueSetUrl += '&dataElementGroup=' + deg.id;
	            });
	
	            DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                if (response && response.dataValues) {
	                    angular.forEach(response.dataValues, function (dv) {
	                        if (dv.comment) {
	                            dv.comment = JSON.parse(dv.comment);
	                            if (dv.comment.explanation) {
	                                $scope.model.explanations.push({
	                                    dataElement: dv.dataElement,
	                                    order: $scope.model.dataElementRowIndex[dv.dataElement],
	                                    comment: dv.comment.explanation
	                                });
	                            }
	                        }
	                    });
	
	                    $scope.model.explanations = orderByFilter($scope.model.explanations, '-order').reverse();
	                    var index = 1;
	                    angular.forEach($scope.model.explanations, function (exp) {
	                        $scope.model.commentRow[exp.dataElement] = index;
	                        index++;
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getCoverage = function (numerator, denominator) {
	        return CommonUtils.getPercent(numerator, denominator, false, true);
	    };
	
	    $scope.getHeaderClass = function (header) {
	        return header.style;
	    };
	}]);

/***/ }),
/* 30 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('OutputController', ["$scope", "$translate", "$modal", "$filter", "orderByFilter", "NotificationService", "SelectedMenuService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "ResulstChainService", "CommonUtils", "DataValueService", "Analytics", "ClusterDataService", "DateUtils", function ($scope, $translate, $modal, $filter, orderByFilter, NotificationService, SelectedMenuService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, ResulstChainService, CommonUtils, DataValueService, Analytics, ClusterDataService, DateUtils) {
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        dataElementsById: [],
	        optionSetsById: [],
	        optionSets: [],
	        legendSetsById: [],
	        defaultLegendSet: null,
	        objectives: [],
	        ndpObjectives: [],
	        ndpProgrammes: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        performanceOverviewHeaders: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        selectedSubProgramme: null,
	        selectedPeriods: [],
	        periods: [],
	        allPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        //        selectedPeriodType: 'FinancialJuly',
	        selectedPeriodType: 'Yearly',
	        explanations: [],
	        commentRow: {}
	    };
	
	    //    $scope.model.horizontalMenus = [
	    //        {id: 'result', title: 'targets', order: 1, view: 'components/output/results.html', active: true, class: 'main-horizontal-menu'},
	    //        {id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/output/physical-performance.html', class: 'main-horizontal-menu'},
	    //        {id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/output/performance-overview.html', class: 'main-horizontal-menu'},
	    //        {id: 'clusterPerformance', title: 'cluster_performance', order: 4, view: 'views/cluster/cluster-performance.html', class: 'main-horizontal-menu'},
	    //        {id: 'completeness', title: 'completeness', order: 5, view: 'components/output/completeness.html', class: 'main-horizontal-menu'}
	    //    ];
	
	    $scope.model.horizontalMenus = [{ id: 'result', title: 'targets', order: 1, view: 'components/output/results.html', active: true, class: 'main-horizontal-menu' }, { id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/output/physical-performance.html', class: 'main-horizontal-menu' }, { id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/output/performance-overview.html', class: 'main-horizontal-menu' }, { id: 'completeness', title: 'completeness', order: 4, view: 'components/output/completeness.html', class: 'main-horizontal-menu' }];
	
	    $scope.$on('MENU', function () {
	        $scope.populateMenu();
	    });
	
	    //Get orgunits for the logged in user
	    OrgUnitFactory.getViewTreeRoot().then(function (response) {
	        $scope.orgUnits = response.organisationUnits;
	        angular.forEach($scope.orgUnits, function (ou) {
	            ou.show = true;
	            angular.forEach(ou.children, function (o) {
	                o.hasChildren = o.children && o.children.length > 0 ? true : false;
	            });
	        });
	        $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	    });
	
	    $scope.getOutputs = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { indicatorGroupType: 'output', id: deg.id }, true);
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    /*$scope.$on('MENU', function(){
	        $scope.populateMenu();
	    });*/
	
	    $scope.$watch('model.selectedNdpProgram', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
	            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	            //            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedSubProgramme = null;
	        $scope.model.selectedObjective = null;
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedNdpProgram)) {
	            if ($scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code) {
	                $scope.model.subProgrammes = $filter('startsWith')($scope.model.subProgrammes, { code: $scope.model.selectedNdpProgram.code });
	                $scope.model.piapObjectives = $filter('startsWith')($scope.model.piapObjectives, { code: $scope.model.selectedNdpProgram.code });
	                //                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedNdpProgram.code});
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedSubProgramme', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	            //            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedObjective = null;
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedSubProgramme)) {
	            if ($scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code) {
	                $scope.model.piapObjectives = $filter('startsWith')($scope.model.piapObjectives, { code: $scope.model.selectedSubProgramme.code });
	                //                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedSubProgramme.code});
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedObjective', function () {
	        $scope.resetDataView();
	
	        if ($scope.model.piapResultsChain && $scope.model.piapResultsChain.code) {
	            //            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	        }
	
	        $scope.model.selectedIntervention = null;
	        if (angular.isObject($scope.model.selectedObjective)) {
	            if ($scope.model.selectedObjective && $scope.model.selectedObjective.code) {
	                //                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedObjective.code});
	            }
	        }
	    });
	
	    $scope.$watch('model.selectedIntervention', function () {
	        $scope.resetDataView();
	
	        $scope.model.dataElementsById = [];
	        $scope.model.dataElementGroups = [];
	        $scope.model.selectedDataElementGroupSets = [];
	    });
	
	    $scope.$watch('model.selectedCluster', function () {
	        $scope.resetDataView();
	    });
	
	    $scope.getBasePeriod = function () {
	        $scope.model.basePeriod = null;
	        var location = -1;
	
	        var getBase = function getBase() {
	            $scope.model.selectedPeriods = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	            if ($scope.model.selectedPeriods.length > 0) {
	                var p = $scope.model.selectedPeriods[0];
	                if (p != null) {
	                    var res = PeriodService.getPreviousPeriod(p.id, $scope.model.allPeriods);
	                    $scope.model.basePeriod = res.period;
	                    location = res.location;
	                }
	            }
	        };
	
	        getBase();
	
	        if (location === 0) {
	            $scope.getPeriods('PREV');
	            getBase();
	        }
	    };
	
	    MetaDataFactory.getAll('legendSets').then(function (legendSets) {
	        MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	            $scope.model.optionSets = optionSets;
	
	            angular.forEach(optionSets, function (optionSet) {
	                $scope.model.optionSetsById[optionSet.id] = optionSet;
	            });
	
	            $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	            if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                return;
	            }
	
	            $scope.model.piapResultsChain = $filter('getFirst')($scope.model.optionSets, { code: 'piapResultsChain' });
	
	            if (!$scope.model.piapResultsChain || !$scope.model.piapResultsChain.code || !$scope.model.piapResultsChain.options || $scope.model.piapResultsChain.options.length < 1) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_piap_results_chain_configuration"));
	                return;
	            }
	
	            ResulstChainService.getByOptionSet($scope.model.piapResultsChain.id).then(function (chain) {
	                $scope.model.resultsFrameworkChain = chain;
	
	                $scope.model.ndpProgrammes = $scope.model.resultsFrameworkChain.programs;
	                $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
	                $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
	                //                $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
	
	                MetaDataFactory.getAll('optionGroupSets').then(function (optionGroupSets) {
	
	                    $scope.model.optionGroupSets = optionGroupSets;
	
	                    OptionComboService.getBtaDimensions().then(function (response) {
	
	                        if (!response || !response.bta || !response.baseline || !response.actual || !response.target) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                            return;
	                        }
	
	                        $scope.model.bta = response.bta;
	                        $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                            return d.id;
	                        });
	                        $scope.model.actualDimension = response.actual;
	                        $scope.model.targetDimension = response.target;
	                        $scope.model.baselineDimension = response.baseline;
	
	                        var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                        $scope.model.allPeriods = angular.copy(periods);
	                        $scope.model.periods = periods;
	
	                        //                        var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	                        var selectedPeriodNames = ['2023', '2024', '2025', '2026', '2027'];
	
	                        var today = DateUtils.getToday();
	                        angular.forEach($scope.model.periods, function (pe) {
	                            if (pe.startDate <= today && pe.endDate >= today) {
	                                $scope.model.selectedFiscalYear = pe;
	                            }
	
	                            if (selectedPeriodNames.indexOf(pe.name) > -1) {
	                                $scope.model.selectedPeriods.push(pe);
	                            }
	                        });
	
	                        $scope.model.metaDataCached = true;
	                        $scope.populateMenu();
	                        $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders();
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedNdpProgram = null;
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	        }
	
	        var sectorsOpgs = $filter('getFirst')($scope.model.optionGroupSets, { code: $scope.model.selectedMenu.ndp + '_CLUSTER' });
	
	        //        $scope.model.clusters = sectorsOpgs && sectorsOpgs.optionGroups ? sectorsOpgs.optionGroups : [];
	        //        if( !$scope.model.clusters || !$scope.model.clusters.length || !$scope.model.clusters.length === 0 ){
	        //            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster_configuration"));
	        //            return;
	        //        }
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.clusterData = null;
	        $scope.model.reportReady = false;
	        $scope.model.clusterReportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	
	    $scope.getPeriods = function (mode) {
	        var periods = [];
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	
	        var periodsById = {};
	        angular.forEach($scope.model.periods, function (p) {
	            periodsById[p.id] = p;
	        });
	
	        angular.forEach(periods, function (p) {
	            if (!periodsById[p.id]) {
	                periodsById[p.id] = p;
	            }
	        });
	
	        $scope.model.periods = Object.values(periodsById);
	
	        $scope.model.allPeriods = angular.copy($scope.model.periods);
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        var selectedResultsLevel = $scope.model.selectedNdpProgram.code;
	
	        if ($scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code) {
	            selectedResultsLevel = $scope.model.selectedSubProgramme.code;
	        }
	
	        if ($scope.model.selectedObjective && $scope.model.selectedObjective.code) {
	            selectedResultsLevel = $scope.model.selectedObjective.code;
	        }
	
	        //        if ( $scope.model.selectedIntervention && $scope.model.selectedIntervention.code ){
	        //            selectedResultsLevel = $scope.model.selectedIntervention.code;
	        //        }
	
	        $scope.model.reportReady = false;
	        $scope.model.reportStarted = true;
	
	        dhis2.ndp.downloadGroupSets('sub-intervention', selectedResultsLevel).then(function () {
	
	            MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                    map[obj.id] = obj;
	                    return map;
	                }, {});
	
	                MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                    $scope.model.allDataElementGroups = dataElementGroups;
	                    $scope.model.dataElementGroups = dataElementGroups;
	
	                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sub-intervention').then(function (dataElementGroupSets) {
	                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	
	                        $scope.model.metaDataCached = true;
	
	                        //                        if( $scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code ){
	                        //                            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, {ndp: $scope.model.selectedMenu.ndp}, true);
	                        //                        }
	
	                        //                        $scope.model.selectedDataElementGroupSets = $filter('startsWith')($scope.model.dataElementGroupSets, {code: selectedResultsLevel});
	                        //                        $scope.model.selectedDataElementGroupSets = $filter('startsWith')($scope.model.dataElementGroupSets, {code: selectedResultsLevel});
	
	                        $scope.model.selectedDataElementGroupSets = dataElementGroupSets;
	                        $scope.getOutputs();
	
	                        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	                            return;
	                        }
	
	                        if ($scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_output"));
	                            return;
	                        }
	
	                        $scope.getBasePeriod();
	
	                        if (!$scope.model.basePeriod || !$scope.model.basePeriod.id) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
	                            return;
	                        }
	
	                        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	                            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	                            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                                return dm;
	                            }).join(';');
	                            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods.concat($scope.model.basePeriod), function (pe) {
	                                return pe.id;
	                            }).join(';');
	
	                            var pHeaders = CommonUtils.getPerformanceOverviewHeaders();
	                            $scope.model.pHeadersLength = pHeaders.length;
	                            var prds = orderByFilter($scope.model.selectedPeriods, '-id').reverse();
	                            $scope.model.performanceOverviewHeaders = [];
	                            angular.forEach(prds, function (pe) {
	                                angular.forEach(pHeaders, function (p) {
	                                    var h = angular.copy(p);
	                                    h.period = pe.id;
	                                    $scope.model.performanceOverviewHeaders.push(h);
	                                });
	                            });
	
	                            $scope.model.dataElementGroupsById = $scope.model.dataElementGroup.reduce(function (map, obj) {
	                                map[obj.id] = obj;
	                                return map;
	                            }, {});
	
	                            var des = [];
	                            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                                des.push('DE_GROUP-' + deg.id);
	                            });
	                            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	                            Analytics.getData(analyticsUrl).then(function (data) {
	                                if (data && data.data && data.metaData) {
	                                    $scope.model.data = data.data;
	                                    $scope.model.metaData = data.metaData;
	                                    $scope.model.reportReady = true;
	                                    $scope.model.reportStarted = false;
	
	                                    var dataParams = {
	                                        data: data.data,
	                                        metaData: data.metaData,
	                                        reportPeriods: angular.copy($scope.model.selectedPeriods),
	                                        bta: $scope.model.bta,
	                                        actualDimension: $scope.model.actualDimension,
	                                        targetDimension: $scope.model.targetDimension,
	                                        baselineDimension: $scope.model.baselineDimension,
	                                        selectedDataElementGroupSets: $scope.model.selectedDataElementGroupSets,
	                                        selectedDataElementGroup: $scope.model.selectedKra,
	                                        dataElementGroups: $scope.model.dataElementGroups,
	                                        basePeriod: $scope.model.basePeriod,
	                                        maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                                        allPeriods: $scope.model.allPeriods,
	                                        dataElementGroupsById: $scope.model.dataElementGroupsById,
	                                        dataElementsById: $scope.model.dataElementsById,
	                                        legendSetsById: $scope.model.legendSetsById,
	                                        defaultLegendSet: $scope.model.defaultLegendSet,
	                                        performanceOverviewHeaders: $scope.model.performanceOverviewHeaders,
	                                        displayActionBudgetData: false
	                                    };
	
	                                    var processedData = Analytics.processData(dataParams);
	                                    $scope.model.dataHeaders = processedData.dataHeaders;
	                                    $scope.model.reportPeriods = processedData.reportPeriods;
	                                    $scope.model.dataExists = processedData.dataExists;
	                                    $scope.model.selectedDataElementGroupSets = processedData.selectedDataElementGroupSets;
	                                    $scope.model.hasPhysicalPerformanceData = processedData.hasPhysicalPerformanceData;
	                                    $scope.model.numerator = processedData.completenessNum;
	                                    $scope.model.denominator = processedData.completenessDen;
	                                    $scope.model.dataElementRowIndex = processedData.dataElementRowIndex;
	                                    $scope.model.tableRows = processedData.tableRows;
	                                    $scope.model.povTableRows = processedData.povTableRows;
	                                }
	                            });
	                        }
	                    });
	                });
	            });
	        });
	    };
	
	    $scope.getClusterData = function () {
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        //        if( !$scope.model.selectedCluster || !$scope.model.selectedCluster.options || !$scope.model.selectedCluster.options.length ){
	        //            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
	        //            return;
	        //        }
	
	        if (!$scope.model.selectedFiscalYear) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_fiscal_year"));
	            return;
	        }
	
	        $scope.model.clusterReportReady = false;
	        $scope.model.clusterReportStarted = true;
	        $scope.model.reportReady = false;
	        $scope.model.reportStarted = true;
	
	        dhis2.ndp.downloadGroupSets('sub-intervention').then(function () {
	            MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                    map[obj.id] = obj;
	                    return map;
	                }, {});
	
	                MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                    $scope.model.allDataElementGroups = dataElementGroups;
	                    $scope.model.dataElementGroups = dataElementGroups;
	
	                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sub-intervention').then(function (dataElementGroupSets) {
	
	                        $scope.model.dataElementGroupSets = dataElementGroupSets;
	
	                        $scope.model.metaDataCached = true;
	
	                        //                        if( $scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code ){
	                        //                            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, {ndp: $scope.model.selectedMenu.ndp}, true);
	                        //                        }
	
	                        $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	
	                        $scope.getOutputs();
	
	                        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	                            return;
	                        }
	
	                        if (!$scope.model.selectedCluster || !$scope.model.selectedCluster.options || !$scope.model.selectedCluster.options.length) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
	                            return;
	                        }
	
	                        if (!$scope.model.selectedFiscalYear) {
	                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_fiscal_year"));
	                            return;
	                        }
	
	                        var params = {
	                            indicatorGroupType: 'output',
	                            selectedOrgUnit: $scope.selectedOrgUnit,
	                            selectedCluster: $scope.model.selectedCluster,
	                            selectedFiscalYear: $scope.model.selectedFiscalYear,
	                            allDataElementGroups: $scope.model.allDataElementGroups,
	                            dataElementGroupSets: $scope.model.dataElementGroupSets,
	                            bta: $scope.model.bta,
	                            baseLineTargetActualDimensions: $scope.model.baseLineTargetActualDimensions,
	                            actualDimension: $scope.model.actualDimension,
	                            targetDimension: $scope.model.targetDimension,
	                            baselineDimension: $scope.model.baselineDimension,
	                            selectedDataElementGroupSets: $scope.model.clusterDataElementGroupSets,
	                            selectedDataElementGroup: $scope.model.selectedKra,
	                            dataElementsById: $scope.model.dataElementsById,
	                            legendSetsById: $scope.model.legendSetsById,
	                            defaultLegendSet: $scope.model.defaultLegendSet
	                        };
	
	                        ClusterDataService.getData(params).then(function (result) {
	                            $scope.model.clusterReportReady = true;
	                            $scope.model.clusterReportStarted = false;
	                            $scope.model.reportReady = true;
	                            $scope.model.reportStarted = false;
	                            $scope.model.clusterData = result.clusterData;
	                            $scope.model.hasClusterData = result.hasClusterData;
	                            $scope.model.clusterPerformanceOverviewHeaders = result.clusterPerformanceOverviewHeaders;
	                        });
	                    });
	                });
	            });
	        });
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById(name).innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedNdpProgram.displayName + " - output";
	
	        if (name) {
	            reportName += " - " + name;
	        }
	
	        reportName += ".xls";
	
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                },
	                fullFetched: function fullFetched() {
	                    return false;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getExplanations = function () {
	        $scope.model.showExplanation = !$scope.model.showExplanation;
	        if ($scope.model.showExplanation && $scope.model.explanations.length === 0) {
	            var dataValueSetUrl = 'orgUnit=' + $scope.selectedOrgUnit.id;
	            dataValueSetUrl += '&children=true';
	            dataValueSetUrl += '&startDate=' + $scope.model.selectedPeriods[0].startDate;
	            dataValueSetUrl += '&endDate=' + $scope.model.selectedPeriods.slice(-1)[0].endDate;
	
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                dataValueSetUrl += '&dataElementGroup=' + deg.id;
	            });
	
	            DataValueService.getDataValueSet(dataValueSetUrl).then(function (response) {
	                if (response && response.dataValues) {
	                    angular.forEach(response.dataValues, function (dv) {
	                        if (dv.comment) {
	                            dv.comment = JSON.parse(dv.comment);
	                            if (dv.comment.explanation) {
	                                $scope.model.explanations.push({
	                                    dataElement: dv.dataElement,
	                                    order: $scope.model.dataElementRowIndex[dv.dataElement],
	                                    comment: dv.comment.explanation
	                                });
	                            }
	                        }
	                    });
	
	                    $scope.model.explanations = orderByFilter($scope.model.explanations, '-order').reverse();
	                    var index = 1;
	                    angular.forEach($scope.model.explanations, function (exp) {
	                        $scope.model.commentRow[exp.dataElement] = index;
	                        index++;
	                    });
	                }
	            });
	        }
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getCoverage = function (numerator, denominator) {
	        return CommonUtils.getPercent(numerator, denominator, false, true);
	    };
	
	    $scope.getHeaderClass = function (header) {
	        return header.style;
	    };
	
	    $scope.currentView = $scope.model.horizontalMenus.find(function (m) {
	        return m.active;
	    }).view;
	    $scope.resetTheView = function (menu, $event) {
	        $scope.model.horizontalMenus.forEach(function (m) {
	            m.active = false;
	        });
	
	        menu.active = true;
	
	        $scope.currentView = menu.view;
	    };
	}]);

/***/ }),
/* 31 */
/***/ (function(module, exports) {

	/* global angular, ndpFramework */
	
	'use strict';
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('OuTreeController', ["$scope", "$modalInstance", "orgUnits", "selectedOrgUnit", "validOrgUnits", "OrgUnitFactory", function ($scope, $modalInstance, orgUnits, selectedOrgUnit, validOrgUnits, OrgUnitFactory) {
	
	    $scope.orgUnits = orgUnits;
	    $scope.selectedOrgUnit = selectedOrgUnit;
	    $scope.validOrgUnits = validOrgUnits;
	    $scope.treeLoadingStarted = false;
	    $scope.treeLoaded = true;
	    //expand/collapse of search orgunit tree
	    $scope.expandCollapse = function (orgUnit) {
	        if (orgUnit.hasChildren) {
	            //Get children for the selected orgUnit
	            $scope.treeLoadingStarted = true;
	            $scope.treeLoaded = false;
	            OrgUnitFactory.getChildren(orgUnit.id).then(function (ou) {
	                orgUnit.show = !orgUnit.show;
	                orgUnit.hasChildren = false;
	                orgUnit.children = ou.children;
	                angular.forEach(orgUnit.children, function (ou) {
	                    ou.hasChildren = ou.children && ou.children.length > 0 ? true : false;
	                });
	                $scope.treeLoadingStarted = false;
	                $scope.treeLoaded = true;
	            });
	        } else {
	            orgUnit.show = !orgUnit.show;
	        }
	    };
	
	    $scope.setSelectedOrgUnit = function (orgUnit) {
	        $scope.selectedOrgUnit = orgUnit;
	    };
	
	    $scope.select = function () {
	        $modalInstance.close($scope.selectedOrgUnit);
	    };
	
	    $scope.cancel = function () {
	        $modalInstance.close();
	    };
	}]);

/***/ }),
/* 32 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('PolicyController', ["$scope", "$translate", "$modal", "$filter", "Paginator", "SelectedMenuService", "MetaDataFactory", "ProgramFactory", "OrgUnitFactory", "ProjectService", function ($scope, $translate, $modal, $filter, Paginator, SelectedMenuService, MetaDataFactory, ProgramFactory, OrgUnitFactory, ProjectService) {
	
	    $scope.model = {
	        metaDataCached: false,
	        showOnlyCoreProject: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        optionSetsById: [],
	        optionSets: [],
	        objectives: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        ndpProgrammes: [],
	        selectedPeriods: [],
	        periods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly',
	        coreProjectAttribute: null,
	        bac: null,
	        ac: null,
	        timePerformance: [],
	        costPerformance: [],
	        showProjectFilter: false,
	        filterText: {}
	    };
	
	    //Paging
	    $scope.pager = { pageSize: 50, page: 1, toolBarDisplay: 5 };
	
	    $scope.model.horizontalMenus = [{ id: 'synthesis', title: 'project_synthesis', order: 1, view: 'components/policy/synthesis.html', active: true, class: 'main-horizontal-menu' }, { id: 'time_performance', title: 'time_performance', order: 2, view: 'components/policy/time-performance.html', class: 'main-horizontal-menu' }, { id: 'cost_performance', title: 'cost_performance', order: 3, view: 'components/policy/cost-performance.html', class: 'main-horizontal-menu' }];
	
	    $scope.model.performanceHeaders = [{ id: 'KPI', displayName: $translate.instant("kpi"), order: 1 }, { id: 'IND', displayName: $translate.instant('indicator'), order: 2 }, { id: 'INT', displayName: $translate.instant('interpretation'), order: 3 }, { id: 'UNI', displayName: $translate.instant('unit'), order: 4 }, { id: 'BSL', displayName: $translate.instant('baseline'), order: 5 }];
	
	    $scope.$watch('model.selectedProgram', function () {
	        $scope.resetData();
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.code) {
	            $scope.fetchProgramDetails();
	        }
	    });
	
	    MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	        $scope.model.optionSets = optionSets;
	
	        angular.forEach(optionSets, function (optionSet) {
	            $scope.model.optionSetsById[optionSet.id] = optionSet;
	        });
	
	        $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	        ProgramFactory.getAll('programs').then(function (programs) {
	            $scope.model.programs = $filter('filter')(programs, { programType: 'WITH_REGISTRATION', programDomain: 'policyAction' }, true);
	            $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	
	            //Get orgunits for the logged in user
	            OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                $scope.orgUnits = response.organisationUnits;
	                angular.forEach($scope.orgUnits, function (ou) {
	                    ou.show = true;
	                    angular.forEach(ou.children, function (o) {
	                        o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                    });
	                });
	                $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	            });
	        });
	    });
	
	    $scope.fetchProgramDetails = function () {
	        $scope.model.coreProjectAttribute = null;
	        $scope.pager = { pageSize: 50, page: 1, toolBarDisplay: 5 };
	        $scope.model.filterText = {};
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.code && $scope.model.selectedProgram && $scope.model.selectedProgram.id && $scope.model.selectedProgram.programTrackedEntityAttributes) {
	
	            angular.forEach($scope.model.selectedProgram.programTrackedEntityAttributes, function (pta) {
	                $scope.model.attributesById[pta.trackedEntityAttribute.id] = pta.trackedEntityAttribute;
	            });
	
	            angular.forEach($scope.model.selectedProgram.programStages, function (stage) {
	                angular.forEach(stage.programStageDataElements, function (prstDe) {
	                    var de = prstDe.dataElement;
	                    if (de) {
	                        $scope.model.dataElementsById[de.id] = de;
	                    }
	                });
	            });
	            $scope.fetchProjects();
	        }
	    };
	
	    $scope.fetchProjects = function () {
	        $scope.model.projectFetchStarted = true;
	        var filter = [];
	        if (Object.keys($scope.model.filterText).length > 0) {
	            for (var key in $scope.model.filterText) {
	                if ($scope.model.filterText[key] && $scope.model.filterText[key] !== '') filter.push("&filter=" + key + ':LIKE:' + $scope.model.filterText[key]);
	            }
	        }
	
	        ProjectService.getByProgram($scope.pager, filter.length > 0 ? filter.join('&') : null, $scope.selectedOrgUnit, $scope.model.selectedProgram, $scope.model.optionSetsById, $scope.model.attributesById, $scope.model.dataElementsById).then(function (response) {
	            $scope.model.projects = response.projects;
	            $scope.model.projectsFetched = true;
	            $scope.model.projectFetchStarted = false;
	
	            response.pager.pageSize = response.pager.pageSize ? response.pager.pageSize : $scope.pager.pageSize;
	            $scope.pager = response.pager;
	            $scope.pager.toolBarDisplay = 5;
	            $scope.pager.length = $scope.model.projects.length;
	
	            Paginator.setPage($scope.pager.page);
	            Paginator.setPageCount($scope.pager.pageCount);
	            Paginator.setPageSize($scope.pager.pageSize);
	            Paginator.setItemCount($scope.pager.total);
	        });
	    };
	
	    $scope.searchProjects = function () {
	        $scope.fetchProjects();
	    };
	
	    $scope.jumpToPage = function () {
	        if ($scope.pager && $scope.pager.page && $scope.pager.pageCount && $scope.pager.page > $scope.pager.pageCount) {
	            $scope.pager.page = $scope.pager.pageCount;
	        }
	        $scope.fetchProjects();
	    };
	
	    $scope.resetPageSize = function () {
	        $scope.pager.page = 1;
	        $scope.fetchProjects();
	    };
	
	    $scope.getPage = function (page) {
	        $scope.pager.page = page;
	        $scope.fetchProjects();
	    };
	
	    $scope.resetData = function () {
	        $scope.model.attributesById = [];
	        $scope.model.dataElementsById = [];
	        $scope.model.projectsFetched = false;
	        $scope.model.projects = [];
	    };
	
	    $scope.resetView = function (horizontalMenu, e) {
	        $scope.model.activeHorizontalMenu = horizontalMenu;
	        if (e) {
	            e.stopPropagation();
	            e.preventDefault();
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetData();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedProgram.displayName + " - project status" + " .xls";
	        if (name) {
	            reportName = name + ' performance.xls';
	        }
	        saveAs(blob, reportName);
	    };
	
	    $scope.currentView = $scope.model.horizontalMenus.find(function (m) {
	        return m.active;
	    }).view;
	    $scope.resetTheView = function (menu, $event) {
	        $scope.model.horizontalMenus.forEach(function (m) {
	            m.active = false;
	        });
	
	        menu.active = true;
	
	        $scope.currentView = menu.view;
	    };
	}]);

/***/ }),
/* 33 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('ProjectController', ["$scope", "$translate", "$modal", "$filter", "Paginator", "NotificationService", "SelectedMenuService", "MetaDataFactory", "ProgramFactory", "OrgUnitFactory", "ProjectService", function ($scope, $translate, $modal, $filter, Paginator, NotificationService, SelectedMenuService, MetaDataFactory, ProgramFactory, OrgUnitFactory, ProjectService) {
	
	    $scope.model = {
	        metaDataCached: false,
	        showOnlyCoreProject: false,
	        data: null,
	        reportReady: false,
	        dataExists: false,
	        dataHeaders: [],
	        optionSetsById: [],
	        programsById: [],
	        dataElementsById: [],
	        attributesById: [],
	        optionSets: [],
	        objectives: [],
	        dataElementGroup: [],
	        selectedDataElementGroupSets: [],
	        dataElementGroups: [],
	        selectedNdpProgram: null,
	        ndpProgrammes: [],
	        selectedPeriods: [],
	        periods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly',
	        coreProjectAttribute: null,
	        bac: null,
	        ac: null,
	        timePerformance: [],
	        costPerformance: [],
	        showProjectFilter: false,
	        filterText: {}
	    };
	
	    //Paging
	    $scope.pager = { pageSize: 50, page: 1, toolBarDisplay: 5 };
	
	    $scope.model.horizontalMenus = [{ id: 'financial_performance', title: 'financial_performance', order: 1, view: 'components/project/financial-performance.html', active: true, class: 'main-horizontal-menu' }, { id: 'physical_performance', title: 'physical_performance', order: 2, view: 'components/project/physical-performance.html', class: 'main-horizontal-menu' }];
	
	    $scope.model.performanceHeaders = [{ id: 'KPI', displayName: $translate.instant("kpi"), order: 1 }, { id: 'IND', displayName: $translate.instant('indicator'), order: 2 }, { id: 'INT', displayName: $translate.instant('interpretation'), order: 3 }, { id: 'UNI', displayName: $translate.instant('unit'), order: 4 }, { id: 'BSL', displayName: $translate.instant('baseline'), order: 5 }];
	
	    $scope.$watch('model.selectedProgram', function () {
	        $scope.resetData();
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.code) {
	            $scope.fetchProgramDetails();
	        }
	    });
	
	    MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	        $scope.model.optionSets = optionSets;
	
	        angular.forEach(optionSets, function (optionSet) {
	            $scope.model.optionSetsById[optionSet.id] = optionSet;
	        });
	
	        $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	        ProgramFactory.getAll('programs').then(function (programs) {
	            angular.forEach(programs, function (pr) {
	                angular.forEach(pr.programTrackedEntityAttributes, function (pta) {
	                    $scope.model.attributesById[pta.trackedEntityAttribute.id] = pta.trackedEntityAttribute;
	                });
	                $scope.model.programsById[pr.id] = pr;
	                angular.forEach(pr.programStages, function (stage) {
	                    angular.forEach(stage.programStageDataElements, function (prstDe) {
	                        $scope.model.dataElementsById[prstDe.dataElement.id] = prstDe.dataElement;
	                    });
	                });
	            });
	
	            $scope.model.programs = $filter('filter')(programs, { programType: 'WITH_REGISTRATION', programDomain: 'projectTracker' }, true);
	            $scope.model.kpiProgram = $filter('getFirst')(programs, { programType: 'WITH_REGISTRATION', programDomain: 'projectKpi' }, true);
	
	            $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	
	            //Get orgunits for the logged in user
	            OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                $scope.orgUnits = response.organisationUnits;
	                angular.forEach($scope.orgUnits, function (ou) {
	                    ou.show = true;
	                    angular.forEach(ou.children, function (o) {
	                        o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                    });
	                });
	                $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	            });
	        });
	    });
	
	    $scope.fetchProgramDetails = function () {
	        $scope.model.selectedProgramStage = null;
	        $scope.pager = { pageSize: 50, page: 1, toolBarDisplay: 5 };
	        $scope.model.filterText = {};
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.code && $scope.model.selectedProgram && $scope.model.selectedProgram.id && $scope.model.selectedProgram.programTrackedEntityAttributes) {
	
	            if ($scope.model.selectedProgram.programStages && $scope.model.selectedProgram.programStages.length > 1) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_project_stage"));
	                return;
	            }
	
	            $scope.model.selectedProgramStage = $scope.model.selectedProgram.programStages[0];
	            $scope.fetchProjects();
	        }
	    };
	
	    $scope.searchProjects = function () {
	        $scope.fetchProjects();
	    };
	
	    $scope.fetchProjects = function () {
	        $scope.model.projectFetchStarted = true;
	        var filter = [];
	        if (Object.keys($scope.model.filterText).length > 0) {
	            for (var key in $scope.model.filterText) {
	                if ($scope.model.filterText[key] && $scope.model.filterText[key] !== '') filter.push("&filter=" + key + ':LIKE:' + $scope.model.filterText[key]);
	            }
	        }
	
	        ProjectService.getByProgram($scope.pager, filter.length > 0 ? filter.join('&') : null, $scope.selectedOrgUnit, $scope.model.selectedProgram, $scope.model.optionSetsById, $scope.model.attributesById, $scope.model.dataElementsById).then(function (response) {
	            $scope.model.projects = response.projects;
	            $scope.model.projectsFetched = true;
	            $scope.model.projectFetchStarted = false;
	
	            response.pager.pageSize = response.pager.pageSize ? response.pager.pageSize : $scope.pager.pageSize;
	            $scope.pager = response.pager;
	            $scope.pager.toolBarDisplay = 5;
	            $scope.pager.length = $scope.model.projects.length;
	
	            Paginator.setPage($scope.pager.page);
	            Paginator.setPageCount($scope.pager.pageCount);
	            Paginator.setPageSize($scope.pager.pageSize);
	            Paginator.setItemCount($scope.pager.total);
	        });
	    };
	
	    $scope.getProjectDetails = function (project) {
	        if ($scope.model.selectedProject && $scope.model.selectedProject.trackedEntityInstance === project.trackedEntityInstance) {
	            $scope.model.showProjectDetails = !$scope.model.showProjectDetails;
	            $scope.model.selectedProject = null;
	        } else {
	
	            $scope.model.selectedProject = project;
	            $scope.model.showProjectDetails = true;
	            $scope.model.projectKpis = [];
	            if (!project.relationships) {
	                NotificationService.showNotifcationDialog($translate.instant("warning"), $translate.instant("missing_project_kpi"));
	            }
	
	            if (project && project.relationships) {
	                ProjectService.getKpi(project.relationships.join(';'), $scope.model.optionSetsById, $scope.model.attributesById, $scope.model.dataElementsById).then(function (data) {
	                    $scope.model.projectKpis = data;
	                });
	            }
	        }
	    };
	
	    $scope.jumpToPage = function () {
	        if ($scope.pager && $scope.pager.page && $scope.pager.pageCount && $scope.pager.page > $scope.pager.pageCount) {
	            $scope.pager.page = $scope.pager.pageCount;
	        }
	        $scope.fetchProjects();
	    };
	
	    $scope.resetPageSize = function () {
	        $scope.pager.page = 1;
	        $scope.fetchProjects();
	    };
	
	    $scope.getPage = function (page) {
	        $scope.pager.page = page;
	        $scope.fetchProjects();
	    };
	
	    $scope.resetData = function () {
	        $scope.model.projectsFetched = false;
	        $scope.model.projects = [];
	    };
	
	    $scope.resetView = function (horizontalMenu, e) {
	        $scope.model.activeHorizontalMenu = horizontalMenu;
	        if (e) {
	            e.stopPropagation();
	            e.preventDefault();
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetData();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedProgram.displayName + " - project status" + " .xls";
	        if (name) {
	            reportName = name + ' performance.xls';
	        }
	        saveAs(blob, reportName);
	    };
	
	    $scope.currentView = $scope.model.horizontalMenus.find(function (m) {
	        return m.active;
	    }).view;
	    $scope.resetTheView = function (menu, $event) {
	        $scope.model.horizontalMenus.forEach(function (m) {
	            m.active = false;
	        });
	
	        menu.active = true;
	
	        $scope.currentView = menu.view;
	    };
	}]);

/***/ }),
/* 34 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('SDGController', ["$scope", "$translate", "$modal", "$filter", "orderByFilter", "NotificationService", "SelectedMenuService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "Analytics", "FinancialDataService", function ($scope, $translate, $modal, $filter, orderByFilter, NotificationService, SelectedMenuService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, Analytics, FinancialDataService) {
	
	    $scope.showReportFilters = false;
	
	    $scope.model = {
	        metaDataCached: false,
	        data: null,
	        dataElements: [],
	        dataElementsById: [],
	        kra: [],
	        goals: [],
	        objectives: [],
	        selectedKra: null,
	        selectedSdg: null,
	        selectedDataElementGroupSets: [],
	        dataElementGroups: [],
	        baseLineTargetActualDimensions: [],
	        dataSetsById: {},
	        categoryCombosById: {},
	        optionSets: [],
	        optionSetsById: [],
	        dictionaryItems: [],
	        selectedPeriods: [],
	        periods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly',
	        groupSetSize: {},
	        physicalPerformance: true,
	        financialPerformance: true,
	        showProjectDetails: false
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'physicalPerformance', title: 'physical_performance', order: 1, view: 'components/sdg/physical-performance.html', active: true, class: 'main-horizontal-menu' }, { id: 'budgetPerformance', title: 'budget_performance', order: 2, view: 'components/sdg/budget-performance.html', class: 'main-horizontal-menu' }, { id: 'dashboard', title: 'dashboard', order: 6, view: 'views/dashboard.html', class: 'main-horizontal-menu' }];
	
	    $scope.$watch('model.selectedSdgGoal', function () {
	        $scope.model.selectedTarget = null;
	        $scope.model.targets = [];
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedSdgGoal) && $scope.model.selectedSdgGoal.id) {
	            angular.forEach($scope.model.selectedSdgGoal.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                if (_deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	
	            $scope.model.targets = $scope.model.selectedSdgGoal.dataElementGroups;
	        } else {
	            angular.forEach($scope.model.dataElementGroupSets, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                    if (_deg.length > 0) {
	                        $scope.model.dataElementGroup.push(_deg[0]);
	                    }
	                });
	            });
	        }
	    });
	
	    $scope.$watch('model.selectedTarget', function () {
	        $scope.model.selectedIndicator = null;
	        $scope.model.selectedDataElementGroupSets = [];
	        $scope.model.dataElementGroup = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedTarget) && $scope.model.selectedTarget.id) {
	            $scope.model.selectedDataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { id: $scope.model.selectedTarget.id });
	            $scope.getTargets();
	        } else {
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.targets);
	            $scope.getTargets();
	        }
	    });
	
	    $scope.getTargets = function () {
	        $scope.model.dataElementGroup = [];
	        angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	            angular.forEach(degs.dataElementGroups, function (deg) {
	                var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                if (_deg && _deg.length > 0) {
	                    $scope.model.dataElementGroup.push(_deg[0]);
	                }
	            });
	        });
	    };
	
	    dhis2.ndp.downloadGroupSets('sdg').then(function () {
	
	        MetaDataFactory.getAll('optionSets').then(function (optionSets) {
	
	            $scope.model.optionSets = optionSets;
	
	            angular.forEach(optionSets, function (optionSet) {
	                $scope.model.optionSetsById[optionSet.id] = optionSet;
	            });
	
	            $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, { code: 'ndp' });
	
	            if (!$scope.model.ndp || !$scope.model.ndp.code) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_ndp_configuration"));
	                return;
	            }
	
	            OptionComboService.getBtaDimensions().then(function (bta) {
	
	                if (!bta || !bta.category || !bta.options || bta.options.length !== 3) {
	                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                    return;
	                }
	
	                $scope.model.bta = bta;
	                $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                    return d.id;
	                });
	
	                MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                    $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                        map[obj.id] = obj;
	                        return map;
	                    }, {});
	
	                    MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                        $scope.model.dataElementGroups = dataElementGroups;
	
	                        MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sdg').then(function (dataElementGroupSets) {
	                            $scope.model.dataElementGroupSets = dataElementGroupSets;
	                            $scope.model.dataElementGroupSets = orderByFilter($scope.model.dataElementGroupSets, '-code').reverse();
	
	                            var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                            $scope.model.allPeriods = angular.copy(periods);
	                            $scope.model.periods = periods;
	
	                            var selectedPeriodNames = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
	
	                            angular.forEach($scope.model.periods, function (pe) {
	                                if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                    $scope.model.selectedPeriods.push(pe);
	                                }
	                            });
	
	                            //Get orgunits for the logged in user
	                            OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                                $scope.orgUnits = response.organisationUnits;
	                                angular.forEach($scope.orgUnits, function (ou) {
	                                    ou.show = true;
	                                    angular.forEach(ou.children, function (o) {
	                                        o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                                    });
	                                });
	                                $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	                            });
	
	                            $scope.model.metaDataCached = true;
	                            $scope.populateMenu();
	
	                            /*$scope.model.dashboardName = 'SDGs';
	                            DashboardService.getByName( $scope.model.dashboardName ).then(function( result ){
	                                $scope.model.dashboardItems = result.dashboardItems;
	                                $scope.model.charts = result.charts;
	                                $scope.model.tables = result.tables;
	                                $scope.model.maps = result.maps;
	                                $scope.model.dashboardFetched = true;
	                                 $scope.populateMenu();
	                            });*/
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	
	        $scope.resetDataView();
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedSdg = null;
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            $scope.model.sdgGoals = angular.copy($scope.model.dataElementGroupSets);
	            if ($scope.model.sdgGoals && $scope.model.sdgGoals.length === 1) {
	                $scope.model.selectedSdg = $scope.model.sdgGoals[0];
	            }
	        }
	    };
	
	    $scope.getPeriods = function (mode) {
	        if (mode === 'NXT') {
	            $scope.model.periodOffset = $scope.model.periodOffset + 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        } else {
	            $scope.model.periodOffset = $scope.model.periodOffset - 1;
	            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	        }
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_target_or_proxy"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods, function (pe) {
	                return pe.id;
	            }).join(';');
	
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            FinancialDataService.getLocalData('data/cost.json').then(function (cost) {
	                $scope.model.cost = cost;
	
	                Analytics.getData(analyticsUrl).then(function (data) {
	                    if (data && data.data && data.metaData) {
	                        $scope.model.data = data.data;
	                        $scope.model.metaData = data.metaData;
	                        $scope.model.reportReady = true;
	                        $scope.model.reportStarted = false;
	
	                        var dataParams = {
	                            data: data.data,
	                            metaData: data.metaData,
	                            reportPeriods: angular.copy($scope.model.selectedPeriods),
	                            bta: $scope.model.bta,
	                            selectedDataElementGroupSets: $scope.model.dataElementGroupSets,
	                            selectedDataElementGroup: $scope.model.selectedKra,
	                            dataElementGroups: $scope.model.dataElementGroups,
	                            basePeriod: $scope.model.basePeriod,
	                            maxPeriod: $scope.model.selectedPeriods.slice(-1)[0],
	                            allPeriods: $scope.model.allPeriods,
	                            dataElementsById: $scope.model.dataElementsById,
	                            cost: $scope.model.cost
	                        };
	
	                        var processedData = Analytics.processData(dataParams);
	
	                        $scope.model.dataHeaders = processedData.dataHeaders;
	                        $scope.model.reportPeriods = processedData.reportPeriods;
	                        $scope.model.dataExists = processedData.dataExists;
	                        $scope.model.resultData = processedData.resultData || [];
	                        $scope.model.performanceData = processedData.performanceData || [];
	                        $scope.model.cumulativeData = processedData.cumulativeData || [];
	                        $scope.model.costData = processedData.costData || [];
	                        $scope.model.costEffData = processedData.costEffData || [];
	                        $scope.model.sdgView = true;
	                    }
	                });
	            });
	        }
	    };
	
	    $scope.showOrgUnitTree = function () {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/outree/orgunit-tree.html',
	            controller: 'OuTreeController',
	            resolve: {
	                orgUnits: function orgUnits() {
	                    return $scope.orgUnits;
	                },
	                selectedOrgUnit: function selectedOrgUnit() {
	                    return $scope.selectedOrgUnit;
	                },
	                validOrgUnits: function validOrgUnits() {
	                    return null;
	                }
	            }
	        });
	
	        modalInstance.result.then(function (selectedOu) {
	            if (selectedOu && selectedOu.id) {
	                $scope.selectedOrgUnit = selectedOu;
	                $scope.resetDataView();
	            }
	        });
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedSdg.ndp + " objective" + " .xls";
	        if (name) {
	            reportName = name + ' performance.xls';
	        }
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getRFInformation = function (item) {
	        NotificationService.showNotifcationDialog($translate.instant("info"), $translate.instant("Need to display NDP program source here ..."));
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	}]);

/***/ }),
/* 35 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('SettingsController', ["$scope", "$modalInstance", "$route", function ($scope, $modalInstance, $route) {
	
	    $scope.close = function () {
	        $modalInstance.close();
	    };
	
	    $scope.clear = function () {
	        sessionStorage.removeItem('METADATA_CACHED');
	        $route.reload();
	        $scope.close();
	    };
	}]);

/***/ }),
/* 36 */
/***/ (function(module, exports) {

	'use strict';
	
	/* Controllers */
	
	var ndpFramework = angular.module('ndpFramework');
	
	ndpFramework.controller('VisionController', ["$scope", "$translate", "$modal", "$filter", "orderByFilter", "SelectedMenuService", "NotificationService", "PeriodService", "MetaDataFactory", "OrgUnitFactory", "OptionComboService", "FinancialDataService", "Analytics", function ($scope, $translate, $modal, $filter, orderByFilter, SelectedMenuService, NotificationService, PeriodService, MetaDataFactory, OrgUnitFactory, OptionComboService, FinancialDataService, Analytics) {
	
	    $scope.model = {
	        metaDataCached: false,
	        dataElements: [],
	        dataElementsById: [],
	        dataElementGroups: [],
	        dataSetsById: {},
	        categoryCombosById: {},
	        optionSets: [],
	        optionSetsById: [],
	        dictionaryItems: [],
	        vision2040: [],
	        charts: [],
	        tables: [],
	        maps: [],
	        selectedPeriods: [],
	        periods: [],
	        allPeriods: [],
	        periodOffset: 0,
	        openFuturePeriods: 10,
	        selectedPeriodType: 'FinancialJuly'
	    };
	
	    $scope.model.horizontalMenus = [{ id: 'target', title: 'targets', order: 1, view: 'components/vision/results.html', active: true, class: 'main-horizontal-menu' }];
	
	    $scope.$on('MENU', function () {
	        $scope.populateMenu();
	    });
	
	    $scope.$watch('model.selectedNDP', function () {
	        $scope.model.selectedNdpProgram = null;
	        $scope.model.ndpProgram = null;
	        $scope.model.objectives = [];
	        $scope.model.subPrograms = [];
	        $scope.model.selectedSubProgramme = null;
	        $scope.model.selectedDataElementGroupSets = [];
	        $scope.resetDataView();
	        if (angular.isObject($scope.model.selectedNDP) && $scope.model.selectedNDP.id && $scope.model.selectedNDP.code) {
	            $scope.model.ndpProgram = $filter('getFirst')($scope.model.optionSets, { ndp: $scope.model.selectedNDP.code, isNDPProgramme: true }, true);
	
	            $scope.getInterventions();
	        }
	    });
	
	    dhis2.ndp.downloadGroupSets('vision2040').then(function () {
	
	        OptionComboService.getBtaDimensions().then(function (response) {
	
	            if (!response || !response.bta || !response.baseline || !response.actual || !response.target) {
	                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
	                return;
	            }
	
	            $scope.model.bta = response.bta;
	            $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function (d) {
	                return d.id;
	            });
	            $scope.model.actualDimension = response.actual;
	            $scope.model.targetDimension = response.target;
	            $scope.model.baselineDimension = response.baseline;
	
	            MetaDataFactory.getAll('categoryCombos').then(function (ccs) {
	                angular.forEach(ccs, function (cc) {
	                    $scope.model.categoryCombosById[cc.id] = cc;
	                });
	
	                MetaDataFactory.getAll('dataElements').then(function (dataElements) {
	
	                    $scope.model.dataElementsById = dataElements.reduce(function (map, obj) {
	                        map[obj.id] = obj;
	                        return map;
	                    }, {});
	
	                    MetaDataFactory.getDataElementGroups().then(function (dataElementGroups) {
	
	                        $scope.model.downloadLabel = $translate.instant('download_visualization');
	                        $scope.model.metaDataCached = true;
	
	                        $scope.model.dataElementGroups = dataElementGroups;
	
	                        MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'vision2040').then(function (dataElementGroupSets) {
	                            $scope.model.dataElementGroupSets = dataElementGroupSets;
	                            $scope.model.dataElementGroupSets = orderByFilter($scope.model.dataElementGroupSets, '-displayName').reverse();
	
	                            var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
	                            $scope.model.allPeriods = angular.copy(periods);
	                            $scope.model.periods = periods;
	
	                            var selectedPeriodNames = ['2024/25'];
	
	                            $scope.model.selectedPeriods.push({ displayName: '2009/10', id: '2009July' });
	                            angular.forEach($scope.model.periods, function (pe) {
	                                if (selectedPeriodNames.indexOf(pe.displayName) > -1) {
	                                    $scope.model.selectedPeriods.push(pe);
	                                }
	                            });
	
	                            $scope.model.selectedPeriods.push({ displayName: '2039/40', id: '2039July' });
	
	                            //Get orgunits for the logged in user
	                            OrgUnitFactory.getViewTreeRoot().then(function (response) {
	                                $scope.orgUnits = response.organisationUnits;
	                                angular.forEach($scope.orgUnits, function (ou) {
	                                    ou.show = true;
	                                    angular.forEach(ou.children, function (o) {
	                                        o.hasChildren = o.children && o.children.length > 0 ? true : false;
	                                    });
	                                });
	                                $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
	
	                                $scope.populateMenu();
	
	                                $scope.getAnalyticsData();
	                            });
	                        });
	                    });
	                });
	            });
	        });
	    });
	
	    $scope.populateMenu = function () {
	
	        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
	        $scope.model.selectedGoal = null;
	        $scope.model.selectedKra = null;
	        $scope.model.selectedDataElementGroupSets = [];
	        $scope.model.dataElementGroup = [];
	
	        if ($scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code) {
	            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, { ndp: $scope.model.selectedMenu.ndp }, true);
	            $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);
	            angular.forEach($scope.model.selectedDataElementGroupSets, function (degs) {
	                angular.forEach(degs.dataElementGroups, function (deg) {
	                    var _deg = $filter('filter')($scope.model.dataElementGroups, { id: deg.id });
	                    if (_deg.length > 0) {
	                        $scope.model.dataElementGroup.push(_deg[0]);
	                    }
	                });
	            });
	        }
	    };
	
	    $scope.getAnalyticsData = function () {
	
	        $scope.model.data = null;
	        var analyticsUrl = '';
	
	        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
	            return;
	        }
	
	        if (!$scope.model.dataElementGroup || $scope.model.dataElementGroup.length === 0) {
	            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vision2040_items"));
	            return;
	        }
	
	        if ($scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0) {
	            analyticsUrl += '&filter=ou:' + $scope.selectedOrgUnit.id + '&displayProperty=NAME&includeMetadataDetails=true';
	            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function (dm) {
	                return dm;
	            }).join(';');
	            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods, function (pe) {
	                return pe.id;
	            }).join(';');
	
	            $scope.model.dataElements = [];
	            var des = [];
	            angular.forEach($scope.model.dataElementGroup, function (deg) {
	                des.push('DE_GROUP-' + deg.id);
	                angular.forEach(deg.dataElements, function (de) {
	                    var _de = $scope.model.dataElementsById[de.id];
	                    $scope.model.dataElements.push(_de);
	                });
	            });
	            analyticsUrl += '&dimension=dx:' + des.join(';');
	
	            FinancialDataService.getLocalData('data/cost.json').then(function (cost) {
	                $scope.model.cost = cost;
	
	                Analytics.getData(analyticsUrl).then(function (data) {
	                    if (data && data.data && data.metaData) {
	                        $scope.model.data = data.data;
	                        $scope.model.metaData = data.metaData;
	                        $scope.model.reportReady = true;
	                        $scope.model.reportStarted = false;
	                    }
	                });
	            });
	        }
	    };
	
	    $scope.getBaselineValue = function (dataElement, oc) {
	
	        var filterParams = {
	            dx: dataElement.id,
	            pe: $scope.model.selectedPeriods[0].id,
	            co: oc
	        };
	
	        var res = $filter('dataFilter')($scope.model.data, filterParams);
	        return res && res[0] && res[0].value ? res[0].value : '';
	    };
	
	    $scope.getTargetValue = function (dataElement, oc) {
	
	        var filterParams = {
	            dx: dataElement.id,
	            pe: $scope.model.selectedPeriods[1].id,
	            co: oc
	        };
	
	        var res = $filter('dataFilter')($scope.model.data, filterParams);
	        return res && res[0] && res[0].value ? res[0].value : '';
	    };
	
	    $scope.getVision2040Value = function (dataElement, oc) {
	
	        var filterParams = {
	            dx: dataElement.id,
	            pe: $scope.model.selectedPeriods[2].id,
	            co: oc
	        };
	
	        var res = $filter('dataFilter')($scope.model.data, filterParams);
	        return res && res[0] && res[0].value ? res[0].value : '';
	    };
	
	    $scope.exportData = function (name) {
	        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
	            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
	        });
	
	        var reportName = $scope.model.selectedMenu.displayName + "Vision 2040 Targets.xls";
	
	        if (name) {
	            reportName = name + '.xls';
	        }
	        saveAs(blob, reportName);
	    };
	
	    $scope.getIndicatorDictionary = function (item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/dictionary/details-modal.html',
	            controller: 'DictionaryDetailsController',
	            resolve: {
	                dictionaryItem: function dictionaryItem() {
	                    return item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.getDataValueExplanation = function (_item) {
	        var modalInstance = $modal.open({
	            templateUrl: 'components/explanation/explanation-modal.html',
	            controller: 'DataValueExplanationController',
	            windowClass: 'comment-modal-window',
	            resolve: {
	                item: function item() {
	                    return _item;
	                }
	            }
	        });
	
	        modalInstance.result.then(function () {});
	    };
	
	    $scope.resetDataView = function () {
	        $scope.model.data = null;
	        $scope.model.reportReady = false;
	        $scope.model.dataExists = false;
	        $scope.model.dataHeaders = [];
	    };
	}]);

/***/ })
/******/ ]);
//# sourceMappingURL=app-1b2b41282612cf9014b8.js.map