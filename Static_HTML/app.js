// app.js - same client-side prototype logic as before
document.addEventListener("DOMContentLoaded", () => {
  const homeView = document.getElementById("homeView");
  const gameView = document.getElementById("gameView");
  const favsView = document.getElementById("favsView");
  const uploadView = document.getElementById("uploadView");



  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const route = btn.getAttribute("data-route");
      showView(route);
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  function showView(route) {
    homeView.style.display = "none";
    gameView.style.display = "none";
    favsView.style.display = "none";
    uploadView.style.display = "none";

    if (route === "home") homeView.style.display = "";
    else if (route === "favs") favsView.style.display = "";
    else if (route === "upload") uploadView.style.display = "";
  }

  const games = [
    { id:1, name:"Game Alpha", type:"Action", year:2018 },
    { id:2, name:"Game Beta", type:"Puzzle", year:2020 },
    { id:3, name:"Game Gamma", type:"RPG", year:2019 },
    { id:4, name:"Game Delta", type:"Platformer", year:2017 },
    { id:5, name:"Game Epsilon", type:"Strategy", year:2021 },
    { id:6, name:"Game Zeta", type:"Adventure", year:2022 },
  ];

  const songs = {
    1: [ { id:101, title:"Alpha Theme", duration:"2:45", year:2018 }, { id:102, title:"Alpha Battle", duration:"3:30", year:2018 } ],
    2: [ { id:201, title:"Beta Intro", duration:"1:55", year:2020 }, { id:202, title:"Beta Puzzle", duration:"2:20", year:2020 } ],
    3: [ { id:301, title:"Gamma Main", duration:"4:10", year:2019 }, { id:302, title:"Gamma Finale", duration:"3:50", year:2019 } ],
  };

  const commentsBySong = {
    101: [ { id:1, user:"Alice", text:"Love this track!", time:"2h ago", replies:[ { id:11, user:"Bob", text:"Me too!", time:"1h ago" } ] } ],
    201: [ { id:2, user:"Charlie", text:"So relaxing", time:"5h ago", replies:[] } ],
  };

  const favGames = new Set();
  const favSongs = new Set();

  const gamesGrid = document.getElementById("gamesGrid");
  function populateGames() {
    gamesGrid.innerHTML = "";
    games.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.dataset.id = game.id;

      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.textContent = "No Image";
      card.appendChild(placeholder);

      const overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.textContent = game.name;
      card.appendChild(overlay);

      card.addEventListener("click", () => showGame(game.id));
      gamesGrid.appendChild(card);
    });
  }
  populateGames();

  function showGame(gameId) {
    homeView.style.display = "none";
    favsView.style.display = "none";
    uploadView.style.display = "none";
    gameView.style.display = "";
    const game = games.find(g => g.id === gameId);
    document.getElementById("gameTitle").textContent = game.name;
    document.getElementById("gameMeta").textContent = `${game.type} • Released ${game.year}`;

    const songListEl = document.getElementById("songList");
    songListEl.innerHTML = "";
    (songs[gameId] || []).forEach(s => {
      const row = document.createElement("div");
      row.className = "song-row";

      const playCell = document.createElement("div");
      const btn = document.createElement("button");
      btn.className = "btn-play";
      btn.textContent = "▶";
      playCell.appendChild(btn);

      const titleCell = document.createElement("div");
      titleCell.className = "song-meta";
      titleCell.textContent = s.title;

      const yearCell = document.createElement("div");
      yearCell.textContent = s.year;

      const actionsCell = document.createElement("div");
      actionsCell.className = "song-actions";

      const heart = document.createElement("div");
      heart.className = "heart";
      heart.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6c-1.4-1.4-3.6-1.4-5 0L12 8.4 8.2 4.6c-1.4-1.4-3.6-1.4-5 0-1.4 1.4-1.4 3.6 0 5L12 21.5l8.8-11c1.4-1.4 1.4-3.6 0-5z"></path></svg>`;
      if (favSongs.has(s.id)) heart.classList.add("active");
      heart.addEventListener("click", () => {
        if (favSongs.has(s.id)) favSongs.delete(s.id); else favSongs.add(s.id);
        heart.classList.toggle("active");
        renderFavourites();
      });

      actionsCell.appendChild(heart);
      row.appendChild(playCell);
      row.appendChild(titleCell);
      row.appendChild(yearCell);
      row.appendChild(actionsCell);
      songListEl.appendChild(row);
    });

    renderComments(gameId);
  }

  document.getElementById("backToBrowse").addEventListener("click", () => {
    homeView.style.display = ""; gameView.style.display = "none";
  });

  function renderComments(gameId) {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = "";
    const allSongs = songs[gameId] || [];
    allSongs.forEach(s => {
      const cList = commentsBySong[s.id] || [];
      cList.forEach(comment => {
        const el = buildCommentElement(s.id, comment, 0);
        commentsList.appendChild(el);
      });
    });
  }

  function buildCommentElement(songId, comment, indentLevel) {
    const container = document.createElement("div");
    container.className = indentLevel === 0 ? "comment" : "comment reply";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = comment.user.charAt(0).toUpperCase();

    const body = document.createElement("div");
    body.className = "body";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${comment.user} • ${comment.time}`;
    const text = document.createElement("div");
    text.className = "text";
    text.textContent = comment.text;

    const actions = document.createElement("div");
    actions.className = "actions";
    const like = document.createElement("span");
    like.textContent = "Like";
    like.style.cursor = "pointer";
    const reply = document.createElement("span");
    reply.textContent = "Reply";
    reply.style.cursor = "pointer";
    reply.addEventListener("click", () => {
      const replyText = prompt("Your reply:");
      if (replyText) {
        comment.replies.push({ id: Date.now(), user: "You", text: replyText, time: "Just now" });
        // re-render comments for current game (simple approach)
        const curGameName = document.getElementById("gameTitle").textContent;
        const game = games.find(g => g.name === curGameName);
        if (game) renderComments(game.id);
      }
    });

    actions.appendChild(like);
    actions.appendChild(reply);

    body.appendChild(meta);
    body.appendChild(text);
    body.appendChild(actions);

    container.appendChild(avatar);
    container.appendChild(body);

    (comment.replies || []).forEach(rep => {
      const child = buildCommentElement(songId, rep, indentLevel + 1);
      container.appendChild(child);
    });

    return container;
  }

  document.getElementById("postComment").addEventListener("click", () => {
    const text = document.getElementById("commentInput").value.trim();
    if (!text) return;
    const currentGameName = document.getElementById("gameTitle").textContent;
    const game = games.find(g => g.name === currentGameName);
    if (game && songs[game.id] && songs[game.id].length) {
      const sid = songs[game.id][0].id;
      if (!commentsBySong[sid]) commentsBySong[sid] = [];
      commentsBySong[sid].push({ id: Date.now(), user:"You", text, time:"Just now", replies:[] });
      document.getElementById("commentInput").value = "";
      renderComments(game.id);
    }
  });

  function renderFavourites() {
    const favsGamesGrid = document.getElementById("favsGamesGrid");
    favsGamesGrid.innerHTML = "";
    games.forEach(g => {
      if (favGames.has(g.id)) {
        const card = document.createElement("div");
        card.className = "game-card";
        card.dataset.id = g.id;
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = "No Image";
        card.appendChild(placeholder);
        const overlay = document.createElement("div");
        overlay.className = "overlay";
        overlay.textContent = g.name;
        card.appendChild(overlay);
        card.addEventListener("click", () => showGame(g.id));
        favsGamesGrid.appendChild(card);
      }
    });

    const favsSongsList = document.getElementById("favsSongsList");
    favsSongsList.innerHTML = "";
    Object.entries(songs).forEach(([gid, slist]) => {
      slist.forEach(s => {
        if (favSongs.has(s.id)) {
          const row = document.createElement("div"); row.className = "song-row";
          const playCell = document.createElement("div"); const btn = document.createElement("button"); btn.className = "btn-play"; btn.textContent = "▶"; playCell.appendChild(btn);
          const titleCell = document.createElement("div"); titleCell.className = "song-meta"; titleCell.textContent = s.title;
          const yearCell = document.createElement("div"); yearCell.textContent = s.year;
          const actionsCell = document.createElement("div"); actionsCell.className = "song-actions";
          const heart = document.createElement("div"); heart.className = "heart active";
          heart.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6c-1.4-1.4-3.6-1.4-5 0L12 8.4 8.2 4.6c-1.4-1.4-3.6-1.4-5 0-1.4 1.4-1.4 3.6 0 5L12 21.5l8.8-11c1.4-1.4 1.4-3.6 0-5z"></path></svg>`;
          heart.addEventListener("click", () => { favSongs.delete(s.id); renderFavourites(); });
          actionsCell.appendChild(heart);
          row.appendChild(playCell); row.appendChild(titleCell); row.appendChild(yearCell); row.appendChild(actionsCell);
          favsSongsList.appendChild(row);
        }
      });
    });
  }

  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const which = tab.getAttribute("data-favtab");
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("favsGames").style.display = which === "games" ? "" : "none";
      document.getElementById("favsSongs").style.display = which === "songs" ? "" : "none";
    });
  });

  document.getElementById("globalSearch").addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) { populateGames(); return; }
    const matchedGames = games.filter(g => g.name.toLowerCase().includes(q));
    if (matchedGames.length) {
      gamesGrid.innerHTML = "";
      matchedGames.forEach(g => {
        const card = document.createElement("div"); card.className = "game-card"; card.dataset.id = g.id;
        const placeholder = document.createElement("div"); placeholder.className = "placeholder"; placeholder.textContent = "No Image";
        card.appendChild(placeholder);
        const overlay = document.createElement("div"); overlay.className = "overlay"; overlay.textContent = g.name;
        card.appendChild(overlay);
        card.addEventListener("click", () => showGame(g.id));
        gamesGrid.appendChild(card);
      });
    } else {
      // search songs and show list
      const matches = [];
      Object.entries(songs).forEach(([gid, slist]) => slist.forEach(s => { if (s.title.toLowerCase().includes(q)) matches.push({ gameId: parseInt(gid), song: s }); }));
      gamesGrid.innerHTML = "";
      const container = document.createElement("div"); container.classList.add("song-list");
      matches.forEach(m => {
        const row = document.createElement("div"); row.className = "song-row";
        const playCell = document.createElement("div"); const btn = document.createElement("button"); btn.className = "btn-play"; btn.textContent = "▶"; playCell.appendChild(btn);
        const titleCell = document.createElement("div"); titleCell.className = "song-meta"; titleCell.textContent = `${m.song.title} (${games.find(g => g.id === m.gameId).name})`;
        const yearCell = document.createElement("div"); yearCell.textContent = m.song.year;
        const actionsCell = document.createElement("div"); actionsCell.className = "song-actions";
        const heart = document.createElement("div"); heart.className = "heart"; heart.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6c-1.4-1.4-3.6-1.4-5 0L12 8.4 8.2 4.6c-1.4-1.4-3.6-1.4-5 0-1.4 1.4-1.4 3.6 0 5L12 21.5l8.8-11c1.4-1.4 1.4-3.6 0-5z"></path></svg>`;
        if (favSongs.has(m.song.id)) heart.classList.add("active");
        heart.addEventListener("click", () => { if (favSongs.has(m.song.id)) favSongs.delete(m.song.id); else favSongs.add(m.song.id); renderFavourites(); });
        actionsCell.appendChild(heart);
        row.appendChild(playCell); row.appendChild(titleCell); row.appendChild(yearCell); row.appendChild(actionsCell);
        container.appendChild(row);
      });
      gamesGrid.appendChild(container);
    }
  });

  renderFavourites();
});
