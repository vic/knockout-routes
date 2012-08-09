ko.routes = (mapping)->

  named = /:\w+/g
  splat = /\*\w+/g
  namedOrSplat = /[:\*]\w+/
  namedOrSplatGroup  = /(:|\*)(\w+)/g
  namedGroup = '\([^/]+\)'
  splatGroup = '\(.*?\)'
  suid = /[\?]&_suid=\d+/
  sigil = ko.observable('')

  Routes = ->
  Routes.prototype = {}

  current_url = ko.observable()
  routes = new Routes

  for own name, route of mapping when typeof route == 'string'
    ((name, route)->
      params = {}
      names = (s.slice(1) for s in (route.match(namedOrSplatGroup) || []))

      (params[m] = ko.observable()) for m in names

      parts = []
      for part, i in route.split(namedOrSplat)
        ((part, i)->
          parts.push(-> part)
          parts.push(params[names[i]]) if names[i]
        )(part, i)

      groups = route.replace(named, namedGroup).replace(splat, splatGroup)
      regexp = new RegExp "^[#\?/]*?#{groups}$"

      url = ko.computed
        write: (u, data = null, trigger = true, replace = false, title = null)->
          u = u.replace(suid, '')
          matches = u.match(regexp)
          if matches
            current_url url()
            unless data
              data = {}
              data[names[i]] = value for value, i in matches.slice(1)
            params[k](v) for own k, v of data when params[k]
            state(data, trigger, replace, title)
        read: -> sigil() + (p() for p in parts).join('')

      state = (->
        json = ko.observable(false)
        ko.computed
          write: (d, trigger = true, replace = false, title = null)->
            json d
            params[k](v) for own k, v of d when params[k]
            if trigger
              if replace
                History.replaceState d, title, url()
              else
                History.pushState d, title, url()
          read: -> json()
      )()

      state.url = url
      state.param = params
      state.active = ko.computed read: -> url() == current_url()

      routes[name] = state
    )(name, route)

  Routes.prototype.ready = (_sigil)->
    sigil _sigil if _sigil
    state = History.getState()
    url = state.hash
    r.url(url, false, false) for own n, r of routes

  History.Adapter.bind window, 'statechange', ->
    state = History.getState()
    url = state.hash
    r.url(url, state.data) for own n, r of routes

  routes

