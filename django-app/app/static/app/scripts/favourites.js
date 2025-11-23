document.addEventListener("DOMContentLoaded", async() => {
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(b => b.classList.remove("active"));
  const favsButton = document.getElementById("favs-button");
  favsButton.classList.add("active");
  await renderFavourites();

});


async function renderFavourites() {
  // const favsGamesGrid = document.getElementById("favsGamesGrid");
  // favsGamesGrid.innerHTML = "";
  // games.forEach(g => {
  //   if (favGames.has(g.id)) {
  //     const card = document.createElement("div");
  //     card.className = "game-card";
  //     card.dataset.id = g.id;
  //     const placeholder = document.createElement("div");
  //     placeholder.className = "placeholder";
  //     placeholder.textContent = "No Image";
  //     card.appendChild(placeholder);
  //     const overlay = document.createElement("div");
  //     overlay.className = "overlay";
  //     overlay.textContent = g.name;
  //     card.appendChild(overlay);
  //     card.addEventListener("click", () => showGame(g.id));
  //     favsGamesGrid.appendChild(card);
  //   }
  // });

  const favsSongsList = document.getElementById("favsSongsList");
  favsSongsList.innerHTML = "";
  await fetch(`/api/get-fav-songs/`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
    ).then(data => {
      for (let s of data) {
        const row = document.createElement("div"); row.className = "song-row";
        // store video url on the row so handler can read it
        row.dataset.video = s.videoURL || s.videoUrl || s.video || '';

        const playCell = document.createElement("div"); 
        const btn = document.createElement("button"); 
        btn.className = "btn-play"; btn.textContent = "▶"; 
        // attach play handler (uses playSong defined below)
        btn.addEventListener("click", () => {
          if (typeof playSong === 'function') playSong(row.dataset.video);
          else console.warn('playSong not defined on this page.');
        });
        playCell.appendChild(btn);
        const titleCell = document.createElement("div"); 
        titleCell.className = "song-meta"; titleCell.textContent = s.songName; titleCell.onclick = () => { window.location.href = `/games/${s.gameID_id}/`; };
        const actionsCell = document.createElement("div"); 
        actionsCell.className = "song-actions";
        const heart = document.createElement("div"); 
        heart.className = "heart active";
        heart.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6c-1.4-1.4-3.6-1.4-5 0L12 8.4 8.2 4.6c-1.4-1.4-3.6-1.4-5 0-1.4 1.4-1.4 3.6 0 5L12 21.5l8.8-11c1.4-1.4 1.4-3.6 0-5z"></path></svg>`;
        heart.addEventListener("click", () => { AddToFavs(s.songID); });
        actionsCell.appendChild(heart);
        row.appendChild(playCell); row.appendChild(titleCell); row.appendChild(actionsCell);
        favsSongsList.appendChild(row);
      }
    }
    )
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
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
    console.log('Favs updated successfully');
    renderFavourites();
    // document.getElementById(`fav-${songId}`).classList.toggle('active');
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


