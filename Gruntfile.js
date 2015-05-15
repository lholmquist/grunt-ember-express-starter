module.exports = function (grunt) {
    var path = require('path'),
        colors = require('colors'),
        escapeChar = process.platform.match(/^win/) ? '^' : '\\',
        cwd = process.cwd().replace(/( |\(|\))/g, escapeChar + '$1'),
        emberPath = path.resolve(cwd + '/client-app/node_modules/.bin/ember ');

    require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            livereload: {
                files: ['client-app/dist/assets/*.js', 'client-app/dist/assets/*.css'],
                options: {
                    livereload: true
                },
            },
            express: {
                files: ['bin/*', './app.js', 'server/**/*.js'],
                tasks: ['express:dev'],
                options: {
                    nospawn: true
                }
            }
        },
        express: {
            options: {
                script: './bin/www',
                output: 'Server is Running',
                delay: 1
            },
            dev: {
                options: {
                    debug: 'my-application'
                }
            }
        },
        bgShell: {
            ember: {
                cmd: emberPath + 'build --watch',
                execOpts: {
                    cwd: path.resolve(cwd + '/client-app')
                },
                bg: true,
                stdout: function (out) {
                    grunt.log.writeln('Ember-cli::'.cyan + out);
                },
                stderror: function (error) {
                    grunt.log.error('Ember-cli::'.red + error.red);
                }
            }
        },
        shell: {
            ember: {
                command: function (mode) {
                    switch (mode) {
                        case 'init':
                            return 'npm install';
                        case 'dev':
                            return emberPath + ' build';
                    }
                },
                options: {
                    execOptions: {
                        cwd: path.resolve(cwd + '/client-app/'),
                        stdout: false
                    }
                }
            },
            bower: {
                command: path.resolve(cwd + '/node_modules/.bin/bower --allow-root install'),
                options: {
                    stdout: true,
                    stdin: false
                }
            }
        }
    });

    grunt.registerTask('init', 'Prepare for dev', ['shell:ember:init', 'shell:bower', 'default']);

    grunt.registerTask('dev', 'Dev Mode; watch files and restart server on changes',
           ['bgShell:ember', 'express:dev', 'watch']);

    grunt.registerTask('default', 'just building off ember', ['shell:ember:dev']);
};
