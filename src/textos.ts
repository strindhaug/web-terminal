import { getLowLevelScreenBuffer } from "./lib/llbuf"
import { power } from "./lib/monitor"
import { pause } from "./lib/pause"
import { getTerminalPrompt } from "./lib/textterm"

async function onLoad() {
    // const urlParams = new URLSearchParams(window.location.search)
    // silentMode = !!urlParams.get("silent")
    // extraFastMode = !!urlParams.get("fast")
    const monitor = document.getElementById("monitor")!
    power(true)
    const crt = document.createElement("div")
    crt.classList.add("crt")

    const scanline = document.createElement("div")
    scanline.classList.add("scanline")

    const wrapperWrapperEl = document.createElement("div")
    wrapperWrapperEl.classList.add("terminal")

    const wrapperEl = document.createElement("div")
    wrapperEl.classList.add("typer")

    const promptEl = document.createElement("input")
    promptEl.autocomplete = "off"
    promptEl.style.opacity = "0.0001"
    promptEl.type = "text"
    promptEl.name = "promptEl"
    wrapperWrapperEl.append(wrapperEl)
    crt.append(scanline, wrapperWrapperEl)
    monitor.append(promptEl, crt)

    const llBuf = getLowLevelScreenBuffer(wrapperEl)
    const term = getTerminalPrompt(promptEl, llBuf, crt)

    await term.writeLine("Welcome to Stein's text based OS!")
    await term.startPrompt()

    await pause(0.1)
    promptEl.focus()

    window.addEventListener("click", () => promptEl.focus())
}

window.addEventListener("load", onLoad)
