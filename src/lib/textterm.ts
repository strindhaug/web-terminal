import type { LowLevelScreenBuffer } from "./llbuf"
import { getMatrixRain } from "../apps/matrix"
import { getPager } from "../apps/pager"
import { getFile, getManPage } from "../files/files"
import { manPageTitle } from "./layout"
import { power } from "./monitor"
import { pause } from "./pause"
import { humanTime, parseDurationString } from "./time"

export function colorMap(colorName: string | undefined): string {
    switch (colorName) {
        case "Black": return "c-0"
        case "Red": return "c-1"
        case "Green": return "c-2"
        case "Yellow": return "c-3"
        case "Blue": return "c-4"
        case "Magenta": return "c-5"
        case "Cyan": return "c-6"
        case "White": return "c-7"
        case "BrightBlack": return "c-8"
        case "BrightRed": return "c-9"
        case "BrightGreen": return "c-a"
        case "BrightYellow": return "c-b"
        case "BrightBlue": return "c-c"
        case "BrightMagenta": return "c-d"
        case "BrightCyan": return "c-e"
        case "BrightWhite": return "c-f"
        default:
            break
    }
    return ""
}

export function bgColorMap(colorName: string | undefined): string {
    switch (colorName) {
        case "Black": return "b-0"
        case "Red": return "b-1"
        case "Green": return "b-2"
        case "Yellow": return "b-3"
        case "Blue": return "b-4"
        case "Magenta": return "b-5"
        case "Cyan": return "b-6"
        case "White": return "b-7"
        case "BrightBlack": return "b-8"
        case "BrightRed": return "b-9"
        case "BrightGreen": return "b-a"
        case "BrightYellow": return "b-b"
        case "BrightBlue": return "b-c"
        case "BrightMagenta": return "b-d"
        case "BrightCyan": return "b-e"
        case "BrightWhite": return "b-f"
        default:
            break
    }
    return ""
}

// type CallBack = () => Promise<any>

export interface SubProgram {
    keyUpListener: (ev: KeyboardEvent) => any | undefined
    keyDownListener: (ev: KeyboardEvent) => any | undefined
    run: (stop: () => Promise<void>) => Promise<any>
    cleanup: () => Promise<any>
    isGraphical: boolean
}

export function makeCommandHistory(maxLen: number = 10) {
    const stack: string[] = []
    let ptr = -1
    let currInput = ""

    function add(command: string) {
        // TODO normalise by stripping whitespace?

        // remove duplicates
        const prevI = stack.indexOf(command)
        if (prevI >= 0) {
            stack.splice(prevI, 1)
        }
        // add new command to index 0
        stack.unshift(command)
        // remove oldest entries
        if (stack.length > maxLen) {
            stack.pop()
        }
        currInput = ""
        ptr = -1
        // console.debug("CommHist.add: ptr:", ptr, "stack:", stack, "currInput", currInput)
    }

    function getPrev(oldVal: string) {
        if (ptr < 0) {
            currInput = oldVal
            ptr = -1
        }
        if (ptr < stack.length) {
            ptr += 1
            return stack[ptr] || oldVal
        }
        return oldVal
    }
    function getNext(oldVal: string) {
        if (ptr < 0) {
            return oldVal
        }
        ptr -= 1
        if (ptr >= 0) {
            return stack[ptr]
        }
        return currInput
    }

    return {
        add,
        getPrev,
        getNext,
    }
}

