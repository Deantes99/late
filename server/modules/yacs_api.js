const request = require('request-promise');
const logger = require('./logger');

const YACS_BASE_URL = 'https://nightly.yacs.io';
const YACS_SECTION_API_BASE_URL =
  YACS_BASE_URL + '/api/v6/sections?filter[crn][eql]=';

/**
 * Use the public YACS API to find general info on a section:
 * - section id
 * - listing id
 * - course name (long name)
 * - periods
 *
 * @param {string} crn The CRN of the period
 * @returns {object} The found info in one object
 */
async function getSectionInfoFromCRN (crn) {
  const uri = YACS_SECTION_API_BASE_URL + crn;

  logger.info(`Getting info for course ${crn} from YACS API.`);

  let data = (await request({ uri, json: true })).data;

  if (data.length === 0) {
    logger.info(`Could not find course ${crn} on YACS API. Skipping.`);
    return false;
  }
  data = data[0];

  // get listing
  let listingUri = data.relationships.listing.links.related;
  if (listingUri.includes('localhost')) {
    listingUri = listingUri.replace('https://localhost', YACS_BASE_URL);
  }

  const listing = (await request({ uri: listingUri, json: true })).data;

  const section = {
    section_id: data.attributes.shortname,
    listing_id: listing.id,
    original_longname: listing.attributes.longname,
    longname: listing.attributes.longname,
    crn,
    periods: data.attributes.periods
  };

  logger.info(
    `Course ${crn} is ${section.longname} section ${section.section_id}`
  );

  return section;
}

module.exports = { getSectionInfoFromCRN };
