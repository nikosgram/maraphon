const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({dest: 'uploads/'});
const router = express.Router();

function exists(file, timeout, repeat) {
    return new Promise(function (resolve, reject) {
        const existsFile = fs.existsSync(file);

        if (existsFile) {
            resolve();
        } else {
            if (repeat > 0) {
                setTimeout(function () {
                    exists(file, timeout, repeat - 1).then(resolve).catch(reject);
                }, timeout)
            } else {
                reject();
            }
        }
    });
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index.ejs', {title: 'Express'});
});

/* GET home page. */
router.get('/new', function (req, res, next) {
    res.render('index.new.ejs', {title: 'Express'});
});

router.post('/maraphon', upload.single('image'), function (req, res, next) {
    const file = req.file;
    console.log(file);
    const folderName = (file.originalname.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_') + '_' + Date.now().toString(36)).toLowerCase();

    fs.mkdirSync(path.join('./working/input/' + folderName));

    const inputFolder = path.join('./working/input/', folderName, file.originalname.toLowerCase());

    fs.renameSync(file.path, inputFolder);

    const outputPath = path.join('./working/output/' + folderName + '/', folderName + '.zip');

    exists(outputPath, 500, 50).then(() => {
        res.redirect('/working/output/' + folderName + '/');
    }).catch(() => {
        res.json({error: 'something got wrong'});
    });
});

module.exports = router;
