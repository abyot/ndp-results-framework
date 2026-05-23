/* Controllers */

var ndpFramework = angular.module('ndpFramework');

ndpFramework.controller('OutputController',
    function($rootScope,
        $scope,
        $translate,
        $modal,
        $filter,
        orderByFilter,
        NotificationService,
        SelectedMenuService,
        PeriodService,
        MetaDataFactory,
        OrgUnitFactory,
        OptionComboService,
        ResulstChainService,
        CommonUtils,
        DataValueService,
        ReportCommentService,
        Analytics,
        ClusterDataService,
        DataStoreService) {

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

      $scope.model.horizontalMenus = [
            {id: 'result', title: 'targets', order: 1, view: 'components/output/results.html', active: true, class: 'main-horizontal-menu'},
            {id: 'physicalPerformance', title: 'performance', order: 2, view: 'components/output/physical-performance.html', class: 'main-horizontal-menu'},
            {id: 'performanceOverview', title: 'performance_overview', order: 3, view: 'components/output/performance-overview.html', class: 'main-horizontal-menu'},
            {id: 'completeness', title: 'completeness', order: 4, view: 'components/output/completeness.html', class: 'main-horizontal-menu'}
        ];

          $scope.$on('MENU', function(){
              $scope.populateMenu();
          });

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

    $scope.getOutputs = function(){
        $scope.model.dataElementGroup = [];
        angular.forEach($scope.model.selectedDataElementGroupSets, function(degs){
            angular.forEach(degs.dataElementGroups, function(deg){
                var _deg = $filter('filter')($scope.model.dataElementGroups, {indicatorGroupType: 'output', id: deg.id}, true);
                if ( _deg.length > 0 ){
                    $scope.model.dataElementGroup.push( _deg[0] );
                }
            });
        });
    };

    /*$scope.$on('MENU', function(){
        $scope.populateMenu();
    });*/

    $scope.$watch('model.selectedNdpProgram', function(){
        $scope.resetDataView();

        if( $scope.model.piapResultsChain && $scope.model.piapResultsChain.code ){
            $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
//            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
        }

        $scope.model.selectedSubProgramme = null;
        $scope.model.selectedObjective = null;
        $scope.model.selectedIntervention = null;
        if( angular.isObject($scope.model.selectedNdpProgram) ){
            if( $scope.model.selectedNdpProgram && $scope.model.selectedNdpProgram.code ){
                $scope.model.subProgrammes = $filter('startsWith')($scope.model.subProgrammes, {code: $scope.model.selectedNdpProgram.code});
                $scope.model.piapObjectives = $filter('startsWith')($scope.model.piapObjectives, {code: $scope.model.selectedNdpProgram.code});
//                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedNdpProgram.code});
            }
        }
    });

    $scope.$watch('model.selectedSubProgramme', function(){
        $scope.resetDataView();

        if( $scope.model.piapResultsChain && $scope.model.piapResultsChain.code ){
            $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
//            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
        }

        $scope.model.selectedObjective = null;
        $scope.model.selectedIntervention = null;
        if( angular.isObject($scope.model.selectedSubProgramme) ){
            if( $scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code ){
                $scope.model.piapObjectives = $filter('startsWith')($scope.model.piapObjectives, {code: $scope.model.selectedSubProgramme.code});
//                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedSubProgramme.code});
            }
        }
    });

    $scope.$watch('model.selectedObjective', function(){
        $scope.resetDataView();

        if( $scope.model.piapResultsChain && $scope.model.piapResultsChain.code ){
//            $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;
        }

        $scope.model.selectedIntervention = null;
        if( angular.isObject($scope.model.selectedObjective) ){
            if( $scope.model.selectedObjective && $scope.model.selectedObjective.code ){
//                $scope.model.interventions = $filter('startsWith')($scope.model.interventions, {code: $scope.model.selectedObjective.code});
            }
        }
    });

    $scope.$watch('model.selectedIntervention', function(){
        $scope.resetDataView();

        $scope.model.dataElementsById = [];
        $scope.model.dataElementGroups = [];
        $scope.model.selectedDataElementGroupSets = [];
    });

    $scope.$watch('model.selectedCluster', function(){
        $scope.resetDataView();
    });

    $scope.getBasePeriod = function(){
        $scope.model.basePeriod = null;
        var location = -1;

        var getBase = function(){
            $scope.model.selectedPeriods = orderByFilter( $scope.model.selectedPeriods, '-id').reverse();
            if($scope.model.selectedPeriods.length>0){
            var p = $scope.model.selectedPeriods[0];
            if(p!=null){
            var res = PeriodService.getPreviousPeriod( p.id, $scope.model.allPeriods );
                        $scope.model.basePeriod = res.period;
                        location = res.location;
            }
            }
        };

        getBase();

        if( location === 0 ){
            $scope.getPeriods('PREV');
            getBase();
        }
    };

    DataStoreService.getAppConfig().then(function( appConfig ){
        $scope.model.periodSettings = appConfig.period;
        $scope.model.trafficLightConfig = appConfig.trafficLight;

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

            $scope.model.piapResultsChain = $filter('getFirst')($scope.model.optionSets, {code: 'piapResultsChain'});

            if( !$scope.model.piapResultsChain || !$scope.model.piapResultsChain.code || !$scope.model.piapResultsChain.options || $scope.model.piapResultsChain.options.length < 1 ){
                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_piap_results_chain_configuration"));
                return;
            }

            ResulstChainService.getByOptionSet( $scope.model.piapResultsChain.id ).then(function(chain){
                $scope.model.resultsFrameworkChain = chain;

                $scope.model.ndpProgrammes = $scope.model.resultsFrameworkChain.programs;
                $scope.model.subProgrammes = $scope.model.resultsFrameworkChain.subPrograms;
                $scope.model.piapObjectives = $scope.model.resultsFrameworkChain.objectives;
//              $scope.model.interventions = $scope.model.resultsFrameworkChain.interventions;

                MetaDataFactory.getAll('optionGroupSets').then(function(optionGroupSets){

                    $scope.model.optionGroupSets = optionGroupSets;

                    OptionComboService.getBtaDimensions().then(function( response ){

                        if( !response || !response.bta || !response.baseline || !response.actual || !response.target ){
                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_bta_dimensions"));
                            return;
                        }

                        $scope.model.bta = response.bta;
                        $scope.model.baseLineTargetActualDimensions = $.map($scope.model.bta.options, function(d){return d.id;});
                        $scope.model.actualDimension = response.actual;
                        $scope.model.targetDimension = response.target;
                        $scope.model.baselineDimension = response.baseline;

                        var periods = PeriodService.getPeriods($scope.model.selectedPeriodType, $scope.model.periodOffset, $scope.model.openFuturePeriods);
                        $scope.model.allPeriods = angular.copy( periods );
                        $scope.model.periods = periods;

                        var cfg = $scope.model.periodSettings;

                        // pick active layout
                        var layoutKey = cfg.activeLayout || 'option2';
                        var layout = cfg.layouts && cfg.layouts[layoutKey];

                        // fallback if layout missing
                        if (!layout || !layout.columns || !layout.columns.length) {
                            layout = { columns: [] };
                            // as a safe fallback, use baselineYear + planYears if available
                            if (cfg.baselineYear) layout.columns.push({ year: cfg.baselineYear, role: 'baseline' });
                            if (cfg.planYears && cfg.planYears.length) {
                                cfg.planYears.forEach(function(y){ layout.columns.push({ year: y, role: 'actual' }); });
                            }
                        }

                        // unique years from columns
                        var yearsMap = {};
                        layout.columns.forEach(function(c){ yearsMap[c.year] = true; });

                        var selectedPeriodNames = Object.keys(yearsMap)   // ['2022','2023',...]
                            .sort()
                            .map(function(y){ return String(y); });

                        // reset selectedPeriods
                        $scope.model.selectedPeriods = [];

                        angular.forEach($scope.model.periods, function(pe){
                            if (selectedPeriodNames.indexOf(pe.name) > -1) {
                                $scope.model.selectedPeriods.push(pe);
                            }
                        });

                        $scope.model.metaDataCached = true;
                        $scope.populateMenu();
                        $scope.model.performanceOverviewLegends = CommonUtils.getPerformanceOverviewHeaders($scope.model.trafficLightConfig);

                    });
                });
            });
        });
    });

    $scope.populateMenu = function(){

        $scope.resetDataView();
        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
        $scope.model.selectedNdpProgram = null;

        if( $scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code ){
            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, {ndp: $scope.model.selectedMenu.ndp}, true);
        }

        var sectorsOpgs = $filter('getFirst')($scope.model.optionGroupSets, {code: $scope.model.selectedMenu.ndp + '_CLUSTER'});

//        $scope.model.clusters = sectorsOpgs && sectorsOpgs.optionGroups ? sectorsOpgs.optionGroups : [];
//        if( !$scope.model.clusters || !$scope.model.clusters.length || !$scope.model.clusters.length === 0 ){
//            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster_configuration"));
//            return;
//        }
    };

    $scope.resetDataView = function(){
        $scope.model.data = null;
        $scope.model.clusterData = null;
        $scope.model.reportReady = false;
        $scope.model.clusterReportReady = false;
        $scope.model.dataExists = false;
        $scope.model.dataHeaders = [];
        $scope.model.showExplanation = false;
        $scope.model.hasCommentPerformanceData = false;
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

        var selectedResultsLevel = $scope.model.selectedNdpProgram.code;

        if ( $scope.model.selectedSubProgramme && $scope.model.selectedSubProgramme.code ){
            selectedResultsLevel = $scope.model.selectedSubProgramme.code;
        }

        if ( $scope.model.selectedObjective && $scope.model.selectedObjective.code ){
            selectedResultsLevel = $scope.model.selectedObjective.code;
        }

//        if ( $scope.model.selectedIntervention && $scope.model.selectedIntervention.code ){
//            selectedResultsLevel = $scope.model.selectedIntervention.code;
//        }

        $scope.model.reportReady = false;
        $scope.model.reportStarted = true;

        $rootScope.DHIS2URL = env.dhisConfig.apiRoot;

        dhis2.ndp.downloadGroupSets( 'sub-intervention', selectedResultsLevel ).then(function(){

            MetaDataFactory.getAll('dataElements').then(function(dataElements){

                $scope.model.dataElementsById = dataElements.reduce( function(map, obj){
                    map[obj.id] = obj;
                    return map;
                }, {});

                MetaDataFactory.getDataElementGroups().then(function(dataElementGroups){

                    $scope.model.allDataElementGroups = dataElementGroups;
                    $scope.model.dataElementGroups = dataElementGroups;

                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sub-intervention').then(function(dataElementGroupSets){
                        $scope.model.dataElementGroupSets = dataElementGroupSets;

                        $scope.model.metaDataCached = true;

//                        if( $scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code ){
//                            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, {ndp: $scope.model.selectedMenu.ndp}, true);
//                        }

//                        $scope.model.selectedDataElementGroupSets = $filter('startsWith')($scope.model.dataElementGroupSets, {code: selectedResultsLevel});
//                        $scope.model.selectedDataElementGroupSets = $filter('startsWith')($scope.model.dataElementGroupSets, {code: selectedResultsLevel});

                        $scope.model.selectedDataElementGroupSets= dataElementGroupSets;
                        $scope.getOutputs();

                        if( !$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id ){
                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
                            return;
                        }

                        if( $scope.model.dataElementGroup.length === 0 || !$scope.model.dataElementGroup ){
                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_output"));
                            return;
                        }

                        $scope.getBasePeriod();

                        if ( !$scope.model.basePeriod || !$scope.model.basePeriod.id ){
                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("invalid_base_period"));
                            return;
                        }

                        if( $scope.model.dataElementGroup && $scope.model.dataElementGroup.length > 0 && $scope.model.selectedPeriods.length > 0){
                            analyticsUrl += '&filter=ou:'+ $scope.selectedOrgUnit.id +'&displayProperty=NAME&includeMetadataDetails=true';
                            analyticsUrl += '&dimension=co&dimension=' + $scope.model.bta.category + ':' + $.map($scope.model.baseLineTargetActualDimensions, function(dm){return dm;}).join(';');
                            analyticsUrl += '&dimension=pe:' + $.map($scope.model.selectedPeriods.concat( $scope.model.basePeriod ), function(pe){return pe.id;}).join(';');

                            var pHeaders = CommonUtils.getPerformanceOverviewHeaders($scope.model.trafficLightConfig);
                            $scope.model.pHeadersLength = pHeaders.length;
                            var prds = orderByFilter( $scope.model.selectedPeriods, '-id').reverse();
                            $scope.model.performanceOverviewHeaders = [];
                            angular.forEach(prds, function(pe){
                                angular.forEach( pHeaders, function(p){
                                    var h = angular.copy( p );
                                    h.period = pe.id;
                                    $scope.model.performanceOverviewHeaders.push( h );
                                });
                            });

                            $scope.model.dataElementGroupsById = $scope.model.dataElementGroup.reduce( function(map, obj){
                                map[obj.id] = obj;
                                return map;
                            }, {});

                            var des = [];
                            angular.forEach($scope.model.dataElementGroup, function(deg){
                                des.push('DE_GROUP-' + deg.id);
                            });
                            analyticsUrl += '&dimension=dx:' + des.join(';');

                            Analytics.getData(analyticsUrl, {
                                commentConfig: {
                                    orgUnitId: $scope.selectedOrgUnit.id,
                                    selectedPeriods: $scope.model.selectedPeriods,
                                    dataElementGroups: $scope.model.dataElementGroup,
                                    dimensionCategoryId: $scope.model.bta.category
                                }
                            }).then(function(data){
                                if( data && data.data && data.metaData ){
                                    $scope.model.data = data.data;
                                    $scope.model.metaData = data.metaData;
                                    $scope.model.reportReady = true;
                                    $scope.model.reportStarted = false;

                                    var dataParams = {
                                        data: data.data,
                                        metaData: data.metaData,
                                        reportPeriods: angular.copy( $scope.model.selectedPeriods ),
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
                                        displayActionBudgetData: false,
                                        periodSettings: $scope.model.periodSettings,
                                        trafficLightConfig: $scope.model.trafficLightConfig,
                                        commentDataValues: data.commentDataValues || []
                                    };

                                    var processedData = Analytics.processData( dataParams );
                                    $scope.model.dataHeaders = processedData.dataHeaders;
                                    $scope.model.reportPeriods = processedData.reportPeriods;
                                    $scope.model.dataExists = processedData.dataExists;
                                    $scope.model.selectedDataElementGroupSets = processedData.selectedDataElementGroupSets;
                                    $scope.model.hasPhysicalPerformanceData = processedData.hasPhysicalPerformanceData;
                                    $scope.model.hasCommentPerformanceData = processedData.hasCommentPerformanceData;
                                    $scope.model.numerator = processedData.completenessNum;
                                    $scope.model.denominator = processedData.completenessDen;
                                    $scope.model.dataElementRowIndex = processedData.dataElementRowIndex;
                                    $scope.model.tableRows = processedData.tableRows;
                                    $scope.model.povTableRows = processedData.povTableRows;
                                    $scope.model.commentDataValues = processedData.commentDataValues || [];
                                }
                            });
                        }
                    });
                });
            });
        });
    };

    $scope.getClusterData = function(){

        if( !$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id ){
            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
            return;
        }

//        if( !$scope.model.selectedCluster || !$scope.model.selectedCluster.options || !$scope.model.selectedCluster.options.length ){
//            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
//            return;
//        }

        if( !$scope.model.selectedFiscalYear ){
            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_fiscal_year"));
            return;
        }

        $scope.model.clusterReportReady = false;
        $scope.model.clusterReportStarted = true;
        $scope.model.reportReady = false;
        $scope.model.reportStarted = true;

        dhis2.ndp.downloadGroupSets( 'sub-intervention' ).then(function(){
            MetaDataFactory.getAll('dataElements').then(function(dataElements){

                $scope.model.dataElementsById = dataElements.reduce( function(map, obj){
                    map[obj.id] = obj;
                    return map;
                }, {});

                MetaDataFactory.getDataElementGroups().then(function(dataElementGroups){

                    $scope.model.allDataElementGroups = dataElementGroups;
                    $scope.model.dataElementGroups = dataElementGroups;

                    MetaDataFactory.getAllByProperty('dataElementGroupSets', 'indicatorGroupSetType', 'sub-intervention').then(function(dataElementGroupSets){

                        $scope.model.dataElementGroupSets = dataElementGroupSets;

                        $scope.model.metaDataCached = true;

//                        if( $scope.model.selectedMenu && $scope.model.selectedMenu.ndp && $scope.model.selectedMenu.code ){
//                            $scope.model.dataElementGroupSets = $filter('filter')($scope.model.dataElementGroupSets, {ndp: $scope.model.selectedMenu.ndp}, true);
//                        }

                        $scope.model.selectedDataElementGroupSets = angular.copy($scope.model.dataElementGroupSets);

                        $scope.getOutputs();

                        if( !$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id ){
                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_vote"));
                            return;
                        }

                        if( !$scope.model.selectedCluster || !$scope.model.selectedCluster.options || !$scope.model.selectedCluster.options.length ){
                            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("missing_cluster"));
                            return;
                        }

                        if( !$scope.model.selectedFiscalYear ){
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

                        ClusterDataService.getData( params ).then(function(result){
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

    function appendCommentsToPerformanceExport(exportElement, commentDataValues) {
        var table = exportElement.querySelector('table');
        var exportRows = $filter('emptyRowFilter')($scope.model.tableRows, $scope.model.hideEmptyRows);
        var tableRows = exportElement.querySelectorAll('tbody tr');
        var headerRows = table ? table.querySelectorAll('thead tr') : [];

        if (headerRows.length > 0) {
            var headerCell = exportElement.ownerDocument.createElement('th');
            headerCell.setAttribute('rowspan', '2');
            headerCell.appendChild(exportElement.ownerDocument.createTextNode('Comments'));
            headerRows[0].appendChild(headerCell);
        }

        angular.forEach(exportRows, function(row, rowIndex){
            var rowElement = tableRows[rowIndex];
            var rowComments = [];
            var seenCommentKeys = {};
            if (!rowElement) {
                return;
            }

            angular.forEach($scope.model.dataHeaders, function(dh){
                if (dh.dimensionId !== $scope.model.actualDimension.id) {
                    return;
                }

                var attributeOptionComboId = DataStoreService.resolveAttributeOptionComboId(
                    $scope.model.bta.categoryCombo,
                    dh.dimensionId
                );
                var commentDataValue = ReportCommentService.findMatchingComment(
                    commentDataValues,
                    row.dataElementId,
                    dh.periodId,
                    row.categoryOptionComboId,
                    attributeOptionComboId
                );
                var comment = commentDataValue && commentDataValue.comment;

                var seenCommentKey = commentDataValue && [
                    commentDataValue.dataElementId,
                    commentDataValue.periodId,
                    commentDataValue.categoryOptionComboId,
                    commentDataValue.attributeOptionComboId
                ].join('.');

                if (!comment || seenCommentKeys[seenCommentKey]) {
                    return;
                }
                seenCommentKeys[seenCommentKey] = true;
                rowComments.push({
                    orgUnit: $scope.selectedOrgUnit.id,
                    dataElement: commentDataValue.dataElementId || row.dataElementId,
                    period: commentDataValue.periodId || dh.periodId,
                    categoryOptionCombo: commentDataValue.categoryOptionComboId || row.categoryOptionComboId,
                    attributeOptionCombo: commentDataValue.attributeOptionComboId || attributeOptionComboId,
                    explanation: comment.explanation || '',
                    attachment: comment.attachment || []
                });
            });

            var commentCell = exportElement.ownerDocument.createElement('td');
            commentCell.appendChild(
                exportElement.ownerDocument.createTextNode(rowComments.length ? JSON.stringify(rowComments) : '')
            );
            rowElement.appendChild(commentCell);
        });
    }

    function exportBlobFromElement(name, exportElement) {
        angular.forEach(exportElement.querySelectorAll('.hideInPrint'), function(node){
            if (node && node.parentNode) {
                node.parentNode.removeChild(node);
            }
        });

        var blob = new Blob([exportElement.innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });

        var reportName = $scope.model.selectedNdpProgram.displayName + " - output";

        if ( name ) {
            reportName += " - " + name;
        }

        reportName += ".xls";

        window.saveAs(blob, reportName);
    }

    $scope.exportData = function ( name ) {
        var exportElement = document.getElementById(name);
        if (!exportElement) {
            return;
        }

        if (name === 'performance') {
            var clonedElement = exportElement.cloneNode(true);
            appendCommentsToPerformanceExport(clonedElement, $scope.model.commentDataValues || []);
            exportBlobFromElement(name, clonedElement);
            return;
        }

        exportBlobFromElement(name, exportElement.cloneNode(true));
    };

    $scope.getIndicatorDictionary = function(item) {
        var modalInstance = $modal.open({
            templateUrl: 'components/dictionary/details-modal.html',
            controller: 'DictionaryDetailsController',
            resolve: {
                dictionaryItem: function(){
                    return item;
                },
                fullFetched: function(){
                    return false;
                }
            }
        });

        modalInstance.result.then(function () {

        });
    };

    $scope.getExplanations = function(){
        $scope.model.showExplanation = !$scope.model.showExplanation;
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

    $scope.getValueComment = function (row, header, $event) {
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }

        var cell = row.commentCells && row.commentCells[header.dimensionId + '.' + header.periodId];
        if (!cell) {
            return;
        }

        $modal.open({
            templateUrl: 'components/explanation/value-comment-modal.html',
            controller: 'ValueCommentController',
            windowClass: 'comment-modal-window',
            resolve: {
                item: function () {
                    return {
                        comment: cell.comment,
                        dataElementName: row.dataElement,
                        periodId: cell.periodId || header.periodId,
                        value: row.values[header.dimensionId + '.' + header.periodId]
                    };
                }
            }
        });
    };

    $scope.getCoverage = function(numerator, denominator){
        return CommonUtils.getPercent(numerator, denominator, false, true);
    };

    $scope.getHeaderClass = function(header){
        return header.style;
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
