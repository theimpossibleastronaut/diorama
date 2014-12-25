/*
    Plugin to set a start view, which loads a view material and then centers a hotspot on it to continue to something else.
    var pluginOptions = {
        mediaItem: hoofdfoto,
        streetView: false,
        streetViewItem: optional address string
        hdeg: horizontal width in degrees,
        vdeg: vertical height in degrees,
        nextItem: {
            xmllist: optional (pano is required then),
            pano: optional (xmllist is required then),
            hdeg: horizontal width in degrees,
            vdeg: vertical height in degrees
        }
    }
 */
var startview = startview || {

    type: "implementation",
    options: {

        mediaItem: null,
        nextItem: null

    },

    geocoder: new google.maps.Geocoder(),
    panoloader: new GSVPANO.PanoLoader( { zoom: 3 } ),

    // Assume that options have been set when called with diorama.using(startview, { mediaItem: mediaitem })
    construct: function () {

        if ( typeof( GSVPANO ) == 'undefined' && startview.options.streetView === true ) {

            startview.options.streetView = false;
            console.warn( 'Streetview is desired, but GSVPano library isn\'t loaded' );

        }

        if ( startview.options.streetView === true ) {

            startview.panoloader.onError = function( message ) {

                console.warn( 'Pano error; ' + message );

            }

            startview.panoloader.onPanoramaLoad = function () {

                var possibleFrontDoorHorizontalRotation = -90 + startview.panoloader.centerHeading;
                diorama.setInitialCameraPosition( possibleFrontDoorHorizontalRotation, 0 );

                var canvasInside = document.createElement( 'canvas' );
                canvasInside.width = startview.panoloader.canvas.width;
                canvasInside.height = startview.panoloader.canvas.height;
                canvasInsideContext = canvasInside.getContext( '2d' );
                canvasInsideContext.translate( startview.panoloader.canvas.width, 0 );
                canvasInsideContext.scale( -1, 1 );
                canvasInsideContext.drawImage( startview.panoloader.canvas, 0, 0 );

                diorama.using( sphericalWorld ).play( canvasInside, startview.options.hdeg, startview.options.vdeg );

                startview.createContinueHotspot( possibleFrontDoorHorizontalRotation );
                diorama.__properties.lookAtCorrection = -210;

            }

            startview.geocoder.geocode( { address: startview.options.streetViewItem }, function ( results, status ) {

                if ( status == google.maps.GeocoderStatus.OK ) {

                    var position = results[0].geometry.location;
                    startview.panoloader.load( position, function(status) {

                        if ( status == google.maps.StreetViewStatus.OK ) {

                            startview.panoloader.composePanorama( startview.panoloader.id );

                        } else {

                            console.warn( "Falling back to mediaItem because lookup failed for: " + startview.options.streetViewItem );

                            startview.noStreetview();

                        }

                    } );

                } else {

                    console.warn( "Falling back to mediaItem because geocoding failed for address: " + startview.options.streetViewItem );

                    startview.noStreetview();

                }

            } );

        } else {

            startview.noStreetview();

        }

    },

    destroy: function () {

    },

    createContinueHotspot: function( idealHorizontalCenter ) {

        if ( typeof( idealHorizontalCenter ) == "undefined" ) {

            idealHorizontalCenter = 180;

        }

        if ( typeof( interactiveObjects ) != "undefined" && typeof( startview.options.nextItem ) != "undefined" ) {

            interactiveObjects.create( idealHorizontalCenter, 0, "continueTour", {

                activated: function ( iObject ) {

                    if ( typeof( startview.options.nextItem.xmllist ) != "undefined" ) {

                        diorama.using( complexMediaLoader ).play( startview.options.nextItem.xmllist, startview.options.nextItem.hdeg, startview.options.nextItem.vdeg );

                    } else if ( typeof( startview.options.nextItem.pano ) != "undefined" ) {

                        diorama.using( sphericalWorld ).play( startview.options.nextItem.pano, startview.options.nextItem.hdeg, startview.options.nextItem.vdeg );

                    }

                },

                stateChanged: function ( iObject, newState, oldState ) {

                    console.log( "State change from " + oldState + " to " + newState );

                }

            } );

        }

    },

    noStreetview: function () {

        if ( typeof( startview.options.mediaItem ) != 'undefined' ) {

            diorama.setInitialCameraPosition( 180, 0 );

            diorama.using( sphericalWorld ).using( simpleMediaLoader ).play( startview.options.mediaItem, startview.options.hdeg, startview.options.vdeg );

            startview.createContinueHotspot();

        }

    }

}