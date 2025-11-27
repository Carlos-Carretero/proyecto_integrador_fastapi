// Front Cultivos - App JS (CRUD Completo - CORREGIDO)
// Configuración API
const determineAPIUrl = () => {
  if (typeof VITE_API_URL !== 'undefined' && VITE_API_URL) {
    return VITE_API_URL
  }
  if (window.__API_URL) {
    return window.__API_URL
  }
  return 'https://proyecto-integrador-fastapi-ui7e.onrender.com/api/v1'
}

const API_URL = determineAPIUrl()
console.log('🌾 API conecta a:', API_URL)

// ===== DOM ELEMENTS =====
const loginScreen = document.getElementById('login-screen')
const registerScreen = document.getElementById('register-screen')
const appScreen = document.getElementById('app-screen')

const loginForm = document.getElementById('login-form')
const registerForm = document.getElementById('register-form')
const gotoRegisterBtn = document.getElementById('goto-register-btn')
const gotoLoginBtn = document.getElementById('goto-login-btn')

const loginEmail = document.getElementById('login-email')
const loginPassword = document.getElementById('login-password')
const loginError = document.getElementById('login-error')

const regNombre = document.getElementById('reg-nombre')
const regEmail = document.getElementById('reg-email')
const regPassword = document.getElementById('reg-password')
const registerError = document.getElementById('register-error')
const registerSuccess = document.getElementById('register-success')

const userNameDisplay = document.getElementById('user-name-display')
const logoutBtn = document.getElementById('logout-btn')
const btnListCultivos = document.getElementById('btn-list-cultivos')
const btnCreateCultivo = document.getElementById('btn-create-cultivo')
const btnPerfil = document.getElementById('btn-perfil')

const cultivosListView = document.getElementById('cultivos-list-view')
const cultivoCreateView = document.getElementById('cultivo-create-view')
const cultivoEditView = document.getElementById('cultivo-edit-view')
const perfilView = document.getElementById('perfil-view')

const cultivosList = document.getElementById('cultivos-list')
const refreshBtn = document.getElementById('refresh-btn')

const createCultivoForm = document.getElementById('create-cultivo-form')
const cultivoNombre = document.getElementById('cultivo-nombre')
const cultivoTipo = document.getElementById('cultivo-tipo')
const cultivoDescripcion = document.getElementById('cultivo-descripcion')
const createCultivoError = document.getElementById('create-cultivo-error')
const createCultivoSuccess = document.getElementById('create-cultivo-success')

const editCultivoForm = document.getElementById('edit-cultivo-form')
const editCultivoNombre = document.getElementById('edit-cultivo-nombre')
const editCultivoTipo = document.getElementById('edit-cultivo-tipo')
const editCultivoDescripcion = document.getElementById('edit-cultivo-descripcion')
const editCultivoError = document.getElementById('edit-cultivo-error')
const editCultivoSuccess = document.getElementById('edit-cultivo-success')
const cancelEditBtn = document.getElementById('cancel-edit-btn')
const deleteCultivoBtn = document.getElementById('delete-cultivo-btn')

const perfilEmail = document.getElementById('perfil-email')
const perfilNombre = document.getElementById('perfil-nombre')
const perfilRole = document.getElementById('perfil-role')
const perfilCultivosCount = document.getElementById('perfil-cultivos-count')
const perfilNewPassword = document.getElementById('perfil-new-password')
const updatePerfilBtn = document.getElementById('update-perfil-btn')
const deleteAccountBtn = document.getElementById('delete-account-btn')
const perfilError = document.getElementById('perfil-error')
const perfilSuccess = document.getElementById('perfil-success')

let currentEditingCultivoId = null

// ===== TOKEN & USER MANAGEMENT =====
function saveToken(token) { localStorage.setItem('pi_token', token) }
function getToken() { return localStorage.getItem('pi_token') }
function clearToken() { localStorage.removeItem('pi_token') }
function saveUser(userData) { localStorage.setItem('pi_user', JSON.stringify(userData)) }
function getUser() { const u = localStorage.getItem('pi_user'); return u ? JSON.parse(u) : null }
function clearUser() { localStorage.removeItem('pi_user') }

