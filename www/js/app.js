// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ng-mfb']);



app.controller('mapController', ["$scope", "$http", function($scope, $http){
    $scope.init = function(){
        mapboxgl.accessToken = $scope.MAPBOX_TOKEN;
        $scope.shared.map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
            center: [-87.67267, 42.05334], // starting position
            zoom: 15 // starting zoom
        });

        // $scope.shared.map.on("load", $scope.addMapMarker);
        // $scope.shared.map.on('mousemove', function (e) {
        //     var features = $scope.shared.map.queryRenderedFeatures(e.point, { layers: ['markers'] });
        //     $scope.shared.map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        // });
    };


}]);



app.controller('mainController', ["$scope", "$window", "$http", "Listings", function($scope, $window, $http, Listings){
    // Mapbox Token here
    $scope.MAPBOX_TOKEN = "XXXXXXXXX";

    $scope.hello = "HELLOWORLD";

    $scope.helloworld = function(){ console.log("helloworld"); };

    $scope.data = [];
    $scope.filteredData = [];

    $scope.getFilteredData = function(){
        console.log("getFilteredData");

        // Return [] if data not loaded yet
        if (!$scope.data.content){
            // console.log("not loaded yet? " + JSON.stringify($scope.data));
            return [];
        }

        // Return data if "show all events" is enabled
        if (!$scope.preferences.showFiltered){
            console.log("show all data");
            return $scope.data.content;
        }

        var temp;

        var filteredData = $scope.data.content.filter(function(item){
            temp = false;
            // console.log("getFilteredData: $scope.preferences.categories: " + JSON.stringify($scope.preferences.categories));
            $scope.preferences.categories.forEach(function(cat){
                if (item.category === cat){
                    temp = true;
                }
            });
            return temp;
        });
        console.log("preferences: " + JSON.stringify($scope.preferences));
        // console.log("filteredData: " + JSON.stringify(filteredData));

        return filteredData;
    };

    $scope.updateFilteredData = function(){
        $scope.filteredData = $scope.getFilteredData();
    };


    $scope.CATEGORIES = [
        "Academic",
        "Athletics",
        "Fine Arts",
        "Fitness & Recreation",
        "Global & Civic Engagement",
        "Lectures & Meetings",
        "Multicultural & Diversity",
        "Religious",
        "Social",
        "Training",
        "Other"
    ];

    // Gets preferences from localstorage
    $scope.localStorageGet = function(s, defaultValue){
        var prefString = $window.localStorage[s];
        if (typeof prefString === "undefined"){
            return defaultValue;
        }

        return JSON.parse(prefString);
    };

    $scope.localStorageSet = function(key, val){
        $window.localStorage[key] = val;
    };


    /*
     * Preferences
     */
    // Initialized with preferences from localstorage
    $scope.preferences = {
        showFiltered: $scope.localStorageGet("showFiltered", true),
        categories: $scope.localStorageGet("categories", [])
    };

    $scope.preferencesModel = {
        showFiltered: true,
        categories: {}
    };

    $scope.updatePreferences = function(){
        // Update showFiltered
        $scope.preferences.showFiltered = $scope.preferencesModel.showFiltered;
        $scope.localStorageSet("showFiltered", $scope.preferencesModel.showFiltered);

        // Update Categories
        var cats = Object.keys($scope.preferencesModel.categories).filter(function(x){
            return $scope.preferencesModel.categories[x];
        });

        // Store to $scope.preferences
        $scope.preferences.categories = cats;

        var catsJSON = JSON.stringify(cats);

        // Store to localstorage
        $scope.localStorageSet("categories", catsJSON);


        // Update filtered data
        $scope.updateFilteredData();
    };


    $scope._initPreferencesModel = function(){
        /*
         * showFiltered
         */
        $scope.preferencesModel.showFiltered = $scope.preferences.showFiltered;

        /*
         * Categories
         */
        // Set all categories in localstorage to True
        $scope.preferences.categories.forEach(function(x){
            $scope.preferencesModel.categories[x] = true;
        });
        // Set all others to false
        $scope.CATEGORIES.forEach(function(x){
            if (!$scope.preferencesModel.categories[x]){
                $scope.preferencesModel.categories[x] = false;
            }
        });
    };


    /*
     * Map
     */


    $scope.shared = {
        map: null
    };

    $scope.markerCache = {};
    $scope._addMapMarker = function(searchString, title, markerID){
        var search = encodeURI(searchString);
        console.log("Searching location: " + search);
        var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + search + ".json?access_token=" + $scope.MAPBOX_TOKEN;
        $http.get(url).success(function(data){
            // No results found, return
            if (data.features.length === 0){ return; }

            var coords = data.features[0].center;

            // only show one event per location
            if ($scope.markerCache[JSON.stringify(coords)]){
                return;
            }
            // Set cache
            $scope.markerCache[JSON.stringify(coords)] = true;

            console.log("Success: " + JSON.stringify(data.features));
            console.log("Success: first: " + JSON.stringify(data.features[0]));

            $scope.shared.map.addSource(markerID, {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": coords
                        },
                        "properties": {
                            "title": title,
                            "marker-symbol": "marker",
                        }
                    }, ]
                }
            });

            $scope.shared.map.addLayer({
                "id": markerID,
                "type": "symbol",
                "source": markerID,
                "layout": {
                    "icon-image": "{marker-symbol}-15",
                    "text-field": "{title}",
                    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                    "text-offset": [0, 0.6],
                    "text-anchor": "top"
                }
            });
        });
    };


    $scope.refreshMapMarkers = function(){
        if ($scope.filteredData.length > 20){
            // Show first one on map
            // var firstEvent = $scope.filteredData[0];

            for (var i = 0; i < 20; i++){
                $scope._addMapMarker($scope.filteredData[i].location, $scope.filteredData[i].title, "markers" + i);
            }
        }
    };


    /*
     * INIT
     */
    $scope.init = function(){
        // init data
        Listings.get().then(function(resp){
            console.log("success");
            $scope.data = resp;
            $scope.updateFilteredData();

            // Add map
            $scope.refreshMapMarkers();
        });

        $scope._initPreferencesModel();
    };
}]);





app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
  .state('tab.dash-preferences', {
    url: '/dash/preferences',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash-preferences.html',
        controller: 'DashPreferencesCtrl'
      }
    }
  })

    .state('tab.listing-detail', {
      url: '/listings/:listingId',
      views: {
        'tab-dash': {
          templateUrl: 'templates/listing-detail.html',
          controller: 'ListingDetailCtrl'
        }
      }
    })


  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});

app.config(function($ionicConfigProvider){
    // // Tabs on top always
    // $ionicConfigProvider.tabs.position('top');
});




