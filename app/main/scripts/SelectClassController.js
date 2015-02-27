angular
  .module('main')
  .controller('SelectClassController', function($scope, supersonic, $http) {
	  $scope.navbarTitle = "Select Class"; 
	  
	  $scope.run = function () {
		  window.localStorage.clear();
		  if (window.localStorage.getItem('EasyReg.initialized')!==null) {
			  supersonic.logger.debug( "already set" );
		  } else {
			  initLocalStorage();
			  supersonic.logger.debug( "init" );
		  }
	  };
	  
	  $scope.findSchool = function () {
		  var school = supersonic.data.model('school');
		  // find all schools at backend
		  school.findAll().then( function(allSchools) {
			  $scope.schoolLength = allSchools.length;
			  supersonic.logger.debug($scope.schoolLength);
			  $scope.schools = [];
			  var schoolObjects = new Array();
			  for (i = 0; i < allSchools.length; i++) {
				  // id is SOC_SCHOOL_CODE
				  schoolObjects[i] = {"code" : allSchools[i].id, "value" : allSchools[i].SOC_SCHOOL_DESCRIPTION};
			  }
			  $scope.schools = schoolObjects;
			  $scope.selectedSchool = schoolObjects[0];
			  
			  $scope.run();
		  }, function (error) {
			  supersonic.logger.debug(error);
		  });
	  };
	  
	  $scope.findSchool();
	  
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
		  return section.isEnabledByDay && section.isEnabledByTime && section.isEnabledByUnits;
	  };
	  
	  
	  // navigation
	  $scope.navigate = function (page) {
		  var view = new supersonic.ui.View("main#" + page);
		  supersonic.ui.layers.push(view);
	  }
	  
	  supersonic.ui.views.current.whenVisible(function() {
		  supersonic.logger.debug("select-class is now visible");
		  runFilter (supersonic, $scope);
	  });
	  
	  
	  $scope.addCourse = function (course, section) {
		  
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
			
			$scope.courses[index].sections = [];
			var sectionsObjects = new Array();
			var allSections = data.V_SOC_SECTION;
			for (i = 0; i < allSections.length; i++) {
				sectionsObjects[i] = {
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
						"isEnabledByUnits" : true,
		        		"isInterested": false,
		        		"isScheduled": false,
		        		"isRegistered": false,
		        		"isConflicted": false
				};
			}
			$scope.courses[index].sections = sectionsObjects;
			
			if ($scope.queriedCourses == $scope.totalCourses) {
				supersonic.logger.debug("All sections of all courses have been retrieved!");
				runFilter (supersonic, $scope);
			} else {
//				supersonic.logger.debug("Retrieved: " + $scope.queriedCourses);
			}
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
	
	var levels = [
	              {level: "1", selected: true, text: "1xx"},
	              {level: "2", selected: true, text: "2xx"},
	              {level: "3", selected: true, text: "3xx"},
	              {level: "4", selected: true, text: "4xx"},
	              {level: "5", selected: true, text: "5xx"},
	              {level: "6", selected: true, text: "6xx"},
	              {level: "7", selected: true, text: "7xx"}
	              ];
	

	window.localStorage.setItem('EasyReg.SelectDaysControllers.days', JSON.stringify(days));
	window.localStorage.setItem('EasyReg.SelectHoursControllers.hours', JSON.stringify(hours));
	window.localStorage.setItem('EasyReg.SelectLevelsControllers.levels', JSON.stringify(levels));
	window.localStorage.setItem('EasyReg.initialized', true);
	window.localStorage.setItem('EasyReg.interestedCourses', "[]");
	
	
	// Initialize time
	
	
	// Initialize Units
	
	
	// Initialize Code
}


function runFilter (supersonic, $scope) {
	filterDay(supersonic, $scope);
	filterTime(supersonic, $scope);
	filterLevel(supersonic, $scope); // 1xx, 2xx, 3xx, 4xx, 5xx
//	filterUnit(supersonic, $scope);
	
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
					if (sections[s]["DAY"] === notSelectedDays[d]) {
						sections[s].isEnabledByDay = false;
						disableCtr++;
						continue outerLoop;
					}
				}      
				for (var d in selectedDays) {
					if (sections[s]["DAY"] === selectedDays[d]) {
						sections[s].isEnabledByDay = true;
						enableCtr++;
						continue outerLoop;
					}
				}
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


function filterUnit () {
	
}






