// export const createSchema = (size) => {
//   const [width, height] = size
//   const versionId = 'O1CN01l03z9t2KE2jASlNHF-761679524'
//   const pageId = 'O1CN01l0339t2KE2jASlNHF-761679524'
//   return {
//     schema: ''
//   }
// }
const sketch = require('sketch/dom')
var promiseList = []

export const createSchema = () => {
	console.log('create schema start')
	const document = sketch.getSelectedDocument()

	let artBoards = document.pages[0].layers
	let selectArtBoards = []
	console.log(`artboards number is ${artBoards.length}`)

	try {
		// 最左侧宽度相同的画板会被用来转模板
		for (var i in artBoards) {
			// console.log(`selectArtBoards number is: ${selectArtBoards.length}`)
			// console.log(`artBoard type is: ${artBoards[i].type}`)
			if (artBoards[i].type !== 'Artboard'){
				continue
			}
			if (selectArtBoards.length > 0){
				// console.log(`artBoard frame x is: ${artBoards[i].frame.x}`)
				// console.log(`selectArtBoards frame x is: ${selectArtBoards[0].frame.x}`)
				if (artBoards[i].frame.x < selectArtBoards[0].frame.x){
					selectArtBoards = []
					selectArtBoards.push(artBoards[i])
				} else if (artBoards[i].frame.x === selectArtBoards[0].frame.x && artBoards[i].frame.width === selectArtBoards[0].frame.width){
					selectArtBoards.push(artBoards[i])
				}
			} else {
				selectArtBoards.push(artBoards[i])
			}
		}
	} catch(e){
		console.log(e)
	}
	
	console.log(`select artboards number is ${selectArtBoards.length}`)

	selectArtBoards.sort(compare('y'))

	// 选中色板中最顶部的坐标设为(0, 0)，其他色板的坐标是它的相对值
	var topY = selectArtBoards[0].frame.y
	for (var i in selectArtBoards){
		selectArtBoards[i].frame.x = 0
		if(i === 0){
			selectArtBoards[i].frame.y = 0
		} else{
			selectArtBoards[i].frame.y = selectArtBoards[i].frame.y - topY
		}
	}

	try {
		// console.log(`selectArtBoards number is ${selectArtBoards.length}`)
		for (var i in selectArtBoards){
			exportLayers(selectArtBoards[i].layers)
		}	
		return Promise.all(promiseList).then((values) => {
			console.log(`upload oss result length: ${values.length}`)
			try {
				var urlMap = {}
				for (var i in values) {
					var value = values[i].json()
					urlMap[value['_value']['layer_id']] = value['_value']['url']
				}
				var schema = generate_schema(selectArtBoards, urlMap)
				return schema
			} catch (e) {
				console.log(`generate schema error: ${e}`)
			}
			
		})
	} catch (e) {
		log(e)
	}
}

function generate_schema(selectArtBoards, urlMap) {
	try {
		var itemList = []
		var pageDict = {}
		var pageVersionDict = {}
		var pageIds = []
		var height = 0
		var width = 0
		for (var i in selectArtBoards) {
			var pageItem = []
			var zIndex = 1
			for (var j in selectArtBoards[i].layers) {
				handleLayers(selectArtBoards[i].layers[j], urlMap, pageItem, zIndex=zIndex)
				zIndex = zIndex + 1
			}
			itemList = itemList.concat(pageItem)
			var item_ids = []
			for (var p in pageItem) {
				item_ids.push(pageItem[p]['_id'])
			}
			var page_id = uuid()
			var page_version_id = uuid()
			var page = pageTemplate(page_id, page_version_id)
			var pageVersion = pageVersionTemplate(page_version_id, item_ids, selectArtBoards[i].frame.width, selectArtBoards[i].frame.height)
			pageDict[page_id] = page
			pageVersionDict[page_version_id] = pageVersion
			pageIds.push(page_id)
			width = selectArtBoards[i].frame.width
			height = height + selectArtBoards[i].frame.height
		}
		console.log(`itemList length: ${itemList.length}`)
		var items = {}
		var itemIds = []
		for (var it in itemList) {
			items[itemList[it]['_id']] = itemList[it]
			itemIds.push(itemList[it]['_id'])
		}
		var schema = schemaTemplate(width, height, items, pageVersionDict, pageIds, pageDict)
		// console.log(schema)
		return schema
	} catch (e) {
		console.log(e)
	}

}


