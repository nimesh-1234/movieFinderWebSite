const apiKey = "9f38538b";

const homePage = document.getElementById("homePage");
const detailsPage = document.getElementById("detailsPage");
const input = document.getElementById("input");
const searchBtn = document.getElementById("searchBtn");
const movieCards = document.getElementById("movieCards");
const movieDetails = document.getElementById("movieDetails");
const backBtn = document.getElementById("backBtn");
const searchHistoryDiv = document.getElementById("searchHistory");
const modeToggle = document.getElementById("modeToggle");

let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

// Fetch movie by exact title with full details
async function fetchMovieByTitle(title) {
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}&plot=full`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.Response === "True") return data;
  else throw new Error(data.Error);
}

// Fetch movies by search query (returns list)
async function fetchMoviesBySearch(query) {
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.Response === "True") return data.Search;
  else throw new Error(data.Error);
}

// Render search history buttons
function renderSearchHistory() {
  searchHistoryDiv.innerHTML = "";
  searchHistory.forEach(title => {
    const btn = document.createElement("button");
    btn.textContent = title;
    btn.addEventListener("click", () => {
      input.value = title;
      searchMovie();
    });
    searchHistoryDiv.appendChild(btn);
  });
}

// Add to search history and save in localStorage
function addToSearchHistory(title) {
  if (!searchHistory.includes(title)) {
    searchHistory.unshift(title);
    if (searchHistory.length > 10) searchHistory.pop();
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    renderSearchHistory();
  }
}

// Render movie cards on home page
function renderMovieCards(movies) {
  movieCards.innerHTML = "";
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/250x350?text=No+Image"}" alt="${movie.Title}" />
      <div class="card-info">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
      </div>
    `;
    card.addEventListener("click", () => {
      showMovieDetails(movie.Title);
    });
    movieCards.appendChild(card);
  });
}

// Show movie details page
async function showMovieDetails(title) {
  try {
    const movie = await fetchMovieByTitle(title);

    homePage.classList.remove("active");
    detailsPage.classList.add("active");

    movieDetails.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/250x350?text=No+Image"}" alt="${movie.Title}" />
      <div class="details-info">
        <h2>${movie.Title}</h2>
        <p class="year"><strong>Year:</strong> ${movie.Year}</p>
        <p class="rating"><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Actors:</strong> ${movie.Actors}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <div class="trailer-container" id="youtubeTrailer"></div>
      </div>
    `;

    embedYouTubeTrailer(movie.Title);

    addToSearchHistory(title);
  } catch (error) {
    alert("Movie not found or API error: " + error.message);
  }
}

// Embed YouTube trailer iframe with some hardcoded trailer IDs (replace or extend)
function embedYouTubeTrailer(title) {
  // Some popular trailers IDs for demo purpose
  const knownTrailers = {
    "Avengers": "hA6hldpSTF8",
    "Batman": "EXeTwQWrcwY",
    "Inception": "YoHD9XEInc0",
    "Titanic": "2e-eXJ6HgkQ",
    "Interstellar": "zSWdZVtXT7E",
    "Joker": "zAGVQLHvwOY",
    "Spider-Man": "v6Ju2F6KQt4",
    "Black Panther": "xjDjIWPwcPU"
  };

  const trailerDiv = document.getElementById("youtubeTrailer");
  const trailerKey = Object.keys(knownTrailers).find(key => title.toLowerCase().includes(key.toLowerCase()));

  if (trailerKey) {
    const videoId = knownTrailers[trailerKey];
    trailerDiv.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        title="YouTube trailer for ${title}"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    `;
  } else {
    trailerDiv.innerHTML = `<p>No trailer available</p>`;
  }
}

// Search movie triggered by button or search history
async function searchMovie() {
  const query = input.value.trim();
  if (!query) return alert("Please enter a movie name.");

  try {
    const movies = await fetchMoviesBySearch(query);
    renderMovieCards(movies);
    addToSearchHistory(query);
  } catch (error) {
    movieCards.innerHTML = `<p style="text-align:center; font-weight:600; margin-top:40px;">${error.message}</p>`;
  }
}

// Go back to home page
function goBack() {
  detailsPage.classList.remove("active");
  homePage.classList.add("active");
}

// Toggle dark/light mode
function toggleMode() {
  document.body.classList.toggle("dark");
  // Toggle button icon
  if (document.body.classList.contains("dark")) {
    modeToggle.textContent = "☀️";
  } else {
    modeToggle.textContent = "🌙";
  }
}

// Event Listeners
searchBtn.addEventListener("click", searchMovie);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") searchMovie();
});
backBtn.addEventListener("click", goBack);
modeToggle.addEventListener("click", toggleMode);

// On load
renderSearchHistory();

// Optionally show some default movies on page load
async function loadDefaultMovies() {
  try {
    const defaultMovies = ["Avengers", "Batman", "Inception", "Titanic", "Interstellar"];
    let movies = [];
    for (const title of defaultMovies) {
      try {
        const movie = await fetchMovieByTitle(title);
        movies.push({
          Title: movie.Title,
          Year: movie.Year,
          Poster: movie.Poster,
        });
      } catch {
        // Ignore if not found
      }
    }
    renderMovieCards(movies);
  } catch {
    movieCards.innerHTML = "<p>Failed to load default movies.</p>";
  }
}
loadDefaultMovies();
