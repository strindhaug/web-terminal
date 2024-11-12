const isMs = /^\s*\d+ms/
const isMinutes = /^\s*\d+m/
const isHours = /^\s*\d+h/

const second = 1000
const minute = 60 * second
const hour = 60 * minute

export function parseDurationString(userInput: string, defaultVal: number) {
    const numberValue = Number.parseInt(userInput, 10)
    if (!numberValue) {
        return defaultVal
    }
    if (userInput.match(isMs)) {
        return numberValue
    }
    if (userInput.match(isMinutes)) {
        return numberValue * minute
    }
    if (userInput.match(isHours)) {
        return numberValue * hour
    }
    return numberValue * second
}

export function humanTime(ms: number) {
    const h = Math.floor(ms / hour)
    let remainder = ms % hour
    const m = Math.floor(remainder / minute)
    remainder = ms % minute
    const s = Math.floor(remainder / second)
    remainder = ms % second
    const stringParts: string[] = []

    if (h > 1) {
        stringParts.push(`${h} hours`)
    }
    else if (h === 1) {
        stringParts.push("1 hour")
    }

    if (m > 1) {
        stringParts.push(`${m} minutes`)
    }
    else if (m === 1) {
        stringParts.push("1 minute")
    }

    if (s > 1) {
        stringParts.push(`${s} seconds`)
    }
    else if (s === 1) {
        stringParts.push("1 second")
    }
    if (stringParts.length === 0) {
        return `${remainder} ms`
    }
    return stringParts.join(", ")
}
