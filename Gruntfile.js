module.exports = function(grunt) {
    grunt.initConfig({

        less: {
            development: {
                options: {
                    compress: false,
                    yuicompress: false,
                    optimization: 2,
                    sourceMap: true,
                    sourceMapFilename: 'app/public/css/styles.css.map',
                    sourceMapURL: '/css/styles.css.map',
                    sourceMapBasepath: 'public',
                    sourceMapRootpath: '/'
                },
                files: {
                    'app/public/css/styles.css': 'app/public/less/styles.less'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['less']);
};