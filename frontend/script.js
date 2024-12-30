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
          const result = await response.json();
          const popup_div = document.getElementById('popup-msg-body');
          const p = document.createElement('p');
          popup_div.innerHTML = '';
          p.innerText = result.error;
          popup_div.appendChild(p);
          document.getElementById('popup-msg-content').style.display = 'flex';
        } else if (response.status === 500) {
          alert('Error registering user');
        } else {
          const result = await response.text();
          window.location.href = `./HomePage.html?email=${email}`;
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
          const result = await response.json();
          const popup_div = document.getElementById('popup-msg-body');
          const p = document.createElement('p');
          popup_div.innerHTML = '';

          p.innerText = result.error;
          popup_div.appendChild(p);
          document.getElementById('popup-msg-content').style.display = 'flex';
        } else if (response.status === 500) {
          alert('Error logging in');
        } else {
          const result = await response.json();
          if (result.success) {
            window.location.href = `./HomePage.html?email=${email}`;
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

function ClosePopupMsg() {
  document.getElementById('popup-msg-content').style.display = 'none';
}