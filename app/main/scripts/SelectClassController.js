angular
  .module('main')
  .controller('SelectClassController', function($scope, supersonic, $http) {

	$scope.navbarTitle = "Select Class";
    
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
    		supersonic.logger.debug(allSchools[i].id + " : " + allSchools[i].SOC_SCHOOL_DESCRIPTION + " : " + allSchools[i].SOC_DEPARTMENT_CODE);
    	}
    	
    	$scope.schools = schoolObjects;
    	$scope.selectedSchool = schoolObjects[0];
    }, function (error) {
    	supersonic.logger.debug(error);
    });
    
    
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
    	    	  supersonic.logger.debug(allDepartments[i].SOC_DEPARTMENT_CODE + " : " + allDepartments[i].SOC_DEPARTMENT_DESCRIPTION);
    	    	}
    	    	
    	    	$scope.departments = departmentObjects;
    	    	$scope.selectedDept = departmentObjects[0];
    		  
    	    // this callback will be called asynchronously
    	    // when the response is available
    	  }).
    	  error(function(data, status, headers, config) {
    		  supersonic.logger.debug( status );
    	    // called asynchronously if an error occurs
    	    // or server returns response with an error status.
    	  });
    	
    	supersonic.logger.debug("Querying executed!");
    };
    
    
    $scope.changeDept = function () {
    	supersonic.logger.debug( $scope.selectedDept.code + " " + $scope.selectedDept.value);
    }
    
  });


