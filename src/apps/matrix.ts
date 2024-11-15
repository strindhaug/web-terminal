/* eslint-disable no-console */
import type { SubProgram } from "../lib/textterm"
import { centerText } from "../lib/layout"

interface Coordinate {
    col: number
    row: number
    ttl: number
}

function makeTargetWord(text: string, streams: number) {
    const spacing = text.length < (streams / 2) ? 2 : 1
    const centered = centerText(text, streams / spacing)
    const charMap: { [key: number]: string } = {}

    for (let i = 0; i < centered.length; i++) {
        const ch = centered.charAt(i)
        if (ch !== " ") {
            charMap[i * spacing] = ch
        }
    }
    return charMap
}

export function getMatrixRain(wrapper: HTMLDivElement, rawCommand: string, streams: number = 40, charPerStream: number = 35): SubProgram {
    const MovieCharset = `"*+-.0123456789:<=>Zç¦╌日ｦｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾜﾝ`
    const Base256 = "!#%&()*+0123456789=?§@AÅÆBCDEFGHIJKLMNOØPQRSTUVWXYZ[]^_aåæbcçdefghijklmnoøpqrstuvwxyz{|}~ŋŠšɕɯɲɴɸʑẽ∞あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゑをㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ上二于作使來倭偏千國外封山帝并昇明昔曰朝東武毛沢王田祖米粁自血表遠釦零頁｡｢｣ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ"
    const Japanese = "!#%()*+0123456789=?§@[]^_{|}~ŋɕɯɲɸʑ∞あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゑをㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ上二于作使來倭偏千國外封山帝并昇明昔曰朝東武毛沢王田祖米粁自血表遠釦零頁｡｢｣ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ"
    const Ukraine = "!#%&()*+0123456789=?§@АаБбВвГгҐґДдЕеЄєЖЖЗзИиІіЇїЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЬьЮюЯя"
    // i.e. Base129
    const American = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    // i.e. Base64
    const HexCset = "0123456789ABCDEF"
    const Binary = "0101" // robot prayer encoding
    const BoxShapes = "▀▁▂▃▄▅▆▇█▉▊▋▌▍▎▏▐░▒▓▔▕▖▗▘▙▚▛▜▝▞▟"
    const GlitchChars = "U+259xのЖɸʑẽ∞あÆ~｡｢｣ｦ"
    let revealTitle = false

    let isRunning: boolean = false

    const [_cmd, initArg, ...remainder] = rawCommand.split(" ")
    const titleText = remainder.length > 0 ? remainder.join(" ") : "THE  MATRIX"

    const targetWord: { [key: number]: string } = makeTargetWord(titleText, streams)
    // {
    //     7: "T",
    //     9: "H",
    //     11: "E",
    //     15: "M",
    //     17: "A",
    //     19: "T",
    //     21: "R",
    //     23: "I",
    //     25: "X",
    // }

    let charset: string = BoxShapes
    let blipSet: string = GlitchChars
    // const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890?!"

    // const charset = "12345678"

    let endProgram: () => Promise<void>

    const matrixWrapper = document.createElement("div")
    matrixWrapper.classList.add("matrix-terminal")
    matrixWrapper.style.display = "none"
    wrapper.append(matrixWrapper)

    let activeTrails: Coordinate[] = [{
        col: Math.floor(streams / 2),
        row: -4,
        ttl: charPerStream * 5,
    }]
    let blips: Coordinate[] = []

    let maxTrails = 1
    let maxBlips = 20
    const spinsPerStep = 4

    function getRandomChar(set: string, targetChar?: string) {
        if (targetChar && Math.random() * 100 > 50) {
            return targetChar
        }
        return set.charAt(Math.random() * set.length)
    }

    const elBuffers: HTMLDivElement[][] = []

    async function cleanup() {
        matrixWrapper.remove()
    }
    function setCharsetStyle(style?: string) {
        switch (style) {
            case "-a":
            case "--ascii":
            case "--american":
                charset = American
                blipSet = Japanese
                break
            case "-b":
            case "--binary":
                charset = Binary
                blipSet = "X23110101"
                break
            case "-f":
            case "--full":
                charset = Base256
                blipSet = BoxShapes
                break
            case "-g":
            case "--glitch":
                charset = BoxShapes
                blipSet = GlitchChars
                break
            case "-h":
            case "--hex":
                charset = HexCset
                blipSet = "x\\^@FF000FF=F000+-~"
                break
            case "-n":
            case "-j":
            case "--nihongo":
            case "--japanese":
                charset = Japanese
                blipSet = American
                break
            case "-u":
            case "--ukraine":
                charset = Ukraine
                blipSet = American
                break
            default:
                matrixWrapper.classList.add("mirrored")
                charset = MovieCharset
                blipSet = American
        }
    }
    async function init() {
        setCharsetStyle(initArg?.toLowerCase())

        if (elBuffers.length < 1) {
            for (let col = 0; col < streams; col += 1) {
                const newColArr: HTMLDivElement[] = []
                const newCol = document.createElement("div")
                newCol.classList.add("matrix-col")
                newCol.style.setProperty("--parallax", `${(0.5 * -streams) + col}vw`)
                if (targetWord[col]) {
                    newCol.style.fontSize = `${(Math.random() * 0.1) + 1.5}em`
                    newCol.style.left = `${((col / streams) * 100)}%`
                }
                else {
                    newCol.style.left = `${((col / streams) * 100) + Math.random() * 3}%`
                    newCol.style.fontSize = `${Math.random() + 1}em`
                    newCol.style.animationDelay = `${Math.random() * 10}s`
                }

                for (let i = 0; i < charPerStream; i++) {
                    const newEl = document.createElement("div")
                    newEl.classList.add("matrix-el")
                    newEl.textContent = getRandomChar(charset)
                    newCol.append(newEl)
                    newColArr.push(newEl)
                }
                elBuffers.push(newColArr)
                matrixWrapper.append(newCol)
            }
        }

        matrixWrapper.style.display = "flex"
    }
    async function step() {
        for (let index = 0; index < activeTrails.length; index++) {
            const trail = activeTrails[index]
            if (elBuffers[trail.col] && elBuffers[trail.col][trail.row]) {
                elBuffers[trail.col][trail.row].classList.add("matrix-el--glow")
                elBuffers[trail.col][trail.row].classList.remove("matrix-el--flash")
            }
            if (Math.floor(Math.random() * spinsPerStep) < 2) {
                // if (trail.ttl % spinsPerStep === 0) {
                trail.row += 1
            }
            trail.ttl -= 1

            if (trail.row > charPerStream) {
                trail.row = -20
            }

            if (trail.row < charPerStream && trail.ttl > 0 && elBuffers[trail.col] && elBuffers[trail.col][trail.row]) {
                if (!elBuffers[trail.col][trail.row].classList.contains("fixed")) {
                    if (revealTitle && trail.row === 17) {
                        const newChar = getRandomChar(charset, targetWord[trail.col])
                        elBuffers[trail.col][trail.row].textContent = newChar
                        if (newChar === targetWord[trail.col]) {
                            elBuffers[trail.col][trail.row].classList.add("fixed")
                        }
                    }
                    else {
                        elBuffers[trail.col][trail.row].textContent = getRandomChar(charset)
                    }
                }
                elBuffers[trail.col][trail.row].classList.add("matrix-el--flash")
                elBuffers[trail.col][trail.row].classList.remove("matrix-el--glow")
                elBuffers[trail.col][trail.row].classList.remove("blip0")
                elBuffers[trail.col][trail.row].classList.remove("blip1")
                if (!revealTitle) {
                    elBuffers[trail.col][trail.row].classList.remove("fixed")
                }
            }
        }
        activeTrails = activeTrails.filter(t => t.ttl > 0)
        if (Math.floor(Math.random() * 100) < 30 && activeTrails.length < maxTrails) {
            activeTrails.push({
                row: Math.floor(Math.random() * charPerStream) - 10,
                col: Math.floor(Math.random() * streams),
                ttl: charPerStream * spinsPerStep,
            })
        }

        for (let index = 0; index < blips.length; index++) {
            const blip = blips[index]
            if (elBuffers[blip.col][blip.row]) {
                if (!revealTitle) {
                    elBuffers[blip.col][blip.row].classList.remove("fixed")
                }
                if (!elBuffers[blip.col][blip.row].classList.contains("fixed")) {
                    elBuffers[blip.col][blip.row].textContent = getRandomChar(blipSet)
                    elBuffers[blip.col][blip.row].classList.add("blip0")
                }
                blip.ttl -= 1
            }
        }

        blips = blips.filter(t => t.ttl > 0)

        if (blips.length < maxBlips) {
            blips.push({
                row: Math.floor(Math.random() * charPerStream),
                col: Math.floor(Math.random() * streams),
                ttl: Math.floor(Math.random() * 10),
            })
        }
    }

    let autorunInterval: number

    function start() {
        clearInterval(autorunInterval)
        autorunInterval = setInterval(step, 40)
    }

    function pause() {
        clearInterval(autorunInterval)
        const flashes = matrixWrapper.querySelectorAll(".matrix-el--flash")
        flashes.forEach(el => el.classList.remove("matrix-el--flash"))
        flashes.forEach(el => el.classList.add("matrix-el--glow"))
    }
    function togglePause() {
        isRunning = !isRunning
        if (isRunning) {
            pause()
        }
        else {
            start()
        }
    }

    function toggleTitle() {
        revealTitle = !revealTitle
        if (revealTitle) {
            Object.keys(targetWord).forEach((key: string) => {
                activeTrails.push({
                    row: Math.floor(Math.random() * 15) - 10,
                    col: Number.parseInt(key),
                    ttl: charPerStream * spinsPerStep * 4,
                })
            })
        }
        else {
            const fixed = matrixWrapper.querySelectorAll(".fixed")
            fixed.forEach(el => el.classList.remove("fixed"))
        }
    }

    function moreTrails() {
        maxTrails += 4
        console.debug("Max levels", { maxBlips, maxTrails })
    }
    function lessTrails() {
        maxTrails -= 4
        console.debug("Max levels", { maxBlips, maxTrails })
    }
    function moreBlips() {
        maxBlips += 10
        console.debug("Max levels", { maxBlips, maxTrails })
    }
    function lessBlips() {
        maxBlips -= 10
        console.debug("Max levels", { maxBlips, maxTrails })
    }

    function keyUpListener(ev: KeyboardEvent) {
        switch (ev.code) {
            case "Space":
                step()
                break
            case "KeyQ":
                endProgram()
                break
                // Toggles
            case "KeyP":
                togglePause()
                break
            case "KeyT":
                toggleTitle()
                break
            case "KeyM":
                matrixWrapper.classList.toggle("mirrored")
                break

                // charsets

            case "KeyA":
                setCharsetStyle("-a")
                break
            case "KeyB":
                setCharsetStyle("-b")
                break
            case "KeyD":
                setCharsetStyle("-d")
                break
            case "KeyF":
                setCharsetStyle("-f")
                break
            case "KeyG":
                setCharsetStyle("-g")
                break
            case "KeyH":
                setCharsetStyle("-h")
                break
            case "KeyU":
                setCharsetStyle("-u")
                break
            case "KeyN":
            case "KeyJ":
                setCharsetStyle("-n")
                break

                // intensity

            case "ArrowUp":
                moreTrails()
                break
            case "ArrowDown":
                lessTrails()
                break

            case "ArrowLeft":
                lessBlips()
                break
            case "ArrowRight":
                moreBlips()
                break
            default:
                // TODO
                break
        }
    }
    function keyDownListener(_ev: KeyboardEvent) {
    }

    async function run(endCallback: () => Promise<void>) {
        endProgram = endCallback
        await init()
        await start()
        setTimeout(() => {
            maxTrails = 8
        }, 2000)
        setTimeout(() => {
            maxTrails = streams * 2
        }, 4000)
    }

    return {
        keyDownListener,
        keyUpListener,
        run,
        cleanup,
        isGraphical: true,
    }
    // return {
    //     init,
    //     step,
    //     start,
    //     stop,
    //     more,
    //     less,
    //     keyUpListener,
    // }
}
