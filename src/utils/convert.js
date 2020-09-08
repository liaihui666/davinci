// 新旧结构转换
import dom from 'sketch/dom'
import { createSchema } from './createSchema'
export const convert = (name) =>{
	try {
		console.log(name)
		return createSchema().then((res) => {
			var template = {
				'name': name,
				'content': {
					'schema': res
				}
			}
			console.log(template)
			return template
		})
	} catch (e) {
		console.log(e)
	}
	
  
}