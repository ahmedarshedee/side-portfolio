import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);

  const { setLoading } = useLoading();
  const [webGLFailed, setWebGLFailed] = useState(false);

  const [character, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = new THREE.Scene();

      let renderer: THREE.WebGLRenderer;
      try {
        const originalConsoleError = console.error;
        console.error = () => { };
        try {
          // First attempt: full quality
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          });
        } catch {
          // Second attempt: reduced quality (works on more GPUs/drivers)
          try {
            renderer = new THREE.WebGLRenderer({
              alpha: true,
              antialias: false,
              powerPreference: "default",
              failIfMajorPerformanceCaveat: false,
            });
          } catch {
            renderer = null as any;
          }
        } finally {
          console.error = originalConsoleError;
        }
        if (!renderer || !renderer.getContext || !renderer.getContext()) {
          console.warn("WebGL context could not be created – skipping 3D scene.");
          renderer?.dispose();
          document.body.classList.add("no-webgl");
          setWebGLFailed(true);
          setLoading(100);
          return;
        }
      } catch {
        console.warn("WebGL context could not be created – skipping 3D scene.");
        document.body.classList.add("no-webgl");
        setWebGLFailed(true);
        setLoading(100);
        return;
      }

      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      // Handle context loss gracefully
      const canvas = renderer.domElement;
      const onContextLost = (e: Event) => {
        e.preventDefault();
        console.warn("WebGL context lost – waiting to restore...");
      };
      const onContextRestored = () => {
        console.info("WebGL context restored.");
        renderer.setSize(container.width, container.height);
      };
      canvas.addEventListener("webglcontextlost", onContextLost);
      canvas.addEventListener("webglcontextrestored", onContextRestored);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          setChar(character);
          scene.add(character);
          headBone = character.getObjectByName("spine006") || null;
          screenLight = character.getObjectByName("screenlight") || null;
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
          });
          window.addEventListener("resize", () =>
            handleResize(renderer, camera, canvasDiv, character)
          );
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }

      let animFrameId: number;
      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        if (!renderer.getContext().isContextLost()) {
          renderer.render(scene, camera);
        }
      };
      animate();
      return () => {
        cancelAnimationFrame(animFrameId);
        clearTimeout(debounce);
        scene.clear();
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
        renderer.dispose();
        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (canvasDiv.current && canvasDiv.current.contains(renderer.domElement)) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  if (webGLFailed) {
    return (
      <div className="character-container">
        <div className="character-model character-model--fallback">
          <div className="character-fallback">
            <div className="character-fallback__glow"></div>
            <svg className="character-fallback__svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <ellipse cx="100" cy="75" rx="42" ry="48" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5" />
              {/* Body */}
              <path d="M60 138 Q100 125 140 138 L155 280 Q100 295 45 280 Z" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5" />
              {/* Left arm */}
              <path d="M62 148 Q30 190 25 250" stroke="#22d3ee" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Right arm */}
              <path d="M138 148 Q170 190 175 250" stroke="#22d3ee" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Left leg */}
              <path d="M75 278 Q68 330 65 380" stroke="#22d3ee" strokeWidth="12" strokeLinecap="round" fill="none" />
              {/* Right leg */}
              <path d="M125 278 Q132 330 135 380" stroke="#22d3ee" strokeWidth="12" strokeLinecap="round" fill="none" />
              {/* Face shine */}
              <ellipse cx="85" cy="65" rx="8" ry="10" fill="#334155" opacity="0.6" />
              {/* Eyes */}
              <circle cx="88" cy="72" r="5" fill="#22d3ee" opacity="0.9" />
              <circle cx="112" cy="72" r="5" fill="#22d3ee" opacity="0.9" />
              {/* Laptop screen glow */}
              <rect x="72" y="175" width="56" height="38" rx="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
              <rect x="75" y="178" width="50" height="32" rx="2" fill="#22d3ee" opacity="0.15" />
              <line x1="82" y1="188" x2="118" y2="188" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
              <line x1="82" y1="196" x2="110" y2="196" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />
            </svg>
          </div>
          <div className="character-rim"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
