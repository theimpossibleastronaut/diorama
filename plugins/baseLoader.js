var baseLoader = baseLoader || {

    type: "loader",

    construct: function() {

        diorama.__createLoader = baseLoader.__createLoader;

    },

    animate: function() {

        if ( diorama.isLoading() === true ) {

            baseLoader.__rotateLoader();

        }

    },

    __createLoader: function () {

        if ( typeof ( diorama.__properties.loaderObj ) != 'undefined' &&
             diorama.__properties.loaderObj != null &&
             diorama.__properties.loaderObj !== false ) {

            return diorama.__properties.loaderObj;

        }

        var objCollection = {

            geometry: new THREE.PlaneBufferGeometry( 10.2, 3 ),
            material: new THREE.MeshLambertMaterial( {

                color: 0xffffff,
                map: THREE.ImageUtils.loadTexture( diorama.__properties.path + 'assets/loader.jpg' ),
                specular: 0x555555,
                shininess: 0,
                side: THREE.DoubleSide

            } ),

            animationFrame: 0,
            mesh: null,
            animator: baseLoader.animate

        };

        /* r69 deprecated if ( diorama.renderer.initMaterial ) {

            diorama.renderer.initMaterial( objCollection.material, diorama.scene.__lights, diorama.scene.fog );

        }*/

        objCollection.mesh = new THREE.Mesh( objCollection.geometry, objCollection.material );

        diorama.__properties.loaderObj = objCollection;

        return diorama.__properties.loaderObj;

    },

    __rotateLoader: function () {

        /*var loader = diorama.__createLoader();
        loader.animationFrame++;

        var xrad = loader.animationFrame % 360;
        xrad = THREE.Math.degToRad(xrad);

        loader.mesh.rotation.x = xrad;
        loader.mesh.rotation.y = xrad;
        loader.mesh.rotation.z = xrad;*/
    },
}