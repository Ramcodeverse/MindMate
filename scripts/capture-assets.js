import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const screenshotsDir = path.resolve('docs/screenshots');
const gifsDir = path.resolve('docs/gifs');
const demosDir = path.resolve('docs/demos');

[screenshotsDir, gifsDir, demosDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

async function capture() {
  console.log('🚀 Starting MindMate visual asset generation...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2, // Retina quality
  });

  const page = await context.newPage();

  // 1. Visit landing page
  console.log('📸 Capturing 01-landing-hero.png...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '01-landing-hero.png') });

  // 2. Features scroll
  console.log('📸 Capturing 02-landing-features.png...');
  await page.evaluate(() => {
    const el = document.getElementById('act-notice');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, '02-landing-features.png') });

  // 3. Footer
  console.log('📸 Capturing 10-footer.png...');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, '10-footer.png') });

  // 4. Auth Modal
  console.log('📸 Capturing 09-authentication.png...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const signInBtn = await page.$('text="Sign in"');
  if (signInBtn) {
    await signInBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, '09-authentication.png') });
    // Close modal or login
    const closeBtn = await page.$('button[aria-label="Close modal"]');
    if (closeBtn) await closeBtn.click();
  }

  // 5. Enter application as Sarah Johnson (demo)
  console.log('🔑 Entering authenticated application...');
  await page.evaluate(() => {
    localStorage.setItem('mindmate_user', JSON.stringify({
      id: 'usr_sarah_101',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'user',
      preferences: { dailyReminder: true, aiContextSharing: true, ambientSoundDefault: false }
    }));
    localStorage.setItem('mindmate_auth_token', 'usr_sarah_101');
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // 6. Mood Tracker
  console.log('📸 Capturing 03-mood-tracker.png...');
  const moodNav = await page.$('text="Mood Rhythm"');
  if (moodNav) await moodNav.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '03-mood-tracker.png') });

  // 7. Journal Editor
  console.log('📸 Capturing 04-journal-editor.png...');
  const journalNav = await page.$('text="Daily Journal"');
  if (journalNav) await journalNav.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '04-journal-editor.png') });

  // 8. Habit Dashboard
  console.log('📸 Capturing 05-habit-dashboard.png...');
  const habitNav = await page.$('text="Habit Anchors"');
  if (habitNav) await habitNav.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '05-habit-dashboard.png') });

  // 9. Calendar & Analytics
  console.log('📸 Capturing 06-calendar-analytics.png...');
  const calNav = await page.$('text="Calendar History"');
  if (calNav) await calNav.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '06-calendar-analytics.png') });

  // 10. AI Companion
  console.log('📸 Capturing 07-ai-companion.png...');
  const aiNav = await page.$('text="AI Reflection"');
  if (aiNav) await aiNav.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '07-ai-companion.png') });

  // 11. Mobile Dashboard (390x844)
  console.log('📸 Capturing 08-mobile-dashboard.png...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => {
    localStorage.setItem('mindmate_user', JSON.stringify({
      id: 'usr_sarah_101',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'user',
      preferences: { dailyReminder: true, aiContextSharing: true, ambientSoundDefault: false }
    }));
    localStorage.setItem('mindmate_auth_token', 'usr_sarah_101');
  });
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, '08-mobile-dashboard.png') });
  await mobileContext.close();

  // 12. GENERATE ANIMATED GIF PREVIEWS VIA FFMPEG
  console.log('🎬 Generating animated GIF previews from real interactive recordings...');

  // Helper function to capture frame sequences and convert to GIF
  async function recordInteractionToGif(actionFn, gifFilename, frameCount = 12, fps = 4) {
    const tempDir = path.resolve(`temp_frames_${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });

    for (let i = 0; i < frameCount; i++) {
      await actionFn(i);
      const framePath = path.join(tempDir, `frame_${String(i).padStart(3, '0')}.png`);
      await page.screenshot({ path: framePath });
      await page.waitForTimeout(250);
    }

    const outputGif = path.join(gifsDir, gifFilename);
    try {
      execSync(
        `ffmpeg -y -framerate ${fps} -i "${tempDir}/frame_%03d.png" -vf "scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${outputGif}"`,
        { stdio: 'ignore' }
      );
      console.log(`✅ Generated GIF: ${gifFilename}`);
    } catch (err) {
      console.warn(`Could not generate ${gifFilename} via ffmpeg:`, err.message);
    } finally {
      execSync(`rm -rf "${tempDir}"`);
    }
  }

  // GIF 1: mindmate-mood-tracking.gif
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const moodBtn = await page.$('text="Mood Rhythm"');
  if (moodBtn) await moodBtn.click();
  await page.waitForTimeout(600);
  await recordInteractionToGif(async (step) => {
    const emojis = await page.$$('button:has-text("Terrible"), button:has-text("Good"), button:has-text("Excellent"), button:has-text("Okay")');
    if (emojis[step % emojis.length]) {
      await emojis[step % emojis.length].click().catch(() => {});
    }
  }, 'mindmate-mood-tracking.gif', 10, 4);

  // GIF 2: mindmate-habit-completion.gif
  const habitsBtn = await page.$('text="Habit Anchors"');
  if (habitsBtn) await habitsBtn.click();
  await page.waitForTimeout(600);
  await recordInteractionToGif(async (step) => {
    const checkBoxes = await page.$$('button:has(.lucide-check)');
    if (checkBoxes[step % checkBoxes.length]) {
      await checkBoxes[step % checkBoxes.length].click().catch(() => {});
    }
  }, 'mindmate-habit-completion.gif', 8, 3);

  // GIF 3: mindmate-dashboard-navigation.gif
  await recordInteractionToGif(async (step) => {
    const views = ['Dashboard', 'Daily Journal', 'Calendar History', 'AI Reflection', 'Dashboard'];
    const nav = await page.$(`text="${views[step % views.length]}"`);
    if (nav) await nav.click().catch(() => {});
  }, 'mindmate-dashboard-navigation.gif', 10, 2);

  // GIF 4: mindmate-landing-experience.gif
  await page.evaluate(() => {
    localStorage.removeItem('mindmate_user');
    localStorage.removeItem('mindmate_auth_token');
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await recordInteractionToGif(async (step) => {
    await page.evaluate((s) => {
      window.scrollTo({ top: s * 400, behavior: 'smooth' });
    }, step);
  }, 'mindmate-landing-experience.gif', 12, 3);

  // GIF 5: mindmate-ai-conversation.gif
  await page.evaluate(() => {
    localStorage.setItem('mindmate_user', JSON.stringify({
      id: 'usr_sarah_101',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'user',
      preferences: { dailyReminder: true, aiContextSharing: true, ambientSoundDefault: false }
    }));
    localStorage.setItem('mindmate_auth_token', 'usr_sarah_101');
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const aiRef = await page.$('text="AI Reflection"');
  if (aiRef) await aiRef.click();
  await page.waitForTimeout(600);
  await recordInteractionToGif(async (step) => {
    if (step === 2) {
      const input = await page.$('input[placeholder*="thoughts or feelings"]');
      if (input) await input.fill('I feel calm and grounded today.');
    }
  }, 'mindmate-ai-conversation.gif', 8, 3);

  await browser.close();
  console.log('🎉 All screenshots and GIF previews generated successfully!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
