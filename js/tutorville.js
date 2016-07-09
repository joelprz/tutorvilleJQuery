(function() {
  var tutorData,
      subjects,
      tutorTemplate,
      subjectsTemplate,
      tutorDataPromise,
      searchResultSelected = false,
      selectedSubject,
      $tutorResults,
      $subjectSearch,
      $subjectSearchResults,
      $subjectSearchBtn,
      $subjectSearchBtnResults,
      $searchSubjects,
      $foundSubjects,
      $subSearchBtnResults,
      $subjectSearchDisplay
    
      init = function() {
        $tutorResults = $("#tutorResults");
        $subjectSearch = $("#subjectSearch");
        $subjectSearchResults = $("#subjectSearchResults");
        $subjectSearchBtn = $("#subjectSearchBtn");
        $subjectSearchBtnResults = $("#subjectSearchBtnResults");
        $searchSubjects = $("#searchSubjects");
        $foundSubjects = $("#foundSubjects");
        $subSearchBtnResults = $("#subSearchBtnResults");
        $subjectSearchDisplay = $("#subjectSearchDisplay");
        
        $subjectSearch.on("input", function(e) {
          searchSubjects(e.target.value);
        });
        
        $subSearchBtnResults.on("click", function(e) {
          searchResultSelected = false;
          displaySubjectResults({results:[]});
          $subjectSearch.val(null);
          toggleHide([$searchSubjects, $foundSubjects, $subSearchBtnResults, $subjectSearch]);
          displayTutorResults(tutorData);
        });

        $subjectSearchBtn.on("click", function(e) {
          var data = $.extend({}, tutorData);
          
          displayTutorResults(dataParsers.tutorsForSubject(data, selectedSubject));
          $subjectSearchDisplay.html(selectedSubject);
          toggleHide([$subjectSearchBtn, $searchSubjects, $foundSubjects, $subSearchBtnResults, $subjectSearch]);
        });

        $subjectSearchResults.on("click", function(e) {
          var subjectName = subjects[$(e.target).html()];
          selectedSubject = subjectName;
          $subjectSearch.val(subjectName);
          displaySubjectResults({results:[]});
          toggleHide([$subjectSearchBtn]);
          searchResultSelected = true;
        });

        parseTemplates();
        displayInitialTutorResults();
      },

      toggleHide = function(elems) {
        $.each(elems, function(index, value) {
          value.toggleClass('hide');  
        });

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

        displaySubjectResults({results:results});
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
        
      displayTutorResults = function(d) {
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
        
        tutorsForSubject: function(data, subject) {
          var length = data.SearchResults.length;
          var tutors = [];
          
          for (var i=0; i < length; i++) {
            if ( $.inArray(subject, data.SearchResults[i].Subjects) !== -1 ) {
              tutors.push(data.SearchResults[i]);
            }
          }

          data.SearchResults = tutors;

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