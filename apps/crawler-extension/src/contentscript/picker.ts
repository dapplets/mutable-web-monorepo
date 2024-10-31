export class Picker {
  currentElement: HTMLElement | null = null
  overlay: HTMLDivElement | null = null
  pickerCallback: ((el: HTMLElement | null) => void) | null = null

  pickElement(): Promise<string | null> {
    return new Promise<string | null>((res) => {
      this.pickerCallback = (el: HTMLElement | null) => {
        res(el ? el.outerHTML : null)
      }
      this._createOverlay()

      document.addEventListener('mousemove', this._onMouseMove)
      document.addEventListener('click', this._onClick)
      document.addEventListener('keydown', this._onKeyDown)
    })
  }

  private _disablePicker() {
    if (this.overlay) {
      document.body.removeChild(this.overlay)
      this.overlay = null
    }
    document.removeEventListener('mousemove', this._onMouseMove)
    document.removeEventListener('click', this._onClick)
    document.removeEventListener('keydown', this._onKeyDown)
  }

  private _createOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.style.position = 'absolute'
    this.overlay.style.pointerEvents = 'none'
    this.overlay.style.backgroundColor = 'rgba(0, 120, 215, 0.5)'
    this.overlay.style.border = '2px solid rgba(0, 120, 215, 0.9)'
    this.overlay.style.zIndex = '999999'
    document.body.appendChild(this.overlay)
  }

  private _updateOverlay(element: HTMLElement | null) {
    if (!element || !this.overlay) return
    const rect = element.getBoundingClientRect()
    this.overlay.style.width = `${rect.width}px`
    this.overlay.style.height = `${rect.height}px`
    this.overlay.style.left = `${rect.left + window.scrollX}px`
    this.overlay.style.top = `${rect.top + window.scrollY}px`
  }

  private _onMouseMove = (event: MouseEvent) => {
    const element = event.target
    if (element !== this.currentElement) {
      this.currentElement = element as HTMLElement | null
      this._updateOverlay(this.currentElement)
    }
  }

  private _onClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    this._disablePicker()
    if (this.currentElement && this.pickerCallback) {
      this.pickerCallback(this.currentElement)
    }
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this._disablePicker()
    }
  }
}
