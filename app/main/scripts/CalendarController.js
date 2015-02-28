/*
 * Plan:
 * 1. build calendar.
 * 2. add draggable class to events
 * 3. when dragged, dim background, show three buttons, and droppable area
 * 4. trigger droppable event, popup with corresponding message
 * 5. events move back to original position, change event color. 
 */

/*
 * Soecs: iphone6 viewport height: 667
 */


/*
 * {
 * 	section: "123",
 * 	course: "",
 * 	event: ""
 * }
 */
var sectionEventBinder = []; // need to bind section with event
var display = [];
var courses;

angular
  .module('main')
  .controller('CalendarController', function($scope, supersonic) {
	  initAreas ();
	  // Take courses from window.localStorage, put course title, section start, section end in each event
	  // if registered, use color: green
	  // if not registered, not conflicted, use color: yellow
	  // if conflicted, use color: red
	  supersonic.ui.views.current.whenVisible(function() {
		  supersonic.logger.debug("calendar shown");
		  $scope.getJson();
	  });
	  
	  supersonic.data.channel('public_announcements').subscribe( function(message) {
		  supersonic.logger.debug("received a message " + message);
		  $scope.getJson();
	  });
	  
	  $scope.getJson = function () {
		  $("#calendar").fullCalendar( 'removeEvents' );
		  courses = JSON.parse(window.localStorage.getItem('EasyReg.interestedCourses'));
		  
		  $scope.courses = courses;
		  var id = "";
		  var title = "";
		  var start = "";
		  var end = "";
		  var color = "";
		  var textColor = "";
		  
		  for (var cour in courses) {
			  var c = courses[cour];
			  // isInterested, isScheduled, isRegistered, isConflicted
			  if (c.isInterested && c.isScheduled) {
				  var sections = c.sections;
				  if (c.isRegistered) {
					  for (var sec in sections) {
						  var s = sections[sec];
						  if (s.isRegistered) {
							  for(var i =0; i< s.DAY.length; i=i+1){
								  displayCalender(c,s,i,"#6E8683");
							  }
							  
							// get start time, end time, title
//							  id = s.SECTION_ID;
//							  title = c.SIS_COURSE_ID;
//							  start = getStartDateTime(s.DAY, s.BEGIN_TIME);
//							  end = getEndDateTime(s.DAY, s.END_TIME);
//							  color = "green";
//							  textColor = "black";
							  break; // only one section can be registered
						  }
					  }
				  } else { // not registered but on calendar, put section.isScheduled on calendar. 
					  for (var sec in sections) {
						  var s = sections[sec];
						  if (s.isScheduled) {
							  for(var i =0; i< s.DAY.length; i=i+1){
								  displayCalender(c,s,i,"#DD8B12");
							  }
							  // get start time, end time, title
//							  id = s.SECTION_ID;
//							  title = c.SIS_COURSE_ID;
//							  start = getStartDateTime(s.DAY, s.BEGIN_TIME);
//							  end = getEndDateTime(s.DAY, s.END_TIME);
//							  color = "yellow";
//							  textColor = "black";
							  break;// only one section can be scheduled
						  }
					  }
				  }
//				  supersonic.logger.debug("Event Info: " + title + " " + start + " " + end + " " + color);
//				  var event = {
//						  id: id,
//						  title: title + " " + id,
//						  start: start,
//						  end: end,
//						  color : color,
//						  textColor: textColor
//				  };
//				  $('#calendar').fullCalendar( 'renderEvent', event);
			  } else if (c.isInterested && !c.isScheduled) { // interested, not scheduled on calendar
				  // do nothing on calendar
				  supersonic.logger.debug("do nothing on calendar");
			  }
		  }
	  };

	  
	  $('#calendar').fullCalendar({
		  defaultView: "agendaWeek",
    	
		  // Triggered after AN EVENT has been placed on the calendar in its final position
		  // the next three lines are crucial! They enable the drag feature on touch device!
		  eventAfterRender: function(event, element, view) {
			  addDraggable(element); // Must have!
			  addDroppable(element); // TODO need to add drappable only once. but need to know the class name of each event
		  },
					
		  // TODO
		  weekends: false, // will hide Saturdays and Sundays,
		  header: false,
    	
		  // The following options only apply to the agendaWeek and agendaDay views:
		  allDaySlot: false,
		  scrollTime: "9:00", // should set to earliest class
		  minTime: "05:00:00",
    	
		  columnFormat: "ddd",
		  dayNamesShort: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    	
		  editable : false, // must set false. 
		  eventDurationEditable: false,
    	
		  dragScroll: false,
    	
    	
		  eventClick: function(calEvent, jsEvent, view) {
			  
		  }

    });
    
    $('#calendar').fullCalendar('option', 'height', calCalH(supersonic));
    
  });


