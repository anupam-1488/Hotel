const API_URL = 'http://localhost:3000';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authSection = document.getElementById('authSection');
const dashboard = document.getElementById('dashboard');
const userNameDisplay = document.getElementById('userName');
const userEmailDisplay = document.getElementById('userEmail');
const userIdDisplay = document.getElementById('userId');
const userRoleDisplay = document.getElementById('userRole');
const userTokenDisplay = document.getElementById('userToken');
const logoutBtn = document.getElementById('logoutBtn');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const showLoginWrapper = document.getElementById('showLoginWrapper');
const statusMessage = document.getElementById('statusMessage');
const protectedSection = document.getElementById('protectedSection');
const testProtectedButton = document.getElementById('testProtected');
const protectedResponseDisplay = document.getElementById('protectedResponse');
const adminSection = document.getElementById('adminSection');
const viewUsersButton = document.getElementById('viewUsers');
const viewLogsButton = document.getElementById('viewLogs');
const adminResponseDisplay = document.getElementById('adminResponse');

let authToken = localStorage.getItem('authToken');
let currentUserRole = null;

function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `mt-4 text-center text-sm font-semibold ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
  setTimeout(() => {
    statusMessage.textContent = '';
  }, 3000);
}

function showLoginForm() {
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
  showLoginWrapper.style.display = 'none';
}

function showRegisterForm() {
  loginForm.style.display = 'none';
  registerForm.style.display = 'flex';
  showLoginWrapper.style.display = 'block';
}

function showDashboard() {
  authSection.style.display = 'none';
  dashboard.style.display = 'block';
  
  // Show admin section if user has admin role
  if (currentUserRole === 'admin') {
    adminSection.style.display = 'block';
  } else {
    adminSection.style.display = 'none';
  }
}

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  showLoginForm();
});

showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  showRegisterForm();
});

if (authToken) {
  fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        userNameDisplay.textContent = data.user.name;
        userEmailDisplay.textContent = data.user.email;
        userIdDisplay.textContent = data.user.id;
        userRoleDisplay.textContent = data.user.role;
        userTokenDisplay.textContent = authToken;
        currentUserRole = data.user.role;
        showDashboard();
      } else {
        localStorage.removeItem('authToken');
        showLoginForm();
      }
    });
} else {
  showLoginForm();
}

loginForm.addEventListener('submit', async (e) => {
e.preventDefault();
const email = loginForm.loginEmail.value;
const password = loginForm.loginPassword.value;

try {
const response = await fetch(`${API_URL}/auth/login`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email, password })
});

const data = await response.json();

if (response.ok) {
localStorage.setItem('authToken', data.token);
authToken = data.token;

userNameDisplay.textContent = data.user.name;
userEmailDisplay.textContent = data.user.email;
userIdDisplay.textContent = data.user.id;
userRoleDisplay.textContent = data.user.role;
userTokenDisplay.textContent = data.token;
currentUserRole = data.user.role;

showDashboard();
showStatus('Login successful!');
} else {
showStatus(data.message || 'Login failed', 'error');
}
} catch (error) {
showStatus('Network error', 'error');
console.error('Login error:', error);
}
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = registerForm.registerName.value;
  const email = registerForm.registerEmail.value;
  const password = registerForm.registerPassword.value;
  const role = document.querySelector('input[name="role"]:checked').value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      userNameDisplay.textContent = data.user.name;
      userEmailDisplay.textContent = data.user.email;
      userIdDisplay.textContent = data.user.id;
      userRoleDisplay.textContent = data.user.role;
      userTokenDisplay.textContent = authToken;
      currentUserRole = data.user.role;
      showDashboard();
      showStatus('Registration successful!', 'success');
      
      // Show a message if they tried to register as admin but got customer role
      if (role === 'admin' && data.user.role === 'customer') {
        showStatus('Note: Admin registrations require approval. You have been registered as a customer.', 'error');
      }
    } else {
      showStatus(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    showStatus('Registration failed: ' + error.message, 'error');
  }
});

logoutBtn.addEventListener('click', () => {
  authToken = null;
  currentUserRole = null;
  localStorage.removeItem('authToken');
  dashboard.style.display = 'none';
  authSection.style.display = 'block';
  showLoginForm();
  showStatus('Logged out!', 'success');
});

testProtectedButton.addEventListener('click', async () => {
  if (!authToken) {
    showStatus('Please log in to test this route.', 'error');
    return;
  }
  try {
    const response = await fetch(`${API_URL}/api/protected`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();
    if (response.ok) {
      protectedResponseDisplay.textContent = JSON.stringify(data, null, 2);
      showStatus('Protected route accessed successfully!', 'success');
    } else {
      protectedResponseDisplay.textContent = `Error: ${data.message}`;
      showStatus('Failed to access protected route.', 'error');
    }
  } catch (error) {
    protectedResponseDisplay.textContent = `Error: ${error.message}`;
    showStatus('Error accessing protected route: ' + error.message, 'error');
  }
});

// Admin functionality
let usersList = [];



  


let logsList = [];

  
    

  function renderTable(dataList, emptyMessage = 'No data found.') {
    const table = document.getElementById('dataTable');
    const thead = document.getElementById('dataTableHead');
    const tbody = document.getElementById('dataTableBody');
  
    thead.innerHTML = '';
    tbody.innerHTML = '';
  
    if (!dataList || dataList.length === 0) {
      table.classList.add('hidden');
      document.getElementById('adminResponse').textContent = emptyMessage;
      return;
    }
  
    const headers = Object.keys(dataList[0]);
  
    headers.forEach(header => {
      const th = document.createElement('th');
      th.className = 'px-4 py-2 border-b font-semibold';
      th.textContent = header;
      thead.appendChild(th);
    });
  
    dataList.forEach(item => {
      const tr = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.className = 'px-4 py-2 border-b';
        td.textContent = item[header];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  
    table.classList.remove('hidden');
  }
  if (viewUsersButton) {
    viewUsersButton.addEventListener('click', async () => {
      if (!authToken) {
        showStatus('Please log in as admin to view users.', 'error');
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await response.json();
        if (response.ok) {
          usersList = data.users || data;
          renderTable(usersList, 'No users found.');
          showStatus('Users fetched successfully!', 'success');
        } else {
          showStatus('Failed to fetch users: ' + data.message, 'error');
        }
      } catch (error) {
        showStatus('Error fetching users: ' + error.message, 'error');
      }
    });
  }


  if (viewLogsButton) {
    viewLogsButton.addEventListener('click', async () => {
      if (!authToken) {
        showStatus('Please log in as admin to view logs.', 'error');
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/admin/logs`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await response.json();
        if (response.ok) {
          logsList = data.logs || data;
          renderTable(logsList, 'No logs found.');
          showStatus('Logs fetched successfully!', 'success');
        } else {
          showStatus('Failed to fetch logs: ' + data.message, 'error');
        }
      } catch (error) {
        showStatus('Error fetching logs: ' + error.message, 'error');
      }
    });
  }
      