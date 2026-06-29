'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ShapeBlur from '../components/ShapeBlur';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
  mix,
  add
} from 'three/tsl';

const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

extend(THREE);

// Post Processing component
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    const postProcessing = new THREE.RenderPipeline(gl);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    // Create the scanning effect uniform
    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    // Create a red overlay that follows the scan line
    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const redOverlay = vec3(1, 0, 0).mul(oneMinus(scanLine)).mul(0.4);

    // Mix the original scene with the red overlay
    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, redOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0
    );

    // Add bloom effect after scan effect
    const final = withScanEffect.add(bloomPass);

    postProcessing.outputNode = final;

    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    // Animate the scan line from top to bottom
    progressRef.current.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    render.render();
  }, 1);

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const meshRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show image after texture loading
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.01;

    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
    );

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    const depth = tDepthMap;

    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    const mask = dot.mul(flow).mul(vec3(10, 0, 0));

    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      opacity: 0,
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const { viewport } = useThree();
  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    // Smooth fade in
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material;
      if ('opacity' in mat) {
        mat.opacity = THREE.MathUtils.lerp(
          mat.opacity,
          visible ? 1 : 0,
          0.07
        );
      }
    }
  });

  useFrame(({ pointer }) => {
    uniforms.uProgress.value; // Access to keep active
    uniforms.uPointer.value = pointer;
  });

  const isPortrait = viewport.height > viewport.width;
  const scaleFactor = isPortrait ? 0.70 : 0.40;
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export const Home = () => {
  const titleWords = 'Build Your Dreams'.split(' ');
  const subtitle = 'AI-powered creativity for the next generation.';
  const blurCardRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);

  useEffect(() => {
    // GSAP animation for hero text reveal
    const words = heroTitleRef.current?.querySelectorAll('.hero-word');
    if (words && words.length > 0) {
      gsap.fromTo(words,
        { yPercent: 105, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power4.out',
          delay: 0.3
        }
      );
    }

    if (heroSubtitleRef.current) {
      gsap.fromTo(heroSubtitleRef.current,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          delay: 0.9
        }
      );
    }

    // GSAP ScrollTrigger for blur glass card
    if (blurCardRef.current) {
      gsap.fromTo(blurCardRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: blurCardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    }

    // GSAP ScrollTrigger for features header
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    }

    // GSAP ScrollTrigger for features grid cards
    if (cardsRef.current.length > 0) {
      const validCards = cardsRef.current.filter(Boolean);
      gsap.fromTo(validCards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    }

    // Refresh ScrollTrigger to ensure all trigger offsets are correct
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Viewport Section */}
      <section className="hero-section">
        <div className="h-svh uppercase items-center w-full absolute z-60 pointer-events-none px-10 flex justify-center flex-col text-center">
          <div className="text-3xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold">
            <div ref={heroTitleRef} className="title-flex text-white">
              {titleWords.map((word, index) => (
                <div key={index} className="hero-word-wrapper" style={{ overflow: 'hidden', display: 'inline-block' }}>
                  <div className="hero-word" style={{ display: 'inline-block', opacity: 0 }}>
                    {word}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden text-white font-bold">
            <div
              ref={heroSubtitleRef}
              className="hero-subtitle"
              style={{ opacity: 0 }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <button
          className="explore-btn"
          style={{ animationDelay: '2.2s' }}
          onClick={() => {
            document.querySelector('.interactive-blur-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Scroll to explore
          <span className="explore-arrow">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-svg">
              <path d="M11 5V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 12L11 17L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </button>

        <Canvas
          flat
          gl={async (props) => {
            const renderer = new THREE.WebGPURenderer(props);
            await renderer.init();
            return renderer;
          }}
        >
          <PostProcessing fullScreenEffect={true} />
          <Scene />
        </Canvas>
      </section>

      {/* Interactive Shader Blur Section */}
      <section className="interactive-blur-section">
        <div className="blur-overlay-container">
          <div ref={blurCardRef} className="blur-glass-card">
            <span className="blur-tag">Interactive Module</span>
            <h2 className="blur-title">Neural Lens Distortion</h2>
            <p className="blur-desc">
              Move your mouse cursor across the screen. The WebGL shader dynamically calculates mouse vector offsets to blur and distort the roundness parameters of the mesh border in real time.
            </p>
            <div className="blur-controls-preview">
              <div className="control-indicator">
                <span className="dot active"></span>
                <span>SHAPE_VAR_0</span>
              </div>
              <div className="control-indicator">
                <span className="dot"></span>
                <span>FPS: 60_LOCKED</span>
              </div>
            </div>
          </div>
        </div>

        <div className="blur-background-wrapper">
          <ShapeBlur
            variation={0}
            pixelRatioProp={window.devicePixelRatio || 1}
            shapeSize={1}
            roundness={0.5}
            borderSize={0.05}
            circleSize={0.25}
            circleEdge={1}
          />
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="features-section">
        <div className="features-container">
          <div ref={headerRef} className="features-header">
            <span className="features-tag">Architecture</span>
            <h2 className="features-title">Next-Gen Creative Pipelines</h2>
            <p className="features-desc">
              Experience dynamic node-based procedural flows engineered for real-time asset synthesis.
            </p>
          </div>

          <div className="features-grid">
            <div ref={el => cardsRef.current[0] = el} className="feature-card">
              <div className="feature-glow" />
              <div className="feature-icon">01</div>
              <h3 className="feature-name">Procedural Generation</h3>
              <p className="feature-text">
                Build massive procedural networks using mathematical nodes. Model complex physical geometries dynamically.
              </p>
            </div>

            <div ref={el => cardsRef.current[1] = el} className="feature-card">
              <div className="feature-glow" />
              <div className="feature-icon">02</div>
              <h3 className="feature-name">WebGPU Render Pipeline</h3>
              <p className="feature-text">
                Uncompromising graphics fidelity using the native WebGPU shader engine. Advanced bloom and scanning filters.
              </p>
            </div>

            <div ref={el => cardsRef.current[2] = el} className="feature-card">
              <div className="feature-glow" />
              <div className="feature-icon">03</div>
              <h3 className="feature-name">Realtime Interaction</h3>
              <p className="feature-text">
                Shader nodes respond instantly to mouse pointer offsets and scrolling, generating a personalized user canvas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Status / CTA Footer Section */}
      <section className="system-footer-section">
        <div className="footer-container">
          <motion.div 
            className="footer-cta-block"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="footer-tag">Get Started</span>
            <h2 className="footer-title">Ready to build?</h2>
            <p className="footer-desc">
              Initialize your local creative node and begin synthesizing high-fidelity procedural assets.
            </p>
            <button className="footer-action-btn">
              Connect Node
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.5rem' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </motion.div>

          <div className="footer-grid">
            <div className="footer-stat">
              <span className="stat-label">System State</span>
              <span className="stat-value active">ONLINE</span>
            </div>
            <div className="footer-stat">
              <span className="stat-label">Render Engine</span>
              <span className="stat-value">WebGPU 1.0</span>
            </div>
            <div className="footer-stat">
              <span className="stat-label">Compute Latency</span>
              <span className="stat-value active">1.8ms</span>
            </div>
          </div>

          <footer className="main-footer">
            <div className="footer-logo">DREAM.AI</div>
            <div className="footer-copy">© 2026 DREAM.AI. OPERATIONAL DIRECTIVE.</div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default Home;
