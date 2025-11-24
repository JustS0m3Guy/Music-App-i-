//const AddToFavs = (songID) => {
//    console.log(`Adding song ${songID} to favorites.`);

//    // Here you would typically make an AJAX request to your backend to update the favorite status
//    // For demonstration, we'll just log to the console
    
//    // Example AJAX request (using fetch)


//}

document.addEventListener('DOMContentLoaded', () => {
    const postButton = document.getElementById('postComment');
    fetchComments();
});

postButton.addEventListener('submit', async (e) => {
    e.preventDefault();
    var jsonData = {};
    formData.forEach((value, key) => jsonData[key] = value);
    var json = JSON.stringify(jsonData);
    console.log(json);
});

async function fetchComments() {
    let url = 'api/get-comments';

    const response = await fetch(url);

    document.getElementById('commentGrid').innerHTML = await response.text();
}