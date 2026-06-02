// ─── CARRINHO (LocalStorage) ──────────────────────────────────────────────────

const CART_KEY = 'b7store_cart'

export function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] }
    catch { return [] }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    updateCartBadge()
}

export function addToCart(product, qty = 1) {
    const cart = getCart()
    const idx = cart.findIndex(i => i.id === product.id)
    if (idx >= 0) {
        cart[idx].qty += qty
    } else {
        cart.push({ ...product, qty })
    }
    saveCart(cart)
}

export function removeFromCart(productId) {
    saveCart(getCart().filter(i => i.id !== productId))
}

export function updateQty(productId, qty) {
    if (qty <= 0) { removeFromCart(productId); return }
    const cart = getCart()
    const idx = cart.findIndex(i => i.id === productId)
    if (idx >= 0) { cart[idx].qty = qty; saveCart(cart) }
}

export function clearCart() {
    localStorage.removeItem(CART_KEY)
    updateCartBadge()
}

export function getCartTotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0)
}

export function getCartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0)
}

// Atualiza todos os badges de carrinho na página
export function updateCartBadge() {
    const count = getCartCount()
    document.querySelectorAll('.cart-badge').forEach(el => {
        if (count > 0) {
            el.textContent = count > 99 ? '99+' : count
            el.classList.remove('hidden')
            el.classList.add('flex')
        } else {
            el.classList.add('hidden')
            el.classList.remove('flex')
        }
    })
}
