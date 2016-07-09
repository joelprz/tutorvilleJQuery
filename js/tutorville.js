(function() {
  var tutorData,
      subjects,
	    tutorTemplate,
      subjectsTemplate,
		  tutorDataPromise,
      searchResultSelected = false,
		  $tutorResults,
      $subjectSearch,
      $subjectSearchResults,
      $subjectSearchBtn
		
      init = function() {
        $tutorResults = $("#tutorResults");
        $subjectSearch = $("#subjectSearch");
        $subjectSearchResults = $("#subjectSearchResults");
        $subjectSearchBtn = $("#subjectSearchBtn");
 
        $subjectSearch.on("input", function(e) {
          searchSubjects(e.target.value);
        });

        $subjectSearchResults.on("click", function(e) {
          $subjectSearch.val(subjects[$(e.target).html()]);
          displaySubjectResults({results:[]});
          $subjectSearchBtn.toggleClass('hide');
          searchResultSelected = true;
        });

        parseTemplates();
        displayInitialTutorResults();
      },

      searchSubjects = function(srchStr) {
        var subject = srchStr.toLowerCase() || null,
            results = [];
        
        if (searchResultSelected) {
          searchResultSelected = false;
          $subjectSearchBtn.toggleClass('hide')
        }
        
        if(!subject) {
          displaySubjectResults({results:results});
          return;
        }
        
        for (key in subjects) {
          if (key.indexOf(subject) >= 0) {
            results.push({name: key});
          }  
        }

        if (results.length > 0) {
          displaySubjectResults({results:results});
        }

      },
    		
      getTutorData = function() {
        $.ajax({
          url: "data/tutorResults.json",
          type: "GET",
          dataType: "json"
        }).done(function(data) {
          tutorData = dataParsers.tutor(data);
          subjects = dataParsers.subjects(data);
          
          if (typeof tutorDataPromise === "function") {
            tutorDataPromise();
          }

        });
      },
		
      parseTemplates = function() {
        tutorTemplate = $("#tutorTemplate").html();
        subjectsTemplate = $("#subjectsTemplate").html();

        Mustache.parse(tutorTemplate);
        Mustache.parse(subjectsTemplate);
      },
    		
      displayInitialTutorResults = function() {

        if (typeof tutorData === "undefined") {
          tutorDataPromise = displayInitialTutorResults;
          return;
        }

        displayTutorResults(tutorData);
      },
    		
      displayTutorResults = function(d){
        d.SeachCount = d.SearchResults.length;
        d.TutorCountIsNotOne = d.SearchResults.length !== 1;
        $tutorResults.html(Mustache.render(tutorTemplate, d));
      },

      displaySubjectResults = function(data) {
        $subjectSearchResults.html(Mustache.render(subjectsTemplate, data));
      },
    			
      dataParsers = {
        tutor: function(data) {
          var length = data.SearchResults.length;

          for (var i=0; i < length; i++) {
            data.SearchResults[i].starPercent = (data.SearchResults[i].StarRating/5) * 100;
          }

          return data;
        },
        subjects: function(data) {
          var length = data.SearchResults.length,
              subjectLookup = {};

          for (var i=0; i < length; i++) {
            for (var j=0; j < data.SearchResults[i].Subjects.length; j++)  {
              subjectLookup[  data.SearchResults[i].Subjects[j].toLowerCase()  ] = data.SearchResults[i].Subjects[j];
            }
          }
          
          return subjectLookup;
        }
      };
	
  getTutorData();
	
	$(function() {
		init();
	});
	
})();