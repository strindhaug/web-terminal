import type { SubProgram } from "../lib/textterm"

interface Coordinate {
    col: number
    row: number
    ttl: number
}

export function getMatrixRain(wrapper: HTMLDivElement, initArg?: string, streams: number = 40, charPerStream: number = 35): SubProgram {
    const MovieCharset = `"*+-.0123456789:<=>Zç¦╌日ｦｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾜﾝ`
    const Base256 = "!#%&()*+0123456789=?§@AÅÆBCDEFGHIJKLMNOØPQRSTUVWXYZ[]^_aåæbcçdefghijklmnoøpqrstuvwxyz{|}~ŋŠšɕɯɲɴɸʑẽ∞あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゑをㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ上二于作使來倭偏千國外封山帝并昇明昔曰朝東武毛沢王田祖米粁自血表遠釦零頁｡｢｣ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ"
    const Japanese = "!#%()*+0123456789=?§@[]^_{|}~ŋɕɯɲɸʑ∞あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゑをㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ上二于作使來倭偏千國外封山帝并昇明昔曰朝東武毛沢王田祖米粁自血表遠釦零頁｡｢｣ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ"
    const Ukraine = "!#%&()*+0123456789=?§@АаБбВвГгҐґДдЕеЄєЖЖЗзИиІіЇїЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЬьЮюЯя"
    // i.e. Base129
    const American = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    // i.e. Base64
    const HexCset = "0123456789ABCDEF"
    const Binary = "01010101010101010101010101010101010101010101010101010101012" // robot prayer encoding

    let charset: string = MovieCharset
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

    function getRandomChar() {
        return charset.charAt(Math.random() * charset.length)
    }

    const elBuffers: HTMLDivElement[][] = []

    async function cleanup() {
        matrixWrapper.remove()
    }

    async function init() {
        switch (initArg?.toLowerCase()) {
            case "-f":
            case "--full":
                charset = Base256
                break
            case "-h":
            case "--hex":
                charset = HexCset
                break
            case "-a":
            case "--ascii":
            case "--american":
                charset = American
                break
            case "-n":
            case "-j":
            case "--nihongo":
            case "--japanese":
                charset = Japanese
                break
            case "-b":
            case "--binary":
                charset = Binary
                break
            case "-u":
            case "--ukraine":
                charset = Ukraine
                break
            default:
                matrixWrapper.classList.add("mirrored")
                charset = MovieCharset
        }

        if (elBuffers.length < 1) {
            for (let col = 0; col < streams; col += 1) {
                const newColArr: HTMLDivElement[] = []
                const newCol = document.createElement("div")
                newCol.classList.add("matrix-col")
                newCol.style.left = `${((col / streams) * 100) + Math.random() * 3}%`
                newCol.style.zoom = `${Math.random() + 1}`
                newCol.style.setProperty("--parallax", `${(0.5 * -streams) + col}vw`)
                newCol.style.animationDelay = `${Math.random() * 10}s`

                for (let i = 0; i < charPerStream; i++) {
                    const newEl = document.createElement("div")
                    newEl.classList.add("matrix-el")
                    newEl.textContent = getRandomChar()
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
            if (trail.row < charPerStream && trail.ttl > 0 && elBuffers[trail.col] && elBuffers[trail.col][trail.row]) {
                elBuffers[trail.col][trail.row].textContent = getRandomChar()
                elBuffers[trail.col][trail.row].classList.add("matrix-el--flash")
                elBuffers[trail.col][trail.row].classList.remove("matrix-el--glow")
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
                elBuffers[blip.col][blip.row].textContent = getRandomChar()
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
    }

    function moreTrails() {
        maxTrails += 4
    }
    function lessTrails() {
        maxTrails -= 4
    }
    function moreBlips() {
        maxBlips += 10
    }
    function lessBlips() {
        maxBlips -= 10
    }

    function keyUpListener(ev: KeyboardEvent) {
        switch (ev.code) {
            case "Space":
                step()
                break
            case "KeyQ":
                endProgram()
                break
            case "KeyP":
                pause()
                break
            case "KeyR":
                start()
                break

            case "KeyH":
                charset = HexCset
                break
            case "KeyB":
                charset = Binary
                break
            case "KeyA":
                charset = American
                break
            case "KeyU":
                charset = Ukraine
                break

            case "KeyN":
            case "KeyJ":
                charset = Japanese
                break
            case "KeyM":
                matrixWrapper.classList.toggle("mirrored")
                break

            case "KeyD":
                charset = MovieCharset
                break

            case "KeyF":
                charset = Base256
                break

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
            maxTrails = streams * 4
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
