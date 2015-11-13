module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bower: {
            //install bower packages. Default location is ./lib
            install:{
                options: {
                    layout: 'byType'
                }
            }
        },

        uglify: {
            target: {
                files: {
                    'build/libs.min.js': [
                        //'lib/cartodb.js/cartodb.uncompressed.js',
                        //'lib/esri-leaflet/esri-leaflet.js',
                        'lib/jquery/jquery.js',
                        'lib/jquery-ui-1.9.2.custom/js/jquery-ui-1.9.2.custom.js',
                        'exlib/classList.js',
                        'lib/reqwest/reqwest.js',
                        //'lib/esri-leaflet-geocoder/esri-leaflet-geocoder.js',
                        //'lib/leaflet.markerclusterer/dist/leaflet.markercluster.js',
                        //'lib/leaflet.draw/leaflet.draw-src.js',
                        'lib/vex/vex.js',
                        'lib/vex/vex.dialog.js',
                        //'lib/jqueryui-touch-punch/jquery.ui.touch-punch.js'
                       // 'lib/chosen/chosen.jquery.min.js'

                    ]
                }
            }
        },
        concat: {
            css: {
                src:[
                    'exlib/Control.Geocoder.css'
                ],
                dest: 'build/style.css'
            },
            /*
            libs: {
                src: [
                    'lib/cartodb.js/cartodb.js'
                    //'lib/esri-leaflet/esri-leaflet.js',
                    //'lib/jquery-ui-1.9.2.custom/js/jquery-ui-1.9.2.custom.min.js',
                    //'exlib/Control.Geocoder.js',
                    //'lib/esri-leaflet-geocoder/esri-leaflet-geocoder.js',
                    //'lib/leaflet.markerclusterer/dist/leaflet.markercluster.js',
                    //'lib/leaflet.draw/leaflet.draw-src.js',
                    //'lib/vex/vex.combined.min.js',
                    //'lib/jqueryui-touch-punch/jquery.ui.touch-punch.min.js'
                   // 'lib/chosen/chosen.jquery.min.js'
                ],
                dest: 'build/libs.js'
            },
            */
            src: {
                src: [
                    'lib/leaflet/leaflet-src.js',
                    'lib/Leaflet.EasyButton/easy-button.js',
                    'exlib/Control.Geocoder.js',
                    'lib/leaflet-slider/SliderControl.js',
                    'lib/Leaflet.Polyline.SnakeAnim/L.Polyline.SnakeAnim.js',
                    'src/script.js'
                ],
                dest: 'build/src.js'
            }
        },
        watch: {
            scripts: {
                files: 'src/script.js',
                tasks: ['concat:src']
            }
        }
    });

    //Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Default task(s).
    grunt.registerTask('default', ['bower','concat','uglify']);

};
