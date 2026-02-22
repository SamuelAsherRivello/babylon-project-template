// addPostProcess.ts - Configures post-processing effects for Babylon.js scenes
import { type Camera, type Scene, DefaultRenderingPipeline } from '@babylonjs/core'

// Adds post-processing pipeline to the scene and cameras
export const addPostProcess = (scene: Scene, cameras: Camera[]) => {
  const hdr = true
  const pipeline = new DefaultRenderingPipeline('standardPipeline', hdr, scene, cameras)

  // Enable MSAA for anti-aliasing
  pipeline.samples = 4

  // Enable FXAA
  pipeline.fxaaEnabled = true

  // Enable image processing
  pipeline.imageProcessingEnabled = true
  pipeline.imageProcessing.contrast = 1
  pipeline.imageProcessing.exposure = 1

  // Enable tonemapping
  pipeline.imageProcessing.toneMappingEnabled = true

  // Enable bloom effect
  pipeline.bloomEnabled = true
  pipeline.bloomThreshold = 0.2
  pipeline.bloomWeight = 0.1
  pipeline.bloomKernel = 64
  pipeline.bloomScale = 0.5

  // Configure depth of field (disabled by default)
  pipeline.depthOfFieldEnabled = false
  // distance of the current focus point from the camera in millimeters considering 1 scene unit is 1 meter
  pipeline.depthOfField.focusDistance = 2000
  // focal length of the camera in millimeters  
  pipeline.depthOfField.focalLength = 40
  // aka F number of the camera defined in stops as it would be on a physical device
  pipeline.depthOfField.fStop = 1.4
}