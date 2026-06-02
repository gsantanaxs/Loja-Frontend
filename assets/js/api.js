const USE_BACKEND = true
const BACKEND_URL = 'https://loja-backend-2.vercel.app/api'

const SUPABASE_URL = 'https://kyedvbcjkxfqerskkqor.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZWR2YmNqa3hmcWVyc2trcW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMTQ4OCwiZXhwIjoyMDk1NjA3NDg4fQ.9K_LDWmuulpU2oaU68y9w4dOLihAW2ZkSbX-7f1JegA'

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────
export function formatPrice(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── SUPABASE DIRETO ──────────────────────────────────────────────────────────
const sbHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
}

async function sbFetch(path) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders })
    if (!res.ok) return null
    return res.json()
}

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────
export async function getProducts({ page = 1, limit = 12, category = '', search = '', active = 'true' } = {}) {
    if (USE_BACKEND) {
        const params = new URLSearchParams({ page, limit, active })
        if (category) params.set('category', category)
        if (search) params.set('search', search)
        const res = await fetch(`${BACKEND_URL}/products?${params}`)
        return res.ok ? res.json() : { data: [], pagination: { total: 0, page: 1, pages: 0 } }
    }

    // Supabase direto
    let query = `products?select=*,category:categories(id,name,slug)&active=eq.true&order=name.asc`

    if (search) {
        query += `&name=ilike.*${encodeURIComponent(search)}*`
    }

    if (category) {
        // Precisamos do id da categoria pelo slug
        const cats = await sbFetch(`categories?slug=eq.${encodeURIComponent(category)}&select=id`)
        if (cats && cats.length > 0) {
            query += `&category_id=eq.${cats[0].id}`
        }
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    const headers = { ...sbHeaders, 'Range': `${from}-${to}`, 'Prefer': 'count=exact' }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, { headers })

    if (!res.ok) return { data: [], pagination: { total: 0, page: 1, pages: 0 } }

    const data = await res.json()
    const contentRange = res.headers.get('Content-Range') || ''
    const total = parseInt(contentRange.split('/')[1]) || data.length

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    }
}

export async function getProductBySlug(slug) {
    if (USE_BACKEND) {
        const res = await fetch(`${BACKEND_URL}/products/slug/${slug}`)
        return res.ok ? res.json() : null
    }

    const data = await sbFetch(`products?slug=eq.${encodeURIComponent(slug)}&select=*,category:categories(id,name,slug)&limit=1`)
    return data && data.length > 0 ? data[0] : null
}

// ─── CATEGORIAS ───────────────────────────────────────────────────────────────
export async function getCategories() {
    if (USE_BACKEND) {
        const res = await fetch(`${BACKEND_URL}/categories`)
        return res.ok ? res.json() : []
    }

    const data = await sbFetch(`categories?select=*&order=name.asc`)
    return data || []
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
export function productCardSkeleton() {
    return `<div class="bg-white border border-gray-300 rounded-lg p-5 relative animate-pulse">
        <div class="w-full aspect-square bg-gray-200 rounded mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
    </div>`
}
