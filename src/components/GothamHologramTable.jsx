import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import useStore from '../store/useStore';
import BatcavePanel from './BatcavePanel';
import BatcaveHud from './BatcaveHud';
import BatcaveScanlines from './BatcaveScanlines';
import BatcaveCornerBrackets from './BatcaveCornerBrackets';
import BatcaveStatusLight from './BatcaveStatusLight';

const DISTRICT_CONFIG = {
  alfred: { color: '#00d4ff', label: 'WAYNE MANOR', villain: 'ALFRED', power: 100 },
  joker: { color: '#ff6600', label: 'AMUSEMENT MILE', villain: 'JOKER', power: 85 },
  penguin: { color: '#556677', label: 'ICEBERG LOUNGE', villain: 'PENGUIN', power: 72 },
  catwoman: { color: '#ff3366', label: 'EAST END', villain: 'CATWOMAN', power: 68 },
  twoface: { color: '#888899', label: 'GOTHAM COURTHOUSE', villain: 'TWO-FACE', power: 55 },
  riddler: { color: '#33ff99', label: 'GOTHAM LIBRARY', villain: 'RIDDLER', power: 90 },
  bane: { color: '#664433', label: 'BLACKGATE PRISON', villain: 'BANE', power: 95 },
  poisonivy: { color: '#22cc44', label: 'BOTANICAL GARDENS', villain: 'IVY', power: 78 },
  scarecrow: { color: '#997755', label: 'ARKHAM ASYLUM', villain: 'SCARECROW', power: 82 },
  mrfeeze: { color: '#6699cc', label: 'CRYO-LAB', villain: 'MR. FREEZE', power: 88 },
  clayface: { color: '#aa8855', label: 'CRIME ALLEY', villain: 'CLAYFACE', power: 45 },
  harley: { color: '#ff4488', label: 'CARNIVAL DISTRICT', villain: 'HARLEY QUINN', power: 70 },
};

const AGENT_POSITIONS = [
  { x: 28, z: 0 }, { x: 19.8, z: 19.8 }, { x: 0, z: 28 }, { x: -19.8, z: 19.8 },
  { x: -28, z: 0 }, { x: -19.8, z: -19.8 }, { x: 0, z: -28 }, { x: 19.8, z: -19.8 },
];

const STATUS_COLORS = { active: 0x00ff88, idle: 0xffaa00, blocked: 0xff8800, error: 0xff4444 };

function createLabelSprite(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10, 14, 20, 0.92)';
  ctx.fillRect(0, 0, 256, 64);
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(8, 2, 1);
  return sprite;
}

