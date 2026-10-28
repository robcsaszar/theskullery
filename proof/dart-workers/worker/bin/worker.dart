/// Adapter: maps a Workers fetch event to the host-free core.
///
/// Compiled with `dart compile js`; `src/shim.js` hands each request to the
/// function this file installs on `globalThis`.
library;

import 'dart:js_interop';

import 'package:skullery_core/skullery_core.dart';

/// The parts of the Workers `Request` the adapter reads.
extension type WorkerRequest._(JSObject _) implements JSObject {
  external String get url;
  external String get method;
}

/// The Workers `Response` constructor.
@JS('Response')
extension type WorkerResponse._(JSObject _) implements JSObject {
  external factory WorkerResponse(JSString body, JSObject init);
}

@JS('skulleryFetch')
external set _skulleryFetch(JSFunction handler);

WorkerResponse _respond(int status, String contentType, String body) =>
    WorkerResponse(
      body.toJS,
      {
        'status': status,
        'headers': {'content-type': contentType},
      }.jsify()! as JSObject,
    );

WorkerResponse handle(WorkerRequest request) {
  final segments = Uri.parse(request.url).pathSegments;
  if (segments.length == 2 &&
      segments[0] == 'recipe' &&
      segments[1].isNotEmpty) {
    if (request.method != 'GET') {
      return _respond(405, 'text/plain', 'Method not allowed');
    }
    return _respond(200, 'application/json', recipeJson(segments[1]));
  }
  return _respond(404, 'text/plain', 'Not found');
}

void main() {
  _skulleryFetch = handle.toJS;
}
