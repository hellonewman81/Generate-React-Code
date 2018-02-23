'use strict';

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');
const _ = require('lodash');

function createAllTemplates(
    name,
    directory,
    native,
    redux,
    omitComments,
    reduxCore,
    reduxCoreDirectory
) {
    const directories = getAllDirectories(
        name,
        directory,
        native,
        redux,
        reduxCore,
        reduxCoreDirectory
    );
    const placeholderNames = getAllPlaceholderNames(name);

    _.forEach(directories, (directory, key) => {
        createTemplate(directory, placeholderNames, omitComments);
        console.log(
            chalk.bold.blue(key),
            chalk.bold.green('file successfully created in'),
            chalk.bold.gray(directory.generated)
        );
    });

    function getAllDirectories(name, directory, native, redux, reduxCore, reduxCoreDirectory) {
        if (reduxCore) {
            return getReduxCoreDirs(reduxCoreDirectory);
        }
        return getReactComponentDirs(name, directory, native, redux);

        function getReduxCoreDirs(reduxCoreDirectory) {
            const templateDirectory = path.join(__dirname, 'templates', 'redux-core');
            const generatedDirectory = path.join(__dirname, '..', '..', reduxCoreDirectory);

            if (!fs.existsSync(generatedDirectory)) {
                shell.mkdir('-p', path.join(generatedDirectory, 'action-creator', 'test'));
            }

            return {
                store: {
                    template: path.join(templateDirectory, 'store.js'),
                    generated: path.join(generatedDirectory, 'store.js')
                },
                rootReducer: {
                    template: path.join(templateDirectory, 'root-reducer.js'),
                    generated: path.join(generatedDirectory, 'root-reducer.js')
                },
                createAction: {
                    template: path.join(templateDirectory, 'action-creator', 'create-action.js'),
                    generated: path.join(generatedDirectory, 'action-creator', 'create-action.js')
                },
                buildActionType: {
                    template: path.join(
                        templateDirectory,
                        'action-creator',
                        'build-action-type.js'
                    ),
                    generated: path.join(
                        generatedDirectory,
                        'action-creator',
                        'build-action-type.js'
                    )
                },
                createActionTest: {
                    template: path.join(
                        templateDirectory,
                        'action-creator',
                        'test',
                        'create-action.spec.js'
                    ),
                    generated: path.join(
                        generatedDirectory,
                        'action-creator',
                        'test',
                        'create-action.spec.js'
                    )
                },
                buildActionTypeTest: {
                    template: path.join(
                        templateDirectory,
                        'action-creator',
                        'test',
                        'build-action-type.spec.js'
                    ),
                    generated: path.join(
                        generatedDirectory,
                        'action-creator',
                        'test',
                        'build-action-type.spec.js'
                    )
                }
            };
        }

        function getReactComponentDirs(name, directory, native, redux) {
            const subDir = native ? 'native' : 'web';
            const subSubDir = redux ? 'react-redux' : 'react';

            const templateDirectory = path.join(__dirname, 'templates', subDir, subSubDir);
            const generatedDirectory = path.join(__dirname, '..', '..', directory, name);

            if (!fs.existsSync(generatedDirectory)) {
                shell.mkdir('-p', path.join(generatedDirectory, 'test'));
            }

            const reactDirs = {
                view: {
                    template: path.join(templateDirectory, 'template.view.js'),
                    generated: path.join(generatedDirectory, `${name}.view.js`)
                },
                viewTest: {
                    template: path.join(templateDirectory, 'test', 'template.view.spec.js'),
                    generated: path.join(generatedDirectory, 'test', `${name}.view.spec.js`)
                }
            };

            if (!native) {
                reactDirs.stylesheet = {
                    template: path.join(templateDirectory, '_template.styles.scss'),
                    generated: path.join(generatedDirectory, `_${name}.styles.scss`)
                };
            }

            if (!redux) {
                return reactDirs;
            }

            const reduxDirs = {
                container: {
                    template: path.join(templateDirectory, 'template.container.js'),
                    generated: path.join(generatedDirectory, `${name}.container.js`)
                },
                containerTest: {
                    template: path.join(templateDirectory, 'test', 'template.container.spec.js'),
                    generated: path.join(generatedDirectory, 'test', `${name}.container.spec.js`)
                },

                reducer: {
                    template: path.join(templateDirectory, 'template.reducer.js'),
                    generated: path.join(generatedDirectory, `${name}.reducer.js`)
                },
                reducerTest: {
                    template: path.join(templateDirectory, 'test', 'template.reducer.spec.js'),
                    generated: path.join(generatedDirectory, 'test', `${name}.reducer.spec.js`)
                }
            };

            return Object.assign(reactDirs, reduxDirs);
        }
    }

    function getAllPlaceholderNames(name) {
        const lowerCamel = kebabToCamel(name);
        const upperCamel = `${lowerCamel.charAt(0).toUpperCase()}${lowerCamel.slice(1)}`;

        return { kebab: name, lowerCamel, upperCamel };

        function kebabToCamel(s) {
            return s.replace(/-\w/g, m => m[1].toUpperCase());
        }
    }

    function createTemplate(directory, placeholderNames, omitComments) {
        fs.readFile(directory.template, 'utf8', (err, data) => {
            if (err) throw err;

            data = data.replace(/TEMPLATE_KEBAB_CASE_NAME/g, placeholderNames.kebab);
            data = data.replace(/TEMPLATE_LOWER_CAMEL_CASE_NAME/g, placeholderNames.lowerCamel);
            data = data.replace(/TEMPLATE_UPPER_CAMEL_CASE_NAME/g, placeholderNames.upperCamel);

            if (omitComments) {
                data = removeComments(data);
            }

            fs.writeFile(directory.generated, data, err => {
                if (err) throw err;
            });
        });

        function removeComments(s) {
            return s.replace(/([\s\S]*?)\/\*[\s\S]*?\*\//g, '$1');
        }
    }
}

module.exports = createAllTemplates;