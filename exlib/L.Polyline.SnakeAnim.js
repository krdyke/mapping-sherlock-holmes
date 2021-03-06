///// FIXME: Use path._rings instead of path._latlngs???
///// FIXME: Panic if this._map doesn't exist when called.
///// FIXME: Implement snakeOut()
///// FIXME: Implement layerGroup.snakeIn() / Out()
L.Polyline.include({

	// Hi-res timestamp indicating when the last calculations for vertices and
	// distance took place.
	_snakingTimestamp: 0,

	// How many rings and vertices we've already visited
	// Yeah, yeah, "rings" semantically only apply to polygons, but L.Polyline
	// internally uses that nomenclature.
	_snakingRings: 0,
	_snakingVertices: 0,

	// Distance to draw (in screen pixels) since the last vertex
	_snakingDistance: 0,

	// Flag
	_snaking: false,


	/// TODO: accept a 'map' parameter, fall back to addTo() in case
	/// performance.now is not available.
	snakeIn: function(){

		if (this._snaking) { return; }

		if ( !('performance' in window) ||
		     !('now' in window.performance) ||
		     !this._map) {
			return;
		}

		this._snaking = true;
		this._snakingTime = performance.now();
		this._snakingVertices = this._snakingRings = this._snakingDistance = 0;

		if (!this._snakeLatLngs) {
			this._snakeLatLngs = L.Polyline._flat(this._latlngs) ?
				[ this._latlngs ] :
				this._latlngs ;
		}

		// Init with just the first (0th) vertex in a new ring
		// Twice because the first thing that this._snake is is chop the head.
		this._latlngs = [[ this._snakeLatLngs[0][0], this._snakeLatLngs[0][0] ]];

		this._update();
		this._snake();
		this.fire('snakestart');
		return this;
	},


	_snake: function(){

		var now = performance.now();
		var diff = now - this._snakingTime;	// In milliseconds
		var forward = diff * this.options.snakingSpeed / 1000;	// In pixels
		this._snakingTime = now;

		// Chop the head from the previous frame
		this._latlngs[ this._snakingRings ].pop();

		return this._snakeForward(forward);
	},

	_snakeForward: function(forward) {
        var currLatLng = this._snakeLatLngs[ this._snakingRings ][ this._snakingVertices ];
        var nextLatLng = this._snakeLatLngs[ this._snakingRings ][ this._snakingVertices + 1 ];
		// Calculate distance from current vertex to next vertex
		var currPoint = this._map.latLngToContainerPoint(currLatLng);
		var nextPoint = this._map.latLngToContainerPoint(nextLatLng);

		var distance = currPoint.distanceTo(nextPoint);

        this._map.fitBounds(L.latLngBounds(currLatLng, nextLatLng), {
			paddingTopLeft: [15,0],
			paddingBottomRight: [5,0]
		});

// 		console.log('Distance to next point:', distance, '; Now at: ', this._snakingDistance, '; Must travel forward:', forward);
// 		console.log('Vertices: ', this._latlngs);

		if (this._snakingDistance + forward > distance) {
			// Jump to next vertex
			this._snakingVertices++;
			this._latlngs[ this._snakingRings ].push( this._snakeLatLngs[ this._snakingRings ][ this._snakingVertices ] );

			if (this._snakingVertices >= this._snakeLatLngs[ this._snakingRings ].length - 1 ) {
				if (this._snakingRings >= this._snakeLatLngs.length - 1 ) {
					return this._snakeEnd();
				} else {
					this._snakingVertices = 0;
					this._snakingRings++;
					this._latlngs[ this._snakingRings ] = [
						this._snakeLatLngs[ this._snakingRings ][ this._snakingVertices ]
					];
				}
			}

			this._snakingDistance -= distance;
			return this._snakeForward(forward);
		}

		this._snakingDistance += forward;

		var percent = this._snakingDistance / distance;

		var headPoint = nextPoint.multiplyBy(percent).add(
			currPoint.multiplyBy( 1 - percent )
		);

		// Put a new head in place.
		var headLatLng = this._map.containerPointToLatLng(headPoint);
		this._latlngs[ this._snakingRings ].push(headLatLng);

		this.setLatLngs(this._latlngs);
		this.fire('snake');
		L.Util.requestAnimFrame(this._snake, this);
	},

	_snakeEnd: function() {

		this.setLatLngs(this._snakeLatLngs);
		this._snaking = false;
		this.fire('snakeend');

	}

});

L.Polyline.mergeOptions({
	snakingSpeed: 175	// In pixels/sec
});

L.LayerGroup.include({

	_snakingLayers: [],
	_snakingLayersDone: 0,

	snakeIn: function() {
		var counter = 0;

		if ( !('performance' in window) ||
		     !('now' in window.performance) ||
		     !this._map ||
		     this._snaking) {
			return;
		}

		this._snaking = true;
		this._snakingLayers = [];
		this._snakingLayersDone = holmes_map.animate_story.pause_index || 0;


        if (this.options.snakingLayers){
            this._snakingLayers = this.options.snakingLayers;
        }

        else {
            var keys = Object.keys(this._layers);
            for (var i in keys) {
                var key = keys[i];
                this._snakingLayers.push(this._layers[key]);
            }
        }
		this.clearLayers();
		if (this._snakingLayersDone > 0){
			while (counter < this._snakingLayersDone){
				this.addLayer(this._snakingLayers[counter]);
				counter++;
			}

		}

		this.fire('snakestart');
		return this._snakeNext();
	},


	_snakeNext: function() {
		var current_txt = $("#snake-text-story").text();
		var txt;

		var that = this;

		if (this._snakingLayersDone >= this._snakingLayers.length ||
			this._stop_snaking) {
			this.fire('snakeend');
			this._snaking = false;
			if (this._stop_snaking){
				holmes_map.animate_story.pause_index = this._snakingLayersDone;
			}
			return;
		}

		var currentLayer = this._snakingLayers[this._snakingLayersDone];

		this._snakingLayersDone++;

		this.addLayer(currentLayer);
		if ('snakeIn' in currentLayer) {

			currentLayer.once('snakeend', function(){
				setTimeout(this._snakeNext.bind(this), this.options.snakingPause);
			}, this);
			$("#snake-text-header").fadeOut(100, function(){
				if (that._snakingLayers[that._snakingLayersDone-2].feature){
					$("#snake-text-header").text(that._snakingLayers[that._snakingLayersDone-2].feature.properties.name +
							" to " +
							that._snakingLayers[that._snakingLayersDone].feature.properties.name)
							.fadeIn(100);
				}
			});

			txt = that._snakingLayers[that._snakingLayersDone].feature.properties.text_chunk;
			txt = "... " + txt.slice(txt.length/4, (txt.length/4)*3) + " ...";
			if (current_txt !== txt){
				$("#snake-text-story").fadeOut(100, function(){
					$("#snake-text-story").text(txt).fadeIn(100);
				});
			}

			currentLayer.snakeIn();

		} else {
			setTimeout(this._snakeNext.bind(this), this.options.snakingPause);
			$("#snake-text-header").fadeOut(100, function(){
				$("#snake-text-header").text(currentLayer.feature.properties.name).fadeIn(100);
			});

			txt = currentLayer.feature.properties.text_chunk;
			txt = "... " + txt.slice(txt.length/4, (txt.length/4)*3) + " ...";
			if (current_txt !== txt){
				$("#snake-text-story").fadeOut(100, function(){
					$("#snake-text-story").text(txt).fadeIn(100);
				});
			}
		}





		this.fire('snake');
		return this;
	}

});


L.LayerGroup.mergeOptions({
	snakingPause: 500
});
