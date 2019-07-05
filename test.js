const md5 = require('md5');

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

console.time('delay');

const returned = [];

for (let index = 0; index < 10; index++) {
    const token = generateToken();

    if (returned.includes(token)) {
        console.log('FOUND IT FOUND IT', token);
    }

    returned.push({
        token
    });
}

console.timeEnd('delay');
console.table(returned);
