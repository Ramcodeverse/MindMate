# MindMate AI — Step 3 Complete Conversational Chatbot UI/UX Upgrade

## 1. Main objective

Upgrade Step 3 of my existing MindMate AI application, **MindMate Conversation**, into a premium, interactive chatbot experience.

Use the attached MindMate chat UI screenshot as the primary visual reference.

**Do not rebuild the application from scratch. Inspect the current codebase and modify the existing Step 3 implementation directly. Preserve the framework, existing functionality, six-phase workflow, design tokens, user profile, mood data, and Gemini integration.**

### Current step

**Step 3 of 6 · MindMate Conversation**

Current heading: Guided Wellness Questionnaire

Replace the long, form-like questionnaire with an interactive conversation that feels like chatting with a friendly wellness companion.

The chatbot should ask one question at a time, display attractive selectable answer options, record the answer, show it in a user message bubble, and move naturally to the next question.

The complete experience must include:

1. Today's Situation
2. Language & Comfort
3. Music Discovery
4. Cinema & Activities
5. Anything Else on Your Mind?

Include every question and option specified below. Do not omit questions or remove answer choices merely to simplify the UI.

**The interface should feel lightweight even though it collects the complete information. Show only the current question and relevant conversation history instead of displaying every question and answer option simultaneously.**

---

## 2. Overall chat interface

### Header

Display:

**STEP 3 OF 6 · MINDMATE CONVERSATION**

# Let's understand what would help you today

"Let's take this one step at a time. Choose the answers that feel right for you, and you can add anything else at the end."

Show a small status indicator:

`Phase 03 · Ready to personalize`

Before the final submission, show `No Gemini API calls yet` or an equivalent subtle indicator that makes it clear the conversation is running locally.

Avoid placing large explanatory paragraphs above the conversation.

### Progress indicator

Retain the main six-phase application progress bar:

- Your Mood
- Your Profile
- MindMate Conversation — active
- Discovering
- Your Results
- Feedback

Inside Step 3, display a separate compact progress indicator:

- A. Today's Situation
- B. Language & Comfort
- C. Music Discovery
- D. Cinema & Activities
- Final Question

Highlight the current section in teal. Mark completed sections with a checkmark.

On narrow screens, make the section indicator horizontally scrollable or use a compact label such as `Section A of 4`.

Do not show all four sections as separate full-page questionnaires.

### Chat layout

Use a central chat panel with a comfortable maximum width, subtle borders, rounded corners, and a soft white background against the existing light MindMate background.

**Bot messages:**
- Align on the left.
- Use a soft mint background.
- Include a small MindMate assistant icon.
- Use friendly, conversational language.

**User messages:**
- Align on the right.
- Use a deep teal or soft teal background with accessible text contrast.
- Display the selected answer as a compact message bubble.
- Show multiple selections in a readable way.

**Answer choices:**
- Use compact rounded chips or small selectable option cards.
- Use a three-column grid on desktop when appropriate.
- Use two columns on small tablets and one or two columns on mobile.
- Clearly distinguish selected and unselected choices.
- Include checkmarks or radio indicators where appropriate.
- Provide hover, focus, selected, and disabled states.

Keep the design visually consistent with MindMate's existing branding.

Do not use photographs, movie posters, song artwork, or unnecessary decorative images in this questionnaire.

---

## 3. Required interaction model

The interface must behave like a real guided chatbot rather than a form that contains every question.

### Single-choice questions

1. The bot introduces the question.
2. The answer options appear immediately below the bot message.
3. The user selects an option.
4. The selected option receives a clear visual highlight.
5. The user confirms the answer through `Continue`, or through an automatic progression only when it is clear and accessible.
6. The answer appears as a user chat bubble.
7. The bot acknowledges the answer briefly and introduces the next question.

Do not require a separate confirmation step for every trivial interaction if doing so makes the conversation unnecessarily slow. Use a consistent progression model.

### Multiple-choice questions

For language selections, content exclusions, activities, and practical limitations:

- Users can select multiple options.
- Show a checkmark for each selected option.
- Keep the choices visible while selections are being made.
- Provide a clear `Confirm selection` or `Continue` action.
- Display the final selected set in the user chat bubble.
- Allow users to change selections before confirmation.

For the content-exclusion question, selecting `No specific restrictions` should clear conflicting exclusions or prevent conflicting selections.

Apply an equivalent sensible rule to `No additional limitations`.

### Text answers

When an answer uses `Other`, reveal a small text field.

