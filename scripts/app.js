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

import '../components/home/home-controller.js'
import '../components/outree/orgunit-controller.js'
import '../components/settings/settings-controller.js'
import '../components/mandate/mandate-controller.js'
import '../components/ati/ati-controller.js'

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
