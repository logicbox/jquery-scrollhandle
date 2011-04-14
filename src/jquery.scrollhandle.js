(function($,window,undefined) {
	$.widget("wk.scrollhandle",{
		_create: function() {
			//reset scroll position
			$(this.element).find(this.options.scroller).scrollLeft(0);
			
			//work out width of scroller
			var $elements = $(this.element).find(this.options.scroller).find('> * > *');
			var scroller_width = $elements.eq(0).outerWidth(true) * $elements.length;
			var container_width = $(this.element).find(this.options.scroller).innerWidth();
			
			this.valid_scroller = scroller_width > container_width;
			
			if (!this.valid_scroller)
			{
				return;	
			}
			
			//set width of scroller
			$(this.element).find(this.options.scroller).find('> *').width(scroller_width);
			
			if (this.options.scroll_factor === null) 
			{
				//get dimension of draggable
				var draggable_width = $(this.element).find(this.options.draggable).parent().width() - $(this.options.draggable,this.element).width();
				
				//get dimension of scrollable area total content width < container width
				var scroll_overflow = scroller_width - container_width;// $(this.element).find(this.options.scroller).width();
				this.options.scroll_factor = scroll_overflow / draggable_width;
			}
			
			this.set_scroll_factor(this.options.scroll_factor);
			this.options.supports_touch = ('createTouch' in document);
		},
		set_scroll_factor: function(x) {
			this.options.scroll_factor = x;
		},
		_init: function() {
			
			var self = this;
			
			//if a scrollable area doesn't need scrolling, fade out scrollhandle
			if (!this.valid_scroller) 
			{
				$(this.element).find(this.options.draggable).parent(':visible').fadeOut(this.options.toggle_duration);
				this.destroy();
				return;
			}
			
			if (!this.options.supports_touch)
			{
				$(this.options.draggable,this.element).draggable({
					axis: this.options.axis, 
					containment: this.options.containment
				});

				$(this.options.draggable,this.element).bind("drag", function (event, ui) {
					//set scrollLeft of scroller	
					$(self.element).find(self.options.scroller).scrollLeft(ui.position.left * self.options.scroll_factor);
				});
			} 
			else
			{
				var startX, leftPos;
				var maxX = $(this.element).find(this.options.draggable).parent().width() - $(this.element).find(this.options.draggable).width();
				
				$(this.options.draggable,this.element).css({position:'relative',left: '0px'})
				.bind("touchstart MozTouchDown", function(e) {
					e = e.originalEvent.touches[0];
					
					leftPos = parseInt($(this).css('left'));
					startX = e.pageX;
					
					e.stopPropagation();
					e.preventDefault();
					
				}).bind('touchmove MozTouchMove', function(e) {
					
					e.stopPropagation();
					e.preventDefault();
					e = e.originalEvent.touches[0];
					
					var left = (e.pageX - startX) + leftPos;
					
					if (left < 0) left = 0;
					else if (left > maxX) left = maxX;
					
					$(this).css('left', left + 'px');
					$(self.element).find(self.options.scroller).scrollLeft(left * self.options.scroll_factor);
					
				}).bind("touchend MozTouchRelease dragstart drag mousewheel DOMMouseScroll", function(e) {
					e.preventDefault(); return false;
				});				
			}
			
			$(this.element).find(this.options.draggable).parent(':hidden').fadeIn(this.options.toggle_duration);
			
		},
		destroy: function() {
			$.Widget.prototype.destroy.apply(this, arguments);
			if (this.valid_scroller)
			{
				if (!this.options.supports_touch)
				{
					$(this.options.draggable,this.element).css({left: '0px'}).draggable('destroy').unbind();
				}
				else {
					$(this.options.draggable,this.element).css({left: '0px'}).unbind();
				}
			}
			$(this.element).find(this.options.scroller).scrollLeft(0);
		},
		options: {
			draggable: '> div:eq(1) > div',
			scroller: '> div:eq(0)',
			axis: "x",
			containment: "parent",
			toggle_duration: 0,
			scroll_factor: null,
			supports_touch: null
		}
	});
})(jQuery,window);