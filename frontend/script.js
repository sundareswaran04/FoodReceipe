document.addEventListener('DOMContentLoaded', () => {
  const signUpForm = document.getElementById('sign-up-form');
  const loginForm = document.getElementById('login-form');

  if (signUpForm) {
    signUpForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.querySelector('input[name="user-email-signup"]').value;
      const password = document.querySelector('input[name="user-password-signup"]').value;
      const confirmPassword = document.querySelector('input[name="user-confirm-password"]').value;

      if (!email || !password || !confirmPassword) {
        alert('All fields are required');
        return;
      }

      try {
        const response = await fetch('/sign-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, confirmPassword })
        });

        if (response.status === 400) {
          const result = await response.text();
          alert(result);
        } else if (response.status === 500) {
          alert('Error registering user');
        } else {
          const result = await response.text();
          alert(result);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error registering user');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.querySelector('input[name="user-email-login"]').value;
      const password = document.querySelector('input[name="user-password-login"]').value;

      if (!email || !password) {
        alert('All fields are required');
        return;
      }

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        if (response.status === 400) {
          const result = await response.text();
          alert(result);
        } else if (response.status === 500) {
          alert('Error logging in');
        } else {
          const result = await response.json();
          if (result.success) {
            window.location.href = './HomePage.html';
          } else {
            alert('Login failed');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error logging in');
      }
    });
  }
});