export default function GothamHologramTable({ onAgentClick }) {
  const containerRef = useRef(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [cameraInfo, setCameraInfo] = useState({ distance: 0, target: 'CENTER', fps: 60 });
  const [systemStats, setSystemStats] = useState({ agents: 0, active: 0, idle: 0, tasks: 0 });
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const { agents } = useStore();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x0a0e14, 0.008);

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

    scene.add(new THREE.AmbientLight(0x1a1a2e, 0.8));

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

    scene.add(new THREE.HemisphereLight(0x0a0a1a, 0x000000, 0.4));

    const groundGeo = new THREE.PlaneGeometry(250, 250);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: 0.95, metalness: 0.1, transparent: true, opacity: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(250, 60, 0x00d4ff, 0x0f1a24);
    grid.position.y = 0.01;
    scene.add(grid);

    function createRoad(x1, z1, x2, z2) {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.sqrt(dx * dx + dz * dz);
      const roadGeo = new THREE.PlaneGeometry(3, length);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x0f1a24, roughness: 0.9, transparent: true, opacity: 0.5 });
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
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, roughness: 0.1, metalness: 0.95, emissive: 0x00d4ff, emissiveIntensity: 0.6 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 15;
    tower.castShadow = true;
    towerGroup.add(tower);

    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6 + i * 0.2, 0.1, 8, 20), new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.9, transparent: true, opacity: 0.8 }));
      ring.position.y = 5 + i * 5;
      ring.rotation.x = Math.PI / 2;
      towerGroup.add(ring);
    }

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 20), new THREE.MeshBasicMaterial({ color: 0x00d4ff }));
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
      let mainHeight;

      const mainMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(config.color), roughness: 0.4, metalness: 0.5, transparent: true, opacity: 0.92 });
      const accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(config.color), roughness: 0.3, metalness: 0.6, emissive: new THREE.Color(config.color), emissiveIntensity: 0.3, transparent: true, opacity: 0.92 });

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
      const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({ color: statusColor }));
      statusLight.position.y = mainHeight + 2;
      group.add(statusLight);

      const pointLight = new THREE.PointLight(statusColor, 3, 18);
      pointLight.position.y = mainHeight + 2;
      group.add(pointLight);

      const haloGeo = new THREE.RingGeometry(0.8, 1.3, 32);
      let haloColor;
      switch (agent.status) {
        case 'active':   haloColor = 0x00ff88; break;
        case 'idle':     haloColor = 0xffaa00; break;
        case 'blocked':  haloColor = 0xff8800; break;
        case 'error':    haloColor = 0xff4444; break;
        default:        haloColor = 0xff4444;
      }
      const haloMat = new THREE.MeshBasicMaterial({ color: haloColor, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
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
    const particleMat = new THREE.PointsMaterial({ color: 0x4488ff, size: 0.15, transparent: true, opacity: 0.5 });
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
    const particleMat2 = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.1, transparent: true, opacity: 0.3 });
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
          const s = agent.status === 'active'
            ? 1 + Math.sin(time + parseInt(agentId) * 1.5) * 0.4
            : agent.status === 'blocked'
              ? 1 + Math.sin(time * 3 + parseInt(agentId)) * 0.5
              : 1 + Math.sin(time * 0.5) * 0.15;
          data.statusLight.scale.setScalar(Math.max(0.7, s));
        }
        if (data.halo) {
          const haloPulse = agent.status === 'active'
            ? 1 + Math.sin(time + parseInt(agentId) * 1.5) * 0.25
            : agent.status === 'blocked'
              ? 1 + Math.sin(time * 3 + parseInt(agentId)) * 0.4
              : 1 + Math.sin(time * 0.5) * 0.1;
          data.halo.material.opacity = 0.3 + haloPulse * 0.2;
          data.halo.scale.setScalar(haloPulse);
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
      <BatcaveScanlines />
      <div className="absolute inset-0 pointer-events-none z-40 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)', backgroundSize: '80px 80px', boxShadow: 'inset 0 0 80px rgba(0,240,255,0.08)' }} />

      <div ref={containerRef} className="absolute inset-0 z-[5]" />

      <BatcaveCornerBrackets />

      <div className="absolute top-4 left-4 z-50">
        <BatcavePanel title="GOTHAM HOLOGRAM TABLE" glow className="w-72">
          <BatcaveHud
            items={[
              { label: 'TABLE STATUS', value: 'OPERATIONAL', color: 'text-gotham-success' },
              { label: 'HOLOGRAM RES', value: '8K', color: 'text-batCyan' },
              { label: 'RENDER MODE', value: 'WIREFRAME + SOLID' },
              { label: 'PROJECTION', value: '360° HOLOGRAPHIC' },
              { label: 'AGENTS MAPPED', value: `${agents.length}`, color: 'text-batCyan' },
              { label: 'ACTIVE LINKS', value: `${systemStats.active}`, color: 'text-gotham-success' },
              { label: 'IDLE NODES', value: `${systemStats.idle}`, color: 'text-gotham-warning' },
              { label: 'PENDING TASKS', value: `${systemStats.tasks}` },
            ]}
          />
          <div className="mt-4 flex items-center gap-2">
            <BatcaveStatusLight status={agents.some(a => a.status === 'active') ? 'active' : 'idle'} />
            <span className="text-[10px] text-gotham-muted tracking-wider font-hud uppercase">Oracle Network</span>
          </div>
        </BatcavePanel>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <BatcavePanel title="CAMERA TELEMETRY" glow className="w-64">
          <BatcaveHud
            items={[
              { label: 'DISTANCE', value: `${cameraInfo.distance}m` },
              { label: 'TARGET', value: cameraInfo.target, color: 'text-batCyan' },
              { label: 'FPS', value: cameraInfo.fps, color: 'text-gotham-success' },
              { label: 'TIME', value: time, color: 'text-gotham-warning' },
            ]}
          />
        </BatcavePanel>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <BatcavePanel className="px-6 py-3">
          <div className="flex items-center gap-6 text-[10px] tracking-wider font-hud">
            <span className="text-batCyan/60">ORBIT:</span>
            <span>Left Drag</span>
            <span className="text-batCyan/60">ZOOM:</span>
            <span>Scroll</span>
            <span className="text-batCyan/60">PAN:</span>
            <span>Right Drag</span>
          </div>
        </BatcavePanel>
      </div>

      <div className="absolute bottom-4 right-4 z-50">
        <BatcavePanel title="SYSTEM" className="w-56">
          <BatcaveHud
            items={[
              { label: 'BATCOMPUTER OS', value: 'ORACLE v9.2.1' },
              { label: 'NETWORK', value: 'SECURE', color: 'text-gotham-success' },
              { label: 'UPTIME', value: '99.98%' },
              { label: 'LATENCY', value: '12ms', color: 'text-batCyan' },
            ]}
          />
        </BatcavePanel>
      </div>

      {selectedAgent && (
        <motion.div
          className="absolute bottom-24 right-4 z-50 w-80"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <BatcavePanel title={selectedAgent.name.toUpperCase()} glow headerAction={<button onClick={() => setSelectedAgent(null)} className="text-gotham-muted hover:text-gotham-text text-xs transition-colors">✕</button>}>
            <BatcaveHud
              items={[
                { label: 'DISTRICT', value: DISTRICT_CONFIG[selectedAgent.district]?.label || selectedAgent.district },
                { label: 'LANDMARK', value: selectedAgent.landmark || 'N/A' },
                { label: 'STATUS', value: statusLabel[selectedAgent.status] || selectedAgent.status, color: selectedAgent.status === 'active' ? 'text-gotham-success' : selectedAgent.status === 'idle' ? 'text-gotham-warning' : 'text-gotham-danger' },
                { label: 'TASK', value: selectedAgent.task },
                { label: 'LAST ACTIVE', value: selectedAgent.lastActive },
                { label: 'POWER', value: `${DISTRICT_CONFIG[selectedAgent.district]?.power || 0}%`, color: 'text-batCyan' },
              ]}
            />
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-gotham-dark border border-gotham-border text-gotham-text text-xs py-2 rounded hover:border-batCyan/50 hover:text-batCyan transition-all">View Logs</button>
              <button className="flex-1 bg-batCyan/10 border border-batCyan/50 text-batCyan text-xs py-2 rounded hover:bg-batCyan/20 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">Configure</button>
            </div>
          </BatcavePanel>
        </motion.div>
      )}

      {hoveredAgent && !selectedAgent && (
        <motion.div
          className="absolute top-4 right-4 z-50 w-56"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <BatcavePanel title={hoveredAgent.name.toUpperCase()} glow>
            <BatcaveHud
              items={[
                { label: 'SECTOR', value: DISTRICT_CONFIG[hoveredAgent.district]?.label || hoveredAgent.district },
                { label: 'POWER', value: `${DISTRICT_CONFIG[hoveredAgent.district]?.power || 0}%`, color: 'text-batCyan' },
              ]}
            />
          </BatcavePanel>
        </motion.div>
      )}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <BatcavePanel className="px-6 py-2 border border-batCyan/20">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-batCyan shadow-[0_0_10px_#00d4ff]" />
            <span className="text-batCyan text-xs tracking-[0.3em] font-bold uppercase">BatComputer OS // Oracle</span>
            <span className="text-gotham-muted text-[10px] tracking-wider">STATUS: OPERATIONAL</span>
            <span className="text-gotham-success text-[10px] tracking-wider ml-4">{time}</span>
          </div>
        </BatcavePanel>
      </div>
    </div>
  );
}
