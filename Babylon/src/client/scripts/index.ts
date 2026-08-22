// index.ts - Main entry point for Babylon.js client setup.
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import '../styles/index.css'
import { adjustLighting } from './adjustLighting'
import { addInput } from './addInput'
import { AddOrbiter } from './addOrbiter'
import { addPhysicsImposter, initPhysics } from './addPhysics'
import { addPostProcess } from './addPostProcess'
import { addUI } from './addUI'
import {
  debugPreferenceDefaults,
  getDebugInputLabels,
  readDebugPreferences,
  resetDebugPreferences,
  writeDebugPreferences
} from './debugPreferences'
import { BabylonConfigurationModel } from './model/babylonConfigurationModel'
import { OrbiterModel } from './model/orbiterModel'
import { PhysicsData } from './model/physicsModel'
import { Orbiter } from './orbiter'
import { playSound } from './playSound'
import { Tweens } from './tweens'

async function main() {
  const showLoader = false
  const canvas = document.createElement('canvas')
  document.body.append(canvas)

  if (showLoader) {
    const loaderDiv = document.createElement('div')
    loaderDiv.id = 'custom-loader'
    loaderDiv.style.position = 'fixed'
    loaderDiv.style.top = '0'
    loaderDiv.style.left = '0'
    loaderDiv.style.width = '100vw'
    loaderDiv.style.height = '100vh'
    loaderDiv.style.background = 'rgba(0,0,0,0.7)'
    loaderDiv.style.display = 'flex'
    loaderDiv.style.justifyContent = 'center'
    loaderDiv.style.alignItems = 'center'
    loaderDiv.style.zIndex = '2000'
    loaderDiv.innerHTML =
      '<span style="color:white;font-size:2em">Loading...</span>'
    document.body.appendChild(loaderDiv)
  }

  const uiContainer = document.createElement('div')
  uiContainer.style.position = 'absolute'
  uiContainer.style.right = '0'
  uiContainer.style.bottom = '0'
  uiContainer.style.zIndex = '1001'
  uiContainer.style.pointerEvents = 'none'
  canvas.style.position = 'relative'
  canvas.appendChild(uiContainer)

  function adjustUIForInspector() {
    const inspector = document.querySelector('.babylonjs-inspector') as
      | HTMLElement
      | null
    let inspectorWidth = 0

    if (inspector) {
      const canvasRect = canvas.getBoundingClientRect()
      const inspectorRect = inspector.getBoundingClientRect()
      const overlapsRightEdge =
        inspectorRect.left < canvasRect.right &&
        inspectorRect.right > canvasRect.right

      if (overlapsRightEdge) {
        inspectorWidth = inspectorRect.right - canvasRect.right
      }
    }

    uiContainer.style.right = inspectorWidth ? `${inspectorWidth}px` : '0'
    document.querySelectorAll('.info-overlay').forEach(el => {
      const infoOverlay = el as HTMLElement
      infoOverlay.style.right = inspectorWidth ? `${inspectorWidth}px` : '0'
    })
  }

  const configuration = new BabylonConfigurationModel()
  const getResolution = (
    engine: BABYLON.Engine | BABYLON.WebGPUEngine
  ) => `${engine.getRenderWidth()} x ${engine.getRenderHeight()}`
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await document.documentElement.requestFullscreen()
  }

  let engine: BABYLON.Engine | BABYLON.WebGPUEngine
  let scene: BABYLON.Scene
  let ui: ReturnType<typeof addUI>
  let AddOrbiterClass = AddOrbiter
  const orbiters: Orbiter[] = []
  const origin = BABYLON.Vector3.Zero()
  const baseSphereDiameter = 1
  const tweens = new Tweens()
  let orbiterModel = new OrbiterModel()
  const targetFramerates = [30, 60, 120]
  const storage = window.localStorage
  const debugPreferences = readDebugPreferences(storage)
  configuration.antialias = debugPreferences.antialias
  let targetFramerateIndex = debugPreferences.targetFramerateIndex
  let targetFramerate = targetFramerates[targetFramerateIndex]
  const saveDebugPreferences = () => {
    writeDebugPreferences(storage, debugPreferences)
    ui.setShortcuts(getDebugInputLabels(debugPreferences))
  }
  const debugInputLabels = getDebugInputLabels(debugPreferences)

  if (navigator.gpu) {
    engine = new BABYLON.WebGPUEngine(canvas, {
      antialias: configuration.antialias,
      adaptToDeviceRatio: configuration.adaptToDeviceRatio,
      powerPreference: configuration.powerPreference
    })
    await engine.initAsync()
    scene = new BABYLON.Scene(engine)
    ui = addUI(
      configuration,
      'WebGPU',
      debugInputLabels,
      getResolution(engine),
      [
        'Left Mouse = Move Camera',
        'F = Fullscreen',
        'C = Create Orbiter'
      ]
    )
  } else {
    engine = new BABYLON.Engine(
      canvas,
      configuration.antialias,
      {},
      configuration.adaptToDeviceRatio
    )
    scene = new BABYLON.Scene(engine)
    ui = addUI(
      configuration,
      'WebGL',
      debugInputLabels,
      getResolution(engine),
      [
        'Left Mouse = Move Camera',
        'F = Fullscreen',
        'C = Create Orbiter'
      ]
    )

    const info = document.createElement('div')
    info.className = 'info-overlay'
    info.textContent =
      'WebGPU is not available. Using WebGL. For WebGPU, use a ' +
      'compatible browser and HTTPS.'
    document.body.append(info)
    adjustUIForInspector()
  }

  const observer = new MutationObserver(() => {
    adjustUIForInspector()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  const handleResize = () => {
    engine.resize()
    ui.setResolution(getResolution(engine))
    adjustUIForInspector()
  }

  ui.setVisible(debugPreferences.hudVisible)
  ui.setTargetFPS(targetFramerate)
  window.addEventListener('resize', handleResize)

  let addOrbiter = new AddOrbiterClass(
    scene,
    origin,
    baseSphereDiameter,
    tweens,
    orbiterModel
  )

  const createOrbiter = () => {
    orbiters.push(addOrbiter.create())
    playSound('/assets/audio/Pop01.mp3')
  }

  const alpha = 0
  const beta = 0
  const radius = 5
  const target = new BABYLON.Vector3(-4, 2, 5)
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    alpha,
    beta,
    radius,
    target,
    scene
  )
  camera.setTarget(new BABYLON.Vector3(0, 1, 0))
  camera.attachControl(canvas, true)

  await Promise.all([
    BABYLON.SceneLoader.AppendAsync(
      'assets/models/glb/',
      'pixel_room.glb',
      scene
    ),
    initPhysics(scene)
  ])
  adjustLighting(scene)

  if (showLoader) {
    const loaderDiv = document.getElementById('custom-loader')
    if (loaderDiv) {
      loaderDiv.remove()
    }
  }

  for (const texture of scene.textures) {
    texture.updateSamplingMode(1)
  }

  {
    const width = 3.8
    const height = 3.8
    const subdivisions = 1
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width, height, subdivisions },
      scene
    )
    ground.position.y = -0.01
    addPhysicsImposter(
      ground,
      BABYLON.PhysicsShapeType.BOX,
      scene,
      0
    )
  }

  const spherePhysics = new PhysicsData()
  spherePhysics.mass = 2
  spherePhysics.restitution = 0.8
  {
    const segments = 32
    const diameter = 1
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      'sphere',
      { segments, diameter },
      scene
    )
    sphere.position.y = 5
    addPhysicsImposter(
      sphere,
      BABYLON.PhysicsShapeType.SPHERE,
      scene,
      spherePhysics.mass,
      spherePhysics.restitution
    )
  }

  const pipeline = addPostProcess(scene, [camera])

  addInput(canvas, scene, {
    onFullscreen: toggleFullscreen,
    onHud: () => {
      debugPreferences.hudVisible = ui.toggle()
      saveDebugPreferences()
    },
    onInspector: inspectorOpen => {
      if (debugPreferences.inspectorOpen === inspectorOpen) {
        return
      }

      debugPreferences.inspectorOpen = inspectorOpen
      saveDebugPreferences()
    },
    onOrbiter: createOrbiter,
    onAntialiasing: () => {
      configuration.antialias = !configuration.antialias
      debugPreferences.antialias = configuration.antialias
      pipeline.fxaaEnabled = configuration.antialias
      ui.setConfig()
      saveDebugPreferences()
    },
    onFramerate: () => {
      targetFramerateIndex =
        (targetFramerateIndex + 1) % targetFramerates.length
      debugPreferences.targetFramerateIndex = targetFramerateIndex
      targetFramerate = targetFramerates[targetFramerateIndex]
      ui.setTargetFPS(targetFramerate)
      saveDebugPreferences()
    },
    onRestart: () => {
      window.location.reload()
    },
    onResetDefaults: () => {
      resetDebugPreferences(storage)
      Object.assign(debugPreferences, debugPreferenceDefaults)
      configuration.antialias = debugPreferences.antialias
      pipeline.fxaaEnabled = configuration.antialias
      targetFramerateIndex = debugPreferences.targetFramerateIndex
      targetFramerate = targetFramerates[targetFramerateIndex]
      ui.setVisible(debugPreferences.hudVisible)
      ui.setConfig()
      ui.setTargetFPS(targetFramerate)
      ui.setShortcuts(getDebugInputLabels(debugPreferences))
      adjustUIForInspector()
    }
  }, {
    initialInspectorOpen: debugPreferences.inspectorOpen
  })

  let lastOrbiterTime = performance.now()

  const updateOrbiters = (deltaSeconds: number) => {
    for (let index = orbiters.length - 1; index >= 0; index -= 1) {
      if (!orbiters[index].update(deltaSeconds)) {
        orbiters.splice(index, 1)
      }
    }
  }

  scene.physicsEnabled = false
  const physicsStepMs = 1000 / 60
  let physicsAccumulatorMs = 0
  let lastPhysicsTime = performance.now()

  const advancePhysics = (now: number) => {
    physicsAccumulatorMs += now - lastPhysicsTime
    lastPhysicsTime = now

    while (physicsAccumulatorMs >= physicsStepMs) {
      scene._advancePhysicsEngineStep(physicsStepMs)
      physicsAccumulatorMs -= physicsStepMs
    }
  }

  let lastFPSUpdateTime = 0
  let renderedFrames = 0
  let lastRenderTime = 0

  engine.runRenderLoop(() => {
    const now = performance.now()
    advancePhysics(now)
    const deltaSeconds = (now - lastOrbiterTime) / 1000
    lastOrbiterTime = now
    updateOrbiters(deltaSeconds)

    const targetFrameMs = 1000 / targetFramerate

    if (now - lastRenderTime < targetFrameMs) {
      return
    }

    lastRenderTime = now
    scene.render()
    renderedFrames += 1

    if (now - lastFPSUpdateTime >= 1000) {
      const elapsedSeconds = (now - lastFPSUpdateTime) / 1000
      ui.setFPS(Math.round(renderedFrames / elapsedSeconds))
      lastFPSUpdateTime = now
      renderedFrames = 0
    }
  })
  handleResize()

  if (import.meta.hot) {
    import.meta.hot.accept('./addOrbiter.ts', module => {
      if (!module) {
        return
      }

      AddOrbiterClass = module.AddOrbiter
      addOrbiter = new AddOrbiterClass(
        scene,
        origin,
        baseSphereDiameter,
        tweens,
        orbiterModel
      )
      console.info(
        '[HMR] AddOrbiter updated. New orbiters will use the ' +
          'latest factory code.'
      )
    })

    import.meta.hot.accept('./model/orbiterModel.ts', module => {
      if (!module) {
        return
      }

      orbiterModel = new module.OrbiterModel()
      addOrbiter.setModel(orbiterModel)
      console.info(
        '[HMR] OrbiterModel updated. New orbiters will use the ' +
          'latest values.'
      )
    })
  }
}

main().catch(error => {
  console.error('[index.ts] Error in main:', error)
})
