//const AddToFavs = (songID) => {
//    console.log(`Adding song ${songID} to favorites.`);

//    // Here you would typically make an AJAX request to your backend to update the favorite status
//    // For demonstration, we'll just log to the console
    
//    // Example AJAX request (using fetch)


//}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchComments();
    const form = document.getElementById('commentpost');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const response = await fetch('api/get-comments/', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            await fetchComments();
            document.getElementById('commentText').value = '';
        }
    }
});


async function fetchComments() {
    let url = 'api/get-comments';

    const response = await fetch(url);

    document.getElementById('commentGrid').innerHTML = await response.text();
}