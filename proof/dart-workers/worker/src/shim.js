// Workers entry: loads the dart2js output, which installs
// globalThis.skulleryFetch, and exports it as the module fetch handler.
import "../build/worker.dart.js";

export default {
  fetch(request) {
    return globalThis.skulleryFetch(request);
  },
};
