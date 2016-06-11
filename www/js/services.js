angular.module('starter.services', [])

.factory('Listings', function($http) {
    var gdoc_to_data = function(data){
        var entries = data.feed.entry;

        var objs = [];
        var temp_obj = {};
        var current_row = 1;
        var col_keys = {};
        var temp_row, temp_col, temp_content;

        var _add_obj = function(o, current_row){
            o.id = current_row;
            objs.push(o);
        };

        for (var i = 0; i < entries.length; i++){
            // Get col, row number
            temp_col = entries[i].title.$t[0];
            temp_row = +(entries[i].title.$t.substr(1));
            // Content
            temp_content = entries[i].content.$t;

            // If next row
            if (temp_row !== current_row){
                // Don't add first row
                if (current_row !== 1){
                    _add_obj(temp_obj, current_row);
                }

                current_row = temp_row;
                temp_obj = {};
            }

            if (current_row === 1){
                col_keys[temp_col] = temp_content;
            }
            else{
                temp_obj[ col_keys[temp_col] ] = temp_content;
            }
        }
        _add_obj(temp_obj, current_row);


        return objs;
    };


    console.log("Getting data");
    var url = "http://spreadsheets.google.com/feeds/cells/1bW6ZucrccaPZwKTg3Q3sHoTW8VeDOXr72gKpHU07IiI/o8adgqx/public/basic?alt=json";
    var data = {
        content: [],
    };

    var raw_data = $http.get(url);

    // var raw_data = $http.get(url).success(function(indata){
    //     console.log("Got data");
    //     data.content = gdoc_to_data(indata);
    //
    //     data.content = data.content.filter(function(item){
    //         return new Date() < new Date(item.datetime_end);
    //     });
    //     data.content = data.content.slice(0, 100);
    // });

    return {
        get: function() {
            return raw_data.then(function(resp){
                console.log("Got data");
                data.content = gdoc_to_data(resp.data);

                data.content = data.content.filter(function(item){
                    return new Date() < new Date(item.datetime_end);
                });
                data.content = data.content.slice(0, 100);

                return data;
            });
        },
    };
})


// http://stackoverflow.com/a/12936046
.factory('clickAnywhereButHereService', function($document){
  var tracker = [];

  return function($scope, expr) {
    var i, t, len;
    for(i = 0, len = tracker.length; i < len; i++) {
      t = tracker[i];
      if(t.expr === expr && t.scope === $scope) {
        return t;
      }
    }
    var handler = function() {
      $scope.$apply(expr);
    };

    $document.on('click', handler);

    // IMPORTANT! Tear down this event handler when the scope is destroyed.
    $scope.$on('$destroy', function(){
      $document.off('click', handler);
    });

    t = { scope: $scope, expr: expr };
    tracker.push(t);
    return t;
  };
})

.directive('clickAnywhereButHere', function($document, clickAnywhereButHereService){
  return {
    restrict: 'A',
    link: function(scope, elem, attr, ctrl) {
      var handler = function(e) {
        e.stopPropagation();
      };
      elem.on('click', handler);

      scope.$on('$destroy', function(){
        elem.off('click', handler);
      });

      clickAnywhereButHereService(scope, attr.clickAnywhereButHere);
    }
  };
});