function displayCalender(course, section,index,color){
	c = course;
	s = section;
	id = s.SECTION_ID;
	title = c.SIS_COURSE_ID;
	start = getStartDateTime(s.DAY, s.BEGIN_TIME,index);
	end = getEndDateTime(s.DAY, s.END_TIME,index);
	textColor = "black";
	var event = {
			  id: id,
			  title: title + " " + id,
			  start: start,
			  end: end,
			  color : color,
			  textColor: textColor
	  };
	  display = event;
	  $('#calendar').fullCalendar( 'renderEvent', event);
}



/**
 * Calculate the height the calendar SHOULD take.
 * @returns {String}
 */
function calCalH (supersonic) {
	$("body").css("background-color", "#E2E2E0");
	
	// find device height
	var devH = window.screen.height; // 667 for iPhone6
	var calNavH = $("#calNav").height();
	
	var returnH = devH - calNavH - 20; // -20 for the status bar
	return returnH;
}

function addDraggable (div) {
	div.draggable({
		scroll: false,
		revert: true,
		drag: function( event, ui ) {
			showAreas ();
		},
		stop: function( event, ui ) {
			hideAreas();
		},
		refreshPositions: true,
		zIndex: 100
	});
}

function showAreas () {
	$("#regArea").show();
	$("#delArea").show();
	$("#bacArea").show();
}

function hideAreas () {
	$("#regArea").hide();
	$("#delArea").hide();
	$("#bacArea").hide();
}

/**
 * Only need to add droppable to three buttons (or areas): Register, Delete, UnSchedule.  
 * @param div: the div that when DRAGGED will activate the "areaActive" class
 */

var hoverYellow = "#E1E1DF";

function addDroppable (div) {
	var acceptDiv = ".fc-event";
	// TODO Register button
	$("#regArea").droppable({
		accept: acceptDiv,
		hoverClass: "areaHover",
		drop: function( event, ui ) {
			var secId = findSecId (ui);
			
			// change event view
			var calEvent = $("#calendar").fullCalendar( 'clientEvents', secId )[0];
			calEvent.color = "#75AD9E";
			$("#calendar").fullCalendar( 'updateEvent', calEvent);
			
			// change data
			scheduleCourse (secId);
			$( this ).css("background-color", hoverYellow);
		},
		over: function( event, ui ) {
			$( this ).css("background-color", "red");
		},
		out: function( event, ui ) {
			$( this ).css("background-color", hoverYellow);
		}

	});
	
	// Delete course from calendar and interested list
	$("#delArea").droppable({
		accept: acceptDiv,
		hoverClass: "areaHover",
		drop: function( event, ui ) {
			var secId = findSecId (ui);
			// remove event on calendar
			$("#calendar").fullCalendar( 'removeEvents', secId );
			// delete course in backend and setItem
			deleteCourse(secId);
			$( this ).css("background-color", hoverYellow);
		},
		over: function( event, ui ) {
			$( this ).css("background-color", "red");
		},
		out: function( event, ui ) {
			$( this ).css("background-color", hoverYellow);
		}
	});
	
	// Femove from calendar button
	$("#bacArea").droppable({
		accept: acceptDiv,
		hoverClass: "areaHover",
		drop: function( event, ui ) {
			var secId = findSecId (ui);
			// remove event on calendar
			$("#calendar").fullCalendar( 'removeEvents', secId );
			// modify course in backend and setItem
			unscheduleCourse(secId);
			$( this ).css("background-color", hoverYellow);
		},
		over: function( event, ui ) {
			$( this ).css("background-color", "red");
		},
		out: function( event, ui ) {
			$( this ).css("background-color", hoverYellow);
		}
	});
}

