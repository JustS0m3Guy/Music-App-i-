document.addEventListener("DOMContentLoaded", () => {
    const gameId = document.getElementById('game-id').value;
    fetch(`/api/get-favs-per-game/${gameId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
        )
        .then(data => {
            const favsPerUserId = data.favs_per_user_id;
            favsPerUserId.forEach(songId => {
                const favElement = document.getElementById(`fav-${songId}`);
                if (favElement) {
                    favElement.classList.add('active');
                }
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // attach play handlers for any .btn-play already on the page
    document.querySelectorAll('.btn-play').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // prefer data-video attribute, fallback to onclick in template that already calls playSong
            const row = btn.closest('.song-row');
            const url = row && row.dataset && row.dataset.video ? row.dataset.video : null;
            if (url) playSong(url);
        });
    });
});


function getCookie(name) {
    if (typeof name !== "string" || !name.trim()) {
        console.error("Invalid cookie name");
        return null;
    }

    // document.cookie returns a single string like "key1=value1; key2=value2"
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        // Remove leading spaces
        cookie = cookie.trim();

        // Check if this cookie starts with the desired name
        if (cookie.startsWith(name + "=")) {
            // Decode in case the value was URL-encoded
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }

    // Cookie not found
    return null;
}
async function AddToFavs(songId) {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`/api/add-to-favs/${songId}/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        console.error('Failed to update favs', response.status);
        return;
    }
    else {
        console.log('Favs updated successfully');
        document.getElementById(`fav-${songId}`).classList.toggle('active');
    }


    const btn = document.querySelector(`#fav-btn-${songId}`);
    if (btn) {
        if (data.status === 'added') btn.classList.add('favorited');
        else btn.classList.remove('favorited');
    }
}

/* ---- new: YouTube player helpers ---- */
function parseYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    // common YouTube URL patterns
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\s]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\s]+)/,
    ];
    for (const re of patterns) {
        const m = url.match(re);
        if (m && m[1]) return m[1];
    }
    // fallback: last path segment
    try {
        const u = new URL(url);
        const segments = u.pathname.split('/');
        return segments.pop() || segments.pop(); // handle trailing slash
    } catch (e) {
        return null;
    }
}

function playSong(url) {
    const id = parseYouTubeId(url);
    if (!id) {
        console.warn('Could not parse YouTube id from', url);
        return;
    }
    const wrapper = document.getElementById('video-wrapper');
    const player = document.getElementById('youtube-player');
    if (!wrapper || !player) {
        console.warn('Video container not found. Ensure #video-wrapper and #youtube-player exist in the template.');
        return;
    }

    // create iframe with autoplay
    player.innerHTML = `<iframe
        width="100%"
        height="360"
        src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;

    wrapper.style.display = 'block';
    const closeBtn = document.getElementById('close-video');
    if (closeBtn) {
        closeBtn.style.display = 'inline-block';
        closeBtn.onclick = () => {
            player.innerHTML = '';           // stops playback
            wrapper.style.display = 'none';
            closeBtn.style.display = 'none';
        };
    }
}


