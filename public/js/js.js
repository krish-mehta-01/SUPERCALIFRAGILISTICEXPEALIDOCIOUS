const API_BASE = '';
let currentPage = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForms();
    loadDashboard();
    loadVehicles();
    loadOwners();
    loadInsurance();
    loadLogs();
});

function initNavigation() {
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.page));
    });
    document.getElementById('add-new-btn').addEventListener('click', () => showModal('vehicle'));
}

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');
    const titles = { dashboard: 'Dashboard', vehicles: 'Vehicles', owners: 'Owners', insurance: 'Insurance', verification: 'Verification', logs: 'Authorization Logs' };
    document.getElementById('page-title').textContent = titles[page];
    if (page === 'dashboard') loadDashboard();
    if (page === 'vehicles') loadVehicles();
    if (page === 'owners') loadOwners();
    if (page === 'insurance') loadInsurance();
    if (page === 'logs') loadLogs();
}

async function api(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, { headers: { 'Content-Type': 'application/json' }, ...options });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Request failed');
        return data;
    } catch (error) { showToast(error.message, 'error'); throw error; }
}

async function loadDashboard() {
    try {
        const stats = await api('/api/dashboard/stats');
        document.getElementById('stat-vehicles').textContent = stats.total_vehicles;
        document.getElementById('stat-owners').textContent = stats.total_owners;
        document.getElementById('stat-insurance').textContent = stats.active_insurances;
        document.getElementById('stat-auth').textContent = stats.successful_authorizations;
        const logs = await api('/api/logs/authorization');
        const tbody = document.querySelector('#recent-logs-table tbody');
        tbody.innerHTML = logs.logs.slice(0, 5).map(log => `<tr><td>${new Date(log.timestamp).toLocaleTimeString()}</td><td>${log.make || 'Unknown'} ${log.model || ''}</td><td>${log.action}</td><td><span class="status-badge status-${log.status}">${log.status}</span></td></tr>`).join('');
    } catch (e) { console.error('Dashboard error:', e); }
}

async function loadVehicles() {
    try {
        const data = await api('/api/vehicles');
        const tbody = document.querySelector('#vehicles-table tbody');
        tbody.innerHTML = data.vehicles.map(v => `<tr><td>${v.vehicle_id.substring(0, 8)}...</td><td>${v.registration_number}</td><td>${v.make} ${v.model}</td><td>${v.year}</td><td>${v.owner_name || 'Unassigned'}</td><td><span class="status-badge status-${v.status}">${v.status}</span></td><td><button class="btn btn-sm" onclick="alert('Vehicle: ${v.vehicle_id}')"><i class="fas fa-eye"></i></button></td></tr>`).join('');
        updateVehicleSelects(data.vehicles);
    } catch (e) { console.error('Vehicles error:', e); }
}

async function loadOwners() {
    try {
        const data = await api('/api/owners');
        const tbody = document.querySelector('#owners-table tbody');
        tbody.innerHTML = data.owners.map(o => `<tr><td>${o.owner_id.substring(0, 8)}...</td><td>${o.first_name} ${o.last_name}</td><td>${o.email}</td><td>${o.phone}</td><td><span class="status-badge status-${o.status}">${o.status}</span></td><td><button class="btn btn-sm" onclick="alert('Owner: ${o.owner_id}')"><i class="fas fa-eye"></i></button></td></tr>`).join('');
        const ownerSelect = document.getElementById('vehicle-owner-select');
        ownerSelect.innerHTML = '<option value="">Select Owner</option>' + data.owners.map(o => `<option value="${o.owner_id}">${o.first_name} ${o.last_name}</option>`).join('');
    } catch (e) { console.error('Owners error:', e); }
}

async function loadInsurance() {
    try {
        const vehicles = await api('/api/vehicles');
        let allInsurance = [];
        for (let v of vehicles.vehicles.slice(0, 5)) {
            try {
                const details = await api(`/api/vehicles/${v.vehicle_id}`);
                if (details.insurance && details.insurance.length > 0) {
                    allInsurance = allInsurance.concat(details.insurance.map(i => ({...i, vehicle: v})));
                }
            } catch (e) {}
        }
        const tbody = document.querySelector('#insurance-table tbody');
        tbody.innerHTML = allInsurance.map(i => `<tr><td>${i.policy_number}</td><td>${i.vehicle ? i.vehicle.make + ' ' + i.vehicle.model : 'Unknown'}</td><td>${i.provider_name}</td><td>${i.insurance_type}</td><td>${new Date(i.end_date).toLocaleDateString()}</td><td><span class="status-badge status-${i.status}">${i.status}</span></td></tr>`).join('');
    } catch (e) { console.error('Insurance error:', e); }
}

