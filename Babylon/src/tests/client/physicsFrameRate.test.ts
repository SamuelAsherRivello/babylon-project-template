import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('physics frame-rate independence', () => {
  it('uses a fixed physics timestep', () => {
    const source = readFileSync(
      resolve('src/client/scripts/addPhysics.ts'),
      'utf8'
    )

    expect(source).toContain('setTimeStep(1 / 60)')
  })

  it('steps physics before any render-fps throttle', () => {
    const source = readFileSync(
      resolve('src/client/scripts/index.ts'),
      'utf8'
    )
    const physicsStepIndex = source.indexOf('advancePhysics(now)')
    const renderThrottleIndex = source.indexOf(
      'if (now - lastRenderTime < targetFrameMs)'
    )

    expect(source).toContain('scene.physicsEnabled = false')
    expect(source).toContain('_advancePhysicsEngineStep')
    expect(physicsStepIndex).toBeGreaterThan(-1)
    expect(renderThrottleIndex).toBeGreaterThan(-1)
    expect(physicsStepIndex).toBeLessThan(renderThrottleIndex)
    expect(source).toContain('scene.render()')
  })

  it('updates orbiters before any render-fps throttle', () => {
    const source = readFileSync(
      resolve('src/client/scripts/index.ts'),
      'utf8'
    )
    const orbiterUpdateIndex = source.indexOf('updateOrbiters(deltaSeconds)')
    const renderThrottleIndex = source.indexOf(
      'if (now - lastRenderTime < targetFrameMs)'
    )

    expect(source).not.toContain('scene.onBeforeRenderObservable.add')
    expect(source).toContain('const updateOrbiters = ')
    expect(orbiterUpdateIndex).toBeGreaterThan(-1)
    expect(renderThrottleIndex).toBeGreaterThan(-1)
    expect(orbiterUpdateIndex).toBeLessThan(renderThrottleIndex)
  })
})
