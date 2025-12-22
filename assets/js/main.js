// Завантаження товарів
async function loadProducts() {
    const container = document.getElementById('product-list');
    if (!container) return;

    // ДЕМО ТОВАРИ З ПРЕЗЕНТАЦІЇ (Якщо адмінка порожня)
    const demoProducts = [
        { id: "p1", title: "Лист від Святого Миколая", category: "Поліграфія", price: 50, image: "https://via.placeholder.com/300?text=Letter", description: "Персональний іменний лист для дитини." },
        { id: "p2", title: "Бантик з фоамірану", category: "Сувеніри", price: 40, image: "https://via.placeholder.com/300?text=Bow", description: "Ручна робота, оздоблення стразами." },
        { id: "p3", title: "Оберіг «Домовичок»", category: "Обереги", price: 120, image: "https://via.placeholder.com/300?text=Charm", description: "Оберіг родинного затишку." },
        { id: "p4", title: "Закатний значок", category: "Сувеніри", price: 25, image: "https://via.placeholder.com/300?text=Badge", description: "Виготовлено на новому обладнанні." },
        { id: "p5", title: "Брендований щоденник", category: "Поліграфія", price: 150, image: "https://via.placeholder.com/300?text=Diary", description: "Фірмовий щоденник гімназії." }
    ];

    // Спробуємо завантажити з JSON файлу CMS
    try {
        const response = await fetch('content/products.json'); // Шлях без скісної риски на початку!
        if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                renderList(data.items, container);
                return;
            }
        }
    } catch (e) { console.log('Використовуються демо-дані'); }

    // Якщо файл порожній або помилка - показуємо демо
    renderList(demoProducts, container);
}

function renderList(products, container) {
    container.innerHTML = products.map(item => `
        <div class="card">
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p style="font-size:0.9rem; flex-grow:1;">${item.description}</p>
            <div class="price-row">
                <span>${item.price} грн</span>
                <button class="btn" onclick="addToCart('${item.title}', ${item.price})">В кошик</button>
            </div>
        </div>
    `).join('');
}

// КОШИК
let cart = JSON.parse(localStorage.getItem('sp_cart')) || [];

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    const orderInput = document.getElementById('order-details-input');
    
    if(!container) return;

    let total = 0;
    let text = "ЗАМОВЛЕННЯ:\n";

    if (cart.length === 0) {
        container.innerHTML = '<p>Порожньо</p>';
        totalEl.innerText = '0';
        if(orderInput) orderInput.value = '';
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        total += item.price;
        text += `- ${item.title} (${item.price} грн)\n`;
        return `<div class="cart-item"><span>${item.title}</span><button class="remove-btn" onclick="remove(${index})">&times;</button></div>`;
    }).join('');

    totalEl.innerText = total;
    if(orderInput) orderInput.value = text + `\nРАЗОМ: ${total} грн`;
}

window.addToCart = (title, price) => {
    cart.push({title, price});
    localStorage.setItem('sp_cart', JSON.stringify(cart));
    updateCartUI();
    alert('Додано!');
};

window.remove = (index) => {
    cart.splice(index, 1);
    localStorage.setItem('sp_cart', JSON.stringify(cart));
    updateCartUI();
};

// Модальне вікно
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    const modal = document.getElementById('cart-modal');
    const btn = document.getElementById('cart-btn');
    const close = document.querySelector('.close-cart');

    if(btn) btn.onclick = (e) => { e.preventDefault(); modal.style.display = 'block'; };
    if(close) close.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };
});