var complexMediaLoader = complexMediaLoader || {

    type: "medialoader",
    hotspotList: [],

    construct: function () {

        diorama.__properties.mediaFormat = "complex";

        diorama.showLoader();

        diorama.__properties.mediaItemInstance = null;
        delete diorama.__properties.mediaItemInstance;

        var loadables = diorama.__properties.mediaItem.split( "," );

        if ( loadables.length > 0 ) {

            complexMediaLoader.load( loadables[0] );

        }
    },

    destroy: function() {

        diorama.__properties.mediaItemInstance = null;
        delete diorama.__properties.mediaItemInstance;

        complexMediaLoader.hotspotList = [];

        if ( typeof( cubeWorld ) != 'undefined' ) {

            cubeWorld.loadedMaterials = [ ];

        }

    },

    load: function(aLoadable) {

        if (aLoadable.slice(-3).toLowerCase() == "xml") {

            $.getJSON(diorama.krxmlHelper + "?d=" + diorama.dataFolder + "&f=" + aLoadable, complexMediaLoader.onFileComplete);

        } else if (aLoadable.slice(-4).toLowerCase() == "json") {

            $.getJSON(aLoadable, complexMediaLoader.onFileComplete);

        }

    },

    onFileComplete: function(data) {

        if (typeof(data) != 'undefined') {

            /*if (typeof(data.fov) != 'undefined') {

                diorama.cameras.normal.fov = data.fov;
                diorama.cameras.normal.updateProjectionMatrix();

            }*/

            diorama.__properties.lookAtCorrection = 0;

            if (typeof(data.imageType) != 'undefined' && data.imageType == 'cube') {

                if (typeof(data.materials) != 'undefined') {

                    cubeWorld.loadedMaterials = [ ];

                    var materialList = [

                        data.materials.right,
                        data.materials.left,
                        data.materials.up,
                        data.materials.down,
                        data.materials.front,
                        data.materials.back

                    ];

                    for (var i=0; i < 6; i++) {
                        var img = new Image();
                        var tex = new THREE.Texture(img);
                        tex.anisotropy = diorama.renderer.getMaxAnisotropy();
                        tex.wrapS = THREE.RepeatWrapping;
                        img.tex = tex;

                        img.onload = function() {

                          this.tex.needsUpdate = true;

                        };

                        img.src = materialList[i];

                        var mat = new THREE.MeshBasicMaterial({color: 0xffffff, map: tex, specular: 0x555555, shininess: 0});
                        cubeWorld.loadedMaterials.push(mat);

                    }

                }

                if ( typeof(data.hotspots) != 'undefined' &&
                     typeof(interactiveObjects) != 'undefined' ) {

                    for ( var i = 0; i < data.hotspots.length; i++ ) {

                        var hotspot = data.hotspots[i];
                        console.log("Created hotspot ",hotspot.id,hotspot.horizontalAngle, hotspot.verticalAngle);
                        interactiveObjects.create( hotspot.horizontalAngle, hotspot.verticalAngle, hotspot.id, complexMediaLoader.ioHandlers );
                        complexMediaLoader.hotspotList.push(hotspot);

                    }

                }

                if ( typeof(virtualmouse) != 'undefined' ) {

                    virtualmouse.createInstance();

                }

                diorama.using(cubeWorld);

            } else {

                if ( typeof(virtualmouse) != 'undefined' ) {

                    virtualmouse.createInstance();

                }

                diorama.using(sphericalWorld);

            }

            diorama.setInitialCameraPosition( 0, 0 );
            diorama.cameras.normal.lookAt( diorama.__getPositionAndTargetForLatLon( diorama.__position.lat, diorama.__position.lon ).target );

        } else {

            console.warn( 'Data is undefined' );

        }

        diorama.__createCustomWorld();

        diorama.hideLoader();

    },

    hotspotById: function ( aId ) {

        for ( var i = 0 ;  i < complexMediaLoader.hotspotList.length; i++ ) {

            if ( complexMediaLoader.hotspotList[ i ].id == aId ) {

                return complexMediaLoader.hotspotList[ i ];

            }

        }

        return false;

    }

}

complexMediaLoader.ioHandlers = {
        /*factory: wimplementation.hotspotFactory,*/
        /*mouseEnter: wimplementation.hotspotMouseEnter,*/
        /*mouseExit: wimplementation.hotspotMouseExit,*/

        activated: function ( iObject ) {

            var hsdata = complexMediaLoader.hotspotById( iObject.id );
            if ( hsdata.callback == "loadComplexMedia" ) {

                diorama.using( complexMediaLoader ).play( hsdata.filename, 360, 180 );

            }

        }

};