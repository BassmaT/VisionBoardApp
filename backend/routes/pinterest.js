import express from 'express';
import { chromium } from 'playwright';

const router = express.Router();

router.get('/', async (req, res) => {
  const pinterestUrl = req.query.url;

  if (!pinterestUrl) {
    return res.status(400).json({ error: 'Missing Pinterest URL' });
  }

  try {
    // Launch headless browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Go to the Pinterest link (short or full)
    await page.goto(pinterestUrl, { waitUntil: 'domcontentloaded' });

    // Wait for Pinterest to load images
    await page.waitForTimeout(3000);

    // Extract all image URLs from the page
    const imageUrls = await page.$$eval('img', imgs =>
      imgs
        .map(img => img.src)
        .filter(src => src && src.includes('pinimg.com'))
    );

    await browser.close();

    res.json({ images: imageUrls });

  } catch (err) {
    console.error("Pinterest scraping error:", err);
    res.status(500).json({ error: 'Failed to scrape Pinterest board' });
  }
});

export default router;