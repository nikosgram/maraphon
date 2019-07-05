const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const package = require('../package');

const upload = multer({dest: 'uploads/'});
const router = express.Router();

const exists = (file, timeout, repeat) => new Promise((resolve, reject) => {
    const existsFile = fs.existsSync(file);

    if (existsFile) {
        resolve();
    } else {
        if (repeat > 0) {
            setTimeout(() => {
                exists(file, timeout, repeat - 1).then(resolve).catch(reject);
            }, timeout)
        } else {
            reject();
        }
    }
});

const reverseNum = num => {
    let revnum = 0;
    let n;

    while (num) {
        n = num % 10;
        num = Math.floor(num / 10);
        revnum *= 10;
        revnum += n;
    }

    return revnum;
};

const generateToken = () => {
    const hrTime = process.hrtime();

    let calculated = hrTime[0] * 1000000 + hrTime[1] / 1000 + Math.floor((Math.random() * hrTime[1]) + hrTime[0]);

    if (Math.random() >= 0.5) {
        calculated = reverseNum(calculated);
    }

    return calculated.toString(36).replace('.', '');
};

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index.ejs', {
        version: package.version
    });
});

router.get('/old', (req, res) => {
    res.render('index.old.ejs', {
        version: package.version
    });
});

router.post('/maraphon', upload.single('image'), (req, res) => {
    const file = req.file;
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

router.post('/upload', upload.array('images'), (req, res) => {
    try {
        const token = generateToken();
        const files = req.files;

        const workingFolder = path.join('./working/input/', token);

        fs.mkdirSync(workingFolder);

        for (const file of files) {
            const fileFolder = path.join(workingFolder, file.originalname.split('.').slice(0, -1).join('.'));

            fs.mkdirSync(fileFolder);

            const inputFolder = path.join(fileFolder, file.originalname);

            fs.renameSync(file.path, inputFolder);
        }

        res.json({
            status: 'successful',
            message: token,
            code: 'token'
        })
    } catch (e) {
        res.json({
            status: 'unsuccessful',
            message: e,
            code: 'unknown'
        });
    }
});

router.post('/check/:token', (req, res) => {
    const token = req.params.token;
    const inputFolder = path.join('./working/input/' + token);

    if (!fs.existsSync(inputFolder)) {
        res.json({
            status: 'unsuccessful',
            message: 'The token ' + token + ' is not exists.',
            code: 'token_not_exists'
        });

        return;
    }

    const outputPath = path.join('./working/output/' + token + '/', token + '.zip');

    exists(outputPath, 500, 100).then(() => {
        res.json({
            status: 'successful',
            message: '/working/output/' + token + '/',
            code: 'redirect'
        });
    }).catch(() => {
        res.json({
            status: 'unsuccessful',
            message: 'Something got wrong.',
            code: 'something_got_wrong'
        });
    });
});

module.exports = router;
