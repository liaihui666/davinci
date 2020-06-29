// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

// call the plugin from the webview
document.getElementById('login').addEventListener('click', () => {
  let account = document.getElementById('account').value
  let password = document.getElementById('password').value
  window.postMessage('loginSubmit', {
    account,
    password
  })
})



// call the wevbiew from the plugin
window.setRandomNumber = (randomNumber) => {
  document.getElementById('answer').innerHTML = 'Random number from the plugin: ' + randomNumber
}
