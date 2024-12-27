let start = 0;
const size = 5;
const baseUrl = 'https://tasty.p.rapidapi.com/recipes/list?tags=under_30_minutes';
const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': 'f524d4c098msh693447b79e988e9p1134a5jsn129fa365cef3',
    'x-rapidapi-host': 'tasty.p.rapidapi.com'
  }
};

async function fetchRecipeOfTheDay() {
  const url = `${baseUrl}&from=0&size=1`;
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log('Recipe of the Day:', result); // Debugging log
    displayRecipeOfTheDay(result.results[Date.now() % result.results.length]);
    console.log([Date.now() % result.results.length]);
  } catch (error) {
    console.error('Error fetching recipe of the day:', error);
  }
}

async function fetchRecipes() {
  const url = `${baseUrl}&from=${start}&size=${size}`;
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log('Popular Recipes:', result); // Debugging log
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
      <p class="description">${truncateText(recipe.description, 200)}</p>
      <p class="rating">Rating: ★★★★☆</p> 
      <p class="duration">Duration: 30 mins</p>
      <button>Get Recipe</button>
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

window.scrollLeft = function() {
  
  if (start > 0) {
    start -= size;
    fetchRecipes();
  }
}

window.scrollRight = function() {
 
  start += size;
  fetchRecipes();
}


fetchRecipeOfTheDay();

fetchRecipes();
