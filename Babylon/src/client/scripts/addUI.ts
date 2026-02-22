// addUI.ts - Adds UI elements for rendering type and FPS display
import { TextElement } from './view/textElement'
// import * as BABYLON from '@babylonjs/core'

// Adds a UI rectangle in the lower right corner showing the rendering type
export function addUI(renderingType: 'WebGPU' | 'WebGL', shortcuts?: string) {
  // Create CornerUI container if it doesn't exist
  let cornerUI = document.getElementById('CornerUI') as HTMLDivElement | null;
  if (!cornerUI) {
    cornerUI = document.createElement('div');
    cornerUI.id = 'CornerUI';
    cornerUI.style.position = 'fixed';
    cornerUI.style.right = '10px';
    cornerUI.style.bottom = '10px';
    cornerUI.style.display = 'flex';
    cornerUI.style.flexDirection = 'column';
    cornerUI.style.alignItems = 'flex-end';
    cornerUI.style.gap = '8px';
    cornerUI.style.zIndex = '1001';
    document.body.appendChild(cornerUI);
  }

  // Rendering type element
  const renderElem = new TextElement(`Rendering: ${renderingType}`, '10px');
  renderElem.element.style.position = 'static';
  renderElem.element.style.margin = '0';
  cornerUI.appendChild(renderElem.element);

  // Shortcuts element (if provided)
  let shortcutsElem;
  if (shortcuts) {
    shortcutsElem = new TextElement(shortcuts, '70px');
    shortcutsElem.element.style.position = 'static';
    shortcutsElem.element.style.margin = '0';
    cornerUI.appendChild(shortcutsElem.element);
  }

  // Optionally return elements for further use
  return { renderElem, shortcutsElem }
}