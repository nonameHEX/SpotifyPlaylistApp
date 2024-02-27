<template>
    <v-card class="mb-1" cols="5" variant="outlined">
        <v-row no-gutters>
            <v-col cols="4">
                <v-img :src="song.spotifyImageUrl" height="100%" :aspect-ratio="16 / 9" cover></v-img>
            </v-col>

            <v-col cols="8">
                <v-card-title>
                    {{ song.name }}
                </v-card-title>

                <v-card-subtitle>
                    {{ song.artist.join(', ') }}
                </v-card-subtitle>

                <v-card-actions>
                    <v-row>
                        <v-btn color="green" @click="addToCurrentPlaylist(Number(playlistId))" class="ml-3">Přidat do
                            playlistu</v-btn>
                        <v-btn color="green" @click="redirectToSpotify(song)" class="ml-3">Poslechnout</v-btn>
                    </v-row>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-card>
</template>
  
<script lang="ts" setup>
import { defineProps } from 'vue'
import { Song } from '@/types/index'
import { useAppStore, } from '@/store/app'
import { redirectToSpotify } from '@/utils/spotifySearchUtils'

const appStore = useAppStore()

const props = defineProps({
    song: {
        type: Object as () => Song,
        required: true,
    },
    playlistId: {
        type: String,
        required: true,
    }
})

const addToCurrentPlaylist = (playlistId: number) => {
    const currentPlaylistId = playlistId
    const currentPlaylist = appStore.getPlaylistById(currentPlaylistId)
    console.log(currentPlaylist)
    if (currentPlaylist) {
        appStore.addSongToPlaylist({ playlistId: currentPlaylistId, song: props.song })
    }
}
</script>