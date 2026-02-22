import * as BABYLON from '@babylonjs/core'

// addInput.ts - Handles mouse click input and keyboard shortcuts for the canvas

export function addInput(canvas: HTMLCanvasElement, scene: BABYLON.Scene) {

  // Helper: Move TextElement to left of Inspector
  function updateTextElementPosition(inspectorOpen: boolean) {
    const inspectorWidth = 310; // Babylon Inspector default width
    document.querySelectorAll('.TextElement').forEach((el) => {
      if (inspectorOpen) {
        (el as HTMLElement).style.right = inspectorWidth + 'px';
      } else {
        (el as HTMLElement).style.right = '10px';
      }
    });
  }

  // Listen for click events on the canvas
  canvas.addEventListener('click', (event: MouseEvent) => {

    // Get bounding rect for canvas
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse position relative to canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Log the click position
    console.log(`Clicked at: (${x}, ${y})`);
  });

  // Listen for keyboard shortcuts (e.g., 'i' for Inspector)
  if (import.meta.env.MODE === 'development') {
    let inspectorReady = false;
    let inspectorOpen = !!localStorage.getItem('inspector');

    window.addEventListener('keydown', async ({ key }) => {
      if (key.toLowerCase() !== 'i') return;

      if (!inspectorReady) {
        await import('@babylonjs/core/Debug/debugLayer');
        await import('@babylonjs/inspector');
        inspectorReady = true;
      }

      inspectorOpen = !inspectorOpen;
      updateTextElementPosition(inspectorOpen);
      if (inspectorOpen) {
        localStorage.setItem('inspector', 'true');
        if (scene.debugLayer && typeof scene.debugLayer.show === 'function') {
          scene.debugLayer.show();
        } else {
          console.error('Babylon.js Inspector is not available or not attached to the scene.');
        }
      } else {
        localStorage.removeItem('inspector');
        if (scene.debugLayer && typeof scene.debugLayer.hide === 'function') {
          scene.debugLayer.hide();
        }
      }
    });

    if (localStorage.getItem('inspector')) {
      if (scene.debugLayer && typeof scene.debugLayer.show === 'function') {
        scene.debugLayer.show();
        inspectorOpen = true;
        updateTextElementPosition(true);
      } else {
        console.error('Babylon.js Inspector is not available or not attached to the scene.');
      }
    }
  }
}