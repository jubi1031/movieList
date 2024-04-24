const apiKey = '56e40c48a804a1bccbe1d23f4ffbe719';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmU0MGM0OGE4MDRhMWJjY2JlMWQyM2Y0ZmZiZTcxOSIsInN1YiI6IjY2MWY4ODhjNmEzMDBiMDE3ZTMzNTEyZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3GhVYmb9CSBxVnqam0AYEGfnSdTLBGmAtwkOyQOV-Uc`,
  },
};

async function fetchData(url) {
  const response = await fetch(url, options);
  return response.json();
}

async function fetchGenres() {
  const genresData = await fetchData(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=ko-KR`
  );
  const genresMap = {};
  genresData.genres.forEach((genre) => {
    genresMap[genre.id] = genre.name;
  });
  return genresMap;
}

async function fetchMovies() {
  const data = await fetchData(
    `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=popularity.desc&api_key=${apiKey}`
  );
  return data.results;
}

function renderMovies(movies, genresMap) {
  const movieListDiv = document.getElementById('movie-list');
  const movieListHTML = movies
    .map((movie) => createMovieHTML(movie, genresMap))
    .join('');
  movieListDiv.innerHTML = movieListHTML;
}

function createMovieHTML(movie) {
  const roundedVoteAverage = movie.vote_average.toFixed(2);

  return `
    <div>
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <div class="info">
          <p>개봉일: ${movie.release_date}</p>
          <p>평점: ${roundedVoteAverage}</p>
      </div>
      <a href="../detail.html?id=${movie.id}"></a>
    </div>
  `;
}

function getGenres(movie, genresMap) {
  return movie.genre_ids.map((genreId) => genresMap[genreId]).join(', ');
}

function filterMoviesByGenre(movies, category) {
  return movies.filter((movie) => movie.genre_ids.includes(parseInt(category)));
}

function filterMoviesByKeyword(movies, keyword) {
  return movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword.toLowerCase())
  );
}

(async function () {
  try {
    const genresMap = await fetchGenres();
    const movies = await fetchMovies();
    renderMovies(movies, genresMap);

    addEventListenerToNav(movies, genresMap);
    addEventListenerToSearch(movies, genresMap);
  } catch (err) {
    console.error(err);
  }
})();

function addEventListenerToNav(movies, genresMap) {
  const nav = document.querySelector('header > nav');
  if (nav) {
    nav.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      let category = e.target.dataset.cate;
      const filteredMovies = filterMoviesByGenre(movies, category);
      renderMovies(filteredMovies, genresMap);
    });
  }
}
function addEventListenerToSearch(movie, genresMap) {
  const searchBtn = document.querySelector('.searchBtn');
  const searchInput = document.querySelector('.inputArea input');

  if (searchInput && searchBtn) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key !== 'Enter') return;
      performSearch();
    });

    searchBtn.addEventListener('click', performSearch);
  }

  function performSearch() {
    const keyword = searchInput.value.trim();
    searchInput.value = '';

    const filteredMovies = filterMoviesByKeyword(movie, keyword);
    renderMovies(filteredMovies, genresMap);
  }
}

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

async function fetchMovieDetails(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=ko-KR`
  );
  const data = await response.json();
  return data;
}

async function showMovieDetails() {
  try {
    const movieDetails = await fetchMovieDetails(movieId);
    console.log(movieDetails); // 영화 세부 정보를 콘솔에 출력
    renderMovieDetails(movieDetails);
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}
function renderMovieDetails(movieDetails) {
  const movieDetailsDiv = document.getElementById('movie-details');
  if (movieDetailsDiv) {
    const posterUrl = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;
    const html = `
    <img src="${posterUrl}" alt="${movieDetails.title}">
    <div class="info">
        <h2>${movieDetails.title}</h2>
        <p><strong>개봉일:</strong> ${movieDetails.release_date}</p>
        <p><strong>평점:</strong> ${movieDetails.vote_average}</p>
        <p><strong>장르:</strong> ${movieDetails.genres
          .map((genre) => genre.name)
          .join(', ')}</p>
        <p><strong>소개:</strong> ${movieDetails.overview}</p>
      </div>
    `;
    movieDetailsDiv.innerHTML = html;
  }
}

showMovieDetails();