function findSecId (ui) {
	var triggeredUI = ui.draggable.text();
	var trigUiArr = triggeredUI.split(" ");
	return trigUiArr[trigUiArr.length-1];
}

// Register this course.
function scheduleCourse (secId) {
	var ctr = 0;
	for (var course in courses) {
		var c = courses[course];
		var sections = c.sections;
		for (var section in sections) {
			var s = sections[section];
			if (s.SECTION_ID == secId) { //
				s.isRegistered = true;
				c.isRegistered = true;
				window.localStorage.setItem('EasyReg.interestedCourses', JSON.stringify(courses));
				return;
			}
		}
		ctr++;
	}
}

// Remove from calendar but not from interested list.
function unscheduleCourse (secId) {
	var ctr = 0;
	for (var course in courses) {
		var c = courses[course];
		var sections = c.sections;
		for (var section in sections) {
			var s = sections[section];
			if (s.SECTION_ID == secId) { //
				s.isScheduled = false;
				c.isScheduled = false;
				window.localStorage.setItem('EasyReg.interestedCourses', JSON.stringify(courses));
				return;
			}
		}
		ctr++;
	}
}

// remove from calendar, remove from interested list. So it is removed from local storage.
function deleteCourse (secId) {
	var ctr = 0;
	for (var course in courses) {
		var c = courses[course];
		var sections = c.sections;
		for (var section in sections) {
			var s = sections[section];
			if (s.SECTION_ID == secId) { //
				courses.splice(ctr, 1);
				window.localStorage.setItem('EasyReg.interestedCourses', JSON.stringify(courses));
				return;
			}
		}
		ctr++;
	}
}

function initAreas () {
	var regIconW = 95;
	var regIconH = 136;
	var binIconW = 95;
	var binIconH = 160;
	var bacIconW = 79;
	var bacIconH = 42;
	
	
	
	var iconHeight = 26;
	var iconWidth = 26;
	var ic = 13;
	var devW = window.screen.width;
	var devH = window.screen.height;
	
	// init Register Area => #regArea
	var regW=devW*1/2; 
	var regH=devH*1/4; 
	var regT=devH*1/8; 
	var regL=devW*1/4;

	$("#regArea").css("width", regW);
	$("#regArea").css("height", regH);
	$("#regArea").css("top", regT);
	$("#regArea").css("left", regL);
	

	$("#regArea img").css("top", regH/2 - regIconH/2);
	$("#regArea img").css("left", regW/2 - regIconW/2);
	
	// init Delete Area => #delArea
	var delW=devW*1/2; 
	var delH=devH*1/4; 
	var delT=devH*5/8; 
	var delL=devW*1/4;
	
	$("#delArea").css("width", delW);
	$("#delArea").css("height", delH);
	$("#delArea").css("top", delT);
	$("#delArea").css("left", delL);
	
	$("#delArea img").css("top", delH/2 - binIconH/2);
	$("#delArea img").css("left", delW/2 - binIconW/2);
	
	// init Back Area => #bacArea
	var bacW=devW*1/4; 
	var bacH=bacW*2; 
	var bacT=devH*1/2 - bacW; 
	var bacL=0;
	
	$("#bacArea").css("width", bacW);
	$("#bacArea").css("height", bacH);
	$("#bacArea").css("top", bacT);
	$("#bacArea").css("left", bacL);
	
	$("#bacArea img").css("top", bacH/2 - bacIconH/2);
	$("#bacArea img").css("left", bacW/2 - bacIconW/2);
}


function getStartDateTime(day, time, i) {
	switch(day[i]) {
    case "M":
        day = "Monday";
        return "2015-02-23T" + time + ":00";
    case "T":
        day = "Tuesday";
        return "2015-02-24T" + time + ":00";
    case "W":
        day = "Wednesday";
        return "2015-02-25T" + time + ":00";
    case "H":
        day = "Thursday";
        return "2015-02-26T" + time + ":00";
    case "F":
        day = "Friday";
        return "2015-02-27T" + time + ":00";
    case "S":
        day = "Saturday";
        return "2015-02-28T" + time + ":00";
	default:
        day = "Sunday";
        return "2015-03-01T" + time + ":00";
	}
}

