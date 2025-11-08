class SK_Rubberband {
    constructor() {
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        this.contentWidth = 0;
        this.contentHeight = 0;

        this.overshootX = 200;
        this.overshootY = 200;

        this.allowScrollX = true;
        this.allowScrollY = true;
        
        this.lastDragTime = 0;

        this.velX = 0;
        this.lastDragX = 0;
        

        this.snapbackEasing = 'outElastic'
        this.programmaticScrollEasing = 'outQuad'


        this.tweenX = new SK_Tween({
            speed: 10,
            easing: this.snapbackEasing,
            onChanged: res => {
                this.onPositionCalculated(res.current, this.tweenY.current);
            }
        })


        this.velY = 0;
        this.lastDragY = 0;

        this.tweenY = new SK_Tween({
            speed: 10,
            easing: this.snapbackEasing,
            onChanged: res => {
                this.onPositionCalculated(this.tweenX.current, res.current);
            }
        })

        
    }

    fire_onPositionCalculated(x, y) {
        if (x === this.lastPos.x && y === this.lastPos.y) return
        this.lastPos = { x, y };
        this.onPositionCalculated(x, y);
    }

    updateSize(viewportWidth, viewportHeight, contentWidth, contentHeight) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;

        this.canScrollX = this.contentWidth > this.viewportWidth;
        this.canScrollY = this.contentHeight > this.viewportHeight;

        if (!this.canScrollX || !this.canScrollY) {
            if (!this.canScrollX){
                if (this.contentWidth < this.viewportWidth){
                    this.tweenX.current = 0;
                } else {
                    var diffFromRight = this.contentWidth - (this.viewportWidth - (this.tweenX.current || 0));
                    if (diffFromRight < 0) {
                        this.tweenX.current = this.viewportWidth - this.contentWidth;
                    }
                }
            }


            if (!this.canScrollY){
                if (this.contentHeight < this.viewportHeight){
                    this.tweenY.current = 0;
                } else {
                    var diffFromBottom = this.contentWidth - (this.viewportHeight - (this.tweenY.current || 0));
                    if (diffFromBottom < 0) {
                        this.tweenY.current = this.viewportHeight - this.contentHeight;
                    }
                }
            }

            this.onPositionCalculated(this.tweenX.current, this.tweenY.current);
        }
    }

    
    startDrag(x, y) {
        this.dragging = true;
        this.wheeling = false;
        this.programmaticScroll = false;

        this.tweenX.easing = this.snapbackEasing;
        this.tweenY.easing = this.snapbackEasing;

        this.mdPos = { x, y };
        
        this.startOffsetX = this.tweenX.current || 0;
        this.startOffsetY = this.tweenY.current || 0;

        if (this.canScrollX) {
            this.velX = 0;
            this.lastDragX = x;
            this.tweenX.stop();
        }

        if (this.canScrollY) {
            this.velY = 0;
            this.lastDragY = y;
            this.tweenY.stop();
    }
        
        this.lastDragTime = Date.now();
    }

    endDrag() {
        this.dragging = false;

        if (this.canScrollX) {
            const minX = this.viewportWidth - this.contentWidth;
            const maxX = 0;

            if (this.tweenX.current > maxX || this.tweenX.current < minX) {
                this.beginSnapBackX();
            } else if (Math.abs(this.velX) > 0.5) {
                this.beginInertiaX(this.velX);
            }
        } else {
            this.beginSnapBackX();
        }

        if (this.canScrollY) {
            const minY = this.viewportHeight - this.contentHeight;
            const maxY = 0;

            if (this.tweenY.current > maxY || this.tweenY.current < minY) {
                this.beginSnapBackY();
            } else if (Math.abs(this.velY) > 0.5) {
                this.beginInertiaY(this.velY);
            }
        } else {
            this.beginSnapBackY();
        }
    }



    updatePosition(x, y) {
        let newX = this.canScrollX ? x : this.tweenX.current;
        let newY = this.canScrollY ? y : this.tweenY.current;

        this.notify(newX, newY);
    }

    notify(x, y) {
        var now = Date.now();
        var dt = (now - this.lastDragTime) || 16; // fallback 16ms

        var diff = {
            x: x - this.mdPos.x,
            y: y - this.mdPos.y
        }

        diff.x += this.startOffsetX;
        diff.y += this.startOffsetY;


        var minX = this.viewportWidth - this.contentWidth;
        var maxX = 0;

        var minY = this.viewportHeight - this.contentHeight;
        var maxY = 0;

        const dampingFactor = 0.5;

        if (this.canScrollX){
            if (diff.x > maxX) {
                var overshoot = diff.x - maxX;
                diff.x = maxX + dampingFactor * this.overshootX * (1 - Math.exp(-overshoot / this.overshootX));
            } else if (diff.x < minX) {
                var overshoot = minX - diff.x;
                diff.x = minX - dampingFactor * this.overshootX * (1 - Math.exp(-overshoot / this.overshootX));
            }
        } else {
            diff.x = 0
        }

        
        if (this.canScrollY){
            if (diff.y > maxY) {
                var overshoot = diff.y - maxY;
                diff.y = maxY + dampingFactor * this.overshootY * (1 - Math.exp(-overshoot / this.overshootY));
            } else if (diff.y < minY) {
                var overshoot = minY - diff.y;
                diff.y = minY - dampingFactor * this.overshootY * (1 - Math.exp(-overshoot / this.overshootY));
            }
        } else {
            diff.y = 0
        }

        // calculate velocity
        this.velX = (diff.x - this.tweenX.current) / dt * 16; // scaled to 60fps
        this.velY = (diff.y - this.tweenY.current) / dt * 16; // scaled to 60fps

        this.lastDragX = x;
        this.lastDragY = y;
        this.lastDragTime = now;

        this.tweenX.current = diff.x;
        this.tweenY.current = diff.y;

        this.onPositionCalculated(diff.x, diff.y);
    }



    beginSnapBackX() {
        if (this.tweenX.current >= 0) return this.tweenX.to(0)
        
        var diffX = this.contentWidth - this.viewportWidth
        if (this.tweenX.current < 0-diffX) this.tweenX.to(0-diffX)
    }



    beginSnapBackY() {
        if (this.tweenY.current >= 0) return this.tweenY.to(0)
        
        var diffY = this.contentHeight - this.viewportHeight
        if (this.tweenY.current < 0-diffY) this.tweenY.to(0-diffY)
    }

    beginInertiaX(initialVel) {
        let velocity = initialVel;
        const friction = 0.95;
        const minVel = 0.1;
        var maxRubber = this.overshootX; // max soft overshoot

        const step = () => {
            velocity *= friction;
            this.tweenX.current += velocity;

            const min = this.viewportWidth - this.contentWidth;
            const max = 0;

            // overscroll / natural rubber-band
            if (this.tweenX.current > max) {
                let overshoot = this.tweenX.current - max;
                // asymptotic resistance curve
                let resisted = maxRubber * (1 - 1 / ((overshoot / maxRubber) + 1));
                this.tweenX.current = max + resisted;
                velocity *= 0.7; // slow down sliding in overshoot
            } else if (this.tweenX.current < min) {
                let overshoot = min - this.tweenX.current;
                let resisted = maxRubber * (1 - 1 / ((overshoot / maxRubber) + 1));
                this.tweenX.current = min - resisted;
                velocity *= 0.7;
            }

            this.onPositionCalculated(this.tweenX.current, this.tweenY.current);

            if (Math.abs(velocity) > minVel) {
                if (!this.wheeling && this.dragging) return;
                requestAnimationFrame(step);
            } else {
                // gently snap back to bounds using tween
                this.beginSnapBackX();
            }
        }

        step();
    }

    beginInertiaY(initialVel) {
        let velocity = initialVel;
        const friction = 0.95;
        const minVel = 0.1;
        var maxRubber = this.overshootY; // max soft overshoot

        const step = () => {
            velocity *= friction;
            this.tweenY.current += velocity;

            const min = this.viewportHeight - this.contentHeight;
            const max = 0;

            // overscroll / natural rubber-band
            if (this.tweenY.current > max) {
                let overshoot = this.tweenY.current - max;
                // asymptotic resistance curve
                let resisted = maxRubber * (1 - 1 / ((overshoot / maxRubber) + 1));
                this.tweenY.current = max + resisted;
                velocity *= 0.7; // slow down sliding in overshoot
            } else if (this.tweenY.current < min) {
                let overshoot = min - this.tweenY.current;
                let resisted = maxRubber * (1 - 1 / ((overshoot / maxRubber) + 1));
                this.tweenY.current = min - resisted;
                velocity *= 0.7;
            }

            this.onPositionCalculated(this.tweenX.current, this.tweenY.current);

            if (Math.abs(velocity) > minVel) {
                if (!this.wheeling && this.dragging) return; // stop inertia if dragging again
                requestAnimationFrame(step);
            } else {
                // gently snap back to bounds using tween
                this.beginSnapBackY();
            }
        }

        step();
    }


    handleWheelEvent(deltaX, deltaY) {
        if (!this.canScrollX && !this.canScrollY) return;

        this.mdPos = { x: this.tweenX.current, y: this.tweenY.current };
        this.tweenX.stop();
        this.tweenY.stop();

        if (this.canScrollX) this.velX = -deltaX * 0.1;
        if (this.canScrollY) this.velY = -deltaY * 0.1;

        this.wheeling = true;

        if (this.canScrollX) this.beginInertiaX(this.velX);
        if (this.canScrollY) this.beginInertiaY(this.velY);
    }

    scrollTo(x, y, animate = true, usePercent = false) {
        this.tweenX.easing = this.programmaticScrollEasing;
        this.tweenY.easing = this.programmaticScrollEasing;

        const minX = this.viewportWidth - this.contentWidth;
        const maxX = 0;
        const minY = this.viewportHeight - this.contentHeight;
        const maxY = 0;

        let targetX = x || this.tweenX.current;
        let targetY = y || this.tweenY.current;

        if (usePercent) {
            // Convert percentages (0-1) into pixel positions
            targetX = minX + (maxX - minX) * x;
            targetY = minY + (maxY - minY) * y;
        }

        // Clamp to bounds
        targetX = Math.max(Math.min(targetX, maxX), minX);
        targetY = Math.max(Math.min(targetY, maxY), minY);

        if (animate) {
            if (this.canScrollX) this.tweenX.to(targetX);
            if (this.canScrollY) this.tweenY.to(targetY);
        } else {
            if (this.canScrollX) this.tweenX.current = targetX;
            if (this.canScrollY) this.tweenY.current = targetY;
            this.onPositionCalculated(this.tweenX.current, this.tweenY.current);
        }
    }
}