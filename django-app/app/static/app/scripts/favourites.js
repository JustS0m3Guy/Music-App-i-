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

/* ---- small YouTube helper (same as in game_detail.js) ---- */
function parseYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\s]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\s]+)/,
  ];
  for (const re of patterns) {
      const m = url.match(re);
      if (m && m[1]) return m[1];
  }
  try {
      const u = new URL(url);
      const segments = u.pathname.split('/');
      return segments.pop() || segments.pop();
  } catch (e) {
      return null;
  }
}

function playSong(url) {
  const id = parseYouTubeId(url);
  if (!id) return console.warn('Invalid youtube url', url);
  let wrapper = document.getElementById('video-wrapper');
  let player = document.getElementById('youtube-player');
  if (!wrapper || !player) {
    // create minimal player UI if not present
    wrapper = document.createElement('div');
    wrapper.id = 'video-wrapper';
    wrapper.style.position = 'fixed';
    wrapper.style.left = '50%';
    wrapper.style.top = '10%';
    wrapper.style.transform = 'translateX(-50%)';
    wrapper.style.zIndex = '9999';
    wrapper.style.background = '#000';
    wrapper.style.padding = '8px';
    player = document.createElement('div');
    player.id = 'youtube-player';
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-video';
    closeBtn.textContent = 'Close';
    closeBtn.style.marginTop = '6px';
    closeBtn.onclick = () => { player.innerHTML = ''; wrapper.remove(); };
    wrapper.appendChild(player);
    wrapper.appendChild(closeBtn);
    document.body.appendChild(wrapper);
  }

  player.innerHTML = `<iframe
      width="900"
      height="506"
      src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
}
