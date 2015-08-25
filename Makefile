build:
	cd data; python data2json.py
	mv data/*.json app/data/

build-static:
	cd data; python data2svg.py
	cd static; bash generate_png.sh

install:
	cd app; npm install

run:
	cd app; gulp

deploy:
	cd app; gulp deploy
