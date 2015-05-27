// Force the scrollbar to start at top to prevent loading all content directly
$(window).on('beforeunload', function(){
  $(window).scrollTop(0);
});

var app = angular.module('FeedApp', ['ui.bootstrap', 'ngRoute']);

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/article/:title', {
        templateUrl: 'partials/details.html',
        controller: 'ArticleController',
        controllerAs: 'article'
      })
      .when('/pagination', {
        templateUrl: 'partials/pagination-feed.html',
        controller: 'PaginationDemoCtrl',
        controllerAs: 'PaginationCtrl'
      })
      .otherwise({
        templateUrl: 'partials/feed.html',
        controller: 'FeedController',
        controllerAs: 'FeedCtrl'
      });

    $locationProvider.html5Mode(true);
}]);

app.controller('ArticleController', ['$routeParams', '$scope', '$http', function($routeParams, $scope, $http) {
  this.name = "ArticleController";
  $scope.params = $routeParams;

  $http.get('test.json').
		  success(function(data, status, headers, config) {
		    // This callback will be called asynchronously
		    // when the response is available

		    for (var i = data.responseData.feed.entries.length - 1; i >= 0; i--) {
		  	if (data.responseData.feed.entries[i].title === $scope.params.title){
		  		$scope.details = data.responseData.feed.entries[i].content;
		  		$scope.title = data.responseData.feed.entries[i].title;
		  		break;
		  	}
		  };
	  });
  $scope.$root.$broadcast("ShowDetails", {});
}]);

app.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);


app.controller('FeedController', ['$http', '$scope', '$sce', '$window', function($http, $scope, $sce, $window){
	this.name = "FeedController";
	$scope.entries = [];
	$scope.button = "Load more";
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

app.controller('PaginationDemoCtrl', function($http, $scope) {
	this.name = "PaginationDemoCtrl";
	$scope.totalItems = 64;
	$scope.currentPage = 4;

	$scope.entries = [];
	$scope.currentSection = 0;
	$scope.currentScrollSection = 0;
	$scope.previousPageYOffset = 0;
	$scope.pixelsScrolledUp = 0;
	$scope.sectionSize = 5;

	$scope.setPage = function (pageNo) {
		$scope.currentPage = pageNo;
	};

	$scope.pageChanged = function() {
		$scope.getSection($scope.bigCurrentPage);
		$(window).scrollTop(0);
	};

	$scope.getSection = function(sectionNumber) {
		console.log("Get section");
		$scope.notLoading = false;

		$http.get('test.json').
		  success(function(data, status, headers, config) {
		    // This callback will be called asynchronously
		    // when the response is available
		    var currentIndex = sectionNumber * $scope.sectionSize ;

		    if (data.responseData.feed.entries.length > currentIndex + $scope.sectionSize ) {
			    // $scope.entries = $scope.entries.concat(data.responseData.feed.entries.slice(currentIndex, currentIndex + sectionSize));
		    	var tempEntries = data.responseData.feed.entries.slice(currentIndex, currentIndex + $scope.sectionSize );

			   	for (var i = tempEntries.length - 1; i >= 0; i--) {
			   		tempEntries[i].visible = true;
			   	};

			   	$scope.entries = tempEntries;

		    	$scope.currentSection++;
		    	$scope.currentScrollSection = $scope.currentSection;
		    	$scope.title = data.responseData.feed.title;
		    	$scope.notLoading = true;
		    	$scope.bigTotalItems = data.responseData.feed.entries.length;
		    }    
		  });
	};

	$scope.getSection(1);
  	$scope.maxSize = $scope.sectionSize;
  	$scope.bigCurrentPage = 1;
});

app.directive('article', function() {
	return {
		restrict: 'EA',
		templateUrl: 'partials/article.html'
	};
});

app.directive('navbar', function() {
	return {
		restrict: 'EA',
		templateUrl: 'partials/navbar.html',
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

