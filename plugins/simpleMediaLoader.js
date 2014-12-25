var simpleMediaLoader = simpleMediaLoader || {

    type: "medialoader",

    construct: function () {

        diorama.__properties.mediaFormat = diorama.__getMediaFormat();

        /*diorama.__createCustomWorld();
        diorama.showLoader();*/

        if ( typeof(virtualmouse) != 'undefined' ) {

            virtualmouse.createInstance();

        }

        if ( diorama.__properties.mediaFormat == 'image' ) {

            if ( diorama.__properties.horizontalDegrees == 360 &&
                 diorama.__properties.verticalDegrees == 180 ) {

                diorama.__properties.useWorldCanvas = false;
                diorama.__properties.useImageHelper = false;


            } else {

                if ( typeof( diorama.imageHelper ) != 'undefined' &&
                     diorama.imageHelper != false &&
                     diorama.imageHelper != '' ) {

                    diorama.__properties.useImageHelper = true;

                } else {

                    diorama.__properties.useWorldCanvas = true;

                }

            }

            var theImage = new Image();

            theImage.onload = function () {

                if ( theImage.Width > 8192 || theImage.height > 4096 ||
                     theImage.width % 2 != 0 || theImage.height % 2 != 0) {

                    //diorama.hideLoader();

                    alert( 'Image texture size invalid. Scaling not implemented.' );
                    return;

                }

                diorama.__properties.mediaItemInstance = null;
                delete diorama.__properties.mediaItemInstance;

                diorama.__properties.mediaItemInstance = this;

                if ( typeof ( diorama.worldTexture ) != 'undefined' &&
                     diorama.worldTexture != null &&
                     diorama.worldTexture !== false ) {

                    diorama.worldTexture.dispose();
                    delete diorama.worldTexture;

                    diorama.worldMaterial.map.dispose();
                    delete diorama.worldMaterial.map;

                }

                diorama.__createCustomWorld();

                diorama.worldTexture = new THREE.Texture( theImage );

                diorama.worldTexture.format = THREE.RGBFormat;
                diorama.worldTexture.anisotropy = diorama.renderer.getMaxAnisotropy();
                diorama.worldTexture.needsUpdate = true;

                diorama.worldMaterial.color.setHex( 0xFFFFFF );
                diorama.worldMaterial.map = diorama.worldTexture;

                diorama.worldMaterial.needsUpdate = true;

                //diorama.hideLoader();

                diorama.cameras.normal.lookAt( diorama.__getPositionAndTargetForLatLon( diorama.__position.lat, diorama.__position.lon ).target );

            }

            if ( diorama.__properties.mediaItem instanceof HTMLCanvasElement ) {

                theImage.src = diorama.__properties.mediaItem.toDataURL();

            } else if ( diorama.__properties.useImageHelper == true ) {

                theImage.src = diorama.imageHelper + '?f=' + diorama.__properties.mediaItem
                                + '&w=' + diorama.__properties.horizontalDegrees
                                + '&h=' + diorama.__properties.verticalDegrees;

            } else {

                theImage.src = diorama.__properties.mediaItem;

            }

        } else {

            diorama.__properties.useWorldCanvas = false;

            var theVideo = document.createElement( 'video' );
            theVideo.loop = true;
            theVideo.preload = 'none';
            theVideo.autoplay = false;

            if ( typeof( theVideo ) != 'undefined' ||
                 !( theVideo.canPlayType( 'video/mp4' ) || theVideo.canPlayType( 'video/webm' ) ) ) {

                if ( typeof(diorama.__properties.forceVideoDownload) != 'undefined' &&
                     diorama.__properties.forceVideoDownload !== false ) {

                    diorama.__properties.mediaItemInstance = theVideo;

                    // todo fix properly, now in init;
                    //diorama.__createCustomWorld();

                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', diorama.__properties.mediaItem, true);
                    xhr.responseType = 'blob';
                    xhr.onload = function () {

                        if (this.status == 200) {

                            diorama.__createCustomWorld();

                            var blobSaget = this.response;
                            var theVideo = diorama.__properties.mediaItemInstance;

                            var dynamicMedia = (window.webkitURL ? window.webkitURL : URL).createObjectURL(blobSaget);

                            var theSource = document.createElement( 'source' );
                            theSource.type = diorama.__getMediaType();

                            theSource.src = dynamicMedia;

                            theVideo.appendChild( theSource );

                            diorama.__properties.mediaItemInstance.load();

                            diorama.__properties.mediaItemInstance.play();

                            diorama.worldTexture = new THREE.Texture( theVideo );
                            diorama.worldTexture.format = THREE.RGBFormat;
                            diorama.worldTexture.anisotropy = 4;
                            diorama.worldTexture.unpackAlignment = 8;
                            diorama.worldTexture.needsUpdate = true;

                            diorama.worldMaterial.color.setHex( 0xFFFFFF );
                            diorama.worldMaterial.map = diorama.worldTexture;
                            diorama.worldMaterial.needsUpdate = true;
                            diorama.worldGeometry.buffersNeedUpdate = true;
                            diorama.worldGeometry.uvsNeedUpdate = true;

                            //diorama.hideLoader();

                        } else {

                            console.warn("Failed to load video");

                        }

                    };

                    xhr.send();

                } else {
                    diorama.__properties.mediaItemInstance = theVideo;
                    diorama.__createCustomWorld();

                    theVideo.oncanplay = function () {

                        diorama.__properties.mediaItemInstance = this;
                        diorama.__properties.mediaItemInstance.play();

                        diorama.worldTexture = new THREE.Texture( theVideo );
                        diorama.worldTexture.format = THREE.RGBFormat;
                        diorama.worldTexture.anisotropy = 4;
                        diorama.worldTexture.unpackAlignment = 8;
                        diorama.worldTexture.needsUpdate = true;

                        diorama.worldMaterial.color.setHex( 0xFFFFFF );
                        diorama.worldMaterial.map = diorama.worldTexture;
                        diorama.worldMaterial.needsUpdate = true;
                        diorama.worldGeometry.buffersNeedUpdate = true;
                        diorama.worldGeometry.uvsNeedUpdate = true;

                        diorama.hideLoader();

                    };

                    var theSource = document.createElement( 'source' );
                    theSource.type = diorama.__getMediaType();

                    theSource.src = diorama.__properties.mediaItem;

                    theVideo.appendChild( theSource );

                    diorama.__properties.mediaItemInstance.load();

                    diorama.__properties.mediaItemInstance.play();

                }

            } else {

                console.warn( 'video not supported' );

            }

        }

    }
}