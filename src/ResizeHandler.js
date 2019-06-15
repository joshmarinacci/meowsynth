export class ResizeHandler {
    constructor(e, sequence, div, callback) {
        this.callback = callback
        this.seq = sequence
        this.div = div
        this.resizeX = e.clientX - div.getBoundingClientRect().x
        this.resizeY = e.clientY - div.getBoundingClientRect().y
        this.resizeW = div.getBoundingClientRect().width
        this.resizeH = div.getBoundingClientRect().height
        window.addEventListener('mousemove', this.resizeMoved)
        window.addEventListener('mouseup', this.resizeReleased)
    }

    resizeMoved = (e) => {
        let width = e.clientX - this.div.getBoundingClientRect().x
        let height = e.clientY - this.div.getBoundingClientRect().y
        this.callback({w: width, h: height})
    }

    resizeReleased = (e) => {
        window.removeEventListener('mousemove', this.resizeMoved)
        window.removeEventListener('mouseup', this.resizeReleased)
    }

}