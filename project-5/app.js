const rosterUrl = "https://jsonplaceholder.typicode.com/users?_limit=10";
// Fake API to fetch 10 random providers

const clockUrl = "https://worldtimeapi.org/api/timezone/Asia/Kolkata";
// Real time API to sync with internet clock (IST)

// All major UI components selected once to improve performance
const providerSelect = document.getElementById("providerSelect");
const dateInput = document.getElementById("dateInput");
const loadSlotsBtn = document.getElementById("loadSlotsBtn");
const refreshBtn = document.getElementById("refreshBtn");
const slotsGrid = document.getElementById("slotsGrid");
const slotsHeadline = document.getElementById("slotsHeadline");
const slotMeta = document.getElementById("slotMeta");
const bookingsList = document.getElementById("bookingsList");
const clearBookingsBtn = document.getElementById("clearBookingsBtn");
const statProviders = document.getElementById("statProviders");
const statBookings = document.getElementById("statBookings");
const statClock = document.getElementById("statClock");
const lastSync = document.getElementById("lastSync");

// Modal elements
const confirmModal = new bootstrap.Modal(
  document.getElementById("confirmModal")
);
const confirmTitle = document.getElementById("confirmTitle");
const confirmMeta = document.getElementById("confirmMeta");
const confirmBtn = document.getElementById("confirmBtn");
const notesInput = document.getElementById("notesInput");

// Tracks current app state in one place
const state = {
  providers: [], // list of all providers
  nowUtc: null, // synced internet clock
  target: null, // currently selected provider + date
  bookings: [], // all booked slots
  pendingSlot: null, // temporary slot before confirmation
};


function readBookings() {
  // Get bookings from LocalStorage or use empty array
  state.bookings = JSON.parse(
    localStorage.getItem("quickslot-bookings") || "[]"
  );
}


function saveBookings() {
  localStorage.setItem("quickslot-bookings", JSON.stringify(state.bookings));
  statBookings.textContent = state.bookings.length; // Update dashboard stat
}

async function fetchProviders() {
  providerSelect.disabled = true;
  providerSelect.innerHTML = `<option>Loading roster…</option>`;

  try {
    const res = await fetch(rosterUrl);
    const data = await res.json();

    // Map API data to simple provider objects
    state.providers = data.map((person) => ({
      id: person.id,
      name: person.name,
      specialty: person.company?.bs || "Generalist",
      city: person.address?.city || "Remote",
    }));

    statProviders.textContent = state.providers.length;
    renderProviderSelect();
  } catch (err) {
    providerSelect.innerHTML = `<option>Error loading providers</option>`;
    console.error(err);
  }
}

function renderProviderSelect() {
  providerSelect.disabled = false;
  providerSelect.innerHTML = `<option value="">Select provider</option>`;

  // Create <option> for each provider
  state.providers.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} — ${p.specialty}`;
    providerSelect.appendChild(opt);
  });
}


async function syncClock() {
  try {
    const res = await fetch(clockUrl);
    const data = await res.json();

    // Convert string date to JS Date()
    state.nowUtc = new Date(data.datetime);

    // Show time on UI
    statClock.textContent = state.nowUtc.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    lastSync.textContent = `Last synced ${new Date().toLocaleTimeString(
      "en-IN"
    )}`;
  } catch (err) {
    // fallback when time API fails
    console.warn("Clock sync failed, falling back to client time", err);

    state.nowUtc = new Date(); // local time
    statClock.textContent = state.nowUtc.toLocaleTimeString("en-IN");
    lastSync.textContent = `Fallback to client ${new Date().toLocaleTimeString(
      "en-IN"
    )}`;
  }
}