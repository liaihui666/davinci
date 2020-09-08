import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import UI from 'sketch/ui'
import { convert } from '../utils/convert'
import { createTemplate } from '../utils/request'

export const webviewIdentifier = 'davinci.webview.export'
const options = {
  identifier: webviewIdentifier,
  width: 240,
  height: 180,
  show: false
}

let exportType = ''

const browserWindow = new BrowserWindow(options)

browserWindow.loadURL(require('../../resources/export.html'))


export function showExportModal(type){
  exportType= type
  browserWindow.show()
}

export function hideExportModal(){
  const existingWebview = getWebview(webviewIdentifier)
  if(existingWebview){
    existingWebview.close()
  }
}

const webContents = browserWindow.webContents

webContents.on('exportConfirm', name => {
  convert(name).then((res)=>{
    console.log(res)
    createTemplate(res).then((res)=>{
      console.log('------success---------')
      console.log(res)
      console.log(res.json())
      console.log('---------------')
  
  
      
      UI.message('创建模板成功')
    }).catch(res=>{
      console.log('------fail---------')
      console.log(res)
      console.log(res.json())
      console.log('---------------')


      UI.message(`导出模板失败：
      ${res.json()}`)
    })
  })

})