async function loadLogs() {
    try {
        const data = await api('/api/logs/authorization');
        const tbody = document.querySelector('#logs-table tbody');
        tbody.innerHTML = data.logs.map(log => `<tr><td>${new Date(log.timestamp).toLocaleString()}</td><td>${log.make || 'Unknown'} ${log.model || ''}</td><td>${log.platform_id}</td><td>${log.action}</td><td><span class="status-badge status-${log.status}">${log.status}</span></td><td>${log.details || '-'}</td></tr>`).join('');
    } catch (e) { console.error('Logs error:', e); }
}

function updateVehicleSelects(vehicles) {
    const select = document.getElementById('insurance-vehicle-select');
    if (select) select.innerHTML = '<option value="">Select Vehicle</option>' + vehicles.map(v => `<option value="${v.vehicle_id}">${v.make} ${v.model} (${v.registration_number})</option>`).join('');
}

function initForms() {
    document.getElementById('vehicle-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        try {
            await api('/api/vehicles', { method: 'POST', body: JSON.stringify(data) });
            showToast('Vehicle registered'); closeModal(); e.target.reset(); loadVehicles(); loadDashboard();
        } catch (e) {}
    });

    document.getElementById('owner-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        try {
            await api('/api/owners/register', { method: 'POST', body: JSON.stringify(data) });
            showToast('Owner registered'); closeModal(); e.target.reset(); loadOwners(); loadDashboard();
        } catch (e) {}
    });

    document.getElementById('insurance-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        try {
            await api('/api/insurance', { method: 'POST', body: JSON.stringify(data) });
            showToast('Insurance added'); closeModal(); e.target.reset(); loadInsurance(); loadDashboard();
        } catch (e) {}
    });

    document.getElementById('authorization-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const vehicleId = document.getElementById('auth-vehicle-id').value;
        const platformId = document.getElementById('auth-platform-id').value;
        const action = document.getElementById('auth-action').value;
        const resultDiv = document.getElementById('auth-result');
        try {
            const result = await api('/api/verify/authorization', { method: 'POST', body: JSON.stringify({ vehicle_id: vehicleId, platform_id: platformId, action: action }) });
            resultDiv.className = 'result-container success';
            resultDiv.innerHTML = `<h4><i class="fas fa-check-circle"></i> Authorized</h4><ul><li><strong>Vehicle:</strong> ${result.vehicle_id.substring(0, 8)}...</li><li><strong>Platform:</strong> ${result.platform_id}</li><li><strong>Action:</strong> ${result.action}</li><li><strong>Time:</strong> ${new Date(result.timestamp).toLocaleString()}</li></ul>`;
            loadLogs(); loadDashboard();
        } catch (error) {
            resultDiv.className = 'result-container error';
            resultDiv.innerHTML = `<h4><i class="fas fa-times-circle"></i> Not Authorized</h4><p>${error.message}</p>`;
        }
    });

    document.getElementById('identity-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const vehicleId = document.getElementById('id-vehicle-id').value;
        const ownerId = document.getElementById('id-owner-id').value;
        const resultDiv = document.getElementById('identity-result');
        try {
            const result = await api('/api/verify/identity', { method: 'POST', body: JSON.stringify({ vehicle_id: vehicleId, owner_id: ownerId }) });
            resultDiv.className = 'result-container success';
            resultDiv.innerHTML = `<h4><i class="fas fa-check-circle"></i> Identity Verified</h4><ul><li><strong>Vehicle:</strong> ${result.vehicle.make} ${result.vehicle.model}</li><li><strong>Registration:</strong> ${result.vehicle.registration_number}</li><li><strong>Owner:</strong> ${result.owner.name}</li><li><strong>Insurance Valid:</strong> ${result.insurance.valid ? 'Yes' : 'No'}</li></ul>`;
        } catch (error) {
            resultDiv.className = 'result-container error';
            resultDiv.innerHTML = `<h4><i class="fas fa-times-circle"></i> Verification Failed</h4><p>${error.message}</p>`;
        }
    });
}

function showModal(type) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    document.querySelectorAll('.modal-form').forEach(f => f.style.display = 'none');
    if (type === 'vehicle') { title.textContent = 'Register New Vehicle'; document.getElementById('vehicle-form').style.display = 'block'; }
    else if (type === 'owner') { title.textContent = 'Register New Owner'; document.getElementById('owner-form').style.display = 'block'; }
    else if (type === 'insurance') { title.textContent = 'Add Insurance Policy'; document.getElementById('insurance-form').style.display = 'block'; }
    overlay.classList.add('active');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById('vehicle-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#vehicles-table tbody tr').forEach(row => { row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none'; });
});

document.getElementById('owner-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#owners-table tbody tr').forEach(row => { row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none'; });
});