function exportLayers(layers) {
	for (let j in layers) {
		if (layers[j].id === undefined || layers[j].id === null) continue
		console.log(`layer id: ${layers[j].id} type: ${layers[j].type}`)
		if (layers[j].type === 'ShapePath' || layers[j].type === 'Shape' || layers[j].type === 'Image' || layers[j].type === 'Group') {
			try {
				if (layers[j].type === 'ShapePath' || layers[j].type === 'Shape') {
					var buffer = convertSvg(layers[j])
					var format = 'svg'
				} else {
					var buffer = convertImage(layers[j])
					var format = 'png'
				}
				let file = buffer.toString('base64')
				let url = 'https://api.aidigger.com/67a7da93/caster2/api/v1/run/entry/dev/davinci_upload_oss'
				let payload = {
					'layer_id': layers[j].id,
					'file': file,
					'format': format
				}
				promiseList.push(upload(url, payload))
			} catch (e) {
				console.log(e)
			}
		}
	}

}


function handleLayers(layer, urlMap, pageItem, depth=1, zIndex=1) {
	// console.log(`layer type: ${layer.type}`)
	if (layer.type === 'Text') {
		var style = layer.style
		var frame = layer.frame
		if (style.alignment === 'right') {
			var x = frame.x - frame.width
		} else if (style.alignment === 'center') {
			var x = frame.x - frame.width * 0.5
		} else {
			var x = frame.x
		}
		if (style.lineHeight) {
			var lineHeight = style.lineHeight / style.fontSize
		} else {
			var lineHeight = 1.4
		}
		var item = textTemplate(zIndex, style.opacity, frame.width * 2, frame.height + style.lineHeight, x, frame.y, layer.text, style.alignment, 
			style.fontSize, lineHeight, style.fontFamily, style.textColor.substring(0, style.textColor.length - 2), style.fontWeight, style.kerning)
		pageItem.push(item)
	} else if (layer.type === 'Image' || layer.type === 'Group') {
		var style = layer.style
		var frame = layer.frame
		var item = imageTemplate(zIndex, style.opacity, frame.width, frame.height, frame.x, frame.y, urlMap[layer.id])
		pageItem.push(item)
	} else if (layer.type === 'ShapePath' || layer.type === 'Shape') {
		var style = layer.style
		var frame = layer.frame
		var color = []
		for (var k in style.fills) {
			if (style.fills[k].color) {
				color.push(style.fills[k].color.substring(0, style.fills[k].color.length - 2))
			}
		}
		var item = svgTemplate(zIndex, style.opacity, frame.width, frame.height, frame.x, frame.y, urlMap[layer.id], color)
		pageItem.push(item)
	}
	//  else if (layer.type === 'Group') {
	// 	for (var l in layer.layers) {
	// 		var zi = zIndex + l + 1
	// 		handleLayers(layer.layers[l], urlMap, pageItem, depth=depth + 1, zIndex=zi)
	// 	}
	// }
}


const convertImage = function (layer) {
	try {
		return sketch.export(layer, {
			output: false,
			'group-contents-only': false,
			'use-id-for-name': true,
			formats: 'png'
		  })
	} catch (e) {
		console.log(e)
	}
}

const convertSvg = function (layer) {
	try {
		return sketch.export(layer, {
			output: false,
			'group-contents-only': false,
			'use-id-for-name': true,
			formats: 'svg'
		})
	} catch (e) {
		console.log(e)
	}
}


function compare(property){
  return function(a,b){
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
  }
}


function pageVersionTemplate(page_version_id, item_ids, width, height) {
	return {
		"_id": page_version_id,
		"itemIDs": item_ids,
		"style": {
			"backgroundColor": "#fff",
			"backgroundImage": "",
			"backgroundSize": "cover",
			"backgroundRepeat": "no-repeat",
			"backgroundPosition": "center center"
		},
		"boxStyle": {
			"width": width,
			"height": height
		}
	}
}

function pageTemplate(page_id, page_version_id) {
	return {
		"_sort": 1,
		"_id": page_id,
		"versions": [page_version_id],
		"activeVersion": page_version_id
	}
}

