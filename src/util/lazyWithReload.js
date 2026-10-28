import React from 'react';
import { Debug } from '@hct/soca-toolkit';

export function lazyWithReload(loader) {
  return React.lazy(() =>
    loader().catch(err => {
      if (Debug)
        console.log('Dynamic import failed, reloading...', err);

      setTimeout(() => {
        window.location.reload();
      }, 200);
      // rethrow
      throw err;
    })
  );
}
