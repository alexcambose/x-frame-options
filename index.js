const express = require('express');
const axios = require('axios');
const mime = require('mime');
const morgan = require('morgan');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('tiny'));

const regex = /\s+(href|src)=['"](.*?)['"]/g;

const getMimeType = url => {
    if(url.indexOf('?') !== -1) { // remove url query so we can have a clean extension
        url = url.split("?")[0];
    }
    if(mime.getType(url) === 'application/x-msdownload') return 'text/html';
    return mime.getType(url) || 'text/html'; // if there is no extension return as html
};

app.get('/', (req, res) => {
    const { url } = req.query; // get url parameter
    if(!url) {
        res.type('text/html');
        return res.end("You need to specify <code>url</code> query parameter");
    }

    axios.get(url, { responseType: 'arraybuffer'  }) // set response type array buffer to access raw data
        .then(({ data }) => {
            const urlMime = getMimeType(url); // get mime type of the requested url
            if(urlMime === 'text/html') { // replace links only in html
                data = data.toString().replace(regex, (match, p1, p2)=>{
                    let newUrl = '';
                    if(p2.indexOf('http') !== -1) {
                        newUrl = p2;
                    } else if (p2.substr(0,2) === '//') {
                        newUrl = 'http:' + p2;
                    } else {
                        const searchURL = new URL(url);
                        newUrl = searchURL.protocol + '//' + searchURL.host + p2;
                    }
                    return ` ${p1}="${req.protocol}://${req.hostname}?url=${newUrl}"`;
                });
            }
            res.type(urlMime);
            res.send(data);
        }).catch(error => {
        console.log(error);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
