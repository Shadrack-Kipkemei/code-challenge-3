let ticketsSold = 0;

// Fetch and display movie details
function fetchMovieDetails(id) {
    return fetch(`http://localhost:3000/films/${id}`)
        .then(handleResponse)
        .then(updateMovieDetails)
        .catch(handleError);
}

// Fetch and display the list of films
function fetchFilms() {
    return fetch("http://localhost:3000/films")
        .then(handleResponse)
        .then(renderFilmList)
        .catch(handleError);
}

// Handle response and check for errors
function handleResponse(response) {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

// Update the movie details in the UI
function updateMovieDetails(data) {
    ticketsSold = data.tickets_sold;
    document.getElementById("title").textContent = data.title;
    document.getElementById("runtime").textContent = `${data.runtime} minutes`;
    document.getElementById("film-info").textContent = data.description;
    document.getElementById("showtime").textContent = data.showtime;
    document.getElementById("poster").src = data.poster;

    updateTicketInfo(data);
}

// Update the ticket information in the UI
function updateTicketInfo(data) {
    const remainingTickets = data.capacity - data.tickets_sold;
    document.getElementById("ticket-num").textContent = remainingTickets;
    const buyButton = document.getElementById("buy-ticket");
    buyButton.dataset.id = data.id;

    const filmElement = document.getElementById(`film-${data.id}`);
    if (filmElement) {
        if (remainingTickets === 0) {
            buyButton.textContent = "Sold Out";
            buyButton.disabled = true;
            filmElement.classList.add("sold-out");
        } else {
            buyButton.textContent = "Buy Ticket";
            buyButton.disabled = false;
            filmElement.classList.remove("sold-out");
        }
    } else {
        console.warn(`Film element with id film-${data.id} not found.`);
        console.log("Current films in the list:", document.getElementById("films").innerHTML);
    }
}

// Render the film list in the UI
function renderFilmList(data) {
    const filmsList = document.getElementById("films");
    filmsList.innerHTML = ""; // Clear the current list
    data.forEach(film => {
        const filmItem = createFilmListItem(film);
        filmsList.appendChild(filmItem);
    });
}

// Create a list item for a film
function createFilmListItem(film) {
    const li = document.createElement("li");
    li.className = "film item";
    li.id = `film-${film.id}`;
    li.textContent = film.title;

    // Attach event listeners
    li.addEventListener("click", () => fetchMovieDetails(film.id));
    li.appendChild(createDeleteButton(film.id));

    return li;
}

// Create a delete button for a film
function createDeleteButton(filmId) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";
    deleteButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent the click event from bubbling up
        deleteFilm(filmId);
    });
    return deleteButton;
}

// Add a new film via POST method
function addFilm(filmData) {
    fetch("http://localhost:3000/films", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filmData)
    })
    .then(handleResponse)
    .then(newFilm => {
        const filmsList = document.getElementById("films");
        const filmItem = createFilmListItem(newFilm);
        filmsList.appendChild(filmItem);
    })
    .catch(handleError);
}

// Update tickets sold via PATCH method
function updateTicketsSold(id, newTicketsSoldValue) {
    fetch(`http://localhost:3000/films/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets_sold: newTicketsSoldValue })
    })
    .then(handleResponse)
    .then(updateTicketInfo)
    .catch(handleError);
}

// Delete a film from the API and UI
function deleteFilm(id) {
    fetch(`http://localhost:3000/films/${id}`, { method: "DELETE" })
        .then(handleResponse)
        .then(() => document.getElementById(`film-${id}`).remove())
        .catch(handleError);
}

// Handle errors
function handleError(error) {
    console.error('Error:', error);
    alert("An error occurred: " + error.message);
}

// Event listener for buying tickets
document.getElementById("buy-ticket").addEventListener("click", () => {
    const ticketsAvailable = parseInt(document.getElementById("ticket-num").textContent, 10);
    const movieId = document.getElementById("buy-ticket").dataset.id;

    if (ticketsAvailable > 0) {
        ticketsSold++;
        updateTicketsSold(movieId, ticketsSold);
    }
});

// Initial fetch to display films and the first movie details
document.addEventListener("DOMContentLoaded", () => {
    fetchFilms();
    fetchMovieDetails(1);
});
