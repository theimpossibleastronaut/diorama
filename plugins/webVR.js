var webVR = webVR || {

    type: "hmd",
    vrEffect: null,

    construct: function () {

        diorama.cameras.active = 'webvr';

    },

    activate: function () {

        webVR.vrEffect = new THREE.VREffect( diorama.renderer, webVR.effectLoaded );
        webVR.vrControls = new THREE.VRControls( diorama.cameras.normal );

        diorama.renderFunction = webVR.renderFunction;


        $(document).keypress(function(e) {
            if(e.which == 220) {
                webVR.vrEffect.setFullScreen(true);
            }
        });

    },

    effectLoaded: function ( error ) {

        if (error) {

            diorama.renderFunction = diorama.__renderFunction;

        }

    },

    renderFunction: function () {

        webVR.vrControls.update();
        webVR.vrEffect.render( diorama.scene, diorama.cameras.normal );

    }

};