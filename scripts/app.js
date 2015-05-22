var app = angular.module('TestApp', []);

app.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

app.controller('FeedController', ['$http', '$scope', '$sce', function($http, $scope, $sce){
	$scope.entries = {};
	this.button = "Load more";
	$scope.currentSection = 0;
	
	$scope.nextSection = function() {
		console.log("Get next section");

		$http.get('test.json').
		  success(function(data, status, headers, config) {
		    // This callback will be called asynchronously
		    // when the response is available
		    var sectionSize = 5;
		    var currentIndex = $scope.currentSection * sectionSize;

		    $scope.entries = data.responseData.feed.entries.slice(currentIndex, currentIndex + sectionSize);
		    $scope.currentSection++;
		    $scope.title = data.responseData.feed.title;
		  });
	};

	$scope.nextSection();
}]);

app.directive('infiniteFeed', function($window) {
	return {
		restrict: 'EA',
		templateUrl: 'feed.html',
		link: function (scope, element, attributes, parentController) {

			angular.element($window).bind('scroll', function() {
				// console.log($window.pageYOffset + " ||||| " + getDocHeight() + " ||||| " + $window.innerHeight);

				var endOffset = 500;

				if ($window.pageYOffset >= (getDocHeight() - $window.innerHeight) - endOffset) {
					console.log("Near end");
				}	
			});
		}
	};
});

app.directive('article', function() {
	return {
		restrict: 'EA',
		templateUrl: 'article.html'
	};
});

app.directive('navbar', function() {
	return {
		restrict: 'EA',
		templateUrl: 'navbar.html',
		controller: function($http, $scope){
			$http.get('test.json').
				success(function(data, status, headers, config) {
					// This callback will be called asynchronously
					// when the response is available
					$scope.title = data.responseData.feed.title;
				});
		}
	};
});

function getDocHeight() {
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
}

