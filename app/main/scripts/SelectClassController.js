angular
  .module('main')
  .controller('SelectClassController', function($scope, supersonic, $http) {
	  $scope.navbarTitle = "Select Class"; 
	  
	  $scope.run = function () {
		  supersonic.logger.debug( "a" );
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
		  return section.isEnabledByDay && section.isEnabledByTime && section.isEnabledByCode && section.isEnabledByUnits;
	  };
	  
	  
	  // navigation
	  $scope.navigate = function (page) {
		  var view = new supersonic.ui.View("main#" + page);
		  supersonic.ui.layers.push(view);
	  }
	  
	  supersonic.ui.views.current.whenVisible(function() {
		  filterDay (supersonic, $scope);
		  supersonic.logger.debug("select-class is now visible");
	  });
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
						"isEnabledByUnits" : true
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
						"isEnabledByCode" : true,
						"isEnabledByUnits" : true
				};
			}
			$scope.courses[index].sections = sectionsObjects;
			
			if ($scope.queriedCourses == $scope.totalCourses) {
				supersonic.logger.debug("All sections of all courses have been retrieved!");
				filterDay (supersonic, $scope);
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
	             {day: 'Saturday', selected: true, abbre : "U"},
	             {day: 'Sunday', selected: true, abbre : "N"}
	             ]; 
	window.localStorage.setItem('EasyReg.SelectDaysControllers.days', JSON.stringify(days));
	window.localStorage.setItem('EasyReg.initialized', true);
	
	
	// Initialize time
	
	
	// Initialize Units
	
	
	// Initialize Code
}


/*
 * BUAD (Marshall School of Business )
 * M - Monday
 * T - Tuesday
 * W - Wednesday
 * H - Thursday
 * F - Friday 
 * ? - Saturday TODO need to find out
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
	supersonic.logger.debug( "Filter Days: " + notSelectedDays + " " + selectedDays);
	
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

	supersonic.logger.debug( JSON.stringify($scope.courses) );
}


function filterTime () {
	
}

function filterUnit () {
	
}


function filterLevel () {
	
}



