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

An object where each property name is the name of a reporter, and each property
value is another object containing config specific to that reporter.
The currently available reporters are 'console' and 'graph',
which makes use of [plotly](https://plot.ly/) (see below).

If no reporters are specified, a single console reporter is used by default.

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
        "console": {},
        "graph": {
            "username": "my_plotly_username",
            "apiKey": "my_plotly_api_key",
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

Note that config values can be environment variables (prefixed by `$`).

If the graph reporter is used with no `fileId` specified, the filename will be
created (or overwritten!) and the URL of the file will be output to the console.
You can take the ID from this and add it to your config file for subsequent runs.
