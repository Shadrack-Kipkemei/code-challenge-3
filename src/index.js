let ticketssold = 0;
// Fetch and display movie details
function fetchMovieDetails(id) {
    fetch(`http://localhost:3000/films/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            ticketssold = data.tickets_sold;
            document.getElementById("title").textContent = data.title;
            document.getElementById("runtime").textContent = `${data.runtime} minutes`;
            document.getElementById("film-info").textContent = data.description;
            document.getElementById("showtime").textContent = data.showtime;
            document.getElementById("poster").src = data.poster;
            document.getElementById("ticket-num").textContent = `${data.capacity - data.tickets_sold}`;
            document.getElementById("buy-ticket").dataset.id = data.id; 

            if (data.capacity - data.tickets_sold === 0) {
                
                document.getElementById("buy-ticket").textContent = "Sold Out";
                document.getElementById("buy-ticket").disabled = true;
                document.getElementById(`film-${data.id}`).classList.add("sold-out");
            }else{
 
                document.getElementById("buy-ticket").textContent = "Buy Ticket";
                document.getElementById("buy-ticket").disabled = false  ;
                document.getElementById(`film-${data.id}`).classList.remove("sold-out");
            }
        })
        .catch(error => console.error('Error fetching movie details:', error));
}

// Fetch and display the list of films
function fetchFilms() {
    fetch("http://localhost:3000/films")
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const filmsList = document.getElementById("films");
            filmsList.innerHTML = ""; 
            data.forEach(film => {
                const li = document.createElement("li");
                li.className = "film item";
                li.textContent = film.title;
                li.id = `film-${film.id}`; 
                li.addEventListener("click", () => fetchMovieDetails(film.id));

                // Add delete button to each film
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", (e) => {
                    e.stopPropagation(); // Prevent click event from triggering fetchMovieDetails
                    deleteFilm(film.id);
                });
                li.appendChild(deleteButton);

                filmsList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching films list:', error));
}

// Update tickets sold
function updateTicketsSold(id, newTicketsSoldValue) {
    //alert(newTicketsSoldValue)
    fetch(`http://localhost:3000/films/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tickets_sold: newTicketsSoldValue
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            document.getElementById("ticket-num").textContent = `${data.capacity - data.tickets_sold}`;
            if (data.capacity - data.tickets_sold === 0) {
                document.getElementById("buy-ticket").textContent = "Sold Out";
                document.getElementById("buy-ticket").disabled = true;
                document.getElementById(`film-${data.id}`).classList.add("sold-out");
            }
        })
        .catch(error => console.error('Error updating tickets:', error));
}

// Delete a film
function deleteFilm(id) {
    fetch(`http://localhost:3000/films/${id}`, {
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(() => {
            document.getElementById(`film-${id}`).remove(); 
        })
        .catch(error => console.error('Error deleting film:', error));
}

// Event listener for buying tickets
document.getElementById("buy-ticket").addEventListener("click", () => {
    //alert(ticketssold-1);
    ticketssold = ticketssold + 1;
    const ticketsAvailable = parseInt(document.getElementById("ticket-num").textContent, 10);
    const movieId = document.getElementById("buy-ticket").dataset.id;
    if (ticketsAvailable > 0) {
        const newTicketsSoldValue = ticketssold + 1; 
        updateTicketsSold(movieId, newTicketsSoldValue);
    }
});

// Initial fetch to display films and the first movie details
document.addEventListener("DOMContentLoaded", () => {
    fetchFilms();
    fetchMovieDetails(1);
});


