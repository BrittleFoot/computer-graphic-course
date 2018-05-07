point_js


const canvas = document.getElementById('plot')

const polygone = [
    {x: 200, y: 200},
    {x: 100, y: 200},
    {x: 100, y: 100},
    {x: 200, y: 100},
].map(({x, y}) => new Point(x + 100, y + 100))


Array.prototype.find = function find(key=(x => x), keycmp=((x, y) => x == y)) {
    let elem = this[0],
        keyv = key(elem)
    this.slice(1).forEach(e => {
        const keye = key(e)
        if (keycmp(keye, keyv)) {
            elem = e
            keyv = keye
        }
    })
    return elem
}


Array.prototype.min = function min(key=(x => x)) {
    return this.find(key, (x, y) => x < y)
}

Array.prototype.max = function max(key=(x => x)) {
    return this.find(key, (x, y) => x >= y)
}

Array.prototype.ngrams = function(n) {
    if (n == 1) {
        return this.map(e => e)
    }
    return this.slice(0, 1 - n).map((_, i) => this.slice(i, i + n))
}

/**
 * Returns a vertices of a minimal right triangle that covers given polygone.
 *
 * @param polygone [Point]target to be covered with right triangle. 
 * @returns [Point] of size 3 which contains vertices of a minimal triangle.
 */
function find_minimal_right_triangle(polygone) {
    switch (polygone.length) {
        case 0: return []
        case 1: return polygone.concat(polygone).concat(polygone)
        case 2: const [a, b] = polygone
        return [ a, b, a.add(b).stratch(1/2)
            .add(a.sub(b).stratch(1/2).rot(Math.PI/2)) ]
        case 3: return polygone.map(e => e)
    }

    const edges = polygone.concat(polygone[0]).ngrams(2).map(([a, b]) => b.sub(a))

    return [
        polygone.min(p => p.x),
        polygone.max(p => p.y),
        polygone.max(p => p.x),
        polygone.min(p => p.y),
    ]

}


function path(ctx, cb) {
    ctx.beginPath()
    /**/ cb(ctx) /**/
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
}


function drawPolygone(ctx, polygone) {
    if (!polygone || polygone.length <= 0) {
        return
    }

    const p0 = polygone[0]

    if (polygone.length == 1) {
        path(ctx, ctx => {
            ctx.moveTo(p0.x, p0.y)
            ctx.arc(p0.x, p0.y, 2, 0, 2 * Math.PI)
            ctx.fillStyle = ctx.strokeStyle
        })
        return 
    }

    path(ctx, ctx => {
        ctx.moveTo(p0.x, p0.y)
        polygone.slice(1).map(({x, y}) => ctx.lineTo(x, y))
    })
}


function redraw() {
    const ctx = canvas.getContext('2d')

    const {width, height} = canvas
    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = '#111'
    ctx.fillStyle = '#00f'
    drawPolygone(ctx, polygone)

    ctx.strokeStyle = 'black'
    ctx.fillStyle = 'rgba(255, 255, 0, 0.7)'
    drawPolygone(ctx, find_minimal_right_triangle(polygone))
}


window.onload = function() {
    canvas.addEventListener('click', e => {
        const x = e.layerX,
              y = e.layerY

        polygone.push(new Point(x, y))
        redraw()
    })
    redraw()
}

function del() {
    while (polygone.length > 0)
        polygone.pop()
    redraw()
}

function cancel() {
    polygone.pop()
    redraw()
}
