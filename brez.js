Object.prototype.also = function(f) { f(this); return this }

function func({a, b, c, d}) {
    return x => (a*Math.pow(x, 2) + b*x + c) / (x + d) 
}

function verticalAsymp({a, b, d}) {
    return x => a * x + b - d
}

function horizontalAsymp({d}) {
    return x => -d
}

function getProperties() {
    const props = {
        a:     parseFloat(document.getElementById("a").value),
        b:     parseFloat(document.getElementById("b").value),
        c:     parseFloat(document.getElementById("c").value),
        d:     parseFloat(document.getElementById("d").value),
        xfrom: -10,
        xto:   10,
        yfrom: -10,
        yto:   10,
        step:  0.1,
        pixelSize:  parseFloat(document.getElementById("pixelSize").value)
    }

    props.xsize = props.xto - props.xfrom
    props.ysize = props.yto - props.yfrom

    return props
}


function drawPixel(ctx, {pixelSize}, {x, y}) {
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
}

function drawLineLow(ctx, props, a, b) {
    let dx = b.x - a.x
    let dy = b.y - a.y
    let yi = 1
    if (dy < 0) {
        yi = -1
        dy = -dy
    }
    let D = 2 * dy - dx
    let y = a.y

    for (var x = a.x; x <= b.x; x++) {
        drawPixel(ctx, props, {x:x, y:y})
        if (D > 0) {
            y += yi
            D -= 2 * dx
        }
        D += 2 * dy
    }
}

function drawLineHigh(ctx, props, a, b) {
    let dx = b.x - a.x
    let dy = b.y - a.y
    let xi = 1
    if (dx < 0) {
        xi = -1
        dx = -dx
    }
    let D = 2 * dx - dy
    let x = a.x

    for (var y = a.y; y <= b.y; y++) {
        drawPixel(ctx, props, {x:x, y:y})
        if (D > 0) {
            x += xi
            D -= 2 * dy
        }
        D += 2 * dx
    }
}


function drawLine(ctx, props, a, b) {
    if (Math.abs(b.y - a.y) < Math.abs(b.x - a.x)) {
        if (a.x > b.x) 
            drawLineLow(ctx, props, b, a)
        else 
            drawLineLow(ctx, props, a, b)
    } else {
        if (a.y > b.y)
            drawLineHigh(ctx, props, b, a)
        else
            drawLineHigh(ctx, props, a, b)
    }
}


function remapX(x, {xfrom, xsize, width}) {
    return (x - xfrom) / xsize * width
}

function remapY(y, {yfrom, ysize, height}) {
    return - (y - yfrom) / ysize * height + height
}


