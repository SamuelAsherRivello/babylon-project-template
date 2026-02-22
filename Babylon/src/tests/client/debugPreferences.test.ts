import { describe, expect, it } from 'vitest'
import {
  debugPreferenceDefaults,
  getDebugInputLabels,
  readDebugPreferences,
  resetDebugPreferences,
  writeDebugPreferences
} from '../../client/scripts/debugPreferences'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  public get length() {
    return this.values.size
  }

  public clear() {
    this.values.clear()
  }

  public getItem(key: string) {
    return this.values.get(key) ?? null
  }

  public key(index: number) {
    return Array.from(this.values.keys())[index] ?? null
  }

  public removeItem(key: string) {
    this.values.delete(key)
  }

  public setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('debugPreferences', () => {
  it('uses the original debug defaults when nothing is stored', () => {
    expect(readDebugPreferences(new MemoryStorage())).toEqual(
      debugPreferenceDefaults
    )
  })

  it('round-trips persisted debug preferences from storage', () => {
    const storage = new MemoryStorage()
    const preferences = {
      hudVisible: false,
      inspectorOpen: true,
      antialias: false,
      targetFramerateIndex: 2
    }

    writeDebugPreferences(storage, preferences)

    expect(readDebugPreferences(storage)).toEqual(preferences)
  })

  it('falls back to defaults for invalid persisted data', () => {
    const storage = new MemoryStorage()
    storage.setItem('babylon.debugPreferences.v1', '{"antialias":"bad"}')

    expect(readDebugPreferences(storage)).toEqual(debugPreferenceDefaults)
  })

  it('removes persisted debug preferences when reset', () => {
    const storage = new MemoryStorage()
    writeDebugPreferences(storage, {
      hudVisible: false,
      inspectorOpen: true,
      antialias: false,
      targetFramerateIndex: 2
    })

    resetDebugPreferences(storage)

    expect(readDebugPreferences(storage)).toEqual(debugPreferenceDefaults)
  })

  it('marks disk-backed debug inputs changed from defaults', () => {
    const labels = getDebugInputLabels({
      hudVisible: false,
      inspectorOpen: true,
      antialias: false,
      targetFramerateIndex: 2
    })

    expect(getDebugInputLabels(debugPreferenceDefaults)).toEqual([
      '1 = Toggle HUD',
      '2 = Toggle Inspector',
      '3 = Toggle Antialias',
      '4 = Toggle FPS',
      '5 = Reset to Defaults (Disk)',
      '6 = Restart Scene'
    ])
    expect(labels).toEqual([
      '1 = Toggle HUD *',
      '2 = Toggle Inspector *',
      '3 = Toggle Antialias *',
      '4 = Toggle FPS *',
      '5 = Reset to Defaults (Disk)',
      '6 = Restart Scene'
    ])
  })
})
