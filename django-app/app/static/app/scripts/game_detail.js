//const AddToFavs = (songID) => {
//    console.log(`Adding song ${songID} to favorites.`);

//    // Here you would typically make an AJAX request to your backend to update the favorite status
//    // For demonstration, we'll just log to the console
    
//    // Example AJAX request (using fetch)


//}

document.addEventListener('DOMContentLoaded', () => {
    fetchComments();
});

postComment.addEventListener('submit', async (e) => {

});

async function fetchComments() {
    let url = 'api/get-comments/?';

    const response = await fetch(url);

    const commentGrid = document.getElementById('commentGrid').innerHTML = await response.text();

    buildCommentElement(comment, 0);
}

function buildCommentElement(comment, indentLevel) {
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
        const child = buildCommentElement(rep, indentLevel + 1);
        container.appendChild(child);
    });

    return container;
}