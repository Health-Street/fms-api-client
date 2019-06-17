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

describe('Global Capabilities', () => {
  let database, client;
  before(done => {
    environment.config({ path: './test/.env' });
    varium(process.env, './test/env.manifest');
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
      database: process.env.DATABASE,
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

  it('should allow you to set session globals', () => {
    return expect(
      client.globals({ 'Globals::ship': 'Millenium Falcon' })
    ).to.eventually.be.a('object');
  });

  it('should allow you to specify a timeout', () => {
    return expect(
      client
        .globals(
          { 'Globals::ship': 'Millenium Falcon' },
          {
            request: { timeout: 10 }
          }
        )
        .catch(error => error)
    )
      .to.eventually.be.an('object')
      .with.any.keys('message', 'code');
  });

  it('should reject with a message and code if it fails to set a global', () => {
    return expect(
      client.globals({ ship: 'Millenium Falcon' }).catch(error => error)
    )
      .to.eventually.be.a('object')
      .that.has.all.keys('message', 'code');
  });
});