// ===== JWT PARSING =====
function parseJwt(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch (e) { return null }
}

// ===== API: AUTH =====
async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Login fallido')
  return await res.json()
}

async function registerNewUser(nombre, email, password) {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password })
  })
  if (!res.ok) throw new Error('Registro fallido')
  return await res.json()
}

// ===== API: USUARIOS (CRUD) =====
async function fetchUsuario(id) {
  const token = getToken()
  if (!token) throw new Error('No autenticado')
  
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error al obtener usuario')
  return await res.json()
}

async function updateUsuario(id, dataToUpdate) {
  const token = getToken()
  if (!token) throw new Error('No autenticado')
  
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(dataToUpdate)
  })
  if (!res.ok) throw new Error('Error actualizando usuario')
  return await res.json()
}

async function deleteUsuario(id) {
  const token = getToken()
  if (!token) throw new Error('No autenticado')
  
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error eliminando usuario')
}

// ===== API: CULTIVOS (CRUD) =====
async function fetchCultivos() {
  const token = getToken()
  const user = getUser()
  if (!token || !user) return []
  
  const res = await fetch(`${API_URL}/cultivos?usuario_id=${user.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error al obtener cultivos')
  return await res.json()
}

async function fetchCultivo(id) {
  const token = getToken()
  if (!token) throw new Error('No autenticado')
  
  const res = await fetch(`${API_URL}/cultivos/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error al obtener cultivo')
  return await res.json()
}

async function createNewCultivo(nombre, tipo, descripcion, usuario_id) {
  const token = getToken()
  if (!token) throw new Error('No autenticado')
  
  const res = await fetch(`${API_URL}/cultivos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre,
      tipo,
      descripcion: descripcion || null,
      usuario_id
    })
  })
  if (!res.ok) throw new Error('Error creando cultivo')
  return await res.json()
}

async function updateCultivo(id, nombre, tipo, descripcion, usuario_id) {
  const token = getToken()
  if (!token) throw new Error('No autenticado')
  
  const res = await fetch(`${API_URL}/cultivos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre,
      tipo,
      descripcion: descripcion || null,
      usuario_id
    })
  })
  if (!res.ok) throw new Error('Error actualizando cultivo')
  return await res.json()
}

async function deleteCultivo(id) {
  const token = getToken()
  if (!token) throw new Error('No autenticado')
  
  const res = await fetch(`${API_URL}/cultivos/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error eliminando cultivo')
}

// ===== SCREEN MANAGEMENT =====
function showScreen(screen) {
  loginScreen.classList.remove('active')
  registerScreen.classList.remove('active')
  appScreen.classList.remove('active')
  screen.classList.add('active')
}

// ===== VIEW MANAGEMENT =====
function switchView(viewToShow) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
  viewToShow.classList.add('active')
  
  document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'))
  
  if (viewToShow === cultivosListView) {
    btnListCultivos.classList.add('active')
  } else if (viewToShow === cultivoCreateView) {
    btnCreateCultivo.classList.add('active')
  } else if (viewToShow === perfilView) {
    btnPerfil.classList.add('active')
  }
}

// ===== RENDER FUNCTIONS =====
function renderCultivos(cultivos) {
  if (!cultivos || cultivos.length === 0) {
    cultivosList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🌱</div>
        <h3>Sin cultivos aún</h3>
        <p>Comienza creando tu primer cultivo</p>
      </div>
    `
    return
  }
  
  cultivosList.innerHTML = cultivos
    .map(c => `
      <div class="cultivo-card" onclick="editCultivo(${c.id})" style="cursor: pointer;">
        <div class="cultivo-card-header">
          <div class="cultivo-card-title">${escapeHtml(c.nombre)}</div>
          <div class="cultivo-card-tipo">${escapeHtml(c.tipo)}</div>
        </div>
        ${c.descripcion ? `<div class="cultivo-card-descripcion">${escapeHtml(c.descripcion)}</div>` : ''}
        <div class="cultivo-card-usuario">
          👨‍🌾 <strong>${escapeHtml(c.usuario.nombre)}</strong>
        </div>
      </div>
    `)
    .join('')
}

