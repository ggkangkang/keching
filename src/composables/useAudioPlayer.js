import { ref } from 'vue';

// Global state for audio player
const audioRef = ref(null);
const isPlaying = ref(false);
const currentUrl = ref(null);

export function useAudioPlayer() {
    // iOS PWA workaround: unlock audio context on first user interaction
    let audioUnlocked = false;

    const unlockAudio = async () => {
        if (audioUnlocked || !audioRef.value) return;

        try {
            console.log('Attempting to unlock audio for iOS PWA...');

            // Method 1: Try with a silent data URL (empty audio)
            const silentAudio = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T0Uy8UAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEDwPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEHwPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

            const originalSrc = audioRef.value.src;
            audioRef.value.src = silentAudio;
            audioRef.value.volume = 0.01; // Very quiet

            await audioRef.value.play();
            await new Promise(resolve => setTimeout(resolve, 100)); // Let it play briefly
            audioRef.value.pause();

            // Restore
            if (originalSrc) {
                audioRef.value.src = originalSrc;
            }
            audioRef.value.volume = 1.0;

            audioUnlocked = true;
            console.log('Audio unlocked successfully!');
        } catch (e) {
            console.error('Audio unlock failed:', e);
            // Try fallback method
            try {
                audioRef.value.volume = 0;
                await audioRef.value.play();
                audioRef.value.pause();
                audioRef.value.volume = 1.0;
                audioUnlocked = true;
                console.log('Audio unlocked with fallback method');
            } catch (e2) {
                console.error('Fallback unlock also failed:', e2);
            }
        }
    };

    const togglePlay = async () => {
        if (!audioRef.value) return;

        // Try to unlock audio first (iOS PWA requirement)
        await unlockAudio();

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

        // Try to unlock audio first (iOS PWA requirement)
        await unlockAudio();

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

        // Ensure audio is not muted and volume is at max
        audioRef.value.volume = 1.0;
        audioRef.value.muted = false;
        console.log('Audio setup - Volume:', audioRef.value.volume, 'Muted:', audioRef.value.muted);

        // Sync state when audio actually starts playing
        audioRef.value.addEventListener('play', () => {
            console.log('Audio play event fired');
            isPlaying.value = true;
        });

        // Sync state when audio pauses
        audioRef.value.addEventListener('pause', () => {
            console.log('Audio pause event fired');
            isPlaying.value = false;
        });

        // Sync state when audio ends
        audioRef.value.addEventListener('ended', () => {
            console.log('Audio ended event fired');
            isPlaying.value = false;
        });

        // Debug: Check if audio is loading
        audioRef.value.addEventListener('loadstart', () => {
            console.log('Audio loadstart - starting to load');
        });

        audioRef.value.addEventListener('loadeddata', () => {
            console.log('Audio loadeddata - data loaded successfully');
        });

        audioRef.value.addEventListener('canplay', () => {
            console.log('Audio canplay - ready to play');
        });

        // Debug: Check for errors
        audioRef.value.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            console.error('Audio error code:', audioRef.value.error?.code);
            console.error('Audio error message:', audioRef.value.error?.message);
        });

        // Debug: Check volume
        audioRef.value.addEventListener('volumechange', () => {
            console.log('Audio volume:', audioRef.value.volume);
            console.log('Audio muted:', audioRef.value.muted);
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
