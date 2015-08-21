var csv = require('csv-parser');
var fs = require('fs');
var basePath = './csvs/';
var outPath = './source/data/';
var csvRegexp = /\.csv$/;

module.exports = function (grunt) {
    grunt.registerTask('csv', 'Compile csvs to json', function () {
        var done = this.async();
        var d = {};

        fs.readdir(basePath, function (err, files) {
            if (err) throw err;

            var filesProcessed = 0;

            files.filter(function (file) {
                return csvRegexp.test(file);
            }).forEach(function (file, i, files) {
                console.log(file);
                console.log(i);
                console.log(files);

                fs.createReadStream(basePath + file)
                    .pipe(csv({
                        seperator: ';'
                    }))
                    .on('data', function (data) {
                        console.log(data);
                        // if (data.iso) {
                        //     d[data.iso] = data;

                        //     delete d[data.iso].iso;
                        // }
                    })
                    .on('end', function () {

                        fs.writeFile(outPath + 'oecd_data.js', 'define(' + JSON.stringify(d) + ');', function (err) {
                            if (err) throw err;

                            filesProcessed++;

                            if (filesProcessed >= files.length) {
                                done();
                            }
                        });
                    });

            });
        });
    });
};
