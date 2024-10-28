const DATA_PATH = "./data.json";
const TILE_SRC =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ";

const map = L.map("map").setView([51.505, -0.09], 13);
let rivers = {};
let selectedRiver;

const riverStyle_default = { color: "blue", weigth: 4 };
const riverStyle_selected = { color: "orange", weigth: 4 };

function loadRivers() {
  fetch(DATA_PATH)
    .then((response) => response.json())
    .then((data) => {
      L.geoJSON(data, {
        style: riverStyle_default,
        onEachFeature: (feature, layer) => {
          if (!feature.properties.name) return;

          const riverName = feature.properties.name.toLowerCase();

          // Create river label
          layer.bindTooltip(riverName, {
            permanent: true,
            direction: "center",
            className: "river-label",
          });

          if (!rivers[riverName]) rivers[riverName] = [];
          rivers[riverName].push(layer);
        },
      }).addTo(map);
    })
    .catch((err) => {
      console.error(err);
      alert("Could not load river data! Details in console.");
    });
}

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const searchTerm = e.target.value.toLowerCase();
  if (!rivers[searchTerm]) {
    alert("Could not find river!");
    return;
  }

  // Change selected colour for selected river
  if (selectedRiver)
    selectedRiver.forEach((x) => x.setStyle(riverStyle_default));
  selectedRiver = rivers[searchTerm];
  selectedRiver.forEach((x) => x.setStyle(riverStyle_selected));

  // Compute bounds for the selected river and focus the map
  const bounds = L.latLngBounds();
  selectedRiver.forEach((layer) => {
    bounds.extend(layer.getBounds());
  });
  map.fitBounds(bounds);
});

document.getElementById("toggleRiverNames").addEventListener("change", (e) => {
  const showNames = e.target.checked;
  Object.values(rivers).forEach((riverLayers) => {
    riverLayers.forEach((layer) => {
      if (showNames) {
        layer.openTooltip(); // Show tooltip
      } else {
        layer.closeTooltip(); // Hide tooltip
      }
    });
  });
});

L.tileLayer(TILE_SRC, {
  attribution: ATTRIBUTION,
  maxZoom: 16,
}).addTo(map);

loadRivers();
