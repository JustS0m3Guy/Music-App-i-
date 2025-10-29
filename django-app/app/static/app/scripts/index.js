document.addEventListener('DOMContentLoaded', () =>{
    fetchGames();
});

async function ClearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterYear').value = '';
    await fetchGames();
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
