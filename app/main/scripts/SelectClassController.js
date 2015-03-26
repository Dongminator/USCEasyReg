angular
  .module('main')
  .controller('SelectClassController', function($scope, supersonic, $http) {
	
	  $scope.findSchool = function () {
		  var school = supersonic.data.model('school');
		  // TODO find all schools at backend. Currently schools are stored at the end of this file.
		  $scope.schoolLength = allSchools.length;
		  $scope.schools = [];
		  var schoolObjects = new Array();
		  for (i = 0; i < allSchools.length; i++) {
			  // id is SOC_SCHOOL_CODE
			  schoolObjects[i] = {"code" : allSchools[i].id, "value" : allSchools[i].SOC_SCHOOL_DESCRIPTION};
		  }
		  $scope.schools = schoolObjects;
		  $scope.selectedSchool = schoolObjects[0];
		  $scope.run();
	  };
	  
	  $scope.run = function () {
		  window.localStorage.clear();
		  if (window.localStorage.getItem('EasyReg.initialized')!==null) {
			  supersonic.logger.debug( "already set" );
		  } else {
			  initLocalStorage();
			  supersonic.logger.debug( "init" );
		  }
		  $scope.changeSchool();
	  };
	  
	  $scope.changeSchool = function () {
		  // code is the school code, e.g. ENGR. Value is the full name of the school.
		  supersonic.logger.debug( $scope.selectedSchool.code + " " + $scope.selectedSchool.value);
		  // after school is selected, send GET request to get departments of this school
		  // http://petri.esd.usc.edu/socAPI/Schools/[DEPARTMENT_CODE]
//    	var queryUrl = "http://www.donglinpu.me/webreg/Schools/" + $scope.selectedSchool.code;
		  var queryUrl = "http://petri.esd.usc.edu/socAPI/Schools/" + $scope.selectedSchool.code;
		  supersonic.logger.debug("Querying... " + queryUrl);
    	
		  $http.get(queryUrl).
		  	success(function(data, status, headers, config) {
		  		supersonic.logger.debug("data:" + data[0].SOC_SCHOOL_CODE + " " + data[0].SOC_SCHOOL_DESCRIPTION + " " + data[0].SOC_DEPARTMENT_CODE.length);
		  		$scope.departments = [];
		  		var departmentObjects = new Array();
		  		var allDepartments = data[0].SOC_DEPARTMENT_CODE;
		  		for (i = 0; i < allDepartments.length; i++) {
		  			// id is SOC_SCHOOL_CODE
		  			departmentObjects[i] = {"code" : allDepartments[i].SOC_DEPARTMENT_CODE, "value" : allDepartments[i].SOC_DEPARTMENT_DESCRIPTION};
//    	    	  supersonic.logger.debug(allDepartments[i].SOC_DEPARTMENT_CODE + " : " + allDepartments[i].SOC_DEPARTMENT_DESCRIPTION);
		  		}
		  		$scope.departments = departmentObjects;
    	    	$scope.selectedDept = departmentObjects[0];

    			$scope.changeDept();
		  	}).
		  	error(function(data, status, headers, config) {
		  		supersonic.logger.debug( status );
		  	});

		  supersonic.logger.debug("Querying executed!");
	  };
	  
	  $scope.changeDept = function () {
		  selectModules(supersonic, $scope, $http);
	  };

	  // The next two functions provide the expand/collapse feature.
	  $scope.toggleCourse = function(course) {
		  if (course.expanded === true) {
			  course.expanded = false;
		  } else {
			  course.expanded = true;
		  }
	  };
	  
	  $scope.isGroupShown = function(course) {
		  if (course.expanded === true) {
			  return true;
		  } else {
			  return false;
		  }
	  };
	  
	 
	  // filter functions - set isEnabledByDay, isEnabledByTime, isEnabledByCode, isEnabledByUnits
	  $scope.isCourseEnabled = function(course) {
		  return course.isEnabledByDay && course.isEnabledByTime && course.isEnabledByCode && course.isEnabledByUnits;
	  };
	  
	  $scope.isSectionEnabled = function (section) {
		  return section.isEnabledByDay && section.isEnabledByTime;
	  };
	  
	  
	  // navigation
	  $scope.navigate = function (page) {
		  var view = new supersonic.ui.View("main#" + page);
		  supersonic.ui.layers.push(view);
	  }
	  
	  supersonic.ui.views.current.whenVisible(function() {
		  supersonic.ui.navigationBar.hide();
		  supersonic.logger.debug("select-class is now visible");
		  runFilter (supersonic, $scope);
	  });
	  
	  $scope.addCourse = function (course, section, event) {
		  $("#flyout").css("left",event.x);
		  $("#flyout").css("top",event.y);
		  $("#flyout").show();
		  var devH = window.screen.height/4;
		  $("#flyout").animate({
	            opacity: '0.5',
	            top: devH,
	            left: "-200px"
	        }, "slow");
		  var interestedCourses = JSON.parse(window.localStorage.getItem('EasyReg.interestedCourses'));
		  var courseAlreadyExist = false;
		  
		  supersonic.logger.debug(course.SIS_COURSE_ID + " " + interestedCourses.length);
		  
		  for (var cour in interestedCourses) {
			  var c = interestedCourses[cour];
			  if (c.SIS_COURSE_ID === course.SIS_COURSE_ID) {
				  courseAlreadyExist = true;
				  // update course sections.
				  break;
			  }
		  }
		  
		  if (courseAlreadyExist) {
			  supersonic.logger.debug("course exists. dont push" );
			  // update course sections
		  } else {
			  // add new course to calendar
			  course.isInterested = true;
			  course.isScheduled = true;
			  section.isInterested = true;
			  section.isScheduled = true;
			  
			  interestedCourses.push(course);
			  window.localStorage.setItem('EasyReg.interestedCourses', JSON.stringify(interestedCourses));
		  }
		  
	  };
	  
	  $scope.findSchool();
});


