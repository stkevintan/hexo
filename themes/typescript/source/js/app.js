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
	
	var openSearch = function() {
		$('header').addClass('z_search-open');
	}
	
	var closeSearch = function(e) {
		$('header').removeClass('z_search-open');
	}

	function setHeaderMenu(){
		var $headerMenu = $('header .menu');
		var $currentItem = $headerMenu.find('li a.active');
		var $underline = $headerMenu.find('.underline');
		function setUnderline($item){
			$item = $item || $currentItem;
			if($item.length===0)return;
			$underline.css({
				left:  $item.position().left,
				width: $item.innerWidth()
			});
		}
		$headerMenu.on('mouseenter','li',function(e){
			setUnderline($(e.currentTarget));
		});
		$headerMenu.on('mouseout',function(){
			setUnderline();
		});
		setUnderline();
	}
	function setHeaderMenuPhone(){
		var $switcher=$('.m_header .switcher .s-menu');
		var $pmenu = $('.m_header .menu-phone');
		$switcher.click(function(e){
			e.stopPropagation();
			$('body').toggleClass('z_menu-open');
			$pmenu.toggleClass('active');
		});
		$(document).click(function(e){
			$('body').removeClass('z_menu-open');
			$pmenu.removeClass('active');
		});
	}
	function setHeaderSearch(){
		var $switcher = $('.m_header .switcher .s-search');
		var $header = $('.m_header');
		var $search = $('.m_header .m_search');
		if($switcher.length === 0)return;
		$switcher.click(function(e){
			e.stopPropagation();
			$header.toggleClass('z_search-open');
		});
		$(document).click(function(e){
			$header.removeClass('z_search-open');
		});
		$search.click(function(e){
			e.stopPropagation();
		})
	}
	$(function() {
		//set header
		setHeaderMenu();
		setHeaderMenuPhone();
		setHeaderSearch();

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