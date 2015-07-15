#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const program = require('commander')
const fetcher = require('./lib')

function options() {
  program
    .option('-u, --url <url>',
            'Location of the verbatim status page',
            'https://localize.mozilla.org/projects/accounts/')
    .parse(process.argv);
}

function run() {
  options()

  // console.log('Looking for Verbatim status at', program.url)

  var localesPath = process.env.LOCALES_PATH
  var productionLocales = (! localesPath) ? [] : require(localesPath).i18n.supportedLanguages
  
  fetcher(program.url, productionLocales, function(data) {
    data.forEach(function(row) {
      console.log('%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s',
                  row.name,
                  row.locale,
                  row.total,
                  row.incomplete,
                  row.percent,
                  row.age,
                  row.lastUpdate,
                  row.matched)
    })
  })
}

run()
