import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import UI from 'sketch/ui'
import { login } from '../utils/request'
export const webviewIdentifier = 'davinci.webview.login'
const options = {
  identifier: webviewIdentifier,
  width: 240,
  height: 180,
  show: false
}

const browserWindow = new BrowserWindow(options)

browserWindow.loadURL(require('../../resources/login.html'))


export function showLoginModal(){
  browserWindow.show()
}

export function hideLoginModal(){
  const existingWebview = getWebview(webviewIdentifier)
  if(existingWebview){
    existingWebview.close()
  }
}


const webContents = browserWindow.webContents

webContents.on('loginSubmit', payload => {
  login(password).then(()=>{
    hideLoginModal()
    UI.message('授权成功')
  })

  // webContents
  //   .executeJavaScript(`setRandomNumber(${Math.random()})`)
  //   .catch(console.error)
})