/**
 * @author alteredq / http://alteredqualia.com/
 */




module.exports = function(THREE, EffectComposer) {
  
    function TexturePass( map, opacity ) {
        if (!(this instanceof TexturePass)) return new TexturePass(texture);

        var shader = EffectComposer.CopyShader;
       
        this.map = map;
        this.opacity = ( opacity !== undefined ) ? opacity : 1.0;


        this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

        this.material = new THREE.ShaderMaterial( {

          uniforms: this.uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          depthTest: false,
          depthWrite: false
        } );

        this.needsSwap = false;

        this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        this.scene  = new THREE.Scene();

        this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
        this.scene.add( this.quad );

        this.enabled = true;

      };

    TexturePass.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ) {

            var oldAutoClear = renderer.autoClear;
            renderer.autoClear = false;

            this.quad.material = this.material;

            
            this.uniforms[ "opacity" ].value = this.opacity;
            this.uniforms[ "tDiffuse" ].value = this.map;
            this.material.transparent = ( this.opacity < 1.0 );

            renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

            renderer.autoClear = oldAutoClear

        }

    };

  return TexturePass;

};
