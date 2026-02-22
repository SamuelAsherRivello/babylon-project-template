// textElement.ts - Reusable styled text UI element for overlays
import '../../styles/view/textElement.css'

// TextElement class creates and manages a styled text div
export class TextElement {
    public element: HTMLDivElement; // Expose the div for external access
    private div: HTMLDivElement

    // Creates a new TextElement with initial text and position
    constructor(initialText: string, bottom: string = '10px', container?: HTMLElement) {
        this.div = document.createElement('div')
        this.element = this.div // Assign public property
        this.div.className = 'TextElement'
        this.div.style.bottom = bottom
        this.div.textContent = initialText

        // Append to provided container or fallback to document.body
        if (container instanceof HTMLElement) {
            container.appendChild(this.div)
        } else {
            document.body.appendChild(this.div)
        }
    }

    // Updates the text content
    setText(text: string) {
        this.div.textContent = text
    }

    // Removes the element from the DOM
    remove() {
        this.div.remove()
    }
}