function showMessage(msg, isError) {
  var el = document.getElementById('message');
  if (!el) return;
  el.innerText = msg;
  el.style.color = isError ? 'crimson' : 'green';
}

function handleForm(formId, endpoint, successRedirect) {
  var form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    // prevent page from reloading on submit
    e.preventDefault();
    
    // save data from form to data
    var form_data = new FormData(form);
    var data = {};
    form_data.forEach(function (value, key) { data[key] = value; });

    try {
      // send data to server
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // parse server response
      const result = await response.json();

      // handle error responses
      if (!response.ok) {
        showMessage(result.error || 'An error occurred', true);
        return;
      }

      // show success message
      showMessage(result.message || 'Success', false);

      // redirect after success
      if (successRedirect) {
        setTimeout(function () { window.location.href = successRedirect; }, 900);
      }

    } catch (error) {
      // handle network errors
      showMessage('Network error', true);
    }
  });
}

handleForm('registerForm', '/register', '/login');
handleForm('loginForm', '/login', '/success');