For optional notes, show a compact expandable textarea instead of a large form.

Allow empty optional notes and empty final free-text input.

### Conversation navigation

Provide:

- Back
- Continue
- Edit previous answers
- Restart conversation
- Review answers

Back navigation must preserve existing answers.

Editing a previous answer should update the stored conversation state and the displayed answer without creating a new Gemini request.

Restarting should ask for confirmation before clearing the current questionnaire.

Do not allow users to proceed from the final screen while required answers are invalid.

### State management

Use the application's existing state management conventions.

Store answers in a structured session object. Track:

- Current section
- Current question
- Completed questions
- Selected options
- Optional free-text answers
- Completion status
- Final submission status

All questionnaire interactions must run in the frontend or existing local state until the final submission.

**Do not call Gemini when a user selects an option, moves to another question, navigates backward, edits an answer, or changes sections.**

---

# 4. SECTION A — TODAY'S SITUATION

Section title: **Today's Situation**

Bot introduction:

"Let's start with your day. You can share as much or as little as you feel comfortable with."

Description: Understand today's context, needs, available time, and desired type of support without requesting unnecessary personal disclosure.

## Question A1 — Your day

**Bot message:**

"What best describes the kind of day you've had?"

Selection type: Single choice.

Options:

1. Busy or demanding
2. Work or studies
3. Physically tiring
4. Social and active
5. Quiet and peaceful
6. Emotionally difficult
7. A celebration or positive event
8. Something else
9. Prefer not to say

If `Something else` is selected, reveal an optional text field:

"Anything you'd like to add?"

If `Prefer not to say` is selected, accept the answer without further probing.

## Question A2 — What would help?

**Bot message:**

"What would feel most helpful right now?"

Selection type: Single choice.

Options:

1. Something soothing
2. A little positive energy
3. A comforting experience
4. A distraction or laugh
5. An engaging challenge
6. A quiet moment alone
7. Help getting started with a task

Use the existing primary intention selected in Step 1 to prefill or suggest a matching answer when appropriate.

Do not overwrite Step 1's recorded intention without the user's explicit confirmation.

## Question A3 — Available time

**Bot message:**

"How much time do you have for yourself right now?"

Selection type: Single choice.

Options:

1. 2–5 minutes
2. 5–10 minutes
3. 10–20 minutes
4. 20–45 minutes
5. More than 45 minutes

Use this answer later to make habits, exercises, and recommendations practical.

## Question A4 — Support style

**Bot message:**

"How would you like me to help today?"

Selection type: Single choice.

Options:

1. Keep it simple
2. Suggest one small practical action
3. Give me a structured plan
4. Offer a few alternatives
5. Let me explore independently

After A4, show a brief transition:

"Thanks for sharing. Now let's make sure the recommendations fit your preferences."

Move to Section B.

---

# 5. SECTION B — LANGUAGE & COMFORT

Section title: **Language & Comfort**

Bot introduction:

"I want the suggestions to feel familiar, comfortable, and easy for you to enjoy."

Reuse the existing profile preferences by default. Allow session-specific changes without silently changing the permanent profile.

## Question B1 — Response language

**Bot message:**

"Which language would you prefer for today's recommendations and explanations?"

Selection type: Single choice.

Options:

1. Telugu
2. English
3. Hindi
4. Tamil
5. Kannada
6. Malayalam
7. Bengali
8. Marathi
9. Other

If `Other` is selected, display a short language field.

If a saved preference exists, show it as the preselected option. Make clear that this choice applies to the current session unless the user explicitly updates the permanent profile.

## Question B2 — Music languages

**Bot message:**

"Which languages would you enjoy hearing in today's music?"

Selection type: Multiple choice.

Options:

1. English
2. Telugu
3. Hindi
4. Tamil
5. Kannada
6. Malayalam
7. Multiple languages
8. Other

Allow `Other` to open an optional text field.

`Multiple languages` should be treated as a preference for variety rather than as a literal language.

If the user selects `Multiple languages`, allow several individual languages to be selected.

Reuse the existing saved music-language preferences as the initial selection when applicable.

## Question B3 — Movie languages

**Bot message:**

"Which languages are you comfortable watching movies in today?"

Selection type: Multiple choice.

Options:

1. English
2. Telugu
3. Hindi
4. Tamil
5. Kannada
6. Malayalam
7. Bengali
8. Marathi
9. Other

Allow an optional text field for additional languages.