function getEndDateTime(day, time, i) {
	switch(day[i]) {
    case "M":
        day = "Monday";
        return "2015-02-23T" + time + ":00";
    case "T":
        day = "Tuesday";
        return "2015-02-24T" + time + ":00";
    case "W":
        day = "Wednesday";
        return "2015-02-25T" + time + ":00";
    case "H":
        day = "Thursday";
        return "2015-02-26T" + time + ":00";
    case "F":
        day = "Friday";
        return "2015-02-27T" + time + ":00";
    case "S":
        day = "Saturday";
        return "2015-02-28T" + time + ":00";
	default:
        day = "Sunday";
        return "2015-03-01T" + time + ":00";
	}
}
//var myAppModule = angular.module('main', ['ui.calendar']);
//
//function CalendarController($scope,$compile,uiCalendarConfig) {
//    var date = new Date();
//    var d = date.getDate();
//    var m = date.getMonth();
//    var y = date.getFullYear();
//    
//    /* event source that pulls from google.com */
//    $scope.eventSource = {
//        events: [
//            {
//                title: 'Event1',
//                start: '2015-02-01'
//            },
//            {
//                title: 'Event2',
//                start: '2015-02-10'
//            }
//            // etc...
//        ],
//        color: 'yellow',   // an option!
//        textColor: 'black' // an option!
//    };
//    
//    
//    /* event source that contains custom events on the scope */
//    $scope.events = [
//      {title: 'All Day Event',start: new Date(y, m, 1)},
//      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
//      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
//      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
//      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
//      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
//    ];
//    
//    
//    /* event source that calls a function on every view switch */
//    $scope.eventsF = function (start, end, timezone, callback) {
//      var s = new Date(start).getTime() / 1000;
//      var e = new Date(end).getTime() / 1000;
//      var m = new Date(start).getMonth();
//      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
//      callback(events);
//    };
//
//    $scope.calEventsExt = {
//       color: '#f00',
//       textColor: 'yellow',
//       events: [ 
//          {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
//          {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
//          {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
//        ]
//    };
//    /* alert on eventClick */
//    $scope.alertOnEventClick = function( date, jsEvent, view){
//        $scope.alertMessage = (date.title + ' was clicked ');
//    };
//    /* alert on Drop */
//     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
//       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
//    };
//    /* alert on Resize */
//    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
//       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
//    };
//    /* add and removes an event source of choice */
//    $scope.addRemoveEventSource = function(sources,source) {
//      var canAdd = 0;
//      angular.forEach(sources,function(value, key){
//        if(sources[key] === source){
//          sources.splice(key,1);
//          canAdd = 1;
//        }
//      });
//      if(canAdd === 0){
//        sources.push(source);
//      }
//    };
//    /* add custom event*/
//    $scope.addEvent = function() {
//      $scope.events.push({
//        title: 'Open Sesame',
//        start: new Date(y, m, 28),
//        end: new Date(y, m, 29),
//        className: ['openSesame']
//      });
//    };
//    /* remove event */
//    $scope.remove = function(index) {
//      $scope.events.splice(index,1);
//    };
//    /* Change View */
//    $scope.changeView = function(view,calendar) {
//      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
//    };
//    /* Change View */
//    $scope.renderCalender = function(calendar) {
//      if(uiCalendarConfig.calendars[calendar]){
//        uiCalendarConfig.calendars[calendar].fullCalendar('render');
//      }
//    };
//     /* Render Tooltip */
//    $scope.eventRender = function( event, element, view ) { 
//        element.attr({'tooltip': event.title,
//                     'tooltip-append-to-body': true});
//        $compile(element)($scope);
//    };
//    
//    
//    
//    /* config object */
//    $scope.uiConfig = {
//      calendar:{
//        editable: true,
//        header:{
//          left: 'title',
//          center: '',
//          right: 'today prev,next'
//        },
//        eventClick: $scope.alertOnEventClick,
//        eventDrop: $scope.alertOnDrop,
//        eventResize: $scope.alertOnResize,
//        eventRender: $scope.eventRender
//      }
//    };
//
//    $scope.changeLang = function() {
//      if($scope.changeTo === 'Hungarian'){
//        $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
//        $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
//        $scope.changeTo= 'English';
//      } else {
//        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//        $scope.changeTo = 'Hungarian';
//      }
//    };
//    /* event sources array*/
//    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
//    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
//}
/* EOF */