class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    remap(props) {
        return new Point(remapX(this.x, props), remapY(this.y, props))
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


function min(items, key=(x => x)) {
    let elem = items[0]
    let min = key(elem)
    items.forEach(e => {
        if (key(e) < min) {
            elem = e
        }
    })
    return elem
}


function drawBranch(ctx, props, p0, {x, y}, branchDirs, delta, stop) {
    let p = new Point(x, y)

    while (stop(p)) {
        drawPixel(ctx, props, p0.add(p))
        p = min(branchDirs.map(e => p.add(e)), e => Math.abs(delta(e)))
    }
}


function drawHyp2(ctx, props, hyp, median1, median2) {
    const { width, height, pixelSize, xsize, ysize } = props
    const equ = props

    // equal funcions since field is rectangle 
    const resizex = value => Math.trunc(value / xsize * width / pixelSize)
    const resizey = value => Math.trunc(value / ysize * height / pixelSize)
    rs = resizex

    const { A, B, C } = resized = {
        A: resizex(hyp.A),
        B: resizey(hyp.B),
        C: resizex(hyp.C)
    }

    const { a, b, c, d } = equ

    const plotAsympCenter = new Point(-d, -d * a + b - d).let(resizex).mul({x:1, y:-1})
    const p0 = new Point(10, 10).let(resizex).add(plotAsympCenter)
    const focA = new Point(C, 0).rot(equ.alpha).let(Math.trunc)
    const focB = new Point(-C, 0).rot(equ.alpha).let(Math.trunc)

    const P = new Point(A, 0).rot(equ.alpha).let(Math.trunc)

    const delta = dlt = point => Math.abs(point.sub(focA).len() - point.add(focA).len()) - 2 * A
    
    const points = [
        [-1, -1], [ 0, -1], [ 1, -1],
        [-1,  0],           [ 1,  0],
        [-1,  1], [ 0,  1], [ 1,  1]
    ].map(e => new Point(...e))

    const frontUp = point => points.filter(pt => point.sinBtw(pt) >= 0 && point.cosBtw(pt) >= -Math.PI / 6)
    const frontDown = point => points.filter(pt => point.sinBtw(pt) <= 0 && point.cosBtw(pt) >= -Math.PI / 6)

    drawBranch(ctx, props, p0, P, frontUp(P), delta, p => p.len() < 1000)
    drawBranch(ctx, props, p0, P, frontDown(P), delta, p => p.len() < 1000)

    const Q = P.stratch(-1)

    frontUp(P).forEach(p => {
        drawPixel(ctx, props, p0.add(p.stratch(2)))
    })

    drawBranch(ctx, props, p0, Q, frontUp(Q), delta, p => p.len() < 1000)
    drawBranch(ctx, props, p0, Q, frontDown(Q), delta, p => p.len() < 1000)

    drawPixel(ctx, props, p0)
    drawPixel(ctx, props, p0.add(focA))
    drawPixel(ctx, props, p0.add(focB))

}


function drawFunc() {
    const canvas = document.getElementById("plot")
    const ctx = canvas.getContext("2d")
    ctx.imageSmoothingEnabled = false

    const {width, height} = canvas
    const props = getProperties()
    props.width = width
    props.height = height

    ctx.clearRect(0, 0, width, height)

    const px = {
        width: Math.trunc(width / props.pixelSize),
        height: Math.trunc(height / props.pixelSize)
    }

    const scale = {
        width: px.width / width,
        height: px.height / height
    }
    if (scale.width != scale.height)
        console.log("WARN: require custom scale for non square fields")

    const factor = scale.width
    const scaleIt = number => Math.trunc(number * factor)
    const plottablePoint = (x, y) => new Point(x, y).remap(props).let(scaleIt)

    const {a, b, c, d} = props

    if (a == 0)
        return

    const alpha = props.alpha =  Math.atan(-1 / a) / 2
    const ca = Math.cos(alpha)
    const sa = Math.sin(alpha)

    const {A, B, C, D, E} = {
        A: a * ca * ca - ca * sa,
        B: a * sa * sa + ca * sa,
        C: b * ca - d * sa,
        D: - (b * sa + d * ca),
        E: c,
        ZERO: a * Math.sin(2 * alpha) + Math.cos(2* alpha)
    }
    // todo: here we can yield not only hyperbola

    const R = E - C * C / (4 * A) - D * D / (4 * B)

    let { A2, B2 } = { 
        A2: -R / A,
        B2: -R / B
    }

    if (A2 < 0 && B2 > 0) {
        let t = A2 
        A2 = B2
        B2 = t
        props.alpha = Math.PI / 2 - props.alpha
    } else {
        props.alpha = Math.PI - props.alpha
    }

    B2 = -B2

    const foci = Math.sqrt(A2 + B2)

    const hyp = {
        A: Math.sqrt(A2),
        B: Math.sqrt(B2),
        C: foci
    }

    

    // asymp playground 
    // {
        const vertical = verticalAsymp(props)
        const horizontal = horizontalAsymp(props)

        const asympCenter = new Point(-d, -d * a + b - d)

        const newAngle = props.alpha + Math.PI / 4
        const firstMedianAngle = Math.tan(newAngle)
        const secondMedianAngle = Math.tan(Math.PI / 2 + newAngle)


        const firstMedianAsymp = x => firstMedianAngle * (x - asympCenter.x)  + asympCenter.y
        const secondMedianAsymp = x => secondMedianAngle * (x - asympCenter.x)  + asympCenter.y

        const m1 = { a: firstMedianAngle, b: -firstMedianAngle * asympCenter.x + asympCenter.y}
        const m2 = { a: secondMedianAngle, b: -secondMedianAngle * asympCenter.x + asympCenter.y}


        const vAsympA = plottablePoint(props.xfrom, vertical(props.xfrom))
        const vAsympB = plottablePoint(props.xto, vertical(props.xto))

        const m1AsympA = plottablePoint(props.xfrom, firstMedianAsymp(props.xfrom))
        const m1AsympB = plottablePoint(props.xto, firstMedianAsymp(props.xto))

        const m2AsympA = plottablePoint(props.xfrom, secondMedianAsymp(props.xfrom))
        const m2AsympB = plottablePoint(props.xto, secondMedianAsymp(props.xto))

        const hAsympA = plottablePoint(horizontal(), props.yfrom)
        const hAsympB = plottablePoint(horizontal(), props.yto)
        //(1*pow(x,2) + 4*x + 1) / (x + 0)

        ctx.fillStyle = 'rgba(240, 240, 240)'
        drawLine(ctx, props, vAsympA, vAsympB)
        drawLine(ctx, props, hAsympA, hAsympB)

        drawLine(ctx, props, m1AsympA, m1AsympB)
        drawLine(ctx, props, m2AsympA, m2AsympB)
    // }
    
    ctx.fillStyle = 'black'
    drawHyp2(ctx, props, hyp, m1, m2)

    ctx.stroke()
}

window.onload = function() {

    var cas = document.getElementsByClassName("change-aware")
    for (var i = 0; i < cas.length; i++) {
        cas[i].onchange = e => {
            if (document.getElementById("autoredraw").checked) 
                drawFunc()
        }
    }

    drawFunc()
}