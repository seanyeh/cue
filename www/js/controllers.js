angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, Listings) {
    console.log("Dash control");

    $scope.menuState = "closed";
    $scope.closeMenu = function(){
        $scope.menuState = "closed";
    };
    $scope.hello = function(){
        console.log("hello");
    };


    $scope.isMap = true;
    $scope.toggleMap = function(){
        $scope.isMap = !$scope.isMap;
    };


    // For Listings

    $scope.toHumanDate = function(datestring){
        return new Date(datestring).getDate();
    };

    $scope.toHumanMonth = function(datestring){
        return new Date(datestring).toLocaleString("en-us", {"month": "short"});
    };

    $scope.toHumanTime = function(datestring){
        var date = new Date(datestring);
        var ampm = "AM";

        var m = (date.getMinutes() < 10? "0":"") + date.getMinutes();

        // Convert hours to human readable
        var h = date.getHours();
        if (h > 12){
            h -= 12;
            ampm = "PM";
        }
        else if (h === 12){
            ampm = "PM";
        }
        else if (h === 0){
            h = "12";
        }
        // Add "0" to single-digit hours
        h = h < 10? "0" + h: h;

        return "" + h + ":" + m + " " + ampm;
    };

    $scope.createDate = function(datestring){
        if (!datestring){
            return new Date();
        } else {
            return new Date(datestring);
        }
    };


    // Dash Goto
    $scope.dashGoto = function(state){
        $scope.closeMenu();
        $state.go("tab.dash-preferences");
    };
})

.controller('DashPreferencesCtrl', function($scope) {
})

.controller('ListingDetailCtrl', function($scope, $stateParams) {
    $scope.getID = function(){
        // return +(location.href.substr(1 + location.href.lastIndexOf("/")));
        return +($stateParams.listingId);
    };

    $scope.getListingFromID = function(id){
        for (var i = 0; i < $scope.data.content.length; i++){
            console.log(id + " vs. " + $scope.data.content[i].id);
            if (id === $scope.data.content[i].id){
                return $scope.data.content[i];
            }
        }
        console.log("could not find!");
        return null;
    };

    $scope.getListing = function(){
        return $scope.getListingFromID($scope.getID());
    };

    $scope.listing = $scope.getListing();
})

.controller('SavedCtrl', function($scope) {
})

.controller('SettingsCtrl', function($scope, $ionicSideMenuDelegate) {
});
