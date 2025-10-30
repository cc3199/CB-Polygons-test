(function () {
    // Normalize window.miningDistricts in-place: ensure rings are proper arrays and closed
    try {
        if (!window || !window.miningDistricts || !window.miningDistricts.features) return;
        var countFixed = 0;
        window.miningDistricts.features.forEach(function (f) {
            try {
                if (!f || !f.geometry || !f.geometry.coordinates) return;
                var type = f.geometry.type;
                if (type === 'Polygon') {
                    var rings = f.geometry.coordinates;
                    if (!Array.isArray(rings)) return;
                    for (var i = 0; i < rings.length; i++) {
                        var ring = rings[i];
                        if (!Array.isArray(ring)) continue;
                        if (ring.length > 0) {
                            var first = ring[0];
                            var last = ring[ring.length - 1];
                            if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
                                rings[i] = ring.concat([[first[0], first[1]]]);
                                countFixed++;
                            }
                        }
                    }
                    f.geometry.coordinates = rings;
                } else if (type === 'MultiPolygon') {
                    var polys = f.geometry.coordinates;
                    if (!Array.isArray(polys)) return;
                    for (var p = 0; p < polys.length; p++) {
                        var rings = polys[p];
                        if (!Array.isArray(rings)) continue;
                        for (var r = 0; r < rings.length; r++) {
                            var ring = rings[r];
                            if (!Array.isArray(ring)) continue;
                            if (ring.length > 0) {
                                var first = ring[0];
                                var last = ring[ring.length - 1];
                                if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
                                    rings[r] = ring.concat([[first[0], first[1]]]);
                                    countFixed++;
                                }
                            }
                        }
                        polys[p] = rings;
                    }
                    f.geometry.coordinates = polys;
                } else if (type === 'Point' || type === 'MultiPoint' || type === 'LineString' || type === 'MultiLineString') {
                    // nothing to do for these
                } else {
                    // defensive: if geometry has coordinates but no type, try to infer
                }
            } catch (e) { /* ignore feature-specific errors */ }
        });
        if (typeof console !== 'undefined' && console.info) console.info('miningDistricts normalization complete. rings closed:', countFixed);
    } catch (e) { if (typeof console !== 'undefined' && console.warn) console.warn('miningDistricts-normalize failed', e); }
})();
