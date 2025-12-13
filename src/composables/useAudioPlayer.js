import { ref } from 'vue';

// Global state for audio player
const audioRef = ref(null);
const isPlaying = ref(false);
const currentUrl = ref(null);

export function useAudioPlayer() {
    const togglePlay = () => {
        if (!audioRef.value) return;

        if (isPlaying.value) {
            audioRef.value.pause();
            isPlaying.value = false;
        } else {
            audioRef.value.play().catch(e => console.error("Play failed:", e));
            isPlaying.value = true;
        }
    };

    const play = () => {
        if (!audioRef.value) return;
        audioRef.value.play().catch(e => console.error("Play failed:", e));
        isPlaying.value = true;
    };

    const pause = () => {
        if (!audioRef.value) return;
        audioRef.value.pause();
        isPlaying.value = false;
    };

    const setTrack = (url) => {
        if (!audioRef.value || !url) return;

        // Only change src if it's different to avoid reloading
        if (audioRef.value.src !== url) {
            audioRef.value.src = url;
            currentUrl.value = url;
            play();
        } else {
            // If same track, just ensure it's playing
            if (!isPlaying.value) {
                play();
            }
        }
    };

    return {
        audioRef,
        isPlaying,
        currentUrl,
        togglePlay,
        play,
        pause,
        setTrack
    };
}
