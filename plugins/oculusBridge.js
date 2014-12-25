var oculusBridge = oculusBridge || {

    type: "hmd",
    __instance: null,

    construct: function () {

        oculusBridge.__instance = new OculusBridge( {

            "debug" : false,

            "onOrientationUpdate": oculusBridge.__bridgeOrientationUpdated,
            "onConfigUpdate": oculusBridge.__bridgeConfigUpdated,
            "onConnect": oculusBridge.__bridgeConnected,
            "onDisconnect": oculusBridge.__bridgeDisconnected

        } );

        oculusBridge.__instance.connect();

    },

    __bridgeConnected: function (){

        diorama.__properties.hmdConnected = true;
        diorama.hideHelperMessage();

        // TODO destroy old
        diorama.cameras.oculus = new THREE.OculusRiftEffect( diorama.renderer );
        diorama.cameras.active = 'rift';
        diorama.cameras.oculus.target = new THREE.Vector3( 0, 0, 0 );
        diorama.cameras.oculus.setSize( diorama.__properties.container.offsetWidth, diorama.__properties.container.offsetHeight );
        diorama.renderFunction = oculusBridge.renderFunction;

    },

    __bridgeDisconnected: function (){

        diorama.__properties.hmdConnected = false;
        diorama.showHelperMessage();

        diorama.cameras.active = 'normal';
        diorama.renderFunction = diorama.__renderFunction;

    },

    __bridgeConfigUpdated: function (config){

      diorama.cameras.oculus.setHMD( config );

    },

    __bridgeOrientationUpdated: function ( quatValues ) {

      var quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w);

      diorama.cameras.normal.quaternion.copy(quatCam);

    },

    renderFunction: function() {

        diorama.cameras.oculus.render( diorama.scene, diorama.cameras.normal );

    }


};