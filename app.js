const express = require('express')
const app = express()
const puppeteer = require('puppeteer')
const port = process.env.PORT || 8080
const validUrl = require('valid-url')

var parseUrl = function(url) {
  url = decodeURIComponent(url)
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = 'http://' + url
  }

  return url
}

app.get('/', function(req, res) {
  if (req.query.url === undefined || req.query.t === undefined) {
    res.send('Invalid url: ' + urlToScreenshot + '&t=' + req.query.t)
    return
  }

  var urlToScreenshot = parseUrl(req.query.url)

  if (validUrl.isWebUri(urlToScreenshot)) {
    console.log('Screenshotting: ' + urlToScreenshot + '&t=' + req.query.t)
    ;(async () => {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })

      const page = await browser.newPage()
      await page.goto(urlToScreenshot + '&t=' + req.query.t)
      await page.setViewport({ width: 1920, height: 1080 })

      const video = await page.$('.html5-video-player')
      await page.evaluate(() => {
        // Hide youtube player controls.
        let dom = document.querySelector('.ytp-chrome-bottom')
        dom.style.display = 'none'
      })

      await video.screenshot().then(function(buffer) {
        res.setHeader(
          'Content-Disposition',
          'attachment;filename="' + urlToScreenshot + '.png"'
        )
        res.setHeader('Content-Type', 'image/png')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.send(buffer)
      })

      await browser.close()
    })()
  } else {
    res.send('Invalid url: ' + urlToScreenshot)
  }
})

app.listen(port, function() {
  console.log('App listening on port ' + port)
})
