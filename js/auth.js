// auth.js
const SESSION_KEY = 'sps_session';

function setSession(u){
  localStorage.setItem(SESSION_KEY, JSON.stringify(u));
}
function getSession(){
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const user = username.value.trim().toLowerCase();
  const pass = password.value.trim();
  if(!user || !pass) return loginError.textContent = "Informe usuário e senha";

  const snap = await db.ref("app/users/"+user).once("value");
  if(!snap.exists()) return loginError.textContent = "Usuário não encontrado";
  const u = snap.val();
  if(u.password !== pass) return loginError.textContent = "Senha incorreta";

  setSession({ id:user, nome:u.nome, admin:!!u.admin });
  window.location.href = u.admin ? "admin.html" : "user.html";
});


function checkAuth(role) {
  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  if (role === "admin" && !session.admin) {
    window.location.href = "user.html"; // Redirect non-admin to user page
    return null;
  }
  return session;
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}


