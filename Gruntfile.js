module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> built: <%= grunt.template.today("yyyy-mm-dd") %> */\r\n',
        footer: '\r\n/*! <%= pkg.author %> <%= grunt.template.today("yyyy") %> */',
        compress: {
          drop_console: true
        },
        mangle: true,
        report: 'gzip',
        preserveComments: false
      },
      build: {
        files: [{
            expand: true,
            src: '*.js',
            dest: 'build/plugins',
            cwd: 'plugins'
        },
        {
          src: '<%= pkg.name %>.js',
          dest: 'build/<%= pkg.name %>.js'
        }]
      }
    },
    copy: {
      target: {
        files: [{
          cwd: 'vendor',
          src: '**/*',
          dest: 'build/vendor',
          expand: true
        },
        {
          cwd: 'dist',
          src: '**/*',
          dest: 'build/dist',
          expand: true
        },
        {
          cwd: 'assets',
          src: ['**/*', '!*.css'],
          dest: 'build/assets',
          expand: true
        },
        {
          src: ['example.html', 'CONTRIB', 'README'],
          dest: 'build/example.html'
        }]
      }
    },
    cssmin: {
      minify: {
        expand: true,
        cwd: 'assets',
        src: ['*.css', '!*.min.css'],
        dest: 'build/assets/',
        ext: '.css'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['uglify','copy','cssmin']);
};