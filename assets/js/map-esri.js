require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer"
], function (Map, MapView, Graphic, GraphicsLayer) {

    // 1️⃣ Create the map
    const map = new Map({
        basemap: "topo-vector"
    });

    // 2️⃣ Create the view
    const view = new MapView({
        container: "map",
        map: map,
        center: [-113.08, 45.16], // adjust as needed
        zoom: 8
    });

    window._cbPolygonsEsriView = view;

    // 3️⃣ Create a GraphicsLayer for your polygons
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    // 4️⃣ Add polygons from your MiningDistricts_Polygons.js
    if (window.miningDistricts?.features?.length) {
        window.miningDistricts.features.forEach(f => {
            const graphic = new Graphic({
                geometry: {
                    type: "polygon",
                    rings: f.geometry.coordinates
                },
                attributes: {
                    NAME: f.properties.NAME || f.properties.name || "Unknown District",
                    // Keep original properties for modal lookup
                    properties: f.properties
                },
                symbol: {
                    type: "simple-fill",
                    color: [227, 139, 79, 0.6],
                    outline: { width: 1, color: [255, 255, 255, 0.5] }
                }
            });
            graphicsLayer.add(graphic);
        });
    }

    // 5️⃣ Tooltip div
    const tooltipDiv = document.createElement("div");
    tooltipDiv.style.position = "absolute";
    tooltipDiv.style.pointerEvents = "none";
    tooltipDiv.style.padding = "4px 6px";
    tooltipDiv.style.background = "rgba(255,255,255,0.9)";
    tooltipDiv.style.border = "1px solid #aaa";
    tooltipDiv.style.borderRadius = "4px";
    tooltipDiv.style.fontSize = "13px";
    tooltipDiv.style.display = "none";
    tooltipDiv.style.zIndex = 9999;
    document.body.appendChild(tooltipDiv);

    // 6️⃣ Hover highlight & tooltip
    let previousGraphic = null;

    // Make sure tooltipDiv is attached to map container
    view.container.appendChild(tooltipDiv); // only once

    // Listen for pointer moves
    view.on("pointer-move", async function (event) {
        const hit = await view.hitTest(event);
        const graphic = hit.results.find(r => r.graphic && r.graphic.layer === graphicsLayer)?.graphic;

        // Reset previous highlight if different
        if (previousGraphic && previousGraphic !== graphic) {
            previousGraphic.symbol = {
                type: "simple-fill",
                color: [227, 139, 79, 0.6],
                outline: { width: 1, color: [255, 255, 255, 0.5] }
            };
            previousGraphic = null;
        }

        if (graphic) {
            // Highlight current polygon
            graphic.symbol = {
                type: "simple-fill",
                color: [255, 200, 100, 0.8],
                outline: { width: 2, color: [255, 255, 255, 0.8] }
            };
            previousGraphic = graphic;

            // Position tooltip relative to cursor
            const tooltipOffset = 15;
            tooltipDiv.innerText = graphic.attributes.NAME || "Unknown";
            tooltipDiv.style.left = event.x + tooltipOffset + "px";
            tooltipDiv.style.top = event.y + tooltipOffset + "px";
            tooltipDiv.style.display = "block";
        } else {
            tooltipDiv.style.display = "none";
        }
    });

    // 7️⃣ Click to open modal
    view.on("click", async function (event) {
        const hit = await view.hitTest(event);
        const graphic = hit.results.find(r => r.graphic && r.graphic.layer === graphicsLayer)?.graphic;
        if (graphic) {
            const modalContent = window.buildDistrictHtml(graphic.attributes);
            window.openModal(modalContent.html, modalContent.title);
        }
    });

    // 8️⃣ Basemap gallery (optional)
    const basemapGalleryEl = document.createElement("arcgis-basemap-gallery");
    basemapGalleryEl.setAttribute("data-view-id", "mapView");
    basemapGalleryEl.style.cssText = "position:absolute;top:10px;right:10px;width:280px;height:400px;z-index:50;";
    document.body.appendChild(basemapGalleryEl);
});
