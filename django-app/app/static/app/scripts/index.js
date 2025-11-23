document.addEventListener('DOMContentLoaded', () =>{
      const viewButtons = document.querySelectorAll('.view-btn');
  const gamesGrid = document.querySelector('.games-grid');
  let searchtimer = null;
  document.querySelector("#globalSearch").addEventListener("input", (e) => {
    clearTimeout(searchtimer);
    searchtimer = setTimeout(() => {
      SearchGames();
    }, 200);
  });
  if (viewButtons && gamesGrid) {
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const view = btn.dataset.view;
        if (view === 'list') {
          gamesGrid.classList.add('list-view');
        } else {
          gamesGrid.classList.remove('list-view');
        }
      });
    });
  }
    fetchGames();
    
});


async function ClearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterYear').value = '';
    document.getElementById('globalSearch').value = '';
    await SearchGames();
}

async function SearchGames(){
	const searchInput = document.getElementById('globalSearch').value;
  const Genre = document.getElementById('filterType').value;
  const Year = document.getElementById('filterYear').value;
	let url = '/api/search-games/?';
	if (searchInput){
		url += `searchResult=${searchInput}&`;
	}
  if (Genre) {
        url += `genre=${Genre}&`;
    }
  if (Year) {
        url += `year=${Year}&`;
  }
	const response = await fetch(url);
	const gamesGrid = document.getElementById('gamesGrid').innerHTML = await response.text();
}

// async function UpdateGrid() {
//     const gamesGrid = document.getElementById('gamesGrid').value;
//     const Genre = document.getElementById('filterType').value;
//     const Year = document.getElementById('filterYear').value;

//     let url = '/api/get-games/?';
//     if (Genre) {
//         url += `genre=${Genre}&`;
//     }
//     if (Year) {
//         url += `year=${Year}&`;
//     }
//     const response =  await fetch(url);
//     gamesGrid.innerHTML = await response.text();

// }

async function fetchGames() {
    const Genre = document.getElementById('filterType').value;
    const Year = document.getElementById('filterYear').value;
    let url = '/api/get-games/?';
    if (Genre) {
        url += `genre=${Genre}&`;
    }
    if (Year) {
        url += `year=${Year}&`;
    }
    const response = await fetch(url);
    
    const gamesGrid = document.getElementById('gamesGrid').innerHTML = await response.text();
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
    const data = await response.json();
    // update UI depending on data.status
    console.log('fav result', data);
    // e.g. toggle button class:
    const btn = document.querySelector(`#fav-btn-${songId}`);
    if (btn) {
        if (data.status === 'added') btn.classList.add('favorited');
        else btn.classList.remove('favorited');
    }
}

// document.getElementById('filterType').addEventListener('change', (e) => {
//     const genre = e.target.value;
//     const year = document.getElementById('filterYear').value;
//     fetchGames(genre, year);
// });

// document.getElementById('filterYear').addEventListener('change', (e) => {
//     const year = e.target.value;
//     const genre = document.getElementById('filterType').value;
//     fetchGames(genre, year);
// });
