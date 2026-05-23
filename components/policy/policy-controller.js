/* Controllers */

var ndpFramework = angular.module('ndpFramework');

ndpFramework.controller('PolicyController',
    function($scope,
        $translate,
        $modal,
        $filter,
        Paginator,
        SelectedMenuService,
        MetaDataFactory,
        ProgramFactory,
        OrgUnitFactory,
        PolicyService) {

    $scope.model = {
        metaDataCached: false,
        data: null,
        reportReady: false,
        dataExists: false,
        policies: [],
        policiesRaw: [],
        policiesPage: [],
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
        bac: null,
        ac: null,
        timePerformance: [],
        costPerformance: [],
        showProjectFilter: false,
        filterText: {},
        sortBy: 'vote',
        sortDesc: false
    };

    //Paging
    $scope.pager = {pageSize: 50, page: 1, toolBarDisplay: 5};

    $scope.model.horizontalMenus = [
        {id: 'policy_status', title: 'policy_status', order: 1, view: 'components/policy/policy-status.html', active: true, class: 'main-horizontal-menu'}
    ];

    $scope.model.performanceHeaders = [
        {id: 'KPI', displayName: $translate.instant("kpi"), order: 1},
        {id: 'IND', displayName: $translate.instant('indicator'), order: 2},
        {id: 'INT', displayName: $translate.instant('interpretation'), order: 3},
        {id: 'UNI', displayName: $translate.instant('unit'), order: 4},
        {id: 'BSL', displayName: $translate.instant('baseline'), order: 5}
    ];

    $scope.$watch('model.selectedProgram', function(){
        $scope.resetData();
        if ( $scope.model.selectedMenu && $scope.model.selectedMenu.code ){
            $scope.fetchProgramDetails();
        }
    });


    MetaDataFactory.getAll('optionSets').then(function(optionSets){

        $scope.model.optionSets = optionSets;

        angular.forEach(optionSets, function(optionSet){
            $scope.model.optionSetsById[optionSet.id] = optionSet;
        });

        $scope.model.ndp = $filter('getFirst')($scope.model.optionSets, {code: 'ndp'});

        ProgramFactory.getAll('programs').then(function(programs){
            $scope.model.programs = $filter('filter')(programs, {programType: 'WITH_REGISTRATION', programDomain: 'policyAction'}, true);
            $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();

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
            });
        });
    });

    $scope.fetchProgramDetails = function(){
        $scope.pager = {pageSize: 50, page: 1, toolBarDisplay: 5};
        $scope.model.filterText = {};
        $scope.model.sortBy = 'vote';
        $scope.model.sortDesc = false;
        if( $scope.model.selectedMenu && $scope.model.selectedMenu.code && $scope.model.selectedProgram && $scope.model.selectedProgram.id && $scope.model.selectedProgram.programTrackedEntityAttributes ){

            angular.forEach($scope.model.selectedProgram.programTrackedEntityAttributes, function(pta){
                $scope.model.attributesById[pta.trackedEntityAttribute.id] = pta.trackedEntityAttribute;
            });

            angular.forEach($scope.model.selectedProgram.programStages, function(stage){
                angular.forEach(stage.programStageDataElements, function(prstDe){
                    var de = prstDe.dataElement;
                    if( de ){
                        $scope.model.dataElementsById[de.id] = de;
                    }
                });
            });
            $scope.fetchPolicies();
        }
    };

    function isTextSortField(field) {
        return field === 'vote' || String(field || '').indexOf('attr:') === 0;
    }

    function getPolicySortValue(policy, field) {
        if (!policy) {
            return '';
        }
        if (String(field || '').indexOf('attr:') === 0) {
            return policy[field.substring('attr:'.length)] || '';
        }
        return policy[field];
    }

    function compareSortValues(a, b) {
        var aMissing = a === null || a === undefined || a === '';
        var bMissing = b === null || b === undefined || b === '';
        if (aMissing && bMissing) {
            return 0;
        }
        if (aMissing) {
            return 1;
        }
        if (bMissing) {
            return -1;
        }
        if (angular.isNumber(a) && angular.isNumber(b)) {
            return a === b ? 0 : (a < b ? -1 : 1);
        }
        var aText = String(a).toLowerCase();
        var bText = String(b).toLowerCase();
        if (aText === bText) {
            return 0;
        }
        return aText < bText ? -1 : 1;
    }

    function updatePagedPolicies() {
        var policies = $scope.model.policies || [];
        var pageSize = $scope.pager.pageSize > 0 ? parseInt($scope.pager.pageSize, 10) : 50;
        if (isNaN(pageSize) || pageSize < 1) {
            pageSize = 50;
        }
        var pageCount = Math.max(1, Math.ceil(policies.length / pageSize));
        var page = $scope.pager.page > 0 ? parseInt($scope.pager.page, 10) : 1;
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        if (page > pageCount) {
            page = pageCount;
        }
        var start = (page - 1) * pageSize;
        var end = start + pageSize;

        $scope.pager.page = page;
        $scope.pager.pageSize = pageSize;
        $scope.pager.total = policies.length;
        $scope.pager.length = policies.length;
        $scope.pager.pageCount = pageCount;
        $scope.pager.toolBarDisplay = 5;
        $scope.model.policiesPage = policies.slice(start, end);

        Paginator.setPage($scope.pager.page);
        Paginator.setPageCount($scope.pager.pageCount);
        Paginator.setPageSize($scope.pager.pageSize);
        Paginator.setItemCount($scope.pager.total);
    }

    function applySorting() {
        var policies = angular.copy($scope.model.policiesRaw || []);
        policies.sort(function(a, b){
            var sortResult = compareSortValues(
                getPolicySortValue(a, $scope.model.sortBy),
                getPolicySortValue(b, $scope.model.sortBy)
            );
            if (sortResult === 0) {
                sortResult = compareSortValues(a.vote, b.vote);
            }
            return $scope.model.sortDesc ? (sortResult * -1) : sortResult;
        });
        $scope.model.policies = policies;
        updatePagedPolicies();
    }

    $scope.fetchPolicies = function(){
        $scope.model.policyFetchStarted = true;
        var filter = [];
        if ( Object.keys( $scope.model.filterText ).length > 0 ){
            for(var key in $scope.model.filterText ){
                if ( $scope.model.filterText[key] && $scope.model.filterText[key] !== '' )
                filter.push( "&filter=" + key + ':LIKE:' + $scope.model.filterText[key] );
            }
        }

        PolicyService.getByProgram(filter.length > 0 ? filter.join('&') : null, $scope.selectedOrgUnit, $scope.model.selectedProgram, $scope.model.optionSetsById, $scope.model.attributesById, $scope.model.dataElementsById ).then(function( response ){
            $scope.model.policiesRaw = response.policies || [];
            $scope.model.policiesFetched = true;
            $scope.model.policyFetchStarted = false;
            applySorting();
        });
    };

    $scope.getPolicyDetails = function( policy ){
        if ( $scope.model.selectedPolicy && $scope.model.selectedPolicy.trackedEntityInstance === policy.trackedEntityInstance ){
            $scope.model.showPolicyDetails = !$scope.model.showPolicyDetails;
            $scope.model.selectedPolicy = null;
        }
        else{
            $scope.model.selectedPolicy = policy;
            $scope.model.showPolicyDetails = true;
        }
    };
    
    $scope.searchPolicies = function(){
        $scope.pager.page = 1;
        $scope.fetchPolicies();
    };

    $scope.jumpToPage = function(){
        if($scope.pager && $scope.pager.page && $scope.pager.pageCount && $scope.pager.page > $scope.pager.pageCount){
            $scope.pager.page = $scope.pager.pageCount;
        }
        updatePagedPolicies();
    };

    $scope.resetPageSize = function(){
        $scope.pager.page = 1;
        updatePagedPolicies();
    };

    $scope.getPage = function(page){
        $scope.pager.page = page;
        updatePagedPolicies();
    };

    $scope.setSort = function(field) {
        if ($scope.model.sortBy === field) {
            $scope.model.sortDesc = !$scope.model.sortDesc;
        } else {
            $scope.model.sortBy = field;
            $scope.model.sortDesc = !isTextSortField(field);
        }
        applySorting();
    };

    $scope.getSortIcon = function(field) {
        if ($scope.model.sortBy !== field) {
            return '';
        }
        return $scope.model.sortDesc ? '▼' : '▲';
    };

    $scope.resetData = function(){
        $scope.model.attributesById = [];
        $scope.model.dataElementsById = [];
        $scope.model.policiesFetched = false;
        $scope.model.policies = [];
        $scope.model.policiesRaw = [];
        $scope.model.policiesPage = [];
    };

    $scope.resetView = function(horizontalMenu, e){
        $scope.model.activeHorizontalMenu = horizontalMenu;
        if(e){
            e.stopPropagation();
            e.preventDefault();
        }
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
                $scope.resetData();
            }
        });
    };

    $scope.exportData = function ( name ) {
        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });

        var reportName = $scope.model.selectedProgram.displayName + " - project status" + " .xls";
        if( name ){
            reportName = name + ' performance.xls';
        }
        saveAs(blob, reportName);
    };

    $scope.currentView = $scope.model.horizontalMenus.find(m => m.active).view;
        $scope.resetTheView = function(menu, $event) {
                $scope.model.horizontalMenus.forEach(function(m) {
                  m.active = false;
                });

                menu.active = true;

                $scope.currentView = menu.view;
              };
});
