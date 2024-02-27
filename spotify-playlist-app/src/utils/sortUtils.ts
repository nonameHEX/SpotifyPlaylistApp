import { Playlist, Song } from '@/types/index'
import { ref } from 'vue'

export const sortOption = ref<string | null>(null)

export const sortSongsByName = (songs: Song[], ascending: boolean) => {
    const sortedSongs = [...songs]
    sortedSongs.sort((a, b) => {
        const nameA = a.name.toLowerCase()
        const nameB = b.name.toLowerCase()
        if (nameA < nameB) {
            return ascending ? -1 : 1
        }
        if (nameA > nameB) {
            return ascending ? 1 : -1
        }
        return 0
    })
    return sortedSongs
}

export const sortSongsByLength = (songs: Song[], ascending: boolean) => {
    const sortedSongs = [...songs]
    sortedSongs.sort((a, b) => {
        return ascending ? a.length_ms - b.length_ms : b.length_ms - a.length_ms
    })
    return sortedSongs
}

export const sortPlaylistByCount = (playlists: Playlist[], ascending: boolean) => {
    const sortedPlaylists = [...playlists]
    sortedPlaylists.sort((a, b) => {
        return ascending ? a.songs.length - b.songs.length : b.songs.length - a.songs.length
    })
    return sortedPlaylists
}

export const handleSortOption = (option: { label: string; value: string }) => {
    sortOption.value = option.value
}

export const getSortOptionLabel = (sortOptions: { label: string; value: string }[]) => {
    const selectedOption = sortOptions.find(option => option.value === sortOption.value)
    return selectedOption ? selectedOption.label : 'Neseřazovat'
}