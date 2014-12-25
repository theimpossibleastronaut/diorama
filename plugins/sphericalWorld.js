var sphericalWorld = sphericalWorld ||  {

    type: "world",

    construct: function() {

        diorama.ambientLight = new THREE.AmbientLight( 0xFFFFFF );
        diorama.worldGeometry = new THREE.SphereGeometry( 500, 50, 50 );

        diorama.worldGeometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
        diorama.worldTexture = null;

        diorama.worldMaterialParameters = {

            color: 0x0000,
            specular: 0x555555,
            shininess: 0

        };

        diorama.worldMaterial = new THREE.MeshBasicMaterial( diorama.worldMaterialParameters );
        diorama.worldMaterial.fog = false;

        /* r69 deprecated if ( diorama.renderer.initMaterial ) {

            diorama.renderer.initMaterial( diorama.worldMaterial, diorama.scene.__lights, diorama.scene.fog );

        }*/

        diorama.worldMesh = new THREE.Mesh( diorama.worldGeometry, diorama.worldMaterial );

        diorama.scene.add( diorama.ambientLight );
        diorama.scene.add( diorama.cameras.normal );
        diorama.scene.add( diorama.worldMesh );
    }
};