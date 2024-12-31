let start = 0;
const size = 5;
const baseUrl = 'https://tasty.p.rapidapi.com/recipes/list?tags=under_30_minutes';
const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': '9e554d709amsh6f625362444bb16p1e1511jsnd26a28dd997b',
    'x-rapidapi-host': 'tasty.p.rapidapi.com'
  }
};

const params = new URLSearchParams(window.location.search);
const email = params.get('email');
const user_div = document.getElementById('user-profile-popup');
const h4 = document.createElement('h4');
h4.innerText = email;


user_div.append(h4);
const recipeOfday = Math.floor(Date.now() * .00000000001)

async function fetchRecipeOfTheDay() {
  const url = `${baseUrl}&from=0&size=100`;
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log('Recipe of the Day:', result);
    const recipe = result.results[recipeOfday];
    displayRecipeOfTheDay(recipe);
    document.getElementById('get-recipe-btn').addEventListener('click', () => {
      window.location.href = `recipe-details.html?id=${recipe.id}?email=${email}`;
    });
  } catch (error) {
    console.error('Error fetching recipe of the day:', error);
  }
}

async function fetchRecipes() {
  const url = `${baseUrl}&from=${start}&size=${size}`;
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log('Popular Recipes:', result);
    displayPopularRecipes(result.results);
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }
}

function displayRecipeOfTheDay(recipe) {
  document.getElementById('recipe-title').innerText = recipe.name;
  document.getElementById('recipe-description').innerText = recipe.description;
  const recipeContainer = document.querySelector('.recipe-of-the-day');
  recipeContainer.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1)), url(${recipe.thumbnail_url})`;
}

function displayPopularRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';
  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <img src="${recipe.thumbnail_url}" alt="${recipe.name}">
      <div class="recipe-details">
        <h3 class="recipe-name">${recipe.name}</h3>
        <p class="rating"><img src="./assets/star-svgrepo-com.svg"> ${(recipe.user_ratings?.score * 5).toFixed(2)}</p>
      </div>
      <p class="description">${truncateText(recipe.description, 200)}</p>
      <p class="duration">Duration: ${recipe.total_time_minutes} mins</p>
      <button onclick="window.location.href='recipe-details.html?id=${recipe.id}?email=${email}'">Get Recipe</button>
    `;
    container.appendChild(card);
  });
}
function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

function moveLeft() {
  if (start > 0) {
    start -= size;
    fetchRecipes();
  }
}

function moveRight() {
  start += size;
  fetchRecipes();
}
function UserPopup() {
  document.getElementById('user-profile-popup').style.display = "flex"
}

function ClosePopup() {
  document.getElementById('user-profile-popup').style.display = "none"
}

function PopupOpen() {
  document.getElementById('user-profile-popup').style.display = "flex";
}

function PopupClose() {
  document.getElementById('user-profile-popup').style.display = "none";
}

// Add event listeners for mobile touch events
document.querySelector('.user-profile-popup').addEventListener('touchstart', PopupOpen);
document.querySelector('.user-profile-popup').addEventListener('touchend', PopupClose);

fetchRecipeOfTheDay();
fetchRecipes();

