
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const KEYS = {
    cars: "velocity_motors_cars_v3",
    enquiries: "velocity_motors_enquiries_v3",
    adminPasscode: "velocity_motors_admin_passcode_v1",
    theme: "velocity_motors_theme_v1"
  };

  const money = amount => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);

  const sampleCars = [
    {id:"v101",name:"Hyundai Creta",brand:"Hyundai",condition:"New",category:"SUV",fuel:"Petrol",price:1250000,year:2025,description:"Automatic · Feature-rich family SUV",featured:true,image:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80"},
    {id:"v102",name:"BMW 5 Series",brand:"BMW",condition:"Used",category:"Luxury",fuel:"Diesel",price:5850000,year:2022,description:"Executive comfort · Carefully selected",featured:true,image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80"},
    {id:"v103",name:"Toyota Innova Hycross",brand:"Toyota",condition:"New",category:"SUV",fuel:"Hybrid",price:2450000,year:2025,description:"Hybrid power · Spacious family car",featured:true,image:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80"},
    {id:"v104",name:"Honda City",brand:"Honda",condition:"Used",category:"Sedan",fuel:"Petrol",price:925000,year:2021,description:"Comfortable sedan · Smooth drive",featured:false,image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80"},
    {id:"v105",name:"Maruti Suzuki Swift",brand:"Maruti Suzuki",condition:"New",category:"Hatchback",fuel:"Petrol",price:725000,year:2025,description:"City-friendly · Easy to drive",featured:false,image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"},
    {id:"v106",name:"Mercedes-Benz GLE",brand:"Mercedes-Benz",condition:"Used",category:"Luxury",fuel:"Diesel",price:8950000,year:2023,description:"Premium SUV · Refined comfort",featured:true,image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80"},
    {id:"v107",name:"Tata Nexon",brand:"Tata",condition:"Used",category:"SUV",fuel:"Petrol",price:825000,year:2022,description:"Compact SUV · Everyday versatility",featured:false,image:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80"},
    {id:"v108",name:"Porsche 911 Carrera",brand:"Porsche",condition:"Used",category:"Sports",fuel:"Petrol",price:16500000,year:2022,description:"Sports coupe · Enquire for details",featured:false,image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"},
    {id:"v109",name:"Audi A6",brand:"Audi",condition:"New",category:"Sedan",fuel:"Petrol",price:6890000,year:2025,description:"Executive sedan · Automatic",featured:false,image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80"}
  ];

  function readStore(key, fallback) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return Array.isArray(data) ? data : fallback;
    } catch {
      return fallback;
    }
  }

  let cars = readStore(KEYS.cars, sampleCars);
  let enquiries = readStore(KEYS.enquiries, []);
  let category = "all";
  let toastTimer;
  let adminUnlocked = false;

  if (!localStorage.getItem(KEYS.cars)) saveCars();

  function saveCars() {
    try { localStorage.setItem(KEYS.cars, JSON.stringify(cars)); }
    catch { toast("Could not save data in this browser."); }
  }

  function saveEnquiries() {
    try { localStorage.setItem(KEYS.enquiries, JSON.stringify(enquiries)); }
    catch { toast("Could not save enquiries in this browser."); }
  }

  function toast(message) {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2800);
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.body.classList.add("dialog-open");
  }

  function closeDialog(dialog) {
    if (dialog.open && typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    if (!$("dialog[open]")) document.body.classList.remove("dialog-open");
  }

  $$("dialog").forEach(dialog => {
    dialog.addEventListener("close", () => {
      if (!$("dialog[open]")) document.body.classList.remove("dialog-open");
      if (dialog.id === "adminDialog") {
        adminUnlocked = false;
        $("#adminPanel").hidden = true;
        $("#adminAccess").hidden = false;
        $("#adminAccessForm").reset();
        $("#accessFeedback").textContent = "";
      }
    });
    dialog.addEventListener("click", event => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  $("#currentYear").textContent = new Date().getFullYear();

  function setTheme(theme) {
    const dark = theme === "dark";
    document.body.dataset.theme = dark ? "dark" : "light";
    $("#themeToggle").textContent = dark ? "Light mode" : "Dark mode";
    $("#themeToggle").setAttribute("aria-pressed", String(dark));
    $("#themeToggle").setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
  }

  let savedTheme = "light";
  try { savedTheme = localStorage.getItem(KEYS.theme) || "light"; } catch {}
  setTheme(savedTheme);
  $("#themeToggle").addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try { localStorage.setItem(KEYS.theme, nextTheme); } catch {}
  });

  $("#menuToggle").addEventListener("click", () => {
    const nav = $("#nav");
    nav.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(nav.classList.contains("open")));
  });

  $$("#nav a").forEach(link => link.addEventListener("click", () => {
    $("#nav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
  }));

  function populateBrands() {
    const select = $("#brandFilter");
    const previous = select.value;
    const brands = [...new Set(cars.map(car => car.brand).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    select.innerHTML = '<option value="all">All brands</option>' +
      brands.map(brand => `<option value="${escapeHTML(brand)}">${escapeHTML(brand)}</option>`).join("");

    if (brands.includes(previous)) select.value = previous;
  }

  function getFilteredCars() {
    const query = $("#searchInput").value.trim().toLowerCase();
    const condition = $("#conditionFilter").value;
    const brand = $("#brandFilter").value;
    const fuel = $("#fuelFilter").value;
    const sort = $("#sortFilter").value;

    const result = cars.filter(car => {
      const searchable = [
        car.name, car.brand, car.condition, car.category,
        car.fuel, car.year, car.description
      ].join(" ").toLowerCase();

      return (!query || searchable.includes(query)) &&
        (condition === "all" || car.condition === condition) &&
        (brand === "all" || car.brand === brand) &&
        (fuel === "all" || car.fuel === fuel) &&
        (category === "all" || car.category === category);
    });

    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    if (sort === "year") result.sort((a, b) => b.year - a.year);
    if (sort === "featured") result.sort((a, b) => Number(b.featured) - Number(a.featured));

    return result;
  }

  function renderInventory() {
    const filtered = getFilteredCars();
    $("#resultCount").textContent = `${filtered.length} ${filtered.length === 1 ? "car" : "cars"} found`;
    $("#emptyState").hidden = filtered.length !== 0;

    $("#carGrid").innerHTML = filtered.map(car => `
      <article class="car-card">
        <div class="car-image">
          <img src="${escapeHTML(car.image || "")}"
               alt="${escapeHTML(car.name)}"
               loading="lazy"
               onerror="this.style.display='none'">
          <span class="car-badge">${escapeHTML(car.condition === "Used" ? "PRE-OWNED" : "NEW ARRIVAL")}</span>
        </div>
        <div class="car-body">
          <h3>${escapeHTML(car.name)}</h3>
          <p class="car-description">${escapeHTML(car.description || "Contact us for details")}</p>
          <div class="car-specs">
            <span>${escapeHTML(car.year)}</span>
            <span>${escapeHTML(car.fuel || "Contact us")}</span>
            <span>${escapeHTML(car.category)}</span>
          </div>
          <div class="car-footer">
            <div>
              <div class="car-price">${money(car.price)}</div>
              <div class="car-price-label">Indicative listing price</div>
            </div>
            <button class="button button-dark" data-view="${escapeHTML(car.id)}">View details →</button>
          </div>
        </div>
      </article>
    `).join("");

    $$("[data-view]").forEach(button => button.addEventListener("click", () => showVehicle(button.dataset.view)));
  }

  function showVehicle(id) {
    const car = cars.find(item => item.id === id);
    if (!car) return;

    $("#vehicleDetails").innerHTML = `
      <span class="eyebrow dark">VEHICLE DETAILS</span>
      <h2>${escapeHTML(car.name)}</h2>
      <p>${escapeHTML(car.description || "Contact the showroom for more information.")}</p>
      <h3>${money(car.price)}</h3>
      <p>${escapeHTML(car.condition)} · ${escapeHTML(car.year)} · ${escapeHTML(car.fuel || "Fuel details on request")} · ${escapeHTML(car.category)}</p>
      <p class="form-note">Confirm final price, condition and availability with the showroom.</p>
    `;

    $("#vehicleEnquiryForm").elements.carId.value = car.id;
    $("#vehicleFeedback").textContent = "";
    openDialog($("#vehicleDialog"));
  }

  function saveEnquiry(data) {
    enquiries.push({
      id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: "New",
      ...data
    });
    saveEnquiries();
    updateDashboard();
  }

  function updateDashboard() {
    $("#dashCarCount").textContent = cars.length;
    $("#dashNewCount").textContent = cars.filter(car => car.condition === "New").length;
    $("#dashUsedCount").textContent = cars.filter(car => car.condition === "Used").length;
    $("#dashEnquiryCount").textContent = enquiries.length;

    $("#adminCarList").innerHTML = cars.length ? cars.map(car => `
      <div class="admin-row">
        <div><strong>${escapeHTML(car.name)} — ${money(car.price)}</strong>
        <small>${escapeHTML(car.condition)} · ${escapeHTML(car.brand)} · ${escapeHTML(car.year)}</small></div>
        <div class="admin-row-actions">
          <button data-edit="${escapeHTML(car.id)}">Edit</button>
          <button data-delete="${escapeHTML(car.id)}">Delete</button>
        </div>
      </div>
    `).join("") : "<p>No vehicles listed.</p>";

    $("#adminEnquiries").innerHTML = enquiries.length ? [...enquiries].reverse().map(enquiry => `
      <div class="admin-row">
        <div><strong>${escapeHTML(enquiry.name || "Customer")} · ${escapeHTML(enquiry.interest || enquiry.type || "Vehicle enquiry")}</strong>
        <small>${escapeHTML(enquiry.phone || "")} · ${escapeHTML(enquiry.email || "")} · ${escapeHTML(enquiry.carName || "")}</small></div>
        <div class="admin-row-actions">
          <span>${escapeHTML(enquiry.status || "New")}</span>
          <button data-enquiry-delete="${escapeHTML(enquiry.id)}">Remove</button>
        </div>
      </div>
    `).join("") : "<p>No local enquiries yet.</p>";

    $$("[data-edit]").forEach(button => button.addEventListener("click", () => editCar(button.dataset.edit)));
    $$("[data-delete]").forEach(button => button.addEventListener("click", () => deleteCar(button.dataset.delete)));
    $$("[data-enquiry-delete]").forEach(button => button.addEventListener("click", () => {
      enquiries = enquiries.filter(item => item.id !== button.dataset.enquiryDelete);
      saveEnquiries();
      updateDashboard();
      toast("Local enquiry removed.");
    }));
  }

  function resetCarForm() {
    $("#carForm").reset();
    $("#carForm").elements.id.value = "";
    $("#carFormTitle").textContent = "Add a vehicle";
    $("#saveCarButton").textContent = "Save vehicle";
    $("#cancelEdit").hidden = true;
    $("#adminFeedback").textContent = "";
  }

  function editCar(id) {
    const car = cars.find(item => item.id === id);
    if (!car) return;

    const form = $("#carForm");
    ["id", "name", "brand", "condition", "category", "fuel", "price", "year", "image", "description"].forEach(key => {
      if (form.elements[key]) form.elements[key].value = car[key] ?? "";
    });

    $("#carFormTitle").textContent = `Edit ${car.name}`;
    $("#saveCarButton").textContent = "Update vehicle";
    $("#cancelEdit").hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function deleteCar(id) {
    const car = cars.find(item => item.id === id);
    if (!car || !confirm(`Remove ${car.name} from this browser's demo inventory?`)) return;

    cars = cars.filter(item => item.id !== id);
    saveCars();
    populateBrands();
    renderInventory();
    updateDashboard();
    toast("Vehicle removed from local demo inventory.");
  }

  ["searchInput", "conditionFilter", "brandFilter", "fuelFilter", "sortFilter"].forEach(id => {
    $("#" + id).addEventListener(id === "searchInput" ? "input" : "change", renderInventory);
  });

  $$("#categoryTabs button").forEach(button => button.addEventListener("click", () => {
    category = button.dataset.category;
    $$("#categoryTabs button").forEach(tab => tab.classList.toggle("active", tab === button));
    renderInventory();
  }));

  $("#clearFilters").addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#conditionFilter").value = "all";
    $("#brandFilter").value = "all";
    $("#fuelFilter").value = "all";
    $("#sortFilter").value = "featured";
    category = "all";
    $$("#categoryTabs button").forEach(tab => tab.classList.toggle("active", tab.dataset.category === "all"));
    renderInventory();
  });

  $("#contactForm").addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    saveEnquiry(data);
    $("#contactFeedback").textContent =
      "Saved in this browser demo only. The showroom has not received this enquiry.";
    event.currentTarget.reset();
    toast("Demo enquiry saved locally.");
  });

  $("#vehicleEnquiryForm").addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const car = cars.find(item => item.id === data.carId);
    saveEnquiry({
      ...data,
      carName: car?.name || "Vehicle enquiry",
      interest: "Vehicle enquiry"
    });
    $("#vehicleFeedback").textContent =
      "Saved locally only. The showroom has not received this enquiry.";
    event.currentTarget.reset();
    toast("Vehicle enquiry saved locally.");
  });

  function storedAdminPasscode() {
    try { return localStorage.getItem(KEYS.adminPasscode); } catch { return null; }
  }

  $("#adminButton").addEventListener("click", () => {
    const hasPasscode = Boolean(storedAdminPasscode());
    $("#adminAccess").hidden = false;
    $("#adminPanel").hidden = true;
    $("#accessTitle").textContent = hasPasscode ? "Unlock admin dashboard" : "Set an admin passcode";
    $("#accessDescription").textContent = hasPasscode
      ? "Enter your passcode to manage this browser's demo inventory and enquiries."
      : "Create a passcode to protect admin-only inventory and enquiry tools on this browser.";
    $("#accessSubmit").textContent = hasPasscode ? "Unlock dashboard" : "Set passcode";
    $("#accessFeedback").textContent = "";
    $("#adminAccessForm").reset();
    openDialog($("#adminDialog"));
  });

  $("#adminAccessForm").addEventListener("submit", event => {
    event.preventDefault();
    const passcode = new FormData(event.currentTarget).get("passcode");
    const savedPasscode = storedAdminPasscode();

    if (!savedPasscode) {
      try {
        localStorage.setItem(KEYS.adminPasscode, passcode);
      } catch {
        $("#accessFeedback").textContent = "Could not save the passcode in this browser.";
        return;
      }
    } else if (passcode !== savedPasscode) {
      $("#accessFeedback").textContent = "That passcode is incorrect. Please try again.";
      event.currentTarget.reset();
      return;
    }

    adminUnlocked = true;
    $("#adminAccess").hidden = true;
    $("#adminPanel").hidden = false;
    event.currentTarget.reset();
    resetCarForm();
    updateDashboard();
  });

  $("#cancelEdit").addEventListener("click", resetCarForm);

  $("#carForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const price = Number(data.price);
    const year = Number(data.year);

    if (!data.name.trim() || !data.brand.trim() || !Number.isFinite(price) || price <= 0 ||
        !Number.isInteger(year) || year < 1990 || year > 2035) {
      $("#adminFeedback").textContent = "Enter a valid car name, brand, positive price and model year.";
      return;
    }

    const existing = cars.find(car => car.id === data.id);
    const car = {
      ...data,
      id: existing ? existing.id : `local-${Date.now()}`,
      name: data.name.trim(),
      brand: data.brand.trim(),
      price,
      year,
      featured: existing ? Boolean(existing.featured) : false
    };

    cars = existing ? cars.map(item => item.id === car.id ? car : item) : [car, ...cars];
    saveCars();
    populateBrands();
    renderInventory();
    updateDashboard();
    resetCarForm();
    $("#adminFeedback").textContent = "Saved in this browser only.";
    toast("Demo inventory updated.");
  });

  $("#exportCsv").addEventListener("click", () => {
    const columns = ["name", "brand", "condition", "category", "fuel", "price", "year", "description"];
    const rows = [columns, ...cars.map(car => columns.map(key => car[key] ?? ""))];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "velocity-motors-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  $("#clearEnquiries").addEventListener("click", () => {
    if (!enquiries.length) return toast("No enquiries to clear.");
    if (!confirm("Clear all enquiries in this browser demo?")) return;
    enquiries = [];
    saveEnquiries();
    updateDashboard();
    toast("Local demo enquiries cleared.");
  });

  populateBrands();
  renderInventory();
  updateDashboard();
})();
