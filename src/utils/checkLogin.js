
import { showLoginModal } from '../modal/login'

const isLogin = false

export default function () {
  if(isLogin){
    return true
  } else {
    showLoginModal()
    return false
  }
}