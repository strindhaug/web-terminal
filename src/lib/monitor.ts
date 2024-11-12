import { pause } from "./pause"

export async function power(on = true) {
    await pause(0.1)
    const monitorEl = document.getElementById("monitor")
    monitorEl?.classList.toggle("monitor--turn-off", !on)
    monitorEl?.classList.toggle("monitor--off", !on)
}
