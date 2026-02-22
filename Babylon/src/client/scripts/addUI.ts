// addUI.ts - Adds UI elements for rendering type and shortcuts.
import { BabylonConfigurationModel } from './model/babylonConfigurationModel'
import { TextElement } from './view/textElement'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function formatLine(line: string) {
  const trimmedLine = line.trimStart()

  if (trimmedLine.startsWith('*')) {
    const bulletText = trimmedLine.slice(1).trimStart()

    return `&bull; ${escapeHtml(bulletText)}`
  }

  return `<strong>${escapeHtml(trimmedLine)}</strong>`
}

function formatBlock(lines: string[]) {
  return lines.map(formatLine).join('<br>')
}

function formatPowerPreference(
  powerPreference: BabylonConfigurationModel['powerPreference']
) {
  return powerPreference === 'high-performance'
    ? 'high'
    : powerPreference
}

function formatConfigText(configuration: BabylonConfigurationModel) {
  const lines = [
    'Config',
    `* Antialias = ${configuration.antialias}`,
    `* AdaptToDeviceRatio = ${configuration.adaptToDeviceRatio}`,
    `* PowerPreference = ${
      formatPowerPreference(configuration.powerPreference)
    }`
  ]

  return formatBlock(lines)
}

function formatRenderingText(
  renderingType: 'WebGPU' | 'WebGL',
  resolution?: string,
  fps?: number,
  targetFPS?: number
) {
  const lines = ['Rendering', `* Type = ${renderingType}`]

  if (resolution) {
    lines.push(`* Resolution = ${resolution}`)
  }

  if (typeof fps === 'number' && typeof targetFPS === 'number') {
    lines.push(`* FPS = ${fps}/${targetFPS}`)
  } else if (typeof fps === 'number') {
    lines.push(`* FPS = ${fps}`)
  }

  return formatBlock(lines)
}

function appendOverlayPanel(cornerUI: HTMLDivElement, lines: string[]) {
  const panel = new TextElement('', '70px')
  panel.setHTML(formatBlock(lines))
  panel.element.style.position = 'static'
  panel.element.style.margin = '0'
  cornerUI.appendChild(panel.element)

  return panel
}

export function addUI(
  configuration: BabylonConfigurationModel,
  renderingType: 'WebGPU' | 'WebGL',
  shortcuts?: string[],
  resolution?: string,
  runtimeInputs?: string[]
) {
  let currentResolution = resolution
  let currentFPS = 0
  let currentTargetFPS = 60
  let isVisible = true
  let cornerUI = document.getElementById('CornerUI') as
    | HTMLDivElement
    | null

  if (!cornerUI) {
    cornerUI = document.createElement('div')
    cornerUI.id = 'CornerUI'
    cornerUI.style.position = 'fixed'
    cornerUI.style.right = '10px'
    cornerUI.style.bottom = '10px'
    cornerUI.style.display = 'flex'
    cornerUI.style.flexDirection = 'column'
    cornerUI.style.alignItems = 'flex-end'
    cornerUI.style.gap = '8px'
    cornerUI.style.zIndex = '1001'
    document.body.appendChild(cornerUI)
  }

  const configElem = new TextElement('', '10px')
  configElem.setHTML(formatConfigText(configuration))
  configElem.element.style.position = 'static'
  configElem.element.style.margin = '0'
  cornerUI.appendChild(configElem.element)

  const renderElem = new TextElement('', '10px')
  renderElem.setHTML(
    formatRenderingText(
      renderingType,
      currentResolution,
      currentFPS,
      currentTargetFPS
    )
  )
  renderElem.element.style.position = 'static'
  renderElem.element.style.margin = '0'
  cornerUI.appendChild(renderElem.element)

  const shortcutsElem = shortcuts
    ? appendOverlayPanel(
      cornerUI,
      ['Debug Input', ...shortcuts.map(shortcut => `* ${shortcut}`)]
    )
    : undefined

  const runtimeInputsElem = runtimeInputs
    ? appendOverlayPanel(
      cornerUI,
      [
        'Runtime Input',
        ...runtimeInputs.map(runtimeInput => `* ${runtimeInput}`)
      ]
    )
    : undefined

  return {
    configElem,
    renderElem,
    shortcutsElem,
    runtimeInputsElem,
    toggle: () => {
      isVisible = !isVisible
      cornerUI.style.display = isVisible ? 'flex' : 'none'

      return isVisible
    },
    setVisible: (nextVisible: boolean) => {
      isVisible = nextVisible
      cornerUI.style.display = isVisible ? 'flex' : 'none'
    },
    setShortcuts: (nextShortcuts: string[]) => {
      shortcutsElem?.setHTML(
        formatBlock([
          'Debug Input',
          ...nextShortcuts.map(shortcut => `* ${shortcut}`)
        ])
      )
    },
    setConfig: () => {
      configElem.setHTML(formatConfigText(configuration))
    },
    setResolution: (nextResolution: string) => {
      currentResolution = nextResolution
      renderElem.setHTML(
        formatRenderingText(
          renderingType,
          currentResolution,
          currentFPS,
          currentTargetFPS
        )
      )
    },
    setFPS: (fps: number) => {
      currentFPS = fps
      renderElem.setHTML(
        formatRenderingText(
          renderingType,
          currentResolution,
          currentFPS,
          currentTargetFPS
        )
      )
    },
    setTargetFPS: (targetFPS: number) => {
      currentTargetFPS = targetFPS
      renderElem.setHTML(
        formatRenderingText(
          renderingType,
          currentResolution,
          currentFPS,
          currentTargetFPS
        )
      )
    }
  }
}
