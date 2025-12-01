# Product Requirements

## Overview

A mobile-friendly web dashboard for doctors to manage patient queries and check-ins under the **Healthy Dialogue** brand. The interface draws inspiration from WhatsApp's familiar chat-based UX patterns, providing doctors with an intuitive way to communicate with patients, view patient health data, and track therapy progress.

---

## Branding

### Visual Identity

| Element | Value |
|---------|-------|
| **App Name** | Healthy Dialogue |
| **Tagline** | Patient Inbox |
| **Logo** | HD logo (squircle shape) |
| **Primary Color** | Cyan (#5ce1e6) |
| **Highlight Color** | Deep Navy (#180f63) |

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Primary (Cyan) | Icons, accents, active states | #5ce1e6 |
| Primary Dark | Hover states | #4bc8cd |
| Primary Light | Backgrounds, gradients | #e6fafb |
| Highlight (Navy) | Headers, badges, buttons | #180f63 |
| Highlight Light | Hover states | #2a1f8a |
| Doctor Bubble | Light cyan tint | #e6fafb |
| Patient Bubble | White | #FFFFFF |
| Unread Badge | Navy (list), Red (nav) | #180f63 / #EF4444 |
| Chat Background | Light blue-gray | #f0f4f8 |

---

## Core Features

### 1. Bottom Navigation Menu

WhatsApp-style bottom navigation with two primary sections:

| Tab | Description | Badge Indicator |
|-----|-------------|-----------------|
| **Conversations** | All patient queries and check-ins | Total unread count (red) |
| **Clinic** | Clinic dashboard with stats and schedule | None |

The active tab is highlighted in navy (#180f63) with the label emphasized.

---

### 2. Header with Search

The header contains:
- **App Title**: "Healthy Dialogue" in cyan
- **Subtitle**: "Patient Inbox" in white
- **Search Bar**: Full-width search input with cyan icon
  - Placeholder: "Search patients or messages..."
  - Translucent background that fits the navy header
- **Menu Button**: Three-dot menu for additional options

---

### 3. Conversation List View

Each conversation item in the list displays:

#### Patient Information Card
- **Squircle Avatar**: Rounded square (border-radius: 16px) with patient initials
  - Cyan gradient background (#e6fafb to #d4f5f7)
  - Navy text for initials
- **Patient Name**: Full name of the patient
- **Therapy Support Program**: With heart icon prefix
- **Last Message Preview**: Truncated preview of the most recent message
- **Type Badge**: "Query" (indigo background) or "Check-In" (cyan background)
- **Timestamp**: 
  - "HH:MM AM/PM" format for messages received today
  - "Yesterday" for messages from the previous day
  - "DD/MM/YYYY" for older messages
- **Unread Badge**: Navy circular indicator showing count of unread messages
- **Unread Indicator**: 3px navy left border on unread conversations

#### Sorting & Display Rules
- Conversations sorted by `lastMessageAt` in descending order (newest first)
- Conversations with status !== "closed" show unread counts
- Unread conversations appear with bold text and navy accents
- Swipe actions for quick archive/mark-as-read (optional enhancement)

#### Floating Action Button (FAB)
- Position: Bottom right, above bottom navigation
- Content: HD logo image (not a plus icon)
- Size: 60×60px
- Action: Opens new conversation screen

---

### 4. Conversation Detail View

When a doctor opens a patient's conversation, they see:

#### Header
- Back button (left arrow)
- Patient squircle avatar (small, light cyan background)
- Patient name and program
- Call and menu buttons

#### Tab Navigation
Two tabs below the header:

| Tab | Description | Default |
|-----|-------------|---------|
| **Conversation** | Message thread and reply interface | Yes (default) |
| **Patient Details** | Patient health data and records | No |

Active tab has a navy underline indicator.

---

### 5. Conversation Tab (Messages)

#### Message Thread
- Messages displayed in chronological order (oldest to newest)
- Date divider ("Today") with navy background
- Clear visual distinction between:
  - **Doctor messages**: Right-aligned, cyan bubble (#e6fafb) with cyan border
  - **Patient messages**: Left-aligned, white bubble

#### Supported Message Types

| Content Type | Display | Interaction |
|--------------|---------|-------------|
| **Text** | Rendered text in message bubble | Copy, select |
| **Image** | Thumbnail placeholder with image icon | Full-screen view, zoom |
| **Video** | Thumbnail with play icon | In-app video player |
| **Audio** | Waveform visualization with play button | Navy play button, duration display |

#### Message Metadata
- Timestamp below each message
- Read receipts for doctor messages (cyan double-check icons)
- Sender indicator (position-based)

#### Reply Interface
- Text input field at bottom (rounded, gray background)
- Attachment button (paperclip icon)
- Camera button
- Send button (navy background, cyan icon)

---

### 6. Patient Details Tab

Comprehensive patient information view with **doctor-patient relationship privacy constraints**.

#### Patient Profile Card
- Large squircle avatar (80×80px) centered
- Patient name (20px, bold)
- Current program name (colored in highlight)

#### Latest Vitals Section
- Blood Pressure
- Heart Rate
- Weight
- Blood Sugar (Fasting)
- "Updated X days ago" indicator

#### Therapy Programs Section
**Title**: "Your Programs with Patient"

**Visible Content**:
- Only programs where the current doctor is the assigned provider
- Each program shows:
  - Program icon in squircle
  - Program name
  - Start date and status
  - "Active" status badge (green)

**Hidden Content Indicator**:
- Dashed border container with lock icon
- Shows count: "X other active programs" and "Y completed programs"
- "Requires Approval" badge in amber/yellow

#### Prescriptions Section
**Title**: "Your Prescriptions"

**Visible Content**:
- Only prescription documents written by the current doctor
- Each prescription shows:
  - Document icon
  - Prescription title/name
  - Doctor name and date
  - View document button (eye icon)

**Hidden Content Indicator**:
- Dashed border container with lock icon
- Shows count: "X prescriptions from other doctors"
- "Requires Approval" badge in amber/yellow

#### Shared Lab Reports Section
**Title**: "Shared Lab Reports"

- Lab reports the patient has specifically shared for this program
- Each report shows:
  - Document icon (amber)
  - Report name
  - "Shared for [Program Name]" context
  - Date
  - View document button

#### Request Full Medical History Button
- Full-width button at bottom
- Navy background with cyan text
- Download icon
- Text: "Request Full Medical History"
- Triggers approval request to patient

---

### 7. Check-In Detail View

Check-ins are patient-submitted health updates with a **single doctor response** (not threaded):

#### Check-In Data Display
- Patient header with squircle avatar
- Submitted text responses in card format
- Attached media (images, audio recordings, videos)
- Timestamp: "Submitted today at HH:MM AM"

#### Doctor Response (Single Response Only)
- Textarea for response input
- Pre-filled with draft text (if any)
- "Send Response & Close" button (navy)
- Once responded, check-in moves to "closed" status

---

### 8. Clinic Dashboard

Accessible via bottom navigation "Clinic" tab.

#### Header
- Same branding as conversations
- Subtitle: "Clinic Dashboard"

#### Statistics Grid (2×2)
| Stat | Description |
|------|-------------|
| Active Patients | Total enrolled patients |
| Pending Queries | Open queries count |
| Check-ins Today | Today's submissions |
| Appointments | Scheduled appointments |

#### Today's Schedule Section
- List of upcoming appointments
- Each shows: Patient name, time, appointment type
- Squircle icon for each patient

#### Weekly Summary Section
- Queries Resolved count
- Check-ins Reviewed count
- Average Response Time

---

### 9. New Conversation Screen

Accessed via FAB button on conversation list.

#### Header
- Back button
- "New Conversation" title
- "Select a patient" subtitle

#### Search Bar
- Separate search for patient list
- Gray background with search icon

#### Patient List
- Scrollable list of all patients
- Each item shows:
  - Squircle avatar with initials
  - Patient name (bold)
  - Therapy program
- Tap to open new conversation with that patient
- Hover state: Light cyan background

---

## Avatar Design

### Squircle Shape
All avatars use a "squircle" (rounded square) shape instead of circles:

| Size | Dimensions | Border Radius | Use Case |
|------|------------|---------------|----------|
| Small (sm) | 44×44px | 14px | Chat header |
| Medium (md) | 48×48px | 14px | New conversation list |
| Large (lg) | 52×52px | 16px | Conversation list |
| Extra Large (xl) | 80×80px | 24px | Patient details profile |

### Styling
- Background: Cyan gradient (#e6fafb to #d4f5f7)
- Text: Navy (#180f63), bold
- Content: 2-letter initials from patient name

---

## Privacy & Data Access Model

### Doctor-Patient Relationship Constraints

Doctors can only view patient data within the context of their direct relationship:

| Data Type | Visibility Rule |
|-----------|-----------------|
| **Therapy Programs** | Only programs where doctor is assigned provider |
| **Prescriptions** | Only prescriptions written by the doctor |
| **Lab Reports** | Only reports patient has shared for the program |
| **Vitals** | Visible if patient is enrolled in doctor's program |
| **Other Data** | Visible only after patient approves full history request |

### Access Indicators
- **Visible data**: Normal display with view buttons
- **Hidden data**: Count shown with lock icon, dashed border, "Requires Approval" badge
- **Request mechanism**: "Request Full Medical History" button sends approval request to patient

---

## User Flows

### Flow 1: Viewing All Conversations
```
Doctor opens app via WhatsApp link
  → Token validated, auto-authenticated
  → Loads Conversations tab (bottom nav)
  → Sees combined list of queries and check-ins
  → Search bar available for filtering
  → Unread items highlighted with navy border
  → Taps conversation to open
```

### Flow 2: Switching to Clinic Dashboard
```
Doctor taps "Clinic" in bottom navigation
  → Dashboard loads with statistics
  → Views today's schedule
  → Reviews weekly summary
  → Taps back to Conversations when done
```

### Flow 3: Viewing Patient Details
```
Doctor taps query conversation
  → Conversation opens in Conversation tab
  → Doctor taps "Patient Details" tab
  → Views vitals, programs, prescriptions, lab reports
  → Sees counts of restricted data
  → Can request full medical history if needed
  → Taps "Conversation" tab to return to messages
```

### Flow 4: Responding to a Query
```
Doctor taps query conversation
  → Message thread loads in Conversation tab
  → Doctor scrolls through history
  → Types response in input field
  → Optionally attaches media
  → Taps send
  → Message appears in thread
  → unreadCount resets for that conversation
```

### Flow 5: Reviewing a Check-In
```
Doctor taps check-in item
  → Check-in details load (patient submission + any media)
  → Doctor reviews submitted data
  → Types single text response
  → Taps "Send Response & Close"
  → Check-in automatically marked as "closed"
  → Returns to list view
```

### Flow 6: Initiating a New Conversation
```
Doctor taps HD logo FAB button
  → Patient search/selection screen opens
  → Doctor searches or scrolls to find patient
  → Taps patient to select
  → New query conversation created
  → Opens in Conversation tab
  → Doctor types initial message
  → Message sent to patient
```

### Flow 7: Requesting Full Medical History
```
Doctor opens patient conversation
  → Taps "Patient Details" tab
  → Scrolls to bottom
  → Taps "Request Full Medical History"
  → Confirmation dialog appears
  → Request sent to patient
  → Doctor sees "Request Pending" status
  → When patient approves, full data becomes visible
```

---

## UI/UX Specifications

### Typography
- **Font Family**: Plus Jakarta Sans (Google Fonts)
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Headers**: 22px, bold, -0.3px letter-spacing
- **Patient Name**: 15px, semibold (unread) / medium (read)
- **Message Text**: 14px, line-height 1.5
- **Timestamps**: 11-12px
- **Section Titles**: 14px, uppercase, 0.5px letter-spacing

### Spacing & Borders
- Border radius: 8px (sm), 12px (md), 16px (lg), 9999px (full/pill)
- Card padding: 14-20px
- Card margin: 12px
- Message bubble padding: 10px horizontal, 14px vertical

### Shadows
- Small: 0 1px 2px rgba(0,0,0,0.05)
- Medium: 0 4px 12px rgba(0,0,0,0.1)
- Large: 0 8px 24px rgba(0,0,0,0.15)

### Layout Breakpoints
- **Mobile**: 320px - 480px (primary target)
- **Phone Frame**: 375×812px (iPhone X/11 Pro size for prototype)
- **Tablet**: 481px - 768px
- **Desktop**: 769px+ (optional support)

### Interactions
- Tab switching: Instant, updates active states
- Card hover: Transform translateY(-1px), shadow increase
- Button hover: Background color darken, scale(1.05) on FAB
- Tab underline: 3px height, rounded top corners

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Response Time | Average time to first doctor response < 4 hours |
| Read Rate | % of check-ins reviewed within 24 hours > 95% |
| User Adoption | Daily active doctors / Total doctors > 80% |
| Performance | Page load time < 2 seconds on 3G |
| Patient Details Usage | % of conversations where details tab is viewed > 50% |
| History Requests | % of history requests approved by patients > 70% |

---

## Confirmed Design Decisions

| Question | Decision |
|----------|----------|
| **Navigation structure** | Bottom nav (Conversations + Clinic) instead of top tabs |
| **Search placement** | Integrated in header, always visible |
| **Avatar shape** | Squircle (rounded square) instead of circle |
| **Patient data access** | Doctor-patient pair scoped; requires approval for full history |
| **Prescription display** | Documents with doctor name, not medication list |
| **Check-in threading** | Single response only - no threaded conversations |
| **Conversation status** | Binary: "open" or "closed" only |
| **Doctor-initiated conversations** | Yes - via FAB button with HD logo |
| **Compliance requirements** | Indian users initially; HIPAA compliance deferred |
| **Media URL security** | Already implemented with expiring URLs |
| **Conversation handoff** | Not in scope for this phase |
| **Notification system** | WhatsApp notifications with one-time auth token link |

---

## Future Enhancements (Phase 2)

1. **Search Functionality**: Full-text search using PostgreSQL (UI ready)
2. **Quick Replies**: Templated responses for common queries
3. **Appointment Integration**: Schedule from clinic dashboard
4. **Analytics Dashboard**: Enhanced metrics in clinic view
5. **Multi-language Support**: i18n for Hindi and regional languages
6. **Offline Mode**: Service worker caching with Workbox
7. **Voice-to-Text**: Transcription for audio messages (Whisper API)
8. **Real-time Updates**: WebSocket via Cloudflare Durable Objects
9. **Push Notifications**: Web Push API for in-browser alerts
10. **Patient Approval Flow**: In-app approval for medical history requests
