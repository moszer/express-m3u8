const express = require('express');
const path = require('path');
const app = express();
const port = 3006;

const {
  mParser,
  mDownloader,
  mIndicator,
} = require('node-m3u8-to-mp4');

// Define a route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Define a route for the data loading SSE endpoint
app.get('/dump', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Set progress indicators
  mIndicator('downloading', (index, total) => {
    const dataLoading = `downloading: ${((index / total) * 100).toFixed(2)}% index: ${index} total: ${total}`;
    res.write(`data: ${dataLoading}\n\n`);
    console.log(dataLoading)
  });

  // Function to force download m3u8 to ts file
  function forceDownloadM3u8(Link_, referer_) {
    // Parse the video resource list
    mParser(Link_, {
      referer: referer_,
    }).then((list) => {
      // Extract the URLs from the resource list
      const medias = list.map((item) => `${item.url}`);
      console.log('Extracted');

      // Download the media files
      mDownloader(medias, {
        targetPath: path.resolve('.target'),
        headers: {
          referer: referer_,
        },
      })
        .then(() => {
          console.log('load ts file success');
        })
        .catch((e) => {
          console.log('Force Failed');
        });
    });
  }

  // Run the function to dump ts files
  forceDownloadM3u8(
    'https://live-par-2-abr.livepush.io/vod/bigbuckbunny/bigbuckbunny.1280x720.mp4/tracks-v1a1/mono.m3u8',
    'https://livepush.io/'
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
