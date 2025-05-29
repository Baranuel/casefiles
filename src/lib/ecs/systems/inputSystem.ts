import { System } from "@/types/engine"
import { Engine } from ".."
import { EventSystem } from "./eventSystem"
import { EngineEvents } from "@/types/events"
import { getEntityAtPosition } from "@/utils/calculations"
import { getPositionWithinElement } from "@/utils/positions"

export class InputSystem implements System {
  // —————————————————————————————
  //  Fields
  // —————————————————————————————
  engine: Engine
  private canvas: HTMLCanvasElement
  private controller = new AbortController()
  private eventSystem: EventSystem | null = null

  public mousePosition = { x: 0, y: 0 }
  public onMouseDownPositionSnapshot = { x: 0, y: 0 }
  public onMouseDownScreenPositionSnapshot = { x: 0, y: 0 }
  public isMouseDown = false
  public isDragging = false
  private mouseButton = 0
  private keyPressed: string | null = ''

  // —————————————————————————————
  //  Constructor
  // —————————————————————————————
  constructor(engine: Engine) {
    this.engine = engine
    this.canvas = engine.canvas
    this.eventSystem = engine.getSystem("EventSystem") as EventSystem
    this.initEventListeners()
  }

  // —————————————————————————————
  //  Initialization
  // —————————————————————————————
  private initEventListeners() {
    const opts = { signal: this.controller.signal }
    this.canvas.addEventListener("touchstart", this.onTouchStart, opts)
    this.canvas.addEventListener("touchmove", this.onTouchMove, opts)
    this.canvas.addEventListener("touchend", this.onTouchEnd, opts)
    this.canvas.addEventListener("mousedown", this.onMouseDown, opts)
    this.canvas.addEventListener("mouseup", this.onMouseUp, opts)
    this.canvas.addEventListener("mousemove", this.updateMousePosition, opts)
    this.canvas.addEventListener("wheel", this.onWheel, opts)
    window.addEventListener("keydown", this.onKeyDown, opts)
    window.addEventListener("keyup", this.onKeyUp, opts)

  }

  // —————————————————————————————
  //  Public API (System interface)
  // —————————————————————————————
  update() {
    if (this.mousePosition && this.onMouseDownPositionSnapshot && this.isMouseDown) {
      const dx = this.mousePosition.x - this.onMouseDownPositionSnapshot.x
      const dy = this.mousePosition.y - this.onMouseDownPositionSnapshot.y

      if (!this.isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        this.isDragging = true
        if (this.eventSystem) {
          this.eventSystem.emit('mouse:drag:start', {
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            startX: this.onMouseDownPositionSnapshot.x,
            startY: this.onMouseDownPositionSnapshot.y,
            deltaX: dx,
            deltaY: dy,
            button: this.mouseButton
          })
        }
      }
    }
  }

  draw() {
    // no-op
  }

  destroy() {
    this.controller.abort()
  }

  // —————————————————————————————
  //  DOM Event Handlers
  // —————————————————————————————

  private onKeyDown = (e: KeyboardEvent) => {
    this.keyPressed = e.key

    if (this.eventSystem) {
      this.eventSystem.emit('key:down', { key: e.key, code: e.code, modifier: e.shiftKey || e.ctrlKey || e.altKey })
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.keyPressed = null
    if (this.eventSystem) {
      this.eventSystem.emit('key:up', { key: e.key, code: e.code, modifier: e.shiftKey || e.ctrlKey || e.altKey })
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    this.isMouseDown = true
    this.mouseButton = e.button
    this.onMouseDownPositionSnapshot = { ...this.mousePosition }

    this.onMouseDownScreenPositionSnapshot = { x: e.clientX, y: e.clientY }

    if (this.eventSystem) {
      const mousePos = this.getWorldMousePosition()

      this.eventSystem.emit('mouse:down', {
        x: mousePos.x,
        y: mousePos.y,
        modifier: e.shiftKey || e.ctrlKey || e.altKey,
        mouseDownSnapshot: this.onMouseDownPositionSnapshot,
        screenPositionSnapshot: this.onMouseDownScreenPositionSnapshot
      })
    }
  }

  private onMouseUp = (e: MouseEvent) => {
    this.isMouseDown = false

    if (this.eventSystem) {
      const mousePos = this.getWorldMousePosition()

      this.eventSystem.emit('mouse:up', {
        x: mousePos.x,
        y: mousePos.y,
        mouseDownSnapshot: this.onMouseDownPositionSnapshot,
        mouseScreenPositionSnapshot: this.onMouseDownScreenPositionSnapshot,
        modifier: e.shiftKey || e.ctrlKey || e.altKey,
        screenX: e.clientX,
        screenY: e.clientY
      })

      this.emitEntityHoverEvent()
    }

    if (this.isDragging && this.eventSystem) {
      this.eventSystem.emit('mouse:drag:end', {
        x: this.mousePosition.x,
        y: this.mousePosition.y,
        startX: this.onMouseDownPositionSnapshot.x,
        startY: this.onMouseDownPositionSnapshot.y,
        deltaX: this.mousePosition.x - this.onMouseDownPositionSnapshot.x,
        deltaY: this.mousePosition.y - this.onMouseDownPositionSnapshot.y,
        button: this.mouseButton
      })
    }

    this.isDragging = false
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    this.isMouseDown = true


    if (this.eventSystem) {

      const touch = e.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      const screenX = touch.clientX - rect.left
      const screenY = touch.clientY - rect.top
      const clientX = (screenX / this.engine.camera.zoom) + this.engine.camera.x
      const clientY = (screenY / this.engine.camera.zoom) + this.engine.camera.y

      this.mousePosition = { x: clientX, y: clientY }
      this.onMouseDownPositionSnapshot = { ...this.mousePosition }
      this.onMouseDownScreenPositionSnapshot = { x: touch.clientX, y: touch.clientY }

      this.eventSystem.emit('touch:start', {
        x: clientX,
        y: clientY,
        screenX: touch.clientX,
        screenY: touch.clientY,
        touches: e.touches,
        mouseDownSnapshot: this.onMouseDownPositionSnapshot,
        mouseScreenPositionSnapshot: this.onMouseDownScreenPositionSnapshot
      })
    }
  }

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault()

    const touch = e.touches[0]
    const rect = this.canvas.getBoundingClientRect()
    const screenX = touch.clientX - rect.left
    const screenY = touch.clientY - rect.top
    const clientX = (screenX / this.engine.camera.zoom) + this.engine.camera.x
    const clientY = (screenY / this.engine.camera.zoom) + this.engine.camera.y
    if (this.eventSystem) {
      this.eventSystem.emit('touch:move', {
        x: clientX,
        y: clientY,
        screenX: touch.clientX,
        screenY: touch.clientY,
        touches: e.touches,
        mouseDownSnapshot: this.onMouseDownPositionSnapshot,
        mouseScreenPositionSnapshot: this.onMouseDownScreenPositionSnapshot

      })
    }
  }

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    this.isMouseDown = false

    if (this.eventSystem) {
      const touch = e.changedTouches[0]
      const rect = this.canvas.getBoundingClientRect()
      const screenX = touch.clientX - rect.left
      const screenY = touch.clientY - rect.top
      const clientX = (screenX / this.engine.camera.zoom) + this.engine.camera.x
      const clientY = (screenY / this.engine.camera.zoom) + this.engine.camera.y

      this.mousePosition = { x: clientX, y: clientY }

      this.eventSystem.emit('touch:end', {
        x: clientX,
        y: clientY,
        screenX: touch.clientX,
        screenY: touch.clientY,
        touches: e.touches,
        mouseDownSnapshot: this.onMouseDownPositionSnapshot,
        mouseScreenPositionSnapshot: this.onMouseDownScreenPositionSnapshot

      })
    }
  }

