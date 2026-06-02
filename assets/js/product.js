import { getProductBySlug, formatPrice } from './assets/js/api.js'

        async function loadProduct() {
            const slug = new URLSearchParams(location.search).get('slug')

            if (!slug) { showError(); return }

            try {
                const product = await getProductBySlug(slug)
                if (!product) { showError(); return }

                document.title = product.name + ' - B7Store'
                document.getElementById('product-image').src = product.image_url || 'assets/images/products/camiseta-css.png'
                document.getElementById('product-image').alt = product.name
                document.getElementById('product-name').textContent = product.name
                document.getElementById('product-sku').textContent = product.id ? 'CÓD: ' + String(product.id).padStart(4, '0') : ''
                document.getElementById('product-price').textContent = formatPrice(product.price)

                if (product.old_price) {
                    document.getElementById('product-old-price').textContent = formatPrice(product.old_price)
                    document.getElementById('product-old-price-wrap').style.display = ''
                }

                if (product.category) {
                    document.getElementById('breadcrumb-cat').textContent = product.category.name || product.category
                }
                document.getElementById('breadcrumb-name').textContent = product.name

                document.getElementById('product-loading').classList.add('hidden')
                document.getElementById('product-content').classList.remove('hidden')
                document.getElementById('product-content').classList.add('flex')

            } catch (err) {
                console.error('Erro ao carregar produto:', err)
                showError()
            }
        }

        function showError() {
            document.getElementById('product-loading').classList.add('hidden')
            document.getElementById('product-error').classList.remove('hidden')
        }

        loadProduct()