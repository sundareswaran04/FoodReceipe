document.addEventListener('DOMContentLoaded', () => {
  const recipeId = getRecipeIdFromUrl();
    fetchRecipeDetails(recipeId);
    fetchComments(recipeId);
  });
  
  function getRecipeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
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
    document.getElementById('rating').textContent = ( data.user_ratings?.score * 5).toFixed(2) || 'No Rating';
    document.getElementById('duration').textContent = data.total_time_minutes + " mins" || 'N/A';
    document.getElementById('recipe-header').style.backgroundImage = `url(${data.thumbnail_url || ''})`;
    document.getElementById('title').textContent = (data.name)
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
  
  document.getElementById('comment-form').addEventListener('submit', async (event) => { 
    event.preventDefault();
    const email = document.querySelector('input[name="user-email"]').value;
    const name = document.querySelector('input[name="user-name"]').value;
    const comment = document.querySelector('textarea[name="user-comment"]').value;
    const rating = document.querySelector('input[name="user-rating"]').value;

    if (!email || !name || !comment || !rating) {
      alert('All fields are required');
      return;
    }
    const recipeId = getRecipeIdFromUrl();
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
        fetchComments(recipeId);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error posting comment');
    }

  });

  async function fetchComments(recipeId) {
    try {
      const response = await fetch(`/section?recipeId=${recipeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
  
      if (response.status === 400) {
        alert(result.error || 'Invalid request');
      } else if (response.status === 404) {
        alert(result.error || 'Comments not found for this recipe.');
      } else if (response.status === 500) {
        alert(result.error || 'An internal error occurred while fetching comments.');
      } else if (response.ok) {
        // Expecting { comments: [...] }
        if (result.comments && result.comments.length > 0) {
          displayComments(result.comments); // Pass the array to your display function
        } else {
          alert('No comments available for this recipe.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching comments. Please try again.');
    }
  }
  
  function displayComments(data) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = ''; // Clear existing content
    data.forEach(comment => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${comment.name}:</strong> ${comment.comment} <br> <strong>Rating:</strong> ${comment.rating}`;
      commentsList.appendChild(li);
    });
  }
