'use strict';
var diorama = diorama || {

    locale: {},
    plugins: [

        "plugins/simpleMediaLoader.js",
        "plugins/complexMediaLoader.js",

        "plugins/sphericalWorld.js",
        "plugins/cubeWorld.js",

        "plugins/baseLoader.js"

    ],

    /* Observers for implicit invocation */
    observers: {

        start: null,
        play: null,
        pause: null,
        stop: null

    },

    /* Exposed elements from engine */
    dataFolder: '', /* Sub client data folder */
    scene: null,
    renderer: null,
    /*projector: null,*/
    raycaster: null,
    ambientLight: null,
    worldGeometry: null,
    worldTexture: null,
    worldMesh: null,
    worldMaterial: null,
    worldMaterialParameters: {},
    imageHelper: 'assets/imagehelper.php',
    krxmlHelper: 'assets/krxml.php',
    enableHMD: false,
    hmdPlugin: null,
    renderFunction: null,

    cameras: {

        active: null,
        normal: null,
        oculus: null

    },

    helperDownloadPath: 'dist/oculusbridge-win.zip',

    /* Internals */
    __lastAnimationFrameRequestId: 0,
    __cameraDummy: null,

    __mouse: {

        interactive: false,
        downX: 0,
        downY: 0,
        downLat: 0,
        downLon: 0

    },

    __position: {

        lat: 0,
        lon: 0,
        phi: 0,
        theta: 0

    },

    __destroyables: [],

    __properties: {

        initialized: false,
        path: '',
        enableFullscreen: false,
        targetFrameRate: 75,
        dependencyLoadCount: 0,
        mediaItem: null,
        mediaItemInstance: null,
        mediaFormat: null,
        horizontalDegrees: 360,
        verticalDegrees: 180,

        container: null,
        containerTarget: null,
        hmdConnected: false,
        useWorldCanvas: false,
        worldCanvas: null,
        worldCanvasContext: null,
        useImageHelper: false,
        forceVideoDownload: true,

        loaderObj: null,
        loaderInterval: null,
        loaderCount: 0,
        lastTime: 0,
        lookAtCorrection: 0,

        textureSize: {

            width: 4096,
            height: 2048

        },

        scaleProperties: {

            pointX: 0,
            pointY: 0,
            calculatedWidth: 0,
            calculatedHeight: 0

        },

        stylesheet: 'assets/diorama.css',

        /* Loaded in order */
        dependencies: [

            'vendor/three.js'

        ]

    },

    // -- Bootstrap functionality

    init: function ( aMediaItem, aHorizontalDegrees, aVerticalDegrees ) {

        diorama.locale = typeof( dioramaLocale ) != 'undefined' ? dioramaLocale : diorama.__getDefaultLocale();
        diorama.renderFunction = diorama.__renderFunction;

        if ( diorama.__properties.initialized === true ) {

            return;

        }

        for ( var i = 0 ; i < diorama.plugins.length ; i++ ) {

            diorama.__properties.dependencies.push( diorama.plugins[ i ] );

        }

        diorama.__properties.initialized = true;

        diorama.__properties.mediaItem = aMediaItem || null;
        diorama.__properties.horizontalDegrees = aHorizontalDegrees || 360;
        diorama.__properties.verticalDegrees = aVerticalDegrees || 180;

        diorama.__loadStyle( diorama.__properties.stylesheet );

        for ( var i = 0 ; i < diorama.__properties.dependencies.length; i++ ) {

            diorama.__loadDependency( diorama.__properties.dependencies[ i ] );

        }
    },

    // -- End: Bootstrap functionality

    // -- Public framework functionality

    setInitialCameraPosition: function( degreesH, degreesV ) {

        /* These are secretly interexchangable */

        diorama.__position.lat = degreesV;
        diorama.__position.lon = degreesH;

    },

    setCustomPath: function ( aPath/*:String*/  ) {

        diorama.__properties.path = aPath;

    },

    setContainerTarget: function ( aContainer/*:HTMLElement*/ ) {

        diorama.__properties.containerTarget = aContainer;

    },

    setHmdPlugin: function ( aHmdPlugin/*:String*/ ) {

        if ( diorama.__properties.initialized === true ) {

            console.warn( "setHmdPlugin should be called before initializing the Diorama library" );
            return;

        }

        switch ( aHmdPlugin.toLowerCase() ) {

            case "oculusbridge":
                //diorama.enableHMD = true;
                diorama.hmdPlugin = "oculusBridge";

                diorama.__properties.dependencies.push(

                    'plugins/oculusBridge.js',
                    'vendor/OculusBridge.min.js',
                    'vendor/effects/OculusRiftEffect.js'

                );

                break;

            case "webvr":
                diorama.enableHMD = true;
                diorama.hmdPlugin = "webVR";

                diorama.__properties.dependencies.push(

                    'plugins/webVR.js',
                    'vendor/effects/VREffect.js',
                    'vendor/controls/VRControls.js'

                );

                break;

            default:
                console.warn( "Invalid HMD plugin " + aHmdPlugin );

        }

    },

    play: function ( aMediaItem, aHorizontalDegrees, aVerticalDegrees ) {

        diorama.destroy();

        var theMediaItem = aMediaItem || diorama.__properties.mediaItem;

        if ( typeof( theMediaItem ) != 'undefined' &&
             theMediaItem !== false && theMediaItem !== null ) {

            if ( !isNaN( aHorizontalDegrees ) && !isNaN( aVerticalDegrees ) ) {

                diorama.__properties.horizontalDegrees = aHorizontalDegrees || 360;
                diorama.__properties.verticalDegrees = aVerticalDegrees || 180;

            }

            if ( diorama.enableHMD === true &&
                 typeof( diorama.hmdPlugin ) != 'undefined' &&
                 typeof( window[ diorama.hmdPlugin ] ) != 'undefined' ) {

                diorama.using( window[ diorama.hmdPlugin ] );

            }

            /*if ( typeof( diorama.__properties.container ) == 'undefined' ||
                 diorama.__properties.container === false ||
                 diorama.__properties.container == null ) {*/

                diorama.__createWorld();

            //}

            diorama.show();

            diorama.__properties.mediaItem = theMediaItem;
            diorama.__loadMediaItem();

            diorama.__renderLoop();

            diorama.__invokeIfExists( diorama.observers.play );

        }

    },

    pause: function () {

        diorama.__invokeIfExists( diorama.observers.pause );

    },

    stop: function () {

        diorama.__invokeIfExists( diorama.observers.stop );
        diorama.destroy();

    },

    destroy: function () {

        if ( typeof( diorama.worldMesh ) != "undefined" &&
             diorama.worldMesh != null ) {

            cancelAnimationFrame( diorama.__lastAnimationFrameRequestId );

            window.removeEventListener( 'resize', diorama.__onResize, true );
            document.removeEventListener( 'keyup', diorama.__onKeyUp, true );
            document.removeEventListener( 'mousedown', diorama.__onMouseDown, true );
            document.removeEventListener( 'mouseup', diorama.__onMouseUp, true );
            document.removeEventListener( 'mousemove', diorama.__onMouseMove, true );
            document.removeEventListener( 'touchstart', diorama.__mapTouchEvent, true );
            document.removeEventListener( 'touchmove', diorama.__mapTouchEvent, true );
            document.removeEventListener( 'touchend', diorama.__mapTouchEvent, true );
            document.removeEventListener( 'touchcancel', diorama.__mapTouchEvent, true );

            for ( var i = 0 ; i < diorama.__destroyables.length; i++ ) {

                diorama.__destroyables[i].destroy();

            }

            diorama.scene.remove( diorama.worldMesh );

            diorama.worldGeometry.dispose();

            diorama.scene = undefined;
            //diorama.projector = undefined;
            diorama.raycaster = undefined;
            diorama.cameras.normal = undefined;
            diorama.cameras.oculus = undefined;
            diorama.worldMesh = undefined;
            diorama.ambientLight = undefined;
            diorama.worldGeometry = undefined;
            diorama.worldTexture = undefined;
            diorama.worldMaterial = undefined;

            if ( diorama.__properties.worldCanvas ) {

                while (diorama.__properties.worldCanvas.lastChild) {

                    diorama.__properties.worldCanvas.removeChild( diorama.__properties.worldCanvas.lastChild );

                }

            }

            if ( diorama.__properties.container ) {

                while (diorama.__properties.container.lastChild) {

                    diorama.__properties.container.removeChild( diorama.__properties.container.lastChild );

                }

            }

        }

    },

    getActiveCamera: function () {

        return diorama.cameras[ diorama.cameras.active ] || diorama.cameras.normal;

    },

    requestFullscreen: function() {

        var container = diorama.__properties.container;

        if ( typeof( container ) == 'undefined' || container == null ) {

            console.warn( 'Container is undefined, it should exist here' );
            return;

        }

        if( container.requestFullscreen ) {

          container.requestFullscreen();

        } else if( container.mozRequestFullScreen ) {

          container.mozRequestFullScreen();

        } else if( container.webkitRequestFullscreen ) {

          container.webkitRequestFullscreen();

        } else if( container.msRequestFullscreen ) {

          container.msRequestFullscreen();

        }

        setTimeout(diorama.__onResize, 250);

    },

    isVisible: function () {

        if ( typeof( diorama.__properties.container ) != "undefined" ) {

            return ( diorama.__properties.container.style.display == 'block' );

        }

        return false;

    },

    show: function () {

        diorama.__properties.container.style.display = 'block';
        setTimeout(diorama.__onResize, 250);
        //diorama.renderer.domElement.requestPointerLock();

    },

    hide: function () {

        diorama.__properties.container.style.display = 'none';
        //document.exitPointerLock();

    },

    showHelperMessage: function () {

        if ( typeof(diorama.__properties.container) != 'undefined' &&
             !!!document.getElementById( 'diorama-helper-message' ) ) { /* triple ! forces bool */

            var container = diorama.__properties.container;
            var theMessage = document.createElement( 'div' );
            theMessage.id = 'diorama-helper-message';
            theMessage.innerHTML = diorama.locale.hmdIsDisconnected;

            container.appendChild( theMessage );

        }

    },

    hideHelperMessage: function () {

        if ( typeof(diorama.__properties.container) != 'undefined' ) {

            var container = diorama.__properties.container;
            var theMessage = document.getElementById( 'diorama-helper-message' );

            if ( !!document.getElementById( 'diorama-helper-message' ) ) {

                container.removeChild( theMessage );

            }

        }

    },

    showLoader: function () {

        // Normal loader is only for when 3d env is available.
        if ( diorama.__properties.initialized === true ) {

            diorama.__properties.loaderCount++;

            var loader = diorama.__createLoader();

            diorama.cameras.normal.add( loader.mesh );

            loader.mesh.position.set( 0, 0, -18 );

            diorama.__properties.loaderInterval = setInterval( diorama.__properties.loaderObj.animator, parseInt( 1000 / diorama.__properties.targetFrameRate ) );

        }

    },

    hideLoader: function () {

        // Normal loader is only for when 3d env is available.
        if ( diorama.__properties.initialized === true ) {

             diorama.__properties.loaderCount--;

            if ( diorama.__properties.loaderCount < 1 ) {

                diorama.cameras.normal.remove( diorama.__createLoader().mesh );
                diorama.__properties.loaderCount = 0;
                clearInterval( diorama.__properties.loaderInterval );

            }

        }

    },

    isLoading: function () {

        return ( diorama.__properties.initialized !== true || diorama.__properties.loaderCount >= 1 );

    },

    using: function (dioramaobject, pluginOptions) {
        if ( typeof(dioramaobject) != 'undefined' && typeof(dioramaobject.type) != 'undefined' ) {

            if ( typeof(dioramaobject.options) == 'undefined' ) {

                dioramaobject.options = {};

            }

            for ( var attrName in pluginOptions ) {

                dioramaobject.options[ attrName ] = pluginOptions[ attrName ];

            }

            if ( dioramaobject.type == 'world' ) {

                diorama.__createCustomWorld = dioramaobject.construct;

            }
            else if ( dioramaobject.type == 'medialoader' )
            {

                diorama.__loadMediaItem = dioramaobject.construct;

            }
            else if (   dioramaobject.type == 'implementation' ||
                        dioramaobject.type == 'hmd' ||
                        dioramaobject.type == 'loader' )
            {

                dioramaobject.construct();

            }

            if ( typeof( dioramaobject.destroy ) == 'function' && diorama.__destroyables.indexOf( dioramaobject ) == -1 ) {

                diorama.__destroyables.push( dioramaobject );

            }

        }

        return diorama;
    },

    // -- End: Public framework functionality

    __noop: function () {},

    // -- Dependency loading

    __loadStyle: function ( aStylesheet ) {

        var styleElement = document.createElement( 'link' );
        styleElement.rel = 'stylesheet';
        styleElement.type = 'text/css';
        styleElement.href = diorama.__properties.path + aStylesheet;
        styleElement.onload = diorama.__dependencyLoaded;

        document.head.appendChild( styleElement );

    },

    __loadDependency: function ( aDependency ) {

        var scriptElement = document.createElement( 'script' );
        scriptElement.src = diorama.__properties.path + aDependency;
        scriptElement.onload = diorama.__dependencyLoaded;
        scriptElement.async = false;
        scriptElement.defer = false;

        document.head.appendChild( scriptElement );

    },

    __dependencyLoaded: function () {

        diorama.__properties.dependencyLoadCount++;

        if ( diorama.__properties.dependencyLoadCount == diorama.__properties.dependencies.length + 1 ) {

            diorama.__dependenciesMet();

        }

    },

    __dependenciesMet: function () {

        // Invoke some default settings which have been loaded from plugins.
        diorama.renderer = diorama.renderer || (
                            window.WebGLRenderingContext &&
                            (navigator.appName.toLowerCase().indexOf("internet explorer") == -1 && navigator.userAgent.toLowerCase().indexOf("trident") == -1) && /* IE + Three.js + WebGL = error */
                            !!document.createElement('canvas').getContext('experimental-webgl')
                           )
                            ? new THREE.WebGLRenderer() : /*new THREE.CanvasRenderer()*/ null;

        if ( diorama.renderer == null ) {

            console.warn( 'WebGL renderer deprecated' );
            return;

        }

        diorama.renderer.setPixelRatio( window.devicePixelRatio );

        diorama.using(sphericalWorld);
        diorama.using(simpleMediaLoader);

        diorama.__start();

    },

    // -- End: Dependency loading

    // -- Invocables

    __invokeIfExists: function ( aInvokable ) {

        if ( typeof( aInvokable ) == 'function' ) {

            aInvokable();

        }

    },

    // -- End: Invocables

    // -- Private framework implementation

    __start: function () {

        diorama.__invokeIfExists( diorama.observers.start );

        // Create container to enable fullscreenrequest everywhere.
        diorama.__getContainer();

        //diorama.play();

    },

    __createWorld: function () {

        diorama.__invalidateLayout();

        var createdCanvas = false;
        var container = diorama.__getContainer();

        if ( diorama.__properties.useWorldCanvas === true &&
             ( typeof( diorama.__properties.worldCanvas ) == "undefined" || diorama.__properties.worldCanvas == null ) ) {

            var worldCanvas = document.createElement( 'canvas' );
            worldCanvas.id = 'diorama-worldCanvas';
            worldCanvas.width = diorama.__properties.textureSize.width;
            worldCanvas.height = diorama.__properties.textureSize.height;
            worldCanvas.style.display = 'none';

            diorama.__properties.worldCanvas = worldCanvas;
            diorama.__properties.worldCanvasContext = diorama.__properties.worldCanvas.getContext( '2d' );

            createdCanvas = true;

        }

        if ( createdCanvas === true ) {

            diorama.__properties.containerTarget.appendChild( diorama.__properties.worldCanvas );

        }

        diorama.scene = new THREE.Scene();
        //diorama.projector = new THREE.Projector();
        diorama.raycaster = new THREE.Raycaster();
        diorama.__cameraDummy = new THREE.Object3D();
        // Moet dit niet innerwidth/innerheight zijn als 2e property ?
        diorama.cameras.normal = new THREE.PerspectiveCamera( 90, diorama.__properties.container.innerWidth, diorama.__properties.container.innerHeight );

        diorama.cameras.normal.position.copy( new THREE.Vector3( 0, 0, 0 ) );
        diorama.cameras.normal.target = new THREE.Vector3( 0, 0, 0 );

        diorama.scene.add( diorama.__cameraDummy );

        if (diorama.cameras.active == 'webvr') {

            webVR.activate();

        }

        diorama.renderer.setSize( diorama.__properties.container.offsetWidth, diorama.__properties.container.offsetHeight );
        diorama.renderer.autoClear = false;

        //diorama.cameras.normal.rotation.order = 'YXZ';

        diorama.__properties.container.appendChild( diorama.renderer.domElement );

        window.addEventListener( 'resize', diorama.__onResize, true );
        document.addEventListener( 'keyup', diorama.__onKeyUp, true );
        document.addEventListener( 'mousedown', diorama.__onMouseDown, true );
        document.addEventListener( 'mouseup', diorama.__onMouseUp, true );
        document.addEventListener( 'touchstart', diorama.__mapTouchEvent, true );
        document.addEventListener( 'touchmove', diorama.__mapTouchEvent, true );
        document.addEventListener( 'touchend', diorama.__mapTouchEvent, true );
        document.addEventListener( 'touchcancel', diorama.__mapTouchEvent, true );

        diorama.__onResize();

    },

    __getContainer: function () {

        var createdContainer = false;

        if ( typeof( diorama.__properties.containerTarget ) == 'undefined' ||
             diorama.__properties.containerTarget === false ||
             diorama.__properties.containerTarget == null ) {

            diorama.__properties.containerTarget = document.body;

        }

        if ( typeof( diorama.__properties.container ) == "undefined" || diorama.__properties.container == null ) {

            var container = document.createElement( 'div' );
            container.id = 'diorama-container';

            createdContainer = true;

        } else {

            container = diorama.__properties.container;

        }

        if (diorama.cameras.active == 'webvr') {

            container.className = 'dk2';

        } else {

            if ( diorama.__properties.hmdConnected === true ) {

                container.className = 'dk1'; // todo: detect version and apply size

            } else {

                container.className = 'nohmd';

            }

        }

        if ( createdContainer === true ) {

            diorama.__properties.container = container;
            diorama.hide();
            diorama.__properties.containerTarget.appendChild( diorama.__properties.container );

        }

        return container;

    },

    __renderFunction: function () {

        diorama.renderer.render( diorama.scene, diorama.cameras.normal );

    },

    __renderLoop: function () {

        diorama.__lastAnimationFrameRequestId = requestAnimationFrame( diorama.__renderLoop );

        if ( diorama.__properties.container.style.display == 'none' ) {

            return;

        }

        if ( diorama.__properties.mediaFormat == 'video' &&
             diorama.worldTexture ) {

            diorama.worldTexture.needsUpdate = true;

        }

        // -- rendering bit
        diorama.renderFunction();

    },

    __invalidateLayout: function () {

        var scaleWidthDegrees = diorama.__properties.horizontalDegrees / 360;
        var scaleHeightDegrees = diorama.__properties.verticalDegrees / 180;
        diorama.__properties.scaleProperties.calculatedWidth = diorama.__properties.textureSize.width * scaleWidthDegrees;
        diorama.__properties.scaleProperties.calculatedHeight = diorama.__properties.textureSize.height * scaleHeightDegrees;
        diorama.__properties.scaleProperties.pointX = (diorama.__properties.textureSize.width - diorama.__properties.scaleProperties.calculatedWidth) / 2;
        diorama.__properties.scaleProperties.pointY = (diorama.__properties.textureSize.height - diorama.__properties.scaleProperties.calculatedHeight) / 2;

    },

    __invalidateCanvas: function () {

        diorama.__properties.worldCanvasContext.fillStyle = '#000000';
        diorama.__properties.worldCanvasContext.fillRect( 0, 0, diorama.__properties.textureSize.width, diorama.__properties.textureSize.height );

        if ( diorama.worldTexture ) {

            diorama.worldTexture.needsUpdate = true;

        }


        if ( typeof(diorama.__properties.mediaItemInstance) != 'undefined' &&
             diorama.__properties.mediaItemInstance != null ) {

            diorama.__properties.worldCanvasContext.drawImage(

                diorama.__properties.mediaItemInstance,
                diorama.__properties.scaleProperties.pointX,
                diorama.__properties.scaleProperties.pointY,
                Math.floor( diorama.__properties.scaleProperties.calculatedWidth ),
                Math.floor( diorama.__properties.scaleProperties.calculatedHeight )

            );

        }

    },

    __getMediaFormat: function () {

        if ( diorama.__properties.mediaItem instanceof HTMLCanvasElement ) {

            return 'image';

        }

        var file = diorama.__properties.mediaItem.toLowerCase();
        var ext = file.split(".").pop();

        if ( ext == 'mp4' || ext == 'ogv' || ext == 'webm' ) {

            return 'video';

        }

        return 'image';

    },

    __getMediaType: function () {

        if ( diorama.__getMediaFormat() == 'video' ) {

            var file = diorama.__properties.mediaItem.toLowerCase();
            var ext = file.split(".").pop();

            if ( ext == 'webm' ) {

                return 'video/webm';

            }


            return 'video/mp4';

        }

        return 'image/jpeg';
    },

    __onResize: function () {

        if ( typeof( diorama.cameras.normal ) == "undefined" || diorama.cameras.normal == null ) {

            return;

        }

        diorama.cameras.normal.aspect = diorama.__properties.container.offsetWidth / diorama.__properties.container.offsetHeight;
        diorama.cameras.normal.updateProjectionMatrix();

        if ( diorama.enableHMD === true && typeof(diorama.cameras.oculus) != "undefined" && diorama.cameras.oculus != null ) {

            diorama.cameras.oculus.setSize( diorama.__properties.container.offsetWidth, diorama.__properties.container.offsetHeight );

        }

        diorama.renderer.setSize( diorama.__properties.container.offsetWidth, diorama.__properties.container.offsetHeight );

        diorama.__invalidateLayout();

    },

    __onKeyUp: function ( event ) {

        if ( event.keyCode == 27 &&
            typeof( diorama.__properties.container ) != "undefined" &&
            diorama.__properties.container != null &&
            diorama.__properties.container.style.display != "none" ) {

            diorama.hide();
            diorama.destroy();

        }

    },

    __onMouseDown: function ( event ) {

        event.preventDefault();

        diorama.__mouse.interactive = true;
        diorama.__mouse.downX = event.clientX;
        diorama.__mouse.downY = event.clientY;
        diorama.__mouse.downLat = diorama.__position.lat;
        diorama.__mouse.downLon = diorama.__position.lon;

        document.addEventListener( 'mousemove', diorama.__onMouseMove, true );

    },

    __onMouseMove: function ( event ) {

        event.preventDefault();

        var targetAndPosition = diorama.__getPositionAndTargetForLatLon( ( event.clientY - diorama.__mouse.downY ) * 0.1 + diorama.__mouse.downLat, ( diorama.__mouse.downX - event.clientX ) * 0.1 + diorama.__mouse.downLon );
        diorama.cameras.normal.target = targetAndPosition.target;
        diorama.__position = targetAndPosition.position;

        diorama.cameras.normal.lookAt( diorama.cameras.normal.target );

    },

    __onMouseUp: function ( event ) {

        event.preventDefault();
        document.removeEventListener( 'mousemove', diorama.__onMouseMove, true );

    },

    __getPositionAndTargetForLatLon: function( lat, lon ) {

        var position = {};
        position.lon = lon;
        position.lat = Math.max( -90, Math.min( 90, lat ) );
        position.phi = THREE.Math.degToRad( 90 - position.lat );
        position.theta = THREE.Math.degToRad( position.lon );

        var target = {};
        target.x = 500 * Math.sin( position.phi ) * Math.cos( position.theta );
        target.y = 500 * Math.cos( position.phi );
        target.z = 500 * Math.sin( position.phi ) * Math.sin( position.theta );

        return {target: target, position: position};

    },

    __mapTouchEvent: function ( event ) {

        var touches = event.changedTouches;
        var first = touches[0];
        var type = '';

        switch( event.type )
        {
            case 'touchstart':
                type = 'mousedown';
                break;

            case 'touchmove':
                type = 'mousemove';
                break;

            case 'touchend':
                type = 'mouseup';
                break;

            default:
                return;
        }

        var simulatedEvent = document.createEvent( 'MouseEvent' );
        simulatedEvent.initMouseEvent(

            type,
            true,
            true,
            window,
            1,
            first.screenX, first.screenY,
            first.clientX, first.clientY,
            false,
            false,
            false,
            false,
            0,
            null

        );

        if ( type = 'mousemove' ) {

            // WTG: Moet uit, anders kan je geen html elementen meer aanklikken
            //event.preventDefault();

        }

        if ( document.dispatchEvent ) {

            document.dispatchEvent( simulatedEvent );

        } else if ( document.fireEvent ) {

            document.fireEvent( 'on' + type, simulatedEvent );

        }

    },

    // -- End: Private framework implementation


    __getDefaultLocale: function () {

        var locale = {

            language: 'en_EN',
            hmdIsDisconnected: 'There was no connection to the HMD, is the helper application running? If this is your first time, <a href=\'' + diorama.helperDownloadPath + '\'>download it here</a>.',

        }

        return locale;

    },

    __createLoader: function () {

        if ( typeof( baseLoader ) != 'undefined' ) {

            diorama.using( baseLoader );
            return baseLoader.__createLoader();

        }

    },

    __createCustomWorld: function() {

        console.warn( "No world has been initiated." );

    },

    // http://stackoverflow.com/questions/14167962/how-to-derive-standard-rotations-from-three-js-when-using-quaternions
    quatToEuler: function (q1) {
        var pitchYawRoll = new THREE.Vector3();
        var sqw = q1.w*q1.w;
        var sqx = q1.x*q1.x;
        var sqy = q1.y*q1.y;
        var sqz = q1.z*q1.z;
        var unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
        var test = q1.x*q1.y + q1.z*q1.w;
        var heading,attitude,bank;
        if (test > 0.499*unit) { // singularity at north pole
            heading = 2 * Math.atan2(q1.x,q1.w);
            attitude = Math.PI/2;
            bank = 0;
            return;
        }
        if (test < -0.499*unit) { // singularity at south pole
            heading = -2 * Math.atan2(q1.x,q1.w);
            attitude = -Math.PI/2;
            bank = 0;
            return;
        }
        else {
            heading = Math.atan2(2*q1.y*q1.w-2*q1.x*q1.z , sqx - sqy - sqz + sqw);
            attitude = Math.asin(2*test/unit);
            bank = Math.atan2(2*q1.x*q1.w-2*q1.y*q1.z , -sqx + sqy - sqz + sqw)
        }
        pitchYawRoll.z = Math.floor(attitude * 1000) / 1000;
        pitchYawRoll.y = Math.floor(heading * 1000) / 1000;
        pitchYawRoll.x = Math.floor(bank * 1000) / 1000;

        return pitchYawRoll;
    },

    eulerToAngle: function (rot) {
        var ca = 0;
        if (rot > 0)
            { ca = (Math.PI*2) - rot; }
        else
            { ca = -rot }

        return (ca / ((Math.PI*2)/360));  // camera angle radians converted to degrees
    }
};