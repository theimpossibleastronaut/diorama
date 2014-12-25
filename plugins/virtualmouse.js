var virtualmouse = virtualmouse || {

    type: 'implementation',

    sprite: null,
    texture: null,
    material: null,

    lastActive: 0,
    visible: true,

    __lastIntervalId: null,

    construct: function() {

        console.log( 'virtualmouse active' );

        virtualmouse.lastActive = new Date().getTime();

        virtualmouse.texture = THREE.ImageUtils.loadTexture( 'assets/virtualmouse.png' );
        virtualmouse.material = new THREE.SpriteMaterial( { map: virtualmouse.texture, color: 0xffffff, fog: false } );
        virtualmouse.sprite = new THREE.Sprite( virtualmouse.material );

        virtualmouse.sprite.position.set( 0, 0, -50 );
        virtualmouse.sprite.scale.set( 4, 4, 0 );

    },

    destroy: function() {

        virtualmouse.removeListeners();

    },

    createInstance: function() {

        virtualmouse.show();

        virtualmouse.addListeners();

    },

    addListeners: function() {

        document.addEventListener( 'mousemove', virtualmouse.__onMouseMove );

        virtualmouse.__lastIntervalId = setInterval( virtualmouse.__updateCursorState, 250 );

    },

    removeListeners: function() {

        document.removeEventListener( 'mousemove', virtualmouse.__onMouseMove );

        clearInterval( virtualmouse.__lastIntervalId );
        virtualmouse.__lastIntervalId = null;

    },

    hide: function() {

        virtualmouse.visible = false;

        diorama.cameras.normal.remove( virtualmouse.sprite );

    },

    show: function() {

        virtualmouse.visible = true;

        diorama.cameras.normal.add( virtualmouse.sprite );

    },

    __onMouseMove: function( event ) {

        if ( typeof( diorama.__properties.container ) != 'undefined' &&
            diorama.__properties.container != null &&
            diorama.__properties.container != false) {

            var horizontal = ( event.clientX / diorama.__properties.container.offsetWidth ) * 2 - 1;
            var vertical = -( event.clientY / diorama.__properties.container.offsetHeight ) * 2 + 1;

            virtualmouse.sprite.position.set( horizontal / 2 * diorama.cameras.normal.aspect * 100, vertical / 2 * 100, -50 );

            virtualmouse.lastActive = new Date().getTime();

            if ( virtualmouse.visible === false ) {

                virtualmouse.show();

            }

        }

    },

    __updateCursorState: function () {

        if ( new Date().getTime() - virtualmouse.lastActive >= 2500 ) {

            virtualmouse.hide();

        } else if ( virtualmouse.visible === false ) {

            virtualmouse.show();

        }

    }

};