# CollectionBuilder-CSV

CollectionBuilder-CSV is a robust and flexible "stand alone" template for creating digital collection and exhibit websites using Jekyll and a metadata CSV.
Driven by your collection metadata, the template generates engaging visualizations to browse and explore your objects.
The resulting static site can be hosted on any basic web server (or built automatically using GitHub Actions).

Visit the [CollectionBuilder Docs](https://collectionbuilder.github.io/cb-docs/) for step-by-step details for getting started and building collections!

## Brief Overview of Building a Collection

The [CollectionBuilder Docs](https://collectionbuilder.github.io/cb-docs/) contain detailed information about building a collection from start to finish--including installing software, using Git/GitHub, preparing digital objects, and formatting metadata.
However, here is a super quick overview of the process:

- Make your own copy of this template repository by clicking the green "Use this Template" button on GitHub (see [repository set up docs](https://collectionbuilder.github.io/cb-docs/docs/repository/)). This copy of the template is the starting point for your "project repository", i.e. the source code for your digital collection site!
- Prepare your collection metadata following the CB-CSV template (see our demo [metadata template on Google Sheets](https://docs.google.com/spreadsheets/d/1nN_k4JQB4LJraIzns7WcM3OXK-xxGMQhW1shMssflNM/edit?usp=sharing) and [metadata docs](https://collectionbuilder.github.io/cb-docs/docs/metadata/csv_metadata/)). Your metadata will include links to your digital files (images, pdfs, videos, etc) and thumbnails wherever they are hosted.
- Add your metadata as a CSV to your project repository's "_data" folder (see [upload metadata docs](https://collectionbuilder.github.io/cb-docs/docs/metadata/uploading/)).
- Edit your project's "_config.yml" with your collection information (see [site configuration docs](https://collectionbuilder.github.io/cb-docs/docs/config/)). Additional customization is done via a theme file, configuration files, CSS tweaks, and more--however, once your "_config.yml" is edited your site is ready to be previewed. 
- Generate your site using Jekyll! (see docs for how to [use Jekyll locally](https://collectionbuilder.github.io/cb-docs/docs/repository/generate/) and [deploy on the web](https://collectionbuilder.github.io/cb-docs/docs/deploy/))

Please feel free to ask questions in the main [CollectionBuilder discussion forum](https://github.com/CollectionBuilder/collectionbuilder.github.io/discussions).

----------

## CollectionBuilder 

<https://collectionbuilder.github.io/>

CollectionBuilder is a project of University of Idaho Library's [Digital Initiatives](https://www.lib.uidaho.edu/digital/) and the [Center for Digital Inquiry and Learning](https://cdil.lib.uidaho.edu) (CDIL) following the [Lib-Static](https://lib-static.github.io/) methodology. 
Powered by the open source static site generator [Jekyll](https://jekyllrb.com/) and a modern static web stack, it puts collection metadata to work building beautiful sites.

The basic theme is created using [Bootstrap](https://getbootstrap.com/).
Metadata visualizations are built using open source libraries such as [DataTables](https://datatables.net/), [Leafletjs](http://leafletjs.com/), [Spotlight gallery](https://github.com/nextapps-de/spotlight), [lazysizes](https://github.com/aFarkas/lazysizes), and [Lunr.js](https://lunrjs.com/).
Object metadata is exposed using [Schema.org](http://schema.org) and [Open Graph protocol](http://ogp.me/) standards.

Questions can be directed to **collectionbuilder.team@gmail.com**

## License

CollectionBuilder documentation and general web content is licensed [Creative Commons Attribution-ShareAlike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/). 
This license does *NOT* include any objects or images used in digital collections, which may have individually applied licenses described by a "rights" field.
CollectionBuilder code is licensed [MIT](https://github.com/CollectionBuilder/collectionbuilder-csv/blob/master/LICENSE). 
This license does not include external dependencies included in the `assets/lib` directory, which are covered by their individual licenses.

## Polygon map overlay

The polygon overlay is separate from CollectionBuilder's item-map data: it draws polygon boundaries from GeoJSON, while item-map data places collection objects at their latitude and longitude. To use your own polygon data:

1. **Prepare the data.** Export your boundaries as a GeoJSON `FeatureCollection`. Each feature needs a `Polygon` or `MultiPolygon` geometry and coordinates in GeoJSON order: longitude, then latitude. Add a display name to each feature's `properties`; `name` is recommended (the overlay also recognizes `NAME` and `display_name`). For example:

   ```json
   {
     "type": "FeatureCollection",
     "features": [
       {
         "type": "Feature",
         "properties": { "name": "North District" },
         "geometry": {
           "type": "Polygon",
           "coordinates": [[[-117.2, 46.8], [-117.1, 46.8], [-117.1, 46.9], [-117.2, 46.8]]]
         }
       }
     ]
   }
   ```

2. **Add the data file.** Save the FeatureCollection in `assets/js/` as a JavaScript file, for example `assets/js/my-polygons.js`. Assign the GeoJSON object to the global variable `mapPolygons`:

   ```js
   var mapPolygons = {
     "type": "FeatureCollection",
     "features": [
       // Add the GeoJSON features here.
     ]
   };
   ```

   The map loads this script directly, so a plain `.geojson` file or a module export will not work without changing the loader.

3. **Include the overlay in the site.** If the target project does not already have this implementation, copy `assets/js/map-leaflet.js` (Leaflet) or `assets/js/map-esri.js` (ArcGIS), `_includes/js/map-js.html`, `_layouts/map.html`, and your polygon data file. This repository's `assets/js/map-polygons.js` is example mining-district data; replace it with your own data or use a different filename. Add a map page that uses `layout: map`. For Leaflet, keep the Leaflet libraries already included with the template.

4. **Point the map at your file.** In `_data/theme.yml`, set `polygon-data-file` to your filename in `assets/js/` (not the full path), and choose the provider. The default is `map-polygons.js`, so change it when using a different filename:

   ```yaml
   map_provider: leaflet # or esri
   polygon-data-file: my-polygons.js
   ```

   The `embed` provider displays an embedded map and does not load this overlay.

5. **Optionally connect polygons to collection items.** To list related objects in a polygon's popup, set `polygon-item-match-field` to the metadata column whose values match the polygon names:

   ```yaml
   polygon-item-match-field: district
   ```

   For example, if a feature has `properties.name: "North District"`, the `district` value on an item should be `North District`. Matching ignores letter case and accepts multiple values separated by commas or semicolons. The popup shows up to five related items and a link to browse more. Leave this setting blank if the polygons should not be matched to items.

6. **Build and check the map.** Confirm the map page loads, polygon shapes and labels appear in the expected locations, and—if item matching is enabled—click a polygon to verify its related-item links.
