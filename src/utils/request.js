export const urlPrefix = 'https://alpha-cube.aidigger.com'
export const owlPrefix = 'https://owl.aidigger.com/api/v1'
let base64 = require('base-64')


const post = function (url, payload) {
  if (url.includes('http') === false) {
    url = urlPrefix + url
  }
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "POST",
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + base64.encode("sys-davinci:Eigen2020&6763")
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    }).then(res => {
      if (res.status === 200 || res.status === 201) {
        resolve(res)
      } else {
        reject(res)
      }
    }).catch(reject)
  })
}

const get = function (url, payload) {
  if (url.includes('http') === false) {
    url = urlPrefix + url
  }
  return fetch(url, payload)
}

const deleta = function (url) {
  if (url.includes('http') === false) url = urlPrefix + url
  return fetch(url, {
    method: 'DELETE',
  })
}

export function fetchScope() {
  return get(`/api/v1/scopes`, {
    page_size: 100
  })
}

export function createTemplate(payload) {
  return post(`/api/v1/templates`, payload)
}

export function login(payload) {
  return post(`${owlPrefix}/session`, payload)
}

export function logout() {
  return new Promise((resolve, reject) => {
    deleta(`${owlPrefix}/session`)
    .then(() => {
      var storage = NSHTTPCookieStorage.sharedHTTPCookieStorage()
      let cookies = storage.cookies()
      let len = cookies.count()
      for (let i = 0; i < len; i++) {
        let currentCookie = cookies[i]
        if (currentCookie.domain() == '.aidigger.com') {
          storage.deleteCookie(currentCookie)
        }
      }
      resolve()
    })
    .catch(reject)
  })
}