function escapeHtml(s) {
  if (!s) return ''
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function clearErrors() {
  ;[loginError, registerError, registerSuccess, createCultivoError, createCultivoSuccess, editCultivoError, editCultivoSuccess, perfilError, perfilSuccess].forEach(el => {
    if (el) el.style.display = 'none'
  })
}

function showError(element, message) {
  if (element) {
    element.textContent = message
    element.style.display = 'block'
  }
}

function showSuccess(element, message) {
  if (element) {
    element.textContent = message
    element.style.display = 'block'
  }
}

// ===== EVENT LISTENERS =====

// Auth Navigation
gotoRegisterBtn.addEventListener('click', (e) => {
  e.preventDefault()
  clearErrors()
  showScreen(registerScreen)
})

gotoLoginBtn.addEventListener('click', (e) => {
  e.preventDefault()
  clearErrors()
  showScreen(loginScreen)
})

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearErrors()
  
  try {
    loginEmail.disabled = loginPassword.disabled = true
    
    const data = await loginUser(loginEmail.value.trim(), loginPassword.value)
    const payload = parseJwt(data.access_token)
    if (!payload || !payload.sub) throw new Error('Token inválido')
    
    saveToken(data.access_token)
    saveUser({
      id: Number(payload.sub),
      email: payload.email
    })
    
    loginEmail.value = loginPassword.value = ''
    userNameDisplay.textContent = payload.email.split('@')[0]
    showScreen(appScreen)
    loadCultivos()
  } catch (err) {
    console.error(err)
    showError(loginError, err.message)
  } finally {
    loginEmail.disabled = loginPassword.disabled = false
  }
})

// Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearErrors()
  
  try {
    regNombre.disabled = regEmail.disabled = regPassword.disabled = true
    
    await registerNewUser(regNombre.value.trim(), regEmail.value.trim(), regPassword.value)
    
    regNombre.value = regEmail.value = regPassword.value = ''
    showSuccess(registerSuccess, 'Cuenta creada. Inicia sesión.')
    
    setTimeout(() => showScreen(loginScreen), 2000)
  } catch (err) {
    console.error(err)
    showError(registerError, err.message)
  } finally {
    regNombre.disabled = regEmail.disabled = regPassword.disabled = false
  }
})

// Logout
logoutBtn.addEventListener('click', () => {
  clearToken()
  clearUser()
  clearErrors()
  loginEmail.value = loginPassword.value = ''
  regNombre.value = regEmail.value = regPassword.value = ''
  cultivoNombre.value = cultivoTipo.value = cultivoDescripcion.value = ''
  showScreen(loginScreen)
})

// Sidebar Navigation
btnListCultivos.addEventListener('click', () => {
  switchView(cultivosListView)
  loadCultivos()
})

btnCreateCultivo.addEventListener('click', () => {
  createCultivoForm.reset()
  clearErrors()
  switchView(cultivoCreateView)
})

btnPerfil.addEventListener('click', () => {
  clearErrors()
  switchView(perfilView)
  loadPerfil()
})

refreshBtn.addEventListener('click', async () => {
  refreshBtn.disabled = true
  try { await loadCultivos() } catch (err) { alert('Error: ' + err.message) }
  finally { refreshBtn.disabled = false }
})

// Create Cultivo
createCultivoForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearErrors()
  
  const user = getUser()
  if (!user) return showError(createCultivoError, 'No autenticado')
  
  try {
    await createNewCultivo(
      cultivoNombre.value.trim(),
      cultivoTipo.value.trim(),
      cultivoDescripcion.value.trim(),
      user.id
    )
    
    cultivoNombre.value = cultivoTipo.value = cultivoDescripcion.value = ''
    showSuccess(createCultivoSuccess, 'Cultivo creado ✓')
    
    setTimeout(async () => {
      await loadCultivos()
      switchView(cultivosListView)
    }, 1000)
  } catch (err) {
    console.error(err)
    showError(createCultivoError, err.message)
  }
})

