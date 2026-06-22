import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
      vec2 uv = v_texCoord;
      vec2 center = vec2(0.5, 0.5);
      float d = distance(uv, center);
      
      float pulse = snoise(uv * 3.0 + u_time * 0.5) * 0.1;
      float alpha = smoothstep(0.4 + pulse, 0.2, d);
      
      vec3 deepIndigo = vec3(0.102, 0.137, 0.494);
      vec3 electricBlue = vec3(0.161, 0.475, 1.0);
      vec3 emerald = vec3(0.0, 0.784, 0.325);
      
      float n = snoise(uv * 5.0 + u_time * 0.8);
      vec3 color = mix(deepIndigo, electricBlue, n * 0.5 + 0.5);
      color = mix(color, emerald, smoothstep(0.3, 0.0, d) * 0.5);
      
      float glow = 0.05 / (d - 0.1);
      color += electricBlue * max(0.0, glow) * 0.5;
      
      gl_FragColor = vec4(color, alpha * 0.8);
  }
`

function OrbMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  )
}

export default function OrbShader() {
  return (
    <Canvas
      camera={{ position: [0, 0, 1] }}
      style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', top: 0, left: 0 }}
      gl={{ alpha: true, antialias: true }}
    >
      <OrbMaterial />
    </Canvas>
  )
}
