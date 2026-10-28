require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand"
], function (Map, MapView, Graphic, GraphicsLayer, BasemapGallery, Expand) {

    // Create the map
    const map = new Map({
        basemap: "topo-vector"
    });

    // Create the view
    const view = new MapView({
        container: "map",
        map: map,
        center: [0, 0],
        zoom: 2
    });

    window._cbPolygonsEsriView = view;

    // Create a GraphicsLayer for your polygons
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    // Add polygons
    const polygonSource = window.mapPolygons;
    if (polygonSource?.features?.length) {
        polygonSource.features.forEach(f => {
            const properties = f.properties || {};
            const graphic = new Graphic({
                geometry: {
                    type: "polygon",
                    rings: f.geometry.type === "MultiPolygon" ? f.geometry.coordinates.flat() : f.geometry.coordinates
                },
                attributes: {
                    NAME: properties.name || properties.NAME || properties.display_name || "Map Feature",
                    properties: properties
                },
                symbol: {
                    type: "simple-fill",
                    color: [227, 139, 79, 0.6],
                    outline: { width: 1, color: [255, 255, 255, 0.5] }
                }
            });
            graphicsLayer.add(graphic);
        });
        view.goTo(graphicsLayer.graphics.toArray()).catch(() => { });
    }

    // Tooltip div
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

    // Hover highlight
    let previousGraphic = null;
    view.on("pointer-move", async function (event) {
        const hit = await view.hitTest(event);
        const graphic = hit.results.find(r => r.graphic && r.graphic.layer === graphicsLayer)?.graphic;

        // Reset previous highlight
        if (previousGraphic && previousGraphic !== graphic) {
            previousGraphic.symbol = {
                type: "simple-fill",
                color: [227, 139, 79, 0.6],
                outline: { width: 1, color: [255, 255, 255, 0.5] }
            };
            previousGraphic = null;
        }

        // Highlight current polygon and show tooltip
        if (graphic) {
            graphic.symbol = {
                type: "simple-fill",
                color: [255, 200, 100, 0.8],
                outline: { width: 2, color: [255, 255, 255, 0.8] }
            };
            previousGraphic = graphic;

            // Position tooltip near cursor
            const offset = 15;
            tooltipDiv.innerText = graphic.attributes.NAME || "Unknown";
            tooltipDiv.style.left = event.native.x + offset + "px";
            tooltipDiv.style.top = event.native.y + offset + "px";
            tooltipDiv.style.display = "block";
        } else {
            tooltipDiv.style.display = "none";
        }
    });

    // Click to open modal
    view.on("click", async function (event) {
        const hit = await view.hitTest(event);
        const graphic = hit.results.find(r => r.graphic && r.graphic.layer === graphicsLayer)?.graphic;
        if (graphic) {
            const modalContent = window.buildPolygonHtml(graphic.attributes);
            window.openModal(modalContent.html, modalContent.title);
        }
    });

    // Basemap switcher using BasemapGallery widget
    const basemapGallery = new BasemapGallery({ view: view });
    const bgExpand = new Expand({
        view: view,
        content: basemapGallery,
        expandIconClass: "esri-icon-basemap", // uses built-in basemap icon
        expandTooltip: "Change Basemap"
    });
    view.ui.add(bgExpand, "top-right"); // top-right inside map view

});
