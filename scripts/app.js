var app = angular.module('TestApp', []);

app.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

app.controller('FeedController', ['$http', '$scope', '$sce', function($http, $scope, $sce){
	$scope.entries = {hej: "hej"};
	this.button = "Load more";
	$scope.currentSection = 0;
	
	$scope.getSection = function() {
		console.log("hejjj");


		$http.get('test.json').
		  success(function(data, status, headers, config) {
		    // this callback will be called asynchronously
		    // when the response is available
		    $scope.entries = data.responseData.feed.entries.slice(0, ($scope.currentSection + 1) * 5);
		    $scope.currentSection++;
		    $scope.title = data.responseData.feed.title;
		    
		  });
	};

	 $scope.getSection();
}]);

app.directive('infiniteFeed', ['$http', function($http) {
	return {
		restrict: 'EA'
	};
}]);


