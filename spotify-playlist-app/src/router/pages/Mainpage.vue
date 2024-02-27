<template>
    <v-container>
        <v-row>
            <v-col cols="4">
                <h1 data-cy="main-page-header"><strong>Seznam playlistů</strong></h1>
            </v-col>
            <v-col cols="8">
                <v-btn color="green" class="float-right" @click="importPlaylist" data-cy="import-playlist-button">
                    Import Playlistu
                </v-btn>
                <input type="file" ref="fileInput" style="display: none" @change="handleFileUpload" accept=".json"
                    data-cy="import-playlist-input">
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="3">
                <v-text-field v-model="searchQuery" :loading="false" density="compact" variant="solo"
                    data-cy="playlists-search-field" label="Vyhledat playlist" append-inner-icon="mdi-magnify" single-line
                    hide-details>
                </v-text-field>
            </v-col>
            <v-col cols="2">
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn color="green" v-bind="props" append-icon="mdi-arrow-down" class="my-1"
                            data-cy="playlists-search-button">
                            {{ getSortOptionLabel(sortOptions) }}
                        </v-btn>
                    </template>
                    <v-list data-cy="playlists-search-options">
                        <v-list-item data-cy="playlists-search-option" v-for="(option, index) in sortOptions" :key="index"
                            :value="option.value" @click="handleSortOption(option)">
                            <v-list-item-title>{{ option.label }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>

        </v-row>
        <v-row>
            <v-col v-for="playlist in sortedPlaylists" :key="playlist.id" cols="3" data-cy="playlists">
                <PlaylistCard :playlist="playlist" data-cy="playlist"></PlaylistCard>
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
import { ref, onMounted, computed, reactive } from 'vue'
import axios from 'axios'
import PlaylistCard from '@/components/PlaylistCard.vue'
import { getAccessToken } from '@/utils/spotifySearchUtils'
import { useAppStore } from '@/store/app'
import { sortOption, sortPlaylistByCount, handleSortOption, getSortOptionLabel } from '@/utils/sortUtils'

const appStore = useAppStore()

const playlists = ref(appStore.playlists)
const fileInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref("")
const filteredPlaylists = computed(() => {
    const filterText = searchQuery.value.toLocaleLowerCase()
    return playlists.value?.filter((playlist) =>
        playlist.name.toLowerCase().includes(filterText)
    ) || []
})
const errorStatus = reactive({
    eStatus: false,
    eMessage: ""
})

const sortOptions = [
    { label: 'Neseřazovat', value: 'none' },
    { label: 'Počet písní (vzestupně)', value: 'cntAsc' },
    { label: 'Počet písní (sestupně)', value: 'cntDesc' },
]

onMounted(() => {
    appStore.restoreStateFromLocalStorage()
    playlists.value = appStore.playlists
    if (appStore.$state.firstStart) {
        getGenres()
    }
})

const importPlaylist = () => {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

const handleFileUpload = (event: Event) => {
    const fileInput = event.target as HTMLInputElement
    const file = fileInput.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const importedPlaylist = JSON.parse(reader.result as string)
                appStore.addPlaylist(importedPlaylist)
            } catch (error) {
                console.error('Chyba při importování playlistu:', error)
            }
        }
        reader.readAsText(file)
    }
}

const getGenres = async () => {
    const token = await getAccessToken()
    if (token) {
        try {
            const response = await axios.get(`https://api.spotify.com/v1/recommendations/available-genre-seeds`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            })
            appStore.saveGenres(response.data.genres)

        } catch (e: any) {
            console.error('Chyba při vyhledávání hudby:', e)
            errorStatus.eStatus = true
            errorStatus.eMessage = `Chyba při stahování žánrů. Odpověď serveru: ${e.response.data.error.status} -  ${e.response.data.error.message}`
            return null
        }
    } else {
        console.error('Nepodařilo se získat autorizační token.')
        errorStatus.eStatus = true
        errorStatus.eMessage = "Nepodařilo se získat autorizační token."
        return null
    }
}

const sortedPlaylists = computed(() => {
    const newList = filteredPlaylists.value
    if (sortOption.value === 'cntAsc') {
        return sortPlaylistByCount(newList, true)
    }
    if (sortOption.value === 'cntDesc') {
        return sortPlaylistByCount(newList, false)
    }
    return newList
})
</script>