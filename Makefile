all: js css

clean_css:
	rm -f dist/css/*

clean_js:
	rm -f dist/js/*

clean: clean_css clean_js

js: clean_js
	browserify src/js/panel.js -o dist/js/panel.js
	cp src/js/background.js dist/js/background.js
	cp src/js/content.js dist/js/content.js

css: clean_css
	sass src/sass/base.sass dist/css/base.css

xpi: all
	cd dist; zip -r -FS ../masterkey.xpi *