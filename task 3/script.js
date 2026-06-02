const API_URL =
  "https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags,currencies,cca3";

const grid = document.querySelector("#countries-grid");
const statusMessage = document.querySelector("#status");
const searchInput = document.querySelector("#search-input");
const regionFilter = document.querySelector("#region-filter");
const refreshButton = document.querySelector("#refresh-button");
const countryCount = document.querySelector("#country-count");
const cardTemplate = document.querySelector("#country-card-template");

let countries = [];

const numberFormatter = new Intl.NumberFormat("en-US");

function getCountryName(country) {
  return country.name?.common ?? "Unknown country";
}

function getCapital(country) {
  return country.capital?.[0] ?? "No official capital";
}

function getCurrency(country) {
  const currencies = Object.values(country.currencies ?? {});
  if (currencies.length === 0) {
    return "Not listed";
  }

  return currencies
    .map((currency) => currency.name)
    .filter(Boolean)
    .join(", ");
}

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = type === "error" ? "status error" : "status";
}

function setLoading(isLoading) {
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? "Loading" : "Refresh";
}

function populateRegions() {
  const currentValue = regionFilter.value;
  const regions = [...new Set(countries.map((country) => country.region))]
    .filter(Boolean)
    .sort();

  regionFilter.innerHTML = '<option value="all">All regions</option>';

  regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionFilter.append(option);
  });

  if (regions.includes(currentValue)) {
    regionFilter.value = currentValue;
  }
}

function getFilteredCountries() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedRegion = regionFilter.value;

  return countries.filter((country) => {
    const searchableText = [
      getCountryName(country),
      getCapital(country),
      country.region ?? "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(query);
    const matchesRegion =
      selectedRegion === "all" || country.region === selectedRegion;

    return matchesSearch && matchesRegion;
  });
}

function renderCountries() {
  const filteredCountries = getFilteredCountries();
  const fragment = document.createDocumentFragment();

  grid.innerHTML = "";
  countryCount.textContent = filteredCountries.length;

  if (countries.length === 0) {
    return;
  }

  if (filteredCountries.length === 0) {
    setStatus("No countries match your current filters.");
    return;
  }

  setStatus(`Showing ${filteredCountries.length} of ${countries.length} countries.`);

  filteredCountries.forEach((country) => {
    const card = cardTemplate.content.cloneNode(true);
    const flag = card.querySelector(".flag");
    const title = card.querySelector("h2");

    flag.src = country.flags?.png ?? "";
    flag.alt = country.flags?.alt ?? `Flag of ${getCountryName(country)}`;
    title.textContent = getCountryName(country);
    card.querySelector(".region").textContent = country.region ?? "Unlisted";
    card.querySelector(".capital").textContent = getCapital(country);
    card.querySelector(".population").textContent = numberFormatter.format(
      country.population ?? 0,
    );
    card.querySelector(".currency").textContent = getCurrency(country);

    fragment.append(card);
  });

  grid.append(fragment);
}

async function fetchCountries() {
  setLoading(true);
  setStatus("Loading country data...");
  grid.innerHTML = "";
  countryCount.textContent = "0";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`REST Countries returned ${response.status}`);
    }

    const data = await response.json();
    countries = data.sort((a, b) =>
      getCountryName(a).localeCompare(getCountryName(b)),
    );

    populateRegions();
    renderCountries();
  } catch (error) {
    countries = [];
    countryCount.textContent = "0";
    setStatus(
      `Could not load countries. ${error.message}. Please try again.`,
      "error",
    );
  } finally {
    setLoading(false);
  }
}

searchInput.addEventListener("input", renderCountries);
regionFilter.addEventListener("change", renderCountries);
refreshButton.addEventListener("click", fetchCountries);

fetchCountries();
