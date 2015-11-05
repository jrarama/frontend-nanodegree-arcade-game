module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            options: {
                separator: '\n',
            },
            game: {
                src: [
                    './js/helpers.js',
                    './js/resources.js',
                    './js/entities.js',
                    './js/engine.js',
                    './js/app.js'
                ],
                dest: './build/game.js',
            }
        },
        uglify: {
            options: {
                mangle: false,    // Use if you want the names of your functions and variables unchanged
                compress: true
            },
            game: {
                files: {
                    './build/game.min.js': ['./build/game.js'],
                }
            }
        },
        jshint: {
            all: ['./js/**/*.js'],
            options: {
                undef: true,
                curly: true,
                eqnull: true,
                predef: ['console', 'window', 'document', 'Image', 'Resources',
                    'Player', 'Block', 'Enemy', 'Engine', 'Helpers'
                ]
            }
        },
        watch: {
            scripts: {
                files: ['Gruntfile.js', './js/**/*.js'],
                tasks: ['jshint:all', 'concat:game', 'uglify:game'],
                options: {
                    livereload: true
                },
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch']);

};
