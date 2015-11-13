//vex stuff
vex.defaultOptions.className = 'vex-theme-os';

//textContent polyfill for IE8
if (Object.defineProperty &&
    Object.getOwnPropertyDescriptor &&
    Object.getOwnPropertyDescriptor(Element.prototype, "textContent") &&
    !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get) {
    (function() {
        var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
        Object.defineProperty(Element.prototype, "textContent",
            {
                get: function() {
                    return innerText.get.call(this);
                },
                set: function(s) {
                    return innerText.set.call(this, s);
                }
            }
        );
    })();
}

//Array.indexOf polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.14
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        var k;
        if (this === null) {
            throw new TypeError('"this" is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = +fromIndex || 0;
        if (Math.abs(n) === Infinity) {
            n = 0;
        }
        if (n >= len) {
            return -1;
        }
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}


//add duplicate filtering to arrays
//from http://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array
Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};

var holmes_map = {};

holmes_map.TABLE_NAME = "sherlock_v2_copy";
holmes_map.QUERY_URL = "http://krdyke.cartodb.com/api/v2/sql?q=";
holmes_map.MAPBOX_KEY = "pk.eyJ1Ijoia3JkeWtlIiwiYSI6Ik15RGcwZGMifQ.IR_NpAqXL1ro8mFeTIdifg";
holmes_map.UNIQUE_COLOR_ARRAY = ['rgb(228,26,28)',
    'rgb(55,126,184)',
    'rgb(77,175,74)',
    'rgb(152,78,163)',
    'rgb(255,127,0)',
    'rgb(255,255,51)',
    'rgb(166,86,40)',
    'rgb(247,129,191)'];

holmes_map.story_array = ['a study in scarlet'];

