import { chromium } from 'playwright';
import path from 'path';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';

const screenshotsDir = path.resolve('docs/screenshots');
const gifsDir = path.resolve('docs/gifs');

[screenshotsDir, gifsDir].forEach(d => {
  if (!d) return;
  mkdirSync(d, { recursive: true });
});

async function main() {
  console.log('🚀 Running complete modern asset capture...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2
  });

  // 1. Landing Page Showcase
  console.log('📸 10-landing-showcase.png...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, '10-landing-showcase.png') });

  // 2. Login as Sarah Johnson
  console.log('Logging in as Sarah Johnson...');
  await page.evaluate(() => {
    localStorage.setItem('mindmate_user', JSON.stringify({
      id: 'usr_sarah_101',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'user'
    }));
    localStorage.setItem('mindmate_auth_token', 'usr_sarah_101');
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 3. Phase 1: Guided Flow - Mood & Energy
  console.log('📸 01-guided-flow-mood.png...');
  await page.screenshot({ path: path.join(screenshotsDir, '01-guided-flow-mood.png') });

  // Step 1: Select Calm emotion
  console.log('Selecting Calm emotion...');
  await page.locator('button:has-text("Joyful, positive, uplifted")').click();
  await page.waitForTimeout(400);

  // Select Feel happier intention
  console.log('Selecting Intention...');
  await page.locator('button:has-text("Feel happier")').first().click();
  await page.waitForTimeout(400);

  // Step 2: Continue to Profile
  console.log('Clicking Continue to Step 2...');
  await page.locator('button:has-text("Continue to Step 2: Your Profile")').click();
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));

  console.log('📸 02-guided-flow-profile.png...');
  await page.screenshot({ path: path.join(screenshotsDir, '02-guided-flow-profile.png') });

  // Sub-step 2: Music taste
  console.log('Clicking Next: Long-Term Music Taste...');
  await page.locator('button:has-text("Next: Long-Term Music Taste")').click();
  await page.waitForTimeout(500);

  // Sub-step 3: Cinema taste
  console.log('Clicking Next: Long-Term Cinema Taste...');
  await page.locator('button:has-text("Next: Long-Term Cinema Taste")').click();
  await page.waitForTimeout(500);

  // Step 3: MindMate Conversation
  console.log('Clicking Continue to Step 3: MindMate Conversation...');
  await page.locator('button:has-text("Continue to Step 3: MindMate Conversation")').click();
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));

  console.log('📸 03-ai-conversational-agent.png...');
  await page.screenshot({ path: path.join(screenshotsDir, '03-ai-conversational-agent.png') });

  // In conversation: answer questionnaire or fast forward to submit
  console.log('Navigating conversation questions to reach recommendation generation...');
  // Loop through questions to reach final screen
  for (let i = 0; i < 20; i++) {
    const finalGenBtn = page.locator('button:has-text("Generate My MindMate Plan")');
    if (await finalGenBtn.isVisible()) {
      console.log('Found final submit button! Clicking Generate...');
      await finalGenBtn.click();
      break;
    }
    // Click any active option button in the chat
    const option = page.locator('button.w-full.text-left, button.p-3\\.5.rounded-2xl, button:has-text("Something soothing"), button:has-text("Quiet and peaceful"), button:has-text("English")').first();
    if (await option.isVisible()) {
      await option.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  }

  // Wait for AI recommendation results (Phase 5)
  console.log('Waiting for Phase 5 Recommendation Results to populate...');
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo(0, 0));

  console.log('📸 04-ai-recommendations-results.png...');
  await page.screenshot({ path: path.join(screenshotsDir, '04-ai-recommendations-results.png') });

  // Discover Hub
  console.log('📸 05-discover-hub.png...');
  await page.locator('nav button:has-text("Discover")').first().click();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(screenshotsDir, '05-discover-hub.png') });

  // Calm Tools
  console.log('📸 06-calm-tools-sanctuary.png...');
  await page.locator('nav button:has-text("Calm Tools")').first().click();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(screenshotsDir, '06-calm-tools-sanctuary.png') });

  // Mood Calendar
  console.log('📸 07-mood-calendar.png...');
  await page.locator('nav button:has-text("Mood Calendar")').first().click();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(screenshotsDir, '07-mood-calendar.png') });

  // Insights / Analytics
  console.log('📸 08-analytics-insights.png...');
  await page.locator('nav button:has-text("Insights")').first().click();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(screenshotsDir, '08-analytics-insights.png') });

  // Journal
  console.log('📸 09-distraction-free-journal.png...');
  await page.locator('nav button:has-text("Journal")').first().click();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(screenshotsDir, '09-distraction-free-journal.png') });

  // -------------------------------------------------------------
  // ANIMATED NAVIGATION GIF (Real recording across current views)
  // -------------------------------------------------------------
  console.log('🎬 Recording updated animated navigation GIF...');
  const tempDir = path.resolve(`temp_nav_${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });

  const navSequence = [
    { name: 'Guided Flow', wait: 900 },
    { name: 'Discover', wait: 900 },
    { name: 'Mood Calendar', wait: 900 },
    { name: 'Insights', wait: 900 },
    { name: 'Calm Tools', wait: 900 },
    { name: 'Journal', wait: 900 },
    { name: 'Guided Flow', wait: 900 },
  ];

  for (let i = 0; i < navSequence.length; i++) {
    const item = navSequence[i];
    const navBtn = page.locator(`nav button:has-text("${item.name}")`).first();
    await navBtn.click();
    await page.waitForTimeout(item.wait);
    await page.screenshot({ path: path.join(tempDir, `frame_${String(i).padStart(3, '0')}.png`) });
  }

  const outNavGif = path.join(gifsDir, 'mindmate-dashboard-navigation.gif');
  execSync(
    `ffmpeg -y -framerate 1.2 -i "${tempDir}/frame_%03d.png" -vf "scale=1100:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${outNavGif}"`,
    { stdio: 'ignore' }
  );
  execSync(`rm -rf "${tempDir}"`);
  console.log('✅ Generated modern mindmate-dashboard-navigation.gif');

  await browser.close();
  console.log('🎉 All modern visual assets generated successfully!');
}

main().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
