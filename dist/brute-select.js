/*! Brute Select - v1.0.5 - 2013-04-10
* http://grassator.github.com/jquery-brute-select/
* Copyright (c) 2013 Dmitriy Kubyshkin; Licensed MIT */
(function ($) {
	"use strict";

	/**
	 * Brute Select main class
	 * @param {jQuery} $select
	 * @param {object} options
	 * @constructor
	 */
	function BruteSelect ($select, options) {
		// Merging options into our object for easier access from outside
		// to our function like "formatter" or "wrap"
		$.extend(this, options);

		// Adding references to necessary elements
		this.$select = $select;
		$.extend(this, this.markup($select));

		this.bindEvents();
	}

	BruteSelect.prototype = {
		/**
		 * This is used for getting option values that can be either
		 * static (scalar types) or dynamic (functions)
		 * @param {string} key
		 * @returns {*}
		 */
		getValue: function(key) {
			if(typeof this[key] === 'function') {
				return this[key]();
			}
			return this[key];
		},

		/**
		 * Adds special class to allow styling of our custom markup
		 * when original native select is focused
		 * @param {Event=} e
		 */
		onFocusBlur: function(e) {
			this.$el.toggleClass(
				this.generateClassName('focus', true),
				(e && (e.type === 'focus' || e.type === 'focusin')) || this.$select.is(':focus')
			);
		},

		/**
		 * Updates custom title element
		 */
		updateTitle: function() {
			var value = this.formatter(
				this.$select.find(':selected').text(), this.$select.val(), this.$select, this.$el
			);

			// By default stripping out tags from formatted option value since
			// it could allow for XSS vulnerability if option list is generated
			// by users and not filtered in formatter or on server side
			if(this.allowHtmlInTitle) {
				this.$title.html(value);
			} else {
				this.$title.text(value);
			}
		},

		/**
		 * Bind all necessary event handlers
		 */
		bindEvents: function() {
			// Toggling special focus class when native select is focused / blurred
			this.$el.on(
				'focusin.' + this.baseName + ' focusout.' + this.baseName,
				$.proxy(this.onFocusBlur, this)
			);
			this.onFocusBlur();

			// Since native select is hidden we need to display option title somewhere
			this.$select.on('change.' + this.baseName, $.proxy(this.updateTitle, this));
			
			// In order for title to update properly we also need to listen to
			// key up event (this is necessary mostly in firefox)
			this.$select.on('keyup.' + this.baseName, $.proxy(this.updateTitle, this));
			
			// when initializing we also neet to update select title
			this.updateTitle();
		},

		/**
		 * If you need to destroy plugin instance, but keep original select,
		 * then you should call this method to avoid memory leaks
		 */
		destroy: function() {
			// Unbinding events to allow garbage collection
			this.$el.off('.' + this.baseName);
			this.$select.off('.' + this.baseName);

			// unwrapping native select
			this.$select.removeClass(this.generateClassName('select')).insertBefore(this.$el);

			// and removing now unnecessary markup
			this.$el.remove();
		}
	};

	/**
	 * Main initialization function for plugin.
	 * Also allows calling methods on already initialized instances
	 * @param {(string|object)=} options
	 * @returns {*}
	 */
	function bruteSelectPlugin (options) {
		if(typeof options !== 'string') {
			options = $.extend({}, bruteSelectPlugin.options, options);
		}

		/*jshint validthis: true */
		this.filter('select').each(function () {
			var $this = $(this),
				data = $this.data(options.baseName);
			if (typeof options === 'string') {
				data[options].apply($this, Array.prototype.slice.call(arguments, 1));
			} else if(!data) {
				$this.data(options.baseName, new BruteSelect($this, options));
			}
		});

		// Returning original collection for consistency
		return this;
	}

	/**
	 * Providing plugin class for outside usage (e.g. extension)
	 * @type {BruteSelect}
	 */
	bruteSelectPlugin.klass = BruteSelect;

	/**
	 * Default formatter for select title
	 * @param {string} title Option title
	 * @param {string} value Option value
	 * @param {jQuery} $select <select> element
	 * @param {jQuery} $el jQuery top wrapper element
	 * @context BruteSelect
	 */
	bruteSelectPlugin.formatter = function (title, value, $select, $el) {
		return title;
	};

	/**
	 * Wraps native select into necessary markup and returns references to necessary elements
	 * @param {jQuery} $select
	 * @returns {{$el: jQuery, $title: jQuery}}
	 */
	bruteSelectPlugin.markup = function ($select) {
		var $el = $select.addClass(this.generateClassName('select')).wrap(
			'<span class="' + this.generateClassName() + '"/>'
		).parent();
		$('<span class="' + this.generateClassName('arrow') + '"/>').prependTo($el);
		return {
			$el: $el,
			$title: $('<span class="' + this.generateClassName('title') + '"/>').prependTo($el)
		};
	};

	/**
	 * Generates appropriate class name for plugin-generated element
	 * @param {string=} extra
	 * @param {boolean=} isModifier
	 * @returns {string}
	 */
	bruteSelectPlugin.generateClassName = function (extra, isModifier) {
		return this.getValue('baseName') + (extra ? '-' + extra : '');
	};

	/**
	 * Default options for a plugin
	 * @type {{baseName: (string|Function), generateClassName: Function, formatter: Function, wrap: Function}}
	 */
	bruteSelectPlugin.options = {
		baseName: 'brute-select',
		generateClassName: bruteSelectPlugin.generateClassName,
		markup: bruteSelectPlugin.markup,
		formatter: bruteSelectPlugin.formatter,
		allowHtmlInTitle: false
	};

	// Providing our function as a jQuery plugin
	$.fn.bruteSelect = bruteSelectPlugin;

}(jQuery));
