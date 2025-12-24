document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Burger Menu Logic ---
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закриваємо меню при кліку на посилання
        document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // --- 2. Cart Modal Logic (Тільки для сторінки магазину) ---
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

// --- 3. Shop & Cart Logic ---
let cart = JSON.parse(localStorage.getItem('schoolPrintCart')) || [];

async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '<p style="text-align:center; width:100%;">Завантаження...</p>';

    try {
        // Спробуємо завантажити JSON (створений через адмінку)
        const response = await fetch('/content/products.json');
        
        let products = [];
        if (response.ok) {
            const data = await response.json();
            products = data.items || []; // Структура з config.yml
        } 
        
        // Якщо JSON порожній або помилка, показуємо демо-товари (щоб не було пусто)
        if (products.length === 0) {
            products = [
                { title: "Брендована чашка", price: 150, image: "https://via.placeholder.com/300", description: "Керамічна чашка з вашим лого." },
                { title: "Еко-сумка", price: 200, image: "https://via.placeholder.com/300", description: "Зручна сумка для покупок." },
                { title: "Набір стікерів", price: 50, image: "https://via.placeholder.com/300", description: "Яскраві стікери School Print." }
            ];
        }

        productList.innerHTML = '';
        products.forEach((product, index) => {
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
        console.error('Error loading products:', error);
        productList.innerHTML = '<p>Не вдалося завантажити товари.</p>';
    }
}

function addToCart(title, price) {
    cart.push({ title, price });
    localStorage.setItem('schoolPrintCart', JSON.stringify(cart));
    updateCartCount();
    alert(`"${title}" додано в кошик!`);
}

function updateCartCount() {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) countSpan.innerText = cart.length;
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('cart-total-price');
    const orderDetailsInput = document.getElementById('order-details-input');

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let orderText = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Кошик порожній.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            orderText += `${item.title} - ${item.price} грн\n`;
            
            const div = document.createElement('div');
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.marginBottom = "10px";
            div.style.borderBottom = "1px solid #eee";
            div.style.paddingBottom = "5px";
            
            div.innerHTML = `
                <span>${item.title}</span>
                <span>
                    <b>${item.price} грн</b> 
                    <button onclick="removeFromCart(${index})" style="background:red; padding:2px 8px; font-size:12px; margin-left:10px;">X</button>
                </span>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    totalPriceSpan.innerText = total;
    if(orderDetailsInput) orderDetailsInput.value = orderText + `\nЗагалом: ${total} грн`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('schoolPrintCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}