/*
 * http://petri.esd.usc.edu/socAPI/Courses/[TERM]/[OPTIONS]
 * return fields:
 * COURSE_ID, @SIS_COURSE_ID, @TITLE, @MIN_UNITS, @MAX_UNITS, TOTAL_MAX_UNITS, @DESCRIPTION, DIVERSITY_FLAG, EFFECTIVE_TERM_CODE, V_SOC_SECTION
 */
function selectModules (supersonic, $scope, $http) {
	var term = "20151";
//	supersonic.logger.debug( "change department: " + $scope.selectedDept.code + " " + $scope.selectedDept.value);
	
	var queryUrl = "http://petri.esd.usc.edu/socAPI/Courses/" + term + "/" + $scope.selectedDept.code;
//	supersonic.logger.debug( "Query URL: " + queryUrl);
	
	$http.get(queryUrl).
		success(function(data, status, headers, config) {
			$scope.courses = [];
			var coursesObjects = new Array();
			var allCourses = data;
			supersonic.logger.debug( "There are: " + allCourses.length + " courses.");
			$scope.totalCourses = allCourses.length;
			$scope.queriedCourses = 0;
			for (i = 0; i < allCourses.length; i++) {
				coursesObjects[i] = {
						"COURSE_ID" : allCourses[i].COURSE_ID, 
						"SIS_COURSE_ID" : allCourses[i].SIS_COURSE_ID, 
						"TITLE" : allCourses[i].TITLE, 
                        "MIN_UNITS": allCourses[i].MIN_UNITS,
                        "MAX_UNITS": allCourses[i].MAX_UNITS,
						"DESCRIPTION" : allCourses[i].DESCRIPTION,
						"isEnabledByDay" : true, 
						"isEnabledByTime" : true, 
						"isEnabledByCode" : true, 
						"isEnabledByUnits" : true,
		        		"isInterested": false,
		        		"isScheduled": false,
		        		"isRegistered": false,
		        		"isConflicted": false
				};
	    	  
				// select select sections for each course
				$scope.courses[i] = coursesObjects[i];
				$scope.courses[i].expanded = false;
				selectSections(supersonic, $scope, $http, i, allCourses[i].COURSE_ID);
			}
		}).
		error(function(data, status, headers, config) {
			supersonic.logger.debug( status );
		});
}


