(function() {
  var __hasProp = {}.hasOwnProperty;

  ko.routes = function(mapping) {
    var Routes, current, name, named, namedGroup, namedOrSplat, namedOrSplatGroup, route, routes, sigil, splat, splatGroup, suid;
    named = /:\w+/g;
    splat = /\*\w+/g;
    namedOrSplat = /[:\*]\w+/;
    namedOrSplatGroup = /(:|\*)(\w+)/g;
    namedGroup = '\([^/]+\)';
    splatGroup = '\(.*?\)';
    suid = /[\?]&_suid=\d+/;
    sigil = ko.observable('');
    Routes = function() {};
    Routes.prototype = {};
    current = ko.observable();
    routes = new Routes;
    for (name in mapping) {
      if (!__hasProp.call(mapping, name)) continue;
      route = mapping[name];
      if (typeof route === 'string') {
        (function(name, route) {
          var groups, i, m, names, params, part, parts, regexp, s, state, url, _fn, _i, _j, _len, _len1, _ref;
          params = {};
          names = (function() {
            var _i, _len, _ref, _results;
            _ref = route.match(namedOrSplatGroup) || [];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              s = _ref[_i];
              _results.push(s.slice(1));
            }
            return _results;
          })();
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            m = names[_i];
            params[m] = ko.observable();
          }
          parts = [];
          _ref = route.split(namedOrSplat);
          _fn = function(part, i) {
            parts.push(function() {
              return part;
            });
            if (names[i]) {
              return parts.push(params[names[i]]);
            }
          };
          for (i = _j = 0, _len1 = _ref.length; _j < _len1; i = ++_j) {
            part = _ref[i];
            _fn(part, i);
          }
          groups = route.replace(named, namedGroup).replace(splat, splatGroup);
          regexp = new RegExp("^[#\?/]*?" + groups + "$");
          url = ko.computed({
            write: function(u, data, trigger, replace, title) {
              var k, matches, v, value, _k, _len2, _ref1;
              if (data == null) {
                data = null;
              }
              if (trigger == null) {
                trigger = true;
              }
              if (replace == null) {
                replace = false;
              }
              if (title == null) {
                title = null;
              }
              u = u.replace(suid, '');
              matches = u.match(regexp);
              if (matches) {
                current(state);
                if (!data) {
                  data = {};
                  _ref1 = matches.slice(1);
                  for (i = _k = 0, _len2 = _ref1.length; _k < _len2; i = ++_k) {
                    value = _ref1[i];
                    data[names[i]] = value;
                  }
                }
                for (k in data) {
                  if (!__hasProp.call(data, k)) continue;
                  v = data[k];
                  if (params[k]) {
                    params[k](v);
                  }
                }
                return state(data, trigger, replace, title);
              }
            },
            read: function() {
              var p;
              return sigil() + ((function() {
                var _k, _len2, _results;
                _results = [];
                for (_k = 0, _len2 = parts.length; _k < _len2; _k++) {
                  p = parts[_k];
                  _results.push(p());
                }
                return _results;
              })()).join('');
            }
          });
          state = (function() {
            var json;
            json = ko.observable(false);
            return ko.computed({
              write: function(d, trigger, replace, title) {
                var k, v;
                if (trigger == null) {
                  trigger = true;
                }
                if (replace == null) {
                  replace = false;
                }
                if (title == null) {
                  title = null;
                }
                json(d);
                for (k in d) {
                  if (!__hasProp.call(d, k)) continue;
                  v = d[k];
                  if (params[k]) {
                    params[k](v);
                  }
                }
                if (trigger) {
                  if (replace) {
                    return History.replaceState(d, title, url());
                  } else {
                    return History.pushState(d, title, url());
                  }
                }
              },
              read: function() {
                return json();
              }
            });
          })();
          state.url = url;
          state.param = params;
          state.active = ko.computed({
            read: function() {
              return url() === current().url();
            }
          });
          return routes[name] = state;
        })(name, route);
      }
    }
    Routes.prototype.current = current;
    Routes.prototype.ready = function(_sigil) {
      var n, r, state, url, _results;
      if (_sigil) {
        sigil(_sigil);
      }
      state = History.getState();
      url = state.hash;
      _results = [];
      for (n in routes) {
        if (!__hasProp.call(routes, n)) continue;
        r = routes[n];
        _results.push(r.url(url, false, false));
      }
      return _results;
    };
    History.Adapter.bind(window, 'statechange', function() {
      var n, r, state, url, _results;
      state = History.getState();
      url = state.hash;
      _results = [];
      for (n in routes) {
        if (!__hasProp.call(routes, n)) continue;
        r = routes[n];
        _results.push(r.url(url, state.data));
      }
      return _results;
    });
    return routes;
  };

}).call(this);
