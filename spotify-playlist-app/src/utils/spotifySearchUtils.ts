import { Song } from '@/types'
import axios from 'axios'

const clientId = "IMPLEMENT YOUR SPOTIFY ID"       //nefunguje mi process.env.SPOTIFY_CLIENT_ID
const clientSecret = "IMPLEMENT YOUR SPOTIFY ID"   //nefunguje mi process.env.SPOTIFY_CLIENT_SECRET
const encodeAuth = btoa(`${clientId}:${clientSecret}`)

export const getAccessToken = async () => {
    // Získání tokenu ze spotify API
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', {
            grant_type: 'client_credentials'
        }, {
            headers: {
                Authorization: `Basic ${encodeAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data.access_token;
    } catch (e) {
        console.error('Chyba při získávání autorizačního tokenu:', e)
        return null
    }
}

export const parseSpotifyTrack = (spotifyTrack: any): Song => {
    // Parsnutí dat získaných ze spotify API na dat. typ Song
    const track: Song = {
        id: spotifyTrack.id,
        name: spotifyTrack.name,
        artist: spotifyTrack.artists.map((artist: any) => artist.name),
        length_ms: spotifyTrack.duration_ms,
        spotifyUrl: spotifyTrack.external_urls.spotify,
        spotifyImageUrl: spotifyTrack.album.images[0].url,
        genre: ""
    }
    return track
}

export const redirectToSpotify = (track: Song) => {
    // Otevření odkazu v novém okně
    window.open(track.spotifyUrl, '_blank')
}