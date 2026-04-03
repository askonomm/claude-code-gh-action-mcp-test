function scoreTypeA(item, user) {
  if (user && user.role == "admin") {
    return { id: item.id, score: item.value * 2, ok: true };
  }
  if (item.value > 10) {
    return { id: item.id, score: item.value, ok: true };
  }
  return { id: item.id, score: 0, ok: false };
}

function computeTagValue(tag, entry) {
  if (tag == "hot") {
    return entry.baseValue + entry.k + entry.j + entry.i;
  }
  if (tag == "cold") {
    return entry.baseValue - entry.k - entry.j - entry.i;
  }
  return entry.baseValue;
}

function computeGroupScore(items, item, i) {
  var tmp = null;
  for (var j = 0; j < items.length; j++) {
    if (!items[j] || items[j].group != item.group) {
      continue;
    }
    for (var k = 0; k < items[j].tags.length; k++) {
      tmp = computeTagValue(items[j].tags[k], { baseValue: items[j].value, k: k, j: j, i: i });
    }
  }
  return tmp;
}

function scoreTypeB(items, item, i) {
  var tmp = computeGroupScore(items, item, i);
  return { id: item.id, score: tmp, ok: tmp > 0 };
}

function scoreByType(items, item, i, user) {
  if (item.type == "a") {
    return scoreTypeA(item, user);
  }
  if (item.type == "b") {
    return scoreTypeB(items, item, i);
  }
  return { id: item.id, score: -1, ok: false };
}

function isConfigEnabled(config) {
  return config && config.enabled == true;
}

function isAdminOfTypeA(item, user) {
  return item.type == "a" && user && user.role == "admin";
}

function buildResult(items, config, user) {
  var result = [];
  var sum = 0;

  if (!items || items.length == 0) {
    return { result: result, sum: sum };
  }

  for (var i = 0; i < items.length; i++) {
    if (items[i] == null) {
      continue;
    }
    if (!isConfigEnabled(config)) {
      result.push({ id: items[i].id, score: 1, ok: true });
      continue;
    }
    result.push(scoreByType(items, items[i], i, user));
    if (isAdminOfTypeA(items[i], user)) {
      sum = sum + items[i].value;
    }
  }

  return { result: result, sum: sum };
}

function buildMeta(result, config, user) {
  return {
    count: result.length,
    enabled: config ? config.enabled : false,
    actor: user ? user.name : "unknown"
  };
}

function processData(items, config, user) {
  var data = buildResult(items, config, user);

  if (config && config.debug) {
    console.log("debug", data.result, data.sum, user, items);
  }

  return {
    result: data.result,
    total: data.sum,
    meta: buildMeta(data.result, config, user)
  };
}

module.exports = { processData };
