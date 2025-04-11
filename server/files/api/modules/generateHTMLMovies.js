function formatMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
}


export function generateHTMLMovies(inputMovies) {
    let movies = JSON.parse(inputMovies);

    let outputMovies = new Array();
    movies.forEach(movie => {
        let releaseDate = new Date(movie.Released);
        let runtime = formatMinutes(movie.Runtime);
        let movieString = `
                <img src="${movie.Poster}" alt="${movie.Title} poster">
                <h1>${movie.Title}</h1>
                <p><span>Runtime ${runtime}</span><span>•</span><span>Released on ${releaseDate.toLocaleDateString()}</span></p>
                <p>${movie.Genres.map(gen => `<span class="genre">${gen}</span>`).join('')}</p>
                <p>${movie.Plot}</p>
                <h2>Director</h2>
                <ul>${movie.Directors.map(director => `<li>${director}</li>`).join('')}</ul>
                <h2>Writers</h2>
                <ul>${movie.Writers.map(writer => `<li>${writer}</li>`).join('')}</ul>
                <h2>Actors</h2>
                <ul>${movie.Actors.map(actor => `<li>${actor}</li>`).join('')}</ul>
        `;
        let wrapper = document.createElement("article");
        wrapper.innerHTML = movieString;
        outputMovies.push(wrapper);
    });

    return outputMovies;
}
