export const createSchema = (size) => {
  const [width, height] = size
  const versionId = 'O1CN01l03z9t2KE2jASlNHF-761679524'
  const pageId = 'O1CN01l0339t2KE2jASlNHF-761679524'
  return {
    schema: {
      itemSelected: {},
      style: {
        width: width,
        height: height
      },
      colorSwatches: {},
      items: {},
      pageVersions: {
        [versionId]: {
          _id: versionId,
          itemIDs: [],
          style: {
            backgroundColor: '#fff',
            backgroundImage: '',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center'
          },
          boxStyle: {
            width: width,
            height: height
          }
        }
      },
      activePageID: pageId,
      pageIDs: [pageId],
      pages: {
        [pageId]: {
          _sort: 1,
          _id: pageId,
          versions: [versionId],
          activeVersion: versionId
        }
      }
    }
  }
}
