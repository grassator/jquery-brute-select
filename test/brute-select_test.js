(function ($) {

	module('jQuery#bruteSelect', {
		// This will run before each test in this module.
		setup: function () {
			this.$el = $('#qunit-fixture').find('select');
		}
	});

	test('is chainable', function () {
		expect(1);
		strictEqual(this.$el.bruteSelect(), this.$el, 'should be chainable');
	});

	test('can generate appropriate class names', function () {
		expect(3);
		var pluginObject = this.$el.bruteSelect().data($.fn.bruteSelect.options.baseName);
		ok(pluginObject.generateClassName());
		ok(pluginObject.generateClassName('select').match(/select/gi));
		ok(pluginObject.generateClassName('select', true).match(/select/gi));
	});

	test('supports configuring base name', function () {
		expect(1);
		var baseName = 'some-other-select';
		ok(this.$el.bruteSelect({ baseName: baseName }).data(baseName));
	});

	test('does not use custom formatting by default', function () {
		expect(1);
		var title = 'test 123';
		strictEqual($.fn.bruteSelect.formatter(title), title);
	});

	test('can provide wrapper and title elements', function () {
		expect(2);
		var pluginObject = this.$el.bruteSelect().data($.fn.bruteSelect.options.baseName);
		strictEqual(pluginObject.$el.find('select').length, 1);
		strictEqual(pluginObject.$title.closest('.' + pluginObject.$el.attr('class').split(/\s+/)[0]).length, 1);
	});

}(jQuery));
