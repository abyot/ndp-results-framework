/* Controllers */

var ndpFramework = angular.module('ndpFramework');

ndpFramework.controller('ProjectController',
    function($scope,
        $translate,
        $modal,
        $filter,
        Paginator,
        NotificationService,
        SelectedMenuService,
        MetaDataFactory,
        ProgramFactory,
        OrgUnitFactory,
        ProjectService) {

    $scope.model = {
        metaDataCached: false,
        showOnlyCoreProject: false,
        data: null,
        reportReady: false,
        dataExists: false,
        projects: [],
        projectsRaw: [],
        projectsPage: [],
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
        filterText: {},
        sortBy: 'vote',
        sortDesc: false
    };

    //Paging
    $scope.pager = {pageSize: 50, page: 1, toolBarDisplay: 5};

    $scope.model.horizontalMenus = [
        {id: 'financial_performance', title: 'financial_performance', order: 1, view: 'components/project/financial-performance.html', active: true, class: 'main-horizontal-menu'},
        {id: 'physical_performance', title: 'physical_performance', order: 2, view: 'components/project/physical-performance.html', class: 'main-horizontal-menu'}
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
            angular.forEach(programs, function(pr){                
                angular.forEach(pr.programTrackedEntityAttributes, function(pta){
                    $scope.model.attributesById[pta.trackedEntityAttribute.id] = pta.trackedEntityAttribute;
                });
                $scope.model.programsById[pr.id] = pr;
                angular.forEach(pr.programStages, function(stage){
                    angular.forEach(stage.programStageDataElements, function(prstDe){
                        $scope.model.dataElementsById[prstDe.dataElement.id] = prstDe.dataElement;
                    });
                });
            });
            
            $scope.model.programs = $filter('filter')(programs, {programType: 'WITH_REGISTRATION', programDomain: 'projectTracker'}, true);
            $scope.model.kpiProgram =  $filter('getFirst')(programs, {programType: 'WITH_REGISTRATION', programDomain: 'projectKpi'}, true);

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
        $scope.model.selectedProgramStage = null;
        $scope.pager = {pageSize: 50, page: 1, toolBarDisplay: 5};
        $scope.model.filterText = {};
        $scope.model.sortBy = 'vote';
        $scope.model.sortDesc = false;
        if( $scope.model.selectedMenu && $scope.model.selectedMenu.code && $scope.model.selectedProgram && $scope.model.selectedProgram.id && $scope.model.selectedProgram.programTrackedEntityAttributes ){

            if ( $scope.model.selectedProgram.programStages && $scope.model.selectedProgram.programStages.length > 1 ){
                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_project_stage"));
                return;
            }
            
            $scope.model.selectedProgramStage = $scope.model.selectedProgram.programStages[0];
            $scope.fetchProjects();
        }
    };

    $scope.searchProjects = function(){
        $scope.pager.page = 1;
        $scope.fetchProjects();
    };

    function isTextSortField(field) {
        return field === 'vote' || String(field || '').indexOf('attr:') === 0;
    }

    function getProjectSortValue(project, field) {
        if (!project) {
            return '';
        }
        if (String(field || '').indexOf('attr:') === 0) {
            return project[field.substring('attr:'.length)] || '';
        }
        return project[field];
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

    function updatePagedProjects() {
        var projects = $scope.model.projects || [];
        var pageSize = $scope.pager.pageSize > 0 ? parseInt($scope.pager.pageSize, 10) : 50;
        if (isNaN(pageSize) || pageSize < 1) {
            pageSize = 50;
        }
        var pageCount = Math.max(1, Math.ceil(projects.length / pageSize));
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
        $scope.pager.total = projects.length;
        $scope.pager.length = projects.length;
        $scope.pager.pageCount = pageCount;
        $scope.pager.toolBarDisplay = 5;
        $scope.model.projectsPage = projects.slice(start, end);

        Paginator.setPage($scope.pager.page);
        Paginator.setPageCount($scope.pager.pageCount);
        Paginator.setPageSize($scope.pager.pageSize);
        Paginator.setItemCount($scope.pager.total);
    }

    function applySorting() {
        var projects = angular.copy($scope.model.projectsRaw || []);
        projects.sort(function(a, b){
            var sortResult = compareSortValues(
                getProjectSortValue(a, $scope.model.sortBy),
                getProjectSortValue(b, $scope.model.sortBy)
            );
            if (sortResult === 0) {
                sortResult = compareSortValues(a.vote, b.vote);
            }
            return $scope.model.sortDesc ? (sortResult * -1) : sortResult;
        });
        $scope.model.projects = projects;
        updatePagedProjects();
    }

    $scope.fetchProjects = function(){
        $scope.model.projectFetchStarted = true;
        var filter = [];
        if ( Object.keys( $scope.model.filterText ).length > 0 ){
            for(var key in $scope.model.filterText ){
                if ( $scope.model.filterText[key] && $scope.model.filterText[key] !== '' )
                filter.push( "&filter=" + key + ':LIKE:' + $scope.model.filterText[key] );
            }
        }

        ProjectService.getByProgram(filter.length > 0 ? filter.join('&') : null, $scope.selectedOrgUnit, $scope.model.selectedProgram, $scope.model.optionSetsById, $scope.model.attributesById, $scope.model.dataElementsById ).then(function( response ){
            $scope.model.projectsRaw = response.projects || [];
            $scope.model.projectsFetched = true;
            $scope.model.projectFetchStarted = false;
            applySorting();
        });
    };

    $scope.getProjectDetails = function( project ){
        if ( $scope.model.selectedProject && $scope.model.selectedProject.trackedEntityInstance === project.trackedEntityInstance ){
            $scope.model.showProjectDetails = !$scope.model.showProjectDetails;
            $scope.model.selectedProject = null;
        }
        else{
            
            $scope.model.selectedProject = project;
            $scope.model.showProjectDetails = true;
            $scope.model.projectKpis = [];
            if( !project.relationships ){
                NotificationService.showNotifcationDialog($translate.instant("warning"), $translate.instant("missing_project_kpi"));
            }

            if( project && project.relationships ){
                ProjectService.getKpi( project.relationships.join(';'), $scope.model.optionSetsById, $scope.model.attributesById , $scope.model.dataElementsById ).then(function( data ){
                    $scope.model.projectKpis = data;
                });
            }
        }
    };

    $scope.jumpToPage = function(){
        if($scope.pager && $scope.pager.page && $scope.pager.pageCount && $scope.pager.page > $scope.pager.pageCount){
            $scope.pager.page = $scope.pager.pageCount;
        }
        updatePagedProjects();
    };

    $scope.resetPageSize = function(){
        $scope.pager.page = 1;
        updatePagedProjects();
    };

    $scope.getPage = function(page){
        $scope.pager.page = page;
        updatePagedProjects();
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
        $scope.model.projectsFetched = false;
        $scope.model.projects = [];
        $scope.model.projectsRaw = [];
        $scope.model.projectsPage = [];
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
