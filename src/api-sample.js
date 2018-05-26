const Axios = require('axios')
const Path = require('path')
const Fs = require('fs')

const url = 'https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyDflsDUpu_e7MRMMaWA3o1oEvvHuu7TA2M&photoreference=CmRaAAAA8mLs7PdH008BEY4NxG9XorHpmieLEk6l2x3iQUl-kIIeyPec1aQ3Bj1BakyiG-QzcZrZepowOwG35jz2xfJWdQnWhsjvWUrNPw3OvCVaOQEesXtLaRT3LZZ2tL44YTNCEhDC8XAJeHARQPlynOxgj33QGhRgRFDtVTeTRDZQNdoiACefJp7ReA&maxwidth=800'
const path = Path.resolve(__dirname, 'images', 'code.jpg')

async function getImage () {
  // axios image download with response type "stream"
  const response = await Axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  })

  // pipe the result stream into a file on disc
  response.data.pipe(Fs.createWriteStream(path))

  // return a promise and resolve when download finishes
  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      resolve()
    })

    response.data.on('error', () => {
      reject()
    })
  })

}

getImage()
.then(a => console.log('DONE!'))