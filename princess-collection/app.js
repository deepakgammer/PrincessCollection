<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Cart - Princess Collection</title>
  <link rel="stylesheet" href="style.css">
  <style>
    /* Navbar */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background: #000;
      color: #FFD700;
      position: relative;
      z-index: 1000;
    }
    header .logo img {
      height: 50px;
    }
    nav {
      display: flex;
      gap: 15px;
    }
    nav a, nav button {
      color: #FFD700;
      text-decoration: none;
      font-weight: bold;
      background: none;
      border: none;
      cursor: pointer;
    }
    nav a:hover,
    nav a.active {
      text-decoration: underline;
    }

    /* Hamburger */
    .hamburger {
      display: none;
      flex-direction: column;
      cursor: pointer;
    }
    .hamburger span {
      height: 3px;
      width: 25px;
      background: #FFD700;
      margin: 4px 0;
      border-radius: 2px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      nav {
        display: none;
        flex-direction: column;
        background: #111;
        position: absolute;
        top: 60px;
        right: 20px;
        width: 200px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
        padding: 10px;
      }
      nav a, nav button {
        padding: 10px;
        border-bottom: 1px solid #333;
        text-align: left;
      }
      nav a:last-child, nav button:last-child {
        border-bottom: none;
      }
      .hamburger {
        display: flex;
      }
      nav.active {
        display: flex;
      }
    }

    /* Cart styles */
    main {
      max-width: 900px;
      margin: 20px auto;
      padding: 20px;
      background: #111;
      border: 1px solid #FFD700;
      border-radius: 10px;
      color: #FFD700;
    }
    .cart-item {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #333;
      padding: 10px 0;
    }
    .cart-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 5px;
      margin-right: 15px;
    }
    .cart-item button {
      margin: 5px;
      padding: 5px 10px;
      background: #FFD700;
      border: none;
      color: #000;
      font-weight: bold;
      border-radius: 5px;
      cursor: pointer;
    }
    .cart-item button:disabled {
      background: #555;
      color: #999;
      cursor: not-allowed;
    }
    #checkout-btn {
      background: #FFD700;
      color: #000;
      border: none;
      padding: 12px 20px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <!-- Navbar -->
  <header>
    <div class="logo">
      <a href="index.html"><img src="assets/logo.png" alt="Princess Collection Logo"></a>
    </div>
    <div class="hamburger" id="hamburger">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <nav id="navMenu">
      <a href="index.html">Home</a>
      <a href="shop.html">Shop</a>
      <a href="cart.html" class="active">Cart 🛒</a>
      <button id="logoutBtn" style="display:none">Logout 🚪</button>
    </nav>
  </header>

  <main>
    <h2>My Cart</h2>
    <div id="cart-items"></div>
    <h3 id="cart-total">Total: ₹0</h3>
    <button id="checkout-btn">Checkout</button>
  </main>

  <footer>
    <p>© 2025 Princess Collection. All Rights Reserved.</p>
  </footer>

  <script type="module">
    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

    const SUPABASE_URL = "https://tffqsmbmtotluhjagwds.supabase.co"
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZnFzbWJtdG90bHVoamFnd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg5MTksImV4cCI6MjA3MzM0NDkxOX0.H8qY2F8XL8a7DKKhnQ_AAH1RxncbPHGnXdgd8LdQXnA"
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const cartContainer = document.getElementById("cart-items")
    const totalEl = document.getElementById("cart-total")
    const logoutBtn = document.getElementById("logoutBtn")

    let currentUser = null

    // ✅ Check login
    const { data: { user } } = await supabase.auth.getUser()
    currentUser = user
    if (!currentUser) {
      window.location.href = "login.html" // force login
    } else {
      logoutBtn.style.display = "inline-block"
    }

    // ✅ Fetch cart
    async function loadCart() {
      let { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, products(id, name, price, stock, image_url)")
        .eq("user_id", currentUser.id)

      if (error) {
        console.error("Cart fetch error:", error)
        return
      }

      const cart = data.map(item => ({
        id: item.id,
        name: item.products.name,
        price: item.products.price,
        image: item.products.image_url,
        quantity: item.quantity,
        product_id: item.products.id,
        stock: item.products.stock
      }))

      renderCart(cart)
    }

    // ✅ Render cart with stock check
    function renderCart(cart) {
      cartContainer.innerHTML = ""
      let total = 0

      cart.forEach((item, index) => {
        total += item.price * item.quantity

        const disablePlus = item.quantity >= item.stock ? "disabled" : ""

        cartContainer.innerHTML += `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <h4>${item.name}</h4>
              <p>₹${item.price} x ${item.quantity}</p>
              <button onclick="updateQuantity(${index}, 1)" ${disablePlus}>+</button>
              <button onclick="updateQuantity(${index}, -1)">-</button>
              <button onclick="removeItem(${index})">Remove</button>
              <p><small>Stock: ${item.stock}</small></p>
            </div>
          </div>
        `
      })

      totalEl.textContent = "Total: ₹" + total
      window._cart = cart
    }

    // ✅ Update Quantity
    window.updateQuantity = async function (index, change) {
      let cart = window._cart
      let item = cart[index]
      let newQty = item.quantity + change

      if (newQty <= 0) {
        await supabase.from("cart_items").delete().eq("id", item.id)
      } else {
        if (newQty > item.stock) {
          alert(`⚠️ Only ${item.stock} available in stock!`)
          return
        }
        await supabase.from("cart_items").update({ quantity: newQty }).eq("id", item.id)
      }
      loadCart()
    }

    // ✅ Remove Item
    window.removeItem = async function (index) {
      let cart = window._cart
      let item = cart[index]
      await supabase.from("cart_items").delete().eq("id", item.id)
      loadCart()
    }

    // ✅ Checkout
    document.getElementById("checkout-btn").addEventListener("click", () => {
      window.location.href = "checkout.html"
    })

    // ✅ Logout
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut()
      window.location.href = "login.html"
    })

    // ✅ Hamburger toggle
    const hamburger = document.getElementById("hamburger")
    const navMenu = document.getElementById("navMenu")
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })

    // Initial Load
    loadCart()
  </script>
</body>
</html>
