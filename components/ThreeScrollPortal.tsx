'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScrollPortal() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || 800;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // 1. Concentric Expanding Luxury Rings (Horological Gear Bezel aesthetic)
    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);

    const ringCount = 5;
    const ringMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < ringCount; i++) {
      const radius = 1.8 + i * 1.4;
      const tube = 0.015;
      const geometry = new THREE.TorusGeometry(radius, tube, 16, 64);
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xd4af37 : 0x8a7322,
        transparent: true,
        opacity: 0.15 + (i * 0.04),
        wireframe: true,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -i * 1.8;
      ringsGroup.add(ring);
      ringMeshes.push(ring);
    }

    // 2. Starburst / Expanding Gold Particles (Bung từ trong ra)
    const particleCount = 600;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const originalZ = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Start in a cylindrical tunnel from deep in z
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 4.5;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = (Math.random() - 0.5) * 15;
      originalZ[i] = positions[i3 + 2];

      velocities[i3] = (Math.random() - 0.5) * 0.005;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i3 + 2] = 0.02 + Math.random() * 0.03;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material with Champagne Gold Glow
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf3e3a3,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Scroll listener for dynamic "Bung từ trong ra" reaction
    let scrollProgress = 0;
    let targetProgress = 0;

    const handleScroll = () => {
      if (!mount) return;
      const rect = mount.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Progress from 0 when entering viewport to 1 when scrolled
      const progress = Math.min(Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)), 1);
      targetProgress = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation
      scrollProgress += (targetProgress - scrollProgress) * 0.08;

      // Expand rings outward based on scroll
      ringsGroup.rotation.z = elapsedTime * 0.05 + scrollProgress * 1.5;
      ringsGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;
      ringsGroup.rotation.y = Math.cos(elapsedTime * 0.2) * 0.15;

      ringMeshes.forEach((ring, index) => {
        // "Bung từ trong ra": scale up and push forward as user scrolls
        const expansion = 1 + scrollProgress * (1.2 + index * 0.4);
        ring.scale.set(expansion, expansion, 1);
        ring.position.z = -index * 1.8 + scrollProgress * 4;
      });

      // Move particles forward through the tunnel
      const positionAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const currentPositions = positionAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Accelerate forward with scroll
        currentPositions[i3 + 2] += (0.015 + scrollProgress * 0.08);

        // When particle passes the camera, reset it deep inside
        if (currentPositions[i3 + 2] > 6) {
          currentPositions[i3 + 2] = -10;
          const angle = Math.random() * Math.PI * 2;
          const radius = 0.5 + Math.random() * 3.5;
          currentPositions[i3] = Math.cos(angle) * radius;
          currentPositions[i3 + 1] = Math.sin(angle) * radius;
        }
      }
      positionAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      ringsGroup.children.forEach((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          c.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-60"
      aria-hidden="true"
    />
  );
}
