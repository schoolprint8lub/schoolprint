document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. THEME SWITCHER ---
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- 1. SCROLL TO TOP ---
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollTopBtn';
    scrollBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- 2. Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .product-item, h1, h2, p, .contact-wrapper').forEach(el => {
        el.classList.add('fade-up');
        observer.observe(el);
    });

    // --- 3. Burger Menu ---
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // --- 4. Cart Modal ---
    const cartBtn = document.getElementById('cart-btn');
    const modal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close-cart');
    if (cartBtn && modal) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = "block";
            renderCart();
        });
        closeBtn.addEventListener('click', () => { modal.style.display = "none"; });
        window.addEventListener('click', (event) => { if (event.target == modal) modal.style.display = "none"; });
    }

    // --- 5. Toasts ---
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    updateCartCount();
});

// --- Helpers ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✅</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Shop Logic ---
let cart = JSON.parse(localStorage.getItem('schoolPrintCart')) || [];

async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    productList.innerHTML = '<p style="text-align:center; width:100%;">Завантаження...</p>';
    
    try {
        // ВИПРАВЛЕНО: Відносний шлях без "/" на початку
        const response = await fetch('content/products.json');
        let products = [];
        if (response.ok) {
            const data = await response.json();
            products = data.items || [];
        } 
        
        if (products.length === 0) {
            products = [
                { title: "Брендована чашка", price: 150, image: "https://via.placeholder.com/300/2563eb/ffffff?text=Cup", description: "Керамічна чашка." },
                { title: "Еко-сумка", price: 200, image: "https://via.placeholder.com/300/10b981/ffffff?text=Bag", description: "Зручна сумка." },
                { title: "Стікери", price: 50, image: "https://via.placeholder.com/300/f59e0b/ffffff?text=Stickers", description: "Набір стікерів." }
            ];
        }
        
        productList.innerHTML = '';
        products.forEach((product) => {
            const div = document.createElement('div');
            div.classList.add('product-item', 'fade-up');
            // Перевірка шляху до картинки
            let imgSrc = product.image || "https://via.placeholder.com/300?text=No+Image";
            
            div.innerHTML = `
                <img src="${imgSrc}" alt="${product.title}" loading="lazy">
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <div class="product-price">${product.price} грн</div>
                <button class="btn full-width" onclick="addToCart('${product.title}', ${product.price})">Додати в кошик</button>
            `;
            productList.appendChild(div);
            setTimeout(() => div.classList.add('visible'), 100);
        });
    } catch (error) {
        console.error('Error:', error);
        productList.innerHTML = '<p>Помилка завантаження (перевірте консоль).</p>';
    }
}

function addToCart(title, price) {
    cart.push({ title, price });
    localStorage.setItem('schoolPrintCart', JSON.stringify(cart));
    updateCartCount();
    showToast(`"${title}" додано!`);
}

function updateCartCount() {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) countSpan.innerText = cart.length;
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total-price');
    const input = document.getElementById('order-details-input');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;
    let text = '';
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">Кошик порожній</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            text += `${item.title} (${item.price} грн)\n`;
            const div = document.createElement('div');
            div.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px;";
            div.innerHTML = `
                <span style="font-weight:500;">${item.title}</span>
                <div style="display:flex; align-items:center;">
                    <b style="color:var(--primary); margin-right:10px;">${item.price} грн</b> 
                    <button onclick="removeFromCart(${index})" style="background:#fee2e2; color:#ef4444; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold;">×</button>
                </div>
            `;
            container.appendChild(div);
        });
    }
    if(totalSpan) totalSpan.innerText = total;
    if(input) input.value = text + `\nРАЗОМ: ${total} грн`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('schoolPrintCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}