//$(document).ready(function() {
//
//    // page is now ready, initialize the calendar...
//
//    $('#calendar').fullCalendar({
//        // put your options and callbacks here    
//        header:{
//            left:'',
//            center:'',
//            right:''            
//        },
//        height: 1175,
//        slotDuration: '00:15:00',
//        weekends: false,
//        defaultView: 'agendaWeek',
//        allDaySlot: false,
//        minTime: '06:00:00',
//        maxTime: '23:00:00',
//        events: [
//            {
//					title: 'Lunch',
//					start: '2015-02-23T12:00:00'
//				},
//				{
//					title: 'Meeting',
//					start: '2015-02-24T14:30:00'
//				},
//				{
//					title: 'Happy Hour',
//					start: '2015-02-24T17:30:00'
//				},
//				{
//					title: 'Dinner',
//					start: '2015-02-25T20:00:00'
//				},
//				{
//					title: 'Birthday Party',
//					start: '2015-02-26T07:00:00'
//				}
//        ]
//    });
//
//});




// DISCARD THE REST
//function buildCustomView() {
//	var FC = $.fullCalendar; // a reference to FullCalendar's root namespace
//	var View = FC.View;      // the class that all views must inherit from
//	var CustomView;          // our subclass
//	
//	var AGENDA_DEFAULTS = {
//			allDaySlot: true,
//			allDayText: 'all-day',
//			scrollTime: '06:00:00',
//			slotDuration: '00:30:00',
//			minTime: '00:00:00',
//			maxTime: '24:00:00',
//			slotEventOverlap: true // a bad name. confused with overlap/constraint system
//		};
//
//	
//	CustomView = View.extend({ // make a subclass of View
//
//		timeGrid: null, // the main time-grid subcomponent of this view
//		dayGrid: null, // the "all-day" subcomponent. if all-day is turned off, this will be null
//
//		axisWidth: null, // the width of the time axis running down the side
//
//		noScrollRowEls: null, // set of fake row elements that must compensate when scrollerEl has scrollbars
//
//		// when the time-grid isn't tall enough to occupy the given height, we render an <hr> underneath
//		bottomRuleEl: null,
//		bottomRuleHeight: null,
//		
//	    initialize: function() {
//	        // called once when the view is instantiated, when the user switches to the view.
//	        // initialize member variables or do other setup tasks.
//	    	this.timeGrid = new TimeGrid(this);
//
//			if (this.opt('allDaySlot')) { // should we display the "all-day" area?
//				this.dayGrid = new DayGrid(this); // the all-day subcomponent of this view
//
//				// the coordinate grid will be a combination of both subcomponents' grids
//				this.coordMap = new ComboCoordMap([
//					this.dayGrid.coordMap,
//					this.timeGrid.coordMap
//				]);
//			}
//			else {
//				this.coordMap = this.timeGrid.coordMap;
//			}
//	    },
//
//	    // Sets the display range and computes all necessary dates
//		setRange: function(range) {
//			View.prototype.setRange.call(this, range); // call the super-method
//
//			this.timeGrid.setRange(range);
//			if (this.dayGrid) {
//				this.dayGrid.setRange(range);
//			}
//		},
//		
////	    render: function() {
////	        // responsible for displaying the skeleton of the view within the already-defined
////	        // this.el, a jQuery element.
////	    },
//	    
//	    // Renders the view into `this.el`, which has already been assigned
//		render: function() {
//
//			this.el.addClass('fc-agenda-view').html(this.renderHtml());
//
//			// the element that wraps the time-grid that will probably scroll
//			this.scrollerEl = this.el.find('.fc-time-grid-container');
//			this.timeGrid.coordMap.containerEl = this.scrollerEl; // don't accept clicks/etc outside of this
//
//			this.timeGrid.setElement(this.el.find('.fc-time-grid'));
//			this.timeGrid.renderDates();
//
//			// the <hr> that sometimes displays under the time-grid
//			this.bottomRuleEl = $('<hr class="fc-divider ' + this.widgetHeaderClass + '"/>')
//				.appendTo(this.timeGrid.el); // inject it into the time-grid
//
//			if (this.dayGrid) {
//				this.dayGrid.setElement(this.el.find('.fc-day-grid'));
//				this.dayGrid.renderDates();
//
//				// have the day-grid extend it's coordinate area over the <hr> dividing the two grids
//				this.dayGrid.bottomCoordPadding = this.dayGrid.el.next('hr').outerHeight();
//			}
//
//			this.noScrollRowEls = this.el.find('.fc-row:not(.fc-scroller *)'); // fake rows not within the scroller
//		},
//
//		// Unrenders the content of the view. Since we haven't separated skeleton rendering from date rendering,
//		// always completely kill each grid's rendering.
//		destroy: function() {
//			this.timeGrid.destroyDates();
//			this.timeGrid.removeElement();
//
//			if (this.dayGrid) {
//				this.dayGrid.destroyDates();
//				this.dayGrid.removeElement();
//			}
//		},
//		
//		renderBusinessHours: function() {
//			this.timeGrid.renderBusinessHours();
//
//			if (this.dayGrid) {
//				this.dayGrid.renderBusinessHours();
//			}
//		},
//	    
//		// Builds the HTML skeleton for the view.
//		// The day-grid and time-grid components will render inside containers defined by this HTML.
//		renderHtml: function() {
//			return '' +
//				'<table>' +
//					'<thead class="fc-head">' +
//						'<tr>' +
//							'<td class="' + this.widgetHeaderClass + '">' +
//								this.timeGrid.headHtml() + // render the day-of-week headers
//							'</td>' +
//						'</tr>' +
//					'</thead>' +
//					'<tbody class="fc-body">' +
//						'<tr>' +
//							'<td class="' + this.widgetContentClass + '">' +
//								(this.dayGrid ?
//									'<div class="fc-day-grid"/>' +
//									'<hr class="fc-divider ' + this.widgetHeaderClass + '"/>' :
//									''
//									) +
//								'<div class="fc-time-grid-container">' +
//									'<div class="fc-time-grid"/>' +
//								'</div>' +
//							'</td>' +
//						'</tr>' +
//					'</tbody>' +
//				'</table>';
//		},
//		
//		// Generates the HTML that will go before the day-of week header cells.
//		// Queried by the TimeGrid subcomponent when generating rows. Ordering depends on isRTL.
//		headIntroHtml: function() {
//			var date;
//			var weekText;
//
//			if (this.opt('weekNumbers')) {
//				date = this.timeGrid.getCell(0).start;
//				weekText = date.format(this.opt('smallWeekFormat'));
//
//				return '' +
//					'<th class="fc-axis fc-week-number ' + this.widgetHeaderClass + '" ' + this.axisStyleAttr() + '>' +
//						'<span>' + // needed for matchCellWidths
//							htmlEscape(weekText) +
//						'</span>' +
//					'</th>';
//			}
//			else {
//				return '<th class="fc-axis ' + this.widgetHeaderClass + '" ' + this.axisStyleAttr() + '></th>';
//			}
//		},
//
//
//		// Generates the HTML that goes before the all-day cells.
//		// Queried by the DayGrid subcomponent when generating rows. Ordering depends on isRTL.
//		dayIntroHtml: function() {
//			return '' +
//				'<td class="fc-axis ' + this.widgetContentClass + '" ' + this.axisStyleAttr() + '>' +
//					'<span>' + // needed for matchCellWidths
//						(this.opt('allDayHtml') || htmlEscape(this.opt('allDayText'))) +
//					'</span>' +
//				'</td>';
//		},
//
//
//		// Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
//		slotBgIntroHtml: function() {
//			return '<td class="fc-axis ' + this.widgetContentClass + '" ' + this.axisStyleAttr() + '></td>';
//		},
//		
//		// Generates the HTML that goes before all other types of cells.
//		// Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
//		// Queried by the TimeGrid and DayGrid subcomponents when generating rows. Ordering depends on isRTL.
//		introHtml: function() {
//			return '<td class="fc-axis" ' + this.axisStyleAttr() + '></td>';
//		},
//
//
//		// Generates an HTML attribute string for setting the width of the axis, if it is known
//		axisStyleAttr: function() {
//			if (this.axisWidth !== null) {
//				 return 'style="width:' + this.axisWidth + 'px"';
//			}
//			return '';
//		},
//		
//		
//		
//		
//		/* Dimensions
//		------------------------------------------------------------------------------------------------------------------*/
//
//
//		updateSize: function(isResize) {
//			this.timeGrid.updateSize(isResize);
//
//			View.prototype.updateSize.call(this, isResize); // call the super-method
//		},
//
//
//		// Refreshes the horizontal dimensions of the view
//		updateWidth: function() {
//			// make all axis cells line up, and record the width so newly created axis cells will have it
//			this.axisWidth = matchCellWidths(this.el.find('.fc-axis'));
//		},
//
//
////		setHeight: function(height, isAuto) {
////	        // responsible for adjusting the pixel-height of the view. if isAuto is true, the
////	        // view may be its natural height, and `height` becomes merely a suggestion.
////	    },
//	    
//		// Adjusts the vertical dimensions of the view to the specified values
//		setHeight: function(totalHeight, isAuto) {
//			var eventLimit;
//			var scrollerHeight;
//
//			if (this.bottomRuleHeight === null) {
//				// calculate the height of the rule the very first time
//				this.bottomRuleHeight = this.bottomRuleEl.outerHeight();
//			}
//			this.bottomRuleEl.hide(); // .show() will be called later if this <hr> is necessary
//
//			// reset all dimensions back to the original state
//			this.scrollerEl.css('overflow', '');
//			unsetScroller(this.scrollerEl);
//			uncompensateScroll(this.noScrollRowEls);
//
//			// limit number of events in the all-day area
//			if (this.dayGrid) {
//				this.dayGrid.destroySegPopover(); // kill the "more" popover if displayed
//
//				eventLimit = this.opt('eventLimit');
//				if (eventLimit && typeof eventLimit !== 'number') {
//					eventLimit = AGENDA_ALL_DAY_EVENT_LIMIT; // make sure "auto" goes to a real number
//				}
//				if (eventLimit) {
//					this.dayGrid.limitRows(eventLimit);
//				}
//			}
//
//			if (!isAuto) { // should we force dimensions of the scroll container, or let the contents be natural height?
//
//				scrollerHeight = this.computeScrollerHeight(totalHeight);
//				if (setPotentialScroller(this.scrollerEl, scrollerHeight)) { // using scrollbars?
//
//					// make the all-day and header rows lines up
//					compensateScroll(this.noScrollRowEls, getScrollbarWidths(this.scrollerEl));
//
//					// the scrollbar compensation might have changed text flow, which might affect height, so recalculate
//					// and reapply the desired height to the scroller.
//					scrollerHeight = this.computeScrollerHeight(totalHeight);
//					this.scrollerEl.height(scrollerHeight);
//				}
//				else { // no scrollbars
//					// still, force a height and display the bottom rule (marks the end of day)
//					this.scrollerEl.height(scrollerHeight).css('overflow', 'hidden'); // in case <hr> goes outside
//					this.bottomRuleEl.show();
//				}
//			}
//		},
//
//
//		// Computes the initial pre-configured scroll state prior to allowing the user to change it
//		computeInitialScroll: function() {
//			var scrollTime = moment.duration(this.opt('scrollTime'));
//			var top = this.timeGrid.computeTimeTop(scrollTime);
//
//			// zoom can give weird floating-point values. rather scroll a little bit further
//			top = Math.ceil(top);
//
//			if (top) {
//				top++; // to overcome top border that slots beyond the first have. looks better
//			}
//
//			return top;
//		},
//
//
//		/* Events
//		------------------------------------------------------------------------------------------------------------------*/
//
////		renderEvents: function(events) {
////	        // reponsible for rendering the given Event Objects
////	    },
//		// Renders events onto the view and populates the View's segment array
//		renderEvents: function(events) {
//			var dayEvents = [];
//			var timedEvents = [];
//			var daySegs = [];
//			var timedSegs;
//			var i;
//
//			// separate the events into all-day and timed
//			for (i = 0; i < events.length; i++) {
//				if (events[i].allDay) {
//					dayEvents.push(events[i]);
//				}
//				else {
//					timedEvents.push(events[i]);
//				}
//			}
//
//			// render the events in the subcomponents
//			timedSegs = this.timeGrid.renderEvents(timedEvents);
//			if (this.dayGrid) {
//				daySegs = this.dayGrid.renderEvents(dayEvents);
//			}
//
//			// the all-day area is flexible and might have a lot of events, so shift the height
//			this.updateHeight();
//		},
//
//
//		// Retrieves all segment objects that are rendered in the view
//		getEventSegs: function() {
//			return this.timeGrid.getEventSegs().concat(
//				this.dayGrid ? this.dayGrid.getEventSegs() : []
//			);
//		},
//
////		destroyEvents: function() {
////	        // responsible for undoing everything in renderEvents
////	    },
//		
//		// Unrenders all event elements and clears internal segment data
//		destroyEvents: function() {
//
//			// destroy the events in the subcomponents
//			this.timeGrid.destroyEvents();
//			if (this.dayGrid) {
//				this.dayGrid.destroyEvents();
//			}
//
//			// we DON'T need to call updateHeight() because:
//			// A) a renderEvents() call always happens after this, which will eventually call updateHeight()
//			// B) in IE8, this causes a flash whenever events are rerendered
//		},
//
//
//		/* Drag-n-Drop Rendering (for both events and external elements)
//		------------------------------------------------------------------------------------------------------------------*/
//
//		// Renders a visual indication of a event or external-element drag over the given drop zone.
//		// If an external-element, seg will be `null`
////		renderDrag: function(dropLocation, seg) {
////			// subclasses must implement
////		},
////
////
////		// Unrenders a visual indication of an event or external-element being dragged.
////		destroyDrag: function() {
////			// subclasses must implement
////		}
//		
//		/* Dragging (for events and external elements)
//		------------------------------------------------------------------------------------------------------------------*/
//
//
//		// A returned value of `true` signals that a mock "helper" event has been rendered.
//		renderDrag: function(dropLocation, seg) {
//			if (dropLocation.start.hasTime()) {
//				return this.timeGrid.renderDrag(dropLocation, seg);
//			}
//			else if (this.dayGrid) {
//				return this.dayGrid.renderDrag(dropLocation, seg);
//			}
//		},
//
//
//		destroyDrag: function() {
//			this.timeGrid.destroyDrag();
//			if (this.dayGrid) {
//				this.dayGrid.destroyDrag();
//			}
//		},
//
//
//		/* Selection
//		------------------------------------------------------------------------------------------------------------------*/
//
////		renderSelection: function(range) {
////	        // accepts a {start,end} object made of Moments, and must render the selection
////	    },
//		// Renders a visual indication of a selection
//		renderSelection: function(range) {
//			if (range.start.hasTime() || range.end.hasTime()) {
//				this.timeGrid.renderSelection(range);
//			}
//			else if (this.dayGrid) {
//				this.dayGrid.renderSelection(range);
//			}
//		},
//
////		destroySelection: function() {
////	        // responsible for undoing everything in renderSelection
////	    },
//	    
//		// Unrenders a visual indications of a selection
//		destroySelection: function() {
//			this.timeGrid.destroySelection();
//			if (this.dayGrid) {
//				this.dayGrid.destroySelection();
//			}
//		}
//	    
//
//	});
//
//	FC.views.custom = CustomView; // register our class with the view system
//	CustomView.defaults = AGENDA_DEFAULTS;
//	
//	return CustomView;
//}
