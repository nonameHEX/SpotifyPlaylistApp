<template>
    <v-card v-if="playlist.songs[0] != null" variant="outlined" height="150" class="mx-auto d-flex flex-column text-white">

        <v-img :src="playlist.songs[0].spotifyImageUrl" cover>

            <v-card-title>

                <v-chip color="white" label variant="flat">
                    {{ playlist.name }}
                </v-chip>

            </v-card-title>

            <v-card-text>
                <v-chip color="white" variant="flat" label>
                    Počet písniček: {{ playlist.songs.length }}
                </v-chip>
            </v-card-text>

            <v-card-actions>
                <router-link :to="{ name: 'playlist', params: { id: playlist.id } }">
                    <v-btn variant="flat" id="pcard-open" color="green" data-cy="playlist-open-button">Otevřít playlist</v-btn>
                </router-link>
                <v-btn variant="flat" id="pcard-delete" color="green" @click="removePlaylist" class="ml-1" data-cy="playlist-delete-button">Smazat</v-btn>
            </v-card-actions>

        </v-img>

    </v-card>
    <v-card v-else variant="outlined" height="150" class="mx-auto d-flex flex-column">


        <v-card-title>
            {{ playlist.name }}
        </v-card-title>

        <v-card-text>
            Počet písniček: {{ playlist.songs.length }}
        </v-card-text>
        <v-card-actions>
            <router-link :to="{ name: 'playlist', params: { id: playlist.id } }">
                <v-btn id="pcard-open" color="green">Otevřít playlist</v-btn>
            </router-link>
            <v-btn id="pcard-delete" color="green" @click="removePlaylist">Smazat</v-btn>
        </v-card-actions>


    </v-card>
</template>
  
<script lang="ts" setup>
import { defineProps } from 'vue'
import { Playlist } from '@/types/index'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()

const props = defineProps({
    playlist: {
        type: Object as () => Playlist,
        required: true,
    },
})
const { playlist } = props

const removePlaylist = () => {
    appStore.removePlaylist(playlist.id)
}

</script>

