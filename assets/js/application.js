angular.module('SDN', ['ngRoute', 'ngMessages', 'ngMaterial', 'md.data.table', 'smDateTimeRangePicker', 'ngCookies', 'ivh.treeview', 'treeControl', 'promise-tracker'], [
  '$routeProvider', '$locationProvider', '$mdThemingProvider', '$mdIconProvider',
  function ($routeProvider, $locationProvider, $mdThemingProvider, $mdIconProvider) {

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
      .when('/configurations/ovpnlist', {
        templateUrl: 'partials/ovpn.tmpl.html',
        controller: 'OVPNCtrl'
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
      .when('/managers/list', {
        templateUrl: 'partials/managers.tmpl.html',
        controller: 'ManagerCtrl'
      })
      .when('/managers/authority', {
        templateUrl: 'partials/managers.authority.html',
        controller: 'ManagerAuthCtrl'
      })
      .when('/test', {
        templateUrl: 'partials/test.tmpl.html',
        controller: 'TestCtrl'
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
  .config(['$mdIconProvider', function ($mdIconProvider) {
    $mdIconProvider.fontSet('md', 'material-icons');
  }])
  .config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self'
    ]);
  }])
  .config(['$mdThemingProvider', 'pickerProvider', function ($mdThemingProvider, pickerProvider, picker) {
    pickerProvider.setOkLabel('确定');
    pickerProvider.setCancelLabel('关闭');

  }])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }])
  .config(['ivhTreeviewOptionsProvider', function (ivhTreeviewOptionsProvider) {
    ivhTreeviewOptionsProvider.set({
      twistieCollapsedTpl: '<md-icon style="margin-top: -2px;" ng-hide="trvw.isLeaf(node) || trvw.isExpanded(node)" md-svg-src="assets/ic_add_circle_outline_black_24px.svg" aria-label="expand"></md-icon>',
      // twistieCollapsedTpl: '<i class="material-icons" style="margin-top: -2px;" ng-hide="trvw.isLeaf(node) || trvw.isExpanded(node)" aria-label="expand">add_circle_outline</i>',
      twistieExpandedTpl: '<md-icon style="margin-top: -2px;" ng-hide="trvw.isLeaf(node) || !trvw.isExpanded(node)" md-svg-src="assets/ic_remove_circle_outline_black_24px.svg" aria-label="collopse"></md-icon>',
      twistieLeafTpl: '&#9679',
      defaultSelectedState: false,
      expandToDepth: 1,
      validate: false
      // nodeTpl: [
      // '<div title="{{trvw.label(node)}}">',
      //   '<span>',
      //     '<md-icon style="margin-top: -2px;" ng-hide="trvw.isLeaf(node) || trvw.isExpanded(node)" md-svg-src="assets/ic_add_circle_outline_black_24px.svg" aria-label="expand" ivh-treeview-toggle></md-icon>',
      //     '<md-icon style="margin-top: -2px;" ng-hide="trvw.isLeaf(node) || !trvw.isExpanded(node)" md-svg-src="assets/ic_remove_circle_outline_black_24px.svg" aria-label="collopse" ivh-treeview-toggle></md-icon>',
      //   '</span>',
      //   '<md-checkbox aria-label="service-end-point" ng-show="trvw.isLeaf(node) && trvw.useCheckboxes()">',
      //   '</md-checkbox>',
      //   '<span ng-click="showDetail(node.label)" class="ivh-treeview-node-label" ivh-treeview-toggle>',
      //    '{{trvw.label(node)}}',
      //   '</span>',
      //   '<div ivh-treeview-children></div>',
      // '</div>'
      // ].join('')
    });
  }])
  .factory('authInterceptor', ['auth', function (auth) {
    return {
      // automatically attach Authorization header
      // TODO
      request: function (config) {
        var token = auth.getToken();
        if (config.url.indexOf(".js") !== 0 && token) {
          config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      },

      response: function (res) {
        if (res.data.token) {
          auth.saveToken(res.data.token);
        }

        return res;
      }
    };

  }])
  .service('auth', ['$window', function ($window) {
    var srvc = this;

    srvc.parseJwt = function (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    };

    srvc.saveToken = function (token) {
      $window.sessionStorage['jwtToken'] = token
    };

    srvc.logout = function (token) {
      $window.sessionStorage.removeItem('jwtToken');
    };

    srvc.getToken = function () {
      return $window.sessionStorage['jwtToken'];
    };

    srvc.isAuthed = function () {
      var token = srvc.getToken();
      if (token) {
        var params = srvc.parseJwt(token);
        return Math.round(new Date().getTime() / 1000) <= params.exp;
      } else {
        return false;
      }
    };

  }])
  .service('user', ['$http', 'auth', function ($http, auth) {
    var srvc = this;
    srvc.login = function (username, password) {
      return $http.post('/login', {
        username: username,
        password: password
      });
    };

  }])
  .directive('treeNode', ['ivhTreeviewMgr', '$http', '$rootScope', function (ivhTreeviewMgr, $http, $rootScope) {
    return {
      restrict: 'AE',
      require: '^ivhTreeview',
      templateUrl: 'partials/tree-node.tmpl.html',
      link: function (scope, element, attrs, ctrl) {
        scope.showDetail = function (name) {
          $http.get('/seps/' + name)
            .then(
              function (answer) {
                $rootScope.sep = answer.data;
              },
              function (error) {
              },
              function (progress) {
              }
            );
        };
      }
    };
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
  .factory('menu', ['$location', '$rootScope', '$http', '$window', function ($location, $rootScope, $http, $window) {

    var sections = [
      {
        name: '节点拓扑',
        url: '/topology',
        type: 'link'
      },
      {
        name: '配置管理',
        type: 'toggle',
        pages: [
          {
            name: '业务列表',
            url: '/configurations/list',
            type: 'link'
          },
          {
            name: '分组列表',
            url: '/configurations/ovpnlist',
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
          name: '节点列表',
          url: '/devices/seps',
          type: 'link'
        },
          {
            name: '连接列表',
            url: '/devices/links',
            type: 'link'

          }, {
            name: 'test',
            url: '/test',
            type: 'link'
          }]
      },
      {
        name: '权限管理',
        type: 'toggle',
        pages: [{
          name: '用户列表',
          url: '/managers/list',
          type: 'link'
        }, {
          name: '资源分配',
          url: '/managers/authority',
          type: 'link'
        }]
      }];


    sections.push();

    var self;

    $rootScope.$on('$locationChangeSuccess', onLocationChange);

    return self = {

      sections: sections,

      addmenu: function (section) {
        self.sections.push(section);
      },
      operatormenu: function () {
        self.sections.forEach(function (section, index) {

          if (section.name === "权限管理") {
            sections.splice(index, 1);
          }
        })
      },
      selectSection: function (section) {
        self.openedSection = section;
      },

      toggleSelectSection: function (section) {
        self.openedSection = (self.openedSection === section ? null : section);
      },

      isSectionSelected: function (section) {
        return self.openedSection === section;
      },

      selectPage: function (section, page) {
        self.currentSection = section;
        self.currentPage = page;
      },

      isPageSelected: function (page) {
        return self.currentPage === page;
      }

    };
    function onLocationChange() {
      var path = $location.path();
      var topoLink = {
        name: "节点拓扑",
        url: "/topology",
        type: "link"
      };

      if (path == '/') {
        self.selectSection(topoLink);
        self.selectPage(topoLink, topoLink);
        return;
      }

      var matchPage = function (section, page) {
        if (path.indexOf(page.url) !== -1) {
          self.selectSection(section);
          self.selectPage(section, page);
        }
      };

      sections.forEach(function (section) {
        if (section.children) {
          // matches nested section toggles, such as API or Customization
          section.children.forEach(function (childSection) {
            if (childSection.pages) {
              childSection.pages.forEach(function (page) {
                matchPage(childSection, page);
              });
            }
          });
        }
        else if (section.pages) {
          // matches top-level section toggles, such as Demos
          section.pages.forEach(function (page) {
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
  .directive('menuLink', function () {
    return {
      scope: {
        section: '='
      },
      templateUrl: 'partials/menu-link.tmpl.html',
      link: function ($scope, $element) {
        var controller = $element.parent().controller();
        $scope.isSelected = function () {
          return controller.isSelected($scope.section);
        };

        $scope.focusSection = function () {
          // set flag to be used later when
          // $locationChangeSuccess calls openPage()
          controller.autoFocusContent = true;
        };
      }
    };
  })
  .directive('menuToggle', ['$mdUtil', '$animateCss', '$$rAF', function ($mdUtil, $animateCss, $$rAF) {
    return {
      scope: {
        section: '='
      },
      templateUrl: 'partials/menu-toggle.tmpl.html',
      link: function ($scope, $element) {
        var controller = $element.parent().controller();

        // Used for toggling the visibility of the accordion's content, after
        // all of the animations are completed. This prevents users from being
        // allowed to tab through to the hidden content.

        $scope.renderContent = false;

        $scope.isOpen = function () {
          return controller.isOpen($scope.section);
        };

        $scope.toggle = function () {
          controller.toggleOpen($scope.section);
        };

        $mdUtil.nextTick(function () {
          $scope.$watch(function () {
            return controller.isOpen($scope.section);
          }, function (open) {
            var $ul = $element.find('ul');
            var $li = $ul[0].querySelector('a.active');

            if (open) {
              $scope.renderContent = true;
            }

            $$rAF(function () {
              var targetHeight = open ? $ul[0].scrollHeight : 0;

              $animateCss($ul, {
                easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
                to: {height: targetHeight + 'px'},
                duration: 0.75 // seconds
              }).start().then(function () {
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
        if (parentNode.classList.contains('parent-list-item')) {
          var heading = parentNode.querySelector('h2');
          $element[0].firstChild.setAttribute('aria-describedby', heading.id);
        }
      }
    };
  }])
  .controller('ToolbarCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {


  }])
  .controller('TopologyCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {


    $scope.cartToPo = function (data, links) {
      var chart = echarts.init(document.getElementById('graph'));
      option = {
        title: {
          text: ''
        },
        tooltip: {},
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            symbolSize: 80,
            roam: true,
            label: {
              normal: {
                show: true
              }
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            edgeLabel: {
              normal: {
                textStyle: {
                  fontSize: 24
                }
              }
            },

            data: data,
            links: links,
            lineStyle: {
              normal: {
                opacity: 0.9,
                width: 3,
                curveness: 0.1
              }
            }
          }
        ]
      };

      chart.setOption(option);
    };

    $scope.graphInit = function () {
      var topoData;
      $scope.promise = $http.get('/topograph')
        .then(
          function (answer) {
            topoData = answer.data;
            $scope.cartToPo(topoData.data, topoData.links);
          },
          function (error) {
            console.log("error");
          },
          function (progress) {
          }
        );
    }
  }])
  .controller('ServiceRegisterCtrl', ['$scope', '$http', '$mdDialog', function ($scope, $http, $mdDialog) {

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
      order: 'register.service',
      limit: 10,
      page: 1
    };

    $scope.loadStuff = function () {
      $scope.promise = $http.get('/registers')
        .then(
          function (answer) {
            $scope.registers = answer.data;
          },
          function (error) {
          },
          function (progress) {
          }
        );
    };
    $scope.loadStuff();

    $scope.delConfirm = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('删除预约?')
        .textContent('删除所选预约，不可撤销。')
        .ariaLabel('confirm delete register')
        .targetEvent(ev)
        .ok('确定')
        .cancel('取消');

      $mdDialog.show(confirm).then(function () {
        var ids = $scope.selected.map(function (item) {
          return item['id'];
        });
        $promise = $http.delete('/registers/' + ids.join(','))
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
            $scope.loadStuff();
            $scope.selected = [];
          });

      }, function () {
        $scope.status = 'cancel';
      });
    };


  }])
  .controller('OVPNCtrl', ['$scope', '$http', '$mdDialog', function ($scope, $http, $mdDialog) {
    $scope.selected = [];

    $scope.limitOptions = [3, 5, 7];
    $scope.options = {
      rowSelection: true,
      multiSelect: false,
      autoSelect: true,
      decapitate: false,
      largeEditDialog: false,
      boundaryLinks: false,
      limitSelect: true,
      pageSelect: true
    };
    $scope.query = {
      order: 'ovpn.name',
      limit: 3,
      page: 1
    };

    $scope.logItem = function (item) {
      console.log($scope.selected);
    };

    $scope.loadStuff = function () {
      $scope.promise = $http.get('/ovpns')
        .then(
          function (answer) {
            $scope.ovpns = answer.data;
          },
          function (error) {
          },
          function (progress) {
          }
        );
    };

    $scope.loadStuff();


    $scope.selected2 = [];

    $scope.limitOptions2 = [5, 10];
    $scope.options2 = {
      rowSelection: true,
      multiSelect: true,
      autoSelect: true,
      decapitate: false,
      largeEditDialog: false,
      boundaryLinks: false,
      limitSelect: true,
      pageSelect: true
    };
    $scope.query2 = {
      order: 'service.name',
      limit: 5,
      page: 1
    };

    $scope.selected3 = [];

    $scope.limitOptions3 = [5, 10];
    $scope.options3 = {
      rowSelection: true,
      multiSelect: true,
      autoSelect: true,
      decapitate: false,
      largeEditDialog: false,
      boundaryLinks: false,
      limitSelect: true,
      pageSelect: true
    };
    $scope.query3 = {
      order: 'link.name',
      limit: 5,
      page: 1
    };
    $scope.selectedServices = [];
    $scope.loadExtends = function () {
      $scope.selected2 = [];
      $scope.selected3 = [];
      $scope.promise2 = $http.get('/ovpns/' + $scope.selected[0].ovpn_id)
        .then(
          function (answer) {
            $scope.services = answer.data.services;
            $scope.links = answer.data.links;
          },
          function (error) {
          },
          function (progress) {
          }
        );
    };
    $scope.modres = function (ev) {
      $mdDialog.show({
        controller: MODResCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'partials/mod-res-dialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {title: "修改资源", ovpnid: $scope.selected[0].ovpn_id, target: $scope.selected3}
      });
    };
    MODResCtrl.$inject = ['$scope', '$mdDialog', '$http', 'ovpnid', 'title', 'target'];
    function MODResCtrl($scope, $mdDialog, $http, ovpnid, title, target) {
      var self = this;
      self.rate = 0;
      self.title = title;
      self.target = target;

      self.submit = function (form) {
        $scope.submitted = true;
        $promise = $http.patch('/ovpns/odulinks', {rate: self.rate, id: ovpnid, target: target})
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }

    $scope.showLinks = function (ev) {
      $http.get('/ovpns/odulinks')
        .then(
          function (response) {
            if (response.status == '200') {
              $scope.submitted = false;
              // $scope.services = response.data;
              $mdDialog.show({
                controller: ODULinkCtrl,
                controllerAs: 'ctrl',
                templateUrl: 'partials/show-links-dialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {title: "新增资源", odulinks: response.data, ovpnid: $scope.selected[0].ovpn_id}
              });
            } else {

            }
          },
          function (error) {
          },
          function (progress) {
          })
        .finally(function () {

        });


    };

    // $scope.showServices = function (ev) {
    //   $http.get('/ovpns/services')
    //     .then(
    //       function (response) {
    //         if (response.status == '200') {
    //           $scope.submitted = false;
    //           // $scope.services = response.data;
    //           $mdDialog.show({
    //             controller: GroupServiceCtrl,
    //             controllerAs: 'ctrl',
    //             templateUrl: 'partials/show-links-dialog.tmpl.html',
    //             parent: angular.element(document.body),
    //             targetEvent: ev,
    //             clickOutsideToClose: true,
    //             locals: {services: response.data.data, ovpnid: $scope.selected[0].ovpn_id}
    //           });
    //         } else {
    //
    //         }
    //       },
    //       function (error) {
    //       },
    //       function (progress) {
    //       })
    //     .finally(function () {
    //
    //     });
    // };

    ODULinkCtrl.$inject = ['$scope', '$mdDialog', '$http', 'odulinks', 'ovpnid', 'title'];
    function ODULinkCtrl($scope, $mdDialog, $http, odulinks, ovpnid, title) {
      var self = this;
      self.selected = [];
      self.odulinks = odulinks;
      self.rate = 0;
      self.title = title;

      self.changeCallBack = function (node, isSelected) {
        if (isSelected) {
          self.selected.push(node.name);
        } else {
          var index = self.selected.indexOf(node.name);
          if (index > -1) {
            self.selected.splice(index, 1);
          }
        }
      };
      console.log(title);

      self.submit = function (form) {
        $scope.submitted = true;
        $promise = $http.post('/ovpns/odulinks', {odulinks: self.selected, rate: self.rate, id: ovpnid})
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    }

    $scope.showAddOVPN = function (ev) {
      $mdDialog.show({
        controller: AddOVPNDialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'partials/add-ovpn-dialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      })
        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    };

    AddOVPNDialogCtrl.$inject = ['$scope', '$mdDialog', '$http'];
    function AddOVPNDialogCtrl($scope, $mdDialog, $http) {

      var self = this;

      self.submit = function (form) {

        $scope.submitted = true;

        if (form.$invalid) {
          console.log("register form invalid.");
          return;
        }

        $promise = $http.post('/ovpns', {"name": $scope.name})
          .then(
            function (response) {
              console.log(response);
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    };
    $scope.delConfirm = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('删除分组?')
        .textContent('删除所选分组，不可撤销。')
        .ariaLabel('confirm delete')
        .targetEvent(ev)
        .ok('确定')
        .cancel('取消');

      $mdDialog.show(confirm).then(function () {
        var ids = $scope.selected.map(function (item) {
          return item['ovpn_id'];
        });
        $promise = $http.delete('/ovpns/' + ids.join(','))
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });

      }, function () {
        $scope.status = 'cancel';
      });
    };
    $scope.delServiceConfirm = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('删除分组业务?')
        .textContent('删除所选分组业务，不可撤销。')
        .ariaLabel('confirm delete')
        .targetEvent(ev)
        .ok('确定')
        .cancel('取消');

      $mdDialog.show(confirm).then(function () {
        var names = $scope.selected2.map(function (item) {
          return item['name'];
        });
        $promise = $http.delete('/ovpns/services/' + $scope.selected[0].ovpn_id + '/' + names.join(','))
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });

      }, function () {
        $scope.status = 'cancel';
      });
    };
    $scope.delLinkConfirm = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('删除分组资源?')
        .textContent('删除为所选分组分配的资源。')
        .ariaLabel('confirm delete')
        .targetEvent(ev)
        .ok('确定')
        .cancel('取消');

      $mdDialog.show(confirm).then(function () {
        var names = $scope.selected3.map(function (item) {
          return item['name'];
        });
        $promise = $http({
          method: 'DELETE',
          url: '/ovpns/odulinks/' + $scope.selected[0].ovpn_id,
          data: {links: $scope.selected3}
        }).then(function successCallback(response) {
          // this callback will be called asynchronously
          // when the response is available
          if (response.status == '200') {
            $scope.submitted = false;
          } else {

          }
          $mdDialog.cancel();

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $mdDialog.cancel();

        });
        // $promise = $http.delete('/ovpns/odulinks/' + $scope.selected[0].ovpn_id + '/', {links:names})
        //   .then(
        //     function (response) {
        //       if (response.status == '200') {
        //         $scope.submitted = false;
        //       } else {
        //
        //       }
        //     },
        //     function (error) {
        //     },
        //     function (progress) {
        //     })
        //   .finally(function () {
        //     $mdDialog.cancel();
        //   });

      }, function () {
        $scope.status = 'cancel';
      });
    };

  }])
  .controller('ServiceCtrl', ['$scope', '$http', '$mdDialog', function ($scope, $http, $mdDialog) {

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
      order: 'service.name',
      limit: 10,
      page: 1
    };

    $scope.signal_dict = new Array();
    $scope.signal_dict[257] = "GE";
    $scope.signal_dict[258] = "10GE LAN";
    $scope.signal_dict[259] = "10GE WAN";
    $scope.signal_dict[260] = "FE";
    $scope.signal_dict[261] = "GE(GFP-T)";
    $scope.signal_dict[262] = "GE_SLICE";
    $scope.signal_dict[263] = "GE(TTT-GMP)";
    $scope.signal_dict[264] = "40GE";
    $scope.signal_dict[265] = "100GE";
    $scope.signal_dict[513] = "OTU-1";
    $scope.signal_dict[514] = "OTU-2";
    $scope.signal_dict[515] = "OTU-3";
    $scope.signal_dict[521] = "OUT-4";
    $scope.signal_dict[516] = "OTU-5G";
    $scope.signal_dict[517] = "OTU-3E";
    $scope.signal_dict[518] = "OTU-2E";
    $scope.signal_dict[528] = "ODU-0";
    $scope.signal_dict[529] = "ODU-1";
    $scope.signal_dict[530] = "ODU-2";
    $scope.signal_dict[531] = "ODU-3";
    $scope.signal_dict[532] = "ODU-5G";
    $scope.signal_dict[534] = "ODUflex";
    $scope.signal_dict[769] = "STM-1";
    $scope.signal_dict[770] = "STM-4";
    $scope.signal_dict[771] = "STM-16";
    $scope.signal_dict[772] = "STM-64";
    $scope.signal_dict[773] = "STM-256";
    $scope.signal_dict[1025] = "OC-3";
    $scope.signal_dict[1026] = "OC-12";
    $scope.signal_dict[1027] = "OC-48";
    $scope.signal_dict[1028] = "OC-192";
    $scope.signal_dict[1029] = "OC-768";
    $scope.signal_dict[1281] = "FC-50";
    $scope.signal_dict[1282] = "FC-100";
    $scope.signal_dict[1283] = "FC-200";
    $scope.signal_dict[1284] = "FC-400";
    $scope.signal_dict[1285] = "FC-1000";
    $scope.signal_dict[1286] = "FC-1200";
    $scope.signal_dict[1288] = "FC-100(SLICE)";
    $scope.signal_dict[1287] = "FC-200(SLICE)";
    $scope.signal_dict[1289] = "FC-800";
    $scope.signal_dict[1290] = "FC-1600";
    $scope.signal_dict[1537] = "FICON";
    $scope.signal_dict[1538] = "FICON Express";
    $scope.signal_dict[1539] = "FICON4G";
    $scope.signal_dict[1541] = "FICON8G";
    $scope.signal_dict[1542] = "FICON(Slice)";
    $scope.signal_dict[1543] = "FICON Express(Slice)";
    $scope.signal_dict[1793] = "HDSDI";
    $scope.signal_dict[1794] = "HDSDIRBR";
    $scope.signal_dict[1795] = "3GSDI";
    $scope.signal_dict[1796] = "3GSDIRBR";
    $scope.signal_dict[2050] = "SDI";
    $scope.signal_dict[2049] = "DVB_ASI";
    $scope.signal_dict[2305] = "ESCON";
    $scope.signal_dict[2306] = "EPON";
    $scope.signal_dict[2307] = "GPON";
    $scope.signal_dict[2308] = "EPON_ONU";
    $scope.signal_dict[2309] = "EPON_OLT";
    $scope.signal_dict[2561] = "FDDI";
    $scope.signal_dict[2817] = "ETR";
    $scope.signal_dict[2818] = "CLO";
    $scope.signal_dict[2819] = "ISC 1G";
    $scope.signal_dict[2820] = "ISC 2G";
    $scope.signal_dict[3073] = "InfiniBand 2.5G";
    $scope.signal_dict[3074] = "InfiniBand 5niBanG";
    $scope.signal_dict[3075] = "IBQDR";
    $scope.signal_dict[3329] = "CPRI2";
    $scope.signal_dict[3330] = "CPRI1";
    $scope.signal_dict[3331] = "CPRI3";
    $scope.signal_dict[3332] = "CPRI4";
    $scope.signal_dict[3333] = "CPRI5";
    $scope.signal_dict[3334] = "CPRI6";
    $scope.signal_dict[3335] = "CPRI7";
    $scope.signal_dict[3336] = "OBSAI4";
    $scope.signal_dict[3337] = "OBSAI8";
    $scope.signal_dict[3338] = "CPRI8";
    $scope.signal_dict[3585] = "CBR10G";
    $scope.signal_dict[3841] = "PACKAGE";
    $scope.signal_dict[65281] = "CUSTOM";
    $scope.signal_dict[0] = "NULL";
    $scope.signal_dict[65535] = "ANY";

    $scope.sla_dict = new Array();
    $scope.sla_dict[1] = "永久";
    $scope.sla_dict[2] = "重路由";
    $scope.sla_dict[3] = "无保护";
    $scope.sla_dict[4] = "1+1重路由";
    $scope.sla_dict[6] = "静态1+1";

    $scope.logItem = function (item) {
      // console.log($scope.selected);
    };

    $scope.loadStuff = function () {
      $scope.promise = $http.get('/services')
        .then(
          function (answer) {
            $scope.services = answer.data;
          },
          function (error) {
          },
          function (progress) {
          }
        );
    };
    $scope.loadStuff();
    $scope.delConfirm = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('删除业务?')
        .textContent('删除所选业务，不可撤销。')
        .ariaLabel('confirm delete')
        .targetEvent(ev)
        .ok('确定')
        .cancel('取消');

      $mdDialog.show(confirm).then(function () {
        var names = $scope.selected.map(function (item) {
          return item['name'];
        });
        $promise = $http.delete('/services/' + names.join(','))
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });

      }, function () {
        $scope.status = 'cancel';
      });
    };

    $scope.showServiceDIalog = function (ev) {
      $mdDialog.show({
        controller: ServiceDialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'partials/sep-connect.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {title: "修改业务", desc: "输入业务数据，修改业务。", selectedService: $scope.selected, isUpdate: true}
      })
        .then(function (answer) {

          $promise = $http.post('/services/' + $scope.task.name, $scope.task)
            .then(
              function (response) {
                if (response.status == '200') {
                  $scope.submitted = false;
                } else {

                }
              },
              function (error) {
              },
              function (progress) {
              })
            .finally(function () {
              $mdDialog.cancel();
            });

        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    };

    ServiceDialogCtrl.$inject = ['$scope', '$mdDialog', '$http', 'selectedService', 'title', 'desc', 'isUpdate'];
    function ServiceDialogCtrl($scope, $mdDialog, $http, selectedService, title, desc, isUpdate) {

      var self = this;
      self.title = title;
      self.desc = desc;
      self.isUpdate = isUpdate;
      self.everyday = true;
      self.type = selectedService[0]['type'];
      $scope.task = selectedService[0];

      self.submit = function (form) {

        $scope.submitted = true;

        if (form.$invalid) {
          console.log("form invalid.");
          return;
        }
        if (selectedService.length != 1) {
          return;
        }

        $scope.task.name = selectedService[0]['name'];


        $promise = $http.post('/services/' + $scope.task.name, $scope.task)
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    };
    $scope.showRegisterDialog = function (ev) {
      $mdDialog.show({
        controller: RegisterDialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'partials/service-register.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {selectedService: $scope.selected}
      })
        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    };

    RegisterDialogCtrl.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', 'promiseTracker', '$timeout', 'smDateTimePicker', 'selectedService'];
    function RegisterDialogCtrl($scope, $rootScope, $mdDialog, $http, promiseTracker, $timeout, smDateTimePicker, selectedService) {

      var self = this;
      self.everyday = true;
      self.type = selectedService[0].type;

      self.submit = function (form) {

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
        $scope.register.type = self.type;

        $promise = $http.post('/registers', $scope.register)
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };
    };

  }])
  .controller('SEPCtrl', ['$scope', '$rootScope', '$http', '$mdDialog', function ($scope, $rootScope, $http, $mdDialog) {

    $scope.delete = function (data) {
      data.nodes = [];
    };

    $scope.selectedNodes = [];

    $scope.changeCallBack = function (node, isSelected) {
      if (isSelected) {
        $scope.selectedNodes.push(node.name);
        $scope.nodeType = node.type;
      } else {
        var index = $scope.selectedNodes.indexOf(node.name);
        if (index > -1) {
          $scope.selectedNodes.splice(index, 1);
        }
      }
    };

    $scope.add = function (data) {
      var post = data.nodes.length + 1;
      var newName = data.name + '-' + post;
      data.nodes.push({name: newName, expanded: true, nodes: []});
    };

    $scope.toggle = function (data) {
      data.expanded = !data.expanded;
    };
    $http.get('/ovpns')
      .then(
        function (answer) {
          $scope.ovpns = answer.data.data;
        },
        function (error) {
        },
        function (progress) {
        }
      );
    $scope.connect = function (ev) {
      $mdDialog.show({
        controller: ServiceDialogCtrl,
        controllerAs: 'ctrl',
        templateUrl: 'partials/sep-connect.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          title: "创建业务",
          desc: "选择目标节点，并输入业务数据，创建业务。",
          nodes: $scope.selectedNodes,
          type: $scope.nodeType,
          ovpns: $scope.ovpns
        }
      })
        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    };

    $scope.promise = $http.get('/seps')
      .then(
        function (answer) {
          $scope.tree = answer.data;
        },
        function (error) {
        },
        function (progress) {
        }
      );

    ServiceDialogCtrl.$inject = ['$scope', '$mdDialog', '$http', 'title', 'desc', 'nodes', 'type', 'ovpns'];
    function ServiceDialogCtrl($scope, $mdDialog, $http, title, desc, nodes, type, ovpns) {

      var self = this;
      self.title = title;
      self.desc = desc;
      self.type = type;
      self.ovpns = ovpns;

      self.submit = function (form) {

        $scope.submitted = true;
        $scope.task.nodes = nodes;
        $scope.task.type = type;

        if (form.$invalid) {
          return;
        }

        $promise = $http.post('/services', $scope.task)
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });
      };

      self.cancel = function () {
        $mdDialog.cancel();
      };

      self.querySearch = function querySearch(query) {
        return query ? self.seps.filter(createFilterFor(query)) : self.seps;
      };

      function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(sep) {
          return (sep.value.indexOf(lowercaseQuery) !== -1);
        };
      };

    };

  }])
  .controller('LinkCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.selected = [];

    $scope.query = {
      order: 'name',
      limit: 5,
      page: 1
    };

    $scope.loadStuff = function () {
      $scope.promise = $http.get('/links')
        .then(
          function (answer) {
            $scope.links = answer.data;
          },
          function (error) {
          },
          function (progress) {
          }
        );
    };
    $scope.loadStuff();
  }])
  .controller('ManagerCtrl', ['$scope', '$http', '$mdDialog', '$mdEditDialog', '$search', '$timeout', '$rootScope', function ($scope, $http, $mdDialog, $mdEditDialog, $search, $timeout, $rootScope) {
    $scope.selected = [];
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

    $scope.limitOptions = [5, 10, 15, {
      label: 'All',
      value: function () {
        return $scope.users ? $scope.users.data.length : 0;
      }
    }];

    $scope.filter = {
      options: {
        debounce: 500
      }
    };

    $scope.query = {
      filter: "",
      order: 'username',
      limit: 5,
      page: 1
    };

    function success(answer) {
      if ($scope.query.filter) {
        var data = {data: []};
        angular.forEach(answer.data.data, function (_data, index) {
          if (_data[$scope.query.order].indexOf($scope.query.filter) != -1) {
            data.data.push(_data);
          }
        })
        $scope.users = data;
      } else {
        $scope.users = answer.data;
      }
    }

    $scope.getUsers = function () {
      $scope.promise = $search.get($scope.query, loadStuff, success).$promise;
    };

    $scope.removeFilter = function () {
      $scope.filter.show = false;
      $scope.query.filter = '';

      if ($scope.filter.form.$dirty) {
        $scope.filter.form.$setPristine();
      }
    };
    var bookmark;
    $scope.$watch('query.filter', function (newValue, oldValue) {
      if (!oldValue) {
        bookmark = $scope.query.page;
      }

      if (newValue !== oldValue) {
        $scope.query.page = 1;
      }

      if (!newValue) {
        $scope.query.page = bookmark;
      }

      $scope.getUsers();
    });

    var loadStuff = function (success, error, progress) {
      return $http.get('/managers')
        .then(success, error, progress);
    }

    $scope.deselectUser = function (item) {
    };

    $scope.selectUser = function (item) {
    };

    $scope.addUser = function (event) {
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: addOrEditDialogCtrl,
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: event,
        locals: {user: null},
        templateUrl: 'partials/manager-user-dialog.html'
      }).then($scope.getUsers);
    };
    $scope.editUser = function (event) {
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: addOrEditDialogCtrl,
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: event,
        locals: {user: $scope.selected[0]},
        templateUrl: 'partials/manager-user-dialog.html'
      }).then($scope.getUsers);
    };

    $scope.delConfirm = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('删除用户?')
        .textContent('删除所选用户，不可撤销。')
        .ariaLabel('confirm delete')
        .targetEvent(ev)
        .ok('确定')
        .cancel('取消');

      $mdDialog.show(confirm).then(function () {
        var names = $scope.selected.map(function (item) {
          return item.username;
        });
        $promise = $http.delete('/managers/' + names.join(','))
          .then(
            function (response) {
              if (response.status == '200') {
                $scope.submitted = false;
              } else {

              }
            },
            function (error) {
            },
            function (progress) {
            })
          .finally(function () {
            $mdDialog.cancel();
          });

      }, function () {
        $scope.status = 'cancel';
      });
    };

    // 新增编辑Controller
    function addOrEditDialogCtrl($scope, $http, $rootScope, $mdDialog, user) {
      $scope.user = {};
      $scope.isEditUser = false;
      user && ($scope.isEditUser = true);
      user && ($scope.user = user);

      $scope.roles = ["admin", "operator"];
      var self = this;

      self.cancel = function () {
        $mdDialog.cancel();
      };

      function error() {
        $scope.error = 'delete error';
      }

      self.submit = function (uForm) {
        $http.post("/managers/" + ($scope.isEditUser ? $scope.user.username : ""), $scope.user).then(function (success) {
          console.log(success);
        }, function (error) {
          console.log(error);
        });
        $mdDialog.hide();
      };
    }

    addOrEditDialogCtrl.$inject = ['$scope', '$http', '$rootScope', '$mdDialog', 'user'];
  }])
  .controller('ManagerAuthCtrl', ['$mdToast', '$scope', '$http', '$mdDialog', '$mdEditDialog', '$search', '$timeout', '$rootScope', function ($mdToast, $scope, $http, $mdDialog, $mdEditDialog, $search, $timeout, $rootScope) {
    $scope.selected = [];
    $scope.options = {
      rowSelection: true,
      multiSelect: false,
      autoSelect: true,
      decapitate: false,
      largeEditDialog: false,
      boundaryLinks: false,
      limitSelect: true,
      pageSelect: true
    };

    $scope.limitOptions = [5, 10, 15, {
      label: 'All',
      value: function () {
        return $scope.users ? $scope.users.data.length : 0;
      }
    }];

    $scope.filter = {
      options: {
        debounce: 500
      }
    };

    $scope.query = {
      filter: "",
      order: 'username',
      limit: 5,
      page: 1
    };

    $scope.showToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position("top right")
          .hideDelay(3000)
      );
    };
    function success(answer) {
      if ($scope.query.filter) {
        var data = {data: []};
        angular.forEach(answer.data.data, function (_data, index) {
          if (_data[$scope.query.order].indexOf($scope.query.filter) != -1) {
            data.data.push(_data);
          }
        });
        $scope.users = data;
      } else {
        $scope.users = answer.data;
      }
    }

    $scope.getUsers = function () {
      $scope.promise = $search.get($scope.query, loadStuff, success).$promise;
    };

    $scope.removeFilter = function () {
      $scope.filter.show = false;
      $scope.query.filter = '';

      if ($scope.filter.form.$dirty) {
        $scope.filter.form.$setPristine();
      }
    };
    var bookmark;
    $scope.$watch('query.filter', function (newValue, oldValue) {
      if (!oldValue) {
        bookmark = $scope.query.page;
      }
      if (newValue !== oldValue) {
        $scope.query.page = 1;
      }
      if (!newValue) {
        $scope.query.page = bookmark;
      }
      $scope.getUsers();
    });

    var loadStuff = function (success, error, progress) {
      return $http.get('/managers')
        .then(success, error, progress);
    };

    $scope.submit = function (authForm) {
      $scope.user.username = $scope.selected[0].username;
      $http.post("managers/" + $scope.user.username, $scope.user).then(function (success) {
        console.log(success);
        $scope.showToast(success.data.message);
      }, function (error) {
        $scope.showToast(error.data.message);
      });
      $mdDialog.hide();
    };

    $scope.services = [];
    $scope.treedata = [];
    $scope.user = {};
    $scope.ovpns = [];


    $scope.selectedNodes = [];
    $scope.expandedNodes = [];
    $scope.serviceSelected = [];
    $scope.services = [];
    $scope.treeOptions = {
      multiSelection: true,
      dirSelectable: false,
      nodeChildren: 'nodes'
    };
    $scope.ovpnSelected = [];

    function loadPoint() {
      $http.get("/seps").then(function (answer) {
        var newTopos = [];
        angular.copy(answer.data, newTopos);
        setNodeArrObjUniqueIndex(1, newTopos)
        $scope.treedata = newTopos;
      });
    }

    loadPoint();

    function loadSerives() {
      $http.get("/services").then(function (answer) {
        $scope.services = answer.data.data;
      });
    }

    loadSerives();

    function loadovpns() {
      $http.get("/ovpns").then(function (answer) {
        $scope.ovpns = answer.data.data;
      });
    }

    loadovpns();

    function setNodeArrObjUniqueIndex(startIndex, array) {
      angular.forEach(array, function (_arr) {
        _arr["_index"] = startIndex++;
        if (_arr.nodes) {
          startIndex = setNodeArrObjUniqueIndex(startIndex, _arr.nodes);
        }
      });
      return startIndex;
    }

    function initBindPoints(srcTreeData, selNodeNameArr) {
      var isSel = false;
      angular.forEach(srcTreeData, function (_node) {
        if (_node.nodes) {
          if (initBindPoints(_node.nodes, selNodeNameArr)) {
            $scope.expandedNodes.push(_node);
            isSel = true;
          }
        } else {
          angular.forEach(selNodeNameArr, function (_sNodeName) {
            if (_sNodeName === _node.name) {
              $scope.selectedNodes.push(_node);
              $scope.expandedNodes.push(_node);
              isSel = true;
            }
          });
        }
      });
      return isSel;
    }

    $scope.deselectUser = function (item) {
      $scope.user.bindPoints = [];
      $scope.user.services = [];
      $scope.selectedNodes = [];
      $scope.serviceSelected = [];
      $scope.ovpnSelected = [];

    };

    // $scope.selected
    $scope.selectUser = function (item) {
      $scope.deselectUser();
      $http.get("/managers/" + item.username + "/seps").then(function (success) {
        $scope.user.bindPoints = success.data.data;
        initBindPoints($scope.treedata, success.data.data);
      }, function (error) {
      });

      $http.get("/managers/" + item.username + "/services").then(function (success) {
        $scope.user.services = success.data.data;
        $scope.serviceSelected = success.data.data;
      }, function (error) {
      });
      $http.get("/managers/" + item.username + "/ovpns").then(function (success) {
        $scope.user.ovpns = success.data.data.map(function (item) {
          return item["ovpn_id"];
        });
        $scope.ovpnSelected = success.data.data.map(function (item) {
          return item["ovpn_id"];
        });
      }, function (error) {
      });
    };

    $scope.serviceToggle = function (item) {
      var idx = $scope.serviceSelected.indexOf(item.name);
      if (idx > -1) {
        $scope.serviceSelected.splice(idx, 1);
      } else {
        $scope.serviceSelected.push(item.name);
      }
      $scope.user.services = angular.copy($scope.serviceSelected);
    };

    $scope.ovpnToggle = function (item) {
      var idx = $scope.ovpnSelected.indexOf(item.ovpn_id);
      if (idx > -1) {
        $scope.ovpnSelected.splice(idx, 1);
      } else {
        $scope.ovpnSelected.push(item.ovpn_id);
      }
      $scope.user.ovpns = angular.copy($scope.ovpnSelected);

    };

    $scope.serviceExists = function (item) {
      return $scope.serviceSelected.indexOf(item.name) > -1;
    };
    $scope.ovpnExists = function (item) {
      return $scope.ovpnSelected.indexOf(item.ovpn_id) > -1;
    };
    $scope.serviceIsIndeterminate = function () {
      return ($scope.serviceSelected.length !== 0 &&
      $scope.serviceSelected.length !== $scope.services.length);
    };
    $scope.ovpnIsIndeterminate = function () {
      return ($scope.ovpnSelected.length !== 0 &&
      $scope.ovpnSelected.length !== $scope.ovpns.length);
    };
    $scope.serviceIsChecked = function () {
      return $scope.services.length !== 0 && $scope.serviceSelected.length === $scope.services.length;
    };
    $scope.ovpnIsChecked = function () {
      return $scope.ovpns.length !== 0 && $scope.ovpnSelected.length === $scope.ovpns.length;
    };
    $scope.serviceToggleAll = function () {
      if ($scope.serviceSelected.length === $scope.services.length) {
        $scope.serviceSelected = [];
      } else if ($scope.serviceSelected.length === 0 || $scope.services.length > 0) {
        angular.forEach($scope.services, function (_service) {
          var idx = $scope.serviceSelected.indexOf(_service.name);
          if (idx == -1) {
            $scope.serviceSelected.push(_service.name);
          }
        });
      }
      $scope.user.services = angular.copy($scope.serviceSelected);
    };
    $scope.ovpnToggleAll = function () {
      if ($scope.ovpnSelected.length === $scope.ovpns.length) {
        $scope.ovpnSelected = [];
      } else if ($scope.ovpnSelected.length === 0 || $scope.ovpns.length > 0) {
        angular.forEach($scope.ovpns, function (_ovpn) {
          var idx = $scope.ovpnSelected.indexOf(_ovpn.ovpn_id);
          if (idx == -1) {
            $scope.ovpnSelected.push(_ovpn.ovpn_id);
          }
        });
      }
      $scope.user.ovpns = angular.copy($scope.ovpnSelected);
    };

    $scope.showSelected = function (node, selected, $parentNode) {
      var _nodeNames = [];
      angular.forEach($scope.selectedNodes, function (_node) {
        _nodeNames.push(_node.name);
      });
      $scope.user.bindPoints = _nodeNames;
    };


  }])
  .controller('SDNCtrl', ['$route', 'auth', 'user',
    '$scope', '$window', '$mdSidenav', '$timeout', '$mdDialog', '$mdComponentRegistry', 'menu', '$window', '$location', '$rootScope', '$mdUtil', '$http',
    function ($route, auth, user, $scope, $window, $mdSidenav, $timeout, $mdDialog, $mdComponentRegistry, menu, $window, $location, $rootScope, $mdUtil, $http) {

      $scope.login = login;
      $scope.logout = logout;
      $scope.isAuthed = isAuthed;
      $scope.curruser = "";

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
        get: function () {
          return null;
        },
        set: angular.noop,
        enumerable: true,
        configurable: true
      });

      $rootScope.redirectToUrl = function (url) {
        $location.path(url);
        $timeout(function () {
          $rootScope.relatedPage = null;
        }, 100);
      };

      // Methods used by menuLink and menuToggle directives
      this.isOpen = isOpen;
      this.isSelected = isSelected;
      this.toggleOpen = toggleOpen;
      this.autoFocusContent = false;

      var mainContentArea = document.querySelector("[role='main']");
      var scrollContentEl = mainContentArea.querySelector('md-content[md-scroll-y]');

      $mdComponentRegistry.when('left').then(function () {
        // Now you can use $mdSidenav('left') or $mdSidenav('left', true) without getting an error.
        $mdSidenav('left').toggle();
      });

      function closeMenu() {
        $timeout(function () {
          $mdSidenav('left').close();
        });
      }

      function openMenu() {
        $timeout(function () {
          $mdSidenav('left').open();
        });
      }

      function path() {
        return $location.path();
      }

      function scrollTop() {
        $mdUtil.animateScrollTo(scrollContentEl, 0, 200);
      }

      function goHome($event) {
        menu.selectPage(null, null);
        $location.path('/');
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
        if ($event) {
          $event.preventDefault();
        }

        $timeout(function () {
          mainContentArea.focus();
        }, 90);

      }

      function isSelected(page) {
        return menu.isPageSelected(page);
      }

      function isSectionSelected(section) {
        var selected = false;
        var openedSection = menu.openedSection;
        if (openedSection === section) {
          selected = true;
        }
        else if (section.children) {
          section.children.forEach(function (childSection) {
            if (childSection === openedSection) {
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

      function handleRequest(res) {
        var token = res.data ? res.data.token : null;
        if (token) {
          if (auth.parseJwt(token).role !== "admin") {
            menu.operatormenu();
          } else {
            menu.operatormenu();
            menu.addmenu({
              name: '权限管理',
              type: 'toggle',
              pages: [{
                name: '用户列表',
                url: '/managers/list',
                type: 'link'
              }, {
                name: '资源分配',
                url: '/managers/authority',
                type: 'link'
              }]
            });
          }
          $scope.curruser = auth.parseJwt(token).username;
          // var to = {
          //     name: '节点拓扑',
          //     url: '/topology',
          //     type: 'link'
          // };

          // menu.selectPage(to, to);
        }
        // self.message = res.data.message;

      }

      function login() {
        auth.logout && auth.logout();
        user.login($scope.user.username, $scope.user.password).then(handleRequest, handleRequest);
        $timeout(function () {
          // 0 ms delay to reload the page.
          $route.reload();
        }, 0);
      }

      function logout() {
        auth.logout && auth.logout();
        $window.location.href = "./";

      }

      function isAuthed() {
        return auth.isAuthed ? auth.isAuthed() : false
      }

      // $scope.getQuote = function () {
      //     user.getQuote()
      //         .then(handleRequest, handleRequest)
      // }
    }])
  .controller('ToastCtrl', function ($scope, $mdToast, $mdDialog) {

    $scope.closeToast = function () {
      if (isDlgOpen) return;

      $mdToast
        .hide()
        .then(function () {
          isDlgOpen = false;
        });
    };

    $scope.openMoreInfo = function (e) {
      if (isDlgOpen) return;
      isDlgOpen = true;

      $mdDialog
        .show($mdDialog
          .alert()
          .title('More info goes here.')
          .textContent('Something witty.')
          .ariaLabel('More info')
          .ok('Got it')
          .targetEvent(e)
        )
        .then(function () {
          isDlgOpen = false;
        })
    };
  })
  .filter('nospace', function () {
    return function (value) {
      return (!value) ? '' : value.replace(/ /g, '');
    };
  })
  .filter('humanizeDoc', function () {
    return function (doc) {
      if (!doc) return;
      if (doc.type === 'directive') {
        return doc.name.replace(/([A-Z])/g, function ($1) {
          return '-' + $1.toLowerCase();
        });
      }
      return doc.label || doc.name;
    };
  })
  .service('asyncService', function ($http, $q) {
    return {
      loadDataFromUrls: function (urls) {
        var deferred = $q.defer();
        var urlCalls = [];
        angular.forEach(urls, function (url) {
          urlCalls.push($http.get(url.url));
        });
        $q.all(urlCalls).then(
          function (results) {
            deferred.resolve(JSON.stringify(results))
          },
          function (errors) {
            deferred.reject(errors);
          },
          function (updates) {
            deferred.update(updates);
          }
        );
        return deferred.promise;
      }
    };
  })
  .factory('$search', function () {
    var search = {};
    search.get = function (query, loadFunc, success) {
      return {$promise: loadFunc(success)}
    };
    return search;
  })
  .controller('TestCtrl', ['$scope', function ($scope) {
    $scope.odulinks = [{'name': 'A', data: [1, 2, 3]}, {'name': 'B', data: [4, 5, 6]}, {'name': 'C', data: [7, 8, 9]}];
    $scope.selected = [];
    $scope.check = function (item, list) {
      var idx = list.indexOf(item);
      if (idx > -1) {
        list.splice(idx, 1);
      }
      else {
        list.push(item);
      }
    };
    $scope.toggle = function (repeat) {
      if (repeat.isCheck) {
        repeat.isCheck = false;
      } else {
        repeat.isCheck = true;
      }


    };

    $scope.exists = function (item, list) {
      return list.indexOf(item) > -1;
    };
  }])
  .directive('test', function () {
  })
;
