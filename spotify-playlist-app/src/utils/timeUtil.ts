export const formatDuration = (durationMs: number) => {
    // Přepis čísla v ms na text ve formátu mm:ss
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}