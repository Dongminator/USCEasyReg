angular
  .module('main')
  .controller('CalendarController', function($scope, supersonic) {
    $scope.navbarTitle = "Calendar";
    var selectedCoureseJson = JSON.parse(window.localStorage.getItem("EasyReg..selectedCourses"));
    
    //make up data for now
    var json=[];
  });


$(document).ready(function() {

    // page is now ready, initialize the calendar...

    $('#calendar').fullCalendar({
        // put your options and callbacks here    
        header:{
            left:'',
            center:'',
            right:''            
        },
        height: 400,
        slotDuration: '00:30:00',
        weekends: false,
        defaultView: 'agendaWeek',
        allDaySlot: false,
        minTime: '06:00:00',
        maxTime: '23:00:00',
        events: [
            {
					title: 'Lunch',
					start: '2015-02-23T12:00:00'
				},
				{
					title: 'Meeting',
					start: '2015-02-24T14:30:00'
				},
				{
					title: 'Happy Hour',
					start: '2015-02-24T17:30:00'
				},
				{
					title: 'Dinner',
					start: '2015-02-25T20:00:00'
				},
				{
					title: 'Birthday Party',
					start: '2015-02-26T07:00:00'
				}
        ]
    });

});