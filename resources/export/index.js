// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

// call the plugin from the webview
document.getElementById('export').addEventListener('click', () => {
  let name = document.getElementById('name').value
  window.postMessage('exportConfirm', name)
})

