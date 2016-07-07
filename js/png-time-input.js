(function (angular) {
  'use strict';

  var TEMPLATE = '<div class="png-time form-control" ng-click="focus()">' +
    '<input type="text" name="hour" class="hour" maxlength="2" ng-model="hour" />' +
    '<span>:</span>' +
    '<input type="text" name="minute" class="minute" maxlength="2" ng-model="minute" />' +
    '<input type="text" name="mode" class="mode" maxlength="2" ng-model="mode" ng-show="timeMode !== 24" />' +
    '</div>';

  angular.module('png.timeinput', [])
    .directive('pngTimeInput', TimeInputDirective);

  function TimeInputDirective() {
    return {
      restrict: 'E',
      replace: true,
      template: TEMPLATE,
      scope: {
        model: '=',
        timeMode: '='
      },
      link: timepickerLinkFn
    };

    function timepickerLinkFn(scope, element, attr) {
      var hourInput, minuteInput, modeInput,
        hourInputEl, minuteInputEl, modeInputEl,
        hourInputCtrl, minuteInputCtrl, modeInputCtrl,
        currentFocusEl,
        keyCount = 2;

      //default time mode to 12h
      var timeMode = scope.timeMode = scope.timeMode !== 24 ? 12 : 24;

      function hourInputParser(value) {
        var hour = parseInt(value);

        if (isNaN(hour)) {
          hourInputCtrl.$viewValue = '00';
          hourInputCtrl.$render();
          hourInput.select();
          return hourInputCtrl.$viewValue;
        }

        // Some logic If we're in military time and the user wants to input 00
        if (timeMode === 24 && hour === 0) {
          // Check for '10' input
          if (parseInt(hourInputCtrl.$modelValue) === 0) {
            hourInputCtrl.$viewValue = '00';
            hourInputCtrl.$commitViewValue();
            hourInputCtrl.$render();
            minuteInput.focus();
            minuteInput.select();
            return hourInputCtrl.$viewValue;
          }
        }

        //if user meant to type 10, 11 or 12 for standard or 10 - 23 for military
        var squashTime = false;
        if (timeMode === 24) {
          if (parseInt(hourInputCtrl.$modelValue) === 2 && hour < 4) {
            squashTime = true;
          } else if (parseInt(hourInputCtrl.$modelValue) < 2 && hour < 10) {
            squashTime = true;
          }
        } else {
          if (parseInt(hourInputCtrl.$modelValue) < 2 && hour < 3) {
            squashTime = true;
          }
        }
        if (squashTime) {
          hourInputCtrl.$viewValue = parseInt(hourInputCtrl.$modelValue) + '' + hour;
          hourInputCtrl.$commitViewValue();
          hourInputCtrl.$render();
          minuteInput.focus();
          minuteInput.select();
          return hourInputCtrl.$viewValue;
        }

        if (hour < 10 && value.length === 1) {
          hourInputCtrl.$viewValue = '0' + value;
          hourInputCtrl.$commitViewValue();
          hourInputCtrl.$render();
        }

        if (hour > (timeMode === 24 ? 2 : 1)) {
          minuteInput.focus();
          minuteInput.select();
        } else {
          hourInput.select();
        }

        return hourInputCtrl.$viewValue;
      }

      function minuteInputParser(value) {
        var minute = parseInt(value);

        if (isNaN(minute)) {
          minuteInputCtrl.$viewValue = '00';
          minuteInputCtrl.$render();
          minuteInput.select();
          return minuteInputCtrl.$viewValue;
        }

        if (parseInt(minuteInputCtrl.$modelValue) < 6 && minute < 10) {
          minuteInputCtrl.$viewValue = parseInt(minuteInputCtrl.$modelValue) + '' + minute;
          minuteInputCtrl.$commitViewValue();
          minuteInputCtrl.$render();
          if (timeMode === 12) {
            modeInput.focus();
            modeInput.select();
          }
          minuteInput.select();
          return minuteInputCtrl.$viewValue;
        }

        if (minute < 10 && value.length === 1) {
          minuteInputCtrl.$viewValue = '0' + value;
          minuteInputCtrl.$commitViewValue();
          minuteInputCtrl.$render();
        }

        if (parseInt(value) > 5 && timeMode === 12) {
          modeInput.focus();
          modeInput.select();
        } else {
          minuteInput.focus();
          minuteInput.select();
        }

        return minuteInputCtrl.$viewValue;
      }

      function modeInputParser(value) {
        //if user has typed 'a', or has typed 'm' with 'AM' showing
        if ((value.toLowerCase().indexOf('a') >= 0) || (value.toLowerCase() === 'm' && modeInputCtrl.$modelValue === 'AM')) {
          modeInputCtrl.$viewValue = 'AM';
        } else {
          modeInputCtrl.$viewValue = 'PM';
        }
        modeInputCtrl.$commitViewValue();
        modeInputCtrl.$render();

        modeInput.select();

        return modeInputCtrl.$viewValue;
      }

      function resetKeyCount() {
        keyCount = 2;
      }

      function inputBlurHandler() {
        element.removeClass('time-focus');

        if (currentFocusEl === this) {// jshint ignore:line
          currentFocusEl = null;
        }
      }

      function inputFocusHandler() {
        element.addClass('time-focus');
        currentFocusEl = this;// jshint ignore:line
      }

      function modelWatcher(dt) {
        if (!dt) {
          scope.hour = '--';
          scope.minute = '--';
          scope.mode = '--';
          return;
        }

        if (angular.isString(dt)) {
          dt = new Date(dt);
        }

        if (angular.isDate(dt)) {
          var tempHour = dt.getHours();
          scope.minute = dt.getMinutes();

          if (timeMode === 12) {
            if (tempHour > 11) {
              scope.hour = tempHour === 12 ? tempHour : tempHour - 12;
              scope.mode = 'PM';
            } else {
              scope.hour = tempHour === 0 ? 12 : tempHour;
              scope.mode = 'AM';
            }
          } else {
            scope.hour = tempHour === 0 ? 0 : tempHour; // Default to 00 for military time
          }
          if (scope.hour < 10) {
            scope.hour = '0' + scope.hour;
          }
          if (scope.minute < 10) {
            scope.minute = '0' + scope.minute;
          }
        }
      }

      angular.forEach(element.find('input'), function (input) {
        if (input.name === 'hour') {
          hourInput = input;
          hourInputEl = angular.element(input);
          hourInputCtrl = hourInputEl.controller('ngModel');
        } else if (input.name === 'minute') {
          minuteInput = input;
          minuteInputEl = angular.element(input);
          minuteInputCtrl = minuteInputEl.controller('ngModel');
        } else if (input.name === 'mode') {
          modeInput = input;
          modeInputEl = angular.element(input);
          modeInputCtrl = modeInputEl.controller('ngModel');
        }
      });

      scope.$watch('model', modelWatcher);

      scope.$watch('timeMode', function (value) {
        timeMode = value;
        modelWatcher(scope.model);
      });

      scope.$watch(function () {
          var hour = parseInt(scope.hour);
          var minute = parseInt(scope.minute);

          if (isNaN(hour) || isNaN(minute)) {
            return null;
          }

          if (timeMode === 12) {
            if (scope.mode === 'AM') {
              return (hour === 12 ? 0 : hour) + ':' + minute;
            } else {
              return (hour === 12 ? hour : hour + 12) + ':' + minute;
            }
          } else {
            return hour + ':' + minute;
          }
        },
        function inputWatcher(value) {
          if (!value) {
            return;
          }

          var dateParts = value.split(':');

          if (!scope.model) {
            scope.model = new Date();
          }

          scope.model.setHours(dateParts[0]);
          scope.model.setMinutes(dateParts[1]);
          scope.model.setSeconds(0);
        });

      scope.focus = function elementFocus() {
        if (document.activeElement !== minuteInput && document.activeElement !== modeInput) {
          hourInput.focus();
          hourInput.select();
        }
      };

      hourInputCtrl.$parsers.unshift(hourInputParser);
      minuteInputCtrl.$parsers.unshift(minuteInputParser);
      modeInputCtrl.$parsers.unshift(modeInputParser);

      hourInputEl.on('focus', resetKeyCount);
      minuteInputEl.on('focus', resetKeyCount);
      hourInputEl.on('focus', inputFocusHandler);
      minuteInputEl.on('focus', inputFocusHandler);
      modeInputEl.on('focus', inputFocusHandler);

      hourInputEl.on('blur', inputBlurHandler);
      minuteInputEl.on('blur', inputBlurHandler);
      modeInputEl.on('blur', inputBlurHandler);

      hourInputEl.on('keydown', function (evt) {
        keyCount--;

        switch (evt.keyCode) {
          case 37: //left key
            evt.preventDefault();
            evt.stopPropagation();
            break;
          case 38://up key
          case 40://down key
            evt.preventDefault();
            evt.stopPropagation();
            break;
          case 39: //right key
            evt.preventDefault();
            evt.stopPropagation();
            minuteInput.focus();
            minuteInput.select();
            break;
        }
      });
      minuteInputEl.on('keydown', function (evt) {
        keyCount--;

        switch (evt.keyCode) {
          case 37: //left key
            evt.preventDefault();
            evt.stopPropagation();
            hourInput.focus();
            hourInput.select();
            break;
          case 38://up key
          case 40://down key
            evt.preventDefault();
            evt.stopPropagation();
            break;
          case 39: //right key
            evt.preventDefault();
            evt.stopPropagation();
            modeInput.focus();
            modeInput.select();
            break;
        }
      });
      modeInputEl.on('keydown', function (evt) {
        keyCount--;

        switch (evt.keyCode) {
          case 37: //left key
            evt.preventDefault();
            evt.stopPropagation();
            minuteInput.focus();
            minuteInput.select();
            break;
          case 38://up key
          case 40://down key
            evt.preventDefault();
            evt.stopPropagation();
            break;
          case 39: //right key
            evt.preventDefault();
            evt.stopPropagation();
            break;
        }
      });

      hourInputEl.on('click', function () {
        hourInput.select();
        //safari
        hourInput.setSelectionRange(0, 2)
      });
      minuteInputEl.on('click', function () {
        minuteInput.select();
        //safari
        minuteInput.setSelectionRange(0, 2)
      });
      modeInputEl.on('click', function () {
        modeInput.select();
        //safari
        modeInput.setSelectionRange(0, 2)
      });

      scope.$on('$destroy', function () {
        hourInputEl.off('click');
        hourInputEl.off('focus');
        hourInputEl.off('keydown');
        hourInputEl.off('blur');
        minuteInputEl.off('click');
        minuteInputEl.off('focus');
        minuteInputEl.off('keydown');
        minuteInputEl.off('blur');
        modeInputEl.off('blur');
        modeInputEl.off('click');
        modeInputEl.off('keydown');
        modeInputEl.off('blur');
      });
    }
  }
})(angular);
