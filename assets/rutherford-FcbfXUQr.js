import{I as Se,F as ne,j as q,k as L,W as xe,l as X,m as he,V as g,a as pe,n as D,U as fe,o as be,p as I,M as k,q as U,s as Me,t as Ae,u as _e,G as Ee,S as se,g as oe,B as re,b as Le,A as ze,C as Pe,L as Ue,d as Be,e as Oe}from"./index-CaonDRCX.js";const ae=new X,C=new g;class me extends Se{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],s=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new ne(e,3)),this.setAttribute("uv",new ne(s,2))}applyMatrix4(e){const s=this.attributes.instanceStart,i=this.attributes.instanceEnd;return s!==void 0&&(s.applyMatrix4(e),i.applyMatrix4(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let s;e instanceof Float32Array?s=e:Array.isArray(e)&&(s=new Float32Array(e));const i=new q(s,6,1);return this.setAttribute("instanceStart",new L(i,3,0)),this.setAttribute("instanceEnd",new L(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let s;e instanceof Float32Array?s=e:Array.isArray(e)&&(s=new Float32Array(e));const i=new q(s,6,1);return this.setAttribute("instanceColorStart",new L(i,3,0)),this.setAttribute("instanceColorEnd",new L(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new xe(e.geometry)),this}fromLineSegments(e){const s=e.geometry;return this.setPositions(s.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new X);const e=this.attributes.instanceStart,s=this.attributes.instanceEnd;e!==void 0&&s!==void 0&&(this.boundingBox.setFromBufferAttribute(e),ae.setFromBufferAttribute(s),this.boundingBox.union(ae))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new he),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,s=this.attributes.instanceEnd;if(e!==void 0&&s!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let t=0;for(let n=0,r=e.count;n<r;n++)C.fromBufferAttribute(e,n),t=Math.max(t,i.distanceToSquared(C)),C.fromBufferAttribute(s,n),t=Math.max(t,i.distanceToSquared(C));this.boundingSphere.radius=Math.sqrt(t),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}}I.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new be(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};D.line={uniforms:fe.merge([I.common,I.fog,I.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class $ extends pe{constructor(e){super({type:"LineMaterial",uniforms:fe.clone(D.line.uniforms),vertexShader:D.line.vertexShader,fragmentShader:D.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const N=new U,le=new g,ce=new g,h=new U,p=new U,w=new U,H=new g,V=new Ae,f=new Me,de=new g,T=new X,R=new he,S=new U;let x,A;function ue(u,e,s){return S.set(0,0,-e,1).applyMatrix4(u.projectionMatrix),S.multiplyScalar(1/S.w),S.x=A/s.width,S.y=A/s.height,S.applyMatrix4(u.projectionMatrixInverse),S.multiplyScalar(1/S.w),Math.abs(Math.max(S.x,S.y))}function Ce(u,e){const s=u.matrixWorld,i=u.geometry,t=i.attributes.instanceStart,n=i.attributes.instanceEnd,r=Math.min(i.instanceCount,t.count);for(let o=0,c=r;o<c;o++){f.start.fromBufferAttribute(t,o),f.end.fromBufferAttribute(n,o),f.applyMatrix4(s);const a=new g,l=new g;x.distanceSqToSegment(f.start,f.end,l,a),l.distanceTo(a)<A*.5&&e.push({point:l,pointOnLine:a,distance:x.origin.distanceTo(l),object:u,face:null,faceIndex:o,uv:null,uv1:null})}}function Te(u,e,s){const i=e.projectionMatrix,n=u.material.resolution,r=u.matrixWorld,o=u.geometry,c=o.attributes.instanceStart,a=o.attributes.instanceEnd,l=Math.min(o.instanceCount,c.count),d=-e.near;x.at(1,w),w.w=1,w.applyMatrix4(e.matrixWorldInverse),w.applyMatrix4(i),w.multiplyScalar(1/w.w),w.x*=n.x/2,w.y*=n.y/2,w.z=0,H.copy(w),V.multiplyMatrices(e.matrixWorldInverse,r);for(let m=0,_=l;m<_;m++){if(h.fromBufferAttribute(c,m),p.fromBufferAttribute(a,m),h.w=1,p.w=1,h.applyMatrix4(V),p.applyMatrix4(V),h.z>d&&p.z>d)continue;if(h.z>d){const M=h.z-p.z,b=(h.z-d)/M;h.lerp(p,b)}else if(p.z>d){const M=p.z-h.z,b=(p.z-d)/M;p.lerp(h,b)}h.applyMatrix4(i),p.applyMatrix4(i),h.multiplyScalar(1/h.w),p.multiplyScalar(1/p.w),h.x*=n.x/2,h.y*=n.y/2,p.x*=n.x/2,p.y*=n.y/2,f.start.copy(h),f.start.z=0,f.end.copy(p),f.end.z=0;const B=f.closestPointToPointParameter(H,!0);f.at(B,de);const E=_e.lerp(h.z,p.z,B),G=E>=-1&&E<=1,F=H.distanceTo(de)<A*.5;if(G&&F){f.start.fromBufferAttribute(c,m),f.end.fromBufferAttribute(a,m),f.start.applyMatrix4(r),f.end.applyMatrix4(r);const M=new g,b=new g;x.distanceSqToSegment(f.start,f.end,b,M),s.push({point:b,pointOnLine:M,distance:x.origin.distanceTo(b),object:u,face:null,faceIndex:m,uv:null,uv1:null})}}}class Re extends k{constructor(e=new me,s=new $({color:Math.random()*16777215})){super(e,s),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,s=e.attributes.instanceStart,i=e.attributes.instanceEnd,t=new Float32Array(2*s.count);for(let r=0,o=0,c=s.count;r<c;r++,o+=2)le.fromBufferAttribute(s,r),ce.fromBufferAttribute(i,r),t[o]=o===0?0:t[o-1],t[o+1]=t[o]+le.distanceTo(ce);const n=new q(t,2,1);return e.setAttribute("instanceDistanceStart",new L(n,1,0)),e.setAttribute("instanceDistanceEnd",new L(n,1,1)),this}raycast(e,s){const i=this.material.worldUnits,t=e.camera;t===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const n=e.params.Line2!==void 0&&e.params.Line2.threshold||0;x=e.ray;const r=this.matrixWorld,o=this.geometry,c=this.material;A=c.linewidth+n,o.boundingSphere===null&&o.computeBoundingSphere(),R.copy(o.boundingSphere).applyMatrix4(r);let a;if(i)a=A*.5;else{const d=Math.max(t.near,R.distanceToPoint(x.origin));a=ue(t,d,c.resolution)}if(R.radius+=a,x.intersectsSphere(R)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),T.copy(o.boundingBox).applyMatrix4(r);let l;if(i)l=A*.5;else{const d=Math.max(t.near,T.distanceToPoint(x.origin));l=ue(t,d,c.resolution)}T.expandByScalar(l),x.intersectsBox(T)!==!1&&(i?Ce(this,s):Te(this,t,s))}onBeforeRender(e){const s=this.material.uniforms;s&&s.resolution&&(e.getViewport(N),this.material.uniforms.resolution.value.set(N.z,N.w))}}class ge extends me{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const s=e.length-3,i=new Float32Array(2*s);for(let t=0;t<s;t+=3)i[2*t]=e[t],i[2*t+1]=e[t+1],i[2*t+2]=e[t+2],i[2*t+3]=e[t+3],i[2*t+4]=e[t+4],i[2*t+5]=e[t+5];return super.setPositions(i),this}setColors(e){const s=e.length-3,i=new Float32Array(2*s);for(let t=0;t<s;t+=3)i[2*t]=e[t],i[2*t+1]=e[t+1],i[2*t+2]=e[t+2],i[2*t+3]=e[t+3],i[2*t+4]=e[t+4],i[2*t+5]=e[t+5];return super.setColors(i),this}setFromPoints(e){const s=e.length-1,i=new Float32Array(6*s);for(let t=0;t<s;t++)i[6*t]=e[t].x,i[6*t+1]=e[t].y,i[6*t+2]=e[t].z||0,i[6*t+3]=e[t+1].x,i[6*t+4]=e[t+1].y,i[6*t+5]=e[t+1].z||0;return super.setPositions(i),this}fromLine(e){const s=e.geometry;return this.setPositions(s.attributes.position.array),this}}class De extends Re{constructor(e=new ge,s=new $({color:Math.random()*16777215})){super(e,s),this.isLine2=!0,this.type="Line2"}}const Ie=13434624,Ge=43775,Fe=16777215,je=65535,We=16776960,Ne=`
    varying float vLineDistance;
    void main() {
        vLineDistance = mod(float(gl_VertexID), 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`,He=`
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vLineDistance;

    float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }

    void main() {
        float wave = sin(vLineDistance * 15.0 - uTime * 5.0);
        wave = smoothstep(0.5, 1.0, wave);
        float flicker = rand(vec2(uTime * 0.1, vLineDistance * 0.5));
        flicker = smoothstep(0.3, 0.7, flicker);
        float intensity = wave * 0.6 + flicker * 0.4;
        intensity *= smoothstep(0.0, 0.15, vLineDistance);
        gl_FragColor = vec4(uColor, uOpacity * intensity);
    }
`;class qe{constructor(){this.description="Rutherford Model (1911): Based on the gold foil experiment, proposed a small, dense, positively charged nucleus with electrons orbiting it like planets around the sun. Most of the atom is empty space.",this.sceneObjects=[],this.nucleusGroup=null,this.electrons=[],this.electronData=[],this.orbits=[],this.alphaParticles=[],this.alphaLines=[],this.electricArcs=null,this.arcMaterial=null,this.params={showAlphaBeam:!1,alphaParticleSpeed:15,alphaSpawnRate:.2,electronSpeed:.3,orbitEccentricity:0,precessionSpeed:.05},this.alphaTimer=0}init(e,s,i,t,n,r){console.log(`Initializing Rutherford Model for ${s.name}`);const{atomicNumber:o,atomicWeight:c}=s;this.guiFolder=null;const a=o,l=Math.round(c)-o,d=o;this.nucleusGroup=new Ee,e.add(this.nucleusGroup),this.sceneObjects.push(this.nucleusGroup);const m=.3+Math.log10(a+l+1)*.2,_=new se(m,16,16),Y=new oe({color:Ie,roughness:.7}),B=new k(_,Y);this.nucleusGroup.add(B);const E=new re,G=118*2*3,F=new Float32Array(G);E.setAttribute("position",new Le(F,3)),E.setDrawRange(0,0),this.arcMaterial=new pe({uniforms:{uTime:{value:0},uColor:{value:new Pe(je)},uOpacity:{value:.7}},vertexShader:Ne,fragmentShader:He,transparent:!0,blending:ze,depthWrite:!1}),this.electricArcs=new Ue(E,this.arcMaterial),this.electricArcs.frustumCulled=!1,e.add(this.electricArcs),this.sceneObjects.push(this.electricArcs),this.electrons=[],this.electronData=[],this.orbits=[];const M=new se(.1,12,12),b=new oe({color:Ge,roughness:.5,metalness:.2}),Z=m+2,ve=new Be({color:Fe,transparent:!0,opacity:.25});for(let y=0;y<d;y++){const v=new k(M,b.clone()),K=Z+y*1.5,z=K,Q=z*Math.sqrt(1-this.params.orbitEccentricity**2),j=Math.random()*Math.PI*2,ye=this.params.electronSpeed*(1/Math.sqrt(K)),O=Math.random()*Math.PI*2;v.position.set(z*Math.cos(j),0,Q*Math.sin(j)),v.position.applyAxisAngle(new g(0,1,0),O),e.add(v),this.sceneObjects.push(v),this.electrons.push(v);const ee=[],te=64;for(let W=0;W<=te;W++){const ie=W/te*Math.PI*2;ee.push(new g(z*Math.cos(ie),0,z*Math.sin(ie)))}const we=new re().setFromPoints(ee),P=new Oe(we,ve.clone());P.rotation.y=O,e.add(P),this.sceneObjects.push(P),this.orbits.push(P),this.electronData.push({mesh:v,angle:j,a:z,b:Q,speed:ye,precession:O,initialPrecession:O,orbitLine:P,arcIndex:y})}console.log(`Created ${d} electrons and orbits.`),this.electricArcs&&this.electricArcs.geometry.setDrawRange(0,d*2),this.alphaParticles=[],this.alphaLines=[],i&&(this.guiFolder=i.addFolder("Rutherford Controls"),this.guiFolder.add(this.params,"showAlphaBeam").name("Alpha Beam").onChange(y=>{y?this.alphaTimer=1/this.params.alphaSpawnRate:this.clearAlphaParticles(e)}),this.guiFolder.add(this.params,"orbitEccentricity",0,.95,.05).name("Orbit Eccentricity").onChange(y=>{this.electronData.forEach(v=>{v.b=v.a*Math.sqrt(1-y**2)})}),this.guiFolder.add(this.params,"precessionSpeed",0,.5,.01).name("Precession Speed"),this.guiFolder.add(this.params,"electronSpeed",.1,1,.05).name("Electron Speed").onChange(y=>{this.electronData.forEach(v=>{v.speed=y*(1/Math.sqrt(v.a))})}),this.guiFolder.add(this.arcMaterial.uniforms.uOpacity,"value",0,1,.05).name("Arc Opacity"));const J=Z+(d-1)*1.5;n&&r?(console.log(`[Rutherford Init] Adjusting camera for maxOrbit: ${J}`),n.position.z=(J||5)*2,r.target.set(0,0,0),r.update()):console.warn("[Rutherford Init] Camera or controls not provided, skipping auto-zoom.")}update(e){const i=performance.now()*.001;if(this.nucleusGroup){const r=(Math.sin(i*15)+Math.sin(i*27.3))*.5*.03,o=(Math.sin(i*14)+Math.sin(i*24.8))*.5*.03,c=(Math.sin(i*16)+Math.sin(i*26.1))*.5*.03;this.nucleusGroup.position.set(r,o,c)}this.electronData.forEach(n=>{n.angle+=n.speed*e,n.precession+=this.params.precessionSpeed*e;const r=n.a*Math.cos(n.angle),o=n.b*Math.sin(n.angle),c=new g(r,0,o);if(c.applyAxisAngle(new g(0,1,0),n.precession),n.mesh.position.copy(c),n.orbitLine&&(n.orbitLine.rotation.y=n.precession),this.electricArcs&&n.arcIndex!==void 0){const a=this.electricArcs.geometry.attributes.position.array,l=n.arcIndex*2*3;a[l+0]=this.nucleusGroup.position.x,a[l+1]=this.nucleusGroup.position.y,a[l+2]=this.nucleusGroup.position.z,a[l+3]=n.mesh.position.x,a[l+4]=n.mesh.position.y,a[l+5]=n.mesh.position.z}}),this.electricArcs&&this.electronData.length>0&&(this.electricArcs.geometry.attributes.position.needsUpdate=!0),this.arcMaterial&&(this.arcMaterial.uniforms.uTime.value=i),this.alphaTimer+=e,this.params.showAlphaBeam&&this.alphaTimer>1/this.params.alphaSpawnRate&&(this.alphaTimer=0,this.spawnAlphaParticle(scene));const t=[];this.alphaParticles.forEach((n,r)=>{n.position.addScaledVector(n.velocity,e),n.life-=e;const o=n.line.geometry.attributes.position.array;o[3]=n.position.x,o[4]=n.position.y,o[5]=n.position.z,n.line.geometry.attributes.position.needsUpdate=!0,n.line.geometry.computeBoundingSphere();const c=n.position.lengthSq(),a=1**2;if(!n.deflected&&c<a){const l=n.position.clone().normalize().multiplyScalar(.5);n.velocity.add(l).normalize().multiplyScalar(this.params.alphaParticleSpeed*.8),n.deflected=!0}(n.life<=0||n.position.length()>50)&&(t.push(r),scene.remove(n.line),n.line.geometry.dispose())});for(let n=t.length-1;n>=0;n--){const r=t[n];this.alphaParticles.splice(r,1)}}spawnAlphaParticle(e){var _;const i=(Math.random()-.5)*5,t=(Math.random()-.5)*5,n=new g(-20,i,t),o=new g((Math.random()-.5)*.5,(Math.random()-.5)*.5,(Math.random()-.5)*.5).sub(n).normalize().multiplyScalar(this.params.alphaParticleSpeed),c=[n.x,n.y,n.z,n.x,n.y,n.z],a=new ge;a.setPositions(c);const l=new $({color:We,linewidth:.005,vertexColors:!1,dashed:!1,transparent:!0,opacity:.6}),d=(_=e.renderer)==null?void 0:_.domElement;d&&l.resolution.set(d.clientWidth,d.clientHeight);const m=new De(a,l);m.computeLineDistances(),m.scale.set(1,1,1),e.add(m),this.alphaParticles.push({position:n.clone(),velocity:o,life:5,deflected:!1,line:m})}clearAlphaParticles(e){this.alphaParticles.forEach(s=>{e.remove(s.line),s.line.geometry.dispose()}),this.alphaParticles=[],this.alphaLines=[]}dispose(e){this.guiFolder&&(this.guiFolder.destroy(),this.guiFolder=null),console.log("Disposing Rutherford Model objects."),this.clearAlphaParticles(e),this.sceneObjects.forEach(s=>{s===this.nucleusGroup?s.traverse(i=>{i.isMesh&&(i.geometry&&i.geometry.dispose(),i.material&&i.material.dispose())}):(s.geometry&&s.geometry.dispose(),s.material&&(Array.isArray(s.material)?s.material.forEach(i=>i.dispose()):s.material.dispose())),e.remove(s)}),this.sceneObjects=[],this.nucleusGroup=null,this.electrons=[],this.orbits=[],this.electronData=[],this.electricArcs=null,this.arcMaterial=null}}export{qe as Model};
