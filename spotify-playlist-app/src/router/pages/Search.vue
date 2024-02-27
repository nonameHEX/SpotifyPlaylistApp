<template>
  <v-container fluid data-cy="search-page">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-row align-center>
          <v-col cols="9">
            <v-text-field id="search-field" v-model="searchQuery" label="Autor / Název / Text na vyhledání"
              data-cy="search-field" outlined></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-btn id="search-button" color="green" class="mt-2" @click="searchTracks"
              data-cy="search-submit">Hledej</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row v-if="showResults" justify="center">
      <v-col cols="12" md="6">
        <v-text-field id="search-playlist-field" v-model="playlistName" label="Vyberte nebo zadejte název playlistu"
          data-cy="search-result-filter" outlined class="mt-4" :items="appStore.getPlaylistListNames()"></v-text-field>

        <v-list data-cy="search-result-list">
          <v-list-item v-for="track in foundTracks.tracks" :key="track.id" data-cy="search-result-list-item">
            <v-row align-center>
              <v-col cols="2">
                <img style="width:100px; height:100px" :src="track.spotifyImageUrl" @click="redirectToSpotify(track)">
              </v-col>
              <v-col cols="6" class="d-flex align-center" data-cy="record-name">
                {{ track.name }} - {{ track.artist.join(', ') }}
              </v-col>
              <v-col cols="4" class="d-flex align-center justify-center">
                <v-btn id="search-add-button" color="green" @click="addTrackToPlaylist(track)"
                  data-cy="add-to-playlist">Přidat do playlistu</v-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
  <v-snackbar color="green" v-model="errorStatus.eStatus" multi-line>
    {{ errorStatus.eMessage }}

    <template v-slot:actions>
      <v-btn color="red" variant="text" @click="errorStatus.eStatus = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import { reactive } from 'vue'
import { Playlist, Song } from '@/types/index'
import { useAppStore } from '@/store/app'
import { getAccessToken, parseSpotifyTrack, redirectToSpotify } from '@/utils/spotifySearchUtils'

const appStore = useAppStore()

const searchQuery = ref('')
const playlistName = ref('')
const showResults = ref(false)
const errorStatus = reactive({
  eStatus: false,
  eMessage: ""
})

const foundTracks = reactive({
  tracks: [] as Song[]
})

const searchTracks = async () => {
  const token = await getAccessToken()
  if (token) {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        params: {
          q: searchQuery.value,
          type: "track,artist,album",
        }
      })
      console.log("Search.vue: " + response.data.tracks.items)
      const parsedTracks = response.data.tracks.items.map(parseSpotifyTrack)
      foundTracks.tracks = parsedTracks
      showResults.value = true
    } catch (e: any) {
      console.error('Chyba při vyhledávání hudby:', e)
      errorStatus.eStatus = true
      errorStatus.eMessage = `Chyba při vyhledávání hudby. Odpověď serveru: ${e.response.data.error.status} -  ${e.response.data.error.message}`
      return null
    }
  } else {
    console.error('Nepodařilo se získat autorizační token.')
    errorStatus.eStatus = true
    errorStatus.eMessage = "Nepodařilo se získat autorizační token."
    return null
  }
}

const addTrackToPlaylist = async (track: Song) => {
  const searchName = playlistName.value === "" ? "playlist" : playlistName.value
  const playlist = appStore.getPlaylistByName(searchName)

  if (playlist) {
    // Playlist s daným názvem existuje, přidáme píseň do playlistu
    appStore.addSongToPlaylist({ playlistId: playlist.id, song: track })
  } else {
    // Playlist neexistuje, vytvoříme nový a přidáme do něj píseň
    const newPlaylist: Playlist = {
      id: appStore.$state.lastPlaylistId,
      name: searchName,
      songs: [track],
    }
    appStore.addPlaylist(newPlaylist)
  }
}
</script>