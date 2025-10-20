import '../core/ndp-framework.js'

import './resultsFrameworkModule.js'

// common files
import '../common/dhis2.metadata.js'
import '../common/dhis2.angular.services.js'
import '../common/dhis2.angular.directives.js'
import '../common/dhis2.angular.validations.js'
import '../common/dhis2.angular.filters.js'
import '../common/dhis2.angular.controllers.js'

// App files
import '../scripts/services.js'
import '../scripts/filters.js'
import '../scripts/directives.js'
import '../scripts/controllers.js'

import '../components/action/action-output-controller.js'
import '../components/cluster/cluster-controller.js'
import '../components/completeness/completeness-controller.js'
import '../components/dictionary/dictionary-controller.js'
import '../components/dictionary/dictionary-details-controller.js'
import '../components/explanation/datavalue-explanation-controller.js'
import '../components/faq/faq-controller.js'
import '../components/goal/goal-controller.js'
import '../components/home/home-controller.js'
import '../components/intermediate-outcome/intermediate-outcome-controller.js'
import '../components/library/library-controller.js'
import '../components/llg/llg-controller.js'
import '../components/log/log-controller.js'
import '../components/mda/mda-controller.js'
import '../components/objective/objective-controller.js'
import '../components/outcome/outcome-controller.js'
import '../components/output/output-controller.js'
import '../components/outree/orgunit-controller.js'
import '../components/policy/policy-controller.js'
import '../components/project/project-controller.js'
import '../components/sdg/sdg-controller.js'
import '../components/settings/settings-controller.js'
import '../components/vision/vision-controller.js'

let scriptElement = document.createElement("script");
scriptElement.type = "text/javascript";
scriptElement.src = env.dhisConfig.apiRoot + "/api/files/script";
document.body.appendChild(scriptElement);

let cssElement = document.createElement("css");
cssElement.type = "text/css";
cssElement.src = env.dhisConfig.apiRoot + "/api/files/style";
document.body.appendChild(cssElement);

jQuery(function () {
    Dhis2HeaderBar.initHeaderBar(document.querySelector('#header'), env.dhisConfig.apiRoot + '/api', { noLoadingIndicator: true });
});

/* App Module */
angular.module('ndpFramework')

.value('DHIS2URL', env.dhisConfig.apiRoot)

.config(function($httpProvider, $routeProvider, $translateProvider) {

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider.when('/home', {
        templateUrl:'components/home/home.html',
        controller: 'HomeController'
    }).when('/sdg', {
        templateUrl:'components/sdg/sdg-status.html',
        controller: 'SDGController'
    }).otherwise({
        redirectTo : '/home'
    });

    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.useLoader('i18nLoader');
})

.run(function($rootScope){
    $rootScope.maxOptionSize = 1000;
});
