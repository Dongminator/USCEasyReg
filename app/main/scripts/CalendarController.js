/*
 * Plan:
 * 1. build calendar.
 * 2. add draggable class to events
 * 3. when dragged, dim background, show three buttons, and droppable area
 * 4. trigger droppable event
 * 5. events move back to original position, change event color. 
 */

/*
 * iphone6 viewport height: 667
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
var scope;
angular
  .module('main')
  .controller('CalendarController', function($scope, supersonic) {
	  scope = $scope;
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
		  
		  checkAllConflict();
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
                                  if(s.isConflicted){
                                      s1 = s.SECTION_ID;
                                      displayCalender(c,s,i,"#C36256");
                                  }else{
                                      s2 = s.SECTION_ID;
                                      displayCalender(c,s,i,"#DD8B12");
                                  }
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
            var calEvent = $("#calendar").fullCalendar( 'clientEvents', secId )[0];
            var sectionList = getSectionList();
            var index = indexOfSectionId(sectionList, secId);
            // change event view           
            if(!sectionList[index].isConflicted){
                calEvent.color = "#75AD9E";                
                $("#calendar").fullCalendar( 'updateEvent', calEvent);
                scheduleCourse (secId);
            }
			
			// change data
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
            scope.getJson();
			$( this ).css("background-color", hoverYellow);
		},
		over: function( event, ui ) {
			$( this ).css("background-color", "red");
		},
		out: function( event, ui ) {
			$( this ).css("background-color", hoverYellow);
		}
	});
	
	// Remove from calendar button
	$("#bacArea").droppable({
		accept: acceptDiv,
		hoverClass: "areaHover",
		drop: function( event, ui ) {
			var secId = findSecId (ui); 
            var sectionList = getSectionList();
            var index = indexOfSectionId(sectionList, secId);
			// remove event on calendar			
			// modify course in backend and setItem
            if(!sectionList[index].isRegistered){
                $("#calendar").fullCalendar( 'removeEvents', secId );
                unscheduleCourse(secId);            
                scope.getJson();
            }
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
                s.isConflicted = false;
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
	// device height = 667* 375
	var devW = window.screen.width;
	var devH = window.screen.height;
	
	var regIconWidth = 95;
	var regIconW = devW*regIconWidth/375;
	var regIconHeight = 136;
	var regIconH = devH*regIconHeight/667;
	
	var binIconWidth = 95;
	var binIconW = devW*binIconWidth/375;
	var binIconHeight = 160;
	var binIconH = devH*binIconHeight/667;
	
	
	var bacIconWidth = 79;
	var bacIconW = devW*bacIconWidth/375;
	var bacIconHeight = 42;
	var bacIconH = devH*bacIconHeight/667;
	
	
	var iconHeight = 26;
	var iconWidth = 26;
	var ic = 13;
	
	
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
	$("#regArea img").css("height", regIconH);
	$("#regArea img").css("width", "auto");
	
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
	$("#delArea img").css("height", binIconH);
	$("#delArea img").css("width", "auto");
	
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
	$("#bacArea img").css("height", bacIconH);
	$("#bacArea img").css("width", "auto");
}


function getStartDateTime(day, time, i) {
	switch(day[i]) {
    case "M":
        day = "Monday";
        return "2015-03-02T" + time + ":00";
    case "T":
        day = "Tuesday";
        return "2015-03-03T" + time + ":00";
    case "W":
        day = "Wednesday";
        return "2015-03-04T" + time + ":00";
    case "H":
        day = "Thursday";
        return "2015-03-05T" + time + ":00";
    case "F":
        day = "Friday";
        return "2015-03-06T" + time + ":00";
    case "S":
        day = "Saturday";
        return "2015-03-07T" + time + ":00";
	default:
        day = "Sunday";
        return "2015-03-08T" + time + ":00";
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
////////////////////////////////////////////////////////////////////////////////////////////////
function checkAllConflict(){  
    var sectionList = getSectionList();
    
    for(var k=0; k<sectionList.length; k++){
        sectionList[k].isConflicted = false;
    }
    
    for(var i=0; i<sectionList.length; i++){
        for(var j=i+1; j<sectionList.length; j++){
            for(var dayi = 0; dayi<sectionList[i].DAY.length; dayi++){
                for(var dayj = 0; dayj<sectionList[j].DAY.length; dayj++){
                    if(sectionList[i].DAY[dayi] == sectionList[j].DAY[dayj]){
                        if(sectionList[i].BEGIN_TIME <= sectionList[j].END_TIME && sectionList[j].BEGIN_TIME <= sectionList[i].END_TIME){
                            sectionList[i].isConflicted = true;
                            sectionList[j].isConflicted = true;
                        }
                    }
                }
            }            
        }
    }    
}

function getSectionList(){
    var list = [];
    for(var c=0; c<courses.length; c++){
        for(var s=0; s<courses[c].sections.length; s++){
            if(courses[c].sections[s].isScheduled){                  
                list.push(courses[c].sections[s]);
            }
        }
    }   
    return list;
}

function indexOfSectionId(sectionList, id){
    for(var s=0; s<sectionList.length; s++){
        if(sectionList[s].SECTION_ID==id){
            return s;
        }
    }
}




/*
function deleteConflict(event) {
    var allEvents = $('#calendar').fullCalendar('clientEvents');
    var theSection = getSection(event.SECTION_ID);
    for(var i=0; i<allEvents.length; i++){
        var otherSection = getSection(allEvents[i].SECTION_ID);
        removeFromList(theSection.isConflicted, otherSection.SECTION_ID);
        removeFromList(otherSection.isConflicted, theSection.SECTION_ID);
    }
}*/


/*
function removeFromList(list, item){
    var index = indexOfList(list, item);
    if(index > -1){
        list.splice(index, 1);
        return true;
    }
    return false;
}*/


