// Composables
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Mainpage from "@/router/pages/Mainpage.vue"
import Playlist from "@/router/pages/Playlist.vue"
import Song from "@/router/pages/Song.vue"
import Search from "@/router/pages/Search.vue"
import NotFound from "@/router/pages/NotFound.vue"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: Mainpage,
    name: "mainpage"
  },
  {
    path: "/playlist/:id",
    component: Playlist,
    name: "playlist",
    props: true
  },
  {
    path: "/playlist/:playlistId/song/:songId",
    component: Song,
    name: "song",
    props: true
  },
  {
    path: "/search",
    component: Search,
    name: "search"
  },

  { path: "/:pathMatch(.*)*", component: NotFound, name: "notfound" }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
