let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');

// https://comic.naver.com/webtoon/detail.nhn?titleId=651673&no=482
// titleId_no_??.jpg

const downloadImage = (path, url, titleId, no, retryCount) => {
    request({
        url,
        headers: {
            'referer': `https://comic.naver.com/webtoon/detail.nhn?titleId=${titleId}&no=${no}&weekday=wed`
        },
        encoding: null
    }, function (error, response, body) {
        if(error && --retryCount >= 0) {
            console.log(`재시도 ${titleId} ${no} ${retryCount}`);
            downloadImage(path, url, titleId, no, retryCount);
            return;
        }

        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

        fs.writeFile(path + '/' + `${titleId}_${no}_${(url.split('_IMAG01')[1])}`, body, null, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    });
}

const getImageUrls = (titleId, no) => {
    request('https://comic.naver.com/webtoon/detail.nhn?titleId=651673&no=482&weekday=wed', function (error, response, body) {
        const $ = cheerio.load(body);
        for (let i = 1; i < $('.wt_viewer img').length; i++) {
            downloadImage('download', $('.wt_viewer img')[i].attribs.src, titleId, no);
        }
    });
}

for(let i=10, j=0; i<15; i++) {
    setTimeout(() => {
        getImageUrls(651673, i);
    }, j * 1000);
}
