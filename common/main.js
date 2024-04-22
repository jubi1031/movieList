const apiKey = '56e40c48a804a1bccbe1d23f4ffbe719';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmU0MGM0OGE4MDRhMWJjY2JlMWQyM2Y0ZmZiZTcxOSIsInN1YiI6IjY2MWY4ODhjNmEzMDBiMDE3ZTMzNTEyZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3GhVYmb9CSBxVnqam0AYEGfnSdTLBGmAtwkOyQOV-Uc`,
  },
};
fetch(
  `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=ko-KR`,
  options
)
  .then((response) => response.json())
  .then((genresData) => {
    const genresMap = {};
    genresData.genres.forEach((genre) => {
      genresMap[genre.id] = genre.name;
    });

    fetch(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=popularity.desc&api_key=${apiKey}`,
      options
    )
      .then((response) => response.json())
      .then((data) => {
        const movieListDiv = document.getElementById('movie-list');

        const movieListHTML = data.results
          .map((movie) => {
            const genres = movie.genre_ids
              .map((genreId) => {
                return genresMap[genreId];
              })
              .join(', ');
            return `
        <div>
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
          <div class = "info">
          <h2>${movie.title}</h2>
          <p><strong>개봉일:</strong> ${movie.release_date}</p>
          <p><strong>평점:</strong> ${movie.vote_average}</p>
           <p><strong>장르:</strong> ${genres}</p>
          <p><strong>개요:</strong> ${movie.overview}</p>
          </div>
        </div>
      `;
          })
          .join('');

        movieListDiv.innerHTML = movieListHTML;
      })
      .catch((err) => console.error(err));
  })
  .catch((err) => console.error(err));
