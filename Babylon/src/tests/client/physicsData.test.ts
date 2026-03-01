// physicsData.test.ts - Unit tests for PhysicsData class
import { describe, it, expect } from 'vitest'
import { PhysicsData } from '../../client/scripts/model/physicsModel'

describe('PhysicsData', () => {

  // Test storing mass and restitution values
  it('should store mass and restitution values', () => {
    const data = new PhysicsData(5, 0.7)
    expect(data.mass).toBe(5)
    expect(data.restitution).toBe(0.7)
  })

  // Test default values
  it('should use default values if none provided', () => {
    const data = new PhysicsData()
    expect(data.mass).toBe(1)
    expect(data.restitution).toBe(0.9)
  })

  // Edge case: zero mass and restitution
  it('handles zero mass and restitution', () => {
    const data = new PhysicsData(0, 0)
    expect(data.mass).toBe(0)
    expect(data.restitution).toBe(0)
  })
})