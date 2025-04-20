import{S as O,a as y,A as M,C as w,B as b,b as V,L as _,M as D,c as E,V as U,d as q,e as G,f as k}from"./index-CaonDRCX.js";const $=13434624,W=43775,H=16777215,X=65535,Y=`
    varying float vLineDistance;
    void main() {
        vLineDistance = mod(float(gl_VertexID), 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`,Z=`
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vLineDistance;

    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
        float wave = sin(vLineDistance * 15.0 - uTime * 5.0);
        wave = smoothstep(0.5, 1.0, wave);
        float flicker = rand(vec2(uTime * 0.1, vLineDistance * 0.5));
        flicker = smoothstep(0.3, 0.7, flicker);
        float intensity = wave * 0.6 + flicker * 0.4;
        intensity *= smoothstep(0.0, 0.15, vLineDistance);
        gl_FragColor = vec4(uColor, uOpacity * intensity);
    }
`,I=`
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
`,L=`
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uNoiseScale;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float simpleNoise(vec3 p) {
        float freq = 1.0; float amp = 0.5; float noise = 0.0;
        for (int i = 0; i < 3; i++) {
            noise += sin(p.x * freq + uTime * 0.5) * amp;
            noise += sin(p.y * freq + uTime * 0.6) * amp;
            noise += cos(p.z * freq + uTime * 0.7) * amp;
            freq *= 2.0; amp *= 0.5;
        } return noise;
    }
    void main() {
        float noise = simpleNoise(vec3(vUv * uNoiseScale, uTime * 0.2));
        vec2 center = vec2(0.5, 0.5);
        float angle = atan(vUv.y - center.y, vUv.x - center.x);
        float radius = length(vUv - center);
        noise += sin(angle * 5.0 + uTime * 1.5 + radius * 3.0) * 0.3;
        float plasma = smoothstep(0.3, 0.7, noise + 0.5);

        float rimPower = 2.0; float rimIntensity = 0.8;
        vec3 viewDir = normalize(vViewPosition);
        float rimDot = 1.0 - max(dot(viewDir, vNormal), 0.0);
        float rim = smoothstep(0.0, 1.0, pow(rimDot, rimPower)) * rimIntensity;

        float core = smoothstep(0.2, 0.0, radius) * 1.5;

        vec3 color = uColor * plasma + uColor * rim * 0.8 + uColor * core;
        color = clamp(color * uIntensity, 0.0, 1.0);

        float alpha = smoothstep(0.1, 0.4, plasma + rim * 0.5 + core * 0.2);

        gl_FragColor = vec4(color, alpha);
    }
`;class Q{constructor(){this.description="Bohr Model (1913): Electrons orbit the nucleus in fixed energy levels (shells), similar to planets orbiting a star. Energy is quantized.",this.sceneObjects=[],this.nucleus=null,this.electrons=[],this.orbits=[],this.electronData=[],this.electricArcs=null,this.arcMaterial=null,this.params={speed:.5,radiusScale:1,glowStrength:1.5}}init(o,e,t,h,s,i){console.log(`Initializing Bohr Model for ${e.name}`);const{shells:n,atomicNumber:T}=e;this.guiFolder=null;const F=.8+Math.log10(T+1)*.5,P=new O(F,48,48),x=new y({uniforms:{uTime:{value:0},uColor:{value:new w($)},uNoiseScale:{value:3},uIntensity:{value:this.params.glowStrength}},vertexShader:I,fragmentShader:L,transparent:!0,blending:M,depthWrite:!1});this.nucleusMaterial=x;const d=new b,R=118*2*3,N=new Float32Array(R);d.setAttribute("position",new V(N,3)),d.setDrawRange(0,0),this.arcMaterial=new y({uniforms:{uTime:{value:0},uColor:{value:new w(X)},uOpacity:{value:.7}},vertexShader:Y,fragmentShader:Z,transparent:!0,blending:M,depthWrite:!1}),this.electricArcs=new _(d,this.arcMaterial),this.electricArcs.frustumCulled=!1,o.add(this.electricArcs),this.sceneObjects.push(this.electricArcs),this.nucleus=new D(P,x),o.add(this.nucleus),this.sceneObjects.push(this.nucleus);const f=E(n,1.5,this.params.radiusScale);let m=0;n.forEach((l,p)=>{const a=f[p];if(!a||l===0)return;const C=[],A=64;for(let r=0;r<=A;r++){const c=r/A*Math.PI*2;C.push(new U(a*Math.cos(c),0,a*Math.sin(c)))}const z=new b().setFromPoints(C),B=new q({color:H,transparent:!0,opacity:.25}),v=new G(z,B);o.add(v),this.sceneObjects.push(v),this.orbits.push(v);const j=new O(.2,24,24);for(let r=0;r<l;r++){m++;const c=new y({uniforms:{uTime:{value:Math.random()*10},uColor:{value:new w(W)},uNoiseScale:{value:5+Math.random()*2},uIntensity:{value:1.8}},vertexShader:I,fragmentShader:L,transparent:!0,blending:M,depthWrite:!1}),u=new D(j,c),g=k(360/l*r+(p%2===0?0:15));u.position.set(a*Math.cos(g),0,a*Math.sin(g)),o.add(u),this.sceneObjects.push(u),this.electrons.push(u),this.electronData.push({mesh:u,material:c,radius:a,angle:g,shellIndex:p,arcIndex:m-1})}}),console.log(`Created ${m} electrons in ${n.length} shells.`),this.electricArcs&&this.electricArcs.geometry.setDrawRange(0,m*2),t&&(this.guiFolder=t.addFolder("Bohr Model Controls"),this.guiFolder.add(this.params,"speed",.1,3,.1).name("Electron Speed"),this.guiFolder.add(this.params,"radiusScale",.5,2,.1).name("Radius Scale").onChange(()=>{console.warn("Radius scaling requires model re-initialization in this simple version.")}),this.guiFolder.add(this.params,"glowStrength",.1,5,.1).name("Nucleus Intensity").onChange(l=>{this.nucleusMaterial&&(this.nucleusMaterial.uniforms.uIntensity.value=l)}),this.guiFolder.add(this.arcMaterial.uniforms.uOpacity,"value",0,1,.05).name("Arc Opacity"));const S=f[f.length-1]||5;s&&i?(console.log(`[Bohr Init] Adjusting camera for maxRadius: ${S}`),s.position.z=S*2.5,i.target.set(0,0,0),i.update()):console.warn("[Bohr Init] Camera or controls not provided, skipping auto-zoom.")}update(o){const e=performance.now()*.001;if(this.nucleus){const h=(Math.sin(e*15)+Math.sin(e*27.3))*.5*.03,s=(Math.sin(e*14)+Math.sin(e*24.8))*.5*.03,i=(Math.sin(e*16)+Math.sin(e*26.1))*.5*.03;if(this.nucleus.position.set(h,s,i),this.nucleusMaterial){this.nucleusMaterial.uniforms.uTime.value=e*.8;const n=Math.sin(e*2)*.3+1;this.nucleusMaterial.uniforms.uIntensity.value=this.params.glowStrength*n}}this.electronData.forEach(t=>{t.material&&(t.material.uniforms.uTime.value+=o*(.5+Math.random()*.5));const h=1;if(t.angle+=this.params.speed*h*o,t.mesh.position.x=t.radius*Math.cos(t.angle),t.mesh.position.z=t.radius*Math.sin(t.angle),this.electricArcs&&t.arcIndex!==void 0){const s=this.electricArcs.geometry.attributes.position.array,i=t.arcIndex*2*3;s[i+0]=this.nucleus.position.x,s[i+1]=this.nucleus.position.y,s[i+2]=this.nucleus.position.z,s[i+3]=t.mesh.position.x,s[i+4]=t.mesh.position.y,s[i+5]=t.mesh.position.z}}),this.electricArcs&&this.electronData.length>0&&(this.electricArcs.geometry.attributes.position.needsUpdate=!0),this.arcMaterial&&(this.arcMaterial.uniforms.uTime.value=e)}dispose(o){this.guiFolder&&(this.guiFolder.destroy(),this.guiFolder=null),console.log("Disposing Bohr Model objects."),this.sceneObjects.forEach(e=>{o.remove(e),e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(t=>t.dispose()):e.material.dispose()),e.isLight}),this.sceneObjects=[],this.nucleus=null,this.electrons=[],this.orbits=[],this.electronData=[],this.electricArcs=null,this.arcMaterial=null}}export{Q as Model};
