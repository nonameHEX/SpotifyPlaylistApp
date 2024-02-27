<template>
    <v-card class="mx-auto" variant="outlined">
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

                <v-card-text>
                    Délka písničky: {{ formatDuration(song.length_ms) }}
                </v-card-text>

                <v-card-actions>
                    <router-link :to="{ name: 'song', params: { playlistId: playlistId, songId: song.id } }">
                        <v-btn color="green">Otevřít informace</v-btn>
                    </router-link>
                    <v-btn color="green" @click="deleteSong(song)">Smazat</v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-card>
</template>

  
<script lang="ts" setup>
import { defineProps } from 'vue'
import { Song } from '@/types/index'
import { useAppStore } from '@/store/app'
import { formatDuration } from '@/utils/timeUtil'

const appStore = useAppStore()

// Definice propu pro předávání písně z Playlist.vue
const props = defineProps({
    song: {
        type: Object as () => Song,
        required: true,
    },
    playlistId: {
        type: Number,
        required: true,
    },
    deleteSong: {
        type: Function as () => Function,
        required: true,
    },
})
</script>