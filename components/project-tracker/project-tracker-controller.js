/* Controllers */

var ndpFramework = angular.module('ndpFramework');

ndpFramework.controller('ProjectTrackerController',
    function($rootScope,
        $scope,
        $q,
        $http,
        $filter,
        $translate,
        $modal,
        Paginator,
        NotificationService,
        SelectedMenuService,
        MetaDataFactory,
        ProgramFactory,
        OrgUnitFactory,
        CommonUtils,
        DateUtils) {

    $scope.model = {
        metaDataCached: false,
        projects: [],
        projectsPage: [],
        projectsRaw: [],
        projectsFetched: false,
        projectFetchStarted: false,
        selectedProject: null,
        showProjectDetails: false,
        selectedMenu: null,
        selectedProgram: null,
        optionSetsById: {},
        attributesById: {},
        dataElementsById: {},
        dynamicListAttributes: [],
        dynamicReportDataElements: [],
        filterText: '',
        selectedFundingSource: '',
        selectedProjectArea: '',
        selectedLatestStatus: '',
        plannedStartFrom: '',
        plannedStartTo: '',
        plannedEndFrom: '',
        plannedEndTo: '',
        fundingSources: [],
        projectAreas: [],
        latestStatuses: [],
        projectAreaOptions: [],
        fundingSourceOptions: [],
        latestStatusOptions: [],
        summaryYearOptions: [],
        summaryDonorOptions: [],
        selectedSummaryYear: '',
        selectedSummaryDonor: '',
        selectedSummaryTopN: 10,
        fundingBySourceSummary: [],
        progressDistributionSummary: [],
        expenditureTrendSummary: [],
        stageIds: { funding: null, progress: null },
        sortBy: 'totalFunding',
        sortDesc: true
    };

    $scope.model.horizontalMenus = [
        {id: 'tracker', title: 'tracker', order: 1, view: 'components/project-tracker/tracker-view.html', active: true, class: 'main-horizontal-menu'},
        {id: 'summary', title: 'summary', order: 2, view: 'components/project-tracker/summary-view.html', class: 'main-horizontal-menu'}
    ];
    $scope.currentView = $scope.model.horizontalMenus.find(function(m){ return m.active; }).view;

    $scope.pager = {pageSize: 50, page: 1, toolBarDisplay: 5};

    var PROGRAM_ROLE_ATTRIBUTE_CODE = 'programMode';
    var PROGRAM_ROLE_PROJECT_TRACKER = 'projectTracker';
    var STAGE_ROLE_ATTRIBUTE_CODE = 'stageRole';
    var STAGE_ROLE_FUNDING = 'fundingContribution';
    var STAGE_ROLE_PROGRESS = 'progressUpdate';
    var ATTR_CODES = {
        projectCode: 'projectCode',
        projectTitle: 'projectTitle',
        ministry: 'ministryAgency',
        projectArea: 'projectArea',
        estimatedCostGmd: 'estimatedProjectCostGmd',
        plannedStartDate: 'plannedStartDate',
        plannedEndDate: 'plannedEndDate'
    };
    var DE_CODES = {
        fundingSource: 'fundingSource',
        fundingAmountGmd: 'fundingContributionGmd',
        financialYear: 'financialYear',
        progressStatus: 'projectStatus',
        physicalProgressPct: 'physicalProgressPct',
        projectExpenditureGmd: 'projectExpenditureGmd',
        kpi1: 'kpi1Value',
        kpi2: 'kpi2Value',
        kpiNarrative: 'kpiNarrative',
        progressDate: 'progressReportingDate'
    };
    var PAGE_SIZE_SERVER = 200;
    var activeFetchRequestId = 0;
    var metadataAttributesById = {};

    function normalize(v) {
        return String(v || '').trim().toLowerCase();
    }

    function asArray(v) {
        if (!v) {
            return [];
        }
        return angular.isArray(v) ? v : [v];
    }

    function codeMatches(actualCode, expectedCodes) {
        var target = normalize(actualCode);
        return asArray(expectedCodes).some(function(c){ return normalize(c) === target; });
    }

    function buildDynamicColumns(program, stageIds) {
        var excludedAttributeCodes = {};
        excludedAttributeCodes[normalize(ATTR_CODES.projectCode)] = true;
        excludedAttributeCodes[normalize(ATTR_CODES.projectTitle)] = true;
        excludedAttributeCodes[normalize(ATTR_CODES.ministry)] = true;
        excludedAttributeCodes[normalize(ATTR_CODES.projectArea)] = true;
        excludedAttributeCodes[normalize(ATTR_CODES.estimatedCostGmd)] = true;

        var excludedDeCodes = {};
        excludedDeCodes[normalize(DE_CODES.progressStatus)] = true;
        excludedDeCodes[normalize(DE_CODES.projectExpenditureGmd)] = true;
        excludedDeCodes[normalize(DE_CODES.physicalProgressPct)] = true;
        excludedDeCodes[normalize(DE_CODES.progressDate)] = true;

        var dynamicListAttributes = [];
        angular.forEach((program || {}).programTrackedEntityAttributes || [], function(pta){
            if (!pta || !pta.displayInList || !pta.trackedEntityAttribute) {
                return;
            }
            var a = pta.trackedEntityAttribute;
            if (a.code && excludedAttributeCodes[normalize(a.code)]) {
                return;
            }
            dynamicListAttributes.push({
                id: a.id,
                code: a.code || '',
                displayName: a.displayName || a.name || '',
                valueType: a.valueType || 'TEXT'
            });
        });
        $scope.model.dynamicListAttributes = dynamicListAttributes;

        var dynamicReportDataElements = [];
        var progressStage = null;
        angular.forEach((program || {}).programStages || [], function(stage){
            if (!progressStage && stage && stage.id === stageIds.progress) {
                progressStage = stage;
            }
        });
        angular.forEach((progressStage || {}).programStageDataElements || [], function(psde){
            if (!psde || !psde.displayInReports || !psde.dataElement) {
                return;
            }
            var de = psde.dataElement;
            if (de.code && excludedDeCodes[normalize(de.code)]) {
                return;
            }
            dynamicReportDataElements.push({
                id: de.id,
                code: de.code || '',
                displayName: de.displayName || de.name || '',
                valueType: de.valueType || 'TEXT'
            });
        });
        $scope.model.dynamicReportDataElements = dynamicReportDataElements;
    }

    function resetProjectLists() {
        $scope.model.projects = [];
        $scope.model.projectsPage = [];
        $scope.model.projectsRaw = [];
        $scope.model.selectedProject = null;
        $scope.model.showProjectDetails = false;
        updatePagedProjects();
    }

    function findAttributeId(codes, names) {
        var out = '';
        angular.forEach(Object.keys($scope.model.attributesById || {}), function(id){
            if (out) {
                return;
            }
            var a = $scope.model.attributesById[id];
            if (!a) {
                return;
            }
            if (codes && codeMatches(a.code, codes)) {
                out = a.id;
                return;
            }
            if (names && (names.indexOf(a.name) !== -1 || names.indexOf(a.displayName) !== -1)) {
                out = a.id;
            }
        });
        return out;
    }

    function toNumber(val) {
        if (val === null || val === undefined || val === '') {
            return 0;
        }
        var n = parseFloat(String(val).replace(/,/g, ''));
        return isNaN(n) ? 0 : n;
    }

    function toIsoDate(val) {
        if (!val) {
            return '';
        }
        if (Object.prototype.toString.call(val) === '[object Date]') {
            var year = val.getFullYear();
            var month = ('0' + (val.getMonth() + 1)).slice(-2);
            var day = ('0' + val.getDate()).slice(-2);
            return year + '-' + month + '-' + day;
        }
        return String(val).slice(0, 10);
    }

    function yearFromRawDate(raw) {
        if (!raw) {
            return '';
        }
        return String(raw).slice(0, 4);
    }

    function getAttributeValue(tei, code, name, optionSetsById, attributesById) {
        if (!tei || !tei.attributes) {
            return '';
        }
        var value = '';
        angular.forEach(tei.attributes, function(att){
            if (value !== '') {
                return;
            }
            var attribute = attributesById[att.attribute];
            if (!attribute) {
                return;
            }
            if ((code && codeMatches(attribute.code, code)) || (name && attribute.name === name) || (name && attribute.displayName === name)) {
                value = CommonUtils.formatDataValue(null, att.value, attribute, optionSetsById, 'USER');
            }
        });
        return value;
    }

    function getAttributeRawValue(tei, code, name, attributesById) {
        if (!tei || !tei.attributes) {
            return '';
        }
        var value = '';
        angular.forEach(tei.attributes, function(att){
            if (value !== '') {
                return;
            }
            var attribute = attributesById[att.attribute];
            if (!attribute) {
                return;
            }
            if ((code && codeMatches(attribute.code, code)) || (name && attribute.name === name) || (name && attribute.displayName === name)) {
                value = att.value || '';
            }
        });
        return value;
    }

    function getDataValueByCode(event, dataElementsById, code, optionSetsById) {
        var out = '';
        if (!event || !event.dataValues) {
            return out;
        }
        angular.forEach(event.dataValues, function(dv){
            if (out !== '') {
                return;
            }
            var de = dataElementsById[dv.dataElement];
            if (!de || !codeMatches(de.code, code)) {
                return;
            }
            out = CommonUtils.formatDataValue(event, dv.value, de, optionSetsById, 'USER');
        });
        return out;
    }

    function getDataValueRawByCode(event, dataElementsById, code) {
        var out = '';
        if (!event || !event.dataValues) {
            return out;
        }
        angular.forEach(event.dataValues, function(dv){
            if (out !== '') {
                return;
            }
            var de = dataElementsById[dv.dataElement];
            if (de && codeMatches(de.code, code)) {
                out = dv.value;
            }
        });
        return out;
    }

    function findAttributeByCode(code) {
        var out = null;
        angular.forEach(Object.keys($scope.model.attributesById || {}), function(id){
            if (out) {
                return;
            }
            var att = $scope.model.attributesById[id];
            if (att && codeMatches(att.code, code)) {
                out = att;
            }
        });
        return out;
    }

    function findDataElementByCode(code) {
        var out = null;
        angular.forEach(Object.keys($scope.model.dataElementsById || {}), function(id){
            if (out) {
                return;
            }
            var de = $scope.model.dataElementsById[id];
            if (de && codeMatches(de.code, code)) {
                out = de;
            }
        });
        return out;
    }

    function getMetadataAttributeValue(attributeValues, metadataAttributeCode) {
        var out = '';
        angular.forEach(attributeValues || [], function(av){
            if (out !== '') {
                return;
            }
            var attr = metadataAttributesById[(av.attribute || {}).id];
            if (attr && attr.code === metadataAttributeCode) {
                out = av.value || '';
            }
        });
        return out;
    }

    function findProgramByRole(programs, roleValue) {
        var wanted = normalize(roleValue);
        var out = null;
        angular.forEach(programs || [], function(pr){
            if (out) {
                return;
            }
            var value = getMetadataAttributeValue(pr.attributeValues || [], PROGRAM_ROLE_ATTRIBUTE_CODE);
            if (normalize(value) === wanted) {
                out = pr;
            }
        });
        return out;
    }

    function resolveStageIds(program) {
        var stageIds = { funding: null, progress: null };
        angular.forEach((program || {}).programStages || [], function(stage){
            var role = normalize(getMetadataAttributeValue(stage.attributeValues || [], STAGE_ROLE_ATTRIBUTE_CODE));
            if (role === normalize(STAGE_ROLE_FUNDING)) {
                stageIds.funding = stage.id;
            }
            if (role === normalize(STAGE_ROLE_PROGRESS)) {
                stageIds.progress = stage.id;
            }
        });
        return stageIds;
    }

    function getOptionSetOptionsFromEntity(entity) {
        if (!entity) {
            return [];
        }
        var osId = null;
        if (entity.optionSet && entity.optionSet.id) {
            osId = entity.optionSet.id;
        } else if (entity.optionSet && angular.isString(entity.optionSet)) {
            osId = entity.optionSet;
        } else if (entity.optionSetValue && entity.optionSet && entity.optionSet.id) {
            osId = entity.optionSet.id;
        }
        if (!osId || !$scope.model.optionSetsById[osId]) {
            return [];
        }
        return ($scope.model.optionSetsById[osId].options || []).map(function(opt){
            var value = opt.code || opt.value || opt.name || opt.displayName || '';
            var label = opt.displayName || opt.name || opt.code || opt.value || '';
            return { value: value, label: label };
        });
    }

    function mapProject(tei, stageIds, orgUnitNameById) {
        var fundingBySourceMap = {};
        var fundingByYearMap = {};
        var physicalProgressValues = [];
        var searchableParts = [];
        var latestProgressEvent = null;
        var enrollmentOrgUnitId = '';
        angular.forEach((tei || {}).enrollments || [], function(enrollment){
            if (enrollmentOrgUnitId) {
                return;
            }
            if (enrollment && enrollment.orgUnit) {
                enrollmentOrgUnitId = enrollment.orgUnit;
            }
        });
        var enrollmentOrgUnitName = (orgUnitNameById || {})[enrollmentOrgUnitId] || '';
        var project = {
            trackedEntityInstance: tei.trackedEntity,
            projectCodeRaw: getAttributeRawValue(tei, ATTR_CODES.projectCode, 'Project Code', $scope.model.attributesById),
            projectCode: getAttributeValue(tei, ATTR_CODES.projectCode, 'Project Code', $scope.model.optionSetsById, $scope.model.attributesById),
            projectTitleRaw: getAttributeRawValue(tei, ATTR_CODES.projectTitle, 'Project Title', $scope.model.attributesById),
            projectTitle: getAttributeValue(tei, ATTR_CODES.projectTitle, 'Project Title', $scope.model.optionSetsById, $scope.model.attributesById),
            ministryRaw: enrollmentOrgUnitId || '',
            ministry: enrollmentOrgUnitName || '',
            projectAreaRaw: getAttributeRawValue(tei, ATTR_CODES.projectArea, 'Project Area', $scope.model.attributesById),
            projectArea: getAttributeValue(tei, ATTR_CODES.projectArea, 'Project Area', $scope.model.optionSetsById, $scope.model.attributesById),
            estimatedCost: toNumber(getAttributeValue(tei, ATTR_CODES.estimatedCostGmd, 'Estimated Project Cost (GMD)', $scope.model.optionSetsById, $scope.model.attributesById)),
            totalFunding: 0,
            totalExpenditure: 0,
            requiredFunding: 0,
            fundingDelta: 0,
            fundingGap: 0,
            latestStatus: '',
            latestStatusRaw: '',
            latestProgressDate: '',
            latestPhysicalProgress: '',
            previousPhysicalProgress: '',
            progressTrendPp: '',
            avgPhysicalProgress: 0,
            executionRatePct: 0,
            donorCount: 0,
            topDonor: '',
            fundingSourceCodes: {},
            showFundingEvents: false,
            showProgressEvents: false,
            fundingRows: [],
            progressRows: [],
            fundingBySource: [],
            fundingByYear: [],
            dynamicAttributeValues: {},
            dynamicReportValues: {}
        };

        angular.forEach($scope.model.dynamicListAttributes || [], function(a){
            project.dynamicAttributeValues[a.id] = '';
        });
        angular.forEach($scope.model.dynamicReportDataElements || [], function(de){
            project.dynamicReportValues[de.id] = '';
        });

        angular.forEach(tei.attributes || [], function(att){
            var attribute = $scope.model.attributesById[att.attribute];
            if (!attribute) {
                return;
            }
            var formatted = CommonUtils.formatDataValue(null, att.value, attribute, $scope.model.optionSetsById, 'USER');
            if (formatted !== null && formatted !== undefined && formatted !== '') {
                searchableParts.push(String(formatted));
            }
            if (project.dynamicAttributeValues.hasOwnProperty(attribute.id)) {
                project.dynamicAttributeValues[attribute.id] = formatted || '';
            }
        });

        var latestProgressDate = '';
        var latestStatus = '';

        angular.forEach(tei.enrollments || [], function(enrollment){
            angular.forEach(enrollment.events || [], function(ev){
                if (!CommonUtils.userHasReadAccess('ACCESSIBLE_PROGRAM_STAGES', 'programStages', ev.programStage)) {
                    return;
                }

                if (ev.programStage === stageIds.funding) {
                    var amount = toNumber(getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.fundingAmountGmd));
                    var source = getDataValueByCode(ev, $scope.model.dataElementsById, DE_CODES.fundingSource, $scope.model.optionSetsById);
                    var sourceCode = getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.fundingSource);
                    var year = getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.financialYear);
                    var eventDate = ev.occurredAt || ev.eventDate || ev.createdAt;
                    project.totalFunding += amount;
                    project.fundingRows.push({
                        year: year || '',
                        source: source || '',
                        amount: amount,
                        date: eventDate ? DateUtils.formatFromApiToUser(eventDate) : '',
                        rawDate: eventDate || ''
                    });

                    if (source) {
                        fundingBySourceMap[source] = (fundingBySourceMap[source] || 0) + amount;
                    }
                    if (sourceCode) {
                        project.fundingSourceCodes[sourceCode] = true;
                    }
                    if (year) {
                        fundingByYearMap[year] = (fundingByYearMap[year] || 0) + amount;
                    }
                }

                if (ev.programStage === stageIds.progress) {
                    var expenditure = toNumber(getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.projectExpenditureGmd));
                    var status = getDataValueByCode(ev, $scope.model.dataElementsById, DE_CODES.progressStatus, $scope.model.optionSetsById);
                    var statusRaw = getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.progressStatus);
                    var physicalProgress = getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.physicalProgressPct);
                    var kpi1 = getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.kpi1);
                    var kpi2 = getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.kpi2);
                    var narrative = getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.kpiNarrative);
                    var pDateRaw = getDataValueRawByCode(ev, $scope.model.dataElementsById, DE_CODES.progressDate) || ev.occurredAt || ev.eventDate || ev.createdAt;
                    var pDate = pDateRaw ? DateUtils.formatFromApiToUser(pDateRaw) : '';
                    project.totalExpenditure += expenditure;
                    project.progressRows.push({
                        date: pDate,
                        rawDate: pDateRaw || '',
                        status: status || '',
                        physicalProgress: physicalProgress || '',
                        expenditure: expenditure,
                        kpi1: kpi1 || '',
                        kpi2: kpi2 || '',
                        narrative: narrative || ''
                    });

                    if (physicalProgress !== '' && physicalProgress !== null && physicalProgress !== undefined) {
                        var pVal = toNumber(physicalProgress);
                        if (!isNaN(pVal)) {
                            physicalProgressValues.push(pVal);
                        }
                    }

                    if (pDateRaw && (!latestProgressDate || pDateRaw > latestProgressDate)) {
                        latestProgressDate = pDateRaw;
                        latestStatus = status || '';
                        project.latestStatusRaw = statusRaw || '';
                        project.latestPhysicalProgress = physicalProgress || '';
                        latestProgressEvent = ev;
                    }
                }
            });
        });

        project.latestStatus = latestStatus;
        project.latestProgressDate = latestProgressDate ? DateUtils.formatFromApiToUser(latestProgressDate) : '';
        project.fundingRows = $filter('orderBy')(project.fundingRows, '-rawDate');
        project.progressRows = $filter('orderBy')(project.progressRows, '-rawDate');
        // Funding gap considers both planned envelope and realized spending pressure.
        // If expenditure has already exceeded plan, use expenditure as required baseline.
        var requiredFunding = Math.max(project.estimatedCost, project.totalExpenditure);
        project.requiredFunding = requiredFunding;
        // Positive delta means surplus funding, negative delta means remaining gap.
        project.fundingDelta = project.totalFunding - requiredFunding;
        // Display as signed value so deficits are shown as negative numbers.
        project.fundingGap = project.fundingDelta;
        project.executionRatePct = project.totalFunding > 0 ? (project.totalExpenditure / project.totalFunding) * 100 : 0;
        project.avgPhysicalProgress = physicalProgressValues.length > 0
            ? (physicalProgressValues.reduce(function(acc, cur){ return acc + cur; }, 0) / physicalProgressValues.length)
            : 0;
        if (project.progressRows.length > 0) {
            project.latestPhysicalProgress = project.progressRows[0].physicalProgress || '';
            if (project.progressRows.length > 1) {
                project.previousPhysicalProgress = project.progressRows[1].physicalProgress || '';
                if (project.latestPhysicalProgress !== '' && project.previousPhysicalProgress !== '') {
                    project.progressTrendPp = toNumber(project.latestPhysicalProgress) - toNumber(project.previousPhysicalProgress);
                }
            }
        }

        angular.forEach(fundingBySourceMap, function(amount, source){
            var sharePct = project.totalFunding > 0 ? (amount / project.totalFunding) * 100 : 0;
            project.fundingBySource.push({
                source: source,
                amount: amount,
                sharePct: sharePct
            });
        });
        project.fundingBySource = $filter('orderBy')(project.fundingBySource, '-amount');
        project.donorCount = project.fundingBySource.length;
        project.topDonor = project.fundingBySource.length > 0 ? project.fundingBySource[0].source : '';

        angular.forEach(fundingByYearMap, function(amount, year){
            project.fundingByYear.push({
                year: year,
                amount: amount
            });
        });
        project.fundingByYear = $filter('orderBy')(project.fundingByYear, 'year');
        project.searchableText = searchableParts.join(' ').toLowerCase();

        if (latestProgressEvent && $scope.model.dynamicReportDataElements && $scope.model.dynamicReportDataElements.length > 0) {
            angular.forEach(latestProgressEvent.dataValues || [], function(dv){
                var de = $scope.model.dataElementsById[dv.dataElement];
                if (!de) {
                    return;
                }
                if (project.dynamicReportValues.hasOwnProperty(de.id)) {
                    project.dynamicReportValues[de.id] = CommonUtils.formatDataValue(
                        latestProgressEvent,
                        dv.value,
                        de,
                        $scope.model.optionSetsById,
                        'USER'
                    ) || '';
                }
            });
        }

        return project;
    }

    function refreshFilterOptions(projects) {
        var sourceMap = {};
        var areaMap = {};
        var statusMap = {};

        angular.forEach(projects || [], function(p){
            if (p.projectArea) {
                areaMap[p.projectArea] = true;
            }
            if (p.latestStatus) {
                statusMap[p.latestStatus] = true;
            }
            angular.forEach(p.fundingBySource || [], function(s){
                if (s.source) {
                    sourceMap[s.source] = true;
                }
            });
        });

        $scope.model.fundingSources = Object.keys(sourceMap).sort();
        $scope.model.projectAreas = Object.keys(areaMap).sort();
        $scope.model.latestStatuses = Object.keys(statusMap).sort();

        var areaAttr = findAttributeByCode(ATTR_CODES.projectArea);
        var fundingSourceDe = findDataElementByCode(DE_CODES.fundingSource);
        var progressStatusDe = findDataElementByCode(DE_CODES.progressStatus);

        var areaOptions = getOptionSetOptionsFromEntity(areaAttr);
        var fundingOptions = getOptionSetOptionsFromEntity(fundingSourceDe);
        var statusOptions = getOptionSetOptionsFromEntity(progressStatusDe);

        $scope.model.projectAreaOptions = areaOptions.length > 0
            ? areaOptions
            : $scope.model.projectAreas.map(function(v){ return { value: v, label: v }; });
        $scope.model.fundingSourceOptions = fundingOptions.length > 0
            ? fundingOptions
            : $scope.model.fundingSources.map(function(v){ return { value: v, label: v }; });
        $scope.model.latestStatusOptions = statusOptions.length > 0
            ? statusOptions
            : $scope.model.latestStatuses.map(function(v){ return { value: v, label: v }; });
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

    function updateSummary(projects) {
        var yearMap = {};
        var donorMap = {};
        var bySource = {};
        var byStatus = {};
        var byYearExpenditure = {};
        var selectedYear = String($scope.model.selectedSummaryYear || '');
        var selectedDonor = String($scope.model.selectedSummaryDonor || '');

        angular.forEach(projects || [], function(project){
            var latestInYear = null;
            angular.forEach(project.progressRows || [], function(pr){
                var y = yearFromRawDate(pr.rawDate);
                if (y) {
                    yearMap[y] = true;
                }
                if (!selectedYear || selectedYear === y) {
                    if (!latestInYear || (pr.rawDate || '') > (latestInYear.rawDate || '')) {
                        latestInYear = pr;
                    }
                }
                if (!selectedYear || selectedYear === y) {
                    byYearExpenditure[y] = (byYearExpenditure[y] || 0) + toNumber(pr.expenditure);
                }
            });

            if (latestInYear && latestInYear.status) {
                byStatus[latestInYear.status] = (byStatus[latestInYear.status] || 0) + 1;
            }

            angular.forEach(project.fundingRows || [], function(fr){
                var fy = String(fr.year || yearFromRawDate(fr.rawDate) || '');
                if (fy) {
                    yearMap[fy] = true;
                }
                if (fr.source) {
                    donorMap[fr.source] = true;
                }
                if (selectedYear && fy !== selectedYear) {
                    return;
                }
                if (selectedDonor && fr.source !== selectedDonor) {
                    return;
                }
                if (!fr.source) {
                    return;
                }
                bySource[fr.source] = (bySource[fr.source] || 0) + toNumber(fr.amount);
            });
        });

        $scope.model.summaryYearOptions = Object.keys(yearMap).sort();
        $scope.model.summaryDonorOptions = Object.keys(donorMap).sort();

        var totalSourceAmount = 0;
        angular.forEach(bySource, function(v){ totalSourceAmount += v; });
        var sourceRows = Object.keys(bySource).map(function(source){
            var amount = bySource[source];
            return {
                source: source,
                amount: amount,
                sharePct: totalSourceAmount > 0 ? (amount * 100 / totalSourceAmount) : 0
            };
        });
        sourceRows = $filter('orderBy')(sourceRows, '-amount');
        if (!selectedDonor) {
            var topN = parseInt($scope.model.selectedSummaryTopN, 10);
            if (!isNaN(topN) && topN > 0) {
                sourceRows = sourceRows.slice(0, topN);
            }
        }
        $scope.model.fundingBySourceSummary = sourceRows;

        var totalStatuses = 0;
        angular.forEach(byStatus, function(v){ totalStatuses += v; });
        var statusRows = Object.keys(byStatus).map(function(status){
            var count = byStatus[status];
            return {
                status: status,
                count: count,
                sharePct: totalStatuses > 0 ? (count * 100 / totalStatuses) : 0
            };
        });
        $scope.model.progressDistributionSummary = $filter('orderBy')(statusRows, '-count');

        var expRows = Object.keys(byYearExpenditure).map(function(y){
            return { year: y, amount: byYearExpenditure[y] };
        });
        $scope.model.expenditureTrendSummary = $filter('orderBy')(expRows, 'year');
    }

    function applyFiltersAndSorting() {
        var projects = angular.copy($scope.model.projectsRaw || []);

        if ($scope.model.selectedFundingSource) {
            projects = projects.filter(function(p){
                return !!(p.fundingSourceCodes && p.fundingSourceCodes[$scope.model.selectedFundingSource]);
            });
        }

        if ($scope.model.selectedProjectArea) {
            projects = projects.filter(function(p){
                return p.projectAreaRaw === $scope.model.selectedProjectArea || p.projectArea === $scope.model.selectedProjectArea;
            });
        }

        if ($scope.model.selectedLatestStatus) {
            projects = projects.filter(function(p){
                return p.latestStatusRaw === $scope.model.selectedLatestStatus || p.latestStatus === $scope.model.selectedLatestStatus;
            });
        }

        var sortExpr = ($scope.model.sortDesc ? '-' : '') + $scope.model.sortBy;
        projects = $filter('orderBy')(projects, sortExpr);
        $scope.model.projects = projects;
        updatePagedProjects();
        updateSummary(projects);

        if ($scope.model.selectedProject) {
            var selectedExists = projects.some(function(p){
                return p.trackedEntityInstance === $scope.model.selectedProject.trackedEntityInstance;
            });
            if (!selectedExists) {
                $scope.model.selectedProject = null;
                $scope.model.showProjectDetails = false;
            }
        }
    }

    function buildServerParams() {
        var params = [];
        var areaAttr = findAttributeId(ATTR_CODES.projectArea, ['Project Area']);
        var startAttr = findAttributeId(ATTR_CODES.plannedStartDate, ['Planned Start Date']);
        var endAttr = findAttributeId(ATTR_CODES.plannedEndDate, ['Planned End Date']);

        if ($scope.model.selectedProjectArea && areaAttr) {
            params.push('filter=' + encodeURIComponent(areaAttr + ':eq:' + $scope.model.selectedProjectArea));
        }
        if ($scope.model.plannedStartFrom && startAttr) {
            params.push('filter=' + encodeURIComponent(startAttr + ':ge:' + toIsoDate($scope.model.plannedStartFrom)));
        }
        if ($scope.model.plannedStartTo && startAttr) {
            params.push('filter=' + encodeURIComponent(startAttr + ':le:' + toIsoDate($scope.model.plannedStartTo)));
        }
        if ($scope.model.plannedEndFrom && endAttr) {
            params.push('filter=' + encodeURIComponent(endAttr + ':ge:' + toIsoDate($scope.model.plannedEndFrom)));
        }
        if ($scope.model.plannedEndTo && endAttr) {
            params.push('filter=' + encodeURIComponent(endAttr + ':le:' + toIsoDate($scope.model.plannedEndTo)));
        }

        return params.length > 0 ? '&' + params.join('&') : '';
    }

    function fetchTrackedEntitiesAllPages(baseUrl, page, acc, done, fail) {
        $http.get(baseUrl + '&page=' + page).then(function(res){
            var data = res.data || {};
            var teis = data.trackedEntities || [];
            var merged = acc.concat(teis);
            var pageCount = data.pageCount || 1;
            if (page < pageCount) {
                fetchTrackedEntitiesAllPages(baseUrl, page + 1, merged, done, fail);
            } else {
                done(merged);
            }
        }, fail);
    }

    function fetchTrackedEntityIdsByAttributeText(attrId, text) {
        var deferred = $q.defer();
        var ids = {};
        var baseUrl = $rootScope.DHIS2URL + '/api/tracker/trackedEntities.json?ouMode=DESCENDANTS&fields=trackedEntity&orgUnit=' +
            $scope.selectedOrgUnit.id + '&program=' + $scope.model.selectedProgram.id +
            '&pageSize=' + PAGE_SIZE_SERVER + '&totalPages=true&filter=' +
            encodeURIComponent(attrId + ':like:' + text);

        fetchTrackedEntitiesAllPages(baseUrl, 1, [], function(items){
            angular.forEach(items || [], function(t){
                if (t.trackedEntity) {
                    ids[t.trackedEntity] = true;
                }
            });
            deferred.resolve(ids);
        }, deferred.reject);

        return deferred.promise;
    }

    function fetchTrackedEntityIdsByText(text) {
        var deferred = $q.defer();
        var trimmed = (text || '').trim();
        if (!trimmed) {
            deferred.resolve(null);
            return deferred.promise;
        }

        var attrIds = [];
        angular.forEach($scope.model.selectedProgram.programTrackedEntityAttributes || [], function(pta){
            if (pta && pta.trackedEntityAttribute && pta.trackedEntityAttribute.id) {
                attrIds.push(pta.trackedEntityAttribute.id);
            }
        });

        if (attrIds.length === 0) {
            deferred.resolve(null);
            return deferred.promise;
        }

        var tasks = attrIds.map(function(attrId){
            return fetchTrackedEntityIdsByAttributeText(attrId, trimmed);
        });

        $q.all(tasks).then(function(sets){
            var union = {};
            angular.forEach(sets, function(s){
                angular.forEach(Object.keys(s || {}), function(id){
                    union[id] = true;
                });
            });
            deferred.resolve(union);
        }, deferred.reject);

        return deferred.promise;
    }

    function fetchEventsAllPages(baseUrl, page, acc, done, fail) {
        $http.get(baseUrl + '&page=' + page).then(function(res){
            var data = res.data || {};
            var events = data.events || [];
            var merged = acc.concat(events);
            var pageCount = data.pageCount || 1;
            if (page < pageCount) {
                fetchEventsAllPages(baseUrl, page + 1, merged, done, fail);
            } else {
                done(merged);
            }
        }, fail);
    }

    function resolveOrgUnitNameMap(teis) {
        var deferred = $q.defer();
        var nameMap = {};
        var idSet = {};
        angular.forEach(teis || [], function(tei){
            angular.forEach(tei.enrollments || [], function(enrollment){
                if (!enrollment || !enrollment.orgUnit) {
                    return;
                }
                idSet[enrollment.orgUnit] = true;
            });
        });
        var ids = Object.keys(idSet);
        if (ids.length < 1) {
            deferred.resolve(nameMap);
            return deferred.promise;
        }
        var filterExpr = 'id:in:[' + ids.join(',') + ']';
        var url = $rootScope.DHIS2URL + '/api/organisationUnits.json?paging=false&fields=id,displayName&filter=' + encodeURIComponent(filterExpr);
        $http.get(url).then(function(res){
            angular.forEach((res.data || {}).organisationUnits || [], function(ou){
                if (ou && ou.id) {
                    nameMap[ou.id] = ou.displayName || '';
                }
            });
            deferred.resolve(nameMap);
        }, function(){
            angular.forEach(ids, function(id){
                nameMap[id] = id;
            });
            deferred.resolve(nameMap);
        });
        return deferred.promise;
    }

    function fetchTrackedEntityIdsByStatusEvent(statusValue, stageId) {
        var deferred = $q.defer();
        if (!statusValue || !stageId) {
            deferred.resolve(null);
            return deferred.promise;
        }
        var statusDe = findDataElementByCode(DE_CODES.progressStatus);
        if (!statusDe || !statusDe.id) {
            deferred.resolve(null);
            return deferred.promise;
        }

        var ids = {};
        var baseUrl = $rootScope.DHIS2URL + '/api/tracker/events.json?ouMode=DESCENDANTS&orgUnit=' + $scope.selectedOrgUnit.id +
            '&program=' + $scope.model.selectedProgram.id + '&programStage=' + stageId +
            '&fields=trackedEntity&filter=' + encodeURIComponent(statusDe.id + ':eq:' + statusValue) +
            '&pageSize=' + PAGE_SIZE_SERVER + '&totalPages=true';

        fetchEventsAllPages(baseUrl, 1, [], function(events){
            angular.forEach(events || [], function(ev){
                if (ev.trackedEntity) {
                    ids[ev.trackedEntity] = true;
                }
            });
            deferred.resolve(ids);
        }, deferred.reject);

        return deferred.promise;
    }

    $scope.fetchProjects = function(){
        if (!$scope.selectedOrgUnit || !$scope.selectedOrgUnit.id || !$scope.model.selectedProgram || !$scope.model.selectedProgram.id) {
            return;
        }

        if ($scope.model.projectFetchStarted) {
            return;
        }
        var requestId = ++activeFetchRequestId;
        $scope.model.projectFetchStarted = true;
        $scope.model.projectsFetched = false;

        var extraParams = buildServerParams();
        var baseUrl = $rootScope.DHIS2URL + '/api/tracker/trackedEntities.json?ouMode=DESCENDANTS&order=createdAt:desc&fields=*&orgUnit=' +
            $scope.selectedOrgUnit.id + '&program=' + $scope.model.selectedProgram.id +
            '&pageSize=' + PAGE_SIZE_SERVER + '&totalPages=true' + extraParams;

        fetchTrackedEntitiesAllPages(baseUrl, 1, [], function(teis){
            if (requestId !== activeFetchRequestId) {
                return;
            }
            var stageIds = $scope.model.stageIds || { funding: null, progress: null };
            if (!stageIds.funding || !stageIds.progress) {
                resetProjectLists();
                $scope.model.projectFetchStarted = false;
                $scope.model.projectsFetched = true;                
                NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant('project_tracker_invalid_configuration'));
                return;
            }

            var textPromise = fetchTrackedEntityIdsByText($scope.model.filterText);
            var statusPromise = fetchTrackedEntityIdsByStatusEvent($scope.model.selectedLatestStatus, stageIds.progress);

            $q.all([textPromise, statusPromise]).then(function(idSets){
                if (requestId !== activeFetchRequestId) {
                    return;
                }
                var textIdSet = idSets[0];
                var statusIdSet = idSets[1];
                var filteredTeis = (teis || []).filter(function(tei){
                    var id = tei.trackedEntity;
                    if (textIdSet && !textIdSet[id]) {
                        return false;
                    }
                    if (statusIdSet && !statusIdSet[id]) {
                        return false;
                    }
                    return true;
                });

                resolveOrgUnitNameMap(filteredTeis).then(function(orgUnitNameMap){
                    var projects = [];
                    angular.forEach(filteredTeis, function(tei){
                        projects.push(mapProject(tei, stageIds, orgUnitNameMap));
                    });

                    $scope.model.projectsRaw = projects;
                    refreshFilterOptions(projects);
                    applyFiltersAndSorting();
                    $scope.model.projectFetchStarted = false;
                    $scope.model.projectsFetched = true;
                }, function(){
                    $scope.model.projectFetchStarted = false;
                    $scope.model.projectsFetched = true;
                    CommonUtils.errorNotifier();
                });
            }, function(resp){
                if (requestId !== activeFetchRequestId) {
                    return;
                }
                $scope.model.projectFetchStarted = false;
                $scope.model.projectsFetched = true;
                CommonUtils.errorNotifier(resp);
            });
        }, function(resp){
            if (requestId !== activeFetchRequestId) {
                return;
            }
            $scope.model.projectFetchStarted = false;
            $scope.model.projectsFetched = true;
            CommonUtils.errorNotifier(resp);
        });
    };

    $scope.getProjectDetails = function(project){
        if ($scope.model.selectedProject && $scope.model.selectedProject.trackedEntityInstance === project.trackedEntityInstance) {
            $scope.model.showProjectDetails = !$scope.model.showProjectDetails;
            $scope.model.selectedProject = null;
            return;
        }
        $scope.model.selectedProject = project;
        $scope.model.showProjectDetails = true;
    };

    $scope.searchProjects = function(){
        $scope.pager.page = 1;
        $scope.fetchProjects();
    };

    $scope.displayReport = function() {
        $scope.pager.page = 1;
        $scope.fetchProjects();
    };

    $scope.resetTheView = function(menu, $event) {
        angular.forEach($scope.model.horizontalMenus, function(m){
            m.active = false;
        });
        menu.active = true;
        $scope.currentView = menu.view;
    };

    $scope.applySummaryFilters = function() {
        updateSummary($scope.model.projects || []);
    };

    $scope.setSummaryTopN = function(topN) {
        $scope.model.selectedSummaryTopN = topN;
        updateSummary($scope.model.projects || []);
    };

    $scope.setSort = function(field) {
        if ($scope.model.sortBy === field) {
            $scope.model.sortDesc = !$scope.model.sortDesc;
        } else {
            $scope.model.sortBy = field;
            $scope.model.sortDesc = (field !== 'projectTitle' && field !== 'projectCode' && field !== 'projectArea' && field !== 'latestStatus');
        }
        applyFiltersAndSorting();
    };

    $scope.getSortIcon = function(field) {
        if ($scope.model.sortBy !== field) {
            return '';
        }
        return $scope.model.sortDesc ? '▼' : '▲';
    };

    $scope.clearFilters = function() {
        $scope.model.filterText = '';
        $scope.model.selectedFundingSource = '';
        $scope.model.selectedProjectArea = '';
        $scope.model.selectedLatestStatus = '';
        $scope.model.plannedStartFrom = '';
        $scope.model.plannedStartTo = '';
        $scope.model.plannedEndFrom = '';
        $scope.model.plannedEndTo = '';
        $scope.pager.page = 1;
        $scope.fetchProjects();
    };

    $scope.clearSummaryFilters = function() {
        $scope.model.selectedSummaryYear = '';
        $scope.model.selectedSummaryDonor = '';
        $scope.model.selectedSummaryTopN = 10;
        updateSummary($scope.model.projects || []);
    };

    $scope.jumpToPage = function(){
        if ($scope.pager && $scope.pager.page && $scope.pager.pageCount && $scope.pager.page > $scope.pager.pageCount) {
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

    $scope.getStatusCellClass = function(status) {
        var s = String(status || '').toLowerCase();
        if (!s) {
            return '';
        }
        if (s.indexOf('completed') !== -1 || s.indexOf('achieved') !== -1) {
            return 'pt-traffic-green';
        }
        if (s.indexOf('on track') !== -1 || s.indexOf('ontrack') !== -1 || s.indexOf('constrained') !== -1) {
            return 'pt-traffic-yellow';
        }
        if (s.indexOf('delay') !== -1 || s.indexOf('at risk') !== -1 || s.indexOf('atrisk') !== -1 || s.indexOf('no progress') !== -1) {
            return 'pt-traffic-red';
        }
        return '';
    };

    $scope.getFundingGapCellClass = function(project) {
        var delta = toNumber(project.fundingDelta);
        var gap = Math.abs(delta);
        var base = Math.max(toNumber(project.requiredFunding), 1);
        if (Math.abs(delta) < 0.5) {
            return 'pt-traffic-green';
        }
        if (delta > 0) {
            return 'pt-traffic-blue';
        }
        if (gap <= (0.1 * base)) {
            return 'pt-traffic-yellow';
        }
        return 'pt-traffic-red';
    };

    $scope.formatTrend = function(val) {
        if (val === '' || val === null || val === undefined || isNaN(val)) {
            return '';
        }
        var n = toNumber(val);
        return (n > 0 ? '+' : '') + n.toFixed(1);
    };

    $scope.showMetricInfo = function(metricKey, $event) {
        if ($event && $event.stopPropagation) {
            $event.stopPropagation();
        }
        var messageKey = '';
        if (metricKey === 'executionRate') {
            messageKey = 'execution_rate_help';
        } else if (metricKey === 'latestPhysicalProgress') {
            messageKey = 'latest_physical_progress_help';
        } else if (metricKey === 'progressTrend') {
            messageKey = 'progress_trend_help';
        }
        if (!messageKey) {
            return;
        }
        NotificationService.showNotifcationDialog(
            $translate.instant('metric_definition'),
            $translate.instant(messageKey)
        );
    };

    $scope.showOrgUnitTree = function(){
        var modalInstance = $modal.open({
            templateUrl: 'components/outree/orgunit-tree.html',
            controller: 'OuTreeController',
            resolve: {
                orgUnits: function(){ return $scope.orgUnits; },
                selectedOrgUnit: function(){ return $scope.selectedOrgUnit; },
                validOrgUnits: function(){ return null; }
            }
        });

        modalInstance.result.then(function(selectedOu){
            if (selectedOu && selectedOu.id) {
                $scope.selectedOrgUnit = selectedOu;
            }
        });
    };

    function csvEscape(value) {
        var v = value;
        if (v === null || v === undefined) {
            v = '';
        }
        var s = String(v);
        if (/[",\n]/.test(s)) {
            s = '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    function buildCsvContent(headers, rows) {
        var lines = [];
        lines.push((headers || []).map(csvEscape).join(','));
        angular.forEach(rows || [], function(row){
            lines.push((row || []).map(csvEscape).join(','));
        });
        return lines.join('\n');
    }

    function downloadCsv(fileName, headers, rows) {
        var csv = buildCsvContent(headers, rows);
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        if (typeof saveAs === 'function') {
            saveAs(blob, fileName);
            return;
        }
        var url = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    $scope.exportTrackerCsv = function () {
        var headers = [
            $translate.instant('project_code'),
            $translate.instant('project_title'),
            $translate.instant('estimated_cost_gmd'),
            $translate.instant('total_funding_gmd'),
            $translate.instant('total_expenditure_gmd'),
            $translate.instant('funding_gap_gmd'),
            $translate.instant('execution_rate_pct'),
            $translate.instant('latest_physical_progress_pct'),
            $translate.instant('progress_trend_pp'),
            $translate.instant('no_of_donors'),
            $translate.instant('top_donor'),
            $translate.instant('latest_status'),
            $translate.instant('latest_progress_date')
        ];

        var rows = ($scope.model.projects || []).map(function(project){
            var dynamicAttrValues = ($scope.model.dynamicListAttributes || []).map(function(att){
                return project.dynamicAttributeValues ? project.dynamicAttributeValues[att.id] : '';
            });
            var dynamicReportValues = ($scope.model.dynamicReportDataElements || []).map(function(de){
                return project.dynamicReportValues ? project.dynamicReportValues[de.id] : '';
            });
            return [
                project.projectCode,
                project.projectTitle,
                project.estimatedCost,
                project.totalFunding,
                project.totalExpenditure,
                project.fundingGap,
                project.executionRatePct,
                project.latestPhysicalProgress,
                project.progressTrendPp,
                project.donorCount,
                project.topDonor,
                project.latestStatus,
                project.latestProgressDate
            ].concat(dynamicAttrValues).concat(dynamicReportValues);
        });
        headers = headers
            .concat(($scope.model.dynamicListAttributes || []).map(function(att){ return att.displayName; }))
            .concat(($scope.model.dynamicReportDataElements || []).map(function(de){ return de.displayName; }));

        downloadCsv('project-tracker-list.csv', headers, rows);
    };

    $scope.exportSummaryCsv = function(kind) {
        var headers = [];
        var rows = [];

        if (kind === 'fundingBySource') {
            headers = [
                $translate.instant('funding_source'),
                $translate.instant('amount_gmd'),
                $translate.instant('share_pct')
            ];
            rows = ($scope.model.fundingBySourceSummary || []).map(function(row){
                return [row.source, row.amount, row.sharePct];
            });
            downloadCsv('project-tracker-summary-funding-by-source.csv', headers, rows);
            return;
        }

        if (kind === 'progressDistribution') {
            headers = [
                $translate.instant('latest_status'),
                $translate.instant('no_of_projects'),
                $translate.instant('share_pct')
            ];
            rows = ($scope.model.progressDistributionSummary || []).map(function(row){
                return [row.status, row.count, row.sharePct];
            });
            downloadCsv('project-tracker-summary-progress-distribution.csv', headers, rows);
            return;
        }

        if (kind === 'expenditureTrend') {
            headers = [
                $translate.instant('year'),
                $translate.instant('total_expenditure_gmd')
            ];
            rows = ($scope.model.expenditureTrendSummary || []).map(function(row){
                return [row.year, row.amount];
            });
            downloadCsv('project-tracker-summary-expenditure-trend.csv', headers, rows);
        }
    };

    MetaDataFactory.getAll('optionSets').then(function(optionSets){
        angular.forEach(optionSets, function(os){
            $scope.model.optionSetsById[os.id] = os;
        });

        MetaDataFactory.getAll('attributes').then(function(attributes){
            angular.forEach(attributes || [], function(attr){
                metadataAttributesById[attr.id] = attr;
            });

            ProgramFactory.getAll('programs').then(function(programs){
                angular.forEach(programs, function(pr){
                    angular.forEach(pr.programTrackedEntityAttributes || [], function(pta){
                        $scope.model.attributesById[pta.trackedEntityAttribute.id] = pta.trackedEntityAttribute;
                    });
                    angular.forEach(pr.programStages || [], function(stage){
                        angular.forEach(stage.programStageDataElements || [], function(psde){
                            $scope.model.dataElementsById[psde.dataElement.id] = psde.dataElement;
                        });
                    });
                });

                $scope.model.selectedProgram = findProgramByRole(programs, PROGRAM_ROLE_PROJECT_TRACKER);
                if (!$scope.model.selectedProgram) {
                    NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant('project_tracker_invalid_configuration'));
                    return;
                }
                $scope.model.stageIds = resolveStageIds($scope.model.selectedProgram);
                if (!$scope.model.stageIds.funding || !$scope.model.stageIds.progress) {
                    NotificationService.showNotifcationDialog($translate.instant("error"),$translate.instant('project_tracker_invalid_configuration'));
                    return;
                }
                buildDynamicColumns($scope.model.selectedProgram, $scope.model.stageIds);
                $scope.model.metaDataCached = true;

                $scope.model.selectedMenu = SelectedMenuService.getSelectedMenu();

                OrgUnitFactory.getViewTreeRoot().then(function(response){
                    $scope.orgUnits = response.organisationUnits || [];
                    angular.forEach($scope.orgUnits, function(ou){
                        ou.show = true;
                        angular.forEach(ou.children || [], function(c){
                            c.hasChildren = !!(c.children && c.children.length > 0);
                        });
                    });
                    $scope.selectedOrgUnit = $scope.orgUnits[0] ? $scope.orgUnits[0] : null;
                    if ($scope.selectedOrgUnit && $scope.model.selectedProgram) {
                        $scope.fetchProjects();
                    }
                });
            });
        });
    });
});
