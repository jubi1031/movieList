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

// 각 영화를 HTML 요소로 변환하는 로직과
// 장르 ID를 장르 이름으로 변환하는 로직이 별도의 함수로 분리되어
// 코드의 가독성이 향상
function renderMovies(movies, genresMap) {
  const movieListDiv = document.getElementById('movie-list');
  const movieListHTML = movies
    .map((movie) => createMovieHTML(movie, genresMap))
    .join('');
  movieListDiv.innerHTML = movieListHTML;
}

function createMovieHTML(movie, genresMap) {
  const genres = getGenres(movie, genresMap);
  const roundedVoteAverage = movie.vote_average.toFixed(2);
  const overview = movie.overview || '내용 없음';

  return `
    <div>
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <div class="info">
        <div>
          <p>개봉일: ${movie.release_date}</p>
          <p>평점: ${roundedVoteAverage}</p>
        </div>
        <p>장르: ${genres}</p>
        <p>소개: ${overview}</p>
      </div>
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