Do not assume the user's preferred languages based on their location, identity, or browser settings.

## Question B4 — Content to avoid

**Bot message:**

"Is there anything you'd prefer me to avoid in today's recommendations?"

Selection type: Multiple choice.

Options:

1. Intense violence
2. Scary or disturbing material
3. Heavy or tragic themes
4. Explicit content
5. Loud or intense music
6. No specific restrictions
7. Other

When `Other` is selected, display:

"Anything else you'd prefer to avoid? (Optional)"

Also show a compact expandable field:

"Optional note about today's content preferences"

Placeholder:

"e.g., I'd prefer fewer sudden loud noises or heavy emotional themes."

Treat exclusions as important constraints throughout the recommendation process. Do not allow entertainment or music suggestions that deliberately violate the user's stated restrictions.

After Section B, show:

"Great. Let's find the kind of music that suits your mood."

Move to Section C.

---

# 6. SECTION C — MUSIC DISCOVERY

Section title: **Music Discovery**

Bot introduction:

"Let's find a sound that feels right for you today, whether that's something soothing or something new."

## Question C1 — Preferred sound

**Bot message:**

"What kind of sound would fit you right now?"

Selection type: Single choice.

Options:

1. Gentle and calming
2. Warm and comforting
3. Light and cheerful
4. Motivating and rhythmic
5. Deeply reflective
6. Instrumental and focused
7. Energetic and expressive
8. Surprise me

Use the selected option as temporary session context. Do not permanently change the user's genre preferences.

## Question C2 — Listening style

**Bot message:**

"What would you prefer to hear?"

Selection type: Single choice.

Options:

1. Mainly vocals
2. Instrumental
3. A mixture of both
4. No preference

## Question C3 — Familiarity versus discovery

**Bot message:**

"Would you rather revisit familiar favourites or discover something new?"

Selection type: Single choice.

Options:

1. Familiar and comforting
2. New discoveries
3. A balance of both

Use actual saved likes and preferences when available. If there is no listening history, do not pretend that a recommendation is a known favourite.

## Question C4 — Musical intensity

**Bot message:**

"How energetic should the music feel today?"

Selection type: Single choice.

Options:

1. Very gentle
2. Soft and steady
3. Balanced
4. Upbeat
5. Powerful and energetic

Respect the user's existing mood, energy, stress, and selected content exclusions when applying this preference.

## Question C5 — Optional music details

**Bot message:**

"Any artists, songs, instruments, or sounds you'd particularly like—or prefer to avoid?"

Selection type: Optional free text.

Placeholder:

"e.g., Acoustic guitar, gentle piano, favourite artists, or no heavy drums."

This question can be skipped.

After C5, show:

"Now let's find a movie atmosphere and a small activity that fit your day."

Move to Section D.

---

# 7. SECTION D — CINEMA, HABITS & RESTORATIVE ACTIVITIES

Section title: **Cinema & Activities**

Bot introduction:

"Let's choose a viewing experience and an activity that fit the time and energy you have."

## Question D1 — Movie atmosphere

**Bot message:**

"What kind of movie experience would you enjoy today?"

Selection type: Single choice.

Options:

1. Heartwarming
2. Whimsical comedy
3. Gentle animation
4. Thoughtful drama
5. Nature or travel documentary
6. Inspiring journey
7. Light adventure
8. Mystery or suspense
9. Something familiar
10. Surprise me

If the user's selected mood or content exclusions conflict with an option, respect their explicit restrictions and use contextual information carefully. Do not silently remove their choices.

## Question D2 — Movie duration

**Bot message:**

"How long would you like your movie or viewing experience to be?"

Selection type: Single choice.

Options:

1. A short film or episode
2. Under 90 minutes
3. Around 90–120 minutes
4. Longer than 120 minutes
5. No preference

Use the existing long-term movie-duration preference as a suggested default where appropriate, but keep today's choice temporary.

## Question D3 — Viewing environment

**Bot message:**

"How will you most likely be watching?"

Selection type: Single choice.

Options:

1. Watching alone
2. Watching with family
3. Watching with friends
4. No preference

Use this context to avoid unsuitable movie or activity suggestions.

## Question D4 — Available activities

**Bot message:**

"Which small activities would you be open to today?"

Selection type: Multiple choice.

Options:

1. Gentle stretching
2. A short walk
3. A simple breathing exercise
4. Quiet reflection
5. Journaling
6. Listening to calming music
7. Drinking water and taking a screen break
8. Tidying a small space
9. A short creative activity
10. Resting without any task

