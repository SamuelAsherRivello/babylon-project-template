// index.ts - Main entry point for Babylon.js client setup
import '../styles/index.css'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import { initPhysics, addPhysicsImposter } from './addPhysics'
import { PhysicsData } from './model/physicsModel'
import { addPostProcess } from './addPostProcess'
import { addInput } from './addInput'
import { addUI } from './addUI'
// import { TextElement } from './view/textElement'

async function main() {
  // Custom loader control
  const SHOW_LOADER = false; // Set to true to enable loader

  // Create and add canvas to the DOM
  const canvas = document.createElement('canvas')
  document.body.append(canvas)

  // Optionally show loader UI
  if (SHOW_LOADER) {
    const loaderDiv = document.createElement('div');
    loaderDiv.id = 'custom-loader';
    loaderDiv.style.position = 'fixed';
    loaderDiv.style.top = '0';
    loaderDiv.style.left = '0';
    loaderDiv.style.width = '100vw';
    loaderDiv.style.height = '100vh';
    loaderDiv.style.background = 'rgba(0,0,0,0.7)';
    loaderDiv.style.display = 'flex';
    loaderDiv.style.justifyContent = 'center';
    loaderDiv.style.alignItems = 'center';
    loaderDiv.style.zIndex = '2000';
    loaderDiv.innerHTML = '<span style="color:white;font-size:2em">Loading...</span>';
    document.body.appendChild(loaderDiv);
  }

  // Create a UI container for overlays, positioned relative to the canvas
  const uiContainer = document.createElement('div')
  uiContainer.style.position = 'absolute'
  uiContainer.style.right = '0'
  uiContainer.style.bottom = '0'
  uiContainer.style.zIndex = '1001'
  uiContainer.style.pointerEvents = 'none'
  // Position UI container relative to canvas
  canvas.style.position = 'relative'
  canvas.appendChild(uiContainer)

  // Helper: Adjust UI overlays when Inspector is open and overlapping canvas
  function adjustUIForInspector() {
    const inspector = document.querySelector('.babylonjs-inspector') as HTMLElement | null
    let inspectorWidth = 0
    if (inspector) {
      // Check if Inspector overlaps canvas
      const canvasRect = canvas.getBoundingClientRect()
      const inspectorRect = inspector.getBoundingClientRect()
      // If Inspector overlaps canvas right edge, offset UI
      if (inspectorRect.left < canvasRect.right && inspectorRect.right > canvasRect.right) {
        inspectorWidth = inspectorRect.right - canvasRect.right
      }
    }
    uiContainer.style.right = inspectorWidth ? `${inspectorWidth}px` : '0'
    // Move info overlays as well
    document.querySelectorAll('.info-overlay').forEach(el => {
      (el as HTMLElement).style.right = inspectorWidth ? `${inspectorWidth}px` : '0'
    })
  }

  // WebGPU requires HTTPS. If unavailable, fallback to WebGL and notify user.
  const antialias = true
  const adaptToDeviceRatio = true

  let engine: BABYLON.Engine | BABYLON.WebGPUEngine
  let scene: BABYLON.Scene

  if (navigator.gpu) {
    engine = new BABYLON.WebGPUEngine(canvas, { antialias, adaptToDeviceRatio })
    await (engine as BABYLON.WebGPUEngine).initAsync()
    scene = new BABYLON.Scene(engine)
    addUI('WebGPU', 'Shortcuts: I = Inspector')
  } else {
    engine = new BABYLON.Engine(canvas, antialias, {}, adaptToDeviceRatio)
    scene = new BABYLON.Scene(engine)
    addUI('WebGL', 'Shortcuts: i = Inspector')
    const info = document.createElement('div')
    info.className = 'info-overlay'
    info.textContent = 'WebGPU is not available. Using WebGL. For WebGPU, use a compatible browser and HTTPS.'
    document.body.append(info)
    adjustUIForInspector()
  }

  // Use MutationObserver to watch for Inspector visibility changes
  const observer = new MutationObserver(() => {
    adjustUIForInspector()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  // Also adjust overlays on window resize
  window.addEventListener('resize', adjustUIForInspector)

  // Add input handlers (mouse + keyboard shortcuts)
  addInput(canvas, scene)

  // Camera setup
  const alpha = 0
  const beta = 0
  const radius = 5
  const target = new BABYLON.Vector3(-4, 2, 5)
  const camera = new BABYLON.ArcRotateCamera('camera', alpha, beta, radius, target, scene)
  camera.setTarget(new BABYLON.Vector3(0, 1, 0))
  camera.attachControl(canvas, true)

  await Promise.all([
    BABYLON.SceneLoader.AppendAsync('assets/glb/', 'pixel_room.glb', scene),
    initPhysics(scene)
  ])

  // Remove loader UI if present
  if (SHOW_LOADER) {
    const loaderDiv = document.getElementById('custom-loader');
    if (loaderDiv) loaderDiv.remove();
  }

  for (const texture of scene.textures) {
    texture.updateSamplingMode(1)
  }

  // Ground setup
  {
    const width = 3.8
    const height = 3.8
    const subdivisions = 1
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width, height, subdivisions }, scene)
    ground.position.y = -0.01
    addPhysicsImposter(ground, BABYLON.PhysicsShapeType.BOX, scene, 0)
  }

  // Sphere setup
  const spherePhysics = new PhysicsData(2, 0.8)
  {
    const segments = 32
    const diameter = 1
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { segments, diameter }, scene)
    sphere.position.y = 5
    addPhysicsImposter(sphere, BABYLON.PhysicsShapeType.SPHERE, scene, spherePhysics.mass, spherePhysics.restitution)
  }

  addPostProcess(scene, [camera])


  engine.runRenderLoop(() => scene.render())
}

main().catch(e => console.error('[index.ts] Error in main:', e))