class sk_ui_tree extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.styling = 'ttb fullwidth'
        this.compact = true
        this.vertical = true

        this._collapsed = new Set()
        this._recs = new Map()
        this._folds = new Map()
        this._items = []
        this._selected = []
        this._rename = null
        this._ignoreClick = false

        this.attributes.add({
            friendlyName: 'Items',
            name: 'items',
            type: 'object',
            onSet: val => {
                this._items = Array.isArray(val) ? val : []
                this.rebuild()
            }
        })

        this.attributes.add({
            friendlyName: 'Selected',
            name: 'selected',
            type: 'object',
            onSet: val => {
                this._selected = Array.isArray(val) ? val.map(String) : (val != null ? [String(val)] : [])
                this.syncSelected()
            }
        })
    }

    getItem(id) {
        return this._recs.get(String(id)) || null
    }

    getFold(id) {
        return this._folds.get(String(id)) || null
    }

    isFolded(id) {
        return this._collapsed.has(String(id))
    }

    fold(id, open) {
        const key = String(id)
        const wantOpen = open !== false
        if (wantOpen) this._collapsed.delete(key)
        else this._collapsed.add(key)
        this.setCaret(key, wantOpen)
        this.animateFold(key, wantOpen)
    }

    toggleFold(id) {
        this.fold(id, this.isFolded(id))
    }

    clear() {
        this._recs.clear()
        this._folds.clear()
        this._rename = null
        if (this.children?.clear) this.children.clear()
        else while (this.element.firstChild) {
            const el = this.element.firstChild
            if (el.sk_ui_obj) el.sk_ui_obj.remove()
            else el.remove()
        }
    }

    rebuild() {
        const collapsed = new Set(this._collapsed)
        this.clear()
        this._collapsed = collapsed
        for (const item of this._items) this.mountItem(item, this, 0)
        this.syncSelected()
        if (this.onReady) this.onReady(this)
    }

    mountItem(item, host, depth) {
        if (!item) return null
        if (item.type === 'custom' || typeof item.mount === 'function') {
            const wrap = host.add.component(_c => {
                _c.vertical = true
                _c.styling = 'ttb fullwidth'
                _c.compact = true
                _c.classAdd('sk_ui_tree_custom')
                if (item.className) _c.classAdd(item.className)
            })
            const rec = { id: item.id, item, row: wrap, custom: true, depth }
            if (item.id != null) this._recs.set(String(item.id), rec)
            try { item.mount(wrap, rec, this) } catch (err) { console.error(err) }
            return rec
        }

        const hasKids = Array.isArray(item.children) && item.children.length > 0
        const foldId = hasKids ? String(item.id) : null
        const rec = this.addRow({
            host,
            depth,
            item,
            foldId,
            id: item.id,
            icon: item.icon,
            label: item.label,
            failed: !!item.failed,
            suppressed: !!item.suppressed,
            rolled: !!item.rolled,
            selected: this._selected.includes(String(item.id))
        })

        if (hasKids) {
            const fold = this.addFold(foldId, host)
            for (const child of item.children) this.mountItem(child, fold, depth + 1)
        }
        return rec
    }

    addRow(opt) {
        const host = opt.host || this
        const item = opt.item || {}
        const row = host.add.component(_c => {
            _c.vertical = false
            _c.styling = 'fullwidth left middle'
            _c.compact = true
            _c.classAdd('sk_ui_tree_row')
            if (opt.failed) _c.classAdd('is-failed')
            if (opt.suppressed) _c.classAdd('is-suppressed')
            if (opt.rolled) _c.classAdd('is-rolled')
            _c.element.style.setProperty('--sk_ui_tree_depth', String(opt.depth || 0))
        })

        const caret = row.add.component(_c => {
            _c.vertical = false
            _c.compact = true
            _c.classAdd('sk_ui_tree_caret')
        })

        let caretIcon = null
        if (opt.foldId) {
            caret.add.icon(ic => {
                caretIcon = ic
                ic.icon = this.isFolded(opt.foldId) ? 'caret right' : 'caret down'
                ic.size = 10
            })
            caret.element.addEventListener('click', e => {
                e.preventDefault()
                e.stopPropagation()
                this.toggleFold(opt.foldId)
            })
            caret.element.addEventListener('dblclick', e => {
                e.preventDefault()
                e.stopPropagation()
            })
        }

        const btn = row.add.roundedBtn(_c => {
            _c.onClick = e => {
                if (this._ignoreClick) return
                if (this.onSelect) this.onSelect(item, e)
            }
            _c.icon = opt.icon || ''
            _c.text = opt.label || ''
            _c.size = 12
            _c.styling += ' fullwidth left middle'
            _c.classAdd('sk_ui_tree_item')
            _c.onDoubleClick = () => {
                if (this._rename) return
                if (this.onEdit) this.onEdit(item)
            }
            _c.onMouseEnter = () => { if (this.onEnter) this.onEnter(item) }
            _c.onMouseLeave = () => { if (this.onLeave) this.onLeave(item) }
        })

        if (this.onContextMenu) {
            btn.contextMenu.items = () => this.onContextMenu(item) || []
        }

        btn.toggled = !!opt.selected

        const rec = {
            id: opt.id,
            item,
            row,
            btn,
            label: btn.label,
            caretIcon,
            foldId: opt.foldId || null,
            depth: opt.depth || 0
        }
        if (opt.id != null) this._recs.set(String(opt.id), rec)
        if (this.onRow) this.onRow(rec, item)
        return rec
    }

    addFold(id, host) {
        const parent = host || this
        const fold = parent.add.component(_c => {
            _c.vertical = true
            _c.styling = 'ttb fullwidth'
            _c.compact = true
            _c.classAdd('sk_ui_tree_fold')
        })
        this._folds.set(String(id), fold)
        fold.element.style.minHeight = '0px'
        if (this.isFolded(id)) {
            fold.element.style.height = '0px'
            fold.element.style.overflow = 'hidden'
        }
        return fold
    }

    setCaret(id, open) {
        const rec = this.getItem(id)
        if (rec?.caretIcon) rec.caretIcon.icon = open ? 'caret down' : 'caret right'
    }

    animateFold(id, open) {
        const wrap = this.getFold(id)?.element
        if (!wrap) return
        if (wrap._foldEnd) {
            wrap.removeEventListener('transitionend', wrap._foldEnd)
            wrap._foldEnd = null
        }
        const from = wrap.getBoundingClientRect().height
        wrap.classList.remove('sk_ui_tree_fold_anim')
        wrap.style.overflow = 'hidden'
        if (open) {
            wrap.style.height = 'auto'
            const to = wrap.scrollHeight
            wrap.style.height = from + 'px'
            wrap.getBoundingClientRect()
            wrap.classList.add('sk_ui_tree_fold_anim')
            wrap.style.height = to + 'px'
            const done = ev => {
                if (ev?.propertyName && ev.propertyName !== 'height') return
                wrap.style.height = 'auto'
                wrap.style.overflow = ''
                wrap.classList.remove('sk_ui_tree_fold_anim')
                wrap.removeEventListener('transitionend', done)
                wrap._foldEnd = null
            }
            wrap._foldEnd = done
            wrap.addEventListener('transitionend', done)
            return
        }
        wrap.style.height = from + 'px'
        wrap.getBoundingClientRect()
        wrap.classList.add('sk_ui_tree_fold_anim')
        wrap.style.height = '0px'
    }

    syncSelected() {
        const set = new Set(this._selected.map(String))
        for (const rec of this._recs.values()) {
            if (!rec?.btn || rec.custom) continue
            rec.btn.toggled = set.has(String(rec.id))
        }
    }

    setRowState(id, state = {}) {
        const rec = this.getItem(id)
        if (!rec?.row) return
        if ('failed' in state) rec.row['class' + (state.failed ? 'Add' : 'Remove')]('is-failed')
        if ('suppressed' in state) rec.row['class' + (state.suppressed ? 'Add' : 'Remove')]('is-suppressed')
        if ('rolled' in state) rec.row['class' + (state.rolled ? 'Add' : 'Remove')]('is-rolled')
        if ('icon' in state && rec.btn) rec.btn.icon = state.icon
        if ('label' in state && rec.label && this._rename?.id !== String(id)) rec.label.text = state.label
        if ('selected' in state && rec.btn) rec.btn.toggled = !!state.selected
    }

    beginRename(id, opt = {}) {
        this.endRename(false)
        const rec = this.getItem(id)
        if (!rec?.row || !rec.label || rec.custom) return
        rec.row.classAdd('sk_ui_tree_renaming')
        rec.label.element.style.display = 'none'
        const field = rec.row.add.input(_c => {
            _c.value = opt.value != null ? String(opt.value) : (rec.item?.label || '')
            _c.classAdd('sk_ui_tree_rename')
        })
        const inp = field.input
        this._rename = { id: String(id), inp, field, rec, opt }
        const finish = commit => {
            if (this._rename?.inp !== inp) return
            this.endRename(commit)
        }
        inp.addEventListener('keydown', e => {
            e.stopPropagation()
            if (e.key === 'Enter') {
                e.preventDefault()
                finish(true)
            } else if (e.key === 'Escape') {
                e.preventDefault()
                finish(false)
            }
        })
        inp.addEventListener('mousedown', e => e.stopPropagation())
        inp.addEventListener('click', e => e.stopPropagation())
        inp.addEventListener('dblclick', e => e.stopPropagation())
        inp.addEventListener('blur', () => finish(true))
        requestAnimationFrame(() => {
            inp.focus()
            inp.select()
        })
    }

    endRename(commit) {
        const session = this._rename
        if (!session) return
        this._rename = null
        const { id, inp, field, rec, opt } = session
        const next = inp?.value
        if (field?.remove) field.remove()
        else inp?.remove()
        if (rec?.label?.element) rec.label.element.style.display = ''
        rec?.row?.classRemove('sk_ui_tree_renaming')
        if (commit) {
            if (opt.onCommit) opt.onCommit(next, id)
            else if (this.onRename) this.onRename(rec.item, next)
        } else if (opt.onCancel) {
            opt.onCancel(id)
        }
    }

    ignoreNextClick() {
        this._ignoreClick = true
        setTimeout(() => { this._ignoreClick = false }, 0)
    }
}
