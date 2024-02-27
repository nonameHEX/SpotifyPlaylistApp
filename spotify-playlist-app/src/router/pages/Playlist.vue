<template>
    <v-container>
        <v-row>
            <v-col cols="4" class="text-h3">

                {{ playlist?.name }}

            </v-col>

            <v-col cols="8">
                <v-btn color="green" @click="downloadPlaylistJson" class="float-right">
                    Export Playlistu
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="3">
                <v-text-field v-model="searchQuery" :loading="false" density="compact" variant="solo"
                    label="Vyhledat písničku" append-inner-icon="mdi-magnify" single-line hide-details>
                </v-text-field>
            </v-col>
            <v-col cols="2">
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn color="green" v-bind="props" append-icon="mdi-arrow-down" class="my-1">
                            {{ getSortOptionLabel(sortOptions) }}
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="(option, index) in sortOptions" :key="index" :value="option.value"
                            @click="handleSortOption(option)">
                            <v-list-item-title>{{ option.label }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>

        </v-row>
        <v-row>
            <v-col v-for="song in sortedSongs" :key="song.id" cols="3">
                <SongCard :song="song" :playlist-id=playlist!!.id :delete-song="deleteSong"></SongCard>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script lang="ts" setup>
import { ref, defineProps, onMounted, computed } from 'vue'
import { useAppStore } from '@/store/app'
import SongCard from '@/components/SongCard.vue'
import { Playlist, Song } from '@/types/index'
import { sortOption, sortSongsByName, sortSongsByLength, handleSortOption, getSortOptionLabel } from '@/utils/sortUtils'

const appStore = useAppStore()

const props = defineProps<{
    id: string
}>()

const playlist = ref<Playlist | undefined>(undefined)
const searchQuery = ref("")
const filteredSongs = computed(() => {
    const filterText = searchQuery.value.toLowerCase()
    return playlist.value?.songs.filter((song) => {
        const lowerCaseName = song.name.toLowerCase()
        const lowerCaseArtists = song.artist.map((artist) => artist.toLowerCase())
        const lowerCaseGenre = song.genre.toLowerCase();

        return (
            lowerCaseName.includes(filterText) ||
            lowerCaseArtists.some((artist) => artist.includes(filterText)) ||
            (lowerCaseGenre !== "" && lowerCaseGenre.includes(filterText))
        )
    }) || []
})

const sortOptions = [
    { label: 'Neseřazovat', value: 'none' },
    { label: 'Abecedně (A-Z)', value: 'nameAsc' },
    { label: 'Abecedně (Z-A)', value: 'nameDesc' },
    { label: 'Délka (od nejkratší)', value: 'lengthAsc' },
    { label: 'Délka (od nejdelší)', value: 'lengthDesc' },
]

onMounted(() => {
    appStore.restoreStateFromLocalStorage()
    const playlistId = Number(props.id)
    const foundPlaylist = appStore.getPlaylistById(playlistId)
    if (foundPlaylist) {
        playlist.value = foundPlaylist
    }
})

const deleteSong = (song: Song) => {
    if(playlist.value?.id != null){
        appStore.removeSongFromPlaylist({ playlistId: playlist.value.id, songId: song.id })
    }
}

const generatePlaylistJson = () => {
    const playlistData = {
        name: playlist.value?.name,
        songs: playlist.value?.songs
    }
    const json = JSON.stringify(playlistData, null, 2)
    return json
}

const downloadPlaylistJson = () => {
    const json = generatePlaylistJson()
    const filename = "playlist " + (playlist.value ? playlist.value.name : '')
    const element = document.createElement('a')                     // Vytvoření DOM prvku , 'a' znamená že se bude stahovat
    const file = new Blob([json], { type: 'application/json' })     // Blob (Binary Large Object), vytvoření třídy s obsahem json
    element.href = URL.createObjectURL(file)                        // Vytvořený URL objekt pomocí createObjectURL ke stažení s objektem file
    element.download = filename                                     // Nastavení název objektu vlastnosti stahování
    document.body.appendChild(element)                              // Přidává vytvořený prvek do těla dokumentu
    element.click()                                                 // Simulace stisknutí
    document.body.removeChild(element)                              // Odebírání prvku
}

const sortedSongs = computed(() => {
    const songs = filteredSongs.value           // Prvně se vždy filtruje podle textu a potom až řadíme mezi sebou
    if (sortOption.value === 'nameAsc') {
        return sortSongsByName(songs, true)
    }
    if (sortOption.value === 'nameDesc') {
        return sortSongsByName(songs, false)
    }
    if (sortOption.value === 'lengthAsc') {
        return sortSongsByLength(songs, true)
    }
    if (sortOption.value === 'lengthDesc') {
        return sortSongsByLength(songs, false)
    }
    // Pokud není vybrána žádná možnost řazení, vrátíme písně v původním pořadí
    return songs
})
</script>
  
<style scoped>
.custom-chip {
    font-size: 24px;
    padding: 10px 20px;
}
</style>
  