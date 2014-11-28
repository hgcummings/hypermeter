module.exports = function(grunt){
    grunt.initConfig({
        mocha_istanbul: {
            coverage: {
                src: 'test', // a folder works nicely
                options: {
                    mask: '*.spec.js'
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
};
