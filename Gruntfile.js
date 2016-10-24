module.exports = function(grunt) {
    grunt.initConfig({

        less: {
            development: {
                options: {
                    compress: false,
                    yuicompress: false,
                    optimization: 2,
                    sourceMap: true,
                    sourceMapFilename: 'app/public/css/main.css.map',
                    sourceMapURL: '/css/main.css.map',
                    sourceMapBasepath: 'public',
                    sourceMapRootpath: '/'
                },
                files: {
                    'app/public/css/main.css': 'app/public/less/main.less'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['less']);
};