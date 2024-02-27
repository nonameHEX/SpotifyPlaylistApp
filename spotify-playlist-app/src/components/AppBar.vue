<template>
    <v-app-bar flat color="green">
        <v-container fluid>
            <v-row class="ml-5">
                <v-col>
                    <router-link id="main-page" :to="{ name: 'mainpage' }">
                        <v-btn variant="text" color="white" width="170">
                            Hlavní stránka
                        </v-btn>
                    </router-link>
                    <router-link :to="{ name: 'search' }">
                        <v-btn id="search-page" variant="text" color="white" width="170">
                            Vyhledat
                        </v-btn>
                    </router-link>
                </v-col>
            </v-row>
        </v-container>
    </v-app-bar>
</template>

<script lang="ts" setup>

</script>