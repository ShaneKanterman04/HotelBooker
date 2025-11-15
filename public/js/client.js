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

      if (endpoint === '/login' && r.json && r.json.role === 'admin') {

        var existing = document.getElementById('adminBtn');
        if (existing) return;
        var btn = document.createElement('button');
        btn.id = 'adminBtn';
        btn.innerText = 'Go to Admin';
        btn.style.marginTop = '8px';
        btn.addEventListener('click', function () { window.location.href = '/admin'; });
        
        var formEl = document.getElementById(formId);
        if (formEl && formEl.parentNode) {
          formEl.parentNode.appendChild(btn);
        } else {
          var msgEl = document.getElementById('message');
          if (msgEl && msgEl.parentNode) msgEl.parentNode.appendChild(btn);
        }
      } else if (successRedirect) {
        setTimeout(function () { window.location.href = successRedirect; }, 900);
      }
    }).catch(function () {
      showMessage('Network error', true);
    });
  });
}

handleForm('registerForm', '/register', '/login');
handleForm('loginForm', '/login', '/');

function renderUsers(users) {
  var tbody = document.querySelector('#usersTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var tr = document.createElement('tr');

    var idTd = document.createElement('td');
    idTd.style.padding = '8px';
    idTd.style.borderBottom = '1px solid #f2f4f7';
    idTd.innerText = u.id;

    var userTd = document.createElement('td');
    userTd.style.padding = '8px';
    userTd.style.borderBottom = '1px solid #f2f4f7';
    userTd.innerText = u.username;

    var roleTd = document.createElement('td');
    roleTd.style.padding = '8px';
    roleTd.style.borderBottom = '1px solid #f2f4f7';
    roleTd.innerText = u.role;

    tr.appendChild(idTd);
    tr.appendChild(userTd);
    tr.appendChild(roleTd);
    tbody.appendChild(tr);
  }
}

function fetchUsers() {
  var msg = document.getElementById('message');
  fetch('/api/users').then(function (res) {
    if (!res.ok) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        if (msg) { msg.innerText = json.error || 'Failed to load users'; msg.style.color = 'crimson'; }
        throw new Error('fetch error');
      });
    }
    return res.json();
  }).then(function (json) {
    renderUsers((json && json.users) || []);
    if (msg) { msg.innerText = 'Loaded'; msg.style.color = 'green'; }
  }).catch(function () {
    if (msg) { msg.innerText = 'Network error'; msg.style.color = 'crimson'; }
  });
}

var refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', function (e) { e.preventDefault(); fetchUsers(); });
  fetchUsers();
}
