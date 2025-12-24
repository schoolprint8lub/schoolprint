document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Бургер Меню ---
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закрити меню при кліку на посилання
        document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // --- 2. Логіка Кошика (тільки якщо є кнопка кошика) ---
    const cartBtn = document.getElementById('cart-btn');
    const modal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close-cart');

    if (cartBtn && modal) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = "block";
            renderCart();
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = "none";
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    updateCartCount();
});

// --- 3. Змінні Кошика ---
let cart = JSON.parse(localStorage.getItem('schoolPrintCart')) || [];

// --- 4. Завантаження Товарів ---
async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '<p style="text-align:center; width:100%;">Завантаження...</p>';

    try {
        const response = await fetch('/content/products.json');
        let products = [];
        if (response.ok) {
            const data = await response.json();
            products = data.items || [];
        } 
        
        // Тестові товари, якщо JSON пустий (щоб сайт не був пустим)
        if (products.length === 0) {
            products = [
                { title: "Брендована чашка", price: 150, image: "https://via.placeholder.com/300/4F46E5/FFFFFF?text=Mug", description: "Керамічна чашка з вашим лого." },
                { title: "Еко-сумка", price: 200, image: "https://via.placeholder.com/300/10B981/FFFFFF?text=Bag", description: "Зручна сумка для покупок." },
                { title: "Набір стікерів", price: 50, image: "https://via.placeholder.com/300/F59E0B/FFFFFF?text=Stickers", description: "Яскраві стікери School Print." }
            ];
        }

        productList.innerHTML = '';
        products.forEach((product) => {
            const div = document.createElement('div');
            div.classList.add('product-item');
            div.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <div class="product-price">${product.price} грн</div>
                <button class="btn full-width" onclick="addToCart('${product.title}', ${product.price})">Додати в кошик</button>
            `;
            productList.appendChild(div);
        });

    } catch (error) {
        console.error('Error:', error);
        productList.innerHTML = '<p>Помилка завантаження товарів.</p>';
    }
}

// --- 5. Функції Кошика ---
function addToCart(title, price) {
    cart.push({ title, price });
    localStorage.setItem('schoolPrintCart', JSON.stringify(cart));
    updateCartCount();
    alert(`"${title}" додано!`);
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
        container.innerHTML = '<p>Кошик порожній.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            text += `${item.title} (${item.price} грн)\n`;
            
            const div = document.createElement('div');
            div.style.cssText = "display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;";
            div.innerHTML = `
                <span>${item.title}</span>
                <span>
                    <b>${item.price}</b> 
                    <button onclick="removeFromCart(${index})" style="background:#EF4444; color:white; border:none; border-radius:4px; padding:2px 6px; margin-left:10px; cursor:pointer;">X</button>
                </span>
            `;
            container.appendChild(div);
        });
    }

    totalSpan.innerText = total;
    if(input) input.value = text + `\nРАЗОМ: ${total} грн`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('schoolPrintCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}
