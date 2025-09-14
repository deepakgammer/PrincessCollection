import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Supabase credentials
const SUPABASE_URL = "https://tffqsmbmtotluhjagwds.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZnFzbWJtdG90bHVoamFnd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg5MTksImV4cCI6MjA3MzM0NDkxOX0.H8qY2F8XL8a7DKKhnQ_AAH1RxncbPHGnXdgd8LdQXnA"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ✅ Check Login
let { data: { user } } = await supabase.auth.getUser()
if (!user) {
  window.location.href = "login.html"
}
const currentUser = user

// ✅ Load Products Function
async function loadProducts(searchQuery = "", category = "", sortOrder = "") {
  let query = supabase.from('products').select('*')

  if (searchQuery) query = query.ilike('name', `%${searchQuery}%`)
  if (category) query = query.eq('category', category)
  if (sortOrder === "asc") query = query.order('price', { ascending: true })
  if (sortOrder === "desc") query = query.order('price', { ascending: false })

  let { data: products, error } = await query
  if (error) {
    console.error(error)
    return
  }

  const container = document.getElementById('product-list')
  if (!container) return

  container.innerHTML = ""
  products.forEach(p => {
    const stockStatus = p.stock > 0 
      ? `<span style="color:lightgreen">In Stock (${p.stock})</span>` 
      : `<span style="color:red">Out of Stock</span>`

    container.innerHTML += `
      <div class="card">
        <a href="product.html?id=${p.id}" style="text-decoration:none; color:inherit;">
          <img src="${p.image_url || 'https://via.placeholder.com/200'}" alt="${p.name}">
          <h3 style="color:#FFD700">${p.name}</h3>
          <p style="color:#FFD700; font-weight:bold;">₹${p.price}</p>
          ${p.size ? `<p style="color:#FFD700">Size: ${p.size}</p>` : ""}
          <p>${stockStatus}</p>
        </a>
      </div>
    `
  })
}

// 🔍 Search Box
const searchInput = document.getElementById("searchInput")
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const category = document.getElementById("categoryFilter")?.value || ""
    const sortOrder = document.getElementById("priceSort")?.value || ""
    loadProducts(e.target.value, category, sortOrder)
  })
}

// 🏷️ Category Filter
const categoryFilter = document.getElementById("categoryFilter")
if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    const searchQuery = searchInput?.value || ""
    const sortOrder = document.getElementById("priceSort")?.value || ""
    loadProducts(searchQuery, categoryFilter.value, sortOrder)
  })
}

// 💰 Price Sort
const priceSort = document.getElementById("priceSort")
if (priceSort) {
  priceSort.addEventListener("change", () => {
    const searchQuery = searchInput?.value || ""
    const category = document.getElementById("categoryFilter")?.value || ""
    loadProducts(searchQuery, category, priceSort.value)
  })
}

// Initial Load
loadProducts()
