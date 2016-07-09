(function() {
  var tutorData,
      subjects,
      tutorTemplate,
      subjectsTemplate,
      tutorDataPromise,
      searchResultSelected = false,
      selectedSubject,
      shouldFilterBySubject = false,
      shouldFilterByOnline = false,
      shouldFilterByRadius = false,
      filteredData = {},
      sortResultsBy,
      $tutorResults,
      $subjectSearch,
      $subjectSearchResults,
      $subjectSearchBtn,
      $subjectSearchBtnResults,
      $searchSubjects,
      $foundSubjects,
      $subSearchBtnResults,
      $subjectSearchDisplay,
      $isOnlineCheck,
      $isInRadiusCheck,
      $selectRankPrice
    
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
        $selectRankPrice = $("#selectRankPrice");

        $isOnlineCheck = $("#isOnlineCheck");
        $isInRadiusCheck = $("#isInRadiusCheck");
        


        $isOnlineCheck.on("change", function() {
          shouldFilterByOnline = $(this).prop("checked");
          filterTutors();
        });

        $isInRadiusCheck.on("change", function() {
          shouldFilterByRadius = $(this).prop("checked");
          filterTutors();
        });

        $subjectSearch.on("input", function(e) {
          searchSubjects(e.target.value);
        });

        $selectRankPrice.on("change", function() {
          switch ($selectRankPrice.val()) {
            case "0":
              sortResultsBy = null;
              sortResults({});
              break;
            case "1": 
              sortResultsBy = "sortHighRank";
              sortResults({property: "Rank", highLow: "high"});
              break;
            case "2":
              sortResultsBy = "sortLowRank";
              sortResults({property: "Rank", highLow: "low"});
              break;
            case "3":
              sortResultsBy = "sortHighPrice";
              sortResults({property: "HourlyRate", highLow: "high"});
              break;
            case "4":
              sortResultsBy = "sortLowPrice";
              sortResults({property: "HourlyRate", highLow: "low"});
              break;
            default:
              break;
          }
        });
        
        $subSearchBtnResults.on("click", function(e) {
          searchResultSelected = false;
          displaySubjectResults({results:[]});
          $subjectSearch.val(null);
          toggleHide([$searchSubjects, $foundSubjects, $subSearchBtnResults, $subjectSearch]);
          shouldFilterBySubject = false;
          filterTutors();
        });

        $subjectSearchBtn.on("click", function(e) {
          var data = $.extend({}, tutorData);
          
          shouldFilterBySubject = true;
          filterTutors();
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

      sortResults = function(options) {
        var data;

        if (options.property === "undefined") {
          return;
        }

        if (shouldFilterBySubject || shouldFilterByOnline || shouldFilterByRadius) {
          data = dataParsers.sortTutors(filteredData, options);
          displayTutorResults(data);
        } else {
          data = dataParsers.sortTutors(tutorData, options);
          displayTutorResults(data);
        }
      },

      filterTutors = function() {
        var data = $.extend({}, tutorData);
        
        // This can be made more elegant
        data = shouldFilterBySubject ? dataParsers.tutorsForSubject(data, selectedSubject) : data;
        data = shouldFilterByOnline ? dataParsers.tutorsOnline(data) : data;
        data = shouldFilterByRadius ? dataParsers.tutorsRadius(data) : data;
        
        filteredData = data;

        displayTutorResults(data);
      },

      resetFilters = function() {
        shouldFilterBySubject = true;
        shouldFilterByOnline = true;
        shouldFilterByRadius = true;
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

        tutorsOnline: function(data) {
          var length = data.SearchResults.length;
          var tutors = [];
          
          for (var i=0; i < length; i++) {
            if (data.SearchResults[i].IsOnline) {
              tutors.push(data.SearchResults[i]);
            }
          }

          data.SearchResults = tutors;

          return data;
        },

        tutorsRadius: function(data) {
          var length = data.SearchResults.length;
          var tutors = [];
          
          for (var i=0; i < length; i++) {
            if (data.SearchResults[i].Distance <= 5) {
              tutors.push(data.SearchResults[i]);
            }
          }

          data.SearchResults = tutors;

          return data;
        },

        unsorted: function(data) {

        },

        sortTutors: function(data, options) {
          if (options.property === "undefined") {
            alert("undefined");
          }

          data.SearchResults.sort(function(a, b) {
              return options.highLow === "low" ? parseFloat(a[options.property]) - parseFloat(b[options.property]) :
                parseFloat(b[options.property]) - parseFloat(a[options.property]);
          });

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