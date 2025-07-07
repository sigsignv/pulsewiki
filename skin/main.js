// PukiWiki - Yet another WikiWikiWeb clone.
// main.js
// Copyright 2017-2020 PukiWiki Development Team
// License: GPL v2 or (at your option) any later version
//
// PukiWiki JavaScript client script
/* eslint-env browser */
// eslint-disable-next-line no-unused-expressions
window.addEventListener && window.addEventListener('DOMContentLoaded', function () {
  'use strict'
  /**
   * @param {NodeList} nodeList
   * @param {function(Node, number): void} func
   */
  function forEach (nodeList, func) {
    if (nodeList.forEach) {
      nodeList.forEach(func)
    } else {
      for (var i = 0, n = nodeList.length; i < n; i++) {
        func(nodeList[i], i)
      }
    }
  }
  // AutoTicketLink
  function autoTicketLink () {
    var headReText = '([\\s\\b:\\[\\(,;]|^)'
    var tailReText = '\\b'
    var ignoreTags = ['A', 'INPUT', 'TEXTAREA', 'BUTTON',
      'SCRIPT', 'FRAME', 'IFRAME']
    var ticketSiteList = []
    var jiraProjects = null
    var jiraDefaultInfo = null
    function regexEscape (key) {
      return key.replace(/[-.]/g, function (m) {
        return '\\' + m
      })
    }
    function setupSites (siteList) {
      for (var i = 0, length = siteList.length; i < length; i++) {
        var site = siteList[i]
        var reText = ''
        switch (site.type) {
          case 'jira':
            reText = '(' + regexEscape(site.key) +
              '):([A-Z][A-Z0-9]{1,20}(?:_[A-Z0-9]{1,10}){0,2}-\\d{1,10})'
            break
          case 'redmine':
            reText = '(' + regexEscape(site.key) + '):(\\d{1,10})'
            break
          case 'git':
            reText = '(' + regexEscape(site.key) + '):([0-9a-f]{7,40})'
            break
          default:
            continue
        }
        site.reText = reText
        site.re = new RegExp(headReText + reText + tailReText)
      }
    }
    function getJiraSite () {
      var reText = '()([A-Z][A-Z0-9]{1,20}(?:_[A-Z0-9]{1,10}){0,2}-\\d{1,10})'
      var site = {
        title: 'Builtin JIRA',
        type: '_jira_',
        key: '_jira_',
        reText: reText,
        re: new RegExp(headReText + reText + tailReText)
      }
      return site
    }
    function getSiteListFromBody () {
      var defRoot = document.querySelector('#pukiwiki-site-properties .ticketlink-def')
      if (defRoot && defRoot.value) {
        var list = JSON.parse(defRoot.value)
        setupSites(list)
        return list
      }
      return []
    }
    function getJiraProjectsFromBody () {
      var defRoot = document.querySelector('#pukiwiki-site-properties .ticketlink-jira-def')
      if (defRoot && defRoot.value) {
        try {
          return JSON.parse(defRoot.value) // List
        } catch (e) {
          return null
        }
      }
      return null
    }
    function getJiraDefaultInfoFromBody () {
      var defRoot = document.querySelector('#pukiwiki-site-properties .ticketlink-jira-default-def')
      if (defRoot && defRoot.value) {
        try {
          return JSON.parse(defRoot.value) // object
        } catch (e) {
          return null
        }
      }
      return null
    }
    function getSiteList () {
      return ticketSiteList
    }
    function getJiraProjectList () {
      return jiraProjects
    }
    function getDefaultJira () {
      return jiraDefaultInfo
    }
    function ticketToLink (keyText) {
      var siteList = getSiteList()
      for (var i = 0; i < siteList.length; i++) {
        var site = siteList[i]
        var m = keyText.match(site.re)
        if (m) {
          var ticketKey = m[3]
          var title = ticketKey
          var ticketUrl
          if (site.type === '_jira_') {
            // JIRA issue
            var projects = getJiraProjectList()
            var hyphen = keyText.indexOf('-')
            if (hyphen > 0) {
              var projectKey = keyText.substr(0, hyphen)
              if (projects) {
                for (var j = 0; j < projects.length; j++) {
                  var p = projects[j]
                  if (p.key === projectKey) {
                    if (p.title) {
                      title = p.title.replace(/\$1/g, ticketKey)
                    }
                    ticketUrl = p.base_url + ticketKey
                    break
                  }
                }
              }
              if (!ticketUrl) {
                var defaultJira = getDefaultJira()
                if (defaultJira) {
                  if (defaultJira.title) {
                    title = defaultJira.title.replace(/\$1/g, ticketKey)
                  }
                  ticketUrl = defaultJira.base_url + ticketKey
                }
              }
            }
            if (!ticketUrl) {
              return null
            }
          } else {
            // Explicit TicketLink
            if (site.title) {
              title = site.title.replace(/\$1/g, ticketKey)
            }
            ticketUrl = site.base_url + ticketKey
          }
          return {
            url: ticketUrl,
            title: title
          }
        }
      }
      return null
    }
    function getRegex (list) {
      var reText = ''
      for (var i = 0, length = list.length; i < length; i++) {
        if (reText.length > 0) {
          reText += '|'
        }
        reText += list[i].reText
      }
      return new RegExp(headReText + '(' + reText + ')' + tailReText)
    }
    function makeTicketLink (element) {
      var siteList = getSiteList()
      if (!siteList || siteList.length === 0) {
        return
      }
      var re = getRegex(siteList)
      var f
      var m
      var text = element.nodeValue
      while (m = text.match(re)) { // eslint-disable-line no-cond-assign
        // m[1]: head, m[2]: keyText
        if (!f) {
          f = document.createDocumentFragment()
        }
        if (m.index > 0 || m[1].length > 0) {
          f.appendChild(document.createTextNode(text.substr(0, m.index) + m[1]))
        }
        var linkKey = m[2]
        var linkInfo = ticketToLink(linkKey)
        if (linkInfo) {
          var a = document.createElement('a')
          a.textContent = linkKey
          a.href = linkInfo.url
          a.title = linkInfo.title
          f.appendChild(a)
        } else {
          f.appendChild(document.createTextNode(m[2]))
        }
        text = text.substr(m.index + m[0].length)
      }
      if (f) {
        if (text.length > 0) {
          f.appendChild(document.createTextNode(text))
        }
        element.parentNode.replaceChild(f, element)
      }
    }
    function walkElement (element) {
      var e = element.firstChild
      while (e) {
        if (e.nodeType === 3 && e.nodeValue &&
            e.nodeValue.length > 5 && /\S/.test(e.nodeValue)) {
          var next = e.nextSibling
          makeTicketLink(e)
          e = next
        } else {
          if (e.nodeType === 1 && ignoreTags.indexOf(e.tagName) === -1) {
            walkElement(e)
          }
          e = e.nextSibling
        }
      }
    }
    if (!Array.prototype.indexOf || !document.createDocumentFragment) {
      return
    }
    ticketSiteList = getSiteListFromBody()
    jiraProjects = getJiraProjectsFromBody()
    jiraDefaultInfo = getJiraDefaultInfoFromBody()
    if (jiraDefaultInfo || (jiraProjects && jiraProjects.length > 0)) {
      ticketSiteList.push(getJiraSite())
    }
    var target = document.getElementById('body')
    walkElement(target)
  }
  function showPagePassage () {
    /**
     * @param {Date} now
     * @param {string} dateText
     */
    function getSimplePassage (dateText, now) {
      if (!dateText) {
        return ''
      }
      var units = [{ u: 'm', max: 60 }, { u: 'h', max: 24 }, { u: 'd', max: 1 }]
      var d = new Date()
      d.setTime(Date.parse(dateText))
      var t = (now.getTime() - d.getTime()) / (1000 * 60) // minutes
      var unit = units[0].u; var card = units[0].max
      for (var i = 0; i < units.length; i++) {
        unit = units[i].u; card = units[i].max
        if (t < card) break
        t = t / card
      }
      return '' + Math.floor(t) + unit
    }
    /**
     * @param {Date} now
     * @param {string} dateText
     */
    function getPassage (dateText, now) {
      return '(' + getSimplePassage(dateText, now) + ')'
    }
    var now = new Date()
    var elements = document.getElementsByClassName('page_passage')
    forEach(elements, function (e) {
      var dt = e.getAttribute('data-mtime')
      if (dt) {
        var d = new Date(dt)
        e.textContent = ' ' + getPassage(d, now)
      }
    })
    var links = document.getElementsByClassName('link_page_passage')
    forEach(links, function (e) {
      var dt = e.getAttribute('data-mtime')
      if (dt) {
        var d = new Date(dt)
        if (e.title) {
          e.title = e.title + ' ' + getPassage(d, now)
        } else {
          e.title = e.textContent + ' ' + getPassage(d, now)
        }
      }
    })
    var simplePassages = document.getElementsByClassName('simple_passage')
    forEach(simplePassages, function (e) {
      var dt = e.getAttribute('data-mtime')
      if (dt) {
        var d = new Date(dt)
        e.textContent = getSimplePassage(d, now)
      }
    })
    // new plugin
    var newItems = document.getElementsByClassName('__plugin_new')
    forEach(newItems, function (e) {
      var dt = e.getAttribute('data-mtime')
      if (dt) {
        var d = new Date(dt)
        var diff = now.getTime() - d.getTime()
        var daySpan = diff / 1000 / 60 / 60 / 24
        if (daySpan < 1) {
          e.textContent = ' New!'
          e.title = getPassage(d, now)
          if (e.classList && e.classList.add) {
            e.classList.add('new1')
          }
        } else if (daySpan < 5) {
          e.textContent = ' New'
          e.title = getPassage(d, now)
          if (e.classList && e.classList.add) {
            e.classList.add('new5')
          }
        }
      }
    })
  }
  function convertExternalLinkToCushionPageLink () {
    function domainQuote (domain) {
      return domain.replace(/\./g, '\\.')
    }
    function domainsToRegex (domains) {
      var regexList = []
      domains.forEach(function (domain) {
        if (domain.substr(0, 2) === '*.') {
          // Wildcard domain
          var apex = domain.substr(2)
          var r = new RegExp('((^.*\\.)|^)' + domainQuote(apex) + '$', 'i')
          regexList.push(r)
        } else {
          // Normal domain
          regexList.push(new RegExp('^' + domainQuote(domain) + '$', 'i'))
        }
      })
      return regexList
    }
    function domainMatch (domain, regexList) {
      for (var i = 0, n = regexList.length; i < n; i++) {
        if (regexList[i].test(domain)) {
          return true
        }
      }
      return false
    }
    function removeCushionPageLinks () {
      var links = document.querySelectorAll('a.external-link')
      forEach(links, function (link) {
        var originalUrl = link.getAttribute('data-original-url')
        if (originalUrl) {
          link.setAttribute('href', originalUrl)
        }
      })
    }
    if (!document.querySelector || !JSON) return
    if (!Array || !Array.prototype || !Array.prototype.indexOf) return
    var extLinkDef = document.querySelector('#pukiwiki-site-properties .external-link-cushion')
    if (!extLinkDef || !extLinkDef.value) return
    var extLinkInfo = JSON.parse(extLinkDef.value)
    if (!extLinkInfo) return
    var refInternalDomains = extLinkInfo.internal_domains
    var silentExternalDomains = extLinkInfo.silent_external_domains
    if (!Array.isArray(refInternalDomains)) {
      refInternalDomains = []
    }
    var internalDomains = refInternalDomains.slice()
    var location = document.location
    if (location.protocol === 'file:') {
      removeCushionPageLinks()
      return
    }
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return
    if (internalDomains.indexOf(location.hostname) < 0) {
      internalDomains.push(location.hostname)
    }
    if (!Array.isArray(silentExternalDomains)) {
      silentExternalDomains = []
    }
    var propsE = document.querySelector('#pukiwiki-site-properties .site-props')
    if (!propsE || !propsE.value) return
    var siteProps = JSON.parse(propsE.value)
    var sitePathname = siteProps && siteProps.base_uri_pathname
    if (!sitePathname) return
    var internalDomainsR = domainsToRegex(internalDomains)
    var silentExternalDomainsR = domainsToRegex(silentExternalDomains)
    var links = document.querySelectorAll('a:not(.external-link):not(.internal-link)')
    var classListEnabled = null
    forEach(links, function (link) {
      if (classListEnabled === null) {
        classListEnabled = link.classList && link.classList.add && true
      }
      if (!classListEnabled) return
      var href = link.getAttribute('href')
      if (!href) return // anchor without href attribute (a name)
      var m = href.match(/^https?:\/\/([0-9a-zA-Z.-]+)(:\d+)?/)
      if (m) {
        var host = m[1]
        if (domainMatch(host, internalDomainsR)) {
          link.classList.add('internal-link')
        } else {
          if (domainMatch(host, silentExternalDomainsR) ||
            link.textContent.replace(/\s+/g, '') === '') {
            // Don't show extenal link icons on these domains
            link.classList.add('external-link-silent')
          }
          link.classList.add('external-link')
          link.setAttribute('title', href)
          link.setAttribute('data-original-url', href)
          link.setAttribute('href', sitePathname + '?cmd=external_link&url=' + encodeURIComponent(href))
        }
      } else {
        link.classList.add('internal-link')
      }
    })
  }
  function makeTopicpathTitle () {
    if (!document.createDocumentFragment || !window.JSON) return
    var sitePropE = document.querySelector('#pukiwiki-site-properties')
    if (!sitePropE) return
    var pageNameE = sitePropE.querySelector('.page-name')
    if (!pageNameE || !pageNameE.value) return
    var pageName = pageNameE.value
    var topicpathE = sitePropE.querySelector('.topicpath-links')
    if (!topicpathE || !topicpathE.value) return
    var topicpathLinks = JSON.parse(topicpathE.value)
    if (!topicpathLinks) return
    var titleH1 = document.querySelector('h1.title')
    if (!titleH1) return
    var aList = titleH1.querySelectorAll('a')
    if (!aList || aList.length > 1) return
    var a = titleH1.querySelector('a')
    if (!a) return
    if (a.textContent !== pageName) return
    var fragment = document.createDocumentFragment()
    for (var i = 0, n = topicpathLinks.length; i < n; i++) {
      var path = topicpathLinks[i]
      if (path.uri) {
        var a1 = document.createElement('a')
        a1.setAttribute('href', path.uri)
        a1.setAttribute('title', path.page)
        a1.textContent = path.leaf
        fragment.appendChild(a1)
      } else {
        var s1 = document.createElement('span')
        s1.textContent = path.leaf
        fragment.appendChild(s1)
      }
      var span = document.createElement('span')
      span.className = 'topicpath-slash'
      span.textContent = '/'
      fragment.appendChild(span)
    }
    var a2 = document.createElement('a')
    a2.setAttribute('href', a.getAttribute('href'))
    a2.setAttribute('title', 'Backlinks')
    a2.textContent = a.textContent.replace(/^.+\//, '')
    fragment.appendChild(a2)
    a.parentNode.replaceChild(fragment, a)
  }
  autoTicketLink()
  showPagePassage()
  convertExternalLinkToCushionPageLink()
  makeTopicpathTitle()
})
