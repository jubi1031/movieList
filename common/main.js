document.addEventListener('DOMContentLoaded', function () {
  const h1Element = document.querySelector('header h1');

  if (h1Element) {
    h1Element.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
});

const apiKey = '56e40c48a804a1bccbe1d23f4ffbe719';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmU0MGM0OGE4MDRhMWJjY2JlMWQyM2Y0ZmZiZTcxOSIsInN1YiI6IjY2MWY4ODhjNmEzMDBiMDE3ZTMzNTEyZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3GhVYmb9CSBxVnqam0AYEGfnSdTLBGmAtwkOyQOV-Uc`,
  },
};

// 데이터를 가져오는 함수
async function fetchData(url) {
  const response = await fetch(url, options);
  return response.json();
}

// 장르 목록을 가져오는 함수
async function fetchGenres() {
  const genresData = await fetchData(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=ko-KR`
  );
  return genresData.genres.reduce((genresMap, genre) => {
    genresMap[genre.id] = genre.name;
    return genresMap;
  }, {});
}

// 영화 목록을 가져오는 함수
async function fetchMovies() {
  const data = await fetchData(
    `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=popularity.desc&api_key=${apiKey}`
  );
  return data.results;
}

// 영화 목록을 HTML로 렌더링하는 함수
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

// 각 영화를 HTML로 변환하는 함수
function createMovieHTML(movie) {
  return `
    <div>
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <a href="../detail.html?id=${movie.id}"></a>
    </div>
  `;
}

// 카테고리별로 영화를 필터링하는 함수
function filterMoviesByGenre(movies, category) {
  return movies.filter((movie) => movie.genre_ids.includes(parseInt(category)));
}

// 키워드로 영화를 검색하는 함수
function filterMoviesByKeyword(movies, keyword) {
  return movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword.toLowerCase())
  );
}

// 네비게이션에 이벤트 리스너 추가하는 함수
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

// 검색에 이벤트 리스너 추가하는 함수
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

// 영화 세부 정보 가져오는 함수
async function fetchMovieDetails(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=ko-KR`
  );
  return response.json();
}

// 영화 세부 정보 렌더링하는 함수
async function showMovieDetails() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (movieId) {
      // movieId가 null이 아닌 경우에만 실행
      const movieDetails = await fetchMovieDetails(movieId);
      renderMovieDetails(movieDetails);
      renderMovieCast(movieId);
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}

// 영화 세부 정보를 HTML로 렌더링하는 함수
function renderMovieDetails(movieDetails) {
  const roundedVoteAverage = movieDetails.vote_average.toFixed(2);
  const movieDetailsDiv = document.getElementById('movie-details');
  if (movieDetailsDiv) {
    const posterUrl = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;
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
          
        <p><strong>소개</strong><br/> ${movieDetails.overview}</p>
      </div>
      <img src="${posterUrl}" alt="${movieDetails.title}">
    `;
    movieDetailsDiv.innerHTML = html;
  }
}
var swiper = new Swiper('.castSlide', {
  slidesPerView: 5,
  spaceBetween: 30,
  scrollbar: {
    el: '.swiper-scrollbar',
    hide: true,
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
        const actorProfileUrl = `https://image.tmdb.org/t/p/w200${actor.profile_path}`;
        const characterName = actor.character;
        const actorHTML = `
          <div class="swiper-slide actor">
            <img src="${actorProfileUrl}" alt="${actor.name}">
            <p><strong>${actor.name}</strong> <br/>${characterName}</p>
          </div>
        `;

        movieCastDiv.innerHTML += actorHTML;
      });
    }
  } catch (error) {
    console.error('Error fetching cast:', error);
  }
}
// 초기 실행 함수
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

// document.addEventListener('DOMContentLoaded', async function () {
//   try {
//     const genresMap = await fetchGenres();
//     const movies = await fetchMovies();
//     renderMovies(movies, genresMap);
//     addEventListenerToNav(movies, genresMap);
//     addEventListenerToSearch(movies, genresMap);
//     showMovieDetails(); // 페이지가 로드된 후에 호출되도록 이동
//   } catch (err) {
//     console.error(err);
//   }
// });
// 영화 세부 정보 표시
showMovieDetails();
