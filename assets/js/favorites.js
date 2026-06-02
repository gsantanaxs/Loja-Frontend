// ─── FAVORITOS (LocalStorage) ─────────────────────────────────────────────────

const FAV_KEY = 'b7store_favorites'

export function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || [] }
    catch { return [] }
}

export function isFavorite(productId) {
    return getFavorites().includes(String(productId))
}

export function toggleFavorite(productId) {
    const favs = getFavorites()
    const id = String(productId)
    const idx = favs.indexOf(id)
    if (idx >= 0) {
        favs.splice(idx, 1)
    } else {
        favs.push(id)
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(favs))
    return favs.includes(id)
}

// Chama após renderizar cards — aplica estado e evento em todos os .heart-btn
export function initHeartButtons() {
    document.querySelectorAll('.heart-btn').forEach(btn => {
        const id = btn.dataset.productId
        if (!id) return

        // Estado inicial
        const active = isFavorite(id)
        setHeartState(btn, active)

        // Remove listener antigo clonando o botão
        const newBtn = btn.cloneNode(true)
        btn.replaceWith(newBtn)

        newBtn.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const nowFav = toggleFavorite(id)
            setHeartState(newBtn, nowFav)
            // Animação de bounce
            newBtn.style.transform = 'scale(1.3)'
            setTimeout(() => newBtn.style.transform = 'scale(1)', 200)
        })
    })
}

function setHeartState(btn, active) {
    const img = btn.querySelector('img')
    if (!img) return
    if (active) {
        img.src = 'assets/images/ui/heart-3-fill.png'
        btn.classList.add('border-red-400')
        btn.classList.remove('border-gray-400', 'border-[#D9D9D9]')
    } else {
        img.src = 'assets/images/ui/heart-3-line.png'
        btn.classList.remove('border-red-400')
        btn.classList.add('border-gray-400')
    }
}
