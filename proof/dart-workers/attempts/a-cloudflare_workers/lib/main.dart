import 'package:cloudflare_workers/cloudflare_workers.dart';
import 'package:skullery_core/skullery_core.dart';

void main() {
  CloudflareWorkers(fetch: (request, env, ctx) async {
    final seg = request.url.pathSegments;
    if (request.method == 'GET' && seg.length == 2 && seg[0] == 'recipe') {
      return Response(recipeJson(seg[1]),
          headers: Headers({'content-type': 'application/json'}));
    }
    return Response('Not found', status: 404);
  });
}
