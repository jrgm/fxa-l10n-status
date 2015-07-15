#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const cheerio = require('cheerio')
const program = require('commander')
const request = require('request').defaults({ strictSSL: true })

function parseData(body, matcher) {
  var $ = cheerio.load(body)

  var stats = []
  var items = $('tr.item')

  items.map(function(index, item) {
    var subject = $('td.stats-name a', item)
    var name = subject.text()
    if (name === 'Templates') {
      return
    }

    var href = subject.attr('href')
    var locale = href.split('/')[1]
    var numbers = $('td.stats-number', item)
        .map(function() { return parseInt($(this).text(), 10) }).get()
    var lastUpdate = $('td', item).last().text()
    lastUpdate = new Date(lastUpdate || 0)
    var oneday = 1000 * 60 * 60 * 24
    var age = Math.floor((Date.now() - lastUpdate.valueOf()) / oneday)
    var matched = locale.replace('_', '-') in matcher
    
    stats.push({
      locale: locale,
      name: name,
      total: numbers[0],
      incomplete: numbers[1],
      percent: (100 * numbers[1]/numbers[0]).toFixed(1),
      lastUpdate: lastUpdate.toISOString(),
      age: age,
      matched: matched
    })
  })

  return stats.sort(function(a, b) {
    if (a.incomplete === b.incomplete) {
      return a.age - b.age
    }
    return a.incomplete - b.incomplete 
  })
}

function arrayToMap(ary) {
  var map = {}
  ary.forEach(function(item) {
    map[item] = 1
  })
  return map
}

module.exports = function (url, matcher, cb) {
  if (typeof matcher === 'function') {
    cb = matcher
    matcher = []
  }

  matcher = arrayToMap(matcher)
  
  request.get(program.url, function(err, res, body) {
    if (err) {
      return console.error(err)
    }
    if (res.statusCode !== 200) {
      return console.error('Non 200 response:', res.statusCode)
    }

    return cb(parseData(body, matcher))
  })
}
