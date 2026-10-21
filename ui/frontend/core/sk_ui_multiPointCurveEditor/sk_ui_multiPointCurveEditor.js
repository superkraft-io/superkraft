class sk_ui_multiPointCurveEditor extends sk_ui_component {
    constructor(opt){
        super(opt)
        var config = opt.extraOpt || {}
        this.classAdd('sk_ui_multiPointCurveEditor')
        this.style.position = 'relative'
        this.style.width = '100%'
        this.style.height = config.height || '220px'
        this.style.minHeight = config.minHeight || '160px'
        this.style.touchAction = 'none'
        this.style.backgroundColor = config.backgroundColor || '#1a1a1a'

        this.xRange = config.xRange || {min: 0, max: 1}
        this.yRange = config.yRange || {min: 0, max: 1}
        this.mapX = typeof config.mapX === 'function' ? config.mapX : null
        this.unmapX = typeof config.unmapX === 'function' ? config.unmapX : null
        this.orientation = config.orientation === 'vertical' ? 'vertical' : 'horizontal'
        this.curveTension = Number.isFinite(config.curveTension) ? config.curveTension : 0.2
        this._curveSmoothing = sk_ui_multiPointCurveEditor.clampSmooth(config.curveSmoothing)
        this.curveColor = config.curveColor || '#ffffff'
        this.curveThickness = Number.isFinite(config.curveThickness) ? config.curveThickness : 2
        this.curveOutlineColor = config.curveOutline === false || config.curveOutlineColor === false
            ? null
            : (typeof config.curveOutlineColor === 'string' ? config.curveOutlineColor : '#000000')
        this.curveOutlineWidth = Number.isFinite(config.curveOutlineWidth)
            ? Math.max(0, config.curveOutlineWidth)
            : this.curveThickness + 2
        // White idle and selected (not SK/iZotope blue). Size marks the active knot.
        // Black knot stroke so white dots stay visible on a bright spectrogram.
        this.pointColor = config.pointColor || '#ffffff'
        this.pointBorderColor = config.pointBorderColor || '#000000'
        this.activePointColor = config.activePointColor || '#ffffff'
        this.activePointBorderColor = config.activePointBorderColor || '#000000'
        this.hoverPointColor = config.hoverPointColor || '#ffffff'
        this.hoverPointBorderColor = config.hoverPointBorderColor || '#000000'
        this.pointRadius = Number.isFinite(config.pointRadius) ? config.pointRadius : 3.5
        this.pointRadiusActive = Number.isFinite(config.pointRadiusActive) ? config.pointRadiusActive : 4.5
        this.pointRadiusHover = Number.isFinite(config.pointRadiusHover) ? config.pointRadiusHover : 4.25
        this.pointHitRadius = Number.isFinite(config.pointHitRadius) ? config.pointHitRadius : 10
        this.pointStrokeWidth = Number.isFinite(config.pointStrokeWidth) ? config.pointStrokeWidth : 1.5
        this.hoverHighlight = config.hoverHighlight === true
        this.handleColor = config.handleColor || '#ffffff'
        this.handleFillColor = config.handleFillColor || '#1a1a1a'
        this.handleBorderColor = config.handleBorderColor || '#ffffff'
        this.labelFont = config.labelFont || 'inherit'
        this.labelFontSize = Number.isFinite(config.labelFontSize) ? config.labelFontSize : 11
        this.labelColor = config.labelColor || 'rgba(255,255,255,0.48)'
        this.yRuler = {
            visible: false,
            position: 'inside',
            width: 42,
            ticks: [],
            format: value => String(value),
            ...config.yRuler
        }
        this.yRuler.position = this.yRuler.position === 'outside' ? 'outside' : 'inside'
        this.yRuler.width = Number.isFinite(this.yRuler.width) ? Math.max(20, this.yRuler.width) : 42
        this.yRuler.columns = Array.isArray(this.yRuler.columns) ? this.yRuler.columns : null
        this.style.overflow = this.yRuler.visible && this.yRuler.position === 'outside' ? 'visible' : 'hidden'
        this.guides = Array.isArray(config.guides) ? config.guides : []
        this.xRuler = {
            visible: false,
            position: 'inside',
            height: 20,
            ticks: [],
            format: value => String(value),
            ...config.xRuler
        }
        this.xRuler.position = this.xRuler.position === 'outside' ? 'outside' : 'inside'
        this.xRuler.height = Number.isFinite(this.xRuler.height) ? Math.max(16, this.xRuler.height) : 20
        this.editable = config.editable !== false
        this.showPoints = config.showPoints !== false
        this.lockEdgePoints = config.lockEdgePoints !== false
        this.bezierHandles = config.bezierHandles === true
        this.allowAddPoints = config.allowAddPoints !== false
        this.defaultPointActions = config.defaultPointActions && typeof config.defaultPointActions === 'object'
            ? config.defaultPointActions
            : {keyboard: {Delete: 'delete', Backspace: 'delete'}}
        this.preventCrossing = config.preventCrossing === true
        this.snapToCenter = config.snapToCenter === true
        this.snapToNeighbors = config.snapToNeighbors === true
        this.snapToCenterPx = Number.isFinite(config.snapToCenterPx) ? Math.max(0, config.snapToCenterPx) : 8
        this.dragEmptySpaceMovesAll = config.dragEmptySpaceMovesAll === true
        this.grid = {...{visible: true, xDivisions: 4, yDivisions: 4}, ...(config.grid || {})}
        this.renderBackground = config.renderBackground || null
        this.renderForeground = config.renderForeground || null
        this.points = []
        this.nextPointId = 1
        this.activePointId = config.activePointId || null
        this.hoveredPointId = config.hoveredPointId || null
        this.drag = null
        this.onPointsChanged = config.onPointsChanged || null
        this.onEditStart = config.onEditStart || null
        this.onEditEnd = config.onEditEnd || null
        this.onPointAdded = config.onPointAdded || null
        this.onHoveredPointChanged = config.onHoveredPointChanged || null
        this._lastPointClick = null
        this._curvePath = null
        this._curveOutlinePath = null
        this._curveHitPath = null
        this._pointDots = null
        this._geometryPointIds = null
        this._suspendRender = false
        this._plotGroup = null
        this._plotTranslateX = 0
        this._cachedBounds = null
        // Optional window into xRange (absolute data). Unused by volume curve.
        this.viewXRange = null
        // Shift+wheel soft clamp: baseline + offset; bake on Shift release.
        this.shiftScroll = null
        this._onShiftScrollKeyUp = event => {
            if (event.key !== 'Shift') return
            this.endShiftScroll()
        }

        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.svg.setAttribute('viewBox', '0 0 1 1')
        this.svg.setAttribute('preserveAspectRatio', 'none')
        this.svg.setAttribute('role', 'application')
        this.svg.setAttribute('aria-label', config.ariaLabel || 'Multi point curve editor')
        this.svg.setAttribute('tabindex', '0')
        this.svg.style.display = 'block'
        this.svg.style.width = '100%'
        this.svg.style.height = '100%'
        this.svg.style.position = 'absolute'
        this.svg.style.inset = '0'
        this.svg.style.overflow = 'visible'
        this.svg.style.outline = 'none'
        this.element.style.setProperty('--sk_ui_multiPointCurveEditor_plotLeft', this.yRuler.visible && this.yRuler.position === 'outside' ? this.yRuler.width + 'px' : '0px')
        this.element.style.setProperty('--sk_ui_multiPointCurveEditor_plotBottom', this.xRuler.visible && this.xRuler.position === 'outside' ? this.xRuler.height + 'px' : '0px')
        this.editorElement = document.createElement('div')
        this.editorElement.className = 'sk_ui_multiPointCurveEditor_editor'
        this.editorElement.style.position = 'absolute'
        this.editorElement.style.top = '0'
        this.editorElement.style.right = '0'
        this.editorElement.style.bottom = 'var(--sk_ui_multiPointCurveEditor_plotBottom)'
        this.editorElement.style.left = 'var(--sk_ui_multiPointCurveEditor_plotLeft)'
        this.editorElement.style.overflow = 'hidden'
        this.editorElement.style.touchAction = 'none'
        this.element.appendChild(this.editorElement)
        if (this.yRuler.visible && this.yRuler.position === 'outside') {
            this.yRulerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            this.yRulerSvg.setAttribute('preserveAspectRatio', 'none')
            this.yRulerSvg.style.display = 'block'
            this.yRulerSvg.style.width = this.yRuler.width + 'px'
            this.yRulerSvg.style.height = 'auto'
            this.yRulerSvg.style.position = 'absolute'
            this.yRulerSvg.style.left = '0'
            this.yRulerSvg.style.top = '0'
            this.yRulerSvg.style.bottom = this.xRuler.visible && this.xRuler.position === 'outside' ? this.xRuler.height + 'px' : '0'
            this.yRulerSvg.style.overflow = 'visible'
            this.yRulerSvg.style.pointerEvents = 'none'
            this.yRulerSvg.style.zIndex = '2'
            this.yRulerSvg.setAttribute('overflow', 'visible')
            this.element.appendChild(this.yRulerSvg)
        }
        if (this.xRuler.visible && this.xRuler.position === 'outside') {
            this.xRulerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            this.xRulerSvg.setAttribute('preserveAspectRatio', 'none')
            this.xRulerSvg.style.display = 'block'
            this.xRulerSvg.style.height = this.xRuler.height + 'px'
            this.xRulerSvg.style.position = 'absolute'
            this.xRulerSvg.style.left = 'var(--sk_ui_multiPointCurveEditor_plotLeft)'
            this.xRulerSvg.style.right = '0'
            this.xRulerSvg.style.bottom = '0'
            this.xRulerSvg.style.overflow = 'visible'
            this.xRulerSvg.style.pointerEvents = 'none'
            this.element.appendChild(this.xRulerSvg)
        }
        this.editorElement.appendChild(this.svg)

        this.svg.addEventListener('pointerdown', event => this.handlePointerDown(event))
        this.svg.addEventListener('pointermove', event => this.handlePointerMove(event))
        this.svg.addEventListener('pointerup', event => this.handlePointerUp(event))
        this.svg.addEventListener('pointercancel', event => this.handlePointerUp(event))
        this.svg.addEventListener('pointerleave', ()=> this.setHoveredPointId(null))
        this.svg.addEventListener('dblclick', event => this.handleDoubleClick(event))
        this.svg.addEventListener('keydown', event => this.handleKeyDown(event))
        this.svg.addEventListener('wheel', event => this.handleWheel(event), {passive: false})
        this.svg.addEventListener('contextmenu', event => event.preventDefault())
        this.resizeObserver = new ResizeObserver(()=> {
            if (this._suspendRender) return
            this._cachedBounds = null
            this.render()
        })
        this.resizeObserver.observe(this.element)

        this.setPoints(config.points || [])
        requestAnimationFrame(()=> requestAnimationFrame(()=> this.render()))
    }

    setSuspended(suspended){
        this._suspendRender = !!suspended
        if (suspended) {
            if (this.resizeObserver) this.resizeObserver.disconnect()
        } else if (this.resizeObserver && this.element) {
            this._cachedBounds = null
            this.resizeObserver.observe(this.element)
        }
    }

    measureBounds(){
        var width = Math.max(1, this.svg ? this.svg.clientWidth : 1)
        var height = Math.max(1, this.svg ? this.svg.clientHeight : 1)
        this._cachedBounds = {width: width, height: height}
        return this._cachedBounds
    }

    setPlotTranslateX(tx){
        this._plotTranslateX = Number.isFinite(tx) ? tx : 0
        if (!this._plotGroup) return
        if (this._plotTranslateX) {
            this._plotGroup.setAttribute('transform', 'translate(' + this._plotTranslateX + ' 0)')
        } else {
            this._plotGroup.removeAttribute('transform')
        }
    }

    // Show [min,max] within xRange. Maps toCanvas/toValue. Do not crop via
    // viewBox (preserveAspectRatio none would stretch the path like a bitmap).
    setViewXRange(min, max){
        if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
            this.viewXRange = null
        } else {
            this.viewXRange = {min: min, max: max}
        }
        this.syncGeometry()
    }

    applyViewBox(){
        if (!this.svg) return
        var bounds = this.getBounds()
        this.svg.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height)
        this.svg.setAttribute('preserveAspectRatio', 'none')
    }

    setRanges(xRange, yRange){
        if (xRange) this.xRange = {...this.xRange, ...xRange}
        if (yRange) this.yRange = {...this.yRange, ...yRange}
        // setPoints already renders (and re-clamps); do not double-render.
        this.setPoints(this.points, false)
    }

    setPoints(points, notify = false, opt = {}){
        // clampX:false keeps off-range knots for clipped segment drawing (e.g. volume curve).
        this.points = (points || []).map(point => this.normalizePoint(point, opt))
        this.sortPoints()
        this.syncBezierHandles()
        if (!this.activePointId && this.points.length) this.activePointId = this.points[0].id
        if (this.activePointId && !this.points.some(point => point.id === this.activePointId)) this.activePointId = null
        this.render()
        if (notify) this.notifyPointsChanged()
    }

    getPoints(){
        return this.points.map(point => this.clonePoint(point))
    }

    get curveSmoothing(){
        return this._curveSmoothing
    }

    set curveSmoothing(val){
        var next = sk_ui_multiPointCurveEditor.clampSmooth(val)
        if (Math.abs(next - this._curveSmoothing) < 1e-6) return
        this._curveSmoothing = next
        if (this.svg) this.syncGeometry()
    }

    evalY(x){
        if (this.bezierHandles) return sk_ui_multiPointCurveEditor.evalBezierY(this.points, x)
        return sk_ui_multiPointCurveEditor.evalY(this.points, x, this._curveSmoothing, {
            xRange: this.xRange,
            yRange: this.yRange
        })
    }

    addPoint(point, notify = true){
        var configuredPoint = point || {}
        if (this.onPointAdded) {
            var result = this.onPointAdded({...configuredPoint}, this.getPoints(), this)
            if (result && typeof result === 'object') configuredPoint = result
        }
        configuredPoint = this.applyDefaultPointActions(configuredPoint)
        var normalized = this.normalizePoint(configuredPoint)
        this.points.push(normalized)
        this.sortPoints()
        this.syncBezierHandles()
        this.activePointId = normalized.id
        this.render()
        if (notify) this.notifyPointsChanged(normalized)
        return {...normalized}
    }

    updatePoint(id, patch, notify = true){
        var point = this.points.find(item => item.id === id)
        if (!point) return null
        for (var property in patch) {
            if (property === 'curve') point.curve = this.normalizeCurve(patch.curve)
            else if (property !== 'id' && property !== 'x' && property !== 'y') point[property] = patch[property]
        }
        if (Number.isFinite(patch.x)) point.x = this.clamp(patch.x, this.xRange.min, this.xRange.max)
        if (Number.isFinite(patch.y)) point.y = this.clamp(patch.y, this.yRange.min, this.yRange.max)
        this.clampPointToNeighbors(point)
        this.sortPoints()
        this.render()
        if (notify) this.notifyPointsChanged(point)
        return {...point}
    }

    applyDefaultPointActions(point){
        var defaults = this.defaultPointActions
        if (!point || !defaults) return point
        var keyboard = point.actions && point.actions.keyboard
        if (keyboard && Object.keys(keyboard).length) return point
        return {
            ...point,
            actions: {
                mouse: {...(defaults.mouse || {}), ...((point.actions && point.actions.mouse) || {})},
                keyboard: {...(defaults.keyboard || {})}
            }
        }
    }

    removePoint(id, notify = true){
        var index = this.points.findIndex(point => point.id === id)
        if (index < 0) return null
        if (this.lockEdgePoints && this.isLockedEdgePoint(this.points[index])) return null
        var removed = this.points.splice(index, 1)[0]
        if (this.activePointId === id) this.activePointId = null
        this.syncBezierHandles()
        this.render()
        if (notify) this.notifyPointsChanged(removed)
        return {...removed}
    }

    clearPoints(notify = true){
        this.points = []
        this.activePointId = null
        this.render()
        if (notify) this.notifyPointsChanged()
    }

    normalizePoint(point, opt = {}){
        var clampX = opt.clampX !== false && opt.clamp !== false
        var clampY = opt.clampY !== false && opt.clamp !== false
        var x = Number.isFinite(point.x) ? point.x : this.xRange.min
        var y = Number.isFinite(point.y) ? point.y : this.yRange.min
        if (clampX) x = this.clamp(x, this.xRange.min, this.xRange.max)
        if (clampY) y = this.clamp(y, this.yRange.min, this.yRange.max)
        var dragAxis = point.dragAxis === 'x' || point.dragAxis === 'y' || point.dragAxis === 'both'
            ? point.dragAxis
            : 'both'
        return {
            ...point,
            id: point.id || 'point-' + this.nextPointId++,
            x: x,
            y: y,
            dragAxis: dragAxis,
            actions: this.normalizeActions(point.actions, point.deletable),
            curve: this.normalizeCurve(point.curve),
            bezierIn: this.normalizeBezierOffset(point.bezierIn),
            bezierOut: this.normalizeBezierOffset(point.bezierOut),
            handles: (point.handles || []).map(handle => this.normalizeHandle(handle))
        }
    }

    normalizeBezierOffset(offset){
        return {
            x: offset && Number.isFinite(offset.x) ? offset.x : 0,
            y: offset && Number.isFinite(offset.y) ? offset.y : 0
        }
    }

    syncBezierHandles(){
        if (!this.bezierHandles) return
        var n = this.points.length
        for (var i = 0; i < n; i++) {
            var point = this.points[i]
            var handles = []
            if (i > 0) handles.push(this.makeBezierHandle('in'))
            if (i < n - 1) handles.push(this.makeBezierHandle('out'))
            point.handles = handles.map(handle => this.normalizeHandle(handle))
        }
    }

    makeBezierHandle(side){
        var editor = this
        return {
            id: 'bezier-' + side,
            kind: 'bezier',
            min: 0,
            max: 1,
            value: 0,
            axis: 'both',
            thumbWidth: 7,
            thumbHeight: 7,
            thumbRx: 3.5,
            action: function(info){
                var live = editor.points.find(item => item.id === info.point.id)
                if (!live) return
                var value = editor.toValue(info.position, info.bounds)
                var offset = {x: value.x - live.x, y: value.y - live.y}
                if (side === 'out') live.bezierOut = offset
                else live.bezierIn = offset
            },
            offsetFromValue: function(info){
                var live = editor.points.find(item => item.id === info.point.id) || info.point
                var offset = side === 'out' ? live.bezierOut : live.bezierIn
                if (!offset) offset = {x: 0, y: 0}
                var control = editor.toCanvas({x: live.x + offset.x, y: live.y + offset.y}, info.bounds)
                var origin = editor.toCanvas(live, info.bounds)
                return {x: control.x - origin.x, y: control.y - origin.y}
            }
        }
    }

    /** false when point.dragAxis locks out that axis ('x' = horizontal-only, 'y' = vertical-only). */
    pointAllowsAxis(point, axis){
        if (!point) return true
        var dragAxis = point.dragAxis
        if (!dragAxis || dragAxis === 'both') return true
        return dragAxis === axis
    }

    // actions: { mouse: { click|doubleclick: 'delete'|'reset'|fn }, keyboard: { Delete: ... } }
    // Legacy `deletable: ['doubleclick','key_del']` still accepted and migrated.
    // mouse.click fires on pointerup when the point was pressed without a meaningful drag.
    normalizeActions(actions, legacyDeletable){
        var mouse = {}
        var keyboard = {}
        if (actions && typeof actions === 'object') {
            if (actions.mouse && typeof actions.mouse === 'object') mouse = {...actions.mouse}
            if (actions.keyboard && typeof actions.keyboard === 'object') keyboard = {...actions.keyboard}
        } else if (Array.isArray(legacyDeletable)) {
            if (legacyDeletable.includes('doubleclick')) mouse.doubleclick = 'delete'
            if (legacyDeletable.includes('key_del')) keyboard.Delete = 'delete'
        }
        return {mouse, keyboard}
    }

    getPointAction(point, channel, name){
        if (!point || !point.actions) return null
        var bucket = point.actions[channel]
        if (!bucket || typeof bucket !== 'object') return null
        if (bucket[name] != null) return bucket[name]
        if (channel !== 'keyboard') return null
        var wanted = String(name || '').toLowerCase()
        for (var key in bucket) {
            if (String(key).toLowerCase() === wanted) return bucket[key]
        }
        if (wanted === 'delete' || wanted === 'del') {
            for (var alias of ['Delete', 'Del', 'DEL', 'key_del']) {
                if (bucket[alias] != null) return bucket[alias]
            }
        }
        return null
    }

    runPointAction(point, action, event){
        if (!point || action == null || action === false) return false
        if (typeof action === 'function') {
            action({point: this.clonePoint(point), editor: this, event: event || null})
            return true
        }
        if (action === 'delete') {
            this.removePoint(point.id)
            return true
        }
        if (action === 'reset') {
            if (this.orientation === 'vertical') this.updatePoint(point.id, {x: this.centerValue()})
            else this.updatePoint(point.id, {y: this.centerValue()})
            return true
        }
        return false
    }

    normalizeCurve(curve){
        var value = Number.isFinite(curve) ? curve : null
        return {
            in: Math.max(0, Number.isFinite(curve && curve.in) ? curve.in : (value === null ? 1 : value)),
            out: Math.max(0, Number.isFinite(curve && curve.out) ? curve.out : (value === null ? 1 : value))
        }
    }

    normalizeHandle(handle){
        var min = Number.isFinite(handle.min) ? handle.min : 0
        var max = handle.max === Infinity ? Infinity : (Number.isFinite(handle.max) ? handle.max : 1)
        return {
            ...handle,
            id: handle.id || 'handle-' + this.nextPointId++,
            min: min,
            max: max,
            value: this.clamp(Number.isFinite(handle.value) ? handle.value : min, min, max),
            axis: handle.axis === 'y' ? 'y' : 'x',
            action: handle.action || 'value',
            dragDistance: Number.isFinite(handle.dragDistance) && handle.dragDistance > 0 ? handle.dragDistance : null,
            offset: {...{x: 22, y: 0}, ...(handle.offset || {})}
        }
    }

    clonePoint(point){
        return {
            ...point,
            curve: {...point.curve},
            bezierIn: {...point.bezierIn},
            bezierOut: {...point.bezierOut},
            actions: {
                mouse: {...((point.actions && point.actions.mouse) || {})},
                keyboard: {...((point.actions && point.actions.keyboard) || {})}
            },
            handles: point.handles.map(handle => ({...handle, offset: {...handle.offset}}))
        }
    }

    sortPoints(){
        if (this.orientation === 'vertical') this.points.sort((first, second) => second.y - first.y)
        else this.points.sort((first, second) => first.x - second.x)
    }

    centerValue(){
        if (this.orientation === 'vertical') return (this.xRange.min + this.xRange.max) / 2
        return (this.yRange.min + this.yRange.max) / 2
    }

    snapPointToCenter(point){
        this.snapPointValue(point)
    }

    snapPointValue(point){
        if (!point || (!this.snapToCenter && !this.snapToNeighbors)) return
        var axis = this.orientation === 'vertical' ? 'x' : 'y'
        if (!this.pointAllowsAxis(point, axis)) return
        var bounds = this.getBounds()
        var pos = this.toCanvas(point, bounds)
        var candidates = []
        if (this.snapToNeighbors) {
            var index = this.points.indexOf(point)
            if (index > 0) candidates.push(this.points[index - 1][axis])
            if (index >= 0 && index < this.points.length - 1) candidates.push(this.points[index + 1][axis])
        }
        if (this.snapToCenter) candidates.push(this.centerValue())
        var best = null
        var bestDist = this.snapToCenterPx
        for (var i = 0; i < candidates.length; i++) {
            var target = candidates[i]
            if (!Number.isFinite(target)) continue
            var other = axis === 'y' ? {x: point.x, y: target} : {x: target, y: point.y}
            var canvas = this.toCanvas(other, bounds)
            var dist = axis === 'y' ? Math.abs(pos.y - canvas.y) : Math.abs(pos.x - canvas.x)
            if (dist <= bestDist) {
                bestDist = dist
                best = target
            }
        }
        if (best != null) point[axis] = best
    }

    clampPointToNeighbors(point){
        if (!this.preventCrossing || !point) return
        var index = this.points.indexOf(point)
        if (index < 0) return
        var eps = 1e-6
        if (this.orientation === 'vertical') {
            var hi = index > 0 ? this.points[index - 1].y - eps : this.yRange.max
            var lo = index < this.points.length - 1 ? this.points[index + 1].y + eps : this.yRange.min
            point.y = this.clamp(point.y, lo, hi)
            return
        }
        var loX = index > 0 ? this.points[index - 1].x + eps : this.xRange.min
        var hiX = index < this.points.length - 1 ? this.points[index + 1].x - eps : this.xRange.max
        point.x = this.clamp(point.x, loX, hiX)
    }

    isLockedEdgePoint(point){
        if (this.orientation === 'vertical') return point.y === this.yRange.min || point.y === this.yRange.max
        return point.x === this.xRange.min || point.x === this.xRange.max
    }

    clamp(value, min, max){
        return Math.max(min, Math.min(max, value))
    }

    getBounds(){
        if (this._cachedBounds) return this._cachedBounds
        return this.measureBounds()
    }

    visibleXRange(){
        if (this.viewXRange && this.orientation === 'horizontal') return this.viewXRange
        return this.xRange
    }

    mappedX(value){
        return this.mapX ? this.mapX(value) : value
    }

    unmappedX(mapped){
        return this.unmapX ? this.unmapX(mapped) : mapped
    }

    toCanvas(point, bounds){
        var xView = this.visibleXRange()
        var n0 = this.mappedX(xView.min)
        var n1 = this.mappedX(xView.max)
        return {
            x: (this.mappedX(point.x) - n0) / Math.max(0.000001, n1 - n0) * bounds.width,
            y: (1 - (point.y - this.yRange.min) / Math.max(0.000001, this.yRange.max - this.yRange.min)) * bounds.height
        }
    }

    toValue(position, bounds){
        var xView = this.visibleXRange()
        var n0 = this.mappedX(xView.min)
        var n1 = this.mappedX(xView.max)
        var n = n0 + this.clamp(position.x / bounds.width, 0, 1) * (n1 - n0)
        return {
            x: this.unmappedX(n),
            y: this.yRange.min + this.clamp(1 - position.y / bounds.height, 0, 1) * (this.yRange.max - this.yRange.min)
        }
    }

    eventPosition(event){
        // Prefer plot-group CTM so pan translateX stays in content space.
        var target = this._plotGroup || this.svg
        if (target && this.svg && this.svg.createSVGPoint && target.getScreenCTM) {
            var ctm = target.getScreenCTM()
            if (ctm) {
                var point = this.svg.createSVGPoint()
                point.x = event.clientX
                point.y = event.clientY
                var local = point.matrixTransform(ctm.inverse())
                return {x: local.x, y: local.y}
            }
        }
        var rect = this.svg.getBoundingClientRect()
        return {x: event.clientX - rect.left - this._plotTranslateX, y: event.clientY - rect.top}
    }

    getPointFromTarget(target){
        if (!target) return null
        var el = typeof target.closest === 'function' ? target.closest('[data-point-id]') : target
        var id = el && el.dataset ? el.dataset.pointId : null
        return id ? this.points.find(point => point.id === id) : null
    }

    getHandleFromTarget(point, target){
        if (!point || !target) return null
        var el = typeof target.closest === 'function' ? target.closest('[data-handle-id]') : target
        var id = el && el.dataset ? el.dataset.handleId : null
        return id ? point.handles.find(handle => handle.id === id) : null
    }

    // pointerdown.detail is always 0; preventDefault also suppresses dblclick in Chromium.
    isDoublePointClick(point, event){
        if (!point || !event) return false
        var last = this._lastPointClick
        var now = performance.now()
        var isDouble = !!(last
            && last.id === point.id
            && (now - last.time) <= 400
            && Math.hypot(event.clientX - last.x, event.clientY - last.y) <= 8)
        this._lastPointClick = isDouble
            ? null
            : {id: point.id, time: now, x: event.clientX, y: event.clientY}
        return isDouble
    }

    beginShiftScroll(){
        if (this.shiftScroll) return
        var axis = this.orientation === 'vertical' ? 'x' : 'y'
        this.shiftScroll = {
            axis: axis,
            baseline: this.points.map(point => ({id: point.id, value: point[axis]})),
            offset: 0,
            targetOffset: 0,
            raf: 0
        }
        document.addEventListener('keyup', this._onShiftScrollKeyUp)
    }

    getShiftScrollBounds(session){
        var range = session.axis === 'x' ? this.xRange : this.yRange
        var values = []
        for (var i = 0; i < session.baseline.length; i++) {
            var item = session.baseline[i]
            var point = this.points.find(p => p.id === item.id)
            if (!this.pointAllowsAxis(point, session.axis)) continue
            values.push(item.value)
        }
        if (!values.length) {
            return {min: 0, max: 0, range: range}
        }
        return {
            min: range.min - Math.max(...values),
            max: range.max - Math.min(...values),
            range: range
        }
    }

    clampShiftScrollOffsets(session){
        var bounds = this.getShiftScrollBounds(session)
        session.targetOffset = this.clamp(session.targetOffset, bounds.min, bounds.max)
        session.offset = this.clamp(session.offset, bounds.min, bounds.max)
    }

    endShiftScroll(){
        if (!this.shiftScroll) return
        var session = this.shiftScroll
        if (session.raf) {
            cancelAnimationFrame(session.raf)
            session.raf = 0
        }
        this.clampShiftScrollOffsets(session)
        session.offset = session.targetOffset
        this.applyShiftScrollOffset()
        this.render()
        this.notifyPointsChanged(this.points.find(point => point.id === this.activePointId))
        this.shiftScroll = null
        document.removeEventListener('keyup', this._onShiftScrollKeyUp)
    }

    ensureShiftScrollTween(){
        var session = this.shiftScroll
        if (!session || session.raf) return
        var step = () => {
            if (!this.shiftScroll) return
            var current = this.shiftScroll
            this.clampShiftScrollOffsets(current)
            var delta = current.targetOffset - current.offset
            if (Math.abs(delta) < 0.0005) {
                current.offset = current.targetOffset
                current.raf = 0
                this.applyShiftScrollOffset()
                this.render()
                this.notifyPointsChanged(this.points.find(point => point.id === this.activePointId))
                return
            }
            current.offset += delta * 0.28
            this.applyShiftScrollOffset()
            this.render()
            this.notifyPointsChanged(this.points.find(point => point.id === this.activePointId))
            current.raf = requestAnimationFrame(step)
        }
        session.raf = requestAnimationFrame(step)
    }

    applyShiftScrollOffset(){
        var session = this.shiftScroll
        if (!session) return
        var bounds = this.getShiftScrollBounds(session)
        this.clampShiftScrollOffsets(session)
        var byId = new Map(session.baseline.map(item => [item.id, item.value]))
        for (var index = 0; index < this.points.length; index++) {
            var point = this.points[index]
            if (!this.pointAllowsAxis(point, session.axis)) continue
            var base = byId.has(point.id) ? byId.get(point.id) : point[session.axis]
            point[session.axis] = this.clamp(base + session.offset, bounds.range.min, bounds.range.max)
        }
    }

    handlePointerDown(event){
        if (!this.editable || event.button !== 0) return
        this.endShiftScroll()
        var point = this.getPointFromTarget(event.target)
        if (point && this.isDoublePointClick(point, event)) {
            var pressAction = this.getPointAction(point, 'mouse', 'doubleclick')
            this.drag = null
            if (pressAction != null && this.runPointAction(point, pressAction, event)) {
                event.preventDefault()
                event.stopPropagation()
                return
            }
        }
        var bounds = this.getBounds()
        var position = this.eventPosition(event)
        var isCurve = event.target && event.target.dataset && event.target.dataset.curve === 'true'
        if (!point && !isCurve && this.dragEmptySpaceMovesAll) {
            this.svg.focus({preventScroll: true})
            this.drag = {mode: 'moveAll', startPosition: position, startPoints: this.getPoints(), moved: false, startClientX: event.clientX, startClientY: event.clientY}
            this.svg.setPointerCapture(event.pointerId)
            event.preventDefault()
            return
        }
        if (!point && !isCurve) return
        if (!point) {
            if (this.allowAddPoints === false) return
            point = this.addPoint(this.toValue(position, bounds), false)
        }
        this.activePointId = point.id
        this.svg.focus({preventScroll: true})
        var handle = this.getHandleFromTarget(point, event.target)
        this.drag = handle
            ? {id: point.id, handleId: handle.id, startPosition: position, startValue: handle.value, startPoint: this.clonePoint(point), moved: false, startClientX: event.clientX, startClientY: event.clientY}
            : event.altKey
                ? {id: point.id, mode: 'moveAllVertical', startPosition: position, startPoints: this.getPoints(), moved: false, startClientX: event.clientX, startClientY: event.clientY}
                : {id: point.id, axis: point.dragAxis === 'x' || point.dragAxis === 'y' ? point.dragAxis : 'both', moved: false, startClientX: event.clientX, startClientY: event.clientY}
        this.svg.setPointerCapture(event.pointerId)
        // Don't snap the point onto the cursor on press — that fights double-click.
        this.render()
        event.preventDefault()
    }

    handlePointerMove(event){
        if (!this.drag) {
            if (this.hoverHighlight) {
                var hoverPoint = this.getPointFromTarget(event.target)
                this.setHoveredPointId(hoverPoint ? hoverPoint.id : null)
            }
            return
        }
        if (!this.drag.moved) {
            var travel = Math.hypot(
                event.clientX - (this.drag.startClientX || 0),
                event.clientY - (this.drag.startClientY || 0)
            )
            if (travel > 4) {
                this.drag.moved = true
                this.emitEditStart()
            }
        }
        var position = this.eventPosition(event)
        var bounds = this.getBounds()
        if (this.drag.handleId) this.moveHandle(this.drag, position, bounds)
        else if (this.drag.mode === 'moveAll') this.moveAllPoints(this.drag, position, bounds)
        else if (this.drag.mode === 'moveAllVertical') this.moveAllPointsVertically(this.drag, position, bounds)
        else this.movePoint(this.drag.id, position, bounds, this.drag.axis, false)
        this.render()
        this.notifyPointsChanged(this.points.find(point => point.id === this.drag.id))
    }

    setHoveredPointId(id, opt = {}){
        var next = id || null
        if (next && !this.points.some(point => point.id === next)) next = null
        if (this.hoveredPointId === next) return
        this.hoveredPointId = next
        if (opt.render !== false) this.render()
        if (opt.notify !== false && typeof this.onHoveredPointChanged === 'function') {
            this.onHoveredPointChanged(this.hoveredPointId, this)
        }
    }

    emitEditStart(){
        if (typeof this.onEditStart === 'function') this.onEditStart(this)
    }

    emitEditEnd(moved, point){
        if (!moved) return
        if (typeof this.onEditEnd === 'function') this.onEditEnd(this.getPoints(), point ? {...point} : null, this)
    }

    handlePointerUp(event){
        if (!this.drag) return
        var drag = this.drag
        var point = this.points.find(item => item.id === drag.id)
        var moved = !!drag.moved
        this.drag = null
        if (this.svg.hasPointerCapture(event.pointerId)) this.svg.releasePointerCapture(event.pointerId)
        // Click (no drag) on a point — not on a handle / move-all gesture.
        if (
            point
            && !moved
            && !drag.handleId
            && drag.mode !== 'moveAll'
            && drag.mode !== 'moveAllVertical'
        ) {
            var clickAction = this.getPointAction(point, 'mouse', 'click')
            if (clickAction != null && this.runPointAction(point, clickAction, event)) {
                event.preventDefault()
                return
            }
        }
        this.notifyPointsChanged(point)
        this.emitEditEnd(moved, point)
    }

    handleDoubleClick(event){
        // Backup path when the browser still emits dblclick (pointer path is primary).
        if (!this.editable) return
        var point = this.getPointFromTarget(event.target)
        if (!point) return
        var action = this.getPointAction(point, 'mouse', 'doubleclick')
        if (action == null) return
        this._lastPointClick = null
        if (this.runPointAction(point, action, event)) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    handleKeyDown(event){
        if (!this.editable) return
        var isDeleteKey = event.key === 'Delete' || event.key === 'Backspace'
            || event.code === 'Delete' || event.code === 'Backspace'
        var point = this.points.find(item => item.id === this.activePointId)
        var action = point
            ? this.getPointAction(point, 'keyboard', event.key)
                || this.getPointAction(point, 'keyboard', event.code)
                || (isDeleteKey ? this.getPointAction(point, 'keyboard', 'Delete') : null)
                || (isDeleteKey ? this.getPointAction(point, 'keyboard', 'Backspace') : null)
            : null
        if (action != null && this.runPointAction(point, action, event)) {
            event.preventDefault()
            event.stopPropagation()
            return
        }
        if (isDeleteKey) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    handleWheel(event){
        if (!this.editable) return
        // Shift+wheel soft-clamps against a Shift-held baseline; tween like volume curve.
        // Only scrolling along the value axis shifts it: left/right (deltaX) when values run
        // across the screen ('vertical'), up/down (deltaY) when they run up it.
        if (event.shiftKey && this.points.length) {
            var vertical = this.orientation === 'vertical'
            var range = vertical
                ? this.xRange.max - this.xRange.min
                : this.yRange.max - this.yRange.min
            var delta = vertical ? event.deltaX : event.deltaY
            if (!delta) {
                event.preventDefault()
                return
            }
            this.beginShiftScroll()
            this.shiftScroll.targetOffset += -Math.sign(delta) * range * 0.025
            this.clampShiftScrollOffsets(this.shiftScroll)
            this.ensureShiftScrollTween()
            event.preventDefault()
            return
        }
        if (this.handlePointWheel(event)) event.preventDefault()
    }

    handlePointWheel(event){
        var point = this.getPointFromTarget(event.target)
        if (!point) return false
        this.endShiftScroll()

        var wheelAction = this.getPointAction(point, 'mouse', 'wheel')
        if (wheelAction != null) {
            this.activePointId = point.id
            return this.runPointAction(point, wheelAction, event)
        }

        var handle = (point.handles || []).find(item => item.wheel)
        if (!handle) return false
        var dir = -Math.sign(event.deltaY || event.deltaX)
        if (!dir) return false

        var next
        if (Number.isFinite(handle.wheelStep) && handle.wheelStep > 0) {
            next = handle.value + dir * handle.wheelStep * ((event.altKey || event.ctrlKey || event.metaKey) ? 0.25 : 1)
        } else {
            var factor = Number.isFinite(handle.wheelFactor) && handle.wheelFactor > 1 ? handle.wheelFactor : 1.08
            if (event.altKey || event.ctrlKey || event.metaKey) factor = 1 + (factor - 1) * 0.35
            next = handle.value * (dir > 0 ? factor : 1 / factor)
        }
        var max = handle.max === Infinity ? Number.POSITIVE_INFINITY : handle.max
        next = this.clamp(next, handle.min, max)
        this.activePointId = point.id
        if (next !== handle.value) {
            handle.value = next
            if (typeof handle.onChanged === 'function') {
                handle.onChanged(handle.value, this.clonePoint(point), {...handle, offset: {...handle.offset}}, this)
            } else {
                this.notifyPointsChanged(point)
            }
        }
        this.render()
        return true
    }

    movePoint(id, position, bounds, axis, notify = true){
        var point = this.points.find(item => item.id === id)
        if (!point) return
        var value = this.toValue(position, bounds)
        var lockedAxis = this.orientation === 'vertical' ? 'y' : 'x'
        if (axis !== 'y' && !(lockedAxis === 'x' && this.lockEdgePoints && this.isLockedEdgePoint(point))) point.x = value.x
        if (axis !== 'x' && !(lockedAxis === 'y' && this.lockEdgePoints && this.isLockedEdgePoint(point))) point.y = value.y
        this.clampPointToNeighbors(point)
        this.snapPointValue(point)
        this.sortPoints()
        if (notify) this.notifyPointsChanged(point)
    }

    moveHandle(drag, position, bounds){
        var point = this.points.find(item => item.id === drag.id)
        if (!point) return
        var handle = point.handles.find(item => item.id === drag.handleId)
        if (!handle) return
        var distance = handle.axis === 'y'
            ? drag.startPosition.y - position.y
            : position.x - drag.startPosition.x
        var dragDistance = handle.dragDistance || (handle.axis === 'y' ? bounds.height : bounds.width)
        var normalizedDistance = distance / dragDistance
        var info = {
            distance: distance,
            normalizedDistance: normalizedDistance,
            delta: {x: position.x - drag.startPosition.x, y: position.y - drag.startPosition.y},
            position: {...position},
            startPosition: {...drag.startPosition},
            bounds: {...bounds},
            startValue: drag.startValue,
            point: this.clonePoint(point),
            startPoint: drag.startPoint,
            handle: {...handle, offset: {...handle.offset}},
            editor: this,
            setValue: value => {
                if (Number.isFinite(value)) handle.value = this.clamp(value, handle.min, handle.max)
            },
            setPoint: patch => this.updatePoint(point.id, patch, false)
        }
        if (handle.action === 'move') {
            this.movePointByDistance(point, drag.startPoint, distance, bounds, handle.axis)
            return
        }
        if (typeof handle.action === 'function') {
            handle.action(info)
            return
        }
        var value
        if (handle.valueFromPosition) {
            value = handle.valueFromPosition(info)
        } else {
            var span = handle.max - handle.min
            value = drag.startValue + normalizedDistance * span
        }
        if (!Number.isFinite(value)) return
        handle.value = this.clamp(value, handle.min, handle.max)
        if (handle.onChanged) handle.onChanged(handle.value, this.clonePoint(point), {...handle, offset: {...handle.offset}}, this)
    }

    movePointByDistance(point, startPoint, distance, bounds, axis){
        if (axis === 'x') {
            if (this.orientation === 'horizontal' && this.lockEdgePoints && this.isLockedEdgePoint(startPoint)) return
            point.x = this.clamp(startPoint.x + distance / bounds.width * (this.xRange.max - this.xRange.min), this.xRange.min, this.xRange.max)
            this.clampPointToNeighbors(point)
            this.snapPointToCenter(point)
            this.sortPoints()
        } else {
            if (this.orientation === 'vertical' && this.lockEdgePoints && this.isLockedEdgePoint(startPoint)) return
            point.y = this.clamp(startPoint.y + distance / bounds.height * (this.yRange.max - this.yRange.min), this.yRange.min, this.yRange.max)
            this.clampPointToNeighbors(point)
            this.snapPointToCenter(point)
            this.sortPoints()
        }
    }

    getHandleOffset(point, handle, bounds){
        if (!handle.offsetFromValue) return handle.offset
        var offset = handle.offsetFromValue({
            bounds: {...bounds},
            point: this.clonePoint(point),
            handle: {...handle, offset: {...handle.offset}},
            editor: this
        })
        return {...handle.offset, ...(offset || {})}
    }

    moveAllPointsVertically(drag, position, bounds){
        var requestedOffset = (drag.startPosition.y - position.y) / bounds.height * (this.yRange.max - this.yRange.min)
        this.offsetAllPointsVertically(requestedOffset, drag.startPoints)
    }

    moveAllPoints(drag, position, bounds){
        if (this.orientation === 'vertical') {
            var horizontalOffset = (position.x - drag.startPosition.x) / bounds.width * (this.xRange.max - this.xRange.min)
            this.offsetAllPointsHorizontally(horizontalOffset, drag.startPoints)
            return
        }
        var verticalOffset = (drag.startPosition.y - position.y) / bounds.height * (this.yRange.max - this.yRange.min)
        this.offsetAllPointsVertically(verticalOffset, drag.startPoints)
    }

    offsetAllPointsVertically(requestedOffset, sourcePoints = this.points){
        var movable = []
        for (var index = 0; index < this.points.length; index++) {
            if (!this.pointAllowsAxis(this.points[index], 'y')) continue
            movable.push({point: this.points[index], startY: sourcePoints[index].y})
        }
        if (!movable.length) return
        var minimumOffset = Math.max(...movable.map(item => this.yRange.min - item.startY))
        var maximumOffset = Math.min(...movable.map(item => this.yRange.max - item.startY))
        var offset = this.clamp(requestedOffset, minimumOffset, maximumOffset)
        for (var i = 0; i < movable.length; i++) movable[i].point.y = movable[i].startY + offset
    }

    offsetAllPointsHorizontally(requestedOffset, sourcePoints = this.points){
        var minimumOffset = Math.max(...sourcePoints.map(point => this.xRange.min - point.x))
        var maximumOffset = Math.min(...sourcePoints.map(point => this.xRange.max - point.x))
        var offset = this.clamp(requestedOffset, minimumOffset, maximumOffset)
        for (var index = 0; index < this.points.length; index++) this.points[index].x = sourcePoints[index].x + offset
    }

    notifyPointsChanged(activePoint){
        if (this.onPointsChanged) this.onPointsChanged(this.getPoints(), activePoint ? {...activePoint} : null, this)
    }

    makeSvgElement(name, attributes){
        var element = document.createElementNS('http://www.w3.org/2000/svg', name)
        for (var name in attributes) element.setAttribute(name, attributes[name])
        return element
    }

    renderCustomLayer(renderer, layer, bounds){
        if (!renderer) return
        renderer({
            layer: layer,
            svg: this.svg,
            bounds: {...bounds},
            points: this.getPoints(),
            xRange: {...this.xRange},
            yRange: {...this.yRange},
            toCanvas: point => this.toCanvas(point, bounds),
            toValue: position => this.toValue(position, bounds),
            createElement: (name, attributes = {}) => this.makeSvgElement(name, attributes),
            labelAttributes: {
                fill: this.labelColor,
                'font-family': this.labelFont,
                'font-size': this.labelFontSize,
                'pointer-events': 'none'
            }
        })
    }

    applyYRuler(config){
        var next = config && typeof config === 'object' ? config : {}
        this.yRuler = {
            visible: !!next.visible,
            position: next.position === 'outside' ? 'outside' : 'inside',
            width: Number.isFinite(next.width) ? Math.max(20, next.width) : 42,
            ticks: Array.isArray(next.ticks) ? next.ticks : [],
            format: typeof next.format === 'function' ? next.format : (value => String(value)),
            columns: Array.isArray(next.columns) ? next.columns : null
        }
        this.style.overflow = this.yRuler.visible && this.yRuler.position === 'outside' ? 'visible' : 'hidden'
        this.element.style.setProperty(
            '--sk_ui_multiPointCurveEditor_plotLeft',
            this.yRuler.visible && this.yRuler.position === 'outside' ? this.yRuler.width + 'px' : '0px'
        )
        this._cachedBounds = null
        if (this.yRuler.visible && this.yRuler.position === 'outside') {
            if (!this.yRulerSvg) {
                this.yRulerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                this.yRulerSvg.setAttribute('preserveAspectRatio', 'none')
                this.yRulerSvg.style.display = 'block'
                this.yRulerSvg.style.height = 'auto'
                this.yRulerSvg.style.position = 'absolute'
                this.yRulerSvg.style.left = '0'
                this.yRulerSvg.style.top = '0'
                this.yRulerSvg.style.overflow = 'visible'
                this.yRulerSvg.style.pointerEvents = 'none'
                this.yRulerSvg.style.zIndex = '2'
                this.yRulerSvg.setAttribute('overflow', 'visible')
                this.element.appendChild(this.yRulerSvg)
            }
            this.yRulerSvg.style.width = this.yRuler.width + 'px'
        }
    }

    renderYRuler(bounds){
        if (!this.yRuler.visible) return
        var columns = this.yRuler.columns
        var hasColumns = columns && columns.length
        if (!hasColumns && !Array.isArray(this.yRuler.ticks)) return
        var isOutside = this.yRuler.position === 'outside'
        var layer = isOutside ? this.yRulerSvg : this.svg
        if (!layer) return
        if (isOutside) {
            var pad = Math.ceil((this.labelFontSize || 11) * 0.55) + 2
            var rulerH = bounds.height + pad * 2
            layer.style.top = -pad + 'px'
            layer.style.bottom = 'auto'
            layer.style.height = rulerH + 'px'
            layer.setAttribute('overflow', 'visible')
            layer.setAttribute('viewBox', '0 ' + (-pad) + ' ' + this.yRuler.width + ' ' + rulerH)
            layer.replaceChildren()
        }
        if (hasColumns) {
            var x = isOutside ? 2 : 6
            for (var c = 0; c < columns.length; c++) {
                var col = columns[c] || {}
                var colW = Number.isFinite(col.width) ? col.width : (this.yRuler.width - 4) / columns.length
                var colAlign = col.align === 'start' || col.align === 'middle' ? col.align : 'end'
                var padLeft = Number.isFinite(col.padLeft) ? col.padLeft : 0
                var tickX = colAlign === 'start'
                    ? x + padLeft
                    : (colAlign === 'middle' ? x + colW / 2 : x + colW - (isOutside ? 2 : 0))
                this.renderYRulerTicks(layer, bounds, col.ticks || [], col.format || this.yRuler.format, {
                    x: tickX,
                    align: colAlign,
                    markX: col.marks ? x + colW - (isOutside ? 1 : 0) : null
                })
                x += colW
            }
            return
        }
        this.renderYRulerTicks(layer, bounds, this.yRuler.ticks, this.yRuler.format, {
            x: isOutside ? this.yRuler.width - 5 : 6,
            align: isOutside ? 'end' : 'start'
        })
    }

    renderYRulerTicks(layer, bounds, ticks, format, opt){
        if (!layer || !Array.isArray(ticks)) return
        var align = opt && (opt.align === 'start' || opt.align === 'middle') ? opt.align : 'end'
        var x = opt && Number.isFinite(opt.x) ? opt.x : 6
        var markX = opt && Number.isFinite(opt.markX) ? opt.markX : null
        for (var index = 0; index < ticks.length; index++) {
            var tick = ticks[index]
            var value = tick && typeof tick === 'object' ? tick.value : tick
            var text = tick && typeof tick === 'object' && tick.text != null
                ? String(tick.text)
                : (typeof format === 'function' ? format(value) : String(value))
            if (!Number.isFinite(value)) continue
            if (!text && markX == null) continue
            var position = this.toCanvas({x: this.xRange.min, y: value}, bounds)
            var major = tick && typeof tick === 'object' ? !!tick.major || !!text : !!text
            if (markX != null && !(tick && typeof tick === 'object' && tick.mark === false)) {
                var markLen = major ? 7 : 4
                layer.appendChild(this.makeSvgElement('line', {
                    x1: markX - markLen,
                    y1: position.y,
                    x2: markX,
                    y2: position.y,
                    stroke: this.labelColor,
                    'stroke-width': major ? 1 : 0.75,
                    'stroke-opacity': major ? 0.72 : 0.38,
                    'pointer-events': 'none'
                }))
            }
            if (!text) continue
            var baseline = 'central'
            if (position.y <= 1) baseline = 'hanging'
            else if (position.y >= bounds.height - 1) baseline = 'text-after-edge'
            var dy = tick && typeof tick === 'object' && Number.isFinite(tick.dy) ? tick.dy : 0
            var label = this.makeSvgElement('text', {
                x: x,
                y: position.y + dy,
                fill: this.labelColor,
                'font-family': this.labelFont,
                'font-size': this.labelFontSize,
                'text-anchor': align,
                'dominant-baseline': baseline,
                'pointer-events': 'none'
            })
            label.textContent = text
            layer.appendChild(label)
        }
    }

    renderGuides(bounds){
        if (!this.guides || !this.guides.length) return
        for (var i = 0; i < this.guides.length; i++) {
            var guide = this.guides[i]
            if (!guide || !Number.isFinite(guide.y)) continue
            var y = this.toCanvas({x: this.xRange.min, y: guide.y}, bounds).y
            this.svg.appendChild(this.makeSvgElement('line', {
                x1: 0,
                y1: y,
                x2: bounds.width,
                y2: y,
                class: 'sk_ui_multiPointCurveEditor_guide',
                stroke: guide.stroke || 'rgba(255,255,255,0.2)',
                'stroke-width': Number.isFinite(guide.strokeWidth) ? guide.strokeWidth : 1
            }))
        }
    }

    renderXRuler(bounds){
        if (!this.xRuler.visible || !Array.isArray(this.xRuler.ticks)) return
        var isOutside = this.xRuler.position === 'outside'
        var layer = isOutside ? this.xRulerSvg : this.svg
        if (!layer) return
        if (isOutside) {
            layer.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + this.xRuler.height)
            layer.replaceChildren()
        }
        for (var index = 0; index < this.xRuler.ticks.length; index++) {
            var value = this.xRuler.ticks[index]
            if (!Number.isFinite(value)) continue
            var x = this.toCanvas({x: value, y: this.yRange.min}, bounds).x
            var isFirstEdge = x <= 1
            var isLastEdge = x >= bounds.width - 1
            var label = this.makeSvgElement('text', {
                x: isFirstEdge ? 4 : (isLastEdge ? bounds.width - 4 : x),
                y: isOutside ? this.labelFontSize + 2 : bounds.height - 5,
                fill: this.labelColor,
                'font-family': this.labelFont,
                'font-size': this.labelFontSize,
                'text-anchor': isFirstEdge ? 'start' : (isLastEdge ? 'end' : 'middle'),
                'pointer-events': 'none'
            })
            label.textContent = this.xRuler.format(value)
            layer.appendChild(label)
        }
    }

    createCurvePath(points, bounds){
        if (!points.length) return ''
        var positions = points.map(point => this.toCanvas(point, bounds))
        if (positions.length === 1) return 'M ' + positions[0].x + ' ' + positions[0].y
        var primaryAxis = this.orientation === 'vertical' ? 'y' : 'x'
        var secondaryAxis = this.orientation === 'vertical' ? 'x' : 'y'
        var slopes = []
        for (var index = 0; index < positions.length - 1; index++) {
            var span = positions[index + 1][primaryAxis] - positions[index][primaryAxis]
            slopes.push(span === 0 ? 0 : (positions[index + 1][secondaryAxis] - positions[index][secondaryAxis]) / span)
        }
        var tangents = positions.map((position, index) => {
            if (index === 0) return slopes[0]
            if (index === positions.length - 1) return slopes[slopes.length - 1]
            if (slopes[index - 1] * slopes[index] <= 0) return 0
            return (slopes[index - 1] + slopes[index]) / 2
        })
        for (var index = 0; index < slopes.length; index++) {
            var slope = slopes[index]
            if (slope === 0) {
                tangents[index] = 0
                tangents[index + 1] = 0
                continue
            }
            var startRatio = tangents[index] / slope
            var endRatio = tangents[index + 1] / slope
            if (startRatio < 0 || endRatio < 0) {
                tangents[index] = 0
                tangents[index + 1] = 0
                continue
            }
            var ratioLength = Math.sqrt(startRatio * startRatio + endRatio * endRatio)
            if (ratioLength > 3) {
                var scale = 3 / ratioLength
                tangents[index] = scale * startRatio * slope
                tangents[index + 1] = scale * endRatio * slope
            }
        }
        var path = 'M ' + positions[0].x + ' ' + positions[0].y
        for (var index = 0; index < positions.length - 1; index++) {
            var current = positions[index]
            var next = positions[index + 1]
            var segmentSpan = next[primaryAxis] - current[primaryAxis]
            var outgoingDistance = segmentSpan * this.curveTension * points[index].curve.out
            var incomingDistance = segmentSpan * this.curveTension * points[index + 1].curve.in
            var totalControlDistance = outgoingDistance + incomingDistance
            if (totalControlDistance > segmentSpan) {
                var distanceScale = segmentSpan / totalControlDistance
                outgoingDistance *= distanceScale
                incomingDistance *= distanceScale
            }
            var minimumSecondary = Math.min(current[secondaryAxis], next[secondaryAxis])
            var maximumSecondary = Math.max(current[secondaryAxis], next[secondaryAxis])
            var controlOne = {x: current.x, y: current.y}
            var controlTwo = {x: next.x, y: next.y}
            controlOne[primaryAxis] = current[primaryAxis] + outgoingDistance
            controlOne[secondaryAxis] = this.clamp(current[secondaryAxis] + tangents[index] * outgoingDistance, minimumSecondary, maximumSecondary)
            controlTwo[primaryAxis] = next[primaryAxis] - incomingDistance
            controlTwo[secondaryAxis] = this.clamp(next[secondaryAxis] - tangents[index + 1] * incomingDistance, minimumSecondary, maximumSecondary)
            path += ' C ' + controlOne.x + ' ' + controlOne.y + ', ' + controlTwo.x + ' ' + controlTwo.y + ', ' + next.x + ' ' + next.y
        }
        return path
    }

    createPolylinePath(points, bounds){
        if (!points.length) return 'M 0 0'
        var first = this.toCanvas(points[0], bounds)
        var path = 'M ' + first.x + ' ' + first.y
        for (var index = 1; index < points.length; index++) {
            var position = this.toCanvas(points[index], bounds)
            path += ' L ' + position.x + ' ' + position.y
        }
        return path
    }

    createSplinePath(points, bounds){
        var s = this._curveSmoothing
        if (s <= 0 || points.length < 3) return this.createPolylinePath(points, bounds)
        var refined = sk_ui_multiPointCurveEditor.smoothPolyline(points, s)
        var first = this.toCanvas(refined[0], bounds)
        var path = 'M ' + first.x + ' ' + first.y
        for (var i = 1; i < refined.length; i++) {
            var pos = this.toCanvas(refined[i], bounds)
            path += ' L ' + pos.x + ' ' + pos.y
        }
        return path
    }

    createBezierPath(points, bounds){
        if (!points.length) return 'M 0 0'
        var first = this.toCanvas(points[0], bounds)
        var path = 'M ' + first.x + ' ' + first.y
        for (var i = 1; i < points.length; i++) {
            var prev = points[i - 1]
            var next = points[i]
            var c1 = this.toCanvas({
                x: prev.x + (prev.bezierOut && prev.bezierOut.x || 0),
                y: prev.y + (prev.bezierOut && prev.bezierOut.y || 0)
            }, bounds)
            var c2 = this.toCanvas({
                x: next.x + (next.bezierIn && next.bezierIn.x || 0),
                y: next.y + (next.bezierIn && next.bezierIn.y || 0)
            }, bounds)
            var end = this.toCanvas(next, bounds)
            path += ' C ' + c1.x + ' ' + c1.y + ', ' + c2.x + ' ' + c2.y + ', ' + end.x + ' ' + end.y
        }
        return path
    }

    geometryPathData(bounds){
        if (!this.points.length) return 'M 0 0'
        if (this.bezierHandles) return this.createBezierPath(this.points, bounds)
        if (this._curveSmoothing > 0) return this.createSplinePath(this.points, bounds)
        if (!this.curveTension) return this.createPolylinePath(this.points, bounds)
        return this.createCurvePath(this.points, bounds)
    }

    // Remap path/dots in place after xRange/yRange changes. Avoids replaceChildren
    // thrash during spectrogram time pan/zoom (volume curve overlay).
    syncGeometry(){
        if (!this.svg || this._suspendRender) return
        if (!this._curvePath || !this._pointDots || !this._geometryPointIds || !this._plotGroup) {
            this.render()
            return
        }
        var ids = this.points.map(point => point.id).join('|')
        if (ids !== this._geometryPointIds) {
            this.render()
            return
        }
        // Active handles need a full rebuild; volume curve has none.
        var active = this.points.find(point => point.id === this.activePointId)
        if (active && active.handles && active.handles.length) {
            this.render()
            return
        }
        var bounds = this.getBounds()
        var pathData = this.geometryPathData(bounds)
        if (this._curveHitPath) this._curveHitPath.setAttribute('d', pathData)
        if (this._curveOutlinePath) {
            this._curveOutlinePath.setAttribute('d', pathData)
            this._curveOutlinePath.style.display = this.points.length ? '' : 'none'
        }
        if (this._curvePath) {
            this._curvePath.setAttribute('d', pathData)
            this._curvePath.style.display = this.points.length ? '' : 'none'
        }
        if (this._curveHitPath) this._curveHitPath.style.display = this.points.length ? '' : 'none'
        for (var point of this.points) {
            var dot = this._pointDots.get(point.id)
            if (!dot) {
                this.render()
                return
            }
            var position = this.toCanvas(point, bounds)
            dot.setAttribute('cx', position.x)
            dot.setAttribute('cy', position.y)
        }
        this.setPlotTranslateX(0)
        if (!this.viewXRange) {
            var viewBox = '0 0 ' + bounds.width + ' ' + bounds.height
            if (this._lastViewBox !== viewBox) {
                this._lastViewBox = viewBox
                this.svg.setAttribute('viewBox', viewBox)
            }
        } else {
            this.applyViewBox()
        }
    }

    render(){
        if (!this.svg || this._suspendRender) return
        var bounds = this.measureBounds()
        this.svg.replaceChildren()
        this._curvePath = null
        this._curveOutlinePath = null
        this._curveHitPath = null
        this._pointDots = new Map()
        this._plotGroup = null
        this._geometryPointIds = this.points.map(point => point.id).join('|')

        var backgroundLayer = this.makeSvgElement('g', {'data-layer': 'background'})
        this.svg.appendChild(backgroundLayer)
        this.renderCustomLayer(this.renderBackground, backgroundLayer, bounds)
        this.renderYRuler(bounds)
        this.renderXRuler(bounds)

        this.renderGuides(bounds)
        if (this.grid.visible) {
            for (var xIndex = 1; xIndex < this.grid.xDivisions; xIndex++) {
                var x = bounds.width * xIndex / this.grid.xDivisions
                this.svg.appendChild(this.makeSvgElement('line', {x1: x, y1: 0, x2: x, y2: bounds.height, class: 'sk_ui_multiPointCurveEditor_grid', stroke: 'rgba(255,255,255,0.08)', 'stroke-width': 1}))
            }
            for (var yIndex = 1; yIndex < this.grid.yDivisions; yIndex++) {
                var y = bounds.height * yIndex / this.grid.yDivisions
                this.svg.appendChild(this.makeSvgElement('line', {x1: 0, y1: y, x2: bounds.width, y2: y, class: 'sk_ui_multiPointCurveEditor_grid', stroke: 'rgba(255,255,255,0.08)', 'stroke-width': 1}))
            }
        }

        var plotGroup = this.makeSvgElement('g', {'data-layer': 'plot'})
        this._plotGroup = plotGroup
        this.svg.appendChild(plotGroup)

        var curvePathData = this.geometryPathData(bounds)
        var curveHitPath = this.makeSvgElement('path', {d: curvePathData, fill: 'none', stroke: 'transparent', 'stroke-width': Math.max(12, this.curveThickness + 10)})
        curveHitPath.dataset.curve = 'true'
        curveHitPath.style.pointerEvents = 'stroke'
        curveHitPath.style.display = this.points.length ? '' : 'none'
        plotGroup.appendChild(curveHitPath)
        this._curveHitPath = curveHitPath
        if (this.curveOutlineColor && this.curveOutlineWidth > this.curveThickness) {
            var outlinePath = this.makeSvgElement('path', {
                d: curvePathData,
                class: 'sk_ui_multiPointCurveEditor_curveOutline',
                fill: 'none',
                stroke: this.curveOutlineColor,
                'stroke-width': this.curveOutlineWidth,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
            })
            outlinePath.style.pointerEvents = 'none'
            outlinePath.style.display = this.points.length ? '' : 'none'
            plotGroup.appendChild(outlinePath)
            this._curveOutlinePath = outlinePath
        }
        var curvePath = this.makeSvgElement('path', {d: curvePathData, class: 'sk_ui_multiPointCurveEditor_curve', fill: 'none', stroke: this.curveColor, 'stroke-width': this.curveThickness, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'})
        curvePath.dataset.curve = 'true'
        curvePath.style.pointerEvents = 'stroke'
        curvePath.style.display = this.points.length ? '' : 'none'
        plotGroup.appendChild(curvePath)
        this._curvePath = curvePath

        if (this.showPoints) for (var point of this.points) {
            var position = this.toCanvas(point, bounds)
            var isActive = point.id === this.activePointId
            var isHovered = !isActive && point.id === this.hoveredPointId
            var groupClass = 'sk_ui_multiPointCurveEditor_point'
            if (isActive) groupClass += ' sk_ui_multiPointCurveEditor_point_active'
            else if (isHovered) groupClass += ' sk_ui_multiPointCurveEditor_point_hover'
            var group = this.makeSvgElement('g', {class: groupClass})
            group.dataset.pointId = point.id
            group.style.pointerEvents = 'auto'
            if (Number.isFinite(point.opacity)) {
                group.style.opacity = String(Math.max(0, Math.min(1, point.opacity)))
            }
            var pointFill = point.color || this.pointColor
            var pointActiveFill = point.activeColor || point.color || this.activePointColor
            var pointHoverFill = point.hoverColor || point.color || this.hoverPointColor
            var pointStroke = point.borderColor || this.pointBorderColor
            var pointActiveStroke = point.activeBorderColor || point.borderColor || this.activePointBorderColor
            var pointHoverStroke = point.hoverBorderColor || point.borderColor || this.hoverPointBorderColor
            var handleStroke = point.color || this.handleColor
            if (isActive || this.bezierHandles) {
                for (var handle of point.handles) {
                    if (!isActive && handle.kind !== 'bezier') continue
                    var handleOffset = this.getHandleOffset(point, handle, bounds)
                    var handlePosition = {x: position.x + handleOffset.x, y: position.y + handleOffset.y}
                    var hitArea = this.makeSvgElement('rect', {x: handlePosition.x - 10, y: handlePosition.y - 10, width: 20, height: 20, fill: 'transparent', class: 'sk_ui_multiPointCurveEditor_handleHitArea'})
                    hitArea.dataset.pointId = point.id
                    hitArea.dataset.handleId = handle.id
                    hitArea.dataset.axis = handle.axis
                    hitArea.style.pointerEvents = 'auto'
                    var handleLine = this.makeSvgElement('line', {x1: position.x, y1: position.y, x2: handlePosition.x, y2: handlePosition.y, class: 'sk_ui_multiPointCurveEditor_handle', stroke: handleStroke})
                    handleLine.dataset.pointId = point.id
                    handleLine.dataset.handleId = handle.id
                    handleLine.dataset.axis = handle.axis
                    var thumbW = Number.isFinite(handle.thumbWidth) && handle.thumbWidth > 0 ? handle.thumbWidth : 8
                    var thumbH = Number.isFinite(handle.thumbHeight) && handle.thumbHeight > 0 ? handle.thumbHeight : 8
                    var thumbRx = Number.isFinite(handle.thumbRx) ? Math.max(0, handle.thumbRx) : 2
                    var thumbFill = handle.thumbFill || this.handleFillColor
                    var thumbStroke = handle.thumbStroke != null ? handle.thumbStroke : handleStroke
                    var handleThumb = this.makeSvgElement('rect', {
                        x: handlePosition.x - thumbW / 2,
                        y: handlePosition.y - thumbH / 2,
                        width: thumbW,
                        height: thumbH,
                        rx: thumbRx,
                        class: 'sk_ui_multiPointCurveEditor_thumb',
                        fill: thumbFill,
                        stroke: thumbStroke
                    })
                    handleThumb.dataset.pointId = point.id
                    handleThumb.dataset.handleId = handle.id
                    handleThumb.dataset.axis = handle.axis
                    handleThumb.style.pointerEvents = 'auto'
                    handleThumb.style.fill = thumbFill
                    if (thumbStroke) handleThumb.style.stroke = thumbStroke
                    group.append(hitArea, handleLine, handleThumb)
                }
            }
            var hitPad = this.makeSvgElement('circle', {
                cx: position.x,
                cy: position.y,
                r: this.pointHitRadius,
                fill: 'transparent'
            })
            hitPad.dataset.pointId = point.id
            hitPad.style.pointerEvents = 'auto'
            group.appendChild(hitPad)
            var radius = isActive ? this.pointRadiusActive : (isHovered ? this.pointRadiusHover : this.pointRadius)
            var fill = isActive ? pointActiveFill : (isHovered ? pointHoverFill : pointFill)
            var stroke = isActive ? pointActiveStroke : (isHovered ? pointHoverStroke : pointStroke)
            var dot = this.makeSvgElement('circle', {
                cx: position.x,
                cy: position.y,
                r: radius,
                class: 'sk_ui_multiPointCurveEditor_dot',
                fill: fill,
                stroke: stroke,
                'stroke-width': this.pointStrokeWidth
            })
            dot.style.fill = fill
            dot.style.stroke = stroke
            dot.style.pointerEvents = 'none'
            dot.dataset.pointId = point.id
            group.appendChild(dot)
            this._pointDots.set(point.id, dot)
            plotGroup.appendChild(group)
        }

        var foregroundLayer = this.makeSvgElement('g', {'data-layer': 'foreground'})
        this.svg.appendChild(foregroundLayer)
        this.renderCustomLayer(this.renderForeground, foregroundLayer, bounds)
        this.setPlotTranslateX(this._plotTranslateX)
        if (!this.viewXRange) {
            var viewBox = '0 0 ' + bounds.width + ' ' + bounds.height
            this._lastViewBox = viewBox
            this.svg.setAttribute('viewBox', viewBox)
            this.svg.setAttribute('preserveAspectRatio', 'none')
        } else {
            this.applyViewBox()
        }
    }

    onRemove(){
        if (this.resizeObserver) this.resizeObserver.disconnect()
    }
}

sk_ui_multiPointCurveEditor.SMOOTH_MAX = 10
sk_ui_multiPointCurveEditor.SMOOTH_REF = 2.5

sk_ui_multiPointCurveEditor.clampSmooth = function(value){
    var n = Number(value)
    if (!Number.isFinite(n) || n < 0) return 0
    return Math.min(sk_ui_multiPointCurveEditor.SMOOTH_MAX, n)
}

sk_ui_multiPointCurveEditor.quad2 = function(p0, p1, p2, t){
    var u = 1 - t
    return u * u * p0 + 2 * u * t * p1 + t * t * p2
}

sk_ui_multiPointCurveEditor.quadYAtX = function(a, c, b, x){
    var x0 = a.x
    var x1 = b.x
    if (x <= Math.min(x0, x1)) return x0 <= x1 ? a.y : b.y
    if (x >= Math.max(x0, x1)) return x0 <= x1 ? b.y : a.y
    var lo = 0
    var hi = 1
    var t = 0.5
    for (var i = 0; i < 22; i++) {
        t = (lo + hi) * 0.5
        var xt = sk_ui_multiPointCurveEditor.quad2(a.x, c.x, b.x, t)
        if ((x0 <= x1 && xt < x) || (x0 > x1 && xt > x)) lo = t
        else hi = t
    }
    return sk_ui_multiPointCurveEditor.quad2(a.y, c.y, b.y, t)
}

sk_ui_multiPointCurveEditor.cubic2 = function(p0, p1, p2, p3, t){
    var u = 1 - t
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

sk_ui_multiPointCurveEditor.cubicYAtX = function(a, c1, c2, b, x){
    var x0 = a.x
    var x1 = b.x
    if (x <= Math.min(x0, x1)) return x0 <= x1 ? a.y : b.y
    if (x >= Math.max(x0, x1)) return x0 <= x1 ? b.y : a.y
    var lo = 0
    var hi = 1
    var t = 0.5
    for (var i = 0; i < 24; i++) {
        t = (lo + hi) * 0.5
        var xt = sk_ui_multiPointCurveEditor.cubic2(a.x, c1.x, c2.x, b.x, t)
        if ((x0 <= x1 && xt < x) || (x0 > x1 && xt > x)) lo = t
        else hi = t
    }
    return sk_ui_multiPointCurveEditor.cubic2(a.y, c1.y, c2.y, b.y, t)
}

sk_ui_multiPointCurveEditor.isFlatTurn = function(prev, curr, next, yAlign){
    var ay = curr.y - prev.y
    var by = next.y - curr.y
    if (Math.abs(ay) <= yAlign && Math.abs(by) <= yAlign) return true
    var ax = curr.x - prev.x
    var bx = next.x - curr.x
    var al = Math.hypot(ax, ay)
    var bl = Math.hypot(bx, by)
    if (al < 1e-14 || bl < 1e-14) return true
    var cross = (ax * by - ay * bx) / (al * bl)
    var dot = (ax * bx + ay * by) / (al * bl)
    return Math.abs(cross) < 0.04 && dot > 0.9
}

sk_ui_multiPointCurveEditor.filletCut = function(amount){
    var s = sk_ui_multiPointCurveEditor.clampSmooth(amount)
    if (s <= 0) return 0
    if (s <= sk_ui_multiPointCurveEditor.SMOOTH_REF) return 0.5 * (s / sk_ui_multiPointCurveEditor.SMOOTH_REF)
    return 0.5 + 0.42 * (s - sk_ui_multiPointCurveEditor.SMOOTH_REF) / (sk_ui_multiPointCurveEditor.SMOOTH_MAX - sk_ui_multiPointCurveEditor.SMOOTH_REF)
}

sk_ui_multiPointCurveEditor.plotSpace = function(points, opt){
    var xRange = opt && opt.xRange
    var yRange = opt && opt.yRange
    var xMin = xRange && Number.isFinite(xRange.min) ? xRange.min : points[0].x
    var xMax = xRange && Number.isFinite(xRange.max) ? xRange.max : points[points.length - 1].x
    var yMin = yRange && Number.isFinite(yRange.min) ? yRange.min : points[0].y
    var yMax = yRange && Number.isFinite(yRange.max) ? yRange.max : points[0].y
    if (!yRange) {
        for (var i = 1; i < points.length; i++) {
            if (points[i].y < yMin) yMin = points[i].y
            if (points[i].y > yMax) yMax = points[i].y
        }
    }
    return {
        xMin: xMin,
        yMin: yMin,
        xSpan: Math.max(1e-9, xMax - xMin),
        ySpan: Math.max(1e-9, yMax - yMin)
    }
}

sk_ui_multiPointCurveEditor.toNorm = function(p, space){
    return {
        x: (p.x - space.xMin) / space.xSpan,
        y: (p.y - space.yMin) / space.ySpan
    }
}

sk_ui_multiPointCurveEditor.filletPieces = function(points, amount){
    var list = points || []
    var n = list.length
    if (n < 3) return []
    var cut = sk_ui_multiPointCurveEditor.filletCut(amount)
    if (cut <= 0) return []
    var yAlign = 0.002
    var k = 0.55
    var pieces = []
    var cursor = {x: list[0].x, y: list[0].y}
    for (var i = 1; i < n - 1; i++) {
        var prev = list[i - 1]
        var curr = list[i]
        var next = list[i + 1]
        if (sk_ui_multiPointCurveEditor.isFlatTurn(prev, curr, next, yAlign)) {
            pieces.push({kind: 'line', a: cursor, b: {x: curr.x, y: curr.y}})
            cursor = {x: curr.x, y: curr.y}
            continue
        }
        var inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y)
        var outLen = Math.hypot(next.x - curr.x, next.y - curr.y)
        var d = cut * Math.min(inLen, outLen)
        if (d < 1e-8 || inLen < 1e-12 || outLen < 1e-12) {
            pieces.push({kind: 'line', a: cursor, b: {x: curr.x, y: curr.y}})
            cursor = {x: curr.x, y: curr.y}
            continue
        }
        var uInx = (curr.x - prev.x) / inLen
        var uIny = (curr.y - prev.y) / inLen
        var uOutx = (next.x - curr.x) / outLen
        var uOuty = (next.y - curr.y) / outLen
        var start = {x: curr.x - uInx * d, y: curr.y - uIny * d}
        var end = {x: curr.x + uOutx * d, y: curr.y + uOuty * d}
        var c1 = {x: start.x + uInx * d * k, y: start.y + uIny * d * k}
        var c2 = {x: end.x - uOutx * d * k, y: end.y - uOuty * d * k}
        pieces.push({kind: 'line', a: cursor, b: start})
        pieces.push({kind: 'cubic', a: start, c1: c1, c2: c2, b: end})
        cursor = end
    }
    pieces.push({kind: 'line', a: cursor, b: {x: list[n - 1].x, y: list[n - 1].y}})
    return pieces
}

sk_ui_multiPointCurveEditor.pieceMaxX = function(piece){
    if (!piece) return 0
    if (piece.kind === 'cubic') return Math.max(piece.a.x, piece.c1.x, piece.c2.x, piece.b.x)
    if (piece.kind === 'quad') return Math.max(piece.a.x, piece.c.x, piece.b.x)
    return Math.max(piece.a.x, piece.b.x)
}

sk_ui_multiPointCurveEditor.evalFilletY = function(points, x, amount){
    var list = points || []
    var last = list[list.length - 1]
    var pieces = sk_ui_multiPointCurveEditor.filletPieces(list, amount)
    if (!pieces.length) {
        for (var i = 1; i < list.length; i++) {
            if (x <= list[i].x) {
                var a = list[i - 1]
                var b = list[i]
                var span = b.x - a.x
                var u = span > 1e-12 ? (x - a.x) / span : 0
                return a.y + (b.y - a.y) * u
            }
        }
        return last.y
    }
    for (var p = 0; p < pieces.length; p++) {
        var piece = pieces[p]
        if (x > sk_ui_multiPointCurveEditor.pieceMaxX(piece) && p < pieces.length - 1) continue
        if (piece.kind === 'cubic') return sk_ui_multiPointCurveEditor.cubicYAtX(piece.a, piece.c1, piece.c2, piece.b, x)
        if (piece.kind === 'quad') return sk_ui_multiPointCurveEditor.quadYAtX(piece.a, piece.c, piece.b, x)
        var dx = piece.b.x - piece.a.x
        var t = dx > 1e-12 ? (x - piece.a.x) / dx : 0
        return piece.a.y + (piece.b.y - piece.a.y) * t
    }
    return last.y
}

sk_ui_multiPointCurveEditor.bsplineKnots = function(n, degree){
    var knots = []
    var i
    for (i = 0; i <= degree; i++) knots.push(0)
    var internal = n - degree
    for (i = 1; i < internal; i++) knots.push(i / internal)
    for (i = 0; i <= degree; i++) knots.push(1)
    return knots
}

sk_ui_multiPointCurveEditor.bsplineSpan = function(n, degree, u, knots){
    if (u >= knots[n]) return n - 1
    if (u <= knots[degree]) return degree
    var low = degree
    var high = n
    while (high - low > 1) {
        var mid = (low + high) >> 1
        if (u < knots[mid]) high = mid
        else low = mid
    }
    return low
}

sk_ui_multiPointCurveEditor.deBoor = function(values, knots, degree, u){
    var n = values.length
    if (n === 1) return values[0]
    if (u <= 0) return values[0]
    if (u >= 1) return values[n - 1]
    var span = sk_ui_multiPointCurveEditor.bsplineSpan(n, degree, u, knots)
    var d = []
    for (var j = 0; j <= degree; j++) d[j] = values[span - degree + j]
    for (var r = 1; r <= degree; r++) {
        for (var j = degree; j >= r; j--) {
            var i = span - degree + j
            var denom = knots[i + degree + 1 - r] - knots[i]
            var a = denom > 1e-12 ? (u - knots[i]) / denom : 0
            d[j] = (1 - a) * d[j - 1] + a * d[j]
        }
    }
    return d[degree]
}

sk_ui_multiPointCurveEditor.evalBsplineY = function(points, x){
    var list = points || []
    var n = list.length
    if (n < 2) return list.length ? list[0].y : 0
    var degree = Math.min(3, n - 1)
    var knots = sk_ui_multiPointCurveEditor.bsplineKnots(n, degree)
    var xs = list.map(p => p.x)
    var ys = list.map(p => p.y)
    var lo = 0
    var hi = 1
    var u = 0.5
    for (var i = 0; i < 32; i++) {
        u = (lo + hi) * 0.5
        var xu = sk_ui_multiPointCurveEditor.deBoor(xs, knots, degree, u)
        if (xu < x) lo = u
        else hi = u
    }
    return sk_ui_multiPointCurveEditor.deBoor(ys, knots, degree, u)
}

sk_ui_multiPointCurveEditor.evalPolylineY = function(points, x){
    var list = points || []
    if (!list.length) return 0
    if (x <= list[0].x) return list[0].y
    var last = list[list.length - 1]
    if (x >= last.x) return last.y
    for (var i = 1; i < list.length; i++) {
        if (x <= list[i].x) {
            var a = list[i - 1]
            var b = list[i]
            var span = b.x - a.x
            var u = span > 1e-12 ? (x - a.x) / span : 0
            return a.y + (b.y - a.y) * u
        }
    }
    return last.y
}

sk_ui_multiPointCurveEditor.relaxInteriorY = function(points, t){
    var list = points || []
    if (t <= 0 || list.length < 3) return list
    var pts = sk_ui_multiPointCurveEditor.copyXY(list)
    var amount = Math.max(0, Math.min(1, t))
    var rounds = 1 + Math.round(amount * 8)
    var mix = amount * 0.72
    if (mix <= 0) return pts
    for (var r = 0; r < rounds; r++) {
        var next = []
        next.push({x: pts[0].x, y: pts[0].y})
        for (var i = 1; i < pts.length - 1; i++) {
            var avg = (pts[i - 1].y + pts[i + 1].y) * 0.5
            next.push({x: pts[i].x, y: pts[i].y + (avg - pts[i].y) * mix})
        }
        next.push({x: pts[pts.length - 1].x, y: pts[pts.length - 1].y})
        pts = next
    }
    return pts
}

sk_ui_multiPointCurveEditor.copyXY = function(points){
    var out = []
    for (var i = 0; i < points.length; i++) out.push({x: points[i].x, y: points[i].y})
    return out
}

sk_ui_multiPointCurveEditor.refineMidpoints = function(pts){
    var out = [{x: pts[0].x, y: pts[0].y}]
    for (var i = 0; i < pts.length - 1; i++) {
        out.push({
            x: (pts[i].x + pts[i + 1].x) * 0.5,
            y: (pts[i].y + pts[i + 1].y) * 0.5
        })
        out.push({x: pts[i + 1].x, y: pts[i + 1].y})
    }
    return out
}

sk_ui_multiPointCurveEditor.averageOpen = function(pts, t){
    if (pts.length < 3 || t <= 0) return pts
    var out = [{x: pts[0].x, y: pts[0].y}]
    for (var i = 1; i < pts.length - 1; i++) {
        var ax = 0.25 * pts[i - 1].x + 0.5 * pts[i].x + 0.25 * pts[i + 1].x
        var ay = 0.25 * pts[i - 1].y + 0.5 * pts[i].y + 0.25 * pts[i + 1].y
        out.push({
            x: pts[i].x + (ax - pts[i].x) * t,
            y: pts[i].y + (ay - pts[i].y) * t
        })
    }
    out.push({x: pts[pts.length - 1].x, y: pts[pts.length - 1].y})
    return out
}

sk_ui_multiPointCurveEditor.laneRiesenfeldCubic = function(pts, t){
    var q = sk_ui_multiPointCurveEditor.refineMidpoints(pts)
    for (var i = 0; i < 3; i++) q = sk_ui_multiPointCurveEditor.averageOpen(q, t)
    return q
}

sk_ui_multiPointCurveEditor.smoothPolyline = function(points, amount){
    var list = points || []
    var s = sk_ui_multiPointCurveEditor.clampSmooth(amount)
    if (s <= 0 || list.length < 3) return list
    // Knob 10 = full Lane-Riesenfeld (old 2.5…3). That matches RX Smooth 10.
    var t = s / sk_ui_multiPointCurveEditor.SMOOTH_MAX
    var pts = sk_ui_multiPointCurveEditor.copyXY(list)
    for (var r = 0; r < 4; r++) pts = sk_ui_multiPointCurveEditor.laneRiesenfeldCubic(pts, t)
    return pts
}

sk_ui_multiPointCurveEditor.evalNurbsXY = function(points, u){
    var list = points || []
    var n = list.length
    if (!n) return {x: 0, y: 0}
    if (n === 1) return {x: list[0].x, y: list[0].y}
    var degree = Math.min(3, n - 1)
    var knots = sk_ui_multiPointCurveEditor.bsplineKnots(n, degree)
    var xs = []
    var ys = []
    for (var i = 0; i < n; i++) {
        xs.push(list[i].x)
        ys.push(list[i].y)
    }
    var uu = Math.max(0, Math.min(1, u))
    return {
        x: sk_ui_multiPointCurveEditor.deBoor(xs, knots, degree, uu),
        y: sk_ui_multiPointCurveEditor.deBoor(ys, knots, degree, uu)
    }
}

sk_ui_multiPointCurveEditor.evalY = function(points, x, smoothing){
    var list = points || []
    if (!list.length) return 0
    if (list.length === 1) return list[0].y
    if (x <= list[0].x) return list[0].y
    var last = list[list.length - 1]
    if (x >= last.x) return last.y
    var s = sk_ui_multiPointCurveEditor.clampSmooth(smoothing)
    if (s <= 0 || list.length < 3) return sk_ui_multiPointCurveEditor.evalPolylineY(list, x)
    return sk_ui_multiPointCurveEditor.evalPolylineY(
        sk_ui_multiPointCurveEditor.smoothPolyline(list, s),
        x
    )
}

sk_ui_multiPointCurveEditor.bezierControl = function(point, side){
    var offset = side === 'out' ? point.bezierOut : point.bezierIn
    return {
        x: point.x + (offset && Number.isFinite(offset.x) ? offset.x : 0),
        y: point.y + (offset && Number.isFinite(offset.y) ? offset.y : 0)
    }
}

sk_ui_multiPointCurveEditor.evalBezierY = function(points, x){
    var list = points || []
    if (!list.length) return 0
    if (list.length === 1) return list[0].y
    if (x <= list[0].x) return list[0].y
    var last = list[list.length - 1]
    if (x >= last.x) return last.y
    for (var i = 1; i < list.length; i++) {
        if (x <= list[i].x) {
            var a = list[i - 1]
            var b = list[i]
            return sk_ui_multiPointCurveEditor.cubicYAtX(
                a,
                sk_ui_multiPointCurveEditor.bezierControl(a, 'out'),
                sk_ui_multiPointCurveEditor.bezierControl(b, 'in'),
                b,
                x
            )
        }
    }
    return last.y
}
