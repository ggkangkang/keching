import { ref } from 'vue';

// Global state for audio player
const audioRef = ref(null);
const isPlaying = ref(false);
const currentUrl = ref(null);

export function useAudioPlayer() {
    const togglePlay = async () => {
        if (!audioRef.value) return;

        if (isPlaying.value) {
            audioRef.value.pause();
            isPlaying.value = false;
        } else {
            try {
                await audioRef.value.play();
                isPlaying.value = true;
            } catch (e) {
                console.error("Toggle play failed:", e);
                isPlaying.value = false;
            }
        }
    };

    const play = async () => {
        if (!audioRef.value) return;
        try {
            await audioRef.value.play();
            isPlaying.value = true;
        } catch (e) {
            console.error("Play failed:", e);
            isPlaying.value = false;
        }
    };

    const pause = () => {
        if (!audioRef.value) return;
        audioRef.value.pause();
        isPlaying.value = false;
    };

    const setTrack = async (url) => {
        if (!audioRef.value || !url) return;

        // Compare with currentUrl instead of audioRef.src to avoid token mismatch
        const isDifferentTrack = currentUrl.value !== url;

        if (isDifferentTrack) {
            console.log('Setting new track:', url);
            audioRef.value.src = url;
            currentUrl.value = url;

            // Load the audio first, then play
            try {
                audioRef.value.load();
                await play();
            } catch (e) {
                console.error('Failed to load and play track:', e);
                isPlaying.value = false;
            }
        } else {
            // If same track, just ensure it's playing
            if (!isPlaying.value) {
                await play();
            }
        }
    };

    const setupAudioListeners = () => {
        if (!audioRef.value) return;

        // Sync state when audio actually starts playing
        audioRef.value.addEventListener('play', () => {
            console.log('✅ Audio play event fired');
            isPlaying.value = true;
        });

        // Sync state when audio pauses
        audioRef.value.addEventListener('pause', () => {
            console.log('⏸️ Audio pause event fired');
            isPlaying.value = false;
        });

        // Sync state when audio ends
        audioRef.value.addEventListener('ended', () => {
            console.log('🏁 Audio ended event fired');
            isPlaying.value = false;
        });

        // Listen for errors
        audioRef.value.addEventListener('error', (e) => {
            console.error('❌ Audio error:', e);
            console.error('Error code:', audioRef.value.error?.code);
            console.error('Error message:', audioRef.value.error?.message);
            isPlaying.value = false;
        });

        // Listen for loading events
        audioRef.value.addEventListener('loadstart', () => {
            console.log('📥 Audio loading started');
        });

        audioRef.value.addEventListener('loadedmetadata', () => {
            console.log('📊 Audio metadata loaded, duration:', audioRef.value.duration);
        });

        audioRef.value.addEventListener('loadeddata', () => {
            console.log('📦 Audio data loaded');
        });

        audioRef.value.addEventListener('canplay', () => {
            console.log('▶️ Audio can play');
        });

        audioRef.value.addEventListener('canplaythrough', () => {
            console.log('▶️▶️ Audio can play through');
        });

        audioRef.value.addEventListener('stalled', () => {
            console.warn('⚠️ Audio stalled');
        });

        audioRef.value.addEventListener('waiting', () => {
            console.warn('⏳ Audio waiting for data');
        });
    };

    // Set audio source without playing (for background sync, iOS-friendly)
    const setSource = (url) => {
        if (!audioRef.value || !url) return;

        const isDifferentTrack = currentUrl.value !== url;

        if (isDifferentTrack) {
            console.log('Setting audio source (no autoplay):', url);
            audioRef.value.src = url;
            currentUrl.value = url;
            audioRef.value.load();
        }
    };

    return {
        audioRef,
        isPlaying,
        currentUrl,
        togglePlay,
        play,
        pause,
        setTrack,
        setSource,
        setupAudioListeners
    };
}
