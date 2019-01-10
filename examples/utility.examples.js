'use strict';

const { log } = require('./services');
const {
  recordId,
  fieldData,
  transform,
  containerData
} = require('../index.js');

//#record-id-utility--original-example
const extractRecordId = client =>
  client
    .find('Heroes', { name: 'yoda' }, { limit: 2 })
    .then(response => response.data)
    .then(result => log('record-id-utility-original-example', result));
//#

//#record-id-utility-example
const extractRecordIdOriginal = client =>
  client
    .find('Heroes', { name: 'yoda' }, { limit: 2 })
    .then(response => recordId(response.data))
    .then(result => log('record-id-utility-example', result));
//#

//#field-data-utility-original-example
const extractFieldDataOriginal = client =>
  client
    .find('Heroes', { name: 'yoda' }, { limit: 2 })
    .then(response => response.data)
    .then(result => log('field-data-utility-original-example', result));
//#

//#field-data-utility-example
const extractFieldData = client =>
  client
    .find('Heroes', { name: 'yoda' }, { limit: 2 })
    .then(response => fieldData(response.data))
    .then(result => log('field-data-utility-example', result));
//#

//#transform-utility-example
const transformData = client =>
  client
    .find('Transform', { name: 'Han Solo' }, { limit: 1 })
    .then(result => transform(result.data))
    .then(result => log('transform-utility-example', result));
//#
//

//#transform-utility-original-example
const transformDataOriginal = client =>
  client
    .find('Transform', { name: 'Han Solo' }, { limit: 1 })
    .then(result => result.data)
    .then(result => log('transform-utility-original-example', result));
//#

//#transform-utility-no-convert-example
const transformDataNoConvert = client =>
  client
    .find('Transform', { name: 'Han Solo' }, { limit: 1 })
    .then(result => transform(result.data, { convert: false }))
    .then(result => log('transform-utility-no-convert-example', result));
//#

//#container-data-example
const getContainerData = client =>
  client
    .find('Heroes', { imageName: '*' }, { limit: 1 })
    .then(result =>
      containerData(
        result.data,
        'fieldData.image',
        './assets',
        'fieldData.imageName'
      )
    )
    .then(result => log('container-data-example', result));
//#

const utilities = client =>
  Promise.all([
    extractFieldDataOriginal(client),
    extractFieldData(client),
    extractRecordIdOriginal(client),
    extractRecordId(client),
    transformDataOriginal(client),
    transformData(client),
    transformDataNoConvert(client),
    getContainerData(client)
  ]).then(responses => client);

module.exports = { utilities };