Allow users to select multiple options.

Provide a clearly visible `Confirm selection` button.

Do not force the user to choose an activity if they select `Resting without any task`. Treat rest as a valid preference.

## Question D5 — Desired effort

**Bot message:**

"How much effort would you like today's activity to require?"

Selection type: Single choice.

Options:

1. Almost none
2. Very gentle
3. Moderate
4. Something active

Use the user's current energy, stress, available time, and stated choice to determine appropriate suggestions.

Never automatically prescribe an energetic activity because of a previously saved fitness or activity preference.

## Question D6 — Practical limitations

**Bot message:**

"Anything I should consider to make the activity easier for you?"

Selection type: Multiple choice.

Options:

1. Indoor only
2. Outdoor is fine
3. Limited space
4. No equipment
5. Limited time
6. Prefer seated activities
7. No additional limitations
8. Other

If `Other` is selected, show an optional short text field.

`No additional limitations` should clear conflicting limitations or make them mutually exclusive.

After D6, transition to the final optional question.

---

# 8. FINAL SCREEN — ANYTHING ELSE ON YOUR MIND?

This is a dedicated final chat screen, not an extra large questionnaire form.

Heading:

**Anything else on your mind?**

Bot message:

"We've covered the basics. Is there anything else you'd like me to consider, or a question you'd like help with today?"

Description:

"This is completely optional. Your answer will be included in the same request as your questionnaire responses."

Provide a multiline text box.

Placeholder:

"e.g., I've been studying all day and feel mentally tired. Could you suggest something comforting to watch and a simple way to reset?"

Show a live character counter:

`0 / 600`

Maximum length: 600 characters.

Allow the user to leave the field empty.

Add a subtle privacy notice:

"Your answers are prepared for one consolidated Gemini request. Temporary mood context and free-text reflections are not saved permanently by this flow unless you explicitly choose an available save option."

Do not claim information is securely processed or deleted unless the existing application actually implements those guarantees.

Provide three actions:

- `Back to Questions`
- `Review My Answers`
- `Generate My MindMate Plan`

Use the last action as the only point that submits the completed recommendation request.

---

# 9. SESSION SUMMARY BEFORE SUBMISSION

After the user chooses `Review My Answers`, display a compact conversational summary with editable sections.

Include:

**Today's mood**
- Primary and secondary emotion, if supplied in Step 1.
- Energy rating.
- Stress rating.
- Intended outcome.

**Today's context**
- Day description.
- Desired support style.
- Available time.

**Language and comfort**
- Response language.
- Selected song languages.
- Selected movie languages.
- Content exclusions.

**Music**
- Preferred sound.
- Listening style.
- Familiarity versus discovery.
- Desired intensity.
- Optional details.

**Cinema and activities**
- Movie atmosphere.
- Movie duration.
- Viewing environment.
- Activity preferences.
- Effort level.
- Practical limitations.

**Final question**
- Optional question or reflection, if supplied.

Do not display empty values as if the user answered them. Show `Not specified` where useful.

Each section should have an `Edit` action that takes the user back to the appropriate conversation question and then returns them to the review summary.

No Gemini call should happen during review or editing.

At the bottom, show:

`Everything is ready for your personalized plan.`

Button: `Generate My MindMate Plan`

---

# 10. SINGLE CONSOLIDATED GEMINI REQUEST

This is a mandatory architectural requirement.

All the questions must be handled locally by frontend state and existing application logic.

**Do not call Gemini separately for each question, section, language selection, music preference, movie preference, or optional question.**

When the user clicks `Generate My MindMate Plan`:

1. Validate the collected answers.
2. Combine the existing Step 1 mood context.
3. Combine the existing Step 2 long-term profile preferences.
4. Include the answers from Sections A, B, C, and D.
5. Include the optional final question if provided.
6. Include only relevant, permitted feedback history that actually exists.
7. Normalize and validate the complete payload.
8. Send exactly one consolidated Gemini request through the existing secure backend integration.
9. Transition to Step 4 — Discovering while the request is pending.
10. Render the generated personalized response in Step 5 — Your Results.

The same Gemini response must contain:

- Personalized session insight.
- Brief interpretation of the user's stated mood and intention.
- One recommended habit with instructions, duration, and effort.
- One suitable restorative exercise with instructions, duration, and an alternative.
- Up to five music recommendations with reasons.
- Up to five movie recommendations with reasons.
- A concise answer to the optional user question, when one was submitted.
- A practical next-step suggestion.
- Relevant uncertainties or unavailable information.

Use the existing response schema where possible. Validate the result on the server before rendering it. Do not render model-generated HTML as executable content.

Keep the Gemini API key on the server. Never expose it in client-side code.

Disable duplicate final submissions while the request is running. If the request fails, preserve the user's answers and allow an explicit retry.

Do not automatically trigger multiple Gemini calls in response to failures.

---

# 11. DISCOVERING PHASE HANDOFF

After final submission, move to the existing Step 4 — Discovering experience.

Use the existing MindMate branding and subtle animations.

Suitable processing messages include:

- Organizing your responses
- Connecting today's mood with your preferences
- Considering your music and viewing choices
- Preparing your personalized wellness suggestions
- Assembling your MindMate plan

These messages represent the presentation of one pending request; do not claim that separate models or background jobs are running.

Do not show fabricated percentages or fake completion statistics.

When the request succeeds, display the existing Step 5 — Your Results page.

If it fails, show a clear error and preserve the full conversation state.

---

# 12. TECHNICAL IMPLEMENTATION RULES

Inspect the existing codebase before making changes.

- Reuse the current framework and routing system.
- Reuse existing UI components and styling conventions.
- Implement the chat using the project's existing state management approach.
- Do not add an unnecessary chatbot SDK or animation framework.
- Do not use an external conversational AI API.
- Do not use Gemini during question selection or navigation.
- Do not remove unrelated working pages.
- Do not hard-code a sample user name.
- Keep session-specific answers separate from the persistent user profile.
- Use accessible keyboard interactions, labelled controls, screen-reader announcements, visible focus states, and reduced-motion support.
- Preserve answers when navigating backward or editing previous responses.
- Do not lose answers when the Gemini request fails.

Use a consistent data structure for each question, including its identifier, section, prompt, options, selection type, optional-text behaviour, and validation rules. Avoid implementing each question as a separate duplicated page component.

If saved preferences are available, prefill suitable answers without changing the saved profile automatically.

---

# 13. RESPONSIVE UI AND ANIMATION

### Desktop
- Keep MindMate's existing sidebar and header.
- Place the chat inside a spacious central panel.
- Keep the conversation vertically scrollable.
- Use compact answer-option grids when appropriate.
- Keep the internal section progress visible.

### Tablet
- Reduce the chat panel width and use fluid option grids.
- Ensure questions and selections never overlap.

### Mobile
- Collapse the sidebar according to the existing navigation design.
- Use a full-width conversation panel.
- Use one or two columns for selectable options depending on readability.
- Keep the current question and actions easy to reach.
- Ensure the text input and confirmation buttons remain usable when the keyboard opens.

### Animation
Use subtle transitions for:
- New bot messages.
- User answer bubbles.
- Option selection.
- Section transitions.
- Progress changes.
- Loading states.

Respect `prefers-reduced-motion`.

Do not animate entire question forms unnecessarily or delay answer selection.

---

# 14. FINAL ACCEPTANCE TESTS

Before finishing, verify that:

1. Step 3 looks and behaves like a chatbot rather than a long questionnaire.
2. All questions A1–A4, B1–B4, C1–C5, and D1–D6 are included.
3. The optional final question supports up to 600 characters.
4. All provided answer options are included.
5. Single-choice and multiple-choice questions behave correctly.
6. `Other` fields appear only when relevant.
7. Mutually exclusive options such as `No specific restrictions` work correctly.
8. Back navigation and answer editing preserve all collected answers.
9. Question selection and navigation trigger zero Gemini calls.
10. Final submission sends one consolidated request for the recommendation session.
11. Duplicate submissions are prevented.
12. Failed requests preserve the questionnaire answers.
13. Step 4 and Step 5 continue working with the existing application.
14. Step 6 feedback remains accessible.
15. The UI is responsive, accessible, and consistent with MindMate branding.
16. The project builds successfully using the available build and type-check commands.

Do not report a test as passed unless it was actually performed.

At the end, provide a brief implementation report identifying the files changed, checks performed, and any remaining configuration requirements.

## Final goal

Transform the entire Step 3 experience into a natural, guided MindMate conversation. The bot asks each question one at a time, users answer through polished selectable options, the conversation gradually collects all required information, and one final submission sends all answers to Gemini in a single consolidated request.

**Implement the actual changes in the existing project. Do not stop at a screenshot, mockup, or implementation plan.**