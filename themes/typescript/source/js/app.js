/* eslint-disable */
var customSearch;
(function($) {
	
	"use strict";

  var scrolltoElement = function(e) {
    e.preventDefault();
    var self = $(this),
        correction = e.data ? e.data.correction ? e.data.correction : 0 : 0;
    $('html, body').animate({'scrollTop': $(self.attr('href')).offset().top - correction }, 400);
  };
	
  var closeMenu = function() {
    $('body').removeClass('menu-open');
		$('#site-nav-switch').removeClass('active');
  };
  
  var toggleMenu = function() {
	  $('body').toggleClass('menu-open');
    $('#site-nav-switch').toggleClass('active');
  };
	
	var openSearch = function() {
		$('#header').addClass('search-open');
	}
	
	var closeSearch = function(e) {
		$('#header').removeClass('search-open');
	}
	$(function() {
		$('#footer, #main').addClass('loaded');
		$('#site-nav-switch').click(function(e){e.stopPropagation();toggleMenu()});
		$('#header .search-switch').click(function(e){
			e.stopPropagation();
			openSearch();
		})
		$(document).on('click', function(e){
			e.stopPropagation();
			closeMenu();
			closeSearch();
		});
		$('#site-menu,.search').click(function (e) {
			e.stopPropagation();
		});
		$('.window-nav, .go-comment').on('click', scrolltoElement);
    $(".content .video-container").fitVids();

		setTimeout(function() {
	    $('#loading-bar-wrapper').fadeOut(500);
	  }, 300);
	  
	  if (SEARCH_SERVICE === 'google') {
  	  customSearch = new GoogleCustomSearch({
    	  apiKey: GOOGLE_CUSTOM_SEARCH_API_KEY,
    	  engineId: GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
        imagePath: "/images/"
  	  });
	  }
	  else if (SEARCH_SERVICE === 'algolia') {
  	  customSearch = new AlgoliaSearch({
    	  apiKey: ALGOLIA_API_KEY,
    	  appId: ALGOLIA_APP_ID,
    	  indexName: ALGOLIA_INDEX_NAME,
        imagePath: "/images/"
  	  });
	  }
	  else if (SEARCH_SERVICE === 'hexo') {
  	  customSearch = new HexoSearch({
        imagePath: "/images/"
      });
	  }
	  else if (SEARCH_SERVICE === 'azure') {
  	  customSearch = new AzureSearch({
    	  serviceName: AZURE_SERVICE_NAME,
        indexName: AZURE_INDEX_NAME,
        queryKey: AZURE_QUERY_KEY,
        imagePath: "/images/"
  	  });
	  }
	  else if (SEARCH_SERVICE === 'baidu') {
  	  customSearch = new BaiduSearch({
				apiId: BAIDU_API_ID,
        imagePath: "/images/"
			});
	  }

	});
		
})(jQuery);