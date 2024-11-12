export interface CursorPos {
    x: number
    y: number
}
export interface ScreenBufferState {
    txt: string[][]
    att: string[][]
    cursor: CursorPos
}

export function getLowLevelScreenBuffer(screenEl: HTMLElement, screenCols: number = 80, screenRows: number = 25) {
    const buffers: ScreenBufferState[] = []
    let ptr: number = -1

    // buffers[ptr].txt
    // buffers[ptr].att
    // buffers[ptr].cursor

    function getNewTextLine() {
        const textLine = []
        for (let c = 0; c < screenCols; c++) {
            textLine.push(" ")
        }
        return textLine
    }
    function getNewAttrLine() {
        const attrLine = []
        for (let c = 0; c < screenCols; c++) {
            attrLine.push("")
        }
        return attrLine
    }

    function makeBuffer(): ScreenBufferState {
        const txt: string[][] = []
        const att: string[][] = []
        for (let r = 0; r < screenRows; r++) {
            txt.push(getNewTextLine())
            att.push(getNewAttrLine())
        }
        return {
            txt,
            att,
            cursor: { x: -1, y: -1 },
        }
    }
    function getMetadata() {
        return {
            screenCols,
            screenRows,
        }
    }

    function pushBuffer(newBuffer?: ScreenBufferState) {
        buffers.push(newBuffer ?? makeBuffer())
        ptr += 1
    }
    function popBuffer(): ScreenBufferState | undefined {
        ptr -= 1
        const oldBuff = buffers.pop()
        if (ptr < 0) {
            pushBuffer()
        }
        return oldBuff
    }

    pushBuffer() // initialise one buffer

    function scrollRowText(up: number = 1, wrap: boolean = false) {
        if (up > 0) {
            for (let i = 0; i < up; i++) {
                const removedTopText = buffers[ptr].txt.shift()!
                if (wrap) {
                    buffers[ptr].txt.push(removedTopText)
                }
                else {
                    buffers[ptr].txt.push(getNewTextLine())
                }
            }
        }
        else {
            for (let i = 0; i > up; i--) {
                const removedBottomText = buffers[ptr].txt.pop()!
                if (wrap) {
                    buffers[ptr].txt.unshift(removedBottomText)
                }
                else {
                    buffers[ptr].txt.unshift(getNewTextLine())
                }
            }
        }
    }

    function scrollRowAttrs(up: number = 1, wrap: boolean = false) {
        if (up > 0) {
            for (let i = 0; i < up; i++) {
                const removedTopAttr = buffers[ptr].att.shift()!
                if (wrap) {
                    buffers[ptr].att.push(removedTopAttr)
                }
                else {
                    buffers[ptr].att.push(getNewTextLine())
                }
            }
        }
        else {
            for (let i = 0; i > up; i--) {
                const removedBottomAttr = buffers[ptr].att.pop()!
                if (wrap) {
                    buffers[ptr].att.unshift(removedBottomAttr)
                }
                else {
                    buffers[ptr].att.unshift(getNewTextLine())
                }
            }
        }
    }

    function writeCharAt(x: number, y: number, char: string, attr: string) {
        buffers[ptr].txt[y][x] = char
        buffers[ptr].att[y][x] = attr
    }

    function getCursor() {
        return buffers[ptr].cursor
    }

    function setCursor(x: number, y: number) {
        buffers[ptr].cursor.x = Math.min(Math.max(x, 0), screenCols)
        buffers[ptr].cursor.y = Math.min(Math.max(y, 0), screenRows)
    }

    function moveCursor(right: number, down: number) {
        buffers[ptr].cursor.x = Math.min(Math.max(buffers[ptr].cursor.x + right, 0), screenCols)
        buffers[ptr].cursor.y = Math.min(Math.max(buffers[ptr].cursor.y + down, 0), screenRows)
    }

    function updateScreen() {
        let prevAttr = ""
        const outBuff = ["<i>"]
        for (let r = 0; r < screenRows; r++) {
            for (let c = 0; c < screenCols; c++) {
                const isCursor = (c === buffers[ptr].cursor.x && r === buffers[ptr].cursor.y)
                const newAttr = isCursor ? `cursor ${buffers[ptr].att[r][c]}` : buffers[ptr].att[r][c]
                if (prevAttr !== newAttr) {
                    outBuff.push(`</i><i class="${newAttr}">`)
                    prevAttr = newAttr
                }
                outBuff.push(isCursor && buffers[ptr].txt[r][c] === " " ? "_" : buffers[ptr].txt[r][c])
            }
            outBuff.push("<br>")
        }
        outBuff.push("</i>")
        screenEl.innerHTML = outBuff.join("")
    }

    function hide() {
        screenEl.classList.add("hidden")
    }
    function show() {
        screenEl.classList.remove("hidden")
    }

    return {
        hide,
        show,
        getCursor,
        setCursor,
        moveCursor,
        writeCharAt,
        // writeCharAtCursor,
        updateScreen,
        scrollRowText,
        scrollRowAttrs,
        pushBuffer,
        popBuffer,
        getMetadata,
    }
}

export type LowLevelScreenBuffer = ReturnType<typeof getLowLevelScreenBuffer>
