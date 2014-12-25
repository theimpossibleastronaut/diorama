/*
Get height in relation to camera;
http://stackoverflow.com/questions/15331358/three-js-get-object-size-with-respect-to-camera-and-object-position-on-screen
 */
var interactiveObjects = interactiveObjects || {

    STATE_IDLE: 0,
    STATE_TRIGGERED: 1,
    STATE_PREACTIVATED: 2,
    STATE_ACTIVATED: 3,

    type: "implementation",

    __objectList: [],
    __meshList: [],
    __pivotObj: null,
    __map: null,
    __mat: null,
    __lastIntervalId: null,
    __enableLookAtInteractiveObject: true,

    construct: function () {

        interactiveObjects.__pivotObj = new THREE.Object3D();

        interactiveObjects.__mat = new THREE.ImageUtils.loadTexture( "assets/iobject.png" );
        interactiveObjects.__map = new THREE.SpriteMaterial( { map: interactiveObjects.__mat, color: 0xffffff, fog: false } );

    },

    destroy: function () {

        for ( var i = 0; i < interactiveObjects.__meshList; i++ ) {

            delete interactiveObjects.__meshList[ i ];

        }

        interactiveObjects.__objectList = [];
        interactiveObjects.__meshList = [];
        interactiveObjects.__pivotObj = null;

        interactiveObjects.__destroyListeners();

        clearInterval( interactiveObjects.__lastIntervalId );
        interactiveObjects.__lastIntervalId = null;

        // ready new instance
        interactiveObjects.construct();

    },

    create: function ( angleH, angleV, id, handlers, factoryOptions ) {

        var iObject = {

            angleH: 0,
            angleV: 0,

            id: null,

            mouseEnter: diorama.__noop,
            mouseExit: diorama.__noop,
            activated: diorama.__noop,
            stateChanged: interactiveObjects.__stateChanged,

            object: null,
            state: interactiveObjects.STATE_IDLE,
            lastHitTime: 0

        };

        if ( !isNaN( angleH ) ) { iObject.angleH = angleH; }
        if ( !isNaN( angleV ) ) { iObject.angleV = angleV; }

        if ( typeof( id ) != "undefined" && id != null && id != "" ) { iObject.id = id; } else { iObject.id = interactiveObjects.__objectList.length + 1; }

        if ( typeof( handlers ) == "object" && typeof( handlers.mouseEnter ) == "function" ) { iObject.mouseEnter = handlers.mouseEnter; }
        if ( typeof( handlers ) == "object" && typeof( handlers.mouseExit ) == "function" ) { iObject.mouseExit = handlers.mouseExit; }
        if ( typeof( handlers ) == "object" && typeof( handlers.activated ) == "function" ) { iObject.activated = handlers.activated; }
        if ( typeof( handlers ) == "object" && typeof( handlers.stateChanged ) == "function" ) { iObject.stateChanged = handlers.stateChanged; }

        var factory = interactiveObjects.__factory;

        if ( typeof( handlers ) == "object" && typeof( handlers.factory ) == "function" ) { factory = handlers.factory; }

        iObject.object = factory( iObject, factoryOptions );

        interactiveObjects.__objectList.push( iObject );
        interactiveObjects.__meshList.push( iObject.object.sprite );

        //iObject.object.mesh.position.set( 250, 0, 0 );
        iObject.object.sprite.position.set( 240, 0, 0 );
        iObject.object.sprite.scale.set( 25, 25, 1 );

        var pivotIObject = new THREE.Object3D();
        pivotIObject.add( iObject.object.sprite );

        pivotIObject.rotateY(angleH * ( Math.PI / 180 ));
        pivotIObject.rotateZ(angleV * ( Math.PI / 180 ));

        interactiveObjects.__pivotObj.add( pivotIObject );

        if ( interactiveObjects.__objectList.length == 1 ) {

            interactiveObjects.__setupListeners();

            interactiveObjects.__pivotObj.position = diorama.cameras.normal.position;
            diorama.scene.add( interactiveObjects.__pivotObj );

            if ( interactiveObjects.__enableLookAtInteractiveObject === true ) {

                interactiveObjects.__lastIntervalId = setInterval( interactiveObjects.__updateObjectState, 100 );

            }

        }

    },

    iObjectFromMesh: function ( aMesh ) {

        for ( var i = 0 ; i < interactiveObjects.__meshList.length; i++ ) {

            if ( interactiveObjects.__meshList[ i ] == aMesh ) {

                return interactiveObjects.__objectList[ i ];

            }

        }

    },

    __factory: function ( iObject, options ) {

        return {

            sprite: new THREE.Sprite( interactiveObjects.__map ),
            material: interactiveObjects.__mat

        };

    },

    __setupListeners: function () {

        document.addEventListener( 'mousemove', interactiveObjects.__onMouseMove );
        document.addEventListener( 'mouseup', interactiveObjects.__onMouseUp );

    },

    __destroyListeners: function () {

        document.removeEventListener( 'mousemove', interactiveObjects.__onMouseMove );
        document.removeEventListener( 'mouseup', interactiveObjects.__onMouseUp );

    },

    __onMouseMove: function ( e ) {

    },

    __onMouseUp: function ( e ) {

        var horizontal = ( e.clientX / diorama.__properties.container.offsetWidth ) * 2 - 1;
        var vertical = -( e.clientY / diorama.__properties.container.offsetHeight ) * 2 + 1;

        var mouse3D = new THREE.Vector3( horizontal, vertical, 1 ).unproject( diorama.cameras.normal );
        diorama.raycaster.set( diorama.cameras.normal.position, mouse3D.sub( diorama.cameras.normal.position ).normalize() );

        var intersects = diorama.raycaster.intersectObjects( interactiveObjects.__meshList );

        if ( intersects.length > 0 ) {

            for ( var i = 0 ; i < intersects.length; i++ ) {

                var iObject = interactiveObjects.iObjectFromMesh( intersects[ i ].object );
                iObject.state = interactiveObjects.STATE_ACTIVATED;


                if ( typeof( iObject.activated ) == "function" ) {

                    iObject.activated(iObject);

                }

            }

        }

    },

    __updateObjectState: function () {

        if ( diorama.isVisible() == true ) {

            var euler = diorama.quatToEuler(diorama.cameras.normal.quaternion);
            var angleH = diorama.eulerToAngle(euler.y);
            var angleV = diorama.eulerToAngle(euler.x);

            // Correct V angle
            if ( angleV >= 180 ) {

                angleV = (360 - angleV);

            } else {

                angleV = -angleV;
            }

            var now = new Date().getTime();
//console.log(angleH,angleV);
            for ( var i = 0 ; i < interactiveObjects.__objectList.length ; i++ ) {

                var iObject = interactiveObjects.__objectList[i];

                var xs = Math.abs(iObject.angleH) - (angleH-75+diorama.__properties.lookAtCorrection);
                var ys = iObject.angleV - angleV;
console.log(angleH,angleV,iObject.angleH,iObject.angleV,xs,ys);
                var lastState = iObject.state;

                if ( Math.abs( xs ) < 15 && Math.abs( ys ) < 10 ) {

                    if ( iObject.state == interactiveObjects.STATE_IDLE && iObject.lastHitTime < 1 ) {

                        iObject.state = interactiveObjects.STATE_TRIGGERED;
                        iObject.lastHitTime = new Date().getTime();

                    }

                    if ( iObject.state == interactiveObjects.STATE_TRIGGERED && now - iObject.lastHitTime >= 2000 ) {

                        iObject.state = interactiveObjects.STATE_PREACTIVATED;

                    }

                    if ( iObject.state == interactiveObjects.STATE_PREACTIVATED && now - iObject.lastHitTime >= 6000 ) {

                        iObject.state = interactiveObjects.STATE_ACTIVATED;

                        if ( typeof( iObject.activated ) == "function" ) {

                            iObject.activated( iObject );

                        }

                    }

                } else {

                    iObject.state = interactiveObjects.STATE_IDLE;
                    iObject.lastHitTime = 0;

                }

                if ( lastState != iObject.state ) {

                    console.log( iObject.id + " toggled state " + iObject.state );
                    iObject.stateChanged( iObject, iObject.state, lastState );

                }

            }

        }
    },

    __stateChanged: function ( iObject, newState, oldState ) {

        if ( newState >= 1) {
            iObject.object.sprite.scale.set( 37, 37, 1 );
        } else {
            iObject.object.sprite.scale.set( 25, 25, 1 );
        }

    }


}