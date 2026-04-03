function scoreTypeA(item, user) {
  if (user && user.role === "admin") {
    return { id: item.id, score: item.value * 2, ok: true };
  }
  if (item.value > 10) {
    return { id: item.id, score: item.value, ok: true };
  }
  return { id: item.id, score: 0, ok: false };
}

function computeTagValue(baseValue, tag, indices) {
  if (tag === "hot") {
    return baseValue + indices.k + indices.j + indices.i;
  }
  if (tag === "cold") {
    return baseValue - indices.k - indices.j - indices.i;
  }
  return baseValue;
}

function scoreTypeB(item, items, itemIndex) {
  var tmp = null;

  for (var j = 0; j < items.length; j++) {
    if (!items[j] || items[j].group !== item.group) {
      continue;
    }
    for (var k = 0; k < items[j].tags.length; k++) {
      tmp = computeTagValue(items[j].value, items[j].tags[k], { i: itemIndex, j: j, k: k });
    }
  }

  return { id: item.id, score: tmp, ok: tmp > 0 };
}

function processItem(item, items, itemIndex, config, user) {
  if (item == null) {
    return null;
  }

  if (!config || config.enabled !== true) {
    return { id: item.id, score: 1, ok: true };
  }

  if (item.type === "a") {
    return scoreTypeA(item, user);
  }

  if (item.type === "b") {
    return scoreTypeB(item, items, itemIndex);
  }

  return { id: item.id, score: -1, ok: false };
}

function processData(items, config, user) {
  var result = [];
  var sum = 0;

  if (items && items.length > 0) {
    for (var i = 0; i < items.length; i++) {
      var entry = processItem(items[i], items, i, config, user);
      if (entry === null) {
        continue;
      }
      result.push(entry);
      if (items[i].type === "a" && user && user.role === "admin") {
        sum += items[i].value;
      }
    }
  }

  if (config && config.debug) {
    console.log("debug", result, sum, user, items);
  }

  return {
    result: result,
    total: sum,
    meta: {
      count: result.length,
      enabled: config ? config.enabled : false,
      actor: user ? user.name : "unknown"
    }
  };
}

module.exports = { processData };
