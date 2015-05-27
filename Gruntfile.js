module.exports = function(grunt) {
    grunt.initConfig({

        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2,
                    sourceMap: true,
                    sourceMapFilename: 'public/css/styles.css.map',
                    sourceMapURL: '/css/styles.css.map',
                    sourceMapBasepath: 'public',
                    sourceMapRootpath: '/'
                },
                files: {
                    'public/css/styles.css': 'app/public/less/styles.less'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['less']);
};