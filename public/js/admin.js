document.addEventListener('DOMContentLoaded', () => {
            const API_URL = window.location.origin;
            const token = localStorage.getItem('admin_token');

            // ── Auth Guard ─────────────────────────────────────────────────────────────
            const isLoginPage = window.location.pathname.includes('admin-login.html');

            if (!token && !isLoginPage) { window.location.href = 'admin-login.html'; return; }
            if (token && isLoginPage) { window.location.href = 'admin.html'; return; }

            // ── Login Page Handler ─────────────────────────────────────────────────────
            const loginForm = document.getElementById('login-form');
            const loginStatus = document.getElementById('login-status');

            if (loginForm) {
                loginForm.addEventListener('submit', async e => {
                    e.preventDefault();
                    const username = document.getElementById('login-username').value.trim();
                    const password = document.getElementById('login-password').value.trim();

                    if (loginStatus) {
                        loginStatus.className = 'status-msg';
                        loginStatus.style.display = 'block';
                        loginStatus.textContent = 'Authenticating...';
                    }

                    try {
                        const res = await fetch(`${API_URL}/api/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                        });
                        const data = await res.json();

                        if (res.ok && data.success) {
                            localStorage.setItem('admin_token', data.token);
                            if (loginStatus) {
                                loginStatus.className = 'status-msg success';
                                loginStatus.textContent = 'Access granted. Redirecting...';
                            }
                            setTimeout(() => window.location.href = 'admin.html', 900);
                        } else {
                            if (loginStatus) {
                                loginStatus.className = 'status-msg error';
                                loginStatus.textContent = data.error || 'Access denied.';
                            }
                        }
                    } catch {
                        if (loginStatus) {
                            loginStatus.className = 'status-msg error';
                            loginStatus.textContent = 'Could not reach authentication server.';
                        }
                    }
                });
            }

            if (isLoginPage) return;

            // ══════════════════════════════════════════════════════════════════════════
            // DASHBOARD STATE
            // ══════════════════════════════════════════════════════════════════════════
            let currentProjects = [];
            let currentSettings = {};
            let currentMessages = [];
            let currentYT = [];
            let currentCerts = [];
            let editingProjectId = null;
            let editingYTId = null;
            let editingCertId = null;

            const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

            // ── Tab Switching ──────────────────────────────────────────────────────────
            const navItems = document.querySelectorAll('.admin-nav-item[data-tab]');
            const tabs = document.querySelectorAll('.admin-tab-content');

            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const tabId = item.getAttribute('data-tab');
                    navItems.forEach(n => n.classList.remove('active'));
                    item.classList.add('active');
                    tabs.forEach(t => t.style.display = t.id === `${tabId}-tab` ? 'block' : 'none');

                    if (tabId === 'overview') loadOverviewData();
                    else if (tabId === 'projects') loadProjectsCRUD();
                    else if (tabId === 'youtube') loadYTCRUD();
                    else if (tabId === 'certs') loadCertsCRUD();
                    else if (tabId === 'settings') loadSettingsEditor();
                });
            });

            // ── Logout ─────────────────────────────────────────────────────────────────
            const logoutBtn = document.getElementById('admin-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', e => {
                    e.preventDefault();
                    localStorage.removeItem('admin_token');
                    window.location.href = 'admin-login.html';
                });
            }

            // ══════════════════════════════════════════════════════════════════════════
            // TAB 1: OVERVIEW
            // ══════════════════════════════════════════════════════════════════════════
            async function loadOverviewData() {
                try {
                    const [rSettings, rProjects, rMessages, rYT, rCerts] = await Promise.all([
                        fetch(`${API_URL}/api/settings`),
                        fetch(`${API_URL}/api/projects`),
                        fetch(`${API_URL}/api/contact/messages`, { headers: authHeader }),
                        fetch(`${API_URL}/api/youtube`),
                        fetch(`${API_URL}/api/certificates`)
                    ]);

                    currentSettings = await rSettings.json();
                    currentProjects = await rProjects.json();
                    currentMessages = await rMessages.json();
                    currentYT = await rYT.json();
                    currentCerts = await rCerts.json();

                    document.getElementById('anal-projects').textContent = currentProjects.length;
                    document.getElementById('anal-skills').textContent = (currentSettings.skills || []).length;
                    document.getElementById('anal-youtube').textContent = currentYT.length;
                    document.getElementById('anal-certs').textContent = currentCerts.length;
                    document.getElementById('anal-messages').textContent = currentMessages.length;
                    document.getElementById('anal-unread').textContent = currentMessages.filter(m => !m.read).length;

                    renderMessagesInbox();
                } catch (err) {
                    console.error('Overview load error:', err);
                }
            }

            function renderMessagesInbox() {
                const container = document.getElementById('message-inbox-list');
                if (!container) return;
                container.innerHTML = '';

                if (currentMessages.length === 0) {
                    container.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-muted);">No messages yet.</div>`;
                    return;
                }

                const sorted = [...currentMessages].sort((a, b) => {
                    if (a.read === b.read) return new Date(b.timestamp) - new Date(a.timestamp);
                    return a.read ? 1 : -1;
                });

                sorted.forEach(msg => {
                            const date = new Date(msg.timestamp).toLocaleString();
                            container.insertAdjacentHTML('beforeend', `
        <div class="glass-card message-item ${msg.read ? '' : 'unread'}">
          <div class="message-header">
            <div>
              <span class="message-sender">${msg.name}</span>
              <span style="color:var(--text-muted); font-size:0.85rem; margin-left:8px;">&lt;${msg.email}&gt;</span>
            </div>
            <span class="message-meta">${date}</span>
          </div>
          <div style="font-weight:600; margin-bottom:8px; font-size:0.95rem; color:var(--accent-cyan);">${msg.subject}</div>
          <p class="message-body">${msg.message}</p>
          <div class="message-actions">
            ${!msg.read
              ? `<button onclick="markMessageRead('${msg.id}')" class="crud-btn edit" style="padding:6px 16px;">Mark Read</button>`
              : `<span style="color:var(--accent-emerald); font-size:0.8rem; font-weight:600;">✓ Read</span>`}
            <button onclick="deleteMessage('${msg.id}')" class="crud-btn delete" style="padding:6px 16px; margin-left:auto;">Delete</button>
          </div>
        </div>
      `);
    });
  }

  window.markMessageRead = async id => {
    await fetch(`${API_URL}/api/contact/messages/${id}/read`, { method: 'PUT', headers: authHeader });
    loadOverviewData();
  };

  window.deleteMessage = async id => {
    if (!confirm('Delete this message?')) return;
    await fetch(`${API_URL}/api/contact/messages/${id}`, { method: 'DELETE', headers: authHeader });
    loadOverviewData();
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2: PROJECTS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  async function loadProjectsCRUD() {
    const res = await fetch(`${API_URL}/api/projects`);
    currentProjects = await res.json();
    renderProjectsTable();
  }

  function renderProjectsTable() {
    const tbody = document.getElementById('projects-crud-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!currentProjects.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No projects yet.</td></tr>`;
      return;
    }

    currentProjects.forEach((p, i) => {
      tbody.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${p.image}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; border:1px solid rgba(255,255,255,0.05);">
              <div>
                <div style="font-weight:600;">${p.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">${p.category}</div>
              </div>
            </div>
          </td>
          <td>${p.tags.slice(0,3).join(', ')}${p.tags.length > 3 ? '…' : ''}</td>
          <td><span style="color:${p.featured ? 'var(--accent-purple)' : 'var(--text-muted)'}; font-weight:600;">${p.featured ? '★ Featured' : 'Standard'}</span></td>
          <td>
            <div style="display:flex; gap:8px;">
              <button onclick="openEditProjectModal('${p.id}')" class="crud-btn edit">Edit</button>
              <button onclick="deleteProject('${p.id}')"        class="crud-btn delete">Delete</button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  const projListPanel = document.getElementById('project-list-panel');
  const projFormPanel = document.getElementById('project-form-panel');
  const projForm      = document.getElementById('project-crud-form');
  const projFormTitle = document.getElementById('project-form-heading');

  window.openCreateProjectForm = () => {
    editingProjectId = null;
    projForm.reset();
    projFormTitle.textContent = 'New Project';
    projListPanel.style.display = 'none';
    projFormPanel.style.display = 'block';
  };

  window.closeProjectForm = () => {
    projFormPanel.style.display = 'none';
    projListPanel.style.display = 'block';
  };

  window.openEditProjectModal = id => {
    const p = currentProjects.find(x => x.id === id);
    if (!p) return;
    editingProjectId = id;
    projFormTitle.textContent = `Edit: ${p.title}`;
    document.getElementById('proj-title').value    = p.title;
    document.getElementById('proj-title-ar').value = p.title_ar || '';
    document.getElementById('proj-category').value = p.category;
    document.getElementById('proj-image').value    = p.image;
    document.getElementById('proj-tags').value     = p.tags.join(', ');
    document.getElementById('proj-demo').value     = p.demoUrl;
    document.getElementById('proj-github').value   = p.githubUrl;
    document.getElementById('proj-featured').checked = p.featured === true;
    document.getElementById('proj-desc').value     = p.description;
    document.getElementById('proj-desc-ar').value  = p.description_ar || '';
    document.getElementById('proj-long-desc').value = p.longDescription || '';
    document.getElementById('proj-long-desc-ar').value = p.longDescription_ar || '';
    document.getElementById('proj-features').value = p.features ? p.features.join('\n') : '';
    document.getElementById('proj-features-ar').value = p.features_ar ? p.features_ar.join('\n') : '';
    projListPanel.style.display = 'none';
    projFormPanel.style.display = 'block';
  };

  if (projForm) {
    projForm.addEventListener('submit', async e => {
      e.preventDefault();

      // Handle image file upload
      let imageUrl = document.getElementById('proj-image').value.trim();
      const imageFile = document.getElementById('proj-image-file').files[0];

      if (imageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        try {
          imageUrl = await base64Promise;
        } catch (err) {
          alert('فشل في تحويل الصورة');
          return;
        }
      }

      const payload = {
        title:              document.getElementById('proj-title').value.trim(),
        title_ar:           document.getElementById('proj-title-ar').value.trim(),
        category:           document.getElementById('proj-category').value,
        image:              imageUrl,
        tags:               document.getElementById('proj-tags').value.split(',').map(t => t.trim()).filter(Boolean),
        demoUrl:            document.getElementById('proj-demo').value.trim(),
        githubUrl:          document.getElementById('proj-github').value.trim(),
        featured:           document.getElementById('proj-featured').checked,
        description:        document.getElementById('proj-desc').value.trim(),
        description_ar:     document.getElementById('proj-desc-ar').value.trim(),
        longDescription:    document.getElementById('proj-long-desc').value.trim(),
        longDescription_ar: document.getElementById('proj-long-desc-ar').value.trim(),
        features:           document.getElementById('proj-features').value.split('\n').map(f => f.trim()).filter(Boolean),
        features_ar:        document.getElementById('proj-features-ar').value.split('\n').map(f => f.trim()).filter(Boolean)
      };
      const url    = editingProjectId ? `${API_URL}/api/projects/${editingProjectId}` : `${API_URL}/api/projects`;
      const method = editingProjectId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: authHeader, body: JSON.stringify(payload) });
      if (res.ok) { closeProjectForm(); loadProjectsCRUD(); }
      else {
        const err = await res.json().catch(() => ({}));
        alert('❌ Failed to save project: ' + (err.error || res.statusText));
      }
    });
  }

  window.deleteProject = async id => {
    if (!confirm('Delete this project?')) return;
    await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE', headers: authHeader });
    loadProjectsCRUD();
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3: YOUTUBE CRUD
  // ══════════════════════════════════════════════════════════════════════════
  async function loadYTCRUD() {
    const res = await fetch(`${API_URL}/api/youtube`);
    currentYT = await res.json();
    renderYTList();
  }

  function renderYTList() {
    const container = document.getElementById('yt-list-items');
    if (!container) return;
    container.innerHTML = '';

    if (!currentYT.length) {
      container.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-muted);">No YouTube videos yet. Click "+ Add Video" to get started.</div>`;
      return;
    }

    currentYT.forEach(vid => {
      container.insertAdjacentHTML('beforeend', `
        <div class="yt-admin-item">
          <img src="${vid.thumbnail}" alt="${vid.title}" class="yt-admin-thumb" onerror="this.style.background='#1a1a2e';">
          <div>
            <div style="font-weight:600; margin-bottom:4px; font-size:0.95rem;">${vid.title}</div>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              <span style="font-size:0.78rem; color:var(--accent-purple); font-weight:700; text-transform:uppercase;">${vid.category}</span>
              <span style="font-size:0.78rem; color:var(--text-muted);">${vid.views}</span>
            </div>
          </div>
          <div style="display:flex; gap:8px; flex-shrink:0;">
            <button onclick="editYT('${vid.id}')"   class="crud-btn edit">Edit</button>
            <button onclick="deleteYT('${vid.id}')" class="crud-btn delete">Delete</button>
          </div>
        </div>
      `);
    });
  }

  const ytListPanel  = document.getElementById('yt-list-panel');
  const ytFormPanel  = document.getElementById('yt-form-panel');
  const ytForm       = document.getElementById('yt-crud-form');
  const ytFormTitle  = document.getElementById('yt-form-heading');

  window.openYTForm = () => {
    editingYTId = null;
    ytForm.reset();
    ytFormTitle.textContent = 'Add YouTube Video';
    ytListPanel.style.display = 'none';
    ytFormPanel.style.display = 'block';
  };

  window.closeYTForm = () => {
    ytFormPanel.style.display = 'none';
    ytListPanel.style.display = 'block';
  };

  window.editYT = id => {
    const v = currentYT.find(x => x.id === id);
    if (!v) return;
    editingYTId = id;
    ytFormTitle.textContent = `Edit: ${v.title}`;
    document.getElementById('yt-title').value     = v.title;
    document.getElementById('yt-title-ar').value  = v.title_ar || '';
    document.getElementById('yt-url').value       = v.url;
    document.getElementById('yt-thumbnail').value = v.thumbnail;
    document.getElementById('yt-views').value     = v.views;
    document.getElementById('yt-category').value  = v.category;
    document.getElementById('yt-desc').value      = v.description || '';
    document.getElementById('yt-desc-ar').value   = v.description_ar || '';
    ytListPanel.style.display = 'none';
    ytFormPanel.style.display = 'block';
  };

  if (ytForm) {
    ytForm.addEventListener('submit', async e => {
      e.preventDefault();

      // Handle thumbnail file upload
      let thumbnailUrl = document.getElementById('yt-thumbnail').value.trim();
      const thumbnailFile = document.getElementById('yt-thumbnail-file').files[0];

      if (thumbnailFile) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(thumbnailFile);
        });
        try {
          thumbnailUrl = await base64Promise;
        } catch (err) {
          alert('فشل في تحويل الصورة');
          return;
        }
      }

      const payload = {
        title:          document.getElementById('yt-title').value.trim(),
        title_ar:       document.getElementById('yt-title-ar').value.trim(),
        url:            document.getElementById('yt-url').value.trim(),
        thumbnail:      thumbnailUrl,
        views:          document.getElementById('yt-views').value.trim(),
        category:       document.getElementById('yt-category').value.trim(),
        description:    document.getElementById('yt-desc').value.trim(),
        description_ar: document.getElementById('yt-desc-ar').value.trim()
      };
      const url    = editingYTId ? `${API_URL}/api/youtube/${editingYTId}` : `${API_URL}/api/youtube`;
      const method = editingYTId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: authHeader, body: JSON.stringify(payload) });
      if (res.ok) { closeYTForm(); loadYTCRUD(); }
      else {
        const err = await res.json().catch(() => ({}));
        alert('❌ Failed to save video: ' + (err.error || res.statusText));
      }
    });
  }

  window.deleteYT = async id => {
    if (!confirm('Delete this YouTube video?')) return;
    await fetch(`${API_URL}/api/youtube/${id}`, { method: 'DELETE', headers: authHeader });
    loadYTCRUD();
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 4: CERTIFICATES CRUD
  // ══════════════════════════════════════════════════════════════════════════
  async function loadCertsCRUD() {
    const res = await fetch(`${API_URL}/api/certificates`);
    currentCerts = await res.json();
    renderCertsList();
  }

  function renderCertsList() {
    const container = document.getElementById('cert-list-items');
    if (!container) return;
    container.innerHTML = '';

    if (!currentCerts.length) {
      container.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-muted);">No certificates yet. Click "+ Add Certificate" to get started.</div>`;
      return;
    }

    currentCerts.forEach(cert => {
      container.insertAdjacentHTML('beforeend', `
        <div class="cert-admin-item">
          <img src="${cert.image}" alt="${cert.title}" class="cert-admin-thumb" onerror="this.style.background='#1a1a2e';">
          <div>
            <div style="font-weight:600; margin-bottom:4px; font-size:0.95rem;">${cert.title}</div>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              <span style="font-size:0.78rem; color:var(--accent-purple); font-weight:700; text-transform:uppercase;">${cert.issuer}</span>
              <span style="font-size:0.78rem; color:var(--accent-cyan); font-weight:600;">${cert.year}</span>
            </div>
          </div>
          <div style="display:flex; gap:8px; flex-shrink:0;">
            <button onclick="editCert('${cert.id}')"   class="crud-btn edit">Edit</button>
            <button onclick="deleteCert('${cert.id}')" class="crud-btn delete">Delete</button>
          </div>
        </div>
      `);
    });
  }

  const certListPanel = document.getElementById('cert-list-panel');
  const certFormPanel = document.getElementById('cert-form-panel');
  const certForm      = document.getElementById('cert-crud-form');
  const certFormTitle = document.getElementById('cert-form-heading');

  window.openCertForm = () => {
    editingCertId = null;
    certForm.reset();
    certFormTitle.textContent = 'Add Certificate';
    certListPanel.style.display = 'none';
    certFormPanel.style.display = 'block';
  };

  window.closeCertForm = () => {
    certFormPanel.style.display = 'none';
    certListPanel.style.display = 'block';
  };

  window.editCert = id => {
    const c = currentCerts.find(x => x.id === id);
    if (!c) return;
    editingCertId = id;
    certFormTitle.textContent = `Edit: ${c.title}`;
    document.getElementById('cert-title').value     = c.title;
    document.getElementById('cert-title-ar').value  = c.title_ar || '';
    document.getElementById('cert-issuer').value    = c.issuer;
    document.getElementById('cert-issuer-ar').value = c.issuer_ar || '';
    document.getElementById('cert-year').value      = c.year;
    document.getElementById('cert-image').value     = c.image;
    document.getElementById('cert-desc').value      = c.description;
    document.getElementById('cert-desc-ar').value   = c.description_ar || '';
    certListPanel.style.display = 'none';
    certFormPanel.style.display = 'block';
  };

  if (certForm) {
    certForm.addEventListener('submit', async e => {
      e.preventDefault();

      // Handle certificate image file upload
      let certImageUrl = document.getElementById('cert-image').value.trim();
      const certImageFile = document.getElementById('cert-image-file').files[0];

      if (certImageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(certImageFile);
        });
        try {
          certImageUrl = await base64Promise;
        } catch (err) {
          alert('فشل في تحويل الصورة');
          return;
        }
      }

      const payload = {
        title:          document.getElementById('cert-title').value.trim(),
        title_ar:       document.getElementById('cert-title-ar').value.trim(),
        issuer:         document.getElementById('cert-issuer').value.trim(),
        issuer_ar:      document.getElementById('cert-issuer-ar').value.trim(),
        year:           document.getElementById('cert-year').value.trim(),
        image:          certImageUrl,
        description:    document.getElementById('cert-desc').value.trim(),
        description_ar: document.getElementById('cert-desc-ar').value.trim()
      };
      const url    = editingCertId ? `${API_URL}/api/certificates/${editingCertId}` : `${API_URL}/api/certificates`;
      const method = editingCertId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: authHeader, body: JSON.stringify(payload) });
      if (res.ok) { closeCertForm(); loadCertsCRUD(); }
      else {
        const err = await res.json().catch(() => ({}));
        alert('❌ Failed to save certificate: ' + (err.error || res.statusText));
      }
    });
  }

  window.deleteCert = async id => {
    if (!confirm('Delete this certificate?')) return;
    await fetch(`${API_URL}/api/certificates/${id}`, { method: 'DELETE', headers: authHeader });
    loadCertsCRUD();
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 5: SETTINGS (profile, skills, achievements, timeline)
  // ══════════════════════════════════════════════════════════════════════════
  async function loadSettingsEditor() {
    const res = await fetch(`${API_URL}/api/settings`);
    currentSettings = await res.json();

    const info = currentSettings.personalInfo || {};
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('set-name',        info.name);
    setVal('set-name-ar',     info.name_ar);
    setVal('set-title',       info.title);
    setVal('set-title-ar',    info.title_ar);
    setVal('set-avatar',      info.avatar);
    setVal('set-resume',      info.resumeUrl);
    setVal('set-location',    info.location);
    setVal('set-location-ar', info.location_ar);
    setVal('set-email',       info.email);
    setVal('set-whatsapp',    info.whatsapp);
    setVal('set-github',      info.githubUrl);
    setVal('set-linkedin',    info.linkedinUrl);
    setVal('set-youtube',     info.youtubeUrl);
    setVal('set-facebook',    info.facebookUrl);
    setVal('set-instagram',   info.instagramUrl);
    setVal('set-telegram',    info.telegramUrl);
    setVal('set-bio',         info.bio);
    setVal('set-bio-ar',      info.bio_ar);

    // Load stats
    const stats = info.stats || {};
    setVal('stats-students',  stats.students);
    setVal('stats-tutorials', stats.tutorials);
    setVal('stats-views',     stats.views);

    // Load YouTube section
    const yt = info.youtube || {};
    setVal('yt-section-title',     yt.title);
    setVal('yt-section-title-ar',  yt.title_ar);
    setVal('yt-section-desc',      yt.description);
    setVal('yt-section-desc-ar',   yt.description_ar);
    setVal('yt-badge-image',       yt.badgeImage);

    renderSkillsEditor();
    renderAchievementsEditor();
    renderTimelineEditor();
    renderLanguagesEditor();
    renderTestimonialsEditor();
  }

  // ── Personal Info Save ─────────────────────────────────────────────────────
  const settingsForm = document.getElementById('personal-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async e => {
      e.preventDefault();

      // Handle avatar file upload
      let avatarUrl = document.getElementById('set-avatar').value.trim();
      const avatarFile = document.getElementById('set-avatar-file').files[0];

      if (avatarFile) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
        try {
          avatarUrl = await base64Promise;
        } catch (err) {
          alert('فشل في تحويل الصورة');
          return;
        }
      }

      const payload = {
        name:         document.getElementById('set-name').value.trim(),
        name_ar:      document.getElementById('set-name-ar').value.trim(),
        title:        document.getElementById('set-title').value.trim(),
        title_ar:     document.getElementById('set-title-ar').value.trim(),
        avatar:       avatarUrl,
        resumeUrl:    document.getElementById('set-resume').value.trim(),
        location:     document.getElementById('set-location').value.trim(),
        location_ar:  document.getElementById('set-location-ar').value.trim(),
        email:        document.getElementById('set-email').value.trim(),
        whatsapp:     document.getElementById('set-whatsapp').value.trim(),
        githubUrl:    document.getElementById('set-github').value.trim(),
        linkedinUrl:  document.getElementById('set-linkedin').value.trim(),
        youtubeUrl:   document.getElementById('set-youtube').value.trim(),
        facebookUrl:  document.getElementById('set-facebook').value.trim(),
        instagramUrl: document.getElementById('set-instagram').value.trim(),
        telegramUrl:  document.getElementById('set-telegram').value.trim(),
        bio:          document.getElementById('set-bio').value.trim(),
        bio_ar:       document.getElementById('set-bio-ar').value.trim(),
        stats: {
          students:  document.getElementById('stats-students').value.trim(),
          tutorials: document.getElementById('stats-tutorials').value.trim(),
          views:     document.getElementById('stats-views').value.trim()
        }
      };
      const res = await fetch(`${API_URL}/api/settings`, { method: 'POST', headers: authHeader, body: JSON.stringify(payload) });
      if (res.ok) {
        alert('✓ Profile saved successfully!');
        window.location.reload();
      }
      else {
        const errorData = await res.json();
        alert('❌ Error: ' + (errorData.error || 'Failed to save profile'));
      }
    });
  }

  // ── Stats Save ─────────────────────────────────────────────────────────────
  const statsForm = document.getElementById('stats-settings-form');
  if (statsForm) {
    statsForm.addEventListener('submit', async e => {
      e.preventDefault();

      const info = currentSettings.personalInfo || {};
      const payload = {
        name:         info.name,
        name_ar:      info.name_ar,
        title:        info.title,
        title_ar:     info.title_ar,
        avatar:       info.avatar,
        resumeUrl:    info.resumeUrl,
        location:     info.location,
        location_ar:  info.location_ar,
        email:        info.email,
        whatsapp:     info.whatsapp,
        githubUrl:    info.githubUrl,
        linkedinUrl:  info.linkedinUrl,
        youtubeUrl:   info.youtubeUrl,
        facebookUrl:  info.facebookUrl,
        instagramUrl: info.instagramUrl,
        telegramUrl:  info.telegramUrl,
        bio:          info.bio,
        bio_ar:       info.bio_ar,
        stats: {
          students:  document.getElementById('stats-students').value.trim(),
          tutorials: document.getElementById('stats-tutorials').value.trim(),
          views:     document.getElementById('stats-views').value.trim()
        }
      };
      const res = await fetch(`${API_URL}/api/settings`, { method: 'POST', headers: authHeader, body: JSON.stringify(payload) });
      if (res.ok) alert('✓ Stats updated successfully!');
      else        alert('Failed to update stats.');
    });
  }

  // ── YouTube Section Save ─────────────────────────────────────────────────────
  const ytSectionForm = document.getElementById('youtube-settings-form');
  if (ytSectionForm) {
    ytSectionForm.addEventListener('submit', async e => {
      e.preventDefault();

      // Handle badge image file upload
      let badgeImageUrl = document.getElementById('yt-badge-image').value.trim();
      const badgeImageFile = document.getElementById('yt-badge-image-file').files[0];

      if (badgeImageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(badgeImageFile);
        });
        try {
          badgeImageUrl = await base64Promise;
        } catch (err) {
          alert('فشل في تحويل الصورة');
          return;
        }
      }

      const info = currentSettings.personalInfo || {};
      const payload = {
        name:         info.name,
        name_ar:      info.name_ar,
        title:        info.title,
        title_ar:     info.title_ar,
        avatar:       info.avatar,
        resumeUrl:    info.resumeUrl,
        location:     info.location,
        location_ar:  info.location_ar,
        email:        info.email,
        whatsapp:     info.whatsapp,
        githubUrl:    info.githubUrl,
        linkedinUrl:  info.linkedinUrl,
        youtubeUrl:   info.youtubeUrl,
        facebookUrl:  info.facebookUrl,
        instagramUrl: info.instagramUrl,
        telegramUrl:  info.telegramUrl,
        bio:          info.bio,
        bio_ar:       info.bio_ar,
        stats:        info.stats || {},
        youtube: {
          title:          document.getElementById('yt-section-title').value.trim(),
          title_ar:       document.getElementById('yt-section-title-ar').value.trim(),
          description:    document.getElementById('yt-section-desc').value.trim(),
          description_ar: document.getElementById('yt-section-desc-ar').value.trim(),
          badgeImage:     badgeImageUrl
        }
      };
      const res = await fetch(`${API_URL}/api/settings`, { method: 'POST', headers: authHeader, body: JSON.stringify(payload) });
      if (res.ok) alert('✓ YouTube section updated successfully!');
      else        alert('Failed to update YouTube section.');
    });
  }

  // ── Skills Editor ──────────────────────────────────────────────────────────
  function syncSkillsFromDOM() {
    if (!currentSettings.skills) currentSettings.skills = [];
    const names   = [...document.querySelectorAll('.skill-name-inp')];
    const namesAr = [...document.querySelectorAll('.skill-name-ar-inp')];
    const cats    = [...document.querySelectorAll('.skill-cat-inp')];
    const levels  = [...document.querySelectorAll('.skill-level-inp')];
    currentSettings.skills = names.map((n, i) => ({
      id:       (currentSettings.skills[i] && currentSettings.skills[i].id) || 's_' + Date.now() + '_' + i,
      name:     n.value.trim(),
      name_ar:  namesAr[i].value.trim(),
      category: cats[i].value,
      level:    parseInt(levels[i].value) || 0
    }));
  }

  function renderSkillsEditor() {
    const listEl = document.getElementById('skills-editor-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    (currentSettings.skills || []).forEach((skill, idx) => {
      listEl.innerHTML += `
        <div class="list-editor-item" style="flex-wrap: wrap; gap: 8px;">
          <input type="text"   value="${skill.name}"  placeholder="Skill Name (EN)" class="form-input skill-name-inp" style="flex:2; min-width: 150px;" required>
          <input type="text"   value="${skill.name_ar || ''}"  placeholder="اسم المهارة (AR)" class="form-input skill-name-ar-inp" style="flex:2; min-width: 150px;" required>
          <select class="form-input skill-cat-inp" style="flex:1; min-width: 100px;">
            <option value="dev" ${skill.category === 'dev' ? 'selected' : ''}>Programming &amp; Dev</option>
            <option value="networking"  ${skill.category === 'networking'  ? 'selected' : ''}>Networks &amp; Cloud</option>
            <option value="ai"    ${skill.category === 'ai'    ? 'selected' : ''}>AI &amp; ML</option>
            <option value="cybersecurity"    ${skill.category === 'cybersecurity'    ? 'selected' : ''}>Cyber Security</option>
          </select>
          <input type="number" value="${skill.level}" min="0" max="100" placeholder="%" class="form-input skill-level-inp" style="flex:0.8; min-width: 70px;" required>
          <button type="button" onclick="removeSkillRow(${idx})" class="crud-btn delete" style="padding:10px 14px;">✕</button>
        </div>
      `;
    });
  }

  window.addSkillRow = () => {
    syncSkillsFromDOM();
    if (!currentSettings.skills) currentSettings.skills = [];
    currentSettings.skills.push({ name: '', name_ar: '', category: 'dev', level: 85 });
    renderSkillsEditor();
  };

  window.removeSkillRow = idx => {
    syncSkillsFromDOM();
    currentSettings.skills.splice(idx, 1);
    renderSkillsEditor();
  };

  const skillsForm = document.getElementById('skills-settings-form');
  if (skillsForm) {
    skillsForm.addEventListener('submit', async e => {
      e.preventDefault();
      syncSkillsFromDOM();
      const res = await fetch(`${API_URL}/api/settings/skills`, { method: 'POST', headers: authHeader, body: JSON.stringify({ skills: currentSettings.skills }) });
      if (res.ok) { alert('✓ Skills updated!'); loadSettingsEditor(); }
      else {
        const err = await res.json().catch(() => ({}));
        alert('❌ Failed to update skills: ' + (err.error || res.statusText));
      }
    });
  }

  // ── Achievements Editor ────────────────────────────────────────────────────
  function syncAchievementsFromDOM() {
    if (!currentSettings.achievements) currentSettings.achievements = [];
    const titles    = [...document.querySelectorAll('.ach-title-inp')];
    const titlesAr  = [...document.querySelectorAll('.ach-title-ar-inp')];
    const issuers   = [...document.querySelectorAll('.ach-issuer-inp')];
    const issuersAr = [...document.querySelectorAll('.ach-issuer-ar-inp')];
    const years     = [...document.querySelectorAll('.ach-year-inp')];
    const icons     = [...document.querySelectorAll('.ach-icon-inp')];
    currentSettings.achievements = titles.map((t, i) => ({
      id:        (currentSettings.achievements[i] && currentSettings.achievements[i].id) || 'a_' + Date.now() + '_' + i,
      title:     t.value.trim(),
      title_ar:  titlesAr[i].value.trim(),
      issuer:    issuers[i].value.trim(),
      issuer_ar: issuersAr[i].value.trim(),
      year:      years[i].value.trim(),
      icon:      icons[i].value
    }));
  }

  function renderAchievementsEditor() {
    const listEl = document.getElementById('achievements-editor-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    (currentSettings.achievements || []).forEach((ach, idx) => {
      listEl.innerHTML += `
        <div class="list-editor-item" style="flex-wrap: wrap; gap: 8px;">
          <input type="text" value="${ach.title}"  placeholder="Honor Title (EN)"  class="form-input ach-title-inp"  style="flex:2; min-width: 150px;" required>
          <input type="text" value="${ach.title_ar || ''}"  placeholder="العنوان (AR)"  class="form-input ach-title-ar-inp"  style="flex:2; min-width: 150px;" required>
          <input type="text" value="${ach.issuer}" placeholder="Issuer (EN)"       class="form-input ach-issuer-inp" style="flex:1.5; min-width: 120px;" required>
          <input type="text" value="${ach.issuer_ar || ''}" placeholder="الجهة (AR)"       class="form-input ach-issuer-ar-inp" style="flex:1.5; min-width: 120px;" required>
          <input type="text" value="${ach.year}"   placeholder="Year"         class="form-input ach-year-inp"   style="flex:0.8; min-width: 70px;" required>
          <select class="form-input ach-icon-inp" style="flex:0.8; min-width: 100px;">
            <option value="award"  ${ach.icon === 'award'  ? 'selected' : ''}>🏆 Award</option>
            <option value="shield" ${ach.icon === 'shield' ? 'selected' : ''}>🛡️ Shield</option>
            <option value="cpu"    ${ach.icon === 'cpu'    ? 'selected' : ''}>💻 Code</option>
          </select>
          <button type="button" onclick="removeAchRow(${idx})" class="crud-btn delete" style="padding:10px 14px;">✕</button>
        </div>
      `;
    });
  }

  window.addAchRow = () => {
    syncAchievementsFromDOM();
    if (!currentSettings.achievements) currentSettings.achievements = [];
    currentSettings.achievements.push({ title: '', title_ar: '', issuer: '', issuer_ar: '', year: String(new Date().getFullYear()), icon: 'award' });
    renderAchievementsEditor();
  };

  window.removeAchRow = idx => { 
    syncAchievementsFromDOM();
    currentSettings.achievements.splice(idx, 1); 
    renderAchievementsEditor(); 
  };

  const achForm = document.getElementById('ach-settings-form');
  if (achForm) {
    achForm.addEventListener('submit', async e => {
      e.preventDefault();
      syncAchievementsFromDOM();
      const res = await fetch(`${API_URL}/api/settings/achievements`, { method: 'POST', headers: authHeader, body: JSON.stringify({ achievements: currentSettings.achievements }) });
      if (res.ok) { alert('✓ Honors updated!'); loadSettingsEditor(); }
      else {
        const err = await res.json().catch(() => ({}));
        alert('❌ Failed to update honors: ' + (err.error || res.statusText));
      }
    });
  }

  // ── Timeline Editor ────────────────────────────────────────────────────────
  function syncTimelineFromDOM() {
    if (!currentSettings.timeline) currentSettings.timeline = [];
    const types       = [...document.querySelectorAll('.time-type-inp')];
    const durations   = [...document.querySelectorAll('.time-duration-inp')];
    const roles       = [...document.querySelectorAll('.time-role-inp')];
    const rolesAr     = [...document.querySelectorAll('.time-role-ar-inp')];
    const companies   = [...document.querySelectorAll('.time-company-inp')];
    const companiesAr = [...document.querySelectorAll('.time-company-ar-inp')];
    const descs       = [...document.querySelectorAll('.time-desc-inp')];
    const descsAr     = [...document.querySelectorAll('.time-desc-ar-inp')];
    currentSettings.timeline = types.map((t, i) => ({
      id:             (currentSettings.timeline[i] && currentSettings.timeline[i].id) || 't_' + Date.now() + '_' + i,
      type:           t.value,
      duration:       durations[i].value.trim(),
      role:           roles[i].value.trim(),
      role_ar:        rolesAr[i].value.trim(),
      company:        companies[i].value.trim(),
      company_ar:     companiesAr[i].value.trim(),
      description:    descs[i].value.trim(),
      description_ar: descsAr[i].value.trim()
    }));
  }

  function renderTimelineEditor() {
    const listEl = document.getElementById('timeline-editor-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    (currentSettings.timeline || []).forEach((item, idx) => {
      listEl.innerHTML += `
        <div style="border:1px solid rgba(255,255,255,0.03); padding:20px; border-radius:12px; margin-bottom:16px; background:rgba(0,0,0,0.2);">
          <div class="list-editor-item" style="margin-bottom:12px;">
            <select class="form-input time-type-inp" style="flex:1;">
              <option value="experience" ${item.type === 'experience' ? 'selected' : ''}>💼 Work Experience</option>
              <option value="education"  ${item.type === 'education'  ? 'selected' : ''}>🎓 Education</option>
            </select>
            <input type="text" value="${item.duration}" placeholder="2021 - Present" class="form-input time-duration-inp" style="flex:1.5;" required>
            <button type="button" onclick="removeTimelineRow(${idx})" class="crud-btn delete" style="padding:10px 14px;">Remove</button>
          </div>
          <div class="list-editor-item" style="margin-bottom:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <input type="text" value="${item.role}"          placeholder="Role / Degree (EN)"           class="form-input time-role-inp" required>
            <input type="text" value="${item.role_ar || ''}" placeholder="الدور / الشهادة (AR)"         class="form-input time-role-ar-inp" required>
          </div>
          <div class="list-editor-item" style="margin-bottom:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <input type="text" value="${item.company}"          placeholder="Company / Institution (EN)"   class="form-input time-company-inp" required>
            <input type="text" value="${item.company_ar || ''}" placeholder="الشركة / المؤسسة (AR)"         class="form-input time-company-ar-inp" required>
          </div>
          <div class="list-editor-item" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <textarea placeholder="Description of responsibilities (EN)..." class="form-input time-desc-inp" rows="3" required>${item.description}</textarea>
            <textarea placeholder="الوصف والمسؤوليات (AR)..." class="form-input time-desc-ar-inp" rows="3" required>${item.description_ar || ''}</textarea>
          </div>
        </div>
      `;
    });
  }

  window.addTimelineRow = () => {
    syncTimelineFromDOM();
    if (!currentSettings.timeline) currentSettings.timeline = [];
    currentSettings.timeline.push({ type: 'experience', duration: '', role: '', role_ar: '', company: '', company_ar: '', description: '', description_ar: '' });
    renderTimelineEditor();
  };

  window.removeTimelineRow = idx => { 
    syncTimelineFromDOM();
    currentSettings.timeline.splice(idx, 1); 
    renderTimelineEditor(); 
  };

  const timelineForm = document.getElementById('timeline-settings-form');
  if (timelineForm) {
    timelineForm.addEventListener('submit', async e => {
      e.preventDefault();
      syncTimelineFromDOM();
      const res = await fetch(`${API_URL}/api/settings/timeline`, { method: 'POST', headers: authHeader, body: JSON.stringify({ timeline: currentSettings.timeline }) });
      if (res.ok) { alert('✓ Timeline updated!'); loadSettingsEditor(); }
      else {
        const err = await res.json().catch(() => ({}));
        alert('❌ Failed to update timeline: ' + (err.error || res.statusText));
      }
    });
  }

  // ── Languages Editor ───────────────────────────────────────────────────────
  function syncLanguagesFromDOM() {
    if (!currentSettings.languages) currentSettings.languages = [];
    const names   = [...document.querySelectorAll('.lang-name-inp')];
    const namesAr = [...document.querySelectorAll('.lang-name-ar-inp')];
    const levels  = [...document.querySelectorAll('.lang-level-inp')];
    const colors  = [...document.querySelectorAll('.lang-color-inp')];
    const icons   = [...document.querySelectorAll('.lang-icon-inp')];
    const cats    = [...document.querySelectorAll('.lang-cat-inp')];
    currentSettings.languages = names.map((n, i) => ({
      id:       (currentSettings.languages[i] && currentSettings.languages[i].id) || 'l_' + Date.now() + '_' + i,
      name:     n.value.trim(),
      name_ar:  namesAr[i].value.trim(),
      level:    parseInt(levels[i].value) || 0,
      color:    colors[i].value.trim(),
      icon:     icons[i].value.trim(),
      category: cats[i] ? cats[i].value : 'backend'
    }));
  }

  function renderLanguagesEditor() {
    const listEl = document.getElementById('languages-editor-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    (currentSettings.languages || []).forEach((lang, idx) => {
      listEl.innerHTML += `
        <div class="list-editor-item" style="flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
          <input type="text"   value="${lang.name}"  placeholder="Language Name (EN)" class="form-input lang-name-inp" style="flex:2; min-width: 150px;" required>
          <input type="text"   value="${lang.name_ar || ''}"  placeholder="اسم اللغة (AR)" class="form-input lang-name-ar-inp" style="flex:2; min-width: 150px;" required>
          <select class="form-input lang-cat-inp" style="flex:1.5; min-width: 130px;">
            <option value="frontend" ${lang.category === 'frontend' ? 'selected' : ''}>🎨 Frontend</option>
            <option value="backend" ${lang.category === 'backend' || !lang.category ? 'selected' : ''}>⚙️ Backend</option>
            <option value="mobile" ${lang.category === 'mobile' ? 'selected' : ''}>📱 Mobile Apps</option>
            <option value="systems" ${lang.category === 'systems' ? 'selected' : ''}>🛠️ Systems &amp; Tools</option>
          </select>
          <input type="number" value="${lang.level}" min="0" max="100" placeholder="Proficiency %" class="form-input lang-level-inp" style="flex:1; min-width: 100px;" required>
          <input type="text"   value="${lang.color || '#38bdf8'}" placeholder="Color (e.g. #38bdf8)" class="form-input lang-color-inp" style="flex:1.2; min-width: 120px;" required>
          <input type="text"   value="${lang.icon || '💻'}" placeholder="Emoji (e.g. ⚡)" class="form-input lang-icon-inp" style="flex:1; min-width: 80px;" required>
          <button type="button" onclick="removeLangRow(${idx})" class="crud-btn delete" style="padding:10px 14px;">✕</button>
        </div>
      `;
    });
  }

  window.addLangRow = () => {
    syncLanguagesFromDOM();
    if (!currentSettings.languages) currentSettings.languages = [];
    currentSettings.languages.push({ name: '', name_ar: '', level: 80, color: '#38bdf8', icon: '💻', category: 'backend' });
    renderLanguagesEditor();
  };

  window.removeLangRow = idx => {
    syncLanguagesFromDOM();
    currentSettings.languages.splice(idx, 1);
    renderLanguagesEditor();
  };

  const langsForm = document.getElementById('languages-settings-form');
  if (langsForm) {
    langsForm.addEventListener('submit', async e => {
      e.preventDefault();
      syncLanguagesFromDOM();
      const res = await fetch(`${API_URL}/api/settings/languages`, { method: 'POST', headers: authHeader, body: JSON.stringify({ languages: currentSettings.languages }) });
      if (res.ok) { alert('✓ Languages updated!'); loadSettingsEditor(); }
      else {
        const err = await res.json().catch(() => ({}));
        alert('❌ Failed to update languages: ' + (err.error || res.statusText));
      }
    });
  }

  // ── Testimonials Editor ────────────────────────────────────────────────────
  function syncTestimonialsFromDOM() {
    if (!currentSettings.testimonials) currentSettings.testimonials = [];
    const names      = [...document.querySelectorAll('.tst-name-inp')];
    const roles      = [...document.querySelectorAll('.tst-role-inp')];
    const companies  = [...document.querySelectorAll('.tst-company-inp')];
    const avatars    = [...document.querySelectorAll('.tst-avatar-inp')];
    const messages   = [...document.querySelectorAll('.tst-message-inp')];
    const messagesAr = [...document.querySelectorAll('.tst-message-ar-inp')];

    currentSettings.testimonials = names.map((n, i) => ({
      id:         (currentSettings.testimonials[i] && currentSettings.testimonials[i].id) || 'tst_' + Date.now() + '_' + i,
      name:       n.value.trim(),
      role:       roles[i].value.trim(),
      company:    companies[i].value.trim(),
      avatar:     avatars[i].value.trim(),
      message:    messages[i].value.trim(),
      message_ar: messagesAr[i].value.trim()
    }));
  }

  function renderTestimonialsEditor() {
    const listEl = document.getElementById('testimonials-editor-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    (currentSettings.testimonials || []).forEach((tst, idx) => {
      listEl.innerHTML += `
        <div class="list-editor-item" style="flex-direction: column; gap: 12px; margin-bottom: 24px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;">
          <div style="display: flex; gap: 12px;">
            <input type="text" value="${tst.name}" placeholder="Name" class="form-input tst-name-inp" style="flex:1;" required>
            <input type="text" value="${tst.role}" placeholder="Role" class="form-input tst-role-inp" style="flex:1;">
            <input type="text" value="${tst.company}" placeholder="Company" class="form-input tst-company-inp" style="flex:1;">
            <button type="button" onclick="removeTestimonialRow(${idx})" class="crud-btn delete" style="padding:10px 14px;">✕</button>
          </div>
          <input type="text" value="${tst.avatar}" placeholder="Avatar URL" class="form-input tst-avatar-inp">
          <textarea placeholder="Message (EN)" class="form-input tst-message-inp" rows="2" required>${tst.message}</textarea>
          <textarea placeholder="الرسالة (AR)" class="form-input tst-message-ar-inp" rows="2" required>${tst.message_ar || ''}</textarea>
        </div>
      `;
    });
  }

  window.addTestimonialRow = () => {
    syncTestimonialsFromDOM();
    if (!currentSettings.testimonials) currentSettings.testimonials = [];
    currentSettings.testimonials.push({ name: '', role: '', company: '', avatar: '', message: '', message_ar: '' });
    renderTestimonialsEditor();
  };

  window.removeTestimonialRow = idx => {
    syncTestimonialsFromDOM();
    currentSettings.testimonials.splice(idx, 1);
    renderTestimonialsEditor();
  };

  const tstForm = document.getElementById('testimonials-settings-form');
  if (tstForm) {
    tstForm.addEventListener('submit', async e => {
      e.preventDefault();
      syncTestimonialsFromDOM();
      const res = await fetch(`${API_URL}/api/settings/testimonials`, { method: 'POST', headers: authHeader, body: JSON.stringify({ testimonials: currentSettings.testimonials }) });
      if (res.ok) { alert('✓ Testimonials updated!'); loadSettingsEditor(); }
      else {
        const err = await res.json().catch(() => ({}));
        alert('❌ Failed to update testimonials: ' + (err.error || res.statusText));
      }
    });
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  loadOverviewData();
});