// Edit Cultivo
editCultivoForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearErrors()
  
  if (!currentEditingCultivoId) return
  
  const user = getUser()
  if (!user) return showError(editCultivoError, 'No autenticado')
  
  try {
    await updateCultivo(
      currentEditingCultivoId,
      editCultivoNombre.value.trim(),
      editCultivoTipo.value.trim(),
      editCultivoDescripcion.value.trim(),
      user.id
    )
    
    showSuccess(editCultivoSuccess, 'Cultivo actualizado ✓')
    
    setTimeout(async () => {
      await loadCultivos()
      switchView(cultivosListView)
    }, 1000)
  } catch (err) {
    console.error(err)
    showError(editCultivoError, err.message)
  }
})

cancelEditBtn.addEventListener('click', () => {
  switchView(cultivosListView)
})

deleteCultivoBtn.addEventListener('click', async () => {
  if (!currentEditingCultivoId) return
  if (!confirm('¿Eliminar este cultivo?')) return
  
  clearErrors()
  
  try {
    await deleteCultivo(currentEditingCultivoId)
    showSuccess(editCultivoSuccess, 'Cultivo eliminado ✓')
    
    setTimeout(async () => {
      await loadCultivos()
      switchView(cultivosListView)
    }, 1000)
  } catch (err) {
    console.error(err)
    showError(editCultivoError, err.message)
  }
})

// Update Perfil
updatePerfilBtn.addEventListener('click', async () => {
  clearErrors()
  const user = getUser()
  if (!user) return showError(perfilError, 'No autenticado')
  
  const dataToUpdate = {}
  const newPassword = perfilNewPassword.value.trim()
  if (newPassword) dataToUpdate.password = newPassword
  
  if (Object.keys(dataToUpdate).length === 0) {
    return showError(perfilError, 'Escribe una contraseña para cambiar')
  }
  
  try {
    await updateUsuario(user.id, dataToUpdate)
    showSuccess(perfilSuccess, 'Perfil actualizado ✓')
    perfilNewPassword.value = ''
    setTimeout(() => loadPerfil(), 1500)
  } catch (err) {
    console.error(err)
    showError(perfilError, err.message)
  }
})

// Delete Account
deleteAccountBtn.addEventListener('click', async () => {
  const user = getUser()
  if (!user) return
  
  if (!confirm('¿ELIMINAR CUENTA? (irreversible)')) return
  if (!confirm('ÚLTIMO AVISO: Se eliminarán todos tus cultivos.')) return
  
  clearErrors()
  
  try {
    await deleteUsuario(user.id)
    clearToken()
    clearUser()
    showScreen(loginScreen)
    alert('Cuenta eliminada.')
  } catch (err) {
    console.error(err)
    showError(perfilError, err.message)
  }
})

// ===== HELPERS =====
async function loadCultivos() {
  try {
    cultivosList.innerHTML = '<div style="text-align:center;padding:2rem">⏳</div>'
    const cultivos = await fetchCultivos()
    renderCultivos(cultivos)
  } catch (err) {
    console.error(err)
    cultivosList.innerHTML = '<div style="color:red;text-align:center">Error cargando cultivos</div>'
  }
}

async function editCultivo(id) {
  try {
    const cultivo = await fetchCultivo(id)
    currentEditingCultivoId = id
    editCultivoNombre.value = cultivo.nombre
    editCultivoTipo.value = cultivo.tipo
    editCultivoDescripcion.value = cultivo.descripcion || ''
    clearErrors()
    switchView(cultivoEditView)
  } catch (err) {
    console.error(err)
    alert('Error: ' + err.message)
  }
}

async function loadPerfil() {
  try {
    const user = getUser()
    if (!user) return
    
    const usuarioData = await fetchUsuario(user.id)
    perfilEmail.textContent = usuarioData.email
    perfilNombre.textContent = usuarioData.nombre
    perfilRole.textContent = usuarioData.role || 'user'
    perfilCultivosCount.textContent = (usuarioData.cultivos || []).length
    perfilNewPassword.value = ''
  } catch (err) {
    console.error(err)
    showError(perfilError, 'Error cargando perfil')
  }
}

// ===== INIT =====
function init() {
  const token = getToken()
  const user = getUser()
  
  if (token && user) {
    userNameDisplay.textContent = user.email.split('@')[0]
    showScreen(appScreen)
    loadCultivos()
  } else {
    clearToken()
    clearUser()
    showScreen(loginScreen)
  }
}

document.addEventListener('DOMContentLoaded', init)
