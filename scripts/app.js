// Force the scrollbar to start at top to prevent loading all content directly
$(window).on('beforeunload', function(){
  $(window).scrollTop(0);
});

var app = angular.module('FeedApp', ['ui.bootstrap']);

app.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

app.controller('FeedController', ['$http', '$scope', '$sce', '$window', function($http, $scope, $sce, $window){
	$scope.entries = [];
	this.button = "Load more";
	$scope.currentSection = 0;
	$scope.currentScrollSection = 0;
	$scope.previousPageYOffset = 0;
	$scope.pixelsScrolledUp = 0;
	$scope.sectionSize = 5;
	
	$scope.nextSection = function() {
		console.log("Get next section");
		$scope.notLoading = false;

		$http.get('test.json').
		  success(function(data, status, headers, config) {
		    // This callback will be called asynchronously
		    // when the response is available
		    var currentIndex = $scope.currentSection * $scope.sectionSize ;

		    if (data.responseData.feed.entries.length > currentIndex + $scope.sectionSize ) {
			    // $scope.entries = $scope.entries.concat(data.responseData.feed.entries.slice(currentIndex, currentIndex + sectionSize));
		    	var tempEntries = data.responseData.feed.entries.slice(currentIndex, currentIndex + $scope.sectionSize );

			   	for (var i = tempEntries.length - 1; i >= 0; i--) {
			   		tempEntries[i].visible = true;
			   	};

			   	for (var i = $scope.entries.length - $scope.sectionSize ; i >= 0; i--) {
			   		$scope.entries[i].visible = false;
			   	};

			   	$scope.entries = $scope.entries.concat(tempEntries);

		    	$scope.currentSection++;
		    	$scope.currentScrollSection = $scope.currentSection;
		    	$scope.title = data.responseData.feed.title;
		    	$scope.notLoading = true;
		    }    
		  });
	};

	$scope.nextSection();

	// Detects if the user is scrolling
	angular.element($window).bind('scroll', function() {
		// console.log($window.pageYOffset + " ||||| " + getDocHeight() + " ||||| " + $window.innerHeight);
		var endOffset = 500;

		if ($window.pageYOffset > $scope.previousPageYOffset) {
			// Detects if the user is close to the end of the page, then load more content
			if ($window.pageYOffset >= (getDocHeight() - $window.innerHeight) - endOffset) {
				console.log("Near end");
				if ($scope.notLoading) {
					$scope.nextSection();
				}
			}
		}
		else {
			console.log("Scrolling up!");
			$scope.pixelsScrolledUp = $scope.pixelsScrolledUp + ($scope.previousPageYOffset - $window.pageYOffset);

			if ($scope.pixelsScrolledUp >= 800) {
				console.log("Load back unload content");
				$scope.currentScrollSection--;

				for (var i = $scope.sectionSize * $scope.currentScrollSection; i >= 0; i--) {
			   		$scope.entries[i].visible = true;
			   	};

				$scope.pixelsScrolledUp = 0;
			}
		}
		$scope.previousPageYOffset = $window.pageYOffset;
	});
}]);

app.directive('infiniteFeed', function($window) {
	return {
		restrict: 'EA',
		templateUrl: 'feed.html'
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

