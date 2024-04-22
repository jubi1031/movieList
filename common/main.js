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

            let roundedVoteAverage = movie.vote_average.toFixed(2);
            let overview = movie.overview || '내용 없음';
            return `
        <div>
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
          <h3>${movie.title}</h3>
          <div class = "info">
          <div>
          <p>개봉일: ${movie.release_date}</p>
          <p>평점: ${roundedVoteAverage}</p>
          </div>
          <p>장르: ${genres}</p>
          <p>소개: ${overview}</p>
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
