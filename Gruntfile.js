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
                        'lib/jquery/jquery.js',
                        'lib/jquery-ui-1.9.2.custom/js/jquery-ui-1.9.2.custom.js',
                        'exlib/classList.js',
                        'lib/reqwest/reqwest.js',
                        'lib/vex/vex.js',
                        'lib/vex/vex.dialog.js'
                    ]
                }
            }
        },
        concat: {
            css: {
                src:[
                    'lib/leaflet/leaflet.css',
                    'lib/leaflet.EasyButton/easy-button.css',
                    'exlib/Control.Geocoder.css',
                    'lib/vex/vex.css',
                    'lib/vex/vex-theme-os.css',
                    'style.css'
                ],
                dest: 'build/styles.css'
            },
            src: {
                src: [
                    'lib/leaflet/leaflet-src.js',
                    'lib/Leaflet.EasyButton/easy-button.js',
                    'exlib/Control.Geocoder.js',
                    'lib/leaflet-slider/SliderControl.js',
                    'exlib/L.Polyline.SnakeAnim.js',
                    'src/script.js'
                ],
                dest: 'build/src.js'
            }
        },
        watch: {
            css: {
                files: ['style.css'],
                tasks: ['concat:css']
            },
            js: {
                files: ['src/script.js'],
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
