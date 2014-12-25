var smoothMove = smoothMove || {

    type: "implementation",

    options: {
        moveSpeed: 0.2,
        animationSpeed: 10
    },

    construct: function() {

        diorama.__onMouseDown = smoothMove.__onMouseDown;
        diorama.__onMouseMove = smoothMove.__onMouseMove;
        diorama.__onMouseUp = smoothMove.__onMouseUp;
    },

    __onMouseDown: function ( event ) {
        event.preventDefault();

        diorama.__mouse.interactive = true;
        diorama.__mouse.downX = event.clientX;
        diorama.__mouse.downY = event.clientY;
        diorama.__mouse.downLat = diorama.__position.lat;
        diorama.__mouse.downLon = diorama.__position.lon;

        smoothMove.moveStop = false;
        clearInterval(smoothMove.moveTimer);

        smoothMove.moveTo.lon = ( diorama.__mouse.downX - event.clientX ) * smoothMove.options.moveSpeed + diorama.__mouse.downLon;
        smoothMove.moveTo.lat = ( event.clientY - diorama.__mouse.downY ) * smoothMove.options.moveSpeed + diorama.__mouse.downLat;

        var animationSpeed = 100 / smoothMove.options.animationSpeed * (diorama.__properties.targetFrameRate / 50);

        smoothMove.moveTimer = setInterval(function() {
            var speedLon = (diorama.__position.lon - smoothMove.moveTo.lon) / animationSpeed;
            var speedLat = (diorama.__position.lat - smoothMove.moveTo.lat) / animationSpeed;
            
            diorama.__position.lon -= speedLon;
            diorama.__position.lat -= speedLat;

            var targetAndPosition = diorama.__getPositionAndTargetForLatLon(diorama.__position.lat, diorama.__position.lon);
            diorama.cameras.normal.target = targetAndPosition.target;
            diorama.__position = targetAndPosition.position;
            
            diorama.cameras.normal.lookAt( diorama.cameras.normal.target );

            if (smoothMove.moveStop && Math.abs(speedLon) <= 0.01 && Math.abs(speedLat) <= 0.01) {
                clearInterval(smoothMove.moveTimer);
            }
        }, 1000 / diorama.__properties.targetFrameRate);

        document.addEventListener( 'mousemove', diorama.__onMouseMove, true );
    },

    moveTo: { lon:null, lat:null },
    moveTimer: null,
    moveStop: true,

    __onMouseMove: function ( event ) {

        event.preventDefault();

        smoothMove.moveTo.lon = ( diorama.__mouse.downX - event.clientX ) * smoothMove.options.moveSpeed + diorama.__mouse.downLon;
        smoothMove.moveTo.lat = ( event.clientY - diorama.__mouse.downY ) * smoothMove.options.moveSpeed + diorama.__mouse.downLat;

    },

    __onMouseUp: function ( event ) {
        smoothMove.moveStop = true;
        event.preventDefault();
        diorama.__mouse.interactive = false;

        document.removeEventListener( 'mousemove', diorama.__onMouseMove, true );
    },
};