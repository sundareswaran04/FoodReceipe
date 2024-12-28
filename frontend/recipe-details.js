document.addEventListener('DOMContentLoaded', () => {
  const recipeId = getRecipeIdFromUrl();
  fetchRecipeDetails(recipeId);
  fetchComments(recipeId);

  // Add event listener for the comment form
  document.getElementById('comment-form').addEventListener('submit', handleCommentFormSubmit);
});

function getRecipeIdFromUrl() {
  const params = new URLSearchParams(window.location.search); 
  const recipeId = params.get('id');  
  return recipeId;
}

function userFromUrl() {
  console.log(URLSearchParams(window.location.search).get('email'));
}

function fetchRecipeDetails(recipeId) {
  fetch(`https://tasty.p.rapidapi.com/recipes/get-more-info?id=${recipeId}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'f524d4c098msh693447b79e988e9p1134a5jsn129fa365cef3',
      'x-rapidapi-host': 'tasty.p.rapidapi.com'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text(); // Read the response as text first
  })
  .then(text => {
    if (!text) {
      throw new Error('Empty response body');
    }
    try {
      const data = JSON.parse(text); // Now parse the JSON text
      displayRecipeDetails(data); // Function to handle the valid response
    } catch (error) {
      throw new Error('Failed to parse JSON response');
    }
  })
  .catch(error => {
    console.error('Error fetching recipe details:', error);
    // Optionally display a user-friendly error message in the UI
    document.getElementById('recipe-title').textContent = 'Error fetching recipe details';
  });
}

function displayRecipeDetails(data) {
  document.getElementById('recipe-title').textContent = data.name || 'N/A';
  document.getElementById('chef-name').textContent = data.chef || 'Unknown';
  document.getElementById('category').textContent = data.category || 'N/A';
  document.getElementById('rating').textContent = (data.user_ratings?.score * 5).toFixed(2) || 'No Rating';
  document.getElementById('duration').textContent = data.total_time_minutes + " mins" || 'N/A';
  document.getElementById('recipe-header').style.backgroundImage = `url(${data.thumbnail_url || ''})`;
  document.getElementById('title').textContent = data.name;
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = ''; // Clear existing content
  if (data.sections && data.sections[0] && data.sections[0].components) {
    data.sections[0].components.forEach((component, index) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Ingredient ${index + 1}:</strong> ${component.raw_text || 'Unknown ingredient'}`;
      ingredientsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No ingredients found';
    ingredientsList.appendChild(li);
  }

  const stepsList = document.getElementById('steps-list');
  stepsList.innerHTML = ''; // Clear existing content
  if (data.instructions) {
    data.instructions.forEach((instruction, index) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Step ${index + 1}:</strong> ${instruction.display_text || 'No instructions available'}`;
      stepsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No steps available';
    stepsList.appendChild(li);
  }
}

async function handleCommentFormSubmit(event) {
  event.preventDefault();
  const email = document.querySelector('input[name="user-email"]').value;
  const name = document.querySelector('input[name="user-name"]').value;
  const comment = document.querySelector('textarea[name="user-comment"]').value;
  const rating = document.querySelector('input[name="user-rating"]').value;

  if (!email || !name || !comment || !rating) {
    alert('All fields are required');
    return;
  }
  const recipeId = getRecipeIdFromUrl().split('?')[0];
  try {
    const response = await fetch('/comment-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, name, comment, rating, recipeId })
    });

    if (response.status === 400) {
      const result = await response.text();
      alert(result);
    } else if (response.status === 500) {
      alert('Error posting comment');
    } else {
      const result = await response.text();
      alert(result);
      fetchComments(recipeId);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error posting comment');
  }
}

async function fetchComments(recipeId) {
  const Id = recipeId.split('?')[0];
  console.log(Id);
  try {
    const response = await fetch(`/comment-section?Id=${Id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.status === 404) {
      displayComments([]);
    } else if (response.status === 400) {
      const result = await response.json();
      alert(result.error);
    } else if (response.status === 500) {
      alert('Error fetching comments');
    } else {
      const comments = await response.json(); // Assuming the server returns JSON with comments
      displayComments(comments); // Function to update the UI with comments
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error fetching comments');
  }
}

function displayComments(data) {
  const commentsList = document.getElementById('comments-list');
  commentsList.innerHTML = ''; // Clear existing content
  if (!Array.isArray(data) || data.length === 0) {
    const noComments = document.createElement('p');
    noComments.classList.add('no-comments');
    noComments.innerText = 'No comments available for this recipe.';
    commentsList.appendChild(noComments);
    return;
  }
  data.forEach(comment => {
    // Create the main container for each comment
    const commentContainer = document.createElement('div');
    commentContainer.classList.add('comment-container');
    
    // Create the name and rating sections
    const header = document.createElement('div');
    header.classList.add('comment-header');
    
    const name = document.createElement('span');
    name.classList.add('comment-name');
    name.innerText = comment.name;
    
    const rating = document.createElement('span');
    rating.classList.add('comment-rating');
    rating.innerText = `Rating: ${comment.rating}`;
    
    header.appendChild(name);
    header.appendChild(rating);
    
    // Create the comment body section
    const commentBody = document.createElement('p');
    commentBody.classList.add('comment-body');
    commentBody.innerHTML = comment.comment;

    // Append header and body to the comment container
    commentContainer.appendChild(header);
    commentContainer.appendChild(commentBody);
    
    // Add the comment container to the comments list
    commentsList.appendChild(commentContainer);
  });
}

function PopupOpen() {
  document.getElementById('user-profile-popup').style.display = "flex";
}

function PopupClose() {
  document.getElementById('user-profile-popup').style.display = "none";
}

// sample();
// userFromUrl();