        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uRand;
        uniform float uProgress;
        varying vec2 vUv;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 progress(){
     if (vUv.y < uProgress && vUv.y > uProgress - 0.2) {
        return vec4(0.1,0.1,0.1,0.3) * (uProgress - vUv.y) ;
    }
        else {return vec4(0,0,0,0);}
}

void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);
            float r = rand(vUv*uTime);
            // color.rgb + uTint;
            // gl_FragColor = color;

            
            vec4 p = progress();
            gl_FragColor = color  +  (vec4(r,r,r,0) * (p.a + uRand));

            // if (vUv.y > sin(uTime) && vUv.y < sin(uTime) + 0.1 ) {
            //     gl_FragColor += vec4(0.1,0.1,0.1,0);
            // }
            
        }