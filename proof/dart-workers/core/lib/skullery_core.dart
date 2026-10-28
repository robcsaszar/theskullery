/// Pure core for the Dart Workers proof: no HTTP, no host, no I/O.
library;

import 'dart:convert';

/// Fixed title returned for every recipe in this proof.
const recipeTitle = 'Proof Recipe';

/// Returns the recipe with [id] as a JSON string.
String recipeJson(String id) => jsonEncode({'id': id, 'title': recipeTitle});
