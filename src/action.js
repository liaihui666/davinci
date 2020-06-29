
import UI from 'sketch/ui'
import { fetchScope, createTemplate, login, logout } from './utils/request'
import { showExportModal } from './modal/export'
import { showLoginModal } from './modal/login'

// 选择
export function selectArtboard(context){
  showExportModal('select')
}

// 全部
export function allArtboard(context){
  showLoginModal()
}

// 取消授权
export function logOut(context){
  logout().then(()=>{
    UI.message('取消授权成功')
  })
}

// // 选择
// export function select(context) {  

//   // UI.message('fetchScope')	  	
//   // fetchScope().then(res=>{
//   //   console.log(res.json())
//   // })
//   console.log(NSUUID)
//   // UI.message('createTemplate')	  	
//   // createTemplate({
//   //   name: '我来自sketch',
//   //   content: createSchema([100,200])
//   // }).then(()=>{
//   //   UI.message('createTemplate success')	  	
//   // })
//   // onShow(context)	
// }

// // 全部
// export function all(context) {  
//   // onShow(context)	
//   console.log(login)
//   UI.message('login')	  		
//   login().then(res=>{
//     console.log(res)
//   })
//   // UI.message('fetchScope')	  	
//   // fetchScope().then(res=>{
//   //   console.log(res.json())
//   // })
//   // UI.message('select all ---2')	  		
// }

// // export function onShutdown (context) {
// //   hideLoginModal(context)
// // }

