const express = require('express');
const axios = require('axios');
const mime = require('mime');
const morgan = require('morgan');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;
// custom constant, you can change it to whatever you want
const otherPath = '/archive';

let lastProtoHost;

app.use(morgan('tiny'));

const regex = /\s+(href|src)=['"](.*?)['"]/g;
/**
 * This regex is used to match css url() function
 * Its used to solve the background-images or any other images in css
 */
const cssUrlRegex = /url\(['"]?(.*?)['"]?\)/g;

/**
 * Generates a new URL based on the given URL path and base URL, and optionally formats it as an HTML attribute.
 * @param {string} attribute - If provided, generates an HTML attribute, such as 'src' or 'href'.
 * @param {string} urlPath - The original URL path, which can be a relative path or a full URL.
 * @param {Object} req - The request object, used to obtain the protocol and hostname.
 * @param {string} baseUrl - The base URL used to resolve relative paths.
 * @returns {string} If the attribute is specified, returns a formatted HTML attribute string; otherwise, returns the new URL string.
 */
const replaceUrl = (attribute, urlPath, req, baseUrl) => {
    let newUrl = '';
    if (urlPath.indexOf('http') !== -1) {
        newUrl = urlPath;
    } else if (urlPath.startsWith('//')) {
        newUrl = 'http:' + urlPath;
    } else {
        // Remove any leading '../' from the URL path.
        urlPath = urlPath.replace(/(\.\.\/)+/, '');
        const searchURL = new URL(baseUrl);
        let protoHost = searchURL.protocol + '//' + searchURL.host;
        newUrl = protoHost + `${otherPath}/` + urlPath;

        if (lastProtoHost != protoHost) {
            lastProtoHost = protoHost;
            console.log(`Using '${protoHost}' as base for new requests.`);
        }
    }
    return attribute ? ` ${attribute}="${req.protocol}://${req.hostname}:${port}?url=${newUrl}"` : newUrl;
};

const getMimeType = url => {
    if (url.indexOf('?') !== -1) { // remove url query so we can have a clean extension
        url = url.split("?")[0];
    }
    if (mime.getType(url) === 'application/x-msdownload') return 'text/html';
    return mime.getType(url) || 'text/html'; // if there is no extension return as html
};

app.get('/', (req, res) => {
    const { url } = req.query; // get url parameter
    if (!url) {
        res.type('text/html');
        return res.end("You need to specify <code>url</code> query parameter");
    }

    axios.get(url, { responseType: 'arraybuffer' }) // set response type array buffer to access raw data
        .then(({ data }) => {
            const urlMime = getMimeType(url); // get mime type of the requested url
            if (urlMime === 'text/html') { // replace links only in html
                data = data.toString().replace(regex, (match, p1, p2) => {
                    return replaceUrl(p1, p2, req, url);
                });
            } else if (urlMime === 'text/css') {
                // replace css url() content
                data = data.toString().replace(cssUrlRegex, (match, p1) => {
                    const newUrl = replaceUrl(null, p1, req, url);
                    return `url(${newUrl})`;
                });
            }
            res.type(urlMime);
            res.send(data);
        }).catch(error => {
            console.log(error);
            res.status(500);
            res.end("Error")
        });
});

app.get('/*', (req, res) => {
    if (!lastProtoHost) {
        res.type('text/html');
        return res.end("You need to specify <code>url</code> query parameter first");
    }

    const url = lastProtoHost + req.originalUrl;
    axios.get(url, { responseType: 'arraybuffer' }) // set response type array buffer to access raw data
        .then(({ data }) => {
            const urlMime = getMimeType(url); // get mime type of the requested url
            res.type(urlMime);
            res.send(data);
        }).catch(error => {
            res.status(501);
            res.end("Not Implemented")
        });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
