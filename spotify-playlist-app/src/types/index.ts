export interface Song {
    id: string
    name: string
    artist: Array<String>
    length_ms: number
    spotifyUrl: string
    spotifyImageUrl: string
    genre: String
}

export interface Playlist {
    id: number
    name: string
    songs: Song[]
}