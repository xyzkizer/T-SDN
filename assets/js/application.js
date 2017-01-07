angular.module('SDN', ['ngRoute', 'ngMessages', 'ngMaterial', 'md.data.table', 'smDateTimeRangePicker', 'promise-tracker'], [
  '$routeProvider', '$locationProvider', '$mdThemingProvider', '$mdIconProvider',
  function($routeProvider, $locationProvider, $mdThemingProvider, $mdIconProvider){

    $locationProvider.html5Mode(true);

    $routeProvider
    .when('/topology', {
      templateUrl: 'partials/topology.tmpl.html',
      controller: 'TopologyCtrl'
    })
    .when('/configurations/list', {
      templateUrl: 'partials/configurations.tmpl.html',
      controller: 'ServiceCtrl'
    })
    .when('/configurations/sked', {
      templateUrl: 'partials/config-sked.tmpl.html',
      controller: 'ServiceRegisterCtrl'
    })
    .when('/devices/seps', {
      templateUrl: 'partials/service-end-points.tmpl.html',
      controller: 'SEPCtrl'
    })
    .when('/devices/links', {
      templateUrl: 'partials/links.tmpl.html',
      controller: 'LinkCtrl'
    })
    .when('/managers', {
      templateUrl: 'partials/managers.tmpl.html',
      controller: 'ManagerCtrl'
    })
    .when('/404', {
      templateUrl: 'views/errors/404.html'
    });

    $mdThemingProvider.definePalette('docs-blue', $mdThemingProvider.extendPalette('blue', {
        '50': '#DCEFFF',
        '100': '#AAD1F9',
        '200': '#7BB8F5',
        '300': '#4C9EF1',
        '400': '#1C85ED',
        '500': '#106CC8',
        '600': '#0159A2',
        '700': '#025EE9',
        '800': '#014AB6',
        '900': '#013583',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 200 A100',
        'contrastStrongLightColors': '300 400 A200 A400'
    }));
    $mdThemingProvider.definePalette('docs-red', $mdThemingProvider.extendPalette('red', {
        'A100': '#DE3641'
    }));

    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('yellow')
        .dark();

    $mdIconProvider.icon('md-toggle-arrow', 'images/toggle-arrow.svg', 48);

    $mdThemingProvider.theme('default')
        .primaryPalette('docs-blue')
        .accentPalette('docs-red');

    $mdThemingProvider.enableBrowserColor();

    $routeProvider.otherwise('/topology');

    $locationProvider.hashPrefix('!');

}])
.config(['$mdThemingProvider', 'pickerProvider', function($mdThemingProvider, pickerProvider, picker) {
  pickerProvider.setOkLabel('确定');
  pickerProvider.setCancelLabel('关闭');

}])
.factory('menu', ['$location', '$rootScope', '$http', '$window', function($location, $rootScope, $http, $window){

  var sections = [{
    name: '节点拓扑',
    url: '/topology',
    type: 'link'
  },
  {
    name: '配置管理',
    type: 'toggle',
    pages: [{
      name: '业务列表',
      url: '/configurations/list',
      type: 'link'
    },
    {
      name: '业务预约',
      url: '/configurations/sked',
      type: 'link'

    }]
  },
  {
    name: '设备管理',
    type: 'toggle',
    pages: [{
      name: 'Service-End-Point 列表',
      url: '/devices/seps',
      type: 'link'
    },
    {
      name: '连接列表',
      url: '/devices/links',
      type: 'link'

    }]
  },
  {
    name: '权限管理',
    url: '/managers',
    type: 'link'
  }];

  sections.push();

  var self;

  $rootScope.$on('$locationChangeSuccess', onLocationChange);

  return self = {

    sections: sections,

    selectSection: function(section) {
      self.openedSection = section;
    },

    toggleSelectSection: function(section) {
      self.openedSection = (self.openedSection === section ? null : section);
    },

    isSectionSelected: function(section) {
      return self.openedSection === section;
    },

    selectPage: function(section, page) {
      self.currentSection = section;
      self.currentPage = page;
    },

    isPageSelected: function(page) {
      return self.currentPage === page;
    }

  };
  function onLocationChange() {
    var path = $location.path();
    var topoLink = {
      name: "节点拓扑",
      url:  "/topology",
      type: "link"
    };

    if (path == '/') {
      self.selectSection(topoLink);
      self.selectPage(topoLink, topoLink);
      return;
    }

    var matchPage = function(section, page) {
      if (path.indexOf(page.url) !== -1) {
        self.selectSection(section);
        self.selectPage(section, page);
      }
    };

    sections.forEach(function(section) {
      if (section.children) {
        // matches nested section toggles, such as API or Customization
        section.children.forEach(function(childSection){
          if(childSection.pages){
            childSection.pages.forEach(function(page){
              matchPage(childSection, page);
            });
          }
        });
      }
      else if (section.pages) {
        // matches top-level section toggles, such as Demos
        section.pages.forEach(function(page) {
          matchPage(section, page);
        });
      }
      else if (section.type === 'link') {
        // matches top-level links, such as "Getting Started"
        matchPage(section, section);
      }
    });
  }

}])
.directive('validate', function () {
    return {
        restrict: 'A',
        require: 'ngModel', // require:  '^form',

        link: function (scope, element, attrs, ctrl) {
            console.log(scope.sform.$error);

        }
    };
})
.directive('menuLink', function() {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-link.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();
      $scope.isSelected = function() {
        return controller.isSelected($scope.section);
      };

      $scope.focusSection = function() {
        // set flag to be used later when
        // $locationChangeSuccess calls openPage()
        controller.autoFocusContent = true;
      };
    }
  };
})
.directive('menuToggle', ['$mdUtil', '$animateCss', '$$rAF', function($mdUtil, $animateCss, $$rAF) {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-toggle.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      // Used for toggling the visibility of the accordion's content, after
      // all of the animations are completed. This prevents users from being
      // allowed to tab through to the hidden content.

      $scope.renderContent = false;

      $scope.isOpen = function() {
        return controller.isOpen($scope.section);
      };

      $scope.toggle = function() {
        controller.toggleOpen($scope.section);
      };

      $mdUtil.nextTick(function() {
        $scope.$watch(function () {
          return controller.isOpen($scope.section);
        }, function (open) {
          var $ul = $element.find('ul');
          var $li = $ul[0].querySelector('a.active');

          if (open) {
            $scope.renderContent = true;
          }

          $$rAF(function() {
            var targetHeight = open ? $ul[0].scrollHeight : 0;

            $animateCss($ul, {
              easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
              to: { height: targetHeight + 'px' },
              duration: 0.75 // seconds
            }).start().then(function() {
              var $li = $ul[0].querySelector('a.active');
              $scope.renderContent = open;

              if (open && $li && $ul[0].scrollTop === 0) {
                var activeHeight = $li.scrollHeight;
                var activeOffset = $li.offsetTop;
                var offsetParent = $li.offsetParent;
                var parentScrollPosition = offsetParent ? offsetParent.offsetTop : 0;

                // Reduce it a bit (2 list items' height worth) so it doesn't touch the nav
                var negativeOffset = activeHeight * 2;
                var newScrollTop = activeOffset + parentScrollPosition - negativeOffset;

                $mdUtil.animateScrollTo(document.querySelector('.docs-menu').parentNode, newScrollTop);
              }
            });
          });
        });
      });

      var parentNode = $element[0].parentNode.parentNode.parentNode;
      if(parentNode.classList.contains('parent-list-item')) {
        var heading = parentNode.querySelector('h2');
        $element[0].firstChild.setAttribute('aria-describedby', heading.id);
      }
    }
  };
}])
.controller('ToolbarCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {


}])
.controller('TopologyCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {


}])
.controller('ServiceRegisterCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.selected = [];

  $scope.query = {
    order: 'from',
    limit: 5,
    page: 1
  };

  $scope.loadStuff = function () {
    $scope.promise = $http.get('/registers')
    .then(
      function(answer) {
        $scope.registers = answer.data;
      },
      function(error) {
      },
      function(progress) {
      }
    );
  };
  $scope.loadStuff();

}])
.controller('ServiceCtrl', ['$scope', '$http', '$mdDialog', function($scope, $http, $mdDialog) {

  $scope.selected = [];

  $scope.limitOptions = [5, 10, 15];
  $scope.options = {
    rowSelection: true,
    multiSelect: true,
    autoSelect: true,
    decapitate: false,
    largeEditDialog: false,
    boundaryLinks: false,
    limitSelect: true,
    pageSelect: true
  };
  $scope.query = {
    order: 'service.name[0].value',
    limit: 10,
    page: 1
  };

  $scope.logItem = function (item) {
    console.log(item.uuid, 'was selected');
    console.log($scope.selected);
  };

  $scope.loadStuff = function () {
    $scope.promise = $http.get('/services')
    .then(
      function(answer) {
        $scope.services = answer.data;
      },
      function(error) {
      },
      function(progress) {
      }
    );
  };
  $scope.loadStuff();

  $scope.showRegisterDialog = function(ev){
    $mdDialog.show({
      controller: RegisterDialogCtrl,
      controllerAs: 'ctrl',
      templateUrl: 'partials/service-register.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals:{selectedService: $scope.selected}
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
  };

  RegisterDialogCtrl.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', 'promiseTracker', '$timeout', 'smDateTimePicker', 'selectedService'];
  function RegisterDialogCtrl($scope, $rootScope, $mdDialog, $http, promiseTracker, $timeout, smDateTimePicker, selectedService) {

    var self = this;
    self.everyday = true;

    self.submit = function(form) {

      $scope.submitted = true;

      if (form.$invalid) {
        console.log("register form invalid.");
        return;
      }
      if (selectedService.length > 1) {
        return;
      }

      $scope.register.service = selectedService[0]
      $scope.register.everyday = self.everyday;

      $promise = $http.post('/registers', $scope.register)
        .then(
          function(response) {
            if (response.status == 'OK') {
              $scope.submitted = false;
            } else {

            }
          },
          function(error) {
          },
          function(progress) {
          })
        .finally(function() {
          $mdDialog.cancel();
      });
    };

    self.cancel = function() {
      $mdDialog.cancel();
    };
  };

}])
.controller('SEPCtrl', ['$scope', '$rootScope', '$http', '$mdDialog', function($scope, $rootScope, $http, $mdDialog) {
  $scope.delete = function(data) {
    data.nodes = [];
  };

  $scope.add = function(data) {
    var post = data.nodes.length + 1;
    var newName = data.name + '-' + post;
    data.nodes.push({name: newName, expanded:true, nodes: []});
  };

  $scope.toggle = function(data) {
    data.expanded = !data.expanded;
  };

  $scope.connect = function(ev){
    $mdDialog.show({
      controller: DialogCtrl,
      controllerAs: 'ctrl',
      templateUrl: 'partials/sep-connect.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });

  };

  $scope.showDetail = function(data) {
    $scope.promise = $http.get('/seps/'+data.name)
    .then(
      function(answer) {
        $rootScope.sep = answer.data;
      },
      function(error) {
      },
      function(progress) {
      }
    );
  };

  $scope.promise = $http.get('/seps')
  .then(
    function(answer) {
      $scope.tree = answer.data.topos;
      $rootScope.seps = answer.data.seps;
    },
    function(error) {
    },
    function(progress) {
    }
  );

  DialogCtrl.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', 'promiseTracker', '$timeout'];
  function DialogCtrl($scope, $rootScope, $mdDialog, $http, promiseTracker, $timeout) {

    var self = this;
    self.seps = $rootScope.seps.map(function(sep){
      return {
          value: sep.toLowerCase(),
          display: sep
      };
    });

    self.submit = function(form) {

      $scope.submitted = true;
      $scope.task.from = $rootScope.sep.name[0].value

      if (form.$invalid) {
        return;
      }

      $promise = $http.post('/services', $scope.task)
        .then(
          function(response) {
            if (response.status == 'OK') {
              $scope.submitted = false;
            } else {

            }
          },
          function(error) {
          },
          function(progress) {
          })
        .finally(function() {
          $mdDialog.cancel();
      });
    };

    self.cancel = function() {
      $mdDialog.cancel();
    };

    self.querySearch = function querySearch (query) {
      return query?self.seps.filter( createFilterFor(query) ) : self.seps;
    };

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(sep) {
        return (sep.value.indexOf(lowercaseQuery) !== -1);
      };
    };

  };

}])
.controller('LinkCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.selected = [];

  $scope.query = {
    order: 'name',
    limit: 5,
    page: 1
  };

  $scope.loadStuff = function () {
    $scope.promise = $http.get('/links')
    .then(
      function(answer) {
        $scope.links= answer.data;
      },
      function(error) {
      },
      function(progress) {
      }
    );
  };
  $scope.loadStuff();
}])
.controller('ManagerCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {


}])
.controller('SDNCtrl', [
  '$scope','$mdSidenav', '$timeout', '$mdDialog', '$mdComponentRegistry', 'menu', '$location', '$rootScope', '$mdUtil',
  function($scope, $mdSidenav, $timeout, $mdDialog, $mdComponentRegistry, menu, $location, $rootScope, $mdUtil) {

    $scope.menu = menu;

    $scope.path = path;
    $scope.goHome = goHome;
    $scope.openMenu = openMenu;
    $scope.closeMenu = closeMenu;
    $scope.isSectionSelected = isSectionSelected;
    $scope.scrollTop = scrollTop;

    $rootScope.$on('$locationChangeSuccess', openPage);
    $scope.focusMainContent = focusMainContent;

    Object.defineProperty($rootScope, "relatedPage", {
      get: function () { return null; },
      set: angular.noop,
      enumerable: true,
      configurable: true
    });

    $rootScope.redirectToUrl = function(url) {
      $location.path(url);
      $timeout(function () { $rootScope.relatedPage = null; }, 100);
    };

    // Methods used by menuLink and menuToggle directives
    this.isOpen = isOpen;
    this.isSelected = isSelected;
    this.toggleOpen = toggleOpen;
    this.autoFocusContent = false;


    var mainContentArea = document.querySelector("[role='main']");
    var scrollContentEl = mainContentArea.querySelector('md-content[md-scroll-y]');

    $mdComponentRegistry.when('left').then(function() {
      // Now you can use $mdSidenav('left') or $mdSidenav('left', true) without getting an error.
      $mdSidenav('left').toggle();
    });

    function closeMenu() {
      $timeout(function() { $mdSidenav('left').close(); });
    }

    function openMenu() {
      $timeout(function() { $mdSidenav('left').open(); });
    }

    function path() {
      return $location.path();
    }

    function scrollTop() {
      $mdUtil.animateScrollTo(scrollContentEl, 0, 200);
    }

    function goHome($event) {
      menu.selectPage(null, null);
      $location.path( '/' );
    }

    function openPage() {
      $scope.closeMenu();

      if (self.autoFocusContent) {
        focusMainContent();
        self.autoFocusContent = false;
      }
    }

    function focusMainContent($event) {
      // prevent skip link from redirecting
      if ($event) { $event.preventDefault(); }

      $timeout(function(){
        mainContentArea.focus();
      },90);

    }

    function isSelected(page) {
      return menu.isPageSelected(page);
    }

    function isSectionSelected(section) {
      var selected = false;
      var openedSection = menu.openedSection;
      if(openedSection === section){
          selected = true;
      }
      else if(section.children) {
          section.children.forEach(function(childSection) {
              if(childSection === openedSection){
                  selected = true;
              }
          });
      }
      return selected;
    }

    function isOpen(section) {
      return menu.isSectionSelected(section);
    }

    function toggleOpen(section) {
      menu.toggleSelectSection(section);
    }

}])
.filter('nospace', function () {
  return function (value) {
    return (!value) ? '' : value.replace(/ /g, '');
  };
})
.filter('humanizeDoc', function() {
    return function(doc) {
        if (!doc) return;
        if (doc.type === 'directive') {
            return doc.name.replace(/([A-Z])/g, function($1) {
                return '-'+$1.toLowerCase();
            });
        }
        return doc.label || doc.name;
    };
})
.service('asyncService', function($http, $q) {
  return {
    loadDataFromUrls: function(urls) {
      var deferred = $q.defer();
      var urlCalls = [];
      angular.forEach(urls, function(url) {
        urlCalls.push($http.get(url.url));
      });
      $q.all(urlCalls).then (
        function(results) {
          deferred.resolve(JSON.stringify(results))
        },
        function(errors) {
          deferred.reject(errors);
        },
        function(updates) {
          deferred.update(updates);
        }
      );
      return deferred.promise;
    }
  };
})
;
