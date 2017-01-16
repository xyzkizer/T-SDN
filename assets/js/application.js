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
    .config(['ivhTreeviewOptionsProvider', function(ivhTreeviewOptionsProvider) {
      ivhTreeviewOptionsProvider.set({
        twistieCollapsedTpl: '<md-icon style="margin-top: -2px;" ng-hide="trvw.isLeaf(node) || trvw.isExpanded(node)" md-svg-src="assets/ic_add_circle_outline_black_24px.svg" aria-label="expand"></md-icon>',
        twistieExpandedTpl: '<md-icon style="margin-top: -2px;" ng-hide="trvw.isLeaf(node) || !trvw.isExpanded(node)" md-svg-src="assets/ic_remove_circle_outline_black_24px.svg" aria-label="collopse"></md-icon>',
        twistieLeafTpl: '&#9679',
        defaultSelectedState: false,
        expandToDepth: 1,
        validate: true,
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
            $window.localStorage['jwtToken'] = token
        };

        srvc.logout = function (token) {
            $window.localStorage.removeItem('jwtToken');
        };

        srvc.getToken = function () {
            return $window.localStorage['jwtToken'];
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
        srvc.getQuote = function () {
            return $http.get('/auth/quote');
        };

        srvc.login = function (username, password) {
            return $http.post('/login', {
                username: username,
                password: password
            });
        };

    }])
    .directive('treeNode', ['ivhTreeviewMgr', '$http', '$rootScope', function(ivhTreeviewMgr, $http, $rootScope) {
      return {
        restrict: 'AE',
        require: '^ivhTreeview',
        templateUrl: 'partials/tree-node.tmpl.html',
        link: function(scope, element, attrs, ctrl) {
          scope.showDetail = function (name){
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
                    name: '节点列表',
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
                            if (response.status == 'OK') {
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

        $scope.logItem = function (item) {
            console.log($scope.selected);
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
                    return item['name'][0]['value'];
                });
                $promise = $http.delete('/services/' + names.join(','))
                    .then(
                        function (response) {
                            if (response.status == 'OK') {
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
                                if (response.status == 'OK') {
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
        ServiceDialogCtrl.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', 'promiseTracker', '$timeout', 'smDateTimePicker', 'selectedService', 'title', 'desc', 'isUpdate'];
        function ServiceDialogCtrl($scope, $rootScope, $mdDialog, $http, promiseTracker, $timeout, smDateTimePicker, selectedService, title, desc, isUpdate) {

            var self = this;
            self.title = title;
            self.desc = desc;
            self.isUpdate = isUpdate;
            self.everyday = true;

            self.submit = function (form) {

                $scope.submitted = true;

                if (form.$invalid) {
                    console.log("register form invalid.");
                    return;
                }
                if (selectedService.length != 1) {
                    return;
                }

                $scope.task.name = selectedService[0]['name'][0]['value'];


                $promise = $http.post('/services/' + $scope.task.name, $scope.task)
                    .then(
                        function (response) {
                            if (response.status == 'OK') {
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

                $promise = $http.post('/registers', $scope.register)
                    .then(
                        function (response) {
                            if (response.status == 'OK') {
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
    .controller('SEPCtrl', ['$scope', '$rootScope', '$http', '$mdDialog', 'ivhTreeviewBfs', function ($scope, $rootScope, $http, $mdDialog, ivhTreeviewBfs) {

        $scope.selectedNodes = [];

        $scope.delete = function (data) {
            data.nodes = [];
        };

        $scope.add = function (data) {
            var post = data.nodes.length + 1;
            var newName = data.name + '-' + post;
            data.nodes.push({name: newName, expanded: true, nodes: []});
        };

        $scope.toggle = function (data) {
            data.expanded = !data.expanded;
        };

        $scope.connect = function (ev) {
            // ivhTreeviewBfs($scope.tree, function(node) {
            //   if(!node.children && node.selected) {
            //     console.log(node);
            //     console.log("-------------");
            //   }
            // });

            $mdDialog.show({
                controller: ServiceDialogCtrl,
                controllerAs: 'ctrl',
                templateUrl: 'partials/sep-connect.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {title: "创建业务", desc: "选择目标节点，并输入业务数据，创建业务。"}
            })
                .then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });

        };

        $scope.showDetail = function (data) {
            $scope.promise = $http.get('/seps/' + data.name)
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

        ServiceDialogCtrl.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', 'promiseTracker', '$timeout', 'title', 'desc'];
        function ServiceDialogCtrl($scope, $rootScope, $mdDialog, $http, promiseTracker, $timeout, title, desc) {

            var self = this;
            self.title = title;
            self.desc = desc;
            self.seps = $rootScope.seps.map(function (sep) {
                return {
                    value: sep.toLowerCase(),
                    display: sep
                };
            });

            self.submit = function (form) {

                $scope.submitted = true;
                $scope.task.from = $rootScope.sep.name[0].value

                if (form.$invalid) {
                    return;
                }

                $promise = $http.post('/services', $scope.task)
                    .then(
                        function (response) {
                            if (response.status == 'OK') {
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
                            if (response.status == 'OK') {
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

        $scope.showToast = function(message) {
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


        $scope.selectedNodes = [];
        $scope.expandedNodes = [];
        $scope.serviceSelected = [];
        $scope.services = [];
        $scope.treeOptions = {
            multiSelection: true,
            dirSelectable: false,
            nodeChildren: 'nodes'
        };

        function loadPoint() {
            $http.get("/seps").then(function (answer) {
                var newTopos = [];
                angular.copy(answer.data.topos, newTopos);
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
        };

        // $scope.selected
        $scope.selectUser = function (item) {
            $http.get("/managers/" + item.username + "/seps"/*, {username: user.username}*/).then(function (success) {
                $scope.user.bindPoints = success.data.data;
                initBindPoints($scope.treedata, success.data.data);
            }, function (error) {
            });

            $http.get("/managers/" + item.username + "/services"/*, {username: user.username}*/).then(function (success) {
                $scope.user.services = success.data.data;
                $scope.serviceSelected = success.data.data;
            }, function (error) {
            });
        };

        $scope.serviceToggle = function (item) {
            var idx = $scope.serviceSelected.indexOf(item.name[0].value);
            if (idx > -1) {
                $scope.serviceSelected.splice(idx, 1);
            } else {
                $scope.serviceSelected.push(item.name[0].value);
            }
            $scope.user.services = angular.copy($scope.serviceSelected);
        };

        $scope.serviceExists = function (item) {
            return $scope.serviceSelected.indexOf(item.name[0].value) > -1;
        };

        $scope.serviceIsIndeterminate = function () {
            return ($scope.serviceSelected.length !== 0 &&
            $scope.serviceSelected.length !== $scope.services.length);
        };

        $scope.serviceIsChecked = function () {
            return $scope.services.length !== 0 && $scope.serviceSelected.length === $scope.services.length;
        };

        $scope.serviceToggleAll = function () {
            if ($scope.serviceSelected.length === $scope.services.length) {
                $scope.serviceSelected = [];
            } else if ($scope.serviceSelected.length === 0 || $scope.services.length > 0) {
                angular.forEach($scope.services, function (_service) {
                    var idx = $scope.serviceSelected.indexOf(_service.name[0].value);
                    if (idx == -1) {
                        $scope.serviceSelected.push(_service.name[0].value);
                    }
                });
            }
            $scope.user.services = angular.copy($scope.serviceSelected);
        };


        $scope.showSelected = function (node, selected, $parentNode) {
            var _nodeNames = []
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
        }
        return search;
    })
;