/*
 * Select sections for a given course ID
 * Fields: SECTION_ID, TERM_CODE, COURSE_ID, SIS_COURSE_ID, MIN_UNITS, MAX_UNITS, NAME, SECTION, SESSION, TYPE, BEGIN_TIME, END_TIME, DAY, LOCATION, REGISTERED, INSTRUCTOR, SEATS, ADD_DATE, CANCEL_DATE, PUBLISH_FLAG, PUBLISH_SECTION_FLAG, V_SOC_COURSE
 */
function selectSections (supersonic, $scope, $http, index, courseId) {
	var term = "20151";
	
	var queryUrl = "http://petri.esd.usc.edu/socAPI/Courses/" + term + "/" + courseId;
	
	$http.get(queryUrl).
		success(function(data, status, headers, config) {
			$scope.queriedCourses++;
			
			var toBeSkipedSec = 0;
			$scope.courses[index].sections = [];
			var sectionsObjects = new Array();
			var allSections = data.V_SOC_SECTION;
			for (i = 0; i < allSections.length; i++) {
				
				if (!allSections[i].DAY) {
					toBeSkipedSec++;
				} else {
					sectionsObjects[i-toBeSkipedSec] = {
							"SECTION_ID" : allSections[i].SECTION_ID,
							"TYPE" : allSections[i].TYPE, 
							"BEGIN_TIME" : allSections[i].BEGIN_TIME, 
							"END_TIME" : allSections[i].END_TIME, 
							"DAY" : allSections[i].DAY, 
							"LOCATION" : allSections[i].LOCATION, 
							"INSTRUCTOR" : allSections[i].INSTRUCTOR, 
							"SEATS" : allSections[i].SEATS,
							"isEnabledByDay" : true,
							"isEnabledByTime" : true,
			        		"isInterested": false,
			        		"isScheduled": false,
			        		"isRegistered": false,
			        		"isConflicted": false
					};
				}
				
			}
			$scope.courses[index].sections = sectionsObjects;
			
			if ($scope.queriedCourses == $scope.totalCourses) {
				supersonic.logger.debug("All sections of all courses have been retrieved!");
				runFilter (supersonic, $scope);
			} else {
//				supersonic.logger.debug("Retrieved: " + $scope.queriedCourses);
			}
			
			var leftPercent = Math.floor((Math.random() * 99) + 1);
			var rightPercent = 100 - leftPercent;
			// usc yellow : #FFCC00
			$(".selectEach").css("background", "linear-gradient(to right, #EEC9B7 "+leftPercent+"%, #FFF "+rightPercent+"%)");
		}).
		error(function(data, status, headers, config) {
			supersonic.logger.debug( status );
		});
}



