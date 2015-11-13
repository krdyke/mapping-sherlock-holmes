L.Control.EasyButton = L.Control.extend({
    options: {
        position:  'topleft',
        callback:  function(){ console.log( 'default in L.easyButton' )},
        id:        null,
        title:     '',
        icon:      'fa-circle fa-lg',
        builtIcon: null
    },

    initialize: function(uno, dos, tres){
        // the factory tacks on `undefined`
        // with some of the shorter signatures
        // so
        while( arguments[arguments.length - 1] === undefined ){
          Array.prototype.pop.call(arguments);
        }

        if( arguments[arguments.length-1] && typeof arguments[arguments.length-1] === "object" ){
            L.Util.setOptions( this, arguments[arguments.length-1] );
        }

        // if the uno argument is a string, set it
        if( uno && typeof uno  === "string"){
          this.options.icon = uno;
        }

        // if the dos argument is a function, set it
        if( dos && typeof dos === 'function'){
          L.Util.setOptions( this, { callback: dos});
        }
    },

    onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        this.link = L.DomUtil.create('a', 'leaflet-bar-part', container);
        this._buildIcon()
        this.link.href = '#';
        this.link.title = this.options.title;

        L.DomEvent.on(this.link, 'click', this._click, this);

        return container;
    },

    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        this.options.callback();
    },

    _buildIcon: function () {

      // does this look like html? (i.e. not a class)
      if( this.options.icon.match(/[&;=<>"']/) ){

        // if so, the user should have put in html
        // so move forward as such
        this.options.builtIcon = this.options.icon;

      } else { // figure out what the user wants
          this.options.icon = this.options.icon.trim();
          this.options.builtIcon = L.DomUtil.create('span', '', this.link);

          if( this.options.icon.indexOf('fa-') === 0 ){
            L.DomUtil.addClass(this.options.builtIcon, "fa fa-lg "  + this.options.icon)

          } else if ( this.options.icon.indexOf('glyphicon-') === 0 ) {
            L.DomUtil.addClass(this.options.builtIcon, "glyphicon " + this.options.icon)

          } else {
            L.DomUtil.addClass(this.options.builtIcon, /*rollwithit*/ this.options.icon)
          }

          this.options.id && (this.options.builtIcon.id = this.options.id);

          // make this a string so that it's easy to set innerHTML below
          this.options.builtIcon = this.options.builtIcon.outerHTML;
      }

      // put the builtIcon inside the button
      this.link.innerHTML = this.options.builtIcon;
      return;
    },
});

L.easyButton = function( first, second, third ) {
  var newControl = new L.Control.EasyButton( first, second, third );
  return newControl;
};
