### HyperMeter: HTTP metric tool

[![Build Status](https://travis-ci.org/hgcummings/hypermeter.svg?branch=master)](https://travis-ci.org/hgcummings/hypermeter)

## Usage

```
npm install -g hypermeter
hypermeter my-config-file.json
```

## Config file

The config file is a JSON file containing the following fields:

### urls (required)

An array of URLs for hypermeter to measure

### reporters (optional)

An object containing reporter/config pairs. The currently available reporters
are:
* 'console' (which takes no further configuration options) 
* 'json', which creates/updates a JSON file that can be used to draw graphs ([see the wiki](https://github.com/hgcummings/hypermeter/wiki/Using-the-JSON-reporter-to-generate-graphs))
* 'graph', which makes use of [plotly](https://plot.ly/) (see below)

If no reporters are specified, a single console reporter is used by default.

### checks (optional)

An object containing check/config pairs. The currently available checks are
'status' (which takes no further configuration options), and 'time', which takes
an integer specifying the maximum allowable response time (in milliseconds).

### client (optional)

Settings for the HTTP client. If any settings are specified then hypermeter uses
[curlrequest](https://github.com/chriso/curlrequest) and passes your settings
through to cURL. Otherwise, the native node HTTP module is used.

Note that cURL is generally slower than a native HTTP call, so timings won't be
consistent between the two.

### Examples

A minimal config file might look like the following:

```
{
    "urls": [
        "https://twitter.com",
        "https://google.com",
        "https://facebook.com"
    ]
}
```

A more advanced config file using the graph reporter might look like the following:

```
{
    "urls": [
        ...
    ],
    "reporters": {
        "console": null,
        "graph": {
            "username": "my_plotly_username",
            "apiKey": "my_plotly_api_key",
            "build": "$BUILD_NUMBER",
            "filename": "plotly_filename",
            "fileId": "56"
        }
    },
    "checks": {
        "status": null,
        "time": 5000
    }
    "client": {
        "cert": "/etc/pki/my_cert.pem"
    }
}
```

Note that config values can be environment variables (prefixed by `$`).

If the graph reporter is used with no `fileId` specified, the filename will be
created (or overwritten!) and the URL of the file will be output to the console.
You can take the ID from this and add it to your config file for subsequent runs.