function initLocalStorage () {
	
	// Initialize days
	var days = [ 
	             {day: 'Monday', selected: true, abbre : "M"}, 
	             {day: 'Tuesday', selected: true, abbre : "T"},
	             {day: 'Wednesday', selected: true, abbre : "W"},
	             {day: 'Thursday', selected: true, abbre : "H"},
	             {day: 'Friday', selected: true, abbre : "F"},
	             {day: 'Saturday', selected: true, abbre : "S"},
	             {day: 'Sunday', selected: true, abbre : "N"}
	             ]; 
    
	// Initialize time
	var hours = [ 
	             {hour: 'h1', selected: true, start: "00:00", end: "08:00", text: "Start before 08:00", abbre : "h1"}, 
	             {hour: 'h2', selected: true, start: "08:00", end: "09:00", text: "08:00 - 09:00", abbre : "h2"}, 
	             {hour: 'h3', selected: true, start: "09:00", end: "10:00", text: "09:00 - 10:00", abbre : "h3"}, 
	             {hour: 'h4', selected: true, start: "10:00", end: "12:00", text: "10:00 - 12:00", abbre : "h4"}, 
	             {hour: 'h5', selected: true, start: "12:00", end: "14:00", text: "12:00 - 14:00", abbre : "h5"}, 
	             {hour: 'h6', selected: true, start: "14:00", end: "16:00", text: "14:00 - 16:00", abbre : "h6"}, 
	             {hour: 'h7', selected: true, start: "16:00", end: "18:00", text: "16:00 - 18:00", abbre : "h7"}, 
	             {hour: 'h8', selected: true, start: "18:00", end: "20:00", text: "18:00 - 20:00", abbre : "h8"}, 
	             {hour: 'h9', selected: true, start: "20:00", end: "22:00", text: "20:00 - 22:00", abbre : "h9"}, 
	             {hour: 'h10', selected: true, start: "22:00", end: "23:59", text: "End after 22:00", abbre : "h10"}, 
	             ]; 
    
	// Initialize Code
	var levels = [
	              {level: "1", selected: true, text: "1xx"},
	              {level: "2", selected: true, text: "2xx"},
	              {level: "3", selected: true, text: "3xx"},
	              {level: "4", selected: true, text: "4xx"},
	              {level: "5", selected: true, text: "5xx"},
	              {level: "6", selected: true, text: "6xx"},
	              {level: "7", selected: true, text: "7xx"}
	              ];
    
    // Initialize Units
	var units = [
                {unit: "1", selected: true, text: "1 unit"},
                {unit: "2", selected: true, text: "2 unit"},
                {unit: "3", selected: true, text: "3 unit"},
                {unit: "4", selected: true, text: "4 unit"},
                {unit: "5", selected: true, text: "5 unit"},
                {unit: "6", selected: true, text: "6 unit and more"}
                ]

	window.localStorage.setItem('EasyReg.SelectDaysControllers.days', JSON.stringify(days));
	window.localStorage.setItem('EasyReg.SelectHoursControllers.hours', JSON.stringify(hours));
	window.localStorage.setItem('EasyReg.SelectLevelsControllers.levels', JSON.stringify(levels));
    window.localStorage.setItem('EasyReg.SelectUnitsControllers.units', JSON.stringify(units));
	window.localStorage.setItem('EasyReg.initialized', true);
	window.localStorage.setItem('EasyReg.interestedCourses', "[]");
	
}


function runFilter (supersonic, $scope) {
	filterDay(supersonic, $scope);
	filterTime(supersonic, $scope);
	filterLevel(supersonic, $scope); // 1xx, 2xx, 3xx, 4xx, 5xx
	filterUnit(supersonic, $scope);
	
}

/*
 * BUAD (Marshall School of Business )
 * M - Monday
 * T - Tuesday
 * W - Wednesday
 * H - Thursday
 * F - Friday 
 * S - Saturday TODO need to find out
 * ? - Sunday TODO need to find out
 * -------
 * 7654321
 * 0000001 - monday only
 * 0000011 - mon, tue
 * 0000111 - mon, tue, wed
 * 
 * Use Angular Filter function
 * 
 */
function filterDay (supersonic, $scope) {
	var courses = $scope.courses;

	var notSelectedDays = [];
	var selectedDays = [];
	var days = JSON.parse(window.localStorage.getItem('EasyReg.SelectDaysControllers.days'));
	
	for (var day in days) {
		if ( !days[day].selected ) {
			notSelectedDays.push(days[day].abbre);
		} else {
			selectedDays.push(days[day].abbre);
		}
	}
	
	for (var c in courses) {
		course = courses[c];
	
		var sections = course.sections;
		var disableCtr = 0;
		var enableCtr = 0;
		outerLoop:
			for (var s in sections) {
				for (var d in notSelectedDays) {
					//if (sections[s]["DAY"] === notSelectedDays[d]) {
					if (sections[s]["DAY"].indexOf(notSelectedDays[d])>-1) {
						sections[s].isEnabledByDay = false;
						disableCtr++;
						continue outerLoop;
					}
				}
				var len = 0;
				for (var d in selectedDays) {
					if (sections[s]["DAY"].indexOf(selectedDays[d])>-1) {
						len = len + 1;
						
					}
				}
				if(len === sections[s]["DAY"].length){
					sections[s].isEnabledByDay = true;
					enableCtr++;
					continue outerLoop;
				}
				
//				for (var d in selectedDays) {
//					if (sections[s]["DAY"] === selectedDays[d]) {
//						sections[s].isEnabledByDay = true;
//						enableCtr++;
//						continue outerLoop;
//					}
//				}
			}

		if (disableCtr == sections.length) {
			course.isEnabledByDay = false;
		} else {
			course.isEnabledByDay = true;
		}
	}
}


