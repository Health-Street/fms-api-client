'use strict';

/* global describe before after it */

/* eslint-disable */

const assert = require('assert');
const { expect, should } = require('chai');

/* eslint-enable */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const environment = require('dotenv');
const varium = require('varium');
const { connect } = require('marpat');
const { Filemaker } = require('../index.js');

chai.use(chaiAsPromised);

describe('Request Interceptor Capabilities', () => {
  let database, client;

  before(done => {
    environment.config({ path: './tests/.env' });
    varium(process.env, './tests/env.manifest');
    connect('nedb://memory')
      .then(db => {
        database = db;
        return database.dropDatabase();
      })
      .then(() => {
        return done();
      });
  });

  before(done => {
    client = Filemaker.create({
      application: process.env.APPLICATION,
      server: process.env.SERVER,
      user: process.env.USERNAME,
      password: process.env.PASSWORD
    });
    client.save().then(client => done());
  });

  after(done => {
    client
      .logout()
      .then(response => done())
      .catch(error => done());
  });

  it('should reject if the server errors', () => {
    client._authURL = () => 'https://httpstat.us/502';
    return expect(
      client
        .save()
        .then(client => client.authenticate())
        .catch(error => error)
    )
      .to.eventually.be.an('object')
      .that.has.all.keys('code', 'message');
  });

  it('should handle non JSON responses by rejecting with a json error', () => {
    client._authURL = () => 'https://httpstat.us/404';
    return expect(
      client
        .save()
        .then(client => client.authenticate())
        .catch(error => error)
    )
      .to.eventually.be.an('object')
      .that.has.all.keys('code', 'message');
  });

  it('should reject non http requests to the server with a json error', () => {
    client._authURL = () =>
      `${process.env.SERVER.replace('https://', '')}/fmi/data/v1/databases/${
        process.env.application
      }/sessions`;
    return expect(
      client
        .save()
        .then(client => client.authenticate())
        .catch(error => error)
    )
      .to.eventually.be.an('object')
      .that.has.all.keys('code', 'message');
  });

  it('should reject non https requests to the server with a json error', () => {
    client._authURL = () =>
      `${process.env.SERVER.replace(
        'https://',
        'http://'
      )}/fmi/data/v1/databases/${process.env.application}/sessions`;
    return expect(
      client
        .save()
        .then(client => client.authenticate())
        .catch(error => error)
    )
      .to.eventually.be.an('object')
      .that.has.all.keys('message','code');
  });
});
