/* Controllers */

var ndpFramework = angular.module('ndpFramework');

ndpFramework.controller('AtiController',
    function($scope,
        $translate,
        $modal,
        $filter,
        orderByFilter,
        CommonUtils,
        SelectedMenuService,
        NotificationService,
        PeriodService,
        MetaDataFactory,
        OrgUnitFactory,
        OptionComboService,
        FinancialDataService,
        Analytics) {

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
        openFuturePeriods: 0,
        defaultPeriodType: 'Yearly'
    };

    $scope.$on('MENU', function(){
        $scope.resetDataView();
        $scope.populateMenu();
    });

    $scope.$watch('model.selectedMenu', function(){
        $scope.model.selectedDataElementGroup = null;
    });

    OptionComboService.getAtiDimensions().then(function( response ){
        if( !response || !response.ati || !response.physicalActual || !response.physicalTarget || !response.budgetTarget || !response.budgetActual || !response.beneficiary){
            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_ati_dimensions"));
            return;
        }

        $scope.model.ati = response.ati;
        $scope.model.atiCategoryDimensions = $.map($scope.model.ati.options, function(d){return d.id;});
        $scope.model.physicalActualDimension = response.physicalActual;
        $scope.model.physicalTargetDimension = response.physicalTarget;
        $scope.model.budgetActualDimension = response.budgetActual;
        $scope.model.budgetTargetDimension = response.budgetTarget;
        $scope.model.beneficiaryDimension = response.beneficiary;

        MetaDataFactory.getAll('categoryCombos').then(function(ccs){
            angular.forEach(ccs, function(cc){
                $scope.model.categoryCombosById[cc.id] = cc;
            });

            MetaDataFactory.getAll('dataElements').then(function(dataElements){

                $scope.model.dataElementsById = dataElements.reduce( function(map, obj){
                    map[obj.id] = obj;
                    return map;
                }, {});

                //Get orgunits for the logged in user
                OrgUnitFactory.getViewTreeRoot().then(function(response) {
                    $scope.orgUnits = response.organisationUnits;
                    angular.forEach($scope.orgUnits, function(ou){
                        ou.show = true;
                        angular.forEach(ou.children, function(o){
                            o.hasChildren = o.children && o.children.length > 0 ? true : false;
                        });
                    });

                    $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
                    $scope.model.metaDataCached = true;
                    $scope.populateMenu();
                });
            });
        });
    });

    function applyDefaultSelectionLogic(){
        // Default selection logic
        if ($scope.model.dataElementGroups.length === 1) {
            // if one item exists selected by default
            $scope.model.selectedDataElementGroup = $scope.model.dataElementGroups[0];
        } else {
            $scope.model.selectedDataElementGroup = null;
        } 
    }

    $scope.populateMenu = function(){
        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
        if ( $scope.model.selectedMenu && $scope.model.selectedMenu.id ){
            $scope.model.horizontalMenus = [
                {id: 'target', title: 'home', order: 1, view: 'components/ati/results.html', active: true, class: 'main-horizontal-menu'},
            ];

            $scope.model.selectedPeriods = [];
            $scope.model.selectedPeriodType = $scope.model.selectedMenu.periodType ? $scope.model.selectedMenu.periodType : $scope.model.defaultPeriodType;

            $scope.model.availableGroupSets = [];
            $scope.model.selectedGroupSet = null;

            function buildGroupSetOptions(groups) {
                var byId = {};
                angular.forEach(groups || [], function(g){
                    angular.forEach(g.groupSets || [], function(gs){
                    byId[gs.id] = gs;
                    });
                });
                return Object.keys(byId).map(function(id){ return byId[id]; });
            }

            MetaDataFactory.getAllByProperty('dataElementGroups', 'resultLevel', $scope.model.selectedMenu.id).then(function(dataElementGroups){

                $scope.model._allGroupsForMenu = dataElementGroups || [];
                $scope.model.dataElementGroups = $scope.model._allGroupsForMenu;

                $scope.model.availableGroupSets = buildGroupSetOptions($scope.model._allGroupsForMenu);
                $scope.model.selectedGroupSet = $scope.model.availableGroupSets[0];

                applyDefaultSelectionLogic();              
                $scope.applyGroupSetFilter();

                var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
                periods = orderByFilter( periods, '-id').reverse();
                $scope.model.allPeriods = angular.copy( periods );
                $scope.model.periods = periods;                
                var selectedPeriodIds = $scope.model.periods.slice(periods.length-1,periods.length).map(p => p.id);
                angular.forEach($scope.model.periods, function(pe){
                    if(selectedPeriodIds.indexOf(pe.id) > -1 ){
                        $scope.model.selectedPeriods.push(pe);
                    }
                });
                $scope.getAnalyticsData();
            });
        }
    };

    $scope.applyGroupSetFilter = function () {
        $scope.resetDataView();
        var gs = $scope.model.selectedGroupSet;
        var all = $scope.model._allGroupsForMenu || [];

        // If nothing selected or "ALL", show everything
        if (!gs || gs.id === 'ALL') {
            $scope.model.dataElementGroups = all;
        } else {
            $scope.model.dataElementGroups = all.filter(function (g) {
                return (g.groupSets || []).some(function (x) { return x.id === gs.id; });
            });
        }

        applyDefaultSelectionLogic()
    };


    $scope.getPeriods = function(mode){
        var periods = [];
        if( mode === 'NXT'){
            $scope.model.periodOffset = $scope.model.periodOffset + 1;
            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
        }
        else{
            $scope.model.periodOffset = $scope.model.periodOffset - 1;
            periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
        }

        var periodsById = {};
        angular.forEach($scope.model.periods, function(p){
            periodsById[p.id] = p;
        });

        angular.forEach(periods, function(p){
            if( !periodsById[p.id] ){
                periodsById[p.id] = p;
            }
        });

        $scope.model.periods = Object.values( periodsById );

        $scope.model.allPeriods = angular.copy( $scope.model.periods );
    };

    $scope.getAnalyticsData = function(){

        $scope.model.data = null;
        var analyticsUrl = '';

        if( !$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id ){
            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_orgunit"));
            return;
        }

        if( !$scope.model.dataElementGroups || $scope.model.dataElementGroups.length === 0){            
            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("please_select") + " " + $translate.instant($scope.model.selectedMenu.displayName));
            return;
        }

        if( !$scope.model.selectedPeriods || $scope.model.selectedPeriods.length === 0){            
            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_period"));
            return;
        }

        analyticsUrl += '&filter=ou:'+ $scope.selectedOrgUnit.id +'&displayProperty=NAME&includeMetadataDetails=true';
        analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods, function(pe){return pe.id;}).join(';');
        
        $scope.model.dataElements = [];
        var seen = [];
        var des = [];
        if ( $scope.model.selectedDataElementGroup && $scope.model.selectedDataElementGroup.id ){
            des.push('DE_GROUP-' + $scope.model.selectedDataElementGroup.id );
            angular.forEach($scope.model.selectedDataElementGroup.dataElements, function(de){
                var _de = $scope.model.dataElementsById[de.id];
                _de.parent = $scope.model.selectedDataElementGroup.displayName;
                _de.ownerName = $scope.model.selectedDataElementGroup.project ? $scope.model.selectedDataElementGroup.project : ($scope.model.selectedDataElementGroup.program ? $scope.model.selectedDataElementGroup.program : '');
                if( seen.indexOf(_de.id) !== -1){
                    //console.log('_de: ', _de);
                }
                else{
                    seen.push( _de.id );
                    $scope.model.dataElements.push( _de );
                }
            });
        }
        else {       
            angular.forEach($scope.model.dataElementGroups, function(deg){
                des.push('DE_GROUP-' + deg.id);
                angular.forEach(deg.dataElements, function(de){
                    var _de = $scope.model.dataElementsById[de.id];                    
                    _de.parent = deg.displayName;
                    _de.ownerName = deg.project ? deg.project : (deg.program ? deg.program : '');                    
                    if( seen.indexOf(_de.id) !== -1){
                        //console.log('_de: ', _de);
                    }
                    else{
                        seen.push( _de.id );
                        $scope.model.dataElements.push( _de );
                    }
                });
            });
        }

        analyticsUrl += '&dimension=dx:' + des.join(';');
        if ( $scope.model.selectedMenu.thematicArea !== 'activity' ){
            analyticsUrl += '&dimension=co&dimension=' + $scope.model.ati.category + ':' + $.map($scope.model.atiCategoryDimensions, function(dm){return dm;}).join(';');
        }

        $scope.model.dataHeaders = [];        
        var actual_achievement = $translate.instant("actual_achievement");
        var budget_utilization = $translate.instant("budget_utilization");
        var total_beneficiaries = $translate.instant("total_beneficiaries");
        angular.forEach($scope.model.selectedPeriods, function (pe) {
            var index = 0;
            angular.forEach($scope.model.ati.options, function (dm) {

                $scope.model.dataHeaders.push({
                    periodId: pe.id,
                    periodStart: pe.startDate,
                    periodEnd: pe.endDate,
                    dimensionId: dm.id,
                    displayName: dm.displayName,
                    dimension: $scope.model.ati.category});

                if ( index == 1 ){
                    $scope.model.dataHeaders.push({
                        periodId: pe.id,
                        periodStart: pe.startDate,
                        periodEnd: pe.endDate,
                        calculated: true,
                        dimensionId: 'actualAchievement',
                        displayName: actual_achievement,
                        dimension: $scope.model.ati.category});
                }   
                else if ( index == 3) {
                    $scope.model.dataHeaders.push({
                        periodId: pe.id,
                        periodStart: pe.startDate,
                        periodEnd: pe.endDate,
                        calculated: true,
                        dimensionId: 'budget_utilization',
                        displayName: budget_utilization,
                        dimension: $scope.model.ati.category});
                }
                else if ( index == 6){
                    $scope.model.dataHeaders.push({
                        periodId: pe.id,
                        periodStart: pe.startDate,
                        periodEnd: pe.endDate,
                        calculated: true,
                        dimensionId: 'total_beneficiaries',
                        displayName: total_beneficiaries,
                        dimension: $scope.model.ati.category});
                }
                index++;                                
            });
        });

        var currentParent = null;
        var startIndex = 0;

        for (var i = 0; i < $scope.model.dataElements.length; i++) {
            var de = $scope.model.dataElements[i];

            if (de.parent !== currentParent) {
                if (currentParent !== null) {
                    var span = i - startIndex;
                    $scope.model.dataElements[startIndex].rowSpan = span;
                    for (var j = startIndex + 1; j < i; j++) {
                        $scope.model.dataElements[j].rowSpan = 0;
                    }
                }
                currentParent = de.parent;
                startIndex = i;
            }
        }

        if (currentParent !== null) {
            var spanLast = $scope.model.dataElements.length - startIndex;
            $scope.model.dataElements[startIndex].rowSpan = spanLast;
            for (var k = startIndex + 1; k < $scope.model.dataElements.length; k++) {
                $scope.model.dataElements[k].rowSpan = 0;
            }
        }

        $scope.model.indexedData = {};
        function buildIndexedData(data, categoryKey) {
            var idx = {};
            if (!data || !data.length) return idx;

            angular.forEach(data, function (dv) {
                if (!dv || !dv.dx || !dv.pe) return;

                var dx = dv.dx;
                var pe = String(dv.pe);

                // categoryKey is your dynamic dimension property name, e.g. "lBnoNc1T39R"
                var dimValue = dv[categoryKey];

                // skip rows without that dimension value (important!)
                if (!dimValue) return;

                if (!idx[dx]) idx[dx] = {};
                if (!idx[dx][dimValue]) idx[dx][dimValue] = {};

                idx[dx][dimValue][pe] = dv;
            });

            return idx;
        }

        function buildIndexedText(data) {
            var idx = {};
            if (!data || !data.length) return idx;

            angular.forEach(data, function (dv) {
                if (!dv || !dv.dx || !dv.pe) return;

                var dx = dv.dx;
                var pe = String(dv.pe);

                if (!idx[dx]) idx[dx] = {};

                // Keep first non-empty value (policy); change if you prefer concat
                if (idx[dx][pe] == null || idx[dx][pe] === '') {
                    if (dv.value != null && dv.value !== '') {
                        idx[dx][pe] = dv.value;
                    }
                }
            });

            return idx;
        }
        
        Analytics.getData( analyticsUrl ).then(function(data){
            if( data && data.data && data.metaData ){
                $scope.model.data = data.data;
                $scope.model.metaData = data.metaData;
                $scope.model.reportReady = true;
                $scope.model.reportStarted = false;
                $scope.model.dataExists = data.data.length > 0;
                
                $scope.model.indexedData = buildIndexedData($scope.model.data, $scope.model.ati.category);
                $scope.model.indexedText = buildIndexedText($scope.model.data);
            }
        });
    };

    function lookupDV(idx, dx, dimValue, pe) {
        if (!idx) return null;
        var byDx = idx[dx];
        if (!byDx) return null;
        var byDim = byDx[dimValue];
        if (!byDim) return null;
        return byDim[pe] || null;
    }

    $scope.tlClass = function (val) {
        // val is expected to be a number or numeric string like 96.6
        if (val === null || val === undefined || val === '') return '';

        var v = Number(val);
        if (isNaN(v)) return '';

        if (v >= 84) return 'tl-green';
        if (v >= 65) return 'tl-amber';
        return 'tl-red';
    };

    $scope.statusTlClass = function (status) {
        if (!status) return '';

        switch (status.toUpperCase()) {
            case 'COMPLETE':
                return 'tl-green';
            case 'INPROGRESS':
                return 'tl-amber';
            case 'INCOMPLETE':
                return 'tl-red';
            default:
                return '';
        }
    };

    $scope.getDV = function (dx, dh) {
        var idx = $scope.model.indexedData;
        var pe = String(dh.periodId);

        // ---- Calculated columns ----
        if (dh.calculated) {

            // Sum beneficiaries across beneficiary dimensions (ids must match your header dimensionId keys)
            if (dh.dimensionId === 'total_beneficiaries') {
                var sum = 0;

                angular.forEach($scope.model.beneficiaryDimension || [], function (b) {
                    if (!b || !b.id) return;

                    var dv = lookupDV(idx, dx, b.id, pe);
                    if (dv && dv.value != null && dv.value !== '') {
                        sum += +dv.value;
                    }
                });

                return sum > 0 ? sum : '';
            }

            // Physical actual / target %
            if (dh.dimensionId === 'actualAchievement') {
                var aId = $scope.model.physicalActualDimension && $scope.model.physicalActualDimension.id;
                var tId = $scope.model.physicalTargetDimension && $scope.model.physicalTargetDimension.id;

                if (!aId || !tId) return '';

                var aDV = lookupDV(idx, dx, aId, pe);
                var tDV = lookupDV(idx, dx, tId, pe);

                var n = aDV && aDV.value != null ? +aDV.value : null;
                var d = tDV && tDV.value != null ? +tDV.value : null;

                if (n == null || d == null) return '';
                return CommonUtils.getPercent(n, d, true, true);
            }

            // Budget utilization %
            if (dh.dimensionId === 'budget_utilization') {
                var baId = $scope.model.budgetActualDimension && $scope.model.budgetActualDimension.id;
                var btId = $scope.model.budgetTargetDimension && $scope.model.budgetTargetDimension.id;

                if (!baId || !btId) return '';

                var baDV = lookupDV(idx, dx, baId, pe);
                var btDV = lookupDV(idx, dx, btId, pe);

                var bn = baDV && baDV.value != null ? +baDV.value : null;
                var bd = btDV && btDV.value != null ? +btDV.value : null;

                if (bn == null || bd == null) return '';
                return CommonUtils.getPercent(bn, bd, true, true);
            }

            return '';
        }

        // ---- Normal (non-calculated) columns ----
        var dv0 = lookupDV(idx, dx, dh.dimensionId, pe);

        return (dv0 && dv0.value != null) ? dv0.value : '';
    };

    $scope.getTextValue = function (dx, periodId) {
        var pe = String(periodId);
        return ($scope.model.indexedText &&
                $scope.model.indexedText[dx] &&
                $scope.model.indexedText[dx][pe] != null)
            ? $scope.model.indexedText[dx][pe]
            : '';
    };


    $scope.exportData = function () {
        var container = document.getElementById('exportTable');
        if (!container) {
            console.warn('exportTable not found');
            return;
        }

        var table = container.querySelector('table');
        if (!table) {
            console.warn('No table inside exportTable');
            return;
        }

        var csv = [];
        var rows = table.querySelectorAll('tr');

        angular.forEach(rows, function (row) {
            var cols = row.querySelectorAll('th, td');
            var rowData = [];

            angular.forEach(cols, function (col) {
                var text = col.innerText
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                // escape double quotes
                text = '"' + text.replace(/"/g, '""') + '"';
                rowData.push(text);
            });

            csv.push(rowData.join(','));
        });

        var csvContent = csv.join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');

        var filename = 'ATI_Report.csv';

        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            var url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    $scope.getDataValueExplanation = function( item ){
        var modalInstance = $modal.open({
            templateUrl: 'components/explanation/explanation-modal.html',
            controller: 'DataValueExplanationController',
            windowClass: 'comment-modal-window',
            resolve: {
                item: function(){
                    return item;
                }
            }
        });

        modalInstance.result.then(function () {

        });
    };

    $scope.resetDataView = function(){
        $scope.model.data = null;
        $scope.model.reportReady = false;
        $scope.model.dataExists = false;
        $scope.model.dataHeaders = [];
    };


     $scope.showOrgUnitTree = function(){
        var modalInstance = $modal.open({
            templateUrl: 'components/outree/orgunit-tree.html',
            controller: 'OuTreeController',
            resolve: {
                orgUnits: function(){
                    return $scope.orgUnits;
                },
                selectedOrgUnit: function(){
                    return $scope.selectedOrgUnit;
                },
                validOrgUnits: function(){
                    return null;
                }
            }
        });

        modalInstance.result.then(function ( selectedOu ) {
            if( selectedOu && selectedOu.id ){
                $scope.selectedOrgUnit = selectedOu;
                $scope.resetDataView();
            }
        });
    };

});
