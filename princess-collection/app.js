import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// =========================
// ✅ Supabase credentials
// =========================
const SUPABASE_URL = "https://tffqsmbmtotluhjagwds.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZnFzbWJtdG90bHVoamFnd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg5MTksImV4cCI6MjA3MzM0NDkxOX0.H8qY2F8XL8a7DKKhnQ_AAH1RxncbPHGnXdgd8LdQXnA"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =========================
// ✅ Detect environment
// =========================
const isLocalhost =
  window.location.hostname.includes("127.0.0.1") ||
  window.location.hostname.includes("localhost")

const baseURL = isLocalhost
  ? "http://127.0.0.1:5500"
  : "https://princesscollection.it.com"

// =========================
// ✅ Auth Check
// =========================
let {
  data: { user },
  error: authError,
} = await supabase.auth.getUser()
if (authError) console.warn("Auth fetch error:", authError.message)

const currentUser = user

// Force login only on protected pages
const protectedPages = ["cart.html", "checkout.html", "profile.html"]
const isProtectedPage = protectedPages.some((p) =>
  window.location.pathname.includes(p)
)

if (!currentUser && isProtectedPage) {
  window.location.href = "login.html"
}

// =========================
// ✅ Logout Button Setup
// =========================
const logoutBtn = document.getElementById("logoutBtn")
if (logoutBtn) {
  if (currentUser) {
    logoutBtn.style.display = "inline-block"
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut()
      window.location.href = "login.html"
    })
  } else {
    logoutBtn.style.display = "none"
  }
}

// =========================
// ✅ Google Login
// =========================
window.googleLogin = async function () {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseURL}/index.html`,
    },
  })
  if (error) console.error("Google Login Error:", error.message)
}

// ✅ Global logout (backup)
window.logout = async function () {
  await supabase.auth.signOut()
  window.location.href = "login.html"
}

// =========================
// ✅ Load Products
// =========================
async function loadProducts(searchQuery = "", category = "", sortOrder = "") {
  let query = supabase.from("products").select("*") // removed status filter

  if (searchQuery) query = query.ilike("name", `%${searchQuery}%`)
  if (category) query = query.eq("category", category)
  if (sortOrder === "asc") query = query.order("price", { ascending: true })
  if (sortOrder === "desc") query = query.order("price", { ascending: false })

  let { data: products, error } = await query
  if (error) {
    console.error("Product fetch error:", error.message)
    return
  }

  const container = document.getElementById("product-list")
  if (!container) return

  if (!products || !products.length) {
    container.innerHTML =
      "<p style='color:#FFD700; text-align:center;'>No products found 🚫</p>"
    return
  }

  container.innerHTML = products
    .map((p) => {
      const stockStatus =
        p.stock > 0
          ? `<span style="color:lightgreen; font-size:14px;">In Stock (${p.stock})</span>`
          : `<span style="color:red; font-size:14px;">Out of Stock</span>`

      return `
      <div class="card">
        <a href="product.html?id=${p.id}" style="text-decoration:none; color:inherit;">
          <img src="${
            p.image_url || "https://via.placeholder.com/200"
          }" alt="${p.name}">
          <h3 style="color:#FFD700">${p.name}</h3>
          <p style="color:#FFD700; font-weight:bold;">₹${p.price}</p>
          ${p.size ? `<p style="color:#FFD700">Size: ${p.size}</p>` : ""}
          <p>${stockStatus}</p>
        </a>
      </div>
    `
    })
    .join("")
}

// =========================
// 🔍 Filters & Search
// =========================
const searchInput = document.getElementById("searchInput")
const categoryFilter = document.getElementById("categoryFilter")
const priceSort = document.getElementById("priceSort")

if (searchInput) {
  searchInput.addEventListener("input", () => {
    loadProducts(
      searchInput.value,
      categoryFilter?.value || "",
      priceSort?.value || ""
    )
  })
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    loadProducts(
      searchInput?.value || "",
      categoryFilter.value,
      priceSort?.value || ""
    )
  })
}

if (priceSort) {
  priceSort.addEventListener("change", () => {
    loadProducts(
      searchInput?.value || "",
      categoryFilter?.value || "",
      priceSort.value
    )
  })
}

// =========================
// ✅ Initial Load
// =========================
loadProducts()

// =========================
// ✅ Real-time Product Updates
// =========================
supabase
  .channel("products-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "products" },
    () => {
      loadProducts(
        searchInput?.value || "",
        categoryFilter?.value || "",
        priceSort?.value || ""
      )
    }
  )
  .subscribe()

// =========================
// ✅ Redirect after Order
// =========================
window.redirectAfterOrder = function () {
  window.location.href = `${baseURL}/order-success.html`
}
