diorama
=======

First steps into 3d, three.js and virtual reality

## Requirements

 - Local webserver (ex. php -S localhost:7777, apache, nginx)
 - Grunt for packaging

## Directory structure

+- root       [ should contain a minified diorama.js ]
   +- vendor  [ third party libs like THREE.js and OculusBridge ]
   +- dist    [ oculus bridge packaged for supported platforms ]
   +- assets  [ css, images required by base library ]
   +- plugins [ diorama plugins, optionally loaded ]

## Building a distribution

# install grunt
npm install grunt-cli

# install dependencies from package.json
npm install

# build it
grunt

cp -Rf build/* /path/to/project

## Third party

Three.js; http://threejs.org/
oculus-bridge; https://github.com/Instrument/oculus-bridge
Example image from wikimedia; http://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Olso_panorama.jpg/2880px-Olso_panorama.jpg