function schemaTemplate(width, height, items, pageVersions, pageIds, pages) {
	return {
		"itemSelected": {
			"textEditorVisable": false,
			"groupPrepareQueue": [],
			"activeGroup": ""
		},
		"style": {
			"width": width,
			"height": height
		},
		"colorSwatches": {},
		"items": items,
		"pageVersions": pageVersions,
		"activePageID": pageIds[0],
		"pageIDs":  pageIds,
		"pages": pages,
		"version": 2,
		"maxScale": 1,
		"minScale": 1,
		"hideItemID": ""
	}
}

function textTemplate(zIndex, opacity, width, height, x, y, text, textAlign, 
	fontSize, lineHeight, fontFamily, color, fontWeight, spacing) {
	return {
		"_id": uuid(),
		"_locked": false,
		"_visible": true,
		"props": {
			"_sizeType": "dynamic",
			"backgroundSize": "100% 100%",
			"matrix":[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] ,
			"padding": [0, 0, 0, 0],
			"flip": [1,1],
			"border": {
				"width": 0,
				"type": "solid",
				"color": "#000",
				"left": true,
				"right": true,
				"top": true,
				"bottom": true
			},
			"transform": {
				"tx": 0,
				"ty": 0,
				"rotate": 0
			},
			"filter": {
				"opacity": opacity,
				"brightness": 1,
				"contrast": 1,
				"grayscale": 0,
				"saturate": 1,
				"blur": 0
			},
			"width": width,
			"height": height,
			"left": x,
			"top": y,
			"content": text,
			"textAlign":  textAlign,
			"fontSize":  fontSize,
			"lineHeight": lineHeight,
			"zIndex":  zIndex,
			"fontFamily": fontFamily,
			"color": color,
			"fontWeight": fontWeight,
			"stroke": {
				"color": "#545454",
				"width": 0
			},
			"letterSpacing": spacing,
		},
		"_type": "text",
		"_transform": {},
		"_layoutBindID": uuid(),
		"dynamic": {
			"content": {
				"desc": "文字",
				"type": "text"
			}
		}
	}
}

function imageTemplate(zIndex, opacity, width, height, x, y, image) {
	return {
		"_id": uuid(),
		"_locked": false,
		"_visible": true,
		"props": {
			"backgroundSize": "100% 100%",
			"matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
			"padding": [0, 0, 0, 0],
			"flip": [1, 1],
			"border": {
				"width": 0,
				"type": "solid",
				"color": "#000",
				"left": true,
				"right": true,
				"top": true,
				"bottom": true
			},
			"transform": {
				"tx": 0,
				"ty": 0,
				"rotate": 0
			},
			"filter": {
				"opacity": opacity,
				"brightness": 1,
				"contrast": 1,
				"grayscale": 0,
				"saturate": 1,
				"blur": 0
			},
			"width": width,
			"height": height,
			"left": x,
			"top": y,
			"value": image,
			"imageInfo": {
				"width": width,
				"height": height,
				"left": 0,
				"top": 0
			},
			"zIndex": zIndex
		},
		"_type": "image",
		"_transform": {},
		"_layoutBindID": uuid(),
		"dynamic": {
			"content": {
				"desc": "图片url",
				"type": "imageUrl"
			}
		}
	}
}

function svgTemplate(zIndex, opacity, width, height, x, y, svg, color) {
	return {
		"_id": uuid(),
		"_locked": false,
		"_visible": true,
		"props": {
			"backgroundSize": "100% 100%",
			"matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
			"padding": [0, 0, 0, 0],
			"flip": [1, 1],
			"border": {
				"width": 0,
				"type": "solid",
				"color": "#000",
				"left": true,
				"right": true,
				"top": true,
				"bottom": true
			},
			"transform": {
				"tx": 0,
				"ty": 0,
				"rotate": 0
			},
			"filter": {
				"opacity": opacity,
				"brightness": 1,
				"contrast": 1,
				"grayscale": 0,
				"saturate": 1,
				"blur": 0
			},
			"extraInfo": {
				"color": color,
				"category": "svgColor",
				"template": svg,
			},
			"width": width,
			"height": height,
			"left": x,
			"top": y,
			"zIndex": zIndex
		},
		"_type": "svg",
		"_transform": {},
		"_layoutBindID": uuid()
	}
}


function uuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid;
}


const upload = function (url, payload) {
	return new Promise((resolve, reject) => {
	  fetch(url, {
		method: "POST",
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	  }).then(res => {
		if (res.status === 200) {
		  resolve(res)
		} else {
		  reject(res)
		}
	  }).catch(reject)
	})
}