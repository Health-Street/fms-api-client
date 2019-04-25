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

describe('Delete Capabilities', () => {
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

  it('should delete FileMaker records.', () =>
    expect(
      client
        .create(process.env.LAYOUT, { name: 'Darth Vader' })
        .then(response => client.delete(process.env.LAYOUT, response.recordId))
    ).to.eventually.be.a('object'));

  it('should allow you to specify a timeout', () => {
    return expect(
      client
        .create(process.env.LAYOUT, { name: 'Darth Vader' })
        .then(response =>
          client.delete(process.env.LAYOUT, response.recordId, {
            request: { timeout: 10 }
          })
        )
        .catch(error => error)
    ).to.eventually.be.an('error');
  });

  it('should trigger scripts via an array when deleting records.', () =>
    expect(
      client
        .create(process.env.LAYOUT, { name: 'Darth Vader' })
        .then(response =>
          client.delete(process.env.LAYOUT, response.recordId, {
            scripts: [
              {
                name: 'Error Script',
                phase: 'prerequest',
                param: 'A Parameter'
              },
              { name: 'Error Script', param: 'A Parameter' },
              { name: 'Error Script', phase: 'presort', param: 'A Parameter' }
            ]
          })
        )
    ).to.eventually.be.a('object'));

  it('should trigger scripts via parameters when deleting records.', () =>
    expect(
      client
        .create(process.env.LAYOUT, { name: 'Darth Vader' })
        .then(response =>
          client.delete(process.env.LAYOUT, response.recordId, {
            'script.prerequest': 'Error Script',
            'script.prerequest.param': 'A Parameter'
          })
        )
    ).to.eventually.be.a('object'));

  it('should allow you to mix script parameters and scripts array when deleting records.', () =>
    expect(
      client
        .create(process.env.LAYOUT, { name: 'Darth Vader' })
        .then(response =>
          client.delete(process.env.LAYOUT, response.recordId, {
            'script.prerequest': 'Error Script',
            'script.prerequest.param': 'A Parameter',
            scripts: [
              { name: 'Error Script', param: 'A Parameter' },
              { name: 'Error Script', phase: 'presort', param: 'A Parameter' }
            ]
          })
        )
    ).to.eventually.be.a('object'));

  it('should stringify script parameters.', () =>
    expect(
      client
        .create(process.env.LAYOUT, { name: 'Darth Vader' })
        .then(response =>
          client.delete(process.env.LAYOUT, response.recordId, {
            'script.prerequest': 'Error Script',
            'script.prerequest.param': 2,
            scripts: [
              { name: 'Error Script', param: 'A Parameter' },
              { name: 'Error Script', phase: 'presort', param: { data: true } }
            ]
          })
        )
    ).to.eventually.be.a('object'));

  it('should reject deletions that do not specify a recordId', () =>
    expect(client.delete(process.env.LAYOUT).catch(error => error))
      .to.eventually.be.a('object')
      .that.has.all.keys('code', 'message'));

  it('should reject deletions that do not specify an invalid recordId', () =>
    expect(client.delete(process.env.LAYOUT, '-2').catch(error => error))
      .to.eventually.be.a('object')
      .that.has.all.keys('code', 'message'));

  it('should remove an expired token', () => {
    client.connection.token = `${client.connection.token}-error`;
    return expect(
      client.delete(process.env.LAYOUT, '-2').catch(error => {
        let errorWithToken = Object.assign(error, {
          token: client.connection.token
        });
        return errorWithToken;
      })
    )
      .to.eventually.be.an('object')
      .that.has.all.keys('code', 'message', 'token')
      .and.property('token').to.be.empty;
  });
});