function filterTime (supersonic, $scope) {
	var courses = $scope.courses;

	var notSelectedHours = [];
	var selectedHours = [];
	var hours = JSON.parse(window.localStorage.getItem('EasyReg.SelectHoursControllers.hours'));
	
	var notSelctedHoursCount = 0;
	
	for (var hour in hours) {
		if ( !hours[hour].selected ) {
			notSelectedHours.push(hours[hour]);
			notSelctedHoursCount++;
		} else {
			selectedHours.push(hours[hour]);
		}
	}
	
	for (var c in courses) {
		course = courses[c];
	
		var sections = course.sections;
		var disableCtr = 0;
		var enableCtr = 0;
		outerLoop:
			for (var s in sections) {
				var checkedNotSelectedHourCounter = 0;
				var sectionStartTime = sections[s]["BEGIN_TIME"];
				var sectionEndTime = sections[s]["END_TIME"];
				
				for (var h in notSelectedHours) {
					var hour = notSelectedHours[h];
					// hour : {hour: 'h1', selected: true, start: "-", end: "-", text: "Start before 08:00", abbre : "h1"}
					
					if ( timeCompare(hour.start, hour.end, sectionStartTime, sectionEndTime) ) {
						sections[s].isEnabledByTime = false;
						disableCtr++;
						continue outerLoop;
					}
					checkedNotSelectedHourCounter++;
					if (notSelctedHoursCount === checkedNotSelectedHourCounter) {
						sections[s].isEnabledByTime = true;
					}
				}      
			}

		if (disableCtr === sections.length) {
			course.isEnabledByTime = false;
		} else {
			course.isEnabledByTime = true;
		}
	}
}

/**
 * Compare 
 * E.g. 00:00 - 08:00 && 07:00 - 09:00 => false
 * E.g. 08:00 - 12:00 && 07:00 - 09:00 => false
 * E.g. 12:00 - 14:00 && 11:00 - 13:00 => false
 * E.g. 22:00 - 23:59 && 20:00 - 23:06 => false
 * @param tSta start time of the unwanted slot
 * @param tEnd end time of the unwanted slot
 * @param secSta start time of the section
 * @param secEnd end time of the section
 * @returns true if section overlaps with unwanted slot
 */
function timeCompare (tSta, tEnd, secSta, secEnd) {
	// 6:00 5:00
	if ( tEnd > secSta && secEnd > tSta ) {
		return true;
	} else {
		return false;
	}
}


function filterLevel (supersonic, $scope) {
	var courses = $scope.courses;

	var notSelectedLevels = [];
	var selectedLevels = [];
	var levels = JSON.parse(window.localStorage.getItem('EasyReg.SelectLevelsControllers.levels'));
	
	for (var level in levels) {
		if ( !levels[level].selected ) {
			notSelectedLevels.push(levels[level].level);
		} else {
			selectedLevels.push(levels[level].level);
		}
	}
	
	for (var c in courses) {
		course = courses[c];
		var courseTitle = course.SIS_COURSE_ID;
		var courseCode = courseTitle.split("-")[1];
		var courseLevel = courseCode[0];
		for (var l in notSelectedLevels) {
			var level = notSelectedLevels[l];
			if (level === courseLevel) {
				course.isEnabledByCode = false;
				break;
			}
		}
			
		for (var l in selectedLevels) {
			var level = selectedLevels[l];
			if (level === courseLevel) {
				course.isEnabledByCode = true;
				break;
			}
		}
	}
	// End of flagSetForCourse
	
//	supersonic.logger.debug( "Courses in Level: " + JSON.stringify(courses));
}


