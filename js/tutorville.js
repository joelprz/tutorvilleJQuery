(function() {
  var tutorData,
      subjects,
      tutorTemplate,
      subjectsTemplate,
      tutorDataPromise,
      selectedSubject,
      isSearchResultSelected = false,
      isFilteredBySubject = false,
      isFilteredByOnline = false,
      isFilteredByRadius = false,
      isTutorListSorted = false,
      sortedBy = {},
      filteredData = {},
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
      $selectRankPrice,
      $resetFiltersBtn
    
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
        $resetFiltersBtn = $("#resetFiltersBtn");

         /* BEGIN SUBJECT_SEARCH */

        // Subject search input listener
        $subjectSearch.on("input", function(e) {
          searchSubjects(e.target.value);
        });
        
        // User selects from subjects search results
        $subjectSearchResults.on("click", function(e) {

          var subjectName = subjects[$(e.target).html().toLowerCase()];
          
          selectedSubject = subjectName;
          $subjectSearch.val(subjectName);
          displaySubjectResults({results:[]});
          toggleHide([$subjectSearchBtn]);
          isSearchResultSelected = true;
        });

        // Applies filtering by clicking Search btn
        $subjectSearchBtn.on("click", function() {
          isFilteredBySubject = true;
          filterTutors();
          $subjectSearchDisplay.html(selectedSubject);
          toggleHide([$subjectSearchBtn, $searchSubjects, $foundSubjects, $subSearchBtnResults, $subjectSearch, $subjectSearchResults]);
        });

        // Remove subject filter and reset
        $subSearchBtnResults.on("click", function() {
          isSearchResultSelected = false;
          displaySubjectResults({results:[]});
          $subjectSearch.val(null);
          toggleHide([$searchSubjects, $foundSubjects, $subSearchBtnResults, $subjectSearch, $subjectSearchResults]);
          isFilteredBySubject = false;
          filterTutors();
        });

        /* END SUBJECT_SEARCH */
        
        $isOnlineCheck.on("change", function() {
          isFilteredByOnline = $(this).prop("checked");
          filterTutors();
        });

        $isInRadiusCheck.on("change", function() {
          isFilteredByRadius = $(this).prop("checked");
          filterTutors();
        });

        $selectRankPrice.on("change", function() {
          var options = $selectRankPrice.val().split("-");

          sortedBy = {highLow: options[0], property: options[1]};
          isTutorListSorted = true;

          sortResults(sortedBy);
        });

        $resetFiltersBtn.on("click", resetFilters);

        parseTemplates();
        displayInitialTutorResults();
      },

      toggleHide = function(elems) {
        $.each(elems, function(index, value) {
          value.toggleClass('hide');  
        });
      },

      sortResults = function(options) {
        var data = {};
        
        if (isFilteredBySubject || isFilteredByOnline || isFilteredByRadius) {
          data = dataParsers.sortTutors(filteredData, options);
        } else {
          data = dataParsers.sortTutors($.extend(true, {}, tutorData), options);
        }
        
        displayTutorResults(data);
      },

      filterTutors = function() {
        var data = $.extend(true, {}, tutorData);
        
        // This can be made more elegant
        data = isFilteredBySubject ? dataParsers.tutorsForSubject(data, selectedSubject) : data;
        data = isFilteredByOnline ? dataParsers.tutorsOnline(data) : data;
        data = isFilteredByRadius ? dataParsers.tutorsRadius(data) : data;

        if (isTutorListSorted) {
          data = dataParsers.sortTutors(data, sortedBy);
        }

        filteredData = data;
        displayTutorResults(data);
      },

      resetFilters = function() {
        isFilteredBySubject = false;
        isFilteredByOnline = false;
        isFilteredByRadius = false;
        isTutorListSorted = false;
        isSearchResultSelected = false;
        sortedBy = {};

        $isOnlineCheck.prop("checked", false);
        $isInRadiusCheck.prop("checked", false);

        selectedSubject = null;
        $subjectSearch.val(null);

        sortedBy = {};
        $selectRankPrice.val(0);

        $(".reset-show").removeClass("hide");
        $(".reset-hide").addClass("hide");

        displayInitialTutorResults();
      },

      searchSubjects = function(srchStr) {
        var subject = srchStr.toLowerCase() || null,
            results = [];
        
        if (isSearchResultSelected) {
          isSearchResultSelected = false;
          $subjectSearchBtn.toggleClass('hide')
        }
        
        if(!subject) {
          displaySubjectResults({results:results});
          return;
        }
        
        for (key in subjects) {
          if (key.indexOf(subject) >= 0) {
            results.push({name: subjects[key]});
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
        d.SubjectFilter = isSearchResultSelected ? selectedSubject : "";
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
          var length = data.SearchResults.length,
              tutors = [];
          
          for (var i=0; i < length; i++) {
            if ( $.inArray(subject, data.SearchResults[i].Subjects) !== -1 ) {
              tutors.push(data.SearchResults[i]);
            }
          }

          data.SearchResults = tutors;

          return data;
        },

        tutorsOnline: function(data) {
          var length = data.SearchResults.length,
              tutors = [];
          
          for (var i=0; i < length; i++) {
            if (data.SearchResults[i].IsOnline) {
              tutors.push(data.SearchResults[i]);
            }
          }

          data.SearchResults = tutors;

          return data;
        },

        tutorsRadius: function(data) {
          var length = data.SearchResults.length,
              tutors = [];
          
          for (var i=0; i < length; i++) {
            if (data.SearchResults[i].Distance <= 5) {
              tutors.push(data.SearchResults[i]);
            }
          }

          data.SearchResults = tutors;

          return data;
        },

        sortTutors: function(data, options) {
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