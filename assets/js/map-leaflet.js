(function () {
    // Leaflet-only map initializer (expects helpers and window.geojsonData to be set by the include)
    try {
        if (window.mapProvider && window.mapProvider === 'esri') return; // don't run in Esri mode

        // Use shared builder provided by map include: window.buildPolygonHtml(feature)

        function initMap() {
            var map = L.map('map');
            window._cbPolygonsMap = map;

            var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}');
            var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}');
            var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

            var baseMaps = {
                "Esri World StreetMap": Esri_WorldStreetMap,
                "Esri National Geo": Esri_NatGeoWorldMap,
                "Esri Imagery": Esri_WorldImagery
            };
            L.control.layers(baseMaps).addTo(map);
            Esri_WorldStreetMap.addTo(map);

            var defaultPolygonStyle = { color: "#ff7800", weight: 2, opacity: 0.65, fillOpacity: 0.15 };
            var selectedLayer = null;
            var polygonSource = window.mapPolygons || { type: "FeatureCollection", features: [] };

            var polygonLayer = L.geoJson(polygonSource, {
                style: defaultPolygonStyle,
                onEachFeature: function (feature, layer) {
                    var polygonName = feature.properties.name || feature.properties.NAME || feature.properties.display_name || "Map Feature";
                    layer.on('click', function () {
                        try {
                            var built = (typeof window.buildPolygonHtml === 'function') ? window.buildPolygonHtml(feature) : { html: '', title: '' };
                            openModal(built.html, built.title);
                        } catch (err) { console.warn('Open modal failed', err); }
                    });
                    layer.bindTooltip(polygonName, { permanent: false, direction: 'center', className: 'polygon-label' });
                    layer.on({
                        mouseover: function (e) { var l = e.target; if (l !== selectedLayer) { l.setStyle({ weight: 3, fillOpacity: 0.45 }); if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) l.bringToFront(); } },
                        mouseout: function (e) { var l = e.target; if (l !== selectedLayer) polygonLayer.resetStyle(l); },
                        click: function (e) { var l = e.target; if (selectedLayer && selectedLayer !== l) polygonLayer.resetStyle(selectedLayer); selectedLayer = l; selectedLayer.setStyle({ weight: 3, fillOpacity: 0.6 }); }
                    });
                }
            }).addTo(map);
            var polygonBounds = polygonLayer.getBounds();
            if (polygonBounds && polygonBounds.isValid()) map.fitBounds(polygonBounds);
            else map.setView([0, 0], 2);

            // markers
            var markerLayer = window._mapUseCluster ? L.markerClusterGroup() : L.layerGroup();
            if (window.geojsonData && window.geojsonData.features && window.geojsonData.features.length) {
                window.geojsonData.features.forEach(function (feat) {
                    if (!feat.geometry || feat.geometry.type !== 'Point') return;
                    var coords = feat.geometry.coordinates; var lng = coords[0]; var lat = coords[1];
                    var props = feat.properties || {};
                    var title = props.title || props.display_name || '';
                    var objectid = props.objectid || props.ObjectID || null;
                    var ref = '#';
                    if (props && props.reference_url) ref = toAbsoluteUrl(props.reference_url);
                    else if (objectid) ref = toAbsoluteUrl(window._itemsBase + objectid + '.html');

                    var m = L.marker([lat, lng]);
                    // Use shared point modal builder when available
                    (function (p) {
                        m.on('click', function () {
                            try {
                                var built = (typeof window.buildPointModal === 'function') ? window.buildPointModal(p) : { html: '', title: '' };
                                openModal(built.html, built.title || '');
                            } catch (e) { console.warn('Marker modal open failed', e); }
                        });
                    })(props);
                    markerLayer.addLayer(m);
                });
                markerLayer.addTo(map);
            }
        }

        // run init
        try { initMap(); } catch (e) { console.warn('Leaflet map init failed', e); }
    } catch (e) { console.warn('map-leaflet.js load error', e); }
})();
