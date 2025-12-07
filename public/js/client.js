function showMessage(msg, isError) {
  var el = document.getElementById("message");
  if (!el) return;
  el.innerText = msg;
  el.style.color = isError ? 'crimson' : 'green';
  el.style.display = 'block';
  el.style.padding = '10px';
  el.style.marginTop = '15px';
  el.style.border = '1px solid ' + (isError ? 'crimson' : 'green');
  el.style.borderRadius = '4px';
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
      // send data to server, response holds HTTP metadata from server
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // parse server response body as a JSON object
      const result = await response.json();

      // handle error responses
      if (!response.ok) {
        console.log('Error occurred:', result.error);
        showMessage(result.error || 'An error occurred', true);
        return;
      }
      // show success message
      showMessage(result.message || 'Success', false);

      // redirect after success
      if (successRedirect) {
        setTimeout(function () { window.location.href = successRedirect; }, 2000);
      }

    } catch(error) {
      // handle network errors
      console.error('Network error:', error);
      showMessage('ERROR: ' + error.message, true);
    }
  });
}

handleForm('registerForm', '/register', '/login');
handleForm('loginForm', '/login', '/');
 