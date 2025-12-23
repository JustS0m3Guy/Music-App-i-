//const AddToFavs = (songID) => {
//    console.log(`Adding song ${songID} to favorites.`);

//    // Here you would typically make an AJAX request to your backend to update the favorite status
//    // For demonstration, we'll just log to the console
    
//    // Example AJAX request (using fetch)


//}

document.addEventListener("DOMContentLoaded", async () => {
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

    await fetchComments();
    const form = document.getElementById('commentpost');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const response = await fetch('api/get-comments/', {
            method: 'POST',
            body: formData
        });
        if (response.ok)
        {
            await fetchComments();
            document.getElementById('commentText').value = '';
        }
    }

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

async function submitCommentForm(e, form, method, url) {
    e.preventDefault();
    const commentID = form.dataset.commentId;
    const csrftoken = getCookie('csrftoken');
    const response = await fetch('api/'+ url +'-comment/' + commentID + '/', {
        method: method,
        headers: {
            'X-CSRFToken': csrftoken,
        }
    });
    if (response.ok) {
        await fetchComments();
    }
}

async function fetchComments() {
    let url = 'api/get-comments';

    const response = await fetch(url);

    document.getElementById('commentGrid').innerHTML = await response.text();

    document.querySelectorAll('.deleteForm').forEach(form => {
        form.onsubmit = async (e) => {
            submitCommentForm(e, form, "DELETE", "delete")
        }
    });

    document.querySelectorAll('.likeForm').forEach(form => {
        form.onsubmit = async (e) => {
            submitCommentForm(e, form, "POST", "like")
        }
    });

    document.querySelectorAll('.replyForm').forEach(form => {
        form.onsubmit = async (e) => {
            submitCommentForm(e, form, "POST", "reply")
        }
    });
}

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

    // try to use URL parser for watch?v= style links first
    try {
        const u = new URL(url);
        // common watch?v=...
        const v = u.searchParams.get('v');
        if (v) return v;

        // youtu.be short links provide id as pathname
        if (u.hostname.includes('youtu.be')) {
            const seg = u.pathname.split('/');
            return seg.pop() || seg.pop();
        }

        // embed path /embed/ID
        const embedMatch = u.pathname.match(/\/embed\/([^\/\?\s]+)/);
        if (embedMatch && embedMatch[1]) return embedMatch[1];
    } catch (e) {
        // fallback to regex if not a full URL
    }

    // fallback regex patterns
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\s]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\s]+)/,
        /([A-Za-z0-9_-]{11})/  // last resort: 11-char id
    ];
    for (const re of patterns) {
        const m = url.match(re);
        if (m && m[1]) return m[1];
    }
    return null;
}

async function playSong(url) {
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

    const origin = (window.location && window.location.origin && (window.location.protocol === 'http:' || window.location.protocol === 'https:'))
        ? window.location.origin
        : '';

    const attempts = [
        { host: 'https://www.youtube.com', useOrigin: true },
        { host: 'https://www.youtube-nocookie.com', useOrigin: true },
        { host: 'https://www.youtube-nocookie.com', useOrigin: false }, // fallback without origin
    ];

    // ensure the YouTube IFrame API is loaded and ready
    function ensureYouTubeAPILoaded() {
        return new Promise((resolve, reject) => {
            if (window.YT && window.YT.Player) return resolve(window.YT);
            // if a loader is already in progress, poll for YT.Player
            if (window.__yt_api_loading) {
                const check = () => {
                    if (window.YT && window.YT.Player) return resolve(window.YT);
                    setTimeout(() => {
                        if (window.YT && window.YT.Player) return resolve(window.YT);
                        if (window.__yt_api_loading) check(); else reject(new Error('YT API failed to load'));
                    }, 100);
                };
                return check();
            }
            window.__yt_api_loading = true;
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;
            tag.onload = () => {
                // The API sets window.onYouTubeIframeAPIReady — install a fallback
                const readyCheck = () => {
                    if (window.YT && window.YT.Player) {
                        window.__yt_api_loading = false;
                        return resolve(window.YT);
                    }
                    setTimeout(readyCheck, 50);
                };
                readyCheck();
            };
            tag.onerror = () => {
                window.__yt_api_loading = false;
                reject(new Error('Failed to load YouTube iframe_api'));
            };
            document.head.appendChild(tag);
            // also support the official callback name if it gets called
            window.onYouTubeIframeAPIReady = () => {
                window.__yt_api_loading = false;
                if (window.YT && window.YT.Player) resolve(window.YT);
            };
        });
    }

    // try variants until one succeeds
    let lastError = null;
    for (const attempt of attempts) {
        const embedSrc = `${attempt.host}/embed/${id}?autoplay=1&rel=0&enablejsapi=1&modestbranding=1&playsinline=1`;
        console.info('Trying YouTube embed src:', embedSrc);

        // create fresh iframe
        player.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.id = 'yt-iframe';
        iframe.width = '100%';
        iframe.height = '360';
        iframe.src = embedSrc;
        iframe.title = 'YouTube video player';
        // match the default embed allow list and referrer policy
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('loading', 'lazy');
        iframe.allowFullscreen = true;

        player.appendChild(iframe);
        wrapper.style.display = 'block';
        const closeBtn = document.getElementById('close-video');
        if (closeBtn) {
            closeBtn.style.display = 'inline-block';
            closeBtn.onclick = () => {
                player.innerHTML = '';
                wrapper.style.display = 'none';
                closeBtn.style.display = 'none';
            };
        }

        // Load API and instantiate YT.Player to get onReady/onError callbacks
        try {
            await ensureYouTubeAPILoaded();

            const readyOrError = await new Promise((resolve, reject) => {
                let timedOut = false;
                const to = setTimeout(() => {
                    timedOut = true;
                    reject(new Error('YT.Player onReady/onError timeout'));
                }, 3000);

                // create a player instance that will call back
                try {
                    const ytPlayer = new YT.Player('yt-iframe', {
                        events: {
                            onReady: (ev) => {
                                if (timedOut) return;
                                clearTimeout(to);
                                resolve({ ok: true, ev });
                            },
                            onError: (ev) => {
                                if (timedOut) return;
                                clearTimeout(to);
                                reject(new Error('YT player error code: ' + (ev && ev.data)));
                            }
                        }
                    });
                } catch (err) {
                    clearTimeout(to);
                    reject(err);
                }
            });

            return; // success
        } catch (err) {
            lastError = err;
            console.warn('YT API/player failed for', embedSrc, '; trying next fallback. Error:', err.message || err);
            // remove iframe and continue to next attempt
            player.innerHTML = '';
            await new Promise(r => setTimeout(r, 300));
        }
    }

    console.error('YouTube embed attempts failed. Last error:', lastError && (lastError.message || lastError));
    console.info('Diagnostics: check browser extensions (adblock/privacy). If you see net::ERR_BLOCKED_BY_CLIENT in DevTools network/console, disable blockers and retry.');
    console.info('Also open the logged embed URL directly in a new tab to see if YouTube shows "embedding disabled by the owner".');
}