holmes_map.toggle_story = function(story){
    story = story.replace(/'/g,"\'\'").toLowerCase();
    if (!holmes_map.story_array.contains(story)){
        holmes_map.story_array.push(story);
        holmes_map.story_array = holmes_map.story_array.unique();
    }
    else {
        holmes_map.story_array.splice(holmes_map.story_array.indexOf(story), 1);
    }
};

holmes_map.story_list = document.getElementById("story-list");
$(holmes_map.story_list).find("li").each(function(i,e){
    e.onclick = function(){
        this.classList.toggle("selected");
        holmes_map.toggle_story(this.textContent);
    };
});

holmes_map.base_marker_style = {
    radius: 12,
    color: "#000",
    weight: 1,
    opacity: 0.25,
    fillOpacity: 0.55
};

L.Icon.Default.imagePath = "/lib/leaflet/";

holmes_map.animate_story = {};

holmes_map.animate_story.play_button = L.easyButton({
    states:[
    {
        stateName: "play",
        icon:"fa-play fa-mapicon",
        onClick: function(control){
            holmes_map.map.fitBounds(holmes_map.cartodb_layer.getBounds());
            holmes_map.map.removeLayer(holmes_map.cartodb_layer);
            var a = holmes_map.animate_story.get_list_of_layers();
            var b = holmes_map.animate_story.sort_layers_by_charindex(a);
            var c = holmes_map.animate_story.add_tweener_polylines(b);
            var d = holmes_map.animate_story.create_layer_group(c);
            d.addTo(holmes_map.map).snakeIn();
            control.state("pause");
        },
        options:{position:"topright"}
    },
    {
        stateName: "pause",
        icon:"fa-pause fa-mapicon",
        onClick: function(control){
            holmes_map.cartodb_layer.addTo(holmes_map.map);
            holmes_map.animate_story.layer_group.remove();
            control.state("play");
        }
    }],
    position:"topright"
});

holmes_map.animate_story.sort_layers_by_charindex = function(layers_list){
    return layers_list.sort(function(a,b){
        a = a.feature.properties.charindex;
        b = b.feature.properties.charindex;

        if (a > b){
            return 1;
        }

        else if (b > a){
            return -1;
        }

        else {
            return 0;
        }
    });
};


holmes_map.animate_story.get_list_of_layers = function(){
    layers = [];
    for (var i in holmes_map.cartodb_layer._layers){
        layers.push(holmes_map.cartodb_layer._layers[i]);
    }
    return layers;
};


holmes_map.animate_story.add_tweener_polylines = function(layers){
    var l = [], g;
    for (var i = 0; i < layers.length; i++){
        l.push(layers[i]);
        if (i !== layers.length - 1){
            l.push(L.polyline([layers[i]._latlng,layers[i+1]._latlng],{
                color: "rgb(228, 26, 28)",
                opacity: 0.8,
                dashArray: "5,5"
            }));
        }
    }
    return l;
};


holmes_map.animate_story.create_layer_group = function(layers){
    holmes_map.animate_story.layer_group = L.layerGroup();
    holmes_map.animate_story.layer_group.options.snakingLayers = layers;
    holmes_map.animate_story.layer_group.options.snakingPause = 3000;
    return holmes_map.animate_story.layer_group;
};


holmes_map.select_story_button = L.easyButton(
    "<span class='title-text'>Select<br/>Stories</span>",
    function(btn, map){
        vex.dialog.open({
            message: "Please select the stories to view",
            input: holmes_map.story_list,
            callback: function(value){
                if (value){
                    holmes_map.update_story_selection();
                }
            },
            buttons: [
                vex.dialog.buttons.YES,
                vex.dialog.buttons.NO,
                $.extend({}, vex.dialog.buttons.NO, {
                    className: 'vex-dialog-button-notaplace',
                    text: 'All/None',
                click: function($vexContent, event) {
                    console.log("select all/none here");
                }})
            ]
        });
        $('.vex-overlay').height($(document).height());
    },
    "Select stories",
    {
        "position": "topright",
        "id": "select-stories"
    }
);

/*
holmes_map.saveEditButton = L.easyButton(
    "fa-floppy-o fa-mapicon",
    function(btn,map){
        alert("save that shit!");
    },
    "Save your changes");
*/

/*
holmes_map.get_story_array = function(){
    var a = $("#title-select").val();
    if (a){
        //return a.map(function(v){return v.toLowerCase()});
        return a.map(function(v){return v});
    }
    return false;
};
*/

holmes_map.get_story_array = function(){
    return holmes_map.story_array;
};

holmes_map.cartodb_layer_click = function(a){
    var charindex = a.layer.feature.properties.charindex;
    var title = a.layer.feature.properties.storytitle;
    var name = a.layer.feature.properties.name;
    var chunk = a.layer.feature.properties.text_chunk.replace(name, "<b>" + name + "</b>");
    var popupContent = "<span class='vex-dialog-header'><span class='vex-dialog-story-title'>" + title + "</span><br/>"+
        "<b>Place: </b>" + name + "</span></span><br/><hr/>"+
        "<span class='vex-dialog-text'>... "+ chunk + " ...</span><br/><br/>"+
        "<input type='hidden' class='id-hidden' value='+" + a.layer._leaflet_id + "'/>";

    vex.dialog.open({
        message: popupContent,
        buttons: [
        $.extend({}, vex.dialog.buttons.NO, { className: 'vex-dialog-button-notaplace',
            text: 'This is not a place!',
        click: function($vexContent, event) {
            var id = $vexContent.find(".id-hidden").val();
            holmes_map.place_report(id, "not a place");
        }}),
        $.extend({}, vex.dialog.buttons.NO, { className: 'vex-dialog-button-wrongplace',
            text: 'This is in the wrong place!',
        click: function($vexContent, event) {
            var id = $vexContent.find(".id-hidden").val();
            holmes_map.place_report(id, "wrong place");
        }}),
        $.extend({}, vex.dialog.buttons.NO, { className: 'vex-dialog-button-onlymentioned',
            text: 'This place was only mentioned and not a part of the story.',
        click: function($vexContent, event) {
            var id = $vexContent.find(".id-hidden").val();
            holmes_map.place_report(id, "mention");
        }}),
        vex.dialog.buttons.YES
            ]
    });
    $('.vex-overlay').height($(document).height());
};


holmes_map.place_report = function(id, type){
    var cdb_id = holmes_map.cartodb_layer.getLayer(+id).feature.properties.cartodb_id;
    var query = "SELECT holmes_map_interaction(" + cdb_id + ",";
    switch (type){
        case "not a place":
            query = query + "'not_a_place');";
            break;
        case "wrong place":
            query = query + "'wrong_place');";
            break;
        case "mention":
            query = query + "'only_mentioned');";
            break;
    }

    //TODO need to add some sort of cache invalidating URL param...
    $("#loading").show();
    holmes_map.sql(query, function(resp){
        console.log(resp);
        $("#loading").hide();
        holmes_map.update_layer();
    },"none");

};

holmes_map.set_query = function(story_array){
    var array, story_string, query;
    if (!story_array){
        array = holmes_map.get_story_array();
    }
    else {
        array = story_array;
    }
    story_string = "('" + array.join("', '") + "')";
    query = holmes_map.base_query + " WHERE lower(storytitle) IN " + story_string;
    query = query + holmes_map.exclude_marked;
    holmes_map.last_query = query;
};

holmes_map.update_layer = function(){
    holmes_map.sql(holmes_map.last_query, function(geojson){
        var a = holmes_map.get_story_array();
        holmes_map.cartodb_layer.addData(geojson);
        holmes_map.cartodb_layer.setStyle(function(feature){
            var i = a.indexOf(feature.properties.storytitle.toLowerCase()) % 8;
            if (i >= 0){
                return {"fillColor": holmes_map.UNIQUE_COLOR_ARRAY[i]};
            }
            else {
                console.log("STORY NOT FOUND: " + feature.properties.storytitle);
            }
        });
        $("#loading").hide();
    });
};

holmes_map.update_story_selection = function(){
    var query;
    var story_array = holmes_map.get_story_array();

    holmes_map.cartodb_layer.clearLayers();
    if (story_array){
        holmes_map.set_query(story_array);
        $("#loading").show();
        holmes_map.update_layer();
    }
};

holmes_map.zoom_to_full_extent_button = L.easyButton(
    "fa-globe fa-mapicon",
    function(){
        holmes_map.map.setZoom(2);
    },
    "Zoom to global scale");

/*
holmes_map.editLayerFunc = function(id){
    var layer = holmes_map.markers.getLayer(id);
    holmes_map.editLayer.addLayer(layer);

    if (layer.hasOwnProperty("_spiderLeg")){
        holmes_map.map.removeLayer(layer._spiderLeg);
    }

    holmes_map.markers._removeLayer(layer);
    vex.close();
    layer.editing.enable();
    holmes_map.saveEditButton.addTo(holmes_map.map);
    $("#save-edit-button").parent().addClass("leaflet-disabled");
};

holmes_map.EditingIcon = L.divIcon({className: 'css-icon'});
*/


function main() {
    var map, chosen;
    holmes_map.map = new L.Map('map', {
        center: [0,0],
        zoom: 2
    });

    map = holmes_map.map;
    L.tileLayer('https://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 19,
            id: 'krdyke.29c2c93d',
            accessToken: 'pk.eyJ1Ijoia3JkeWtlIiwiYSI6Ik15RGcwZGMifQ.IR_NpAqXL1ro8mFeTIdifg'
    }).addTo(map);
/*
    holmes_map.holmes_slider = L.control.slider(function(value) {console.log(value);},{
        "id": "holmes_map.holmes_slider",
        "increment": true,
        "collapsed": false
    }).addTo(map);
*/
    //holmes_map.oms = new OverlappingMarkerSpiderfier(map);

    holmes_map.select_story_button.addTo(map);
    holmes_map.animate_story.play_button.addTo(map);
    holmes_map.zoom_to_full_extent_button.addTo(map);

    /*
    holmes_map.editLayer = new L.FeatureGroup()
        .setStyle({"fill":true,"weight":50,"color":"red"});
    holmes_map.editLayer.on("layeradd",function(f){
        f.layer.setIcon(holmes_map.EditingIcon);
    });

    map.addLayer(holmes_map.editLayer);
    */

    var geocode = new L.Control.Geocoder({
        "position" : "topleft",
        "geocoder" : new L.Control.Geocoder.mapbox(holmes_map.MAPBOX_KEY)
    }).addTo(map);

    geocode.markGeocode = function(result){
        var bbox = result.bbox;
        var poly = L.polygon([
             bbox.getSouthEast(),
             bbox.getNorthEast(),
             bbox.getNorthWest(),
             bbox.getSouthWest()
        ], {"opacity": 0.4,
            "weight": 2,
            "color": 'rgb(228,26,28)',
            "className": "geocode-bbox"}
        );
        poly.addTo(map);
        map.fitBounds(bbox, {
            padding: [15,15]
        });
        setTimeout(function(){
            $(".geocode-bbox").animate({ opacity: 0 }, 1000, function() {
                   // Animation complete.
             });
        }, 2000);
    };

/*
    holmes_map.slider_toggle = L.easyButton({
        states:[
        {
            stateName: "contracted",
            icon:"fa-sliders fa-mapicon",
            onClick: function(control){
                holmes_map.map.removeLayer(holmes_map.cartodb_layer);
                holmes_map.slider_control.options.layer = holmes_map.cartodb_layer;
                holmes_map.slider_control.addTo(holmes_map.map).startSlider();
                holmes_map.slider_control_bar = L.easyBar([holmes_map.slider_control_left,
                    holmes_map.slider_control_right],
                    {
                        "position" :"topright",
                        "targetnode":holmes_map.slider_control._slider.get()[0],
                        "id": "arrow-bar"
                    }
                );
                holmes_map.slider_control_bar.addTo(holmes_map.map);
                control.state("expanded");
            },
            options:{position:"topright"}
        },
        {
            stateName: "expanded",
            icon:"fa-remove fa-mapicon",
            onClick: function(control){
                holmes_map.slider_control.remove();
                holmes_map.slider_control_bar.remove();
                holmes_map.cartodb_layer.addTo(holmes_map.map);
                control.state("contracted");
            }
        }],
        position:"topright"
    }).addTo(map);
    */
/*
    var searchControl = new L.esri.Geocoding.Controls.Geosearch({
        useMapBounds: false,
        zoomToResult: true,
        placeholder: "Find a place..."
    }).addTo(map);
*/
    /*
    holmes_map.drawControl = new L.Control.Draw({
        draw: false,
        edit: {
            featureGroup: holmes_map.editLayer,
            edit: false,
            remove: false
        }
    });
    map.addControl(holmes_map.drawControl);

    holmes_map.markers = L.markerClusterGroup({
        zoomToBoundsOnClick:true,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier:1.2,
        maxClusterRadius:50,
        singleMarkerMode:true
    });
    */

    //holmes_map.sql = new cartodb.SQL({ user: 'krdyke', format: 'geojson' });
    holmes_map.sql = function(query, callback, format){
        var format_str = '';
        if (format === "none"){
            format_str = "";
        }

        else {
            format_str = "&format=geojson";
        }
        return reqwest({
            url: holmes_map.QUERY_URL + encodeURIComponent(query) + format_str,
            method: "GET",
            type: "json",
            success: callback,
            error: function(err){
                console.log(err);
                $("#loading").hide();
            }
        });
    };

    holmes_map.base_query = "SELECT cartodb_id, text_chunk, name, charindex, storytitle, the_geom FROM " + holmes_map.TABLE_NAME;
    holmes_map.exclude_marked = " AND not_a_place IS NOT TRUE AND only_mentioned IS NOT TRUE AND wrong_place IS NOT TRUE";

/*
    var title_select = $("#title-select").detach();

    $(".leaflet-control-container .leaflet-top.leaflet-right")
        .append(title_select);
    chosen = title_select.chosen({
        inherit_select_classes: true
    })
    .change(holmes_map.update_story_selection);
*/

    //keep map from scrolling when scrolling through options
/*
    $(".chosen-container").bind('mousewheel DOMMouseScroll click drag dragstart dragend dblclick', function (e) {
        L.DomEvent.stopPropagation(e);
    });
  */

    holmes_map.set_query();
    holmes_map.sql(holmes_map.last_query,function(geojson) {
        var slider_control;
        holmes_map.cartodb_layer = L.geoJson(geojson,{
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, $.extend(holmes_map.base_marker_style,
                    {"fillColor": holmes_map.UNIQUE_COLOR_ARRAY[0]}
                ));
            }
        });

        holmes_map.cartodb_layer.on("click", holmes_map.cartodb_layer_click);

        map.addLayer(holmes_map.cartodb_layer);
/*
        holmes_map.slider_control = L.control.sliderControl({
            position: "topright",
            layer: holmes_map.cartodb_layer,
            follow: 1,
            range: false,
            noTime: true,
            slideAttribute: "charindex",
            displayAttribute: "name",
            comparatorFunc: function(a,b){
                if (a.feature.properties.charindex > b.feature.properties.charindex){
                    return 1;
                }
                else if (a.feature.properties.charindex < b.feature.properties.charindex){
                    return -1;
                }
                else {
                    return 0;
                }
            }
        });

        holmes_map.slider_control_right = L.easyButton(
            "fa-arrow-right fa-mapicon",
            function(btn,map){
                var val = holmes_map.slider_control._slider.slider("value");
                holmes_map.slider_control._slider.slider("value", val + 1);
            },
            "Next place",
            {
                "position" : "bottomright",

            });

        holmes_map.slider_control_left = L.easyButton(
            "fa-arrow-left fa-mapicon",
            function(btn,map){
                var val = holmes_map.slider_control._slider.slider("value");
                holmes_map.slider_control._slider.slider("value", val - 1);
            },
            "Previous place",
            {
                "position" : "bottomright",
            });

*/
    });
}
