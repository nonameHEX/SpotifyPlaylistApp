import { defineStore } from 'pinia'
import { Playlist, Song } from '@/types/index'

export const useAppStore = defineStore('app', {
  state: () => ({
    playlists: [] as Playlist[],
    lastPlaylistId: 0,
    genres: [] as string[],
    firstStart: true
  }),
  getters: {
    getPlaylistById: (state) => (playlistId: number): Playlist | undefined => {
      // Získat playlist na základě ID
      return state.playlists.find((playlist) => playlist.id === playlistId)
    },
    getPlaylistByName: (state) => (playlistName: string): Playlist | undefined => {
      // Získat playlist na základě názvu
      return state.playlists.find((playlist) => playlist.name === playlistName)
    }
  },
  actions: {
    saveStateToLocalStorage() {
      // Uložení stavu do Local Storage
      const state = this.$state
      localStorage.setItem('appState', JSON.stringify(state))
    },
    restoreStateFromLocalStorage() {
      // Získání stavu z Local Storage
      const storedState = localStorage.getItem('appState')
      if (storedState) {
        this.$state = JSON.parse(storedState)
      }
    },
    generatePlaylistId(): number {
      // Generuje unikátní playlist ID
      this.$state.lastPlaylistId += 1
      return this.$state.lastPlaylistId
    },
    addPlaylist(playlist: Playlist) {
      // Přidání playlistu do stavu
      playlist.id = this.generatePlaylistId()
      this.playlists.push(playlist)
      this.saveStateToLocalStorage()
    },
    removePlaylist(playlistId: number) {
      // Odebrání playlistu ze stavu
      const playlistIndex = this.playlists.findIndex((playlist) => playlist.id === playlistId)
      if (playlistIndex !== -1) {
        this.playlists.splice(playlistIndex, 1)
        this.saveStateToLocalStorage()
      }
    },
    addSongToPlaylist({ playlistId, song }: { playlistId: number, song: Song }) {
      // Přidání písničky do určitého playlistu v případě že existuje
      const playlist = this.getPlaylistById(playlistId)
      if (playlist) {
        playlist.songs.push(song)
        this.saveStateToLocalStorage()
      }
    },
    removeSongFromPlaylist({ playlistId, songId }: { playlistId: number, songId: string }) {
      // Odebrání písničky z určitého playlistu
      const playlist = this.getPlaylistById(playlistId)
      if (playlist) {
        const songIndex = playlist.songs.findLastIndex((s) => s.id === songId)
        if (songIndex !== -1) {
          playlist.songs.splice(songIndex, 1)
          this.saveStateToLocalStorage()
        }
      }
    },
    moveSongToNewPlaylist({ playlistId, songId, newPlaylistName }: { playlistId: number, songId: string, newPlaylistName: string }) {
      // Přesune song z playlistu do jiného
      const playlist = this.getPlaylistById(playlistId)
      const newPlaylist = this.getPlaylistByName(newPlaylistName)
      if(playlist && newPlaylist){
        const songIndex = playlist.songs.findIndex((s) => s.id === songId)
        if(songIndex !== -1){
          const songToMove = { ...playlist.songs[songIndex] }
          newPlaylist.songs.push(songToMove)
          playlist.songs.splice(songIndex, 1)
          this.saveStateToLocalStorage()
        }
      }
    },
    getPlaylistListNames(): String[] {
      // Získání všech názvů playlistů ze stavu
      return this.$state.playlists.map((playlist: Playlist) => playlist.name)
    },
    saveGenres(list: string[]) {
      // Uložení žánrů do stavu
      this.$state.genres = list
      this.$state.firstStart = false
      this.saveStateToLocalStorage()
    },
    saveGenreToSong(song: Song) {
      const playlists = this.$state.playlists
      const genreToUpdate = song.genre

      playlists.forEach(playlist => {
        playlist.songs.forEach(playlistSong => {
          if (playlistSong.id === song.id) {
            playlistSong.genre = genreToUpdate
          }
        })
      })
      this.saveStateToLocalStorage()
    }
  }
})