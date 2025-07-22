const backendUrl = 'http://localhost:8000/api';

document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const taskForm = document.getElementById('taskForm');
  const taskList = document.getElementById('taskList');

  // Handle registration
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch(`${backendUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          alert('Registration successful! Please login.');
          window.location.href = 'login.html';
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong');
      }
    });
  }

  // Handle login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch(`${backendUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('token', data.token);
          alert('Login successful!');
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong');
      }
    });
  }

  // Handle task creation
  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const category = document.getElementById('category').value;
      const tagsInput = document.getElementById('tags').value;
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
      const deadline = document.getElementById('deadline').value;

      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`${backendUrl}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ title, category, tags, deadline }),
        });

        const data = await res.json();

        if (res.ok) {
          // alert('Task added!');
          showToast('Task added!', 'success');
          taskForm.reset();
          fetchTasks();
        } else {
          alert(data.message || 'Error creating task');
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong');
      }
    });
  }
  if (taskList) {
    fetchTasks();
  }

});

// Fetch and display tasks
async function fetchTasks() {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${backendUrl}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      taskList.innerHTML = '';
      data.forEach((task) => {
        const div = document.createElement('div');
        div.className = `task ${task.status}`;

        // Status Toggle Button
        const toggleButton = document.createElement('button');
        toggleButton.innerHTML = task.status === 'pending'
          ? '<i class="fas fa-check-circle"></i> Mark as Completed'
          : '<i class="fas fa-undo"></i> Mark as Pending';
        toggleButton.addEventListener('click', () => toggleStatus(task._id, task.status));

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.marginLeft = '10px';
        deleteButton.addEventListener('click', () => deleteTask(task._id));

        const formattedDeadline = task.deadline
          ? new Date(task.deadline).toLocaleDateString()
          : 'None';

        div.innerHTML = `
          <strong>${task.title}</strong> <br />
          Status: ${task.status} <br />
          Category: ${task.category || 'None'} <br />
          Tags: ${(task.tags || []).join(', ')} <br /><br />
          Deadline: ${formattedDeadline} <br /><br />
        `;

        div.appendChild(toggleButton);
        div.appendChild(deleteButton);
        taskList.appendChild(div);
      });
    } else {
      alert(data.message || 'Failed to load tasks');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
}

//task status updation
async function toggleStatus(taskId, currentStatus) {
  const token = localStorage.getItem('token');
  const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

  try {
    const res = await fetch(`${backendUrl}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      alert('Status updated!');
      fetchTasks(); // Refresh task list
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to update status');
    }
  } catch (err) {
    console.error(err);
    alert('Error updating task status');
  }
}

//Delete task
async function deleteTask(taskId) {
  const token = localStorage.getItem('token');
  const confirmDelete = confirm('Are you sure you want to delete this task?');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${backendUrl}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert('Task deleted successfully!');
      fetchTasks();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to delete task');
    }
  } catch (err) {
    console.error(err);
    showToast('Error deleting task', 'error');
  }
};

// for better alert messages
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

