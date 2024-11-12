const urlParams = new URLSearchParams(window.location.search)
const msPerSecond = urlParams.get("fast") ? 200 : 1000

/** Just a not so pretty way to make it easier to use setTimeout() with async/await */
export function pause(s = 1) {
    return new Promise(resolve => setTimeout(resolve, msPerSecond * Number(s)))
}
