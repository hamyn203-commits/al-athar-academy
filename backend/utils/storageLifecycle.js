'use strict';

const fs = require('fs');
const path = require('path');
const objectStorage = require('../services/objectStorage');

function assertLocalReference(reference, localRoot) {
  const absolute = path.resolve(String(reference || ''));
  const root = path.resolve(localRoot);

  if (!absolute.startsWith(root + path.sep)) {
    throw new Error('Stored file reference is outside the allowed root');
  }

  return absolute;
}

async function deleteStoredReference({ reference, purpose, owner, localRoot }) {
  if (!reference) return { deleted: false, reason: 'missing-reference' };

  if (objectStorage.referenceMatches(reference, purpose, owner)) {
    await objectStorage.deleteOwnedObject(reference, purpose, owner);
    return { deleted: true, driver: objectStorage.getDriver() };
  }

  if (/^https?:\/\//i.test(String(reference))) {
    throw new Error('External file reference is not owned by this record');
  }

  if (!localRoot) {
    throw new Error('Local storage root is required');
  }

  const absolute = assertLocalReference(reference, localRoot);

  try {
    await fs.promises.unlink(absolute);
    return { deleted: true, driver: 'filesystem' };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { deleted: false, driver: 'filesystem', reason: 'not-found' };
    }
    throw error;
  }
}

module.exports = {
  assertLocalReference,
  deleteStoredReference,
};
