import type { LowLevelScreenBuffer } from "../lib/llbuf"
import type { SubProgram } from "../lib/textterm"

export function getPager(llBuf: LowLevelScreenBuffer, fileContents: string, title?: string, fileName?: string): SubProgram {
    const { screenCols, screenRows } = llBuf.getMetadata()
    const lineBuffer: string[] = []
    const viewPortH = screenRows - 2
    let position: number
    // let totalLines: number

    let endProgram: () => Promise<void>

    // let keydownRepeating: number
    // let renderedLines = 0

    function renderLine(lineNo: number, textline: string, attr = "") {
        for (let ch = 0; ch < screenCols; ch++) {
            llBuf.writeCharAt(ch, lineNo, textline.charAt(ch) || " ", attr)
        }
    }
    function renderStatusBar(hasMoved: boolean) {
        const hasMore = position + viewPortH < lineBuffer.length - 1
        const isEnd = !hasMore

        if (hasMoved) {
            renderLine(viewPortH + 1, isEnd ? "(END)" : ":", "b-a c-0")
        }
        else {
            const fname = (fileName ?? ":")
            const isEndString = isEnd ? "(END)" : ""
            renderLine(viewPortH + 1, fname + isEndString, "b-a c-0")
        }
        llBuf.updateScreen()
    }
    function renderViewport() {
        const hasMoved = position !== undefined
        if (!position) {
            position = 0
        }
        for (let i = 0; i <= viewPortH; i++) {
            if (i + position < lineBuffer.length) {
                const textLine = lineBuffer[i + position]
                renderLine(i, textLine)
            }
            else {
                renderLine(i, "~")
            }
        }
        renderStatusBar(hasMoved)
    }

    function pageDown() {
        position = Math.min(position + viewPortH, lineBuffer.length - viewPortH - 1)
        renderViewport()
    }
    function pageUp() {
        position = Math.max(position - viewPortH, 0)
        renderViewport()
    }

    function moveDown() {
        const hasMore = position + viewPortH < lineBuffer.length - 1
        if (hasMore) {
            position += 1
            llBuf.scrollRowText(1)
            renderLine(viewPortH, lineBuffer[position + viewPortH])
        }
        renderStatusBar(true)
    }
    function moveUp() {
        const hasMore = position > 0
        if (hasMore) {
            position -= 1
            llBuf.scrollRowText(-1)
            renderLine(0, lineBuffer[position])
        }
        renderStatusBar(true)
    }

    async function run(endCallback: () => Promise<void>) {
        endProgram = endCallback
        llBuf.pushBuffer()
        if (title) {
            lineBuffer.push(title)
        }
        const hardNewlines = fileContents.split("\n")

        // const lineReducer = (accumulator: number, currentValue: string): number => {
        //     const linesInThisString = 1 + Math.floor(currentValue.length / screenCols)
        //     return accumulator + linesInThisString
        // }
        // totalLines = hardNewlines.reduce(lineReducer, 0)

        for (let hl = 0; hl < hardNewlines.length; hl++) {
            const hardLine = hardNewlines[hl]
            if (hardLine.length > screenCols) {
                for (let i = 0; i < hardLine.length; i += screenCols) {
                    lineBuffer.push(hardLine.slice(i, i + screenCols))
                }
            }
            else {
                lineBuffer.push(hardLine)
            }
        }
        // lineBuffer.push(`DEBUG Hard newlines: ${hardNewlines.length}, total: ${totalLines}`)

        renderViewport()

        // if (lineBuffer.length < viewPortH) {
        //     const linesToAdd = viewPortH - lineBuffer.length
        //     for (let i = 0; i < linesToAdd; i++) {
        //         lineBuffer.push("~")
        //     }
        // }
    }
    async function cleanup() {
        llBuf.popBuffer()
    }

    function keyUpListener(ev: KeyboardEvent) {
        switch (ev.code) {
            case "KeyQ":
                endProgram()
                break
            case "Space":
                if (ev.shiftKey) {
                    pageUp()
                }
                else {
                    pageDown()
                }
                // TODO page down
                break
            // case "ArrowUp":
            //     moveUp()
            //     break
            // case "ArrowDown":
            //     moveDown()
            //     break
            default:
                // TODO
                break
        }
    }
    function keyDownListener(ev: KeyboardEvent) {
        switch (ev.code) {
            case "Space":
                // TODO page down
                break
            case "ArrowUp":
                // clearInterval(keydownRepeating)
                moveUp()
                // if (ev.repeat) {
                //     keydownRepeating = setInterval(moveUp, 200)
                // }
                break
            case "ArrowDown":
                // clearInterval(keydownRepeating)
                moveDown()
                // if (ev.repeat) {
                //     keydownRepeating = setInterval(moveDown, 200)
                // }
                break
            default:
                // TODO
                break
        }
        // if (ev.code === "KeyC" && ev.ctrlKey) {
        //     stopSubProgram()
        //     // dom.graphicalRenderer.stopWriting()
        //     // stopSpeaking()
        // }
        // if (runningApps.length > 0) {
        //     return
        // }
        // clearInterval(keydownRepeating)
        // if (ev.repeat) {
        //     syncUserInput()
        //     keydownRepeating = setInterval(syncUserInput, 3)
        // }
    }

    return {
        keyDownListener,
        keyUpListener,
        run,
        cleanup,
        isGraphical: false,
    }
}
