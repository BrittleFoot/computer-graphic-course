point_js


const canvas = document.getElementById('plot')

const polygone = [
    {x: 200, y: 200},
    {x: 100, y: 200},
    {x: 100, y: 100},
    {x: 200, y: 100},
].map(({x, y}) => new Point(x + 100, y + 100))

/**
 * Returns a vertices of a minimal right triangle that covers given polygone.
 *
 * @param polygone [Point]target to be covered with right triangle. 
 * @returns [Point] of size 3 which contains coordinates of minimal triangle.
 */
function find_minimal_right_triangle(polygone) {
    return [
        {x: 100, y: 100},
        {x: 300, y: 100},
        {x: 100, y: 300}
    ].map(({x, y}) => new Point(x + 100, y + 100))

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
    // ctx.globalCompositeOperation = 'destination-over'

    const {width, height} = canvas
    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = '#111'
    ctx.fillStyle = '#00f'
    drawPolygone(ctx, polygone)

    ctx.strokeStyle = 'black'
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'
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
