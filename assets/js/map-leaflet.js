(function () {
    // Leaflet-only map initializer (expects helpers and window.geojsonData to be set by the include)
    try {
        if (window.mapProvider && window.mapProvider === 'esri') return; // don't run in Esri mode

        // Use shared builder provided by map include: window.buildDistrictHtml(feature)

        function initMap() {
            var map = L.map('map').setView([45.16021327505953, -113.08185710423723], 8);
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

            var defaultDistrictStyle = { color: "#ff7800", weight: 2, opacity: 0.65, fillOpacity: 0.15 };
            var selectedLayer = null;

            var districtLayer = L.geoJson(miningDistricts, {
                style: defaultDistrictStyle,
                onEachFeature: function (feature, layer) {
                    var districtName = feature.properties.NAME || feature.properties.name || "Unknown District";
                    layer.on('click', function () {
                        try {
                            var built = (typeof window.buildDistrictHtml === 'function') ? window.buildDistrictHtml(feature) : { html: '', title: '' };
                            openModal(built.html, built.title);
                        } catch (err) { console.warn('Open modal failed', err); }
                    });
                    layer.bindTooltip(districtName, { permanent: false, direction: 'center', className: 'district-label' });
                    layer.on({
                        mouseover: function (e) { var l = e.target; if (l !== selectedLayer) { l.setStyle({ weight: 3, fillOpacity: 0.45 }); if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) l.bringToFront(); } },
                        mouseout: function (e) { var l = e.target; if (l !== selectedLayer) districtLayer.resetStyle(l); },
                        click: function (e) { var l = e.target; if (selectedLayer && selectedLayer !== l) districtLayer.resetStyle(selectedLayer); selectedLayer = l; selectedLayer.setStyle({ weight: 3, fillOpacity: 0.6 }); }
                    });
                }
            }).addTo(map);

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