export function getTerminalPrompt(promptEl: HTMLInputElement, llBuf: LowLevelScreenBuffer, graphicalAppWrapper: HTMLDivElement, screenCols: number = 80, screenRows: number = 25) {
    const promptSym = "> "

    const cmdHist = makeCommandHistory(10)

    const runningApps: SubProgram[] = []

    let keydownRepeating: number

    let shutdownTimeout: number

    async function handleReturn() {
        const c = llBuf.getCursor()
        if (c.x < 0 || c.y < 0) {
            llBuf.setCursor(0, 0)
        }
        else if (c.y < screenRows - 1) {
            llBuf.moveCursor(-screenCols, 1)
        }
        else {
            llBuf.scrollRowAttrs(1)
            llBuf.scrollRowText()
            llBuf.setCursor(0, screenRows - 1)
        }
    }
    async function clearScreen() {
        const c = llBuf.getCursor()
        llBuf.scrollRowAttrs(c.y - 1)
        llBuf.scrollRowText(c.y - 1)
        llBuf.setCursor(0, 0)
    }

    async function writeLine(text: string, returnFirst: boolean = true, slow: boolean = true) {
        let c = llBuf.getCursor()
        if (returnFirst) {
            handleReturn()
        }
        else {
            // just ensure cursor is on screen
            if (c.x < 0 || c.y < 0) {
                llBuf.setCursor(0, 0)
            }
        }
        for (let index = 0; index < text.length; index++) {
            c = llBuf.getCursor()
            const ch = text.charAt(index)
            if (ch === "\n") {
                handleReturn()
                c = llBuf.getCursor()
            }
            else {
                llBuf.writeCharAt(c.x, c.y, ch, "")
                if (c.x + 1 < screenCols) {
                    llBuf.moveCursor(1, 0)
                }
                else {
                    handleReturn()
                }
            }

            // cb = llBuf.getCursor()
            if (slow) {
                llBuf.updateScreen()
                await pause(0.02)
            }
        }
        // handleReturn()
        llBuf.updateScreen()
    }
    function startPrompt() {
        promptEl.value = ""
        handleReturn()
        syncUserInput()
        // let currentCursor = llBuf.getCursor()
    }
    const thisTerminal = {
        startPrompt,
        writeLine,
    }

    async function startSubProgram(program: SubProgram) {
        runningApps.push(program)
        promptEl.addEventListener("keydown", program.keyDownListener)
        promptEl.addEventListener("keyup", program.keyUpListener)
        if (program.isGraphical) {
            llBuf.hide()
        }
        await program.run(stopSubProgram)
    }

    async function stopSubProgram() {
        const program = runningApps.pop()
        if (program) {
            promptEl.removeEventListener("keydown", program.keyDownListener)
            promptEl.removeEventListener("keyup", program.keyUpListener)
            await program.cleanup()
            if (runningApps.length > 0 && runningApps[runningApps.length].isGraphical) {
                llBuf.hide()
            }
            else {
                llBuf.show()
                llBuf.updateScreen()
                if (runningApps.length === 0) {
                    promptEl.value = ""
                    syncUserInput()
                }
            }
        }
        promptEl.value = ""
    }

    async function completeShutdown() {
        await writeLine(`Broadcast message from root (pts/0) (${new Date().toUTCString()}):\n\n`)
        await writeLine("The system is going to shut down NOW!")
        await pause(0.5)
        await writeLine("Sending SIGTERM to all processes")
        await pause(1.9)
        await writeLine("Sending SIGKILL to all processes")
        await pause(0.8)
        await writeLine("Requesting system halt ...")
        await pause(3)
        await power(false)
    }

    // TODO move commands and command parsing to command parser lib
    // use a map to avoid having inconsistent data
    const availableCommands = [
        "bye",
        "clear",
        "cls",
        "hello",
        "help",
        "man",
        "matrix",
        "pager",
        "shutdown",
    ]
    let tabCompI: number
    let currTabCompletions: string[]
    const autoCompleteMinLength = 1 // increase to 2 if it gets annoying with too many suggestions

    async function tryAutoComplete() {
        if (currTabCompletions.length > 0) {
            tabCompI = (1 + tabCompI) % currTabCompletions.length
        }
        else {
            const rawCommand = promptEl.value
            const sanitised = rawCommand.trim().toLowerCase()
            if (sanitised.length < autoCompleteMinLength){
                return
            }
            currTabCompletions = availableCommands.filter(c => c.startsWith(sanitised))
            currTabCompletions.push(rawCommand)
            tabCompI = 0
        }
        promptEl.value = currTabCompletions[tabCompI]
        syncUserInput()
    }

    async function handleEntry() {
        handleReturn()
        const rawCommand = promptEl.value
        cmdHist.add(rawCommand)
        const args = rawCommand.split(" ")
        const command = (args.length > 1 ? args[0] : rawCommand).toLowerCase()
        promptEl.value = ""

        const allCommands = `help            this message
man [command]   manual entry about a command
clear           clear the screen
cls             alias for clear
hello           greeting
matrix          enter the matrix
shutdown [time] shut down
bye [time]      alias for shutdown`

        switch (command) {
            case "man":
                if (args.length > 0) {
                    const manPageData = getManPage(args[1].toLowerCase())
                    if (manPageData) {
                        await startSubProgram(getPager(llBuf, manPageData.text, manPageTitle(manPageData.title, manPageData.command, screenCols)))
                        return // don't sync output
                    }
                    await writeLine(`No manual entry for ${args[1]}`)
                    await handleReturn()
                }
                break
            case "cls":
            case "clear":
                clearScreen()
                break
            case "":
                break
            case "hello":
                await pause(0.2)
                await writeLine("Hello there!", false)
                await handleReturn()
                break
            case "help":
                await pause(0.2)
                await writeLine("Available commands", false)
                await writeLine(allCommands)
                await writeLine("")
                await handleReturn()
                break

            case "matrix":
                await pause(0.2)
                await writeLine("Follow the white rabbit...", false)
                await handleReturn()
                await pause()
                await startSubProgram(getMatrixRain(graphicalAppWrapper, args[1]))
                return // don't sync input
            case "pager":
                {
                    const file = await getFile("awad")
                    await startSubProgram(getPager(llBuf, file, undefined, "test-file.txt"))
                }
                return // don't sync output
            case "shutdown":
            case "bye":
                await pause(0.2)

                if (args.length > 1) {
                    if (args[1] === "abort" || args[1] === "cancel") {
                        clearTimeout(shutdownTimeout)
                        await writeLine(`Broadcast message from root (pts/0) (${new Date().toUTCString()}):`)
                        await writeLine("Shutdown cancelled")
                    }
                    else if (args[1] === "now") {
                        await completeShutdown()
                        return
                    }
                    else {
                        const ms = parseDurationString(args[1], 10000)

                        await writeLine(`Broadcast message from root (pts/0) (${new Date().toUTCString()}):`)
                        await writeLine(`The system is going to shut down in ${humanTime(ms)}`)

                        shutdownTimeout = setTimeout(completeShutdown, ms)
                    }
                }
                else {
                    await writeLine(`Broadcast message from root (pts/0) (${new Date().toUTCString()}):`)
                    await writeLine(`The system is going to shut down in ${humanTime(60000)}`)
                    shutdownTimeout = setTimeout(completeShutdown, 60000)
                }
                await handleReturn()
                break
            default:
                await pause(0.2)
                await writeLine(`Command not found: ${command}`, false)
                await writeLine("")
                await writeLine("Use 'help' to list available commands")
                await handleReturn()
                // TODO unknown kommand
                break
        }
        syncUserInput()
    }
    function goUpHistory() {
        const currCommand = promptEl.value
        promptEl.value = cmdHist.getPrev(currCommand)
    }
    function goDownHistory() {
        const currCommand = promptEl.value
        promptEl.value = cmdHist.getNext(currCommand)
    }

    async function syncUserInput() {
        const c = llBuf.getCursor()
        const updatedCurrentLine = `${promptSym}${promptEl.value}`
        for (let i = 0; i < screenCols; i++) {
            llBuf.writeCharAt(i, c.y, updatedCurrentLine.charAt(i) || " ", "")
        }

        llBuf.setCursor(promptEl.selectionStart! + promptSym.length, c.y)
        llBuf.updateScreen()
    }

    function keyDownListener(ev: KeyboardEvent) {
        if (ev.code === "KeyC" && ev.ctrlKey) {
            stopSubProgram()
            // dom.graphicalRenderer.stopWriting()
            // stopSpeaking()
        }
        if (ev.code === "Tab") {
            tryAutoComplete()
            ev.preventDefault()
            ev.stopPropagation()
        }
        else {
            // For any other keypresses reset the suggestions
            // to start a new tab completion on next tab press.
            currTabCompletions = []
        }

        if (runningApps.length > 0) {
            return
        }
        clearInterval(keydownRepeating)
        if (ev.repeat) {
            syncUserInput()
            keydownRepeating = setInterval(syncUserInput, 3)
        }
    }

    function keyUpListener(ev: KeyboardEvent) {
        if (runningApps.length > 0) {
            return
        }
        console.debug("ev.code", ev.code)
        switch (ev.code) {
            case "Enter":
                handleEntry()
                break
            case "ArrowUp":
                goUpHistory()
                syncUserInput()
                break
            case "ArrowDown":
                goDownHistory()
                syncUserInput()
                break
            case "ArrowLeft":
                // llBuf.scrollRowAttrs(1, true)
                llBuf.moveCursor(-1, 0)
                syncUserInput()
                break
            case "ArrowRight":
                // llBuf.scrollRowAttrs(-1, true)
                llBuf.moveCursor(1, 0)
                syncUserInput()
                break
            default:
                // TODO
                syncUserInput()
                break
        }
    }

    promptEl.addEventListener("keydown", keyDownListener)
    promptEl.addEventListener("keyup", keyUpListener)

    return thisTerminal
}
export type TextTerminal = ReturnType<typeof getTerminalPrompt>
