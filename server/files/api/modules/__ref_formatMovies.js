function formatMovies(inputMovies) {

    let iMovies = JSON.parse(inputMovies);

    let movies = new Array();

    iMovies.forEach(data => {
        let movie ={};

        let releaseDate = (new Date(data.Released)).toISOString().substring(0,10);
        let runtime = data.Runtime.replace(" min","");

        let genres, directors, writers, actors;
        genres = data.Genre.split(',').map(name => name.trim());
        directors = data.Director.split(',').map(name => name.trim());
        writers = data.Writer.split(',').map(name => name.trim());
        actors = data.Actors.split(',').map(name => name.trim());

        movie.Title = data.Title;
        movie.Released = releaseDate;
        movie.Runtime = Number(runtime);
        movie.Genres = genres;
        movie.Directors = directors;
        movie.Writers = writers;
        movie.Actors = actors;
        movie.Plot = data.Plot;
        movie.Poster = data.Poster;
        movie.Metascore = Number(data.Metascore);
        movie.imdbRating = Number(data.imdbRating);

        movies.push(movie);
    });
    return movies;

}

module.exports = formatMovies;