function filterUnit (supersonic, $scope) {
	var courses = $scope.courses;
    var selectedUnits = [];
    var units = JSON.parse(window.localStorage.getItem('EasyReg.SelectUnitsControllers.units'));
    
    for(var unit in units){
        if( units[unit].selected){
            selectedUnits.push(units[unit].unit);
        }
    }
    
    for(var c in courses){
        course = courses[c];        
        var minUnit = course.MIN_UNITS;
        var maxUnit = course.MAX_UNITS;
        
        course.isEnabledByUnits = false;
        for(var u in selectedUnits){
            if(selectedUnits[u] <= 5 && minUnit <= selectedUnits[u] && selectedUnits[u] <= maxUnit){//unit:1~5
                course.isEnabledByUnits = true;
                break;
            }else if(selectedUnits[u] >= 6 && selectedUnits[u] <= minUnit){//unit:6+
                course.isEnabledByUnits = true;
                break;
            }
        }
//        supersonic.logger.debug( "Courses in Unit: " + JSON.stringify(courses));
    }
}

/*
 * USC Schools data. Moved from Database to this file to reduce API access and time. 
 */
var allSchools = [
                  {
                	  "id": "ACAD",
                      "SOC_SCHOOL_DESCRIPTION": "Iovine and Young Academy",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "ACCT",
                      "SOC_SCHOOL_DESCRIPTION": "Leventhal School of Accounting",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "ANSC",
                      "SOC_SCHOOL_DESCRIPTION": "Annenberg School for Communication and Journalism",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "ARCH",
                      "SOC_SCHOOL_DESCRIPTION": "Architecture",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "BUAD",
                      "SOC_SCHOOL_DESCRIPTION": "Marshall School of Business",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "CNTV",
                      "SOC_SCHOOL_DESCRIPTION": "Cinematic Arts",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "DANC",
                      "SOC_SCHOOL_DESCRIPTION": "Kaufman School of Dance",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "DENT",
                      "SOC_SCHOOL_DESCRIPTION": "Ostrow School of Dentistry",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "DHRP",
                      "SOC_SCHOOL_DESCRIPTION": "Physical Therapy",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "EDUC",
                      "SOC_SCHOOL_DESCRIPTION": "Rossier School of Education",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "ENGR",
                      "SOC_SCHOOL_DESCRIPTION": "Viterbi School of Engineering",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "FA",
                      "SOC_SCHOOL_DESCRIPTION": "Roski School of Art and Design",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "GE",
                      "SOC_SCHOOL_DESCRIPTION": "General Education",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "GERO",
                      "SOC_SCHOOL_DESCRIPTION": "Gerontology",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "GRAD",
                      "SOC_SCHOOL_DESCRIPTION": "Graduate Studies",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "LAS",
                      "SOC_SCHOOL_DESCRIPTION": "Dornsife College of Letters, Arts and Sciences",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "LAW",
                      "SOC_SCHOOL_DESCRIPTION": "Law",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "MED",
                      "SOC_SCHOOL_DESCRIPTION": "Keck School of Medicine",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "MUS",
                      "SOC_SCHOOL_DESCRIPTION": "Thornton School of Music",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "OT",
                      "SOC_SCHOOL_DESCRIPTION": "Occupational Science and Occupational Therapy",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "PHAR",
                      "SOC_SCHOOL_DESCRIPTION": "Pharmacy",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "PPD",
                      "SOC_SCHOOL_DESCRIPTION": "Price School of Public Policy",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "SOWK",
                      "SOC_SCHOOL_DESCRIPTION": "Social Work",
                      "SOC_DEPARTMENT_CODE": []
                  },
                  {
                      "id": "THTR",
                      "SOC_SCHOOL_DESCRIPTION": "Dramatic Arts",
                      "SOC_DEPARTMENT_CODE": []
                  }
              ];
