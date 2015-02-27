/*
 * Available hours:
 * 05:30 - 07:00
 * 05:30 - 07:30
 * 05:30 - 08:00
 * 
 * 06:00 - 08:00
 * 06:00 - 08:30
 * 06:00 - 09:00
 * 
 * 07:00 - 7:50
 * 07:00 - 0815
 * 07:00 - 0850
 * 07:00 - 0900
 * 07:00 - 0930
 * 07:00 - 1000
 * 
 * 08:00 - 0950
 * 08:00 - 09:20
 * 08:00 - 0850
 * 08:00 - 1050
 * 08:00 - 1150
 * 08:00 - 1030
 * 08:00 - 1000
 * 08:00 - 1100
 * 08:00 - 0915
 * 
 * 08:30 - 0950
 * 08:30 - 0940
 * 08:30 - 1100
 * 08:30 - 1030
 * 08:30 - 0920
 * 08:30 - 1630
 * 08:30 - 0920 0945
 * 08:30 - 1200
 * 08:30 - 0945
 * 
 * 08:45 - 1000
 * 
 * 08:50 - 1630
 * 08:50 - 1055
 * 08:50 - 1250
 * 
 * 09 - 22 slots
 * 10 - 34 slots
 * 11 - 19 slots
 * 12 - 29 slots
 * 13 - 35 slots
 * 14 - 27 slots
 * 15 - 32
 * 16 - 33
 * 17 - 32
 * 18 - 38
 * 19 - 18
 * 20 - 7
 * 21:00 - 21:50
 * 
 * 
 * Ending time:
 * - 2300 1
 * - 22xx 9
 * - 21xx 28
 * - 20xx 27
 * 
 * 
 * 
 * OUR SLOTS:
 * h1 - Start before 8 (12)
 * h2 - 8 - 9 (22)
 * h3 - 9 - 10
 * h4 - 10 - 12
 * h5 - 12 - 2
 * h6 - 2 - 4
 * h7 - 4 - 6
 * h8 - 6 - 8
 * h9 - 8 - 10
 * h10 - End after 22:06 (10)
 * 
 * var hours = [ 
	             {hour: 'h1', selected: true, start: "00:00", end: "08:00", text: "Start before 08:00", abbre : "h1"}, 
	             {hour: 'h2', selected: true, start: "08:00", end: "09:00", text: "08:00 - 09:00", abbre : "h2"}, 
	             {hour: 'h3', selected: true, start: "09:00", end: "10:00", text: "09:00 - 10:00", abbre : "h3"}, 
	             {hour: 'h4', selected: true, start: "10:00", end: "12:00", text: "10:00 - 12:00", abbre : "h4"}, 
	             {hour: 'h5', selected: true, start: "12:00", end: "14:00", text: "12:00 - 14:00", abbre : "h5"}, 
	             {hour: 'h6', selected: true, start: "14:00", end: "16:00", text: "14:00 - 16:00", abbre : "h6"}, 
	             {hour: 'h7', selected: true, start: "16:00", end: "18:00", text: "16:00 - 18:00", abbre : "h7"}, 
	             {hour: 'h8', selected: true, start: "18:00", end: "20:00", text: "18:00 - 20:00", abbre : "h8"}, 
	             {hour: 'h9', selected: true, start: "20:00", end: "22:06", text: "20:00 - 22:06", abbre : "h9"}, 
	             {hour: 'h10', selected: true, start: "22:00", end: "23:59", text: "End after 22:06", abbre : "h10"}, 
	             ]; 
 *
 */

var app = angular.module('main');

app.controller('SelectHoursController', function($scope, supersonic, $http) {
	
	  $scope.hours = JSON.parse(window.localStorage.getItem('EasyReg.SelectHoursControllers.hours'));
	  
	  $scope.update = function () {
		  window.localStorage.setItem('EasyReg.SelectHoursControllers.hours', JSON.stringify($scope.hours));
	  };
});

