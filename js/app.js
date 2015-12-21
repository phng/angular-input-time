(function (angular) {
  'use strict';

  angular.module('inputTimeDemoApp', ['png.timeinput'])
    .controller('mainController', function ($scope) {
      var vm = this;

      vm.isChrome = /chrome/i.test(navigator.userAgent);

      vm.setCurrentTime = function () {
        vm.time = new Date();
      };

      vm.clearTime = function () {
        vm.time = null;
      };

      vm.timeMode = 12;

      vm.toggleMode = function () {
        vm.timeMode = vm.timeMode === 24 ? 12 : 24;
      };

      $scope.$watch('main.time', function (value) {
        if (!value) return;
        vm.time = new Date(value.toISOString());
      }, true)
    })
})(angular);
