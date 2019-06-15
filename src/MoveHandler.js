export class MoveHandler {
    constructor(e, sequence, div, callback) {
        this.sequence = sequence
        this.callback = callback
        this.offsetX = e.clientX - div.getBoundingClientRect().x
        this.offsetY = e.clientY - div.getBoundingClientRect().y
        window.addEventListener('mousemove', this.mouseMoved)
        window.addEventListener('mouseup', this.mouseReleased)
    }

    mouseMoved = (e) => {
        this.sequence.position.x = e.clientX - this.offsetX
        this.sequence.position.y = e.clientY - this.offsetY
        this.callback(this.sequence.position)
    }
    mouseReleased = (e) => {
        window.removeEventListener('mousemove', this.mouseMoved)
        window.removeEventListener('mouseup', this.mouseReleased)
    }
}