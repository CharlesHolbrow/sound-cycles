'use strict';
var _ = require('underscore');

var rpp = require('./rpp-parse.js');
var jam = rpp.readFile('./indie-jam.rpp');

var items = jam.findItemsBySource();

