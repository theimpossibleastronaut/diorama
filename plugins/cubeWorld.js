var cubeWorld = cubeWorld || {

    type: "world",

    construct: function () {

        diorama.destroy();

        diorama.ambientLight = new THREE.AmbientLight( 0xFFFFFF );
        diorama.worldGeometry = new THREE.BoxGeometry( 500, 500, 500, 1, 1, 1 );

        diorama.worldGeometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

        diorama.worldMaterial = new THREE.MeshFaceMaterial( cubeWorld.loadedMaterials );

        diorama.worldMesh = new THREE.Mesh( diorama.worldGeometry, diorama.worldMaterial );

        diorama.scene.add( diorama.ambientLight );
        diorama.scene.add( diorama.cameras.normal );
        diorama.scene.add( diorama.worldMesh );

    }
}