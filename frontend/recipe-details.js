document.addEventListener('DOMContentLoaded', () => {
  const recipeId = getRecipeIdFromUrl();
  fetchRecipeDetails(recipeId);
  fetchComments(recipeId);

  document.getElementById('comment-form').addEventListener('submit', handleCommentFormSubmit);

  document.getElementById('back-to-home').addEventListener('click', () => {
    window.history.back();
  });
});
function getEmail(){
  const params = new URLSearchParams(window.location.search);
  const user_email =  params.get('id').split('?')[1].split('=')[1];
  const user_div = document.getElementById('user-profile-popup');
  user_div.innerHTML = '';
  const h4 = document.createElement('h4');
  h4.innerText = user_email;
  console.log(user_email);
  user_div.append(h4);
}
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
      'x-rapidapi-key': '9e554d709amsh6f625362444bb16p1e1511jsnd26a28dd997b',
      'x-rapidapi-host': 'tasty.p.rapidapi.com'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(text => {
    if (!text) {
      throw new Error('Empty response body');
    }
    try {
      const data = JSON.parse(text);
      displayRecipeDetails(data);
    } catch (error) {
      throw new Error('Failed to parse JSON response');
    }
  })
  .catch(error => {
    console.error('Error fetching recipe details:', error);
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
  ingredientsList.innerHTML = '';
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
  stepsList.classList.add('steps-list');
  stepsList.innerHTML = '';
  if (data.instructions) {
    data.instructions.forEach((instruction, index) => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = `Step ${index + 1}`;
      details.appendChild(summary);

      const p = document.createElement('p');
      p.innerHTML = instruction.display_text || 'No instructions available';
      details.appendChild(p);

      stepsList.appendChild(details);
    });
  } else {
    const p = document.createElement('p');
    p.textContent = 'No steps available';
    stepsList.appendChild(p);
  }
}

async function handleCommentFormSubmit(event) {
  event.preventDefault();
  const email = document.querySelector('input[name="user-email"]').value;
  const name = document.querySelector('input[name="user-name"]').value;
  const comment = document.querySelector('textarea[name="user-comment"]').value;
  const rating = document.querySelector('input[name="user-rating"]:checked').value;

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
      document.querySelector('input[name="user-email"]').value = '';
      document.querySelector('input[name="user-name"]').value = '';
      document.querySelector('textarea[name="user-comment"]').value = '';
      document.querySelector('input[name="user-rating"]:checked').checked = false;
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
      const comments = await response.json();
      displayComments(comments);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error fetching comments');
  }
}

function displayComments(data) {
  const commentsList = document.getElementById('comments-list');
  commentsList.innerHTML = '';
  if (!Array.isArray(data) || data.length === 0) {
    const noComments = document.createElement('p');
    noComments.classList.add('no-comments');
    noComments.innerText = 'No comments available for this recipe.';
    commentsList.appendChild(noComments);
    return;
  }
  data.forEach(comment => {
    const commentContainer = document.createElement('div');
    commentContainer.classList.add('comment-container');
    
    const header = document.createElement('div');
    header.classList.add('comment-header');
    
    const name = document.createElement('span');
    name.classList.add('comment-name');
    name.innerText = comment.name;
    
    const rating = document.createElement('span');
    rating.classList.add('comment-rating');
    rating.innerHTML = `<img src="./assets/star-svgrepo-com.svg" alt="star" class="star-icon">${comment.rating}`;
    
    
    header.appendChild(rating);
    header.appendChild(name);
    const commentBody = document.createElement('p');
    commentBody.classList.add('comment-body');
    commentBody.innerHTML = comment.comment;

    commentContainer.appendChild(header);
    commentContainer.appendChild(commentBody);
    
    commentsList.appendChild(commentContainer);
  });
}

function PopupOpen() {
  document.getElementById('user-profile-popup').style.display = "flex";
}

function PopupClose() {
  document.getElementById('user-profile-popup').style.display = "none";
}

// Add event listeners for mobile touch events
document.querySelector('.user-profile').addEventListener('touchstart', PopupOpen);
document.querySelector('.user-profile').addEventListener('touchend', PopupClose);

function submitComment(commentData) {
    // Implement the function to handle comment submission
    console.log('Comment submitted:', commentData);
}

getEmail();