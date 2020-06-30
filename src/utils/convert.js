// 新旧结构转换
import dom from 'sketch/dom'
import { createSchema } from './createSchema'
export const convert = (name,type) =>{
  console.log(name,type)
  let content = createSchema([1280,1920])
  return {
    name,
    content
  }
}