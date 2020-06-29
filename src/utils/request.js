
export const urlPrefix = 'https://alpha-cube.aidigger.com'
export const owlPrefix = 'https://owl.aidigger.com/api/v1'


const post = function (url, payload) {
  if (url.includes('http') === false) {
    url = urlPrefix + url
  }
  return fetch(url, {
    method: "POST",
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  })
}

const get = function (url, payload) {
  if (url.includes('http') === false) {
    url = urlPrefix + url
  }
  return fetch(url, payload)
}

const deleta = function (url){
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
  // const payload = {
  //   account: "hangwei@aidigger.com",
  //   password: "97c63e1a61a803c977d6c6e5e3385036"
  // }
  return post(`${owlPrefix}/session`, payload)
}

export function logout(){
  return deleta(`${owlPrefix}/session`)
}