  private updateMousePosition = (e: MouseEvent | WheelEvent) => {
    const { canvas, engine } = this
    const { camera } = engine

    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    const clientX = (screenX / camera.zoom) + camera.x
    const clientY = (screenY / camera.zoom) + camera.y

    this.mousePosition = { x: clientX, y: clientY }

    if (this.eventSystem) {
      this.eventSystem.emit('mouse:move', {
        mouse: { x: clientX, y: clientY },
        modifier: e.shiftKey || e.ctrlKey || e.altKey
      })
    }

    if (this.isMouseDown && this.keyPressed === ' ') {
      this.eventSystem?.emit('action:pan', {
        mouse: {
          x: e.movementX,
          y: e.movementY
        },
        mouseDownSnapshot: this.onMouseDownPositionSnapshot
      })
    }

    // Check if dragging and emit drag event if needed
    if (this.isMouseDown && this.isDragging) {
      this.emitDragEvent()
    }

    if (!this.isMouseDown && !this.isDragging) {
      this.emitEntityHoverEvent()
    }
  }

  private onWheel = (e: WheelEvent) => {
    if (!this.eventSystem) return

    this.updateMousePosition(e)

    // Then emit wheel event
    this.eventSystem.emit('mouse:wheel', {
      x: this.mousePosition.x,
      y: this.mousePosition.y,
      deltaY: e.deltaY,
      deltaX: e.deltaX
    })
  }

  // —————————————————————————————
  //  Event Emitters
  // —————————————————————————————
  private emitEntityHoverEvent() {
    if (!this.eventSystem) return

    const selectableEntities = this.engine.getEntitiesWithComponents('selectable')
    const hoveredEntity = getEntityAtPosition(selectableEntities, this.mousePosition.x, this.mousePosition.y)

    if (hoveredEntity) {
      const interactionPoint = getPositionWithinElement(this.mousePosition.x, this.mousePosition.y, hoveredEntity.element)

      if (interactionPoint) {
        const hoverData: EngineEvents['action:hover'] = {
          mouse: this.mousePosition,
          entityId: hoveredEntity.id,
          interactionPoint: interactionPoint,
          isMouseDown: this.isMouseDown
        }
        this.eventSystem.emit('action:hover', hoverData)
      }
    }

    this.emitEntityHoverEndEvent()
  }

  private emitEntityHoverEndEvent() {
    if (!this.eventSystem) return
    const selectableEntities = this.engine.getEntitiesWithComponents('selectable')
    const hoveredEntity = getEntityAtPosition(selectableEntities, this.mousePosition.x, this.mousePosition.y)

    if (!hoveredEntity) {
      this.eventSystem.emit('action:hover:end', null)
    }
  }

  private emitDragEvent() {
    if (!this.eventSystem) return

    const dragData: EngineEvents['mouse:drag'] = {
      x: this.mousePosition.x,
      y: this.mousePosition.y,
      mouseDownSnapshot: this.onMouseDownPositionSnapshot,
    }

    this.eventSystem.emit('mouse:drag', dragData)
  }

  // —————————————————————————————
  //  Helpers
  // —————————————————————————————
  public getWorldMousePosition() {
    return this.mousePosition
  }
}
