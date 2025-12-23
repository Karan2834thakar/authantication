const apiBase = '/api/auth';

function jsonFetch(url, opts = {}){
  const headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {});
  if (localStorage.getItem('token')) headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
  return fetch(url, Object.assign({}, opts, { headers }))
    .then(async res => ({ ok: res.ok, status: res.status, body: await res.json().catch(()=>null) }));
}

// Helpers
function s(id){return document.getElementById(id)}
function handleForm(formId, handler){
  const f = s(formId);
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(f).entries());
    handler(data);
  });
}

handleForm('registerForm', async data => {
  const res = await jsonFetch(apiBase + '/register', { method:'POST', body: JSON.stringify(data) });
  alert(JSON.stringify(res.body));
});

handleForm('loginForm', async data => {
  const res = await jsonFetch(apiBase + '/login', { method:'POST', body: JSON.stringify(data) });
  if (res.ok && res.body.token) {
    localStorage.setItem('token', res.body.token);
    s('loginResult').textContent = 'Login successful';
  } else {
    s('loginResult').textContent = JSON.stringify(res.body || res);
  }
});

handleForm('forgotForm', async data => {
  const res = await jsonFetch(apiBase + '/forgot', { method:'POST', body: JSON.stringify(data) });
  s('forgotResult').textContent = JSON.stringify(res.body);
});

// Verify OTP UI removed - reset uses email+otp directly

handleForm('resetForm', async data => {
  const res = await jsonFetch(apiBase + '/reset-password', { method:'POST', body: JSON.stringify(data) });
  s('resetResult').textContent = JSON.stringify(res.body);
});

handleForm('changeForm', async data => {
  const res = await jsonFetch(apiBase + '/change-password', { method:'PATCH', body: JSON.stringify(data) });
  s('changeResult').textContent = JSON.stringify(res.body);
});

s('showToken').addEventListener('click', ()=>{
  s('tokenArea').textContent = localStorage.getItem('token') || 'No token saved';
});
s('clearToken').addEventListener('click', ()=>{ localStorage.removeItem('token'); s('tokenArea').textContent = 'Cleared'; });
