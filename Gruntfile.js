var requirejsCompileSkip = require('./tasks/requirejs-compile-skip.json');

var pkg = require('./package.json');

var pub = pkg.edulab.public;
var tmp = pkg.edulab.temp;
var bld = pkg.edulab.build;

module.exports = function (grunt) {


  // Project configuration.
  grunt.initConfig({

      turnOffPotatoDeclaration: {
          tmp: {
              expand: true,
              src: [
                  tmp + '*/**/*.js',
                  tmp + 'app.js'
              ]
          }
      },
      ngAnnotate: {
          tmp: {
              expand: true,
              src: [
                  tmp + '*/**/*.js',
                  tmp + 'app.js'
              ],
              ext: '.js', // Dest filepaths will have this extension.
              extDot: 'last'
          }
      },
      turnOnPotatoDeclaration: {
          tmp: {
              expand: true,
              src: [
                  tmp + '*/**/*.js',
                  tmp + 'app.js'
              ]
          }
      },
      adjustTemplateUrls: {
          tmp: {
              options: {
                  from: 'app',
                  to: 'build'
              },
              expand: true,
              src: [
                  tmp + '*/**/*.*',
                  tmp + 'app.js'
              ]
          }
      },
      html2js: {
          options: {
              base: tmp,
              module: 'smart-templates',
              singleModule: true,
              rename: function (moduleName) {
                  return 'build/' + moduleName;
              }
          },
          main: {
              src: [tmp + '**/*.tpl.html'],
              dest: tmp + 'smart-templates.js'
          }
      },
      addIncludes:{
          options:{
              appFile: tmp + 'app.js',
              includesFile: tmp + 'includes.js'
          },
          templates:{
              options:{
                  angularModule: true,
                  wrapToDefine: true,
                  name: 'smart-templates',
                  injectToApp: true
              },
              src: [
                  tmp + 'smart-templates.js'
              ]

          }

      },
      uglify: {
          tmp: {
              expand: true,
              cwd: tmp,
              src: [
                  '**/*.js'
              ],
              dest: tmp,
              ext: '.js'
          }
      },

      clean: {
          pre: {
              options: {
                  force: true
              },
              src: [
                  bld,
                  tmp
              ]
          },
          post: {
              options: {
                  force: true
              },
              src: [
                  tmp
              ]
          }
      },
      copy: {
          pre: {
              expand: true,
              cwd: pub + 'app/',
              src: [
                  '**'
              ],
              dest: tmp
          },
          post: {
              expand: true,
              cwd: tmp,
              src: [
                  '*/**',
                  'rconfig.min.js',
                  '!**/*.tpl.html'
              ],
              dest: bld
          }
      },
      requirejs: {
          compile: {
              options: {
                  baseUrl: tmp,
                  paths: requirejsCompileSkip,
                  mainConfigFile: tmp + 'rconfig.min.js',
                  name: "main",
                  optimize: 'none',
                  uglify2: {
                      mangle: false
                  },
                  out: bld + 'main.js',
                  done: function (done, output) {
                      console.log('done requirejs');
                      done();
                  }
              }
          }
      },
    	cssmin: {
    	  target: {
    		files: [{
    		  expand: true,
    		  cwd: pub + 'styles/css',
    		  src: ['main.css'],
    		  dest: pub + 'styles/css',
    		  ext: '.min.css'
    		}]
    	  }
    	},
    	'string-replace':  {
    	  dist: {
    		options: {
    		  replacements: [
    			{
    			  pattern: '<script src="app/rconfig.min.js"></script>',
    			  replacement: '<script src="build/rconfig.min.js"></script>'
    			}, {
    			  pattern: '<script src="plugin/requirejs/require.js" data-main="app/main.js"></script>',
    			  replacement: '<script src="plugin/requirejs/require.js" data-main="build/main.js"></script>'
    			},
    			{
    				pattern: 'tealtheme.css',
    				replacement: 'tealtheme.min.css'
    			}
    		  ]
    		},
    		files: [
    		  {expand: true, flatten: true, src: [pub + 'index.html'], dest: pub}
    		]
    	  }
    	},
      sass: {
        dev: {
          options: {
            style: 'expanded',
            // tell Sass to look in the Bootstrap stylesheets directory when compiling
            loadPath: ['node_modules/bootstrap-sass/assets/stylesheets',
            './node_modules/font-awesome/scss/',
            './node_modules/bootstrap-sass/assets/fonts/**/*.*',
            './node_modules/font-awesome/fonts/*'
                        
            ]
          },
          files: [{
            expand: true,
            cwd: pub + 'styles/sass',
            src: ['main.scss'],
            dest: pub + 'styles/css',
            ext: '.css'
          }]
        }
      },
      watch: {
        scripts: {
          files: ['**/*.scss'],
          tasks: ['sass'],
          options: {
            spawn: false,
          },
        },
      }
  });


  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.loadNpmTasks('grunt-ng-annotate');

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.loadNpmTasks('grunt-html2js');
	
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
	grunt.loadNpmTasks('grunt-string-replace');

  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadTasks('tasks');


  grunt.registerTask('default', [
      'clean:pre',
      'copy:pre',
      'turnOffPotatoDeclaration',
      'ngAnnotate:tmp',
      'turnOnPotatoDeclaration',
      'adjustTemplateUrls',
      'html2js',
      'sass',
    	'cssmin',
    	'string-replace',
      'addIncludes',
      'uglify',
      'requirejs',
      'copy:post',
      'clean:post'

  ]);
};
