import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import useStore from '../store/useStore';

const DISTRICT_CONFIG = {
  alfred: { color: 0x00d4ff, accent: 0x33ccff, label: 'WAYNE MANOR', villain: 'ALFRED', power: 100 },
  joker: { color: 0xff6600, accent: 0xcc33ff, label: 'AMUSEMENT MILE', villain: 'JOKER', power: 85 },
  penguin: { color: 0x556677, accent: 0x88aacc, label: 'ICEBERG LOUNGE', villain: 'PENGUIN', power: 72 },
  catwoman: { color: 0xff3366, accent: 0xff6699, label: 'EAST END', villain: 'CATWOMAN', power: 68 },
  twoface: { color: 0x888899, accent: 0xbbbbcc, label: 'GOTHAM COURTHOUSE', villain: 'TWO-FACE', power: 55 },
  riddler: { color: 0x33ff99, accent: 0x66ffbb, label: 'GOTHAM LIBRARY', villain: 'RIDDLER', power: 90 },
  bane: { color: 0x664433, accent: 0x996644, label: 'BLACKGATE PRISON', villain: 'BANE', power: 95 },
  poisonivy: { color: 0x22cc44, accent: 0x44ff66, label: 'BOTANICAL GARDENS', villain: 'IVY', power: 78 },
  scarecrow: { color: 0x997755, accent: 0xbb9977, label: 'ARKHAM ASYLUM', villain: 'SCARECROW', power: 82 },
  mrfeeze: { color: 0x6699cc, accent: 0x99bbff, label: 'CRYO-LAB', villain: 'MR. FREEZE', power: 88 },
  clayface: { color: 0xaa8855, accent: 0xccaa77, label: 'CRIME ALLEY', villain: 'CLAYFACE', power: 45 },
  harley: { color: 0xff4488, accent: 0xff77aa, label: 'CARNIVAL DISTRICT', villain: 'HARLEY QUINN', power: 70 },
};

const AGENT_POSITIONS = [
  { x: 28, z: 0 },
  { x: 19.8, z: 19.8 },
  { x: 0, z: 28 },
  { x: -19.8, z: 19.8 },
  { x: -28, z: 0 },
  { x: -19.8, z: -19.8 },
  { x: 0, z: -28 },
  { x: 19.8, z: -19.8 },
];

const STATUS_COLORS = {
  active:   0x00ff88,
  idle:     0xffaa00,
  blocked:  0xff8800,
  error:    0xff4444,
};

function createLabelSprite(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
  ctx.fillRect(0, 0, 256, 64);
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  ctx.shadowColor = '#' + color.toString(16).padStart(6, '0');
  ctx.shadowBlur = 10;
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(8, 2, 1);
  return sprite;
}

