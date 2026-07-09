import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { START_CITY } from '../config/cities';

const GLOBE_RADIUS = 1.85;

function latLngToVector3(lat, lng, radius = GLOBE_RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createLabelSprite(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 156;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(210, 78);
  context.rotate(text.length % 2 === 0 ? -0.045 : 0.04);
  context.translate(-210, -78);
  context.fillStyle = 'rgba(95, 83, 102, 0.18)';
  roundRect(context, 54, 42, 312, 72, 22);
  context.fill();
  context.fillStyle = 'rgba(255, 250, 239, 0.94)';
  context.strokeStyle = color;
  context.lineWidth = 6;
  roundRect(context, 47, 34, 322, 72, 22);
  context.fill();
  context.stroke();
  context.font = '900 39px "Comic Neue", "Nunito", system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'rgba(255, 255, 255, 0.9)';
  context.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  context.lineWidth = 8;
  context.lineJoin = 'round';
  context.strokeText(text, 210, 72);
  context.fillStyle = '#38243f';
  context.fillText(text, 210, 72);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.02, 0.38, 1);
  return sprite;
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.quadraticCurveTo(x + width, y + 2, x + width - radius, y);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width - 2, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height - 2, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x + 2, y, x + radius, y);
  context.closePath();
}

function createPinSprite({ isStart, found }) {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const context = canvas.getContext('2d');
  const fill = isStart ? '#ffb7d5' : found ? '#bdebcf' : '#fff176';
  const stroke = isStart ? '#d96a96' : '#8a69d6';
  context.translate(80, 76);
  context.rotate(isStart ? -0.12 : 0.14);
  context.shadowColor = 'rgba(255, 183, 213, 0.65)';
  context.shadowBlur = 22;
  context.fillStyle = fill;
  context.strokeStyle = stroke;
  context.lineWidth = 8;
  context.lineJoin = 'round';

  if (isStart) {
    context.beginPath();
    context.moveTo(0, -48);
    context.bezierCurveTo(36, -48, 52, -18, 36, 14);
    context.quadraticCurveTo(22, 40, 0, 64);
    context.quadraticCurveTo(-22, 40, -36, 14);
    context.bezierCurveTo(-52, -18, -36, -48, 0, -48);
    context.closePath();
  } else {
    context.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? 48 : 23;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
  }

  context.fill();
  context.stroke();
  context.shadowBlur = 0;
  context.fillStyle = 'rgba(255, 255, 255, 0.85)';
  context.beginPath();
  context.arc(isStart ? -10 : -8, isStart ? -18 : -14, isStart ? 12 : 9, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(isStart ? 0.32 : 0.38, isStart ? 0.32 : 0.38, 1);
  return sprite;
}

function createRouteLine(from, to) {
  const points = [];
  for (let i = 0; i <= 32; i += 1) {
    const t = i / 32;
    const point = from.clone().lerp(to, t).normalize().multiplyScalar(GLOBE_RADIUS + 0.055 + Math.sin(t * Math.PI) * 0.12);
    points.push(point);
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineDashedMaterial({
    color: '#fff6df',
    dashSize: 0.05,
    gapSize: 0.04,
    linewidth: 1,
    transparent: true,
    opacity: 0.72,
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

export default function GlobeMap({ destinations, found, onSelect }) {
  const mountRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const foundRef = useRef(found);

  useEffect(() => {
    onSelectRef.current = onSelect;
    foundRef.current = found;
  }, [onSelect, found]);

  const allPoints = useMemo(() => [START_CITY, ...destinations], [destinations]);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.55);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeMaterial = new THREE.MeshStandardMaterial({
      color: '#aeeaf2',
      roughness: 0.96,
      metalness: 0.02,
      emissive: '#7ed6df',
      emissiveIntensity: 0.12,
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64), globeMaterial);
    globeGroup.add(globe);

    const watercolorShade = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.006, 64, 64),
      new THREE.MeshBasicMaterial({
        color: '#fff6df',
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
      })
    );
    watercolorShade.scale.set(0.98, 1.03, 1);
    watercolorShade.rotation.z = 0.25;
    globeGroup.add(watercolorShade);

    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 48, 48),
      new THREE.MeshBasicMaterial({ color: '#fff6df', transparent: true, opacity: 0.1, wireframe: true })
    );
    globeGroup.add(cloud);

    const oceanLines = new THREE.Group();
    for (let i = -60; i <= 60; i += 30) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(Math.cos(THREE.MathUtils.degToRad(i)) * GLOBE_RADIUS, 0.0025, 6, 96),
        new THREE.MeshBasicMaterial({ color: '#fff6df', transparent: true, opacity: 0.2 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = Math.sin(THREE.MathUtils.degToRad(i)) * GLOBE_RADIUS;
      oceanLines.add(ring);
    }
    globeGroup.add(oceanLines);

    const ambient = new THREE.AmbientLight('#fff6df', 2.55);
    const key = new THREE.DirectionalLight('#ffd7c2', 2.7);
    key.position.set(3, 4, 5);
    scene.add(ambient, key);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clickablePins = [];
    const animatedMarkers = [];

    const startPosition = latLngToVector3(START_CITY.lat, START_CITY.lng, GLOBE_RADIUS + 0.04);
    destinations.forEach((destination) => {
      const destinationPosition = latLngToVector3(destination.lat, destination.lng, GLOBE_RADIUS + 0.04);
      globeGroup.add(createRouteLine(startPosition, destinationPosition));
    });

    allPoints.forEach((point) => {
      const isStart = point.id === START_CITY.id;
      const isFound = Boolean(foundRef.current[point.id]);
      const position = latLngToVector3(point.lat, point.lng, GLOBE_RADIUS + 0.105);
      const pinColor = isStart ? '#ffb7d5' : '#fff176';
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(isStart ? 0.18 : 0.22, 24, 24),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      pin.position.copy(position);
      pin.userData.city = point;
      globeGroup.add(pin);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(isStart ? 0.16 : 0.2, 24, 24),
        new THREE.MeshBasicMaterial({ color: pinColor, transparent: true, opacity: isStart ? 0.18 : 0.25 })
      );
      halo.position.copy(latLngToVector3(point.lat, point.lng, GLOBE_RADIUS + 0.045));
      globeGroup.add(halo);

      const sticker = createPinSprite({ isStart, found: isFound });
      sticker.position.copy(position);
      sticker.userData.baseScale = sticker.scale.x;
      globeGroup.add(sticker);
      animatedMarkers.push({ halo, sticker, offset: isStart ? 0 : animatedMarkers.length * 0.7 });

      const label = createLabelSprite(isStart ? 'Start' : point.name, isStart ? '#ffb7d5' : '#c9b6ff');
      label.position.copy(latLngToVector3(point.lat, point.lng, GLOBE_RADIUS + 0.52));
      globeGroup.add(label);

      if (!isStart) clickablePins.push(pin);
    });

    globeGroup.rotation.y = -1.05;
    globeGroup.rotation.x = 0.28;

    let isDragging = false;
    let dragStarted = false;
    let previous = { x: 0, y: 0 };
    let animationFrame;

    function resize() {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    }

    function setPointer(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function handlePointerDown(event) {
      isDragging = true;
      dragStarted = false;
      previous = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event) {
      if (!isDragging) return;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) dragStarted = true;
      globeGroup.rotation.y += dx * 0.008;
      globeGroup.rotation.x += dy * 0.006;
      globeGroup.rotation.x = THREE.MathUtils.clamp(globeGroup.rotation.x, -1.15, 1.15);
      previous = { x: event.clientX, y: event.clientY };
    }

    function handlePointerUp(event) {
      isDragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
      if (dragStarted) return;
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const [hit] = raycaster.intersectObjects(clickablePins, false);
      if (hit?.object?.userData.city) {
        onSelectRef.current(hit.object.userData.city);
      }
    }

    function animate() {
      animationFrame = requestAnimationFrame(animate);
      const time = performance.now() * 0.002;
      if (!isDragging) {
        globeGroup.rotation.y += 0.0012;
        cloud.rotation.y += 0.0009;
      }
      animatedMarkers.forEach(({ halo, sticker, offset }) => {
        const pulse = 1 + Math.sin(time + offset) * 0.12;
        halo.scale.setScalar(pulse);
        sticker.scale.setScalar(sticker.userData.baseScale * (1 + Math.sin(time + offset) * 0.035));
      });
      renderer.render(scene, camera);
    }

    resize();
    animate();

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [allPoints]);

  return (
    <div className="globe-frame">
      <div ref={mountRef} className="globe-canvas" aria-label="Draggable 3D globe with destination points" />
      <button className="globe-hint" type="button">Let's begin with Start point!</button>
    </div>
  );
}
