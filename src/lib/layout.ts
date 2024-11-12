export function centerText(txt: string, screenCols: number): string {
    if (txt.length >= screenCols) {
        return txt
    }
    const prePad = Math.floor((screenCols - txt.length) / 2)

    return " ".repeat(prePad) + txt + " ".repeat(prePad)
}

export function manPageTitle(txt: string, command: string, screenCols: number): string {
    return command + centerText(txt, screenCols - (2 * command.length)) + command
}
