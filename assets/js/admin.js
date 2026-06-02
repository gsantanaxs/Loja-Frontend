const BASE_URL = 'http://localhost:3000/api';
const ADMIN_URL = `${BASE_URL}/admin`;

// ─── HELPER FETCH COM TOKEN ───────────────────────────────────
async function adminFetch(url, options = {}) {
    const token = localStorage.getItem('b7admin_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 && !url.includes('/auth/login')) {
        adminLogout();
        return null;
    }
    return res;
}

// ─── UTILITÁRIOS ─────────────────────────────────────────────
export function formatPrice(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── AUTENTICAÇÃO ────────────────────────────────────────────
export async function adminLogin(email, password) {
    const res = await adminFetch(`${ADMIN_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no login');
    localStorage.setItem('b7admin_token', data.token);
    localStorage.setItem('b7admin_name', data.admin.name);
    localStorage.setItem('b7admin_email', data.admin.email);
    return data;
}

export function adminLogout() {
    localStorage.removeItem('b7admin_token');
    localStorage.removeItem('b7admin_name');
    localStorage.removeItem('b7admin_email');
    window.location.href = 'admin-login.html';
}

export function checkAuth() {
    const token = localStorage.getItem('b7admin_token');
    if (!token && !window.location.pathname.includes('admin-login.html')) {
        window.location.href = 'admin-login.html';
    }
    return token;
}

// ─── PRODUTOS (ADMIN) ────────────────────────────────────────
export async function getAdminProducts({ page = 1, limit = 50, active = 'all', search = '' } = {}) {
    const params = new URLSearchParams({ page, limit, active });
    if (search) params.set('search', search);
    const res = await adminFetch(`${ADMIN_URL}/products?${params}`);
    return res ? res.json() : null;
}

export async function getAdminProduct(id) {
    const res = await adminFetch(`${ADMIN_URL}/products/${id}`);
    return res ? res.json() : null;
}

export async function saveProduct(productData, id = null) {
    const method = id ? 'PUT' : 'POST';
    const url    = id ? `${ADMIN_URL}/products/${id}` : `${ADMIN_URL}/products`;
    return adminFetch(url, { method, body: JSON.stringify(productData) });
}

export async function toggleProductStatus(id) {
    return adminFetch(`${ADMIN_URL}/products/${id}/toggle`, { method: 'PATCH' });
}

export async function deleteProduct(id) {
    return adminFetch(`${ADMIN_URL}/products/${id}`, { method: 'DELETE' });
}

// ─── CATEGORIAS (ADMIN) ──────────────────────────────────────
export async function getAdminCategories() {
    const res = await adminFetch(`${ADMIN_URL}/categories`);
    return res ? res.json() : [];
}

export async function saveCategory(name, id = null) {
    const method = id ? 'PUT' : 'POST';
    const url    = id ? `${ADMIN_URL}/categories/${id}` : `${ADMIN_URL}/categories`;
    return adminFetch(url, { method, body: JSON.stringify({ name }) });
}

export async function deleteCategory(id) {
    return adminFetch(`${ADMIN_URL}/categories/${id}`, { method: 'DELETE' });
}

// ─── STATS ───────────────────────────────────────────────────
export async function getAdminStats() {
    const [all, active, inactive, cats] = await Promise.all([
        getAdminProducts({ active: 'all',   limit: 1 }),
        getAdminProducts({ active: 'true',  limit: 1 }),
        getAdminProducts({ active: 'false', limit: 1 }),
        getAdminCategories(),
    ]);
    return {
        totalProducts:    all?.pagination?.total ?? 0,
        activeProducts:   active?.pagination?.total ?? 0,
        inactiveProducts: inactive?.pagination?.total ?? 0,
        totalCategories:  Array.isArray(cats) ? cats.length : 0,
    };
}