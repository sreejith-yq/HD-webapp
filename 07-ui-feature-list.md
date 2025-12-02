# UI Feature List

## Quick Reference

This document provides a quick reference to all UI components and features in the Healthy Dialogue doctor dashboard.

---

## Screens Overview

| # | Screen | Access | Purpose |
|---|--------|--------|---------|
| 1 | Conversation List | Default/Home | View all patient conversations |
| 2 | Clinic Dashboard | Bottom nav | View stats and schedule |
| 3 | Chat Conversation | Tap conversation | Message thread with patient |
| 4 | Patient Details | Tab in chat | View patient health data |
| 5 | Check-In Detail | Tap check-in | Review and respond to check-in |
| 6 | New Conversation | Tap FAB | Select patient for new chat |

---

## Screen 1: Conversation List

### Header
| Component | Description |
|-----------|-------------|
| App Title | "Healthy Dialogue" in cyan (#5ce1e6) |
| Subtitle | "Patient Inbox" in white |
| Search Bar | Full-width, translucent, cyan icon |
| Menu Button | Three-dot icon, cyan on translucent |

### Conversation Cards
| Component | Description |
|-----------|-------------|
| Avatar | Squircle (52×52px), cyan gradient, navy initials |
| Patient Name | 15px, bold if unread |
| Program | With heart icon, navy color |
| Type Badge | "Query" (indigo) or "Check-In" (cyan) |
| Preview | Truncated last message |
| Timestamp | Right-aligned, navy if unread |
| Unread Count | Navy pill badge |
| Unread Border | 3px navy left border |

### Floating Action Button
| Property | Value |
|----------|-------|
| Position | Bottom right, 20px from edges |
| Size | 60×60px |
| Content | HD logo image |
| Shape | Circular |
| Action | Opens New Conversation screen |

### Bottom Navigation
| Tab | Icon | Badge |
|-----|------|-------|
| Conversations | Chat bubble | Red count badge |
| Clinic | Building | None |

---

## Screen 2: Clinic Dashboard

### Header
| Component | Description |
|-----------|-------------|
| App Title | "Healthy Dialogue" in cyan |
| Subtitle | "Clinic Dashboard" in white |

### Statistics Grid (2×2)
| Stat | Example Value |
|------|---------------|
| Active Patients | 24 |
| Pending Queries | 8 |
| Check-ins Today | 12 |
| Appointments | 3 |

### Today's Schedule
| Component | Description |
|-----------|-------------|
| List Items | Patient name + time + type |
| Icon | Person silhouette in squircle |
| Layout | Vertical list |

### Weekly Summary
| Metric | Example Value |
|--------|---------------|
| Queries Resolved | 42 |
| Check-ins Reviewed | 28 |
| Avg. Response Time | 2.4 hrs |

---

## Screen 3: Chat Conversation

### Header
| Component | Description |
|-----------|-------------|
| Back Button | Left arrow, cyan on translucent |
| Avatar | Squircle (44×44px), light cyan |
| Patient Name | White, semibold |
| Program | Cyan, small |
| Call Button | Phone icon (optional) |
| Menu Button | Three-dot icon |

### Tab Bar
| Tab | State | Indicator |
|-----|-------|-----------|
| Conversation | Default active | Navy underline (3px) |
| Patient Details | Inactive | No underline |

### Message Thread (Conversation Tab)
| Message Type | Sender | Style |
|--------------|--------|-------|
| Text | Patient | White bubble, left-aligned |
| Text | Doctor | Cyan bubble (#e6fafb), right-aligned |
| Image | Both | Thumbnail placeholder |
| Video | Both | Video player with controls |
| Audio | Both | Waveform + play button |

### Message Metadata
| Element | Style |
|---------|-------|
| Timestamp | 10px, gray, below bubble |
| Read Receipt | Cyan double-check, doctor only |
| Date Divider | Navy pill badge, centered |

### Input Bar
| Component | Description |
|-----------|-------------|
| Text Input | Rounded, gray background |
| Attach Button | Paperclip icon (Image, Video, Audio, File) |
| Camera Button | Camera icon (Photo/Video toggle) |
| Mic Button | Mic icon (Hold to record, release to send) |
| Send Button | Navy circle, cyan arrow icon (replaces Mic when typing) |

---

## Screen 4: Patient Details (Tab)

### Profile Card
| Component | Description |
|-----------|-------------|
| Avatar | Squircle (80×80px), centered |
| Name | 20px, bold |
| Program | Navy color, medium weight |

### Latest Vitals Section
| Field | Example |
|-------|---------|
| Blood Pressure | 130/85 mmHg |
| Heart Rate | 78 bpm |
| Weight | 82 kg |
| Blood Sugar | 108 mg/dL |
| Updated | "2 days ago" |

### Therapy Programs Section
**Title**: "Your Programs with Patient"

| Component | Description |
|-----------|-------------|
| Visible Programs | Only this doctor's programs |
| Program Card | Icon + name + start date + status |
| Status Badge | Green "Active" pill |
| Hidden Indicator | Dashed border box |
| Hidden Count | "X other active" + "Y completed" |
| Lock Icon | Gray padlock |
| Approval Badge | Amber "Requires Approval" |

### Prescriptions Section
**Title**: "Your Prescriptions"

| Component | Description |
|-----------|-------------|
| Visible Prescriptions | Only this doctor's documents |
| Prescription Card | Document icon + title + doctor + date |
| View Button | Eye icon in cyan squircle |
| Hidden Indicator | Dashed border box |
| Hidden Count | "X prescriptions from other doctors" |
| Approval Badge | Amber "Requires Approval" |

### Shared Lab Reports Section
**Title**: "Shared Lab Reports"

| Component | Description |
|-----------|-------------|
| Report Cards | Reports shared for this program |
| Context | "Shared for [Program Name]" |
| View Button | Eye icon in cyan squircle |

### Action Button
| Property | Value |
|----------|-------|
| Text | "Request Full Medical History" |
| Icon | Download icon |
| Style | Navy background, cyan text |
| Width | Full width |

---

## Screen 5: Check-In Detail

### Header
| Component | Description |
|-----------|-------------|
| Back Button | Left arrow |
| Avatar | Squircle, light cyan |
| Patient Name | White |
| Check-In Type | "Weekly Check-In" |

### Submission Card
| Component | Description |
|-----------|-------------|
| Content | Patient's submitted text |
| Media | Thumbnails of attached files |
| Timestamp | "Submitted today at 9:15 AM" |

### Response Area
| Component | Description |
|-----------|-------------|
| Textarea | Pre-filled or empty |
| Button | "Send Response & Close" |
| Button Style | Navy background, full width |

---

## Screen 6: New Conversation

### Header
| Component | Description |
|-----------|-------------|
| Back Button | Left arrow, cyan |
| Title | "New Conversation" |
| Subtitle | "Select a patient" |

### Search Bar
| Property | Value |
|----------|-------|
| Placeholder | "Search patients..." |
| Background | Gray |
| Icon | Search icon, gray |

### Patient List
| Component | Description |
|-----------|-------------|
| Avatar | Squircle (48×48px) |
| Name | Bold, dark |
| Program | Gray, smaller |
| Hover | Light cyan background |
| Tap Action | Opens new chat |

---

## Component Library

### Squircle Avatar Sizes

| Size | Dimensions | Border Radius | Use Case |
|------|------------|---------------|----------|
| sm | 44×44px | 14px | Chat headers |
| md | 48×48px | 14px | Patient lists |
| lg | 52×52px | 16px | Conversation list |
| xl | 80×80px | 24px | Profile cards |

### Button Styles

| Type | Background | Text | Border |
|------|------------|------|--------|
| Primary | Navy (#180f63) | Cyan (#5ce1e6) | None |
| Secondary | Cyan light (#e6fafb) | Cyan (#5ce1e6) | None |
| Ghost | Transparent | Cyan | 1px cyan |

### Badge Styles

| Type | Background | Text | Use |
|------|------------|------|-----|
| Unread Count | Navy | White | Conversation list |
| Nav Badge | Red (#EF4444) | White | Bottom nav |
| Type (Query) | Indigo (#EEF2FF) | Navy | Message type |
| Type (Check-In) | Cyan (#e6fafb) | Teal | Message type |
| Status (Active) | Green (#DCFCE7) | Dark green | Program status |
| Approval | Amber (#FEF3C7) | Brown | Restricted data |

### Section Card Styles

| Property | Value |
|----------|-------|
| Background | White |
| Border | 1px solid gray-200 |
| Border Radius | 16px |
| Shadow | 0 1px 2px rgba(0,0,0,0.05) |
| Padding | 16px |
| Margin Bottom | 12px |

### Hidden Data Indicator

| Property | Value |
|----------|-------|
| Background | Gray-50 (#F9FAFB) |
| Border | 1px dashed gray-300 |
| Icon | Lock (gray) |
| Text | Gray-500 |
| Badge | Amber "Requires Approval" |

### Camera Modal

| Component | Description |
|-----------|-------------|
| Viewfinder | Full screen video preview |
| Capture Button | White circle (Photo) / Red circle (Video) |
| Mode Toggle | Pill switch (Photo / Video) |
| Close Button | "Cancel" text |
| Video Timer | Red counter (Video mode only) |

---

## Color Tokens

### Primary Colors
```css
--primary: #5ce1e6;        /* Cyan */
--primary-dark: #4bc8cd;   /* Cyan hover */
--primary-light: #e6fafb;  /* Cyan background */
```

### Highlight Colors
```css
--highlight: #180f63;      /* Navy */
--highlight-light: #2a1f8a;/* Navy hover */
```

### Semantic Colors
```css
--success: #22C55E;        /* Green */
--warning: #F59E0B;        /* Amber */
--error: #EF4444;          /* Red */
--info: #3B82F6;           /* Blue */
```

### Neutral Colors
```css
--text-primary: #1F2937;   /* Gray-800 */
--text-secondary: #6B7280; /* Gray-500 */
--text-muted: #9CA3AF;     /* Gray-400 */
--border: #E5E7EB;         /* Gray-200 */
--bg-main: #F3F4F6;        /* Gray-100 */
--bg-white: #FFFFFF;       /* White */
```

---

## Typography

### Font Stack
```css
font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
```

### Font Sizes
| Token | Size | Use |
|-------|------|-----|
| xs | 10-11px | Badges, captions |
| sm | 12-13px | Timestamps, labels |
| base | 14px | Body text, messages |
| md | 15px | Patient names |
| lg | 16-18px | Section titles |
| xl | 20px | Profile names |
| 2xl | 22px | App title |

### Font Weights
| Token | Weight | Use |
|-------|--------|-----|
| normal | 400 | Body text |
| medium | 500 | Subtitles |
| semibold | 600 | Names, labels |
| bold | 700 | Titles, emphasis |

---

## Spacing Scale

| Token | Value | Use |
|-------|-------|-----|
| 1 | 4px | Tight gaps |
| 2 | 8px | Icon gaps |
| 3 | 12px | Card gaps |
| 4 | 16px | Section padding |
| 5 | 20px | Large padding |
| 6 | 24px | Section margins |

---

## Animations

| Interaction | Animation |
|-------------|-----------|
| Card hover | translateY(-1px), shadow increase |
| FAB hover | scale(1.1) |
| Tab switch | Instant, no animation |
| Screen transition | None (instant) |
| Button press | scale(0.98) |

---

## Responsive Behavior

### Mobile (320-480px)
- Single column layout
- Full-width cards
- Bottom navigation visible
- FAB positioned above nav

### Tablet (481-768px)
- Same as mobile
- Larger touch targets
- Optional: Two-column for dashboard stats

### Desktop (769px+)
- Phone frame container (375×812px)
- Centered with gradient background
- Decorative notch element

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Color Contrast | Minimum 4.5:1 for text |
| Touch Targets | Minimum 44×44px |
| Focus States | Visible outline on focus |
| Alt Text | All icons have title attributes |
| Semantic HTML | Proper heading hierarchy |

---

## File References

| File | Type | Purpose |
|------|------|---------|
| healthy-dialogue-prototype.html | HTML | Standalone interactive prototype |
| HealthyDialoguePrototype.jsx | React | React component version |
| HD_logo.png | Image | Brand logo for FAB |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | WhatsApp-style with tabs |
| 2.0 | Updated | Healthy Dialogue branding, search bar, bottom nav |
| 2.1 | Updated | Patient Details tab, squircle avatars |
| 2.2 | Updated | Privacy-scoped data visibility |
