<template>
    <v-container v-if="loaded && trackInfo">
        <v-row>
            <v-col class="my-2 ml-0 text-h3">
                {{ trackInfo ? trackInfo.name : 'Název není k dispozici' }}
                <v-btn color="green" :href="trackInfo ? trackInfo.external_urls.spotify : ''" target="_blank"
                    class="ml-2">Poslech ve Spotify</v-btn>
            </v-col>

        </v-row>

        <v-row class="fill-height d-flex">
            <v-col cols="3">
                <v-card variant="tonal">
                    <v-img :src="trackInfo.album.images[0].url" cover></v-img>

                    <v-card-title>
                        Umělec: {{ trackInfo.artists[0].name }}
                    </v-card-title>

                    <v-card-subtitle>
                        Datum vydání: {{ trackInfo.album.release_date }}

                    </v-card-subtitle>

                    <v-card-text>
                        Délka písničky: {{ formatDuration(trackInfo.duration_ms) }} <br>
                        Album: {{ trackInfo.album.name }} <br>
                        Popularita: {{ popularityName(trackInfo.popularity) }}
                        <v-progress-linear v-model="trackInfo.popularity" :color="popularityColor(trackInfo.popularity)"
                            height="25">

                            <strong>{{ trackInfo.popularity }}</strong>


                        </v-progress-linear>

                    </v-card-text>

                </v-card>
            </v-col>

            <v-col cols="1"></v-col>
            <v-col cols="2">
                <v-row>Podobné písničky</v-row>
                <v-row v-for="track in recommendedTracks" :key="track.id">
                    <recommed-song-card :song="track" :playlist-id=playlistId></recommed-song-card>
                </v-row>
            </v-col>
            <v-col cols="1"></v-col>
            <v-col cols="5">

                <v-row class="d-flex">
                    <v-autocomplete v-model="selectedPlaylist" label="Playlist" :items="getPlaylistNames()"
                        variant="outlined"></v-autocomplete>
                    <v-btn class="ma-2" color="green" @click="moveSongToNewPlaylist">Uložit</v-btn>
                </v-row>

                <v-row class="d-flex">
                    <v-autocomplete v-model="selectedGenre" label="Žánr" :items=genres variant="outlined"></v-autocomplete>
                    <v-btn class="ma-2" color="green" @click="saveGenreToSong">Uložit</v-btn>
                </v-row>
            </v-col>

        </v-row>
    </v-container>

    <v-container v-else>
        <v-col cols="12" class="text-center">
            <v-progress-circular :size="70" :width="7" color="green" indeterminate></v-progress-circular>
        </v-col>
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
import { ref, onMounted, defineProps, reactive } from 'vue'
import axios from 'axios'
import { useAppStore } from '@/store/app'
import { getAccessToken, parseSpotifyTrack } from '@/utils/spotifySearchUtils'
import RecommedSongCard from '@/components/RecommedSongCard.vue'
import { Playlist, Song } from '@/types'
import { formatDuration } from '@/utils/timeUtil'

const appStore = useAppStore()

const props = defineProps<{
    songId: string,
    playlistId: string
}>()

console.log("Song.vue: " + props.songId + "\n" + props.playlistId)

const trackInfo = ref<any>(null)
const recommendedTracks = ref<Song[]>([])
const loaded = ref(false)
const genres = ref<string[]>([])
const song = ref<Song>()
const playlist = ref<Playlist>()
const selectedGenre = ref("")
const selectedPlaylist = ref("")
const errorStatus = reactive({
    eStatus: false,
    eMessage: ""
})

// Načtení informací o písničce podle songID a playlistID + získání bližších informací o písničce
onMounted(() => {
    appStore.restoreStateFromLocalStorage()
    genres.value = appStore.$state.genres
    playlist.value = appStore.getPlaylistById(Number(props.playlistId))
    song.value = playlist.value?.songs.find((song) => song.id === props.songId)
    if (song.value) {
        selectedGenre.value = String(song.value.genre)
    }
    if (playlist.value) {
        selectedPlaylist.value = playlist.value.name
    }
    searchTrack()

    console.log(song.value)
    console.log(playlist.value)
})

const getPlaylistNames = () => {
    return appStore.getPlaylistListNames()
}

const saveGenreToSong = () => {
    if (song.value) {
        song.value.genre = selectedGenre.value
        appStore.saveGenreToSong(song.value)
    }
}

const moveSongToNewPlaylist = () => {
    if (song.value && playlist.value && selectedPlaylist.value) {
        console.log(song.value.id)
        console.log(playlist.value.id)
        console.log(selectedPlaylist.value)
        appStore.moveSongToNewPlaylist({ playlistId: playlist.value.id, songId: song.value.id, newPlaylistName: selectedPlaylist.value })
    }
}

const searchTrack = async () => {
    const token = await getAccessToken()
    if (token) {
        try {
            const response = await axios.get(`https://api.spotify.com/v1/tracks/${props.songId}`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            })
            trackInfo.value = response.data
            getRecommendedTracks(token) // Získání doporučených písní
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

const getRecommendedTracks = async (token: string) => {
    try {
        const response = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                Authorization: 'Bearer ' + token,
            },
            params: {
                seed_tracks: props.songId,
                seed_artists: trackInfo.value.artists[0].id,
                limit: 5,
            },
        })
        console.log("Song.vue: " + response.data.tracks)
        const parsedTracks = response.data.tracks.map(parseSpotifyTrack)
        recommendedTracks.value = parsedTracks
        loaded.value = true
    } catch (e: any) {
        console.error('Chyba při získávání doporučení:', e)
        errorStatus.eStatus = true
        errorStatus.eMessage = `Chyba při vyhledávání doporučené hudby. Odpověď serveru: ${e.response.data.error.status} -  ${e.response.data.error.message}`
    }
}

const popularityName = (popularity: number) => {
    if (popularity <= 33) {
        return "nepopulární"
    }
    else if ((popularity > 33) && (popularity <= 66)) {
        return "známé"
    }
    else if (popularity > 66) {
        return "populární"
    }
    else {
        return "neznámé"
    }
}

const popularityColor = (popularity: number) => {
    if (popularity <= 33) {
        return "red"
    }
    else if ((popularity > 33) && (popularity <= 66)) {
        return "orange"
    }
    else if (popularity > 66) {
        return "green"
    }
    else {
        return "gray"
    }
}
</script>