const point_js = "POINT_JS"


class Point {

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    cpy() {
        return new Point(this.x, this.y)
    }

    let(func) {
        return new Point(func(this.x), func(this.y))
    }

    add({x, y}) {
        return new Point(this.x + x, this.y + y)
    }

    sub({x, y}) {
        return new Point(this.x - x, this.y - y)
    }

    mul({x, y}) {
        return new Point(this.x * x, this.y * y)
    }

    stratch(factor) {
        return this.mul({x:factor, y:factor})
    }

    sqlen() {
        return this.dot(this)
    }

    len() {
        return Math.sqrt(this.sqlen())
    }

    norm() {
        const len = this.len()
        return len == 0 ? new Point(0, 0) : this.stratch(1/len)
    }

    dot({x, y}) {
        return this.x * x + this.y * y
    }

    vdot({x, y}) {
        return this.y * x - this.x * y
    }

    cosBtw(point) {
        return this.norm().dot(point.norm())
    }

    sinBtw(point) {
        return this.norm().vdot(point.norm())
    }

    rot(angle) {
        const ca = Math.cos(angle)
        const sa = Math.sin(angle)
        return new Point(this.x * ca - this.y * sa, this.x * sa + this.y * ca)
    }

    reflect(line) {
        const {x, y} = this
        const {a, b} = line

        const d = (x + (y - b) * a) / (1 + a * a)
        return new Point(2 * d - x, 2 * d * a - y + 2 * b)
    }

}
