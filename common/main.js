require('dotenv').config();

const apiKey = process.env.API_KEY;

document.addEventListener('DOMContentLoaded', function () {
  const h1Element = document.querySelector('header h1');
  if (h1Element) {
    h1Element.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
  const backButton = document.querySelector('.fa-arrow-left');
  if (backButton) {
    backButton.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
});

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
  return genresData.genres.reduce((genresMap, genre) => {
    genresMap[genre.id] = genre.name;
    return genresMap;
  }, {});
}

async function fetchMovies() {
  const data = await fetchData(
    `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=popularity.desc&api_key=${apiKey}`
  );
  return data.results;
}

function renderMovies(movies, genresMap) {
  const movieListDiv = document.getElementById('movie-list');
  if (movieListDiv) {
    movieListDiv.innerHTML = movies
      .map((movie) => createMovieHTML(movie, genresMap))
      .join('');
  } else {
    console.error("Element with ID 'movie-list' not found.");
  }
}

function createMovieHTML(movie) {
  return `
    <div>
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <a href="/movieList/detail.html?id=${movie.id}"></a>
    </div>
  `;
}

function filterMoviesByGenre(movies, category) {
  return movies.filter((movie) => movie.genre_ids.includes(parseInt(category)));
}

function filterMoviesByKeyword(movies, keyword) {
  return movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword.toLowerCase())
  );
}

function addEventListenerToNav(movies, genresMap) {
  const nav = document.querySelector('header > nav');
  if (nav) {
    nav.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const category = e.target.dataset.cate;
      const filteredMovies = filterMoviesByGenre(movies, category);
      renderMovies(filteredMovies, genresMap);
    });
  }
}

function addEventListenerToSearch(movies, genresMap) {
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
    const filteredMovies = filterMoviesByKeyword(movies, keyword);
    renderMovies(filteredMovies, genresMap);
  }
}

async function fetchMovieDetails(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=ko-KR`
  );
  return response.json();
}

async function showMovieDetails() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (movieId) {
      const movieDetails = await fetchMovieDetails(movieId);
      renderMovieDetails(movieDetails);
      renderMovieCast(movieId);
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}

function renderMovieDetails(movieDetails) {
  let roundedVoteAverage = movieDetails.vote_average.toFixed(2);
  let movieDetailsDiv = document.getElementById('movie-details');
  if (movieDetailsDiv) {
    const posterUrl = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;
    let description = movieDetails.overview || '내용 없음';
    const html = `
    
      <img class="backImg" src="${posterUrl}" alt="${movieDetails.title}">
    <div class="info">
      <h3>${movieDetails.title}</h3>
      <p><strong>개봉일:</strong> ${
        movieDetails.release_date
      } ・ <strong>평점:</strong> ${roundedVoteAverage} </p>
      <p><strong>장르:</strong> ${movieDetails.genres
        .map((genre) => genre.name)
        .join(', ')}</p>
          
      <p><strong>소개</strong><br/> <span>${description}</span></p>
      </div>
      <img src="${posterUrl}" alt="${movieDetails.title}">
    `;
    movieDetailsDiv.innerHTML = html;
  }
}
var swiper = new Swiper('.castSlide', {
  slidesPerView: 3,
  spaceBetween: 30,
  scrollbar: {
    el: '.swiper-scrollbar',
    hide: true,
  },
  breakpoints: {
    750: {
      slidesPerView: 4,
    },
    1000: {
      slidesPerView: 5,
    },
  },
});

async function renderMovieCast(movieId) {
  try {
    const creditsResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`
    );
    const creditsData = await creditsResponse.json();
    const cast = creditsData.cast.slice(0, 10);
    const movieCastDiv = document.getElementById('movie-cast');
    if (movieCastDiv) {
      cast.forEach((actor) => {
        const actorProfileUrl = actor.profile_path
          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
          : './noimg.png';
        const characterName = actor.character;
        const actorHTML = `
          <div class="swiper-slide actor">
            <img src="${actorProfileUrl}" alt="${actor.name}">
            <p><strong>${actor.name}</strong></p> 
            <p>${characterName}</p>
          </div>
        `;
        movieCastDiv.innerHTML += actorHTML;
      });
    }
  } catch (error) {
    console.error('Error fetching cast:', error);
  }
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

showMovieDetails();
