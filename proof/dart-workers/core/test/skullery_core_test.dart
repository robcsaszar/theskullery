import 'dart:convert';

import 'package:skullery_core/skullery_core.dart';
import 'package:test/test.dart';

void main() {
  test('recipeJson returns the id and the fixed title', () {
    expect(recipeJson('x'), '{"id":"x","title":"Proof Recipe"}');
  });

  test('recipeJson escapes the id as a JSON string', () {
    final decoded = jsonDecode(recipeJson('a"b')) as Map<String, dynamic>;
    expect(decoded, {'id': 'a"b', 'title': 'Proof Recipe'});
  });
}
