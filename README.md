### HyperMeter: HTTP metric tool

[![Build Status](https://travis-ci.org/hgcummings/hypermeter.svg?branch=master)](https://travis-ci.org/hgcummings/hypermeter)

## Usage

```
npm install -g hypermeter
hypermeter your-config.json
```

## Config file

### urls

An array of URLs for hypermeter to measure

### reporters

An object where each property name is the name of a reporter, and each property
value is another object containing config specific to that reporter.
The currently available reporters are 'console' and 'graph',
which makes use of [plotly](https://plot.ly/) (see below).

If no reporters are specified, a single console reporter is used by default.

### client

Settings for the HTTP client. If any settings are specified then hypermeter uses
[curlrequest](https://github.com/chriso/curlrequest) and passes your settings
through to cURL. Otherwise, the native node HTTP module is used.

Note that cURL is generally slower than a native HTTP call, so timings won't be
consistent.

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
        "console": {},
        "graph": {
            "username": "my_plotly_username",
            "apiKey": "my_plotly_api-key",
            "build": "$BUILD_NUMBER",
            "filename": "plotly_filename",
            "fileId": "56"
        }
    },
    "client": {
        "cert": "/etc/pki/my_cert.pem"
    }
}
```

If the graph reporter is used with no fileId specified, the filename will be
created (or overwritten!) and the URL of the file will be output to the console.
You can take the ID from this and add it to your config file for the next run.
Note that this config can include environment variables (prefixed by `$`).
