document.addEventListener('DOMContentLoaded', () => {
    // Data Produk (Simulasi Database) 
    const productsData = [
        { id: 'V1', name: 'HRMS V1', price: 150000, image: 'V1.png', description: 'Kemeja kasual terbaik untuk gaya sehari-hari Anda.' },
        { id: 'V2', name: 'HRMS V2', price: 180000, image: 'V2.png', description: 'Celana jeans modern dengan potongan ramping dan nyaman.' },
        { id: 'V3', name: 'HRMS V3', price: 120000, image: 'V3.png', description: 'Kaos oversized yang stylish dan serbaguna.' },
        { id: 'V4', name: 'HRMS V4', price: 350000, image: 'V4.png', description: 'Jaket kulit premium untuk tampilan yang edgy dan berkelas.' }
    ];

    //  Elemen DOM Umum 
    const cartCountSpans = document.querySelectorAll('#cart-count, #cart-count-detail');
    const addToCartButtons = document.querySelectorAll('.add-to-cart, .add-to-cart-detail');
    const productList = document.getElementById('product-list');
    const sortPriceSelect = document.getElementById('sort-price');
    const cartSection = document.getElementById('keranjang');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const clearCartBtn = document.querySelector('.clear-cart-btn');

    // Fungsi Bantuan 

    // Mengambil keranjang dari Local Storage
    const getCart = () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    };

    // Menyimpan keranjang ke Local Storage
    const saveCart = (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Memperbarui jumlah item di keranjang pada navigasi
    const updateCartCount = () => {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpans.forEach(span => {
            span.textContent = `(${totalItems})`;
        });
    };

    // Merender item di keranjang
    const renderCartItems = () => {
        const cart = getCart();
        cartItemsContainer.innerHTML = ''; // Kosongkan tampilan keranjang

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
            cartTotalSpan.textContent = '0';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    <button class="remove-from-cart" data-id="${item.id}">Hapus</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });

        cartTotalSpan.textContent = total.toLocaleString('id-ID');
    };

    // Event Listeners 

    // Menangani klik tombol "Tambah ke Keranjang"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const productName = e.target.dataset.name;
            const productPrice = parseInt(e.target.dataset.price);

            let cart = getCart();
            const existingItemIndex = cart.findIndex(item => item.id === productId);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
            }

            saveCart(cart);
            updateCartCount();
            alert(`${productName} telah ditambahkan ke keranjang!`);
        });
    });

    // Menangani perubahan kuantitas dan hapus item di keranjang
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('quantity-btn')) {
            const productId = target.dataset.id;
            const action = target.dataset.action;
            let cart = getCart();
            const itemIndex = cart.findIndex(item => item.id === productId);

            if (itemIndex > -1) {
                if (action === 'increase') {
                    cart[itemIndex].quantity += 1;
                } else if (action === 'decrease') {
                    cart[itemIndex].quantity -= 1;
                    if (cart[itemIndex].quantity <= 0) {
                        cart.splice(itemIndex, 1); // Hapus jika kuantitas 0 atau kurang
                    }
                }
                saveCart(cart);
                updateCartCount();
                renderCartItems();
            }
        } else if (target.classList.contains('remove-from-cart')) {
            const productId = target.dataset.id;
            let cart = getCart();
            cart = cart.filter(item => item.id !== productId);
            saveCart(cart);
            updateCartCount();
            renderCartItems();
        }
    });

    // Menangani tombol "Bersihkan Keranjang"
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin membersihkan keranjang?')) {
                localStorage.removeItem('cart');
                updateCartCount();
                renderCartItems();
            }
        });
    }

    // Fungsi Sorting Produk 
    if (sortPriceSelect && productList) {
        sortPriceSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const products = Array.from(productList.children); // Mengambil elemen produk

            products.sort((a, b) => {
                const priceA = parseInt(a.dataset.price);
                const priceB = parseInt(b.dataset.price);

                if (sortBy === 'low-to-high') {
                    return priceA - priceB;
                } else if (sortBy === 'high-to-low') {
                    return priceB - priceA;
                }
                return 0; // Default order
            });

            // Merender ulang produk yang sudah diurutkan
            products.forEach(product => {
                productList.appendChild(product);
            });
        });
    }

    // Penanganan Tampilan Keranjang (Saat navigasi diklik) 
    const keranjangNavLink = document.querySelector('header nav ul li a[href="#keranjang"]');
    if (keranjangNavLink) {
        keranjangNavLink.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah scrolling langsung
            if (cartSection.classList.contains('hidden')) {
                cartSection.classList.remove('hidden');
                renderCartItems();
            } else {
                cartSection.classList.add('hidden');
            }
            // Scroll ke bagian keranjang jika terlihat
            if (!cartSection.classList.contains('hidden')) {
                cartSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Inisialisasi: Perbarui jumlah keranjang saat halaman dimuat
    updateCartCount();

    // Jika halaman saat ini adalah halaman keranjang, render itemnya
    if (window.location.hash === '#keranjang' && cartSection) {
        cartSection.classList.remove('hidden');
        renderCartItems();
    }

    document.getElementById("checkout-btn").addEventListener("click", function () {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
            alert("Keranjang kosong. Silakan tambahkan produk terlebih dahulu.");
        } else {
            window.location.href = "checkout.html";
        }
    });
});
window.addEventListener('load', () => {
    document.body.classList.add('fade-in');
});