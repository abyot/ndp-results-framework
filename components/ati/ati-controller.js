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
            allDataElementGroups: [],
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
            defaultPeriodType: 'Yearly',
            hierarchySelectors: [],
            selectedTrace: null,
            showBusinessTrace: false
        };

    var SEGMENT_LABELS = {
        MA: 'mandate_area',
        SO: 'strategic_objective',
        PG: 'program',
        PJ: 'project',
        GO: 'goal',
        OC: 'outcome',
        OP: 'output',
        WS: 'workstream',
        AT: 'activity'
    };

    var MENU_SELECTOR_TYPES = {
        MNA: [],
        SOB: [],
        PRG: ['PG'],
        PRC: ['PG', 'GO'],
        PRP: ['PG', 'GO', 'OC'],
        PJG: ['PJ'],
        PJC: ['PJ', 'GO'],
        PJP: ['PJ', 'GO', 'OC'],
        PJW: ['PJ', 'GO', 'OC', 'OP'],
        PJA: ['PJ', 'GO', 'OC', 'OP', 'WS']
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

                MetaDataFactory.getAll('dataElementGroups').then(function(dataElementGroups){
                    $scope.model.allDataElementGroups = normalizeGroups(dataElementGroups || []);

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
    });

    function applyDefaultSelectionLogic(){
        // Default selection logic
        if ($scope.model.dataElementGroups.length === 1) {
            // if one item exists selected by default
            $scope.model.selectedDataElementGroup = $scope.model.dataElementGroups[0];
        } else if( !$scope.model.selectedDataElementGroup ) {
            $scope.model.selectedDataElementGroup = null;
        } 
    }

    function getAttributeValue(item, code){
        if( !item || !item.attributeValues ){
            return null;
        }

        for( var i = 0; i < item.attributeValues.length; i++ ){
            var attribute = item.attributeValues[i].attribute || {};
            if( attribute.code && attribute.code.trim() === code ){
                return item.attributeValues[i].value;
            }
        }

        return null;
    }

    function normalizeGroups(groups){
        angular.forEach(groups, function(group){
            group.resultLevel = group.resultLevel || getAttributeValue(group, 'resultLevel');
            group.program = group.program || getAttributeValue(group, 'program');
            group.project = group.project || getAttributeValue(group, 'project');
            group.resultsFrameworkCode = group.resultsFrameworkCode || getAttributeValue(group, 'resultsFrameworkCode');
        });

        decorateActivityGroups(groups);

        return groups;
    }

    function padSegmentNumber(value){
        return ('000' + value).slice(-3);
    }

    function normalizeComparableLabel(name){
        if( !name ){
            return '';
        }

        return name
            .replace(/_ACTIVITY_/ig, '_')
            .replace(/ACTIVITY_/ig, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function decorateActivityGroups(groups){
        var groupsById = {};
        var membershipsByDataElement = {};

        angular.forEach(groups || [], function(group){
            groupsById[group.id] = group;
            angular.forEach(group.dataElements || [], function(de){
                membershipsByDataElement[de.id] = membershipsByDataElement[de.id] || [];
                membershipsByDataElement[de.id].push(group);
            });
        });

        var activityGroups = (groups || []).filter(function(group){
            return group.resultLevel === 'PJA';
        });

        var activityGroupsByParent = {};

        angular.forEach(activityGroups, function(activityGroup){
            if( activityGroup.resultsFrameworkCode ){
                return;
            }

            var candidateCounts = {};
            var candidateGroups = {};

            angular.forEach(activityGroup.dataElements || [], function(de){
                angular.forEach(membershipsByDataElement[de.id] || [], function(parentCandidate){
                    if( parentCandidate.id === activityGroup.id || parentCandidate.resultLevel !== 'PJW' ){
                        return;
                    }

                    candidateCounts[parentCandidate.id] = (candidateCounts[parentCandidate.id] || 0) + 1;
                    candidateGroups[parentCandidate.id] = parentCandidate;
                });
            });

            var candidates = Object.keys(candidateGroups).map(function(id){
                return candidateGroups[id];
            });

            if( !candidates.length ){
                return;
            }

            var normalizedActivity = normalizeComparableLabel(activityGroup.displayName);
            candidates.sort(function(a, b){
                var aScore = candidateCounts[a.id] || 0;
                var bScore = candidateCounts[b.id] || 0;
                var aName = normalizeComparableLabel(a.displayName);
                var bName = normalizeComparableLabel(b.displayName);

                if( normalizedActivity === aName ){
                    aScore += 1000;
                }
                if( normalizedActivity === bName ){
                    bScore += 1000;
                }

                if( bScore !== aScore ){
                    return bScore - aScore;
                }

                return (a.displayName || '').localeCompare(b.displayName || '');
            });

            var parentWorkstream = candidates[0];
            if( !parentWorkstream || !parentWorkstream.resultsFrameworkCode ){
                return;
            }

            activityGroup.parentWorkstreamId = parentWorkstream.id;
            activityGroup.parentWorkstreamName = parentWorkstream.displayName;
            activityGroupsByParent[parentWorkstream.resultsFrameworkCode] = activityGroupsByParent[parentWorkstream.resultsFrameworkCode] || [];
            activityGroupsByParent[parentWorkstream.resultsFrameworkCode].push(activityGroup);
        });

        angular.forEach(Object.keys(activityGroupsByParent), function(parentCode){
            var siblings = activityGroupsByParent[parentCode];
            siblings.sort(function(a, b){
                return (a.displayName || '').localeCompare(b.displayName || '');
            });

            angular.forEach(siblings, function(activityGroup, index){
                activityGroup.resultsFrameworkCode = parentCode + '-AT' + padSegmentNumber(index + 1);
            });
        });
    }

    function splitFrameworkCode(code){
        return code ? code.split('-') : [];
    }

    function segmentType(segment){
        return segment ? segment.substring(0, 2) : '';
    }

    function getAncestorCode(code, type){
        var segments = splitFrameworkCode(code);
        if( !segments.length ){
            return '';
        }

        var path = [];
        for( var i = 0; i < segments.length; i++ ){
            path.push(segments[i]);
            if( segmentType(segments[i]) === type ){
                return path.join('-');
            }
        }

        return '';
    }

    function sortByFrameworkCode(groups){
        return (groups || []).slice().sort(function(a, b){
            return (a.resultsFrameworkCode || '').localeCompare(b.resultsFrameworkCode || '');
        });
    }

    function codeToGroupMap(){
        var byCode = {};
        angular.forEach($scope.model.allDataElementGroups || [], function(group){
            if( group.resultsFrameworkCode ){
                byCode[group.resultsFrameworkCode] = group;
            }
        });
        return byCode;
    }

    function getSelectorDisplayName(type, groups, ancestorCode, codeMap){
        var sample = groups && groups.length ? groups[0] : null;
        if( type === 'PG' ){
            return sample && sample.program ? sample.program : ancestorCode;
        }
        if( type === 'PJ' ){
            return sample && sample.project ? sample.project : ancestorCode;
        }

        var ancestorGroup = codeMap[ancestorCode];
        return ancestorGroup && ancestorGroup.displayName ? ancestorGroup.displayName : ancestorCode;
    }

    function selectorDefinitionsForMenu(menuId){
        var types = MENU_SELECTOR_TYPES[menuId] || [];
        return types.map(function(type){
            return {
                type: type,
                labelKey: SEGMENT_LABELS[type],
                options: [],
                selected: null
            };
        });
    }

    function buildSelectorOptions(type, groups, codeMap){
        var byCode = {};
        angular.forEach(groups || [], function(group){
            var ancestorCode = getAncestorCode(group.resultsFrameworkCode, type);
            if( ancestorCode ){
                byCode[ancestorCode] = byCode[ancestorCode] || [];
                byCode[ancestorCode].push(group);
            }
        });

        return Object.keys(byCode).sort().map(function(ancestorCode){
            return {
                code: ancestorCode,
                displayName: getSelectorDisplayName(type, byCode[ancestorCode], ancestorCode, codeMap)
            };
        });
    }

    function applyHierarchySelectionFilters(){
        $scope.resetDataView();

        var filteredGroups = sortByFrameworkCode($scope.model._allGroupsForMenu || []);
        var selectors = $scope.model.hierarchySelectors || [];
        var codeMap = codeToGroupMap();

        angular.forEach(selectors, function(selector){
            selector.options = buildSelectorOptions(selector.type, filteredGroups, codeMap);

            var current = selector.selected && selector.selected.code;
            var matching = selector.options.filter(function(option){
                return option.code === current;
            });
            selector.selected = matching.length ? matching[0] : (selector.options.length === 1 ? selector.options[0] : null);

            if( selector.selected ){
                filteredGroups = filteredGroups.filter(function(group){
                    return getAncestorCode(group.resultsFrameworkCode, selector.type) === selector.selected.code;
                });
            }
        });

        $scope.model.dataElementGroups = filteredGroups;

        if( $scope.model.selectedDataElementGroup ){
            var exists = filteredGroups.some(function(group){ return group.id === $scope.model.selectedDataElementGroup.id; });
            if( !exists ){
                $scope.model.selectedDataElementGroup = null;
            }
        }

        applyDefaultSelectionLogic();
        refreshSelectedTrace();
    }

    function refreshSelectedTrace(){
        var selectedGroup = $scope.model.selectedDataElementGroup;
        if( !selectedGroup || !selectedGroup.resultsFrameworkCode ){
            $scope.model.selectedTrace = null;
            return;
        }

        var codeMap = codeToGroupMap();
        var segments = splitFrameworkCode(selectedGroup.resultsFrameworkCode);
        var path = [];
        var accumulated = [];

        angular.forEach(segments, function(segment){
            accumulated.push(segment);
            var code = accumulated.join('-');
            var type = segmentType(segment);
            var group = codeMap[code];
            var label = getSelectorDisplayName(type, [selectedGroup], code, codeMap);
            if( group && group.displayName ){
                label = group.displayName;
            }
            path.push({
                type: type,
                code: code,
                labelKey: SEGMENT_LABELS[type] || '',
                displayName: label
            });
        });

        $scope.model.selectedTrace = {
            shortPath: path,
            fullPath: path
        };
    }

    function buildHierarchyContext(group){
        var context = {
            goalName: '',
            outcomeName: '',
            outputName: '',
            workstreamName: ''
        };

        if( !group || !group.resultsFrameworkCode ){
            return context;
        }

        var codeMap = codeToGroupMap();
        var segments = splitFrameworkCode(group.resultsFrameworkCode);
        var accumulated = [];

        angular.forEach(segments, function(segment){
            accumulated.push(segment);
            var code = accumulated.join('-');
            var type = segmentType(segment);
            var node = codeMap[code];

            if( !node || !node.displayName ){
                return;
            }

            if( type === 'GO' ){
                context.goalName = node.displayName;
            }
            else if( type === 'OC' ){
                context.outcomeName = node.displayName;
            }
            else if( type === 'OP' ){
                context.outputName = node.displayName;
            }
            else if( type === 'WS' ){
                context.workstreamName = node.displayName;
            }
        });

        return context;
    }

    function menuColumns(menuId){
        var byMenu = {
            PRC: ['goal'],
            PRP: ['goal', 'outcome'],
            PJC: ['goal'],
            PJP: ['goal', 'outcome'],
            PJW: ['goal', 'outcome', 'output'],
            PJA: ['goal', 'outcome', 'output', 'workstream']
        };

        return byMenu[menuId] || [];
    }

    function currentLevelColumnLabel(menuId){
        var byMenu = {
            PRP: 'output',
            PJP: 'output',
            PJW: 'workstream',
            PJA: 'activity',
            PRC: 'outcome',
            PJC: 'outcome',
            PRG: 'goal',
            PJG: 'goal'
        };

        return byMenu[menuId] || null;
    }

    function ownerColumnLabel(menuId, fallback){
        var byMenu = {
            PRG: 'program',
            PRC: 'program',
            PRP: 'program',
            PJG: 'project',
            PJC: 'project',
            PJP: 'project',
            PJW: 'project',
            PJA: 'project'
        };

        return byMenu[menuId] || fallback;
    }

    function sanitizeExportFilenamePart(value){
        return (value || '')
            .replace(/[\\/:*?"<>|]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function buildAtiExportFilename(){
        var menuName = sanitizeExportFilenamePart(
            $translate.instant($scope.model.selectedMenu && $scope.model.selectedMenu.displayName
                ? $scope.model.selectedMenu.displayName
                : 'ATI Report')
        ) || 'ATI Report';

        var periods = ($scope.model.selectedPeriods || []).slice().sort(function(a, b){
            return String(a.id || '').localeCompare(String(b.id || ''));
        });

        var periodPart = '';
        if( periods.length === 1 ){
            periodPart = sanitizeExportFilenamePart(periods[0].name);
        }
        else if( periods.length > 1 ){
            periodPart = sanitizeExportFilenamePart(periods[0].name + ' to ' + periods[periods.length - 1].name);
        }

        return sanitizeExportFilenamePart(
            periodPart
                ? ('ATI ' + menuName + ' ' + periodPart)
                : ('ATI ' + menuName)
        ) + '.xls';
    }

    function extraColumnToField(column){
        var byColumn = {
            goal: 'goalName',
            outcome: 'outcomeName',
            output: 'outputName',
            workstream: 'workstreamName'
        };

        return byColumn[column];
    }

    function applyHierarchicalRowSpans(rows){
        if( !rows || !rows.length ){
            return;
        }

        var hierarchyFields = [];
        if( $scope.model.selectedMenu && $scope.model.selectedMenu.hasThematicArea ){
            hierarchyFields.push('ownerName');
        }

        angular.forEach($scope.model.extraColumns || [], function(column){
            var field = extraColumnToField(column);
            if( field ){
                hierarchyFields.push(field);
            }
        });

        hierarchyFields.push('parent');

        angular.forEach(hierarchyFields, function(field, fieldIndex){
            for( var i = 0; i < rows.length; ){
                var span = 1;
                var current = rows[i][field] || '';

                for( var j = i + 1; j < rows.length; j++ ){
                    var matches = true;

                    for( var p = 0; p < fieldIndex; p++ ){
                        var previousField = hierarchyFields[p];
                        if( (rows[j][previousField] || '') !== (rows[i][previousField] || '') ){
                            matches = false;
                            break;
                        }
                    }

                    if( !matches || (rows[j][field] || '') !== current ){
                        break;
                    }

                    span++;
                }

                rows[i][field + 'RowSpan'] = span;
                for( var k = i + 1; k < i + span; k++ ){
                    rows[k][field + 'RowSpan'] = 0;
                }

                i += span;
            }
        });
    }

    $scope.populateMenu = function(){
        $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();
        if ( $scope.model.selectedMenu && $scope.model.selectedMenu.id ){
            $scope.model.horizontalMenus = [
                {id: 'target', title: 'home', order: 1, view: 'components/ati/results.html', active: true, class: 'main-horizontal-menu'},
            ];

            $scope.model.selectedPeriods = [];
            $scope.model.selectedPeriodType = $scope.model.selectedMenu.periodType ? $scope.model.selectedMenu.periodType : $scope.model.defaultPeriodType;
            $scope.model.extraColumns = menuColumns($scope.model.selectedMenu.id);
            $scope.model.currentLevelColumnLabel = currentLevelColumnLabel($scope.model.selectedMenu.id);
            $scope.model.ownerColumnLabel = ownerColumnLabel($scope.model.selectedMenu.id, $scope.model.selectedMenu.thematicArea);

            $scope.model.hierarchySelectors = selectorDefinitionsForMenu($scope.model.selectedMenu.id);

            var allGroups = normalizeGroups($scope.model.allDataElementGroups || []);
            $scope.model._allGroupsForMenu = sortByFrameworkCode(allGroups.filter(function(group){
                return group.resultLevel === $scope.model.selectedMenu.id && group.resultsFrameworkCode;
            }));
            $scope.model.dataElementGroups = $scope.model._allGroupsForMenu;

            applyHierarchySelectionFilters();

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
        }
    };

    $scope.applyHierarchyFilter = function(){
        applyHierarchySelectionFilters();
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
            var selectedContext = buildHierarchyContext($scope.model.selectedDataElementGroup);
            angular.forEach($scope.model.selectedDataElementGroup.dataElements, function(de){
                var _de = angular.copy($scope.model.dataElementsById[de.id]);
                _de.parent = $scope.model.selectedDataElementGroup.displayName;
                _de.ownerName = $scope.model.selectedDataElementGroup.project ? $scope.model.selectedDataElementGroup.project : ($scope.model.selectedDataElementGroup.program ? $scope.model.selectedDataElementGroup.program : '');
                _de.goalName = selectedContext.goalName;
                _de.outcomeName = selectedContext.outcomeName;
                _de.outputName = selectedContext.outputName;
                _de.workstreamName = selectedContext.workstreamName;
                _de.parentId = $scope.model.selectedDataElementGroup.id;
                _de.parentKey = _de.id + '|' + _de.parentId;
                if( seen.indexOf(_de.parentKey) !== -1){
                    //console.log('_de: ', _de);
                }
                else{
                    seen.push( _de.parentKey );
                    $scope.model.dataElements.push( _de );
                }
            });
        }
        else {       
            angular.forEach($scope.model.dataElementGroups, function(deg){
                des.push('DE_GROUP-' + deg.id);
                var context = buildHierarchyContext(deg);
                angular.forEach(deg.dataElements, function(de){
                    var _de = angular.copy($scope.model.dataElementsById[de.id]);
                    _de.parent = deg.displayName;
                    _de.ownerName = deg.project ? deg.project : (deg.program ? deg.program : '');
                    _de.goalName = context.goalName;
                    _de.outcomeName = context.outcomeName;
                    _de.outputName = context.outputName;
                    _de.workstreamName = context.workstreamName;
                    _de.parentId = deg.id;
                    _de.parentKey = _de.id + '|' + _de.parentId;
                    if( seen.indexOf(_de.parentKey) !== -1){
                        //console.log('_de: ', _de);
                    }
                    else{
                        seen.push( _de.parentKey );
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

        applyHierarchicalRowSpans($scope.model.dataElements);

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

    function tlStyleFromClass(cssClass) {
        var style = {
            'font-weight': 600,
            'padding': '4px 6px'
        };

        if (cssClass === 'tl-green') {
            style['background-color'] = '#339D73';
            style.color = '#fff';
            style['box-shadow'] = 'inset 0 0 0 9999px #339D73';
        }
        else if (cssClass === 'tl-amber') {
            style['background-color'] = '#F4CD4D';
            style.color = '#000';
            style['box-shadow'] = 'inset 0 0 0 9999px #F4CD4D';
        }
        else if (cssClass === 'tl-red') {
            style['background-color'] = '#CD615A';
            style.color = '#fff';
            style['box-shadow'] = 'inset 0 0 0 9999px #CD615A';
        }

        return style;
    }

    $scope.tlStyle = function (val) {
        return tlStyleFromClass($scope.tlClass(val));
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

    $scope.statusTlStyle = function (status) {
        return tlStyleFromClass($scope.statusTlClass(status));
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

        var tableClone = table.cloneNode(true);
        var sourceNodes = table.querySelectorAll('th, td');
        var cloneNodes = tableClone.querySelectorAll('th, td');

        angular.forEach(cloneNodes, function (cell, index) {
            var sourceCell = sourceNodes[index];
            if (!sourceCell) {
                return;
            }

            var computed = window.getComputedStyle(sourceCell);
            var inlineStyle = [
                'background-color:' + computed.backgroundColor,
                'color:' + computed.color,
                'font-weight:' + computed.fontWeight,
                'text-align:' + computed.textAlign,
                'vertical-align:' + computed.verticalAlign,
                'border-top:' + computed.borderTopWidth + ' ' + computed.borderTopStyle + ' ' + computed.borderTopColor,
                'border-right:' + computed.borderRightWidth + ' ' + computed.borderRightStyle + ' ' + computed.borderRightColor,
                'border-bottom:' + computed.borderBottomWidth + ' ' + computed.borderBottomStyle + ' ' + computed.borderBottomColor,
                'border-left:' + computed.borderLeftWidth + ' ' + computed.borderLeftStyle + ' ' + computed.borderLeftColor,
                'padding:' + computed.paddingTop + ' ' + computed.paddingRight + ' ' + computed.paddingBottom + ' ' + computed.paddingLeft,
                'white-space:' + computed.whiteSpace
            ].join(';');

            cell.setAttribute('style', inlineStyle);
        });

        var exportStyles = [
            'table{border-collapse:collapse;width:100%;font-family:Cambria, Georgia, serif;font-size:12pt;}',
            'th,td{border:1px solid #cad5e5;padding:5px;vertical-align:middle;}',
            'th{background:#bbd1ee;color:#333;font-weight:bold;}',
            'tr:nth-child(even) td{background-color:#f2f2f2;}',
            '.tl-cell{font-weight:600;padding:4px 6px;}',
            '.tl-green{background-color:#339D73 !important;color:#fff !important;}',
            '.tl-amber{background-color:#F4CD4D !important;color:#000 !important;}',
            '.tl-red{background-color:#CD615A !important;color:#fff !important;}'
        ].join('');

        var html = [
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">',
            '<head><meta charset="utf-8" /><style>',
            exportStyles,
            '</style></head><body>',
            tableClone.outerHTML,
            '</body></html>'
        ].join('');

        var blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        var link = document.createElement('a');

        var filename = buildAtiExportFilename();

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

    $scope.$watch('model.selectedDataElementGroup', function(){
        refreshSelectedTrace();
    });


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