export default function GothamMap({ onAgentClick }) {
  const containerRef = useRef(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [cameraInfo, setCameraInfo] = useState({ distance: 0, target: 'CENTER', fps: 60 });
  const [systemStats, setSystemStats] = useState({ agents: 0, active: 0, idle: 0, tasks: 0 });
  const { agents } = useStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 500);
    camera.position.set(45, 35, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 15;
    controls.maxDistance = 100;
    controls.target.set(0, 2, 0);
    controls.update();

    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.8);
    scene.add(ambient);

    const moon = new THREE.DirectionalLight(0x4488ff, 1.2);
    moon.position.set(35, 55, 25);
    moon.castShadow = true;
    moon.shadow.mapSize.width = 2048;
    moon.shadow.mapSize.height = 2048;
    moon.shadow.camera.near = 0.5;
    moon.shadow.camera.far = 150;
    moon.shadow.camera.left = -80;
    moon.shadow.camera.right = 80;
    moon.shadow.camera.top = 80;
    moon.shadow.camera.bottom = -80;
    moon.shadow.bias = -0.0001;
    scene.add(moon);

    const hemi = new THREE.HemisphereLight(0x0a0a1a, 0x000000, 0.4);
    scene.add(hemi);

    const groundGeo = new THREE.PlaneGeometry(250, 250);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x0a0a0f, 
      roughness: 0.95, 
      metalness: 0.1, 
      transparent: true, 
      opacity: 0.7 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(250, 60, 0x1a1a25, 0x12121a);
    grid.position.y = 0.01;
    scene.add(grid);

    function createRoad(x1, z1, x2, z2) {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.sqrt(dx * dx + dz * dz);
      const roadGeo = new THREE.PlaneGeometry(3, length);
      const roadMat = new THREE.MeshStandardMaterial({ 
        color: 0x12121a, 
        roughness: 0.9, 
        transparent: true, 
        opacity: 0.5 
      });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = Math.atan2(dz, dx) - Math.PI / 2;
      road.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
      road.receiveShadow = true;
      scene.add(road);
    }

    for (let i = 0; i < AGENT_POSITIONS.length; i++) {
      const next = (i + 1) % AGENT_POSITIONS.length;
      createRoad(AGENT_POSITIONS[i].x, AGENT_POSITIONS[i].z, AGENT_POSITIONS[next].x, AGENT_POSITIONS[next].z);
      createRoad(0, 0, AGENT_POSITIONS[i].x, AGENT_POSITIONS[i].z);
    }

    const towerGroup = new THREE.Group();
    const towerGeo = new THREE.CylinderGeometry(1.5, 2.5, 30, 8);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      roughness: 0.1,
      metalness: 0.95,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.6,
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 15;
    tower.castShadow = true;
    towerGroup.add(tower);

    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.6 + i * 0.2, 0.1, 8, 20),
        new THREE.MeshStandardMaterial({ 
          color: 0x00d4ff, 
          emissive: 0x00d4ff, 
          emissiveIntensity: 0.9,
          transparent: true,
          opacity: 0.8
        })
      );
      ring.position.y = 5 + i * 5;
      ring.rotation.x = Math.PI / 2;
      towerGroup.add(ring);
    }

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff })
    );
    beacon.position.y = 30.5;
    beacon.name = 'beacon';
    towerGroup.add(beacon);

    const beaconLight = new THREE.PointLight(0x00d4ff, 8, 60);
    beaconLight.position.y = 30.5;
    towerGroup.add(beaconLight);

    const beaconLight2 = new THREE.PointLight(0x00d4ff, 4, 40);
    beaconLight2.position.y = 20;
    towerGroup.add(beaconLight2);

    scene.add(towerGroup);

    const buildingsMap = new Map();

    function createDistrictBuilding(agent, index) {
      const config = DISTRICT_CONFIG[agent.district] || DISTRICT_CONFIG.joker;
      const pos = AGENT_POSITIONS[index];
      const group = new THREE.Group();
      group.userData = { agentId: agent.id, isBuilding: true };

      const mainMat = new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.4,
        metalness: 0.5,
        transparent: true,
        opacity: 0.9,
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: config.accent,
        roughness: 0.3,
        metalness: 0.6,
        emissive: config.accent,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.9,
      });

      let mainHeight = 8;
      let statusLight;

      switch (agent.district) {
        case 'alfred': {
          const base = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 4), mainMat);
          base.position.y = 3;
          base.castShadow = true;
          group.add(base);
          const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 10, 8), accentMat);
          spire.position.y = 9;
          spire.castShadow = true;
          group.add(spire);
          const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00d4ff }));
          beacon.position.y = 15;
          group.add(beacon);
          const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(1.5, 0.1, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.8 })
          );
          ring1.position.y = 6;
          ring1.rotation.x = Math.PI / 2;
          group.add(ring1);
          mainHeight = 16;
          break;
        }
        case 'joker': {
          const t1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9, 2.5), mainMat);
          t1.position.set(0, 4.5, 0);
          t1.rotation.z = 0.15;
          t1.rotation.x = 0.1;
          t1.castShadow = true;
          group.add(t1);
          const tent = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.5, 8), accentMat);
          tent.position.set(1.5, 8, 1.5);
          tent.castShadow = true;
          group.add(tent);
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3), mainMat);
          pole.position.set(1.5, 11, 1.5);
          group.add(pole);
          const sign = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff6600, emissiveIntensity: 0.5 })
          );
          sign.position.set(0, 9.5, 1.3);
          group.add(sign);
          mainHeight = 11;
          break;
        }
        case 'penguin': {
          for (let i = 0; i < 4; i++) {
            const c = new THREE.Mesh(
              new THREE.BoxGeometry(3, 2 + i * 0.6, 3),
              i % 2 === 0 ? mainMat : accentMat
            );
            c.position.set(0, 1 + i * 2.2, 0);
            c.castShadow = true;
            group.add(c);
          }
          const craneBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 4), mainMat);
          craneBase.position.set(2, 2, 2);
          group.add(craneBase);
          const craneArm = new THREE.Mesh(new THREE.BoxGeometry(4, 0.25, 0.25), mainMat);
          craneArm.position.set(4, 4, 2);
          group.add(craneArm);
          const craneCable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 3, 8),
            new THREE.MeshStandardMaterial({ color: 0x556677 })
          );
          craneCable.position.set(5.5, 2.5, 2);
          craneCable.rotation.z = 0.3;
          group.add(craneCable);
          mainHeight = 8;
          break;
        }
        case 'catwoman': {
          for (let i = 0; i < 4; i++) {
            const spire = new THREE.Mesh(
              new THREE.BoxGeometry(0.8, 6 + i * 2, 0.8),
              i === 1 ? accentMat : mainMat
            );
            spire.position.set((i - 1.5) * 1.2, 3 + i * 2, (i - 1.5) * 1.2);
            spire.castShadow = true;
            group.add(spire);
          }
          const plat = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 4), mainMat);
          plat.position.y = 1.2;
          group.add(plat);
          const catEars = new THREE.Mesh(
            new THREE.ConeGeometry(0.6, 1.5, 4),
            accentMat
          );
          catEars.position.set(0, 6.5, 0);
          group.add(catEars);
          mainHeight = 9;
          break;
        }
        case 'twoface': {
          for (let i = 0; i < 5; i++) {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 8, 8), mainMat);
            col.position.set(i < 2 ? -1.5 : 1.5, 4, i % 2 === 0 ? -1.5 : 1.5);
            col.castShadow = true;
            group.add(col);
          }
          const pediment = new THREE.Mesh(
            new THREE.ConeGeometry(3, 2, 4),
            mainMat
          );
          pediment.position.y = 9;
          pediment.rotation.y = Math.PI / 4;
          pediment.scale.set(1, 0.5, 1);
          pediment.castShadow = true;
          group.add(pediment);
          const coin = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 0.2, 16),
            new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.8, roughness: 0.2 })
          );
          coin.position.y = 10;
          coin.rotation.x = Math.PI / 2;
          group.add(coin);
          mainHeight = 10;
          break;
        }
        case 'riddler': {
          const positions = [
            [0, 2.5, 0], [1.6, 3.8, 0], [0, 3.8, 1.6], [-1.6, 2.5, 0], [0, 2.5, -1.6],
            [0, 5, 0], [1.6, 6.3, 0], [0, 6.3, 1.6], [-1.6, 5, 0], [0, 5, -1.6]
          ];
          positions.forEach(([px, py, pz], i) => {
            const cube = new THREE.Mesh(
              new THREE.BoxGeometry(1.2, 1.2 + i * 0.15, 1.2),
              i % 2 === 0 ? mainMat : accentMat
            );
            cube.position.set(px, py, pz);
            cube.rotation.y = i * 0.5;
            cube.castShadow = true;
            group.add(cube);
          });
          const questionMark = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.15, 8, 16, Math.PI),
            accentMat
          );
          questionMark.position.y = 7;
          questionMark.rotation.z = Math.PI / 2;
          group.add(questionMark);
          mainHeight = 7;
          break;
        }
        case 'bane': {
          const wall1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 5, 1.2), mainMat);
          wall1.position.set(0, 2.5, 0);
          wall1.castShadow = true;
          group.add(wall1);
          const wall2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5, 6.5), mainMat);
          wall2.position.set(0, 2.5, 0);
          wall2.castShadow = true;
          group.add(wall2);
          const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 6, 6), mainMat);
          tower.position.set(0, 3, 0);
          tower.castShadow = true;
          group.add(tower);
          const vent = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 1, 8),
            new THREE.MeshStandardMaterial({ color: 0x664433, metalness: 0.8 })
          );
          vent.position.set(0, 7, 0);
          vent.rotation.z = Math.PI / 2;
          group.add(vent);
          mainHeight = 7;
          break;
        }
        case 'poisonivy': {
          const dome = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ 
              color: 0x22cc44, 
              roughness: 0.5,
              transparent: true,
              opacity: 0.85
            })
          );
          dome.position.y = 0.5;
          dome.castShadow = true;
          group.add(dome);
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4, 8), accentMat);
            col.position.set(Math.cos(angle) * 2, 2.5, Math.sin(angle) * 2);
            col.castShadow = true;
            group.add(col);
            const leaf = new THREE.Mesh(
              new THREE.SphereGeometry(0.4, 8, 8),
              new THREE.MeshStandardMaterial({ color: 0x44ff66, emissive: 0x22cc44, emissiveIntensity: 0.3 })
            );
            leaf.position.set(Math.cos(angle) * 2, 4.5, Math.sin(angle) * 2);
            group.add(leaf);
          }
          mainHeight = 5;
          break;
        }
        case 'scarecrow': {
          for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const radius = 1.3;
            const spire = new THREE.Mesh(
              new THREE.ConeGeometry(0.5 + Math.random() * 0.4, 4 + Math.random() * 4, 6),
              i % 2 === 0 ? mainMat : accentMat
            );
            spire.position.set(Math.cos(angle) * radius, 2 + Math.random() * 2.5, Math.sin(angle) * radius);
            spire.rotation.z = (Math.random() - 0.5) * 0.8;
            spire.rotation.x = (Math.random() - 0.5) * 0.8;
            spire.castShadow = true;
            group.add(spire);
          }
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x997755 })
          );
          head.position.y = 5.5;
          group.add(head);
          mainHeight = 6;
          break;
        }
        case 'mrfeeze': {
          const base = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.5, 4.5), mainMat);
          base.position.y = 1.25;
          base.castShadow = true;
          group.add(base);
          for (let i = 0; i < 4; i++) {
            const block = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.5, 3.5), i % 2 === 0 ? mainMat : accentMat);
            block.position.y = 3 + i * 1.6;
            block.castShadow = true;
            group.add(block);
          }
          const iceSpike = new THREE.Mesh(new THREE.ConeGeometry(1.5, 5, 6), accentMat);
          iceSpike.position.y = 9;
          iceSpike.rotation.z = 0.25;
          iceSpike.castShadow = true;
          group.add(iceSpike);
          const iceCrystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.8, 0),
            new THREE.MeshStandardMaterial({ 
              color: 0x6699cc, 
              emissive: 0x6699cc, 
              emissiveIntensity: 0.5,
              transparent: true,
              opacity: 0.8
            })
          );
          iceCrystal.position.y = 11;
          group.add(iceCrystal);
          mainHeight = 11;
          break;
        }
        default: {
          const box = new THREE.Mesh(new THREE.BoxGeometry(4, 7, 4), mainMat);
          box.position.y = 3.5;
          box.castShadow = true;
          group.add(box);
          mainHeight = 7;
        }
      }

      const statusColor = STATUS_COLORS[agent.status] || 0xff4444;
      statusLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshBasicMaterial({ color: statusColor })
      );
      statusLight.position.y = mainHeight + 2;
      group.add(statusLight);

      const pointLight = new THREE.PointLight(statusColor, 3, 18);
      pointLight.position.y = mainHeight + 2;
      group.add(pointLight);

      const haloGeo = new THREE.RingGeometry(0.6, 0.9, 32);
      let haloColor;
      switch (agent.status) {
        case 'active':   haloColor = 0x00ff88; break;
        case 'idle':     haloColor = 0xffaa00; break;
        case 'blocked':  haloColor = 0xff8800; break;
        case 'error':    haloColor = 0xff4444; break;
        default:        haloColor = 0xff4444;
      }
      const haloMat = new THREE.MeshBasicMaterial({
        color: haloColor,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = mainHeight + 1.5;
      group.add(halo);

      const label = createLabelSprite(config.label, config.color);
      label.position.y = mainHeight + 4;
      group.add(label);

      group.position.set(pos.x, 0, pos.z);
      scene.add(group);

      return { group, statusLight, halo, config, mainHeight, agentId: agent.id };
    }

    agents.forEach((agent, index) => {
      if (index >= AGENT_POSITIONS.length) return;
      const buildingData = createDistrictBuilding(agent, index);
      buildingsMap.set(agent.id, buildingData);
    });

    const particleCount = 800;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 150;
      particlePositions[i * 3 + 1] = Math.random() * 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x4488ff,
      size: 0.15,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const particleCount2 = 400;
    const particlePositions2 = new Float32Array(particleCount2 * 3);
    for (let i = 0; i < particleCount2; i++) {
      particlePositions2[i * 3] = (Math.random() - 0.5) * 150;
      particlePositions2[i * 3 + 1] = Math.random() * 50;
      particlePositions2[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    const particleGeo2 = new THREE.BufferGeometry();
    particleGeo2.setAttribute('position', new THREE.BufferAttribute(particlePositions2, 3));
    const particleMat2 = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.1,
      transparent: true,
      opacity: 0.3,
    });
    const particles2 = new THREE.Points(particleGeo2, particleMat2);
    scene.add(particles2);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function getIntersections(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      return raycaster.intersectObjects(scene.children, true);
    }

    function findAgentFromIntersect(intersects) {
      for (const intersect of intersects) {
        let obj = intersect.object;
        while (obj) {
          if (obj.userData && obj.userData.isBuilding && obj.userData.agentId) {
            return obj.userData.agentId;
          }
          obj = obj.parent;
        }
      }
      return null;
    }

    function onClick(event) {
      const intersects = getIntersections(event);
      const agentId = findAgentFromIntersect(intersects);
      if (agentId) {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
          setSelectedAgent(agent);
          if (onAgentClick) onAgentClick(agent);
        }
      }
    }

    function onMouseMove(event) {
      const intersects = getIntersections(event);
      const agentId = findAgentFromIntersect(intersects);
      if (agentId) {
        const agent = agents.find(a => a.id === agentId);
        setHoveredAgent(agent || null);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredAgent(null);
        renderer.domElement.style.cursor = 'default';
      }
    }

    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    let frameId;
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }

      const dist = camera.position.distanceTo(controls.target);
      const targetName = controls.target.x === 0 && controls.target.z === 0 ? 'CENTER' : 'SECTOR';
      setCameraInfo({ distance: Math.round(dist), target: targetName, fps });

      const time = Date.now() * 0.003;
      const pos = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += 0.012;
        if (pos[i * 3 + 1] > 50) pos[i * 3 + 1] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0002;

      const pos2 = particleGeo2.attributes.position.array;
      for (let i = 0; i < particleCount2; i++) {
        pos2[i * 3 + 1] += 0.008;
        if (pos2[i * 3 + 1] > 50) pos2[i * 3 + 1] = 0;
      }
      particleGeo2.attributes.position.needsUpdate = true;
      particles2.rotation.y -= 0.00015;

      buildingsMap.forEach((data, agentId) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;
        if (data.statusLight) {
          const s = 1 + Math.sin(time + parseInt(agentId) * 1.5) * 0.3;
          data.statusLight.scale.setScalar(Math.max(0.7, s));
        }
        if (data.halo) {
          const pulse = agent.status === 'active'
            ? 1 + Math.sin(time + parseInt(agentId) * 1.5) * 0.25
            : agent.status === 'blocked'
              ? 1 + Math.sin(time * 3 + parseInt(agentId)) * 0.4
              : 1 + Math.sin(time * 0.5) * 0.1;
          data.halo.material.opacity = 0.3 + pulse * 0.2;
          data.halo.scale.setScalar(pulse);
        }
      });

      beacon.rotation.y += 0.015;

      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', onResize);

    const activeCount = agents.filter(a => a.status === 'active').length;
    const idleCount = agents.filter(a => a.status === 'idle').length;
    setSystemStats({
      agents: agents.length,
      active: activeCount,
      idle: idleCount,
      tasks: agents.filter(a => a.task && a.task !== 'Awaiting first asset review').length,
    });

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameId);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [agents, onAgentClick]);

  const statusLabel = { active: 'ONLINE', idle: 'IDLE', error: 'ERROR' };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0e14]">
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00d4ff 2px, #00d4ff 3px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none z-40 opacity-[0.04]" style={{ 
        backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)', 
        backgroundSize: '80px 80px',
        boxShadow: 'inset 0 0 80px rgba(0,240,255,0.08)'
      }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 h-[56px] border-b border-[#00d4ff]/20 bg-[#0a0e14]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse" />
          <div className="text-[11px] md:text-[13px] tracking-[0.2em] font-bold flex items-center gap-2">
            <span className="text-[#00d4ff]">BATCOMPUTER OS</span>
            <span className="text-[#5a6b7e]">//</span>
            <span className="text-white">ORACLE</span>
            <span className="ml-4 text-[#00ff88] hidden md:inline">STATUS: OPERATIONAL</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 text-[10px] tracking-widest">
            <span className="text-[#5a6b7e]">RAM 12%</span>
            <div className="w-12 h-[2px] bg-[#1a2332]">
              <div className="h-full bg-[#00d4ff] transition-all duration-700" style={{ width: '12%' }} />
            </div>
            <span className="text-[#5a6b7e]">CPU 8%</span>
            <div className="w-12 h-[2px] bg-[#1a2332]">
              <div className="h-full bg-[#ffb700] transition-all duration-700" style={{ width: '8%' }} />
            </div>
            <span className="text-[#5a6b7e] hidden xl:inline">DISK 62%</span>
          </div>
          <div className="text-[11px] text-[#ffb700] tracking-widest tabular-nums">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        </div>
      </div>

      {/* 3D Scene container */}
      <div ref={containerRef} className="absolute inset-0 z-[5]" />

      {/* System stats HUD */}
      <div className="absolute bottom-4 left-4 z-50 w-64">
        <div className="bg-[#1a1a25]/90 border border-[#2a2a3a] rounded-lg p-4 backdrop-blur-md">
          <div className="text-[#00d4ff] text-xs tracking-widest mb-3 font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
            SYSTEM STATUS
          </div>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#6b6b80]">AGENTS</span>
              <span className="text-[#c8c8d0] font-bold">{systemStats.agents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6b80]">ACTIVE</span>
              <span className="text-[#00ff88] font-bold">{systemStats.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6b80]">IDLE</span>
              <span className="text-[#ffaa00] font-bold">{systemStats.idle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6b80]">TASKS</span>
              <span className="text-[#c8c8d0] font-bold">{systemStats.tasks}</span>
            </div>
            <div className="h-px bg-[#2a2a3a] my-2" />
            <div className="flex justify-between">
              <span className="text-[#6b6b80]">FPS</span>
              <span className="text-[#00d4ff] font-bold">{cameraInfo.fps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Camera telemetry */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#1a1a25]/80 border border-[#2a2a3a] rounded px-4 py-2 text-[10px] text-[#6b6b80] backdrop-blur-md">
          <div className="flex items-center gap-6">
            <span className="text-[#00d4ff]/60">CAM:</span>
            <span>DIST: {cameraInfo.distance}m</span>
            <span>TARGET: {cameraInfo.target}</span>
            <span>FPS: {cameraInfo.fps}</span>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 z-50">
        <div className="bg-[#1a1a25]/80 border border-[#2a2a3a] rounded px-3 py-1.5 text-[10px] text-[#6b6b80] backdrop-blur-md">
          ORBIT: Left Drag | ZOOM: Scroll | PAN: Right Drag
        </div>
      </div>

      {/* Selected agent panel */}
      {selectedAgent && (
        <div className="absolute bottom-24 right-4 z-50 w-80">
          <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-5 backdrop-blur-md" style={{ boxShadow: '0 0 30px rgba(0,240,255,0.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: selectedAgent.status === 'active' ? '#00ff88' : selectedAgent.status === 'idle' ? '#ffaa00' : '#ff4444',
                    boxShadow: `0 0 10px ${selectedAgent.status === 'active' ? '#00ff88' : selectedAgent.status === 'idle' ? '#ffaa00' : '#ff4444'}`,
                  }}
                />
                <span className="text-[#c8c8d0] font-bold text-sm tracking-wider">
                  {selectedAgent.name.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-[#6b6b80] hover:text-[#c8c8d0] text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-[#6b6b80]">District</span>
                <span className="text-[#c8c8d0]">
                  {DISTRICT_CONFIG[selectedAgent.district]?.label || selectedAgent.district}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6b6b80]">Landmark</span>
                <span className="text-[#c8c8d0]">{selectedAgent.landmark || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6b6b80]">Status</span>
                <span
                  className="uppercase tracking-wider font-bold"
                  style={{
                    color: selectedAgent.status === 'active' ? '#00ff88' : selectedAgent.status === 'idle' ? '#ffaa00' : '#ff4444',
                  }}
                >
                  {statusLabel[selectedAgent.status] || selectedAgent.status}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6b6b80]">Current Task</span>
                <span className="text-[#c8c8d0]">{selectedAgent.task}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6b6b80]">Last Active</span>
                <span className="text-[#c8c8d0]">{selectedAgent.lastActive}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6b6b80]">Power Level</span>
                <span className="text-[#00d4ff] font-bold">{DISTRICT_CONFIG[selectedAgent.district]?.power || 0}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-[#12121a] border border-[#2a2a3a] text-[#c8c8d0] text-xs py-2 rounded hover:border-[#00d4ff]/50 hover:text-[#00d4ff] transition-all">View Logs</button>
              <button className="flex-1 bg-[#00d4ff]/10 border border-[#00d4ff]/50 text-[#00d4ff] text-xs py-2 rounded hover:bg-[#00d4ff]/20 transition-all" style={{ boxShadow: '0 0 15px rgba(0,240,255,0.2)' }}>Configure</button>
            </div>
          </div>
        </div>
      )}

      {/* Hovered agent tooltip */}
      {hoveredAgent && !selectedAgent && (
        <div className="absolute top-4 right-4 z-50 w-56">
          <div className="bg-[#1a1a25]/90 border border-[#00d4ff]/40 rounded-lg px-4 py-2 backdrop-blur-md" style={{ boxShadow: '0 0 20px rgba(0,240,255,0.2)' }}>
            <div className="text-[#c8c8d0] text-sm font-bold tracking-wider">{hoveredAgent.name.toUpperCase()}</div>
            <div className="text-[#6b6b80] text-[10px] uppercase tracking-wider">
              {DISTRICT_CONFIG[hoveredAgent.district]?.label || hoveredAgent.district}
            </div>
            <div className="text-[#00d4ff] text-[10px] mt-1">
              POWER: {DISTRICT_CONFIG[hoveredAgent.district]?.power || 0}%
            </div>
          </div>
        </div>
      )}

      {/* District list */}
      <div className="absolute top-4 left-4 z-50 w-64">
        <div className="bg-[#1a1a25]/90 border border-[#2a2a3a] rounded-lg p-4 backdrop-blur-md">
          <h3 className="text-[#00d4ff] text-xs tracking-widest mb-3 font-bold">GOTHAM DISTRICTS</h3>
          <div className="space-y-2">
            {agents.slice(0, 8).map((agent) => {
              const config = DISTRICT_CONFIG[agent.district] || {};
              return (
                <div key={agent.id} className="flex items-center gap-2 text-[10px]">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#' + (config.color || 0xffffff).toString(16).padStart(6, '0') }}
                  />
                  <span className="text-[#6b6b80]">{config.villain || agent.name}</span>
                  <span className="text-[#6b6b80]/50 ml-auto">{config.power || 0}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-14 h-14 border-l-2 border-t-2 border-[#00d4ff]/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
      <div className="absolute top-4 right-4 w-14 h-14 border-r-2 border-t-2 border-[#00d4ff]/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
      <div className="absolute bottom-4 left-4 w-14 h-14 border-l-2 border-b-2 border-[#00d4ff]/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
      <div className="absolute bottom-4 right-4 w-14 h-14 border-r-2 border-b-2 border-[#00d4ff]/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
    </div>
  );
}
