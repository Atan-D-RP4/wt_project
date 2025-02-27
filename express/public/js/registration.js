document.addEventListener('DOMContentLoaded', function() {
  const registrationForm = document.getElementById('registrationForm');

  if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Collect form data
      const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        accountType: document.querySelector('input[name="accountType"]:checked').value
      };

      // Validate password
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (formData.password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Basic password strength validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        alert("Password doesn't meet requirements");
        return;
      }

      try {
        const response = await fetch('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          alert("Account created successfully! You can now log in.");
          window.location.href = '/login';
        } else {
          alert(data.error || "Registration failed");
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
      }
    });
  }
});
