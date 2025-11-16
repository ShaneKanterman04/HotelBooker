function showMessage(msg, isError) {
  var el = document.getElementById('message');
  if (!el) return;
  el.innerText = msg;
  el.style.color = isError ? 'crimson' : 'green';
}

function handleForm(formId, endpoint, successRedirect) {
  var form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (value, key) { data[key] = value; });

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (res) {
      return res.json().then(function (json) { return { ok: res.ok, json: json }; });
    }).then(function (r) {
      if (!r.ok) {
        showMessage((r.json && r.json.error) || 'An error occurred', true);
        return;
      }
      showMessage((r.json && r.json.message) || 'Success', false);

      if (successRedirect) {
        setTimeout(function () { window.location.href = successRedirect; }, 900);
      }
    }).catch(function () {
      showMessage('Network error', true);
    });
  });
}

handleForm('registerForm', '/register', '/login');
handleForm('loginForm', '/login', '/success');
