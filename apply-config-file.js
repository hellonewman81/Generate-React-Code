'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function applyConfig(params, callback) {
    const configDirectory = path.join(__dirname, '..', '..', 'grcc.json');

    if (fs.existsSync(configDirectory)) {
        fs.readFile(configDirectory, 'utf8', (err, data) => {
            if (err) throw err;

            const configData = JSON.parse(data);

            if (!configData) {
                console.log(
                    chalk.red('Error reading config file at'),
                    chalk.gray(configDirectory),
                    '\nMake sure your file has the correct format'
                );
                return callback(params);
            }

            params.native = params.native || configData.native || false;
            params.redux = params.redux || configData.redux || false;
            params.omitComments = params.omitComments || configData.omitComments || false;

            console.log(
                chalk.bold.underline.cyan('\nConfig Loaded:'),
                chalk.bold.magenta('\nnative:\t\t'),
                chalk.yellow(params.native),
                chalk.bold.magenta('\nredux:\t\t'),
                chalk.yellow(params.redux),
                chalk.bold.magenta('\nomitComments:\t'),
                chalk.yellow(params.omitComments)
            );

            return callback(params);
        });
    } else {

        return callback(params);
    }
}

module.exports = applyConfig;