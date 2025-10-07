# End-to-End Manual Testing Scenarios

This document provides comprehensive manual testing scenarios for the Flash Cards application. Testers should execute these scenarios in a real browser environment to verify complete functionality.

## Prerequisites

- Application running at `http://localhost:3000` (or production URL)
- Modern browser (Chrome, Firefox, Safari, Edge - latest versions)
- Mobile device or browser DevTools for responsive testing
- Clear browser localStorage before starting each major test section

## Test Environment Setup

### Before Each Test Session
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear all localStorage data
4. Refresh the page
5. Verify you're on the Splash Page

---

## 1. Splash Page Tests

### 1.1 Visual Verification
**Steps:**
1. Load application
2. Observe splash page

**Expected Results:**
- ✅ Gradient background visible (blue → purple → pink)
- ✅ "Flash Cards" title with sparkles icons
- ✅ "Multiplication Practice" subtitle
- ✅ Two buttons: "Select User" and "Settings"
- ✅ Buttons are large and touch-friendly (minimum 44px height)
- ✅ Fade-in animation plays on page load
- ✅ Text is readable and centered

### 1.2 Navigation
**Steps:**
1. Click "Select User" button
2. Note the page you land on
3. Go back to splash page
4. Click "Settings" button
5. Note the page you land on

**Expected Results:**
- ✅ "Select User" navigates to Users page
- ✅ "Settings" navigates to Settings page
- ✅ No errors in browser console
- ✅ Smooth transitions between pages

### 1.3 Responsive Design
**Steps:**
1. Test on mobile viewport (320px width)
2. Test on tablet viewport (768px width)
3. Test on desktop viewport (1920px width)

**Expected Results:**
- ✅ Layout adapts appropriately at all sizes
- ✅ Buttons remain touch-friendly on mobile
- ✅ Text remains readable at all sizes
- ✅ No horizontal scrolling

---

## 2. Users Page Tests

### 2.1 Empty State
**Steps:**
1. Navigate to Users page with no users created
2. Observe the page content

**Expected Results:**
- ✅ "No users yet" message displayed
- ✅ User icon (👤) visible
- ✅ "Create a user to start practicing!" text
- ✅ "Add Your First User" button visible
- ✅ Back arrow button in header works

### 2.2 Create User - Happy Path
**Steps:**
1. Click "Add New User" button
2. Modal appears with input field
3. Type "Alice Johnson"
4. Click "Add User" button

**Expected Results:**
- ✅ Modal closes
- ✅ User card appears with name "Alice Johnson"
- ✅ User avatar displayed with initial "A"
- ✅ "0 sessions" displayed
- ✅ Three action buttons: Start (green), Reports (blue), Delete (red)

### 2.3 Create User - Validation
**Steps:**
1. Click "Add New User"
2. Leave input empty and click "Add User"
3. Note error message
4. Type "   " (spaces only) and click "Add User"
5. Type valid name "Bob Smith"
6. Click "Add User"
7. Try to create another user named "Bob Smith"
8. Try to create user named "bob smith" (lowercase)
9. Try to create user with 101 characters

**Expected Results:**
- ✅ Empty name shows error: "Please enter a name"
- ✅ Spaces-only name shows error
- ✅ Valid name creates user successfully
- ✅ Duplicate name shows error: "A user with the name 'Bob Smith' already exists"
- ✅ Case-insensitive duplicate check works
- ✅ Name over 100 chars shows error

### 2.4 Create Multiple Users
**Steps:**
1. Create users: "Alice", "Bob", "Charlie", "Diana"
2. Observe user list

**Expected Results:**
- ✅ All 4 users displayed in grid
- ✅ Each has unique colored avatar
- ✅ Names displayed correctly
- ✅ All show "0 sessions" initially
- ✅ Grid responsive on mobile (1 column) and desktop (2 columns)

### 2.5 User Selection and Session Start
**Steps:**
1. Create user "Alice"
2. Click green "Start" button on Alice's card
3. Note the page

**Expected Results:**
- ✅ Navigates to Session page
- ✅ URL contains `/session/[userId]`
- ✅ Session starts with Alice's name in header
- ✅ Timer visible and counting down
- ✅ First problem displayed

### 2.6 View Reports (No Sessions)
**Steps:**
1. Create user "Bob"
2. Click blue Reports button on Bob's card

**Expected Results:**
- ✅ Navigates to Reports page
- ✅ "No sessions yet" message displayed
- ✅ Chart icon (📊) visible
- ✅ Back button works

### 2.7 Delete User
**Steps:**
1. Create user "Charlie"
2. Click red Delete button on Charlie's card
3. Modal appears with warning
4. Click "Cancel"
5. Verify Charlie still exists
6. Click Delete button again
7. Click "Delete User"

**Expected Results:**
- ✅ Confirmation modal shows warning text
- ✅ Warning mentions data deletion
- ✅ Cancel button closes modal without deleting
- ✅ Delete button removes user
- ✅ User card disappears from list
- ✅ No errors in console

### 2.8 Delete User with Sessions
**Steps:**
1. Create user "Diana"
2. Start a session and complete at least 5 problems
3. Return to Users page
4. Delete Diana

**Expected Results:**
- ✅ User deleted successfully
- ✅ All associated session data deleted
- ✅ No orphaned data in localStorage (check DevTools)

---

## 3. Settings Page Tests

### 3.1 Default Settings
**Steps:**
1. Navigate to Settings page
2. Observe default values

**Expected Results:**
- ✅ Numbers 1-12 all selected (green)
- ✅ Cards per session slider at 20
- ✅ Time limit slider at 5 minutes
- ✅ All controls functional

### 3.2 Number Selection
**Steps:**
1. Click "Select None" button
2. All numbers become gray
3. Click numbers 2, 3, 4, 5
4. Click "Select All" button
5. All numbers become green

**Expected Results:**
- ✅ "Select None" deselects all numbers
- ✅ Error message appears: "Please select at least one number"
- ✅ Individual number toggles work
- ✅ Selected numbers are green, unselected are gray
- ✅ "Select All" selects all numbers
- ✅ Error message disappears when ≥1 number selected

### 3.3 Session Settings Adjustment
**Steps:**
1. Move "Cards per Session" slider
2. Observe value updates (10-100 range)
3. Move "Time Limit" slider
4. Observe value updates (1-30 minutes)

**Expected Results:**
- ✅ Slider moves smoothly
- ✅ Value displays in real-time
- ✅ Range constraints enforced
- ✅ Both sliders work independently

### 3.4 Save Settings
**Steps:**
1. Select only numbers 2, 3, 4
2. Set cards per session to 30
3. Set time limit to 10 minutes
4. Click "Save Settings"
5. Navigate away and return

**Expected Results:**
- ✅ Success message appears: "Settings saved successfully!"
- ✅ Settings persist after navigation
- ✅ Settings remain after page refresh
- ✅ Check localStorage contains updated settings

### 3.5 Save with Validation Errors
**Steps:**
1. Click "Select None"
2. Try to click "Save Settings"

**Expected Results:**
- ✅ "Save Settings" button is disabled
- ✅ Error message visible
- ✅ Cannot save invalid settings

### 3.6 Clear All Data
**Steps:**
1. Create 2 users with sessions
2. Go to Settings
3. Click "Clear All Data"
4. Modal appears with severe warning
5. Click "Cancel"
6. Verify data still exists
7. Click "Clear All Data" again
8. Click "Yes, Clear Everything"

**Expected Results:**
- ✅ Warning modal appears with red/yellow styling
- ✅ Warning text clearly states consequences
- ✅ Cancel preserves data
- ✅ Confirm deletes all data
- ✅ Redirected to home page
- ✅ All users gone
- ✅ Settings reset to defaults
- ✅ localStorage completely cleared

---

## 4. Session Page Tests

### 4.1 Session Initialization
**Steps:**
1. Create user "Alice"
2. Configure settings: numbers 1-5, 10 cards, 5 minutes
3. Start session from Users page

**Expected Results:**
- ✅ Session page loads
- ✅ Alice's name in header
- ✅ "Card 1 of 10" displayed
- ✅ Score shows "0/10"
- ✅ Timer starts at 5:00 and counts down
- ✅ Progress bar at 0%
- ✅ First problem displayed (e.g., "2×3")
- ✅ Number pad visible with digits 0-9
- ✅ Clear and Submit buttons visible

### 4.2 Answering Correctly
**Steps:**
1. Problem displayed: "2×3"
2. Click "6" on number pad
3. Click "Submit" button

**Expected Results:**
- ✅ Card border turns green
- ✅ "Correct!" message with checkmark
- ✅ Score updates to "1/10"
- ✅ After 1 second, advances to next problem
- ✅ Progress bar advances to 10%
- ✅ "Card 2 of 10" displayed

### 4.3 Answering Incorrectly
**Steps:**
1. Problem displayed: "3×4"
2. Click "1" then "1" to make "11"
3. Click "Submit" button

**Expected Results:**
- ✅ Card border turns red
- ✅ "Incorrect! Answer: 12" message with X icon
- ✅ Score remains unchanged
- ✅ After 1 second, advances to next problem
- ✅ Progress bar advances
- ✅ Card counter increments

### 4.4 Number Pad Functionality
**Steps:**
1. Click "5"
2. Display shows "5"
3. Click "7"
4. Display shows "57"
5. Click "Clear" (C) button
6. Display resets to "0"

**Expected Results:**
- ✅ Single digit entry works
- ✅ Multi-digit entry works
- ✅ Clear button resets to "0"
- ✅ Cannot enter invalid characters
- ✅ Leading zeros handled correctly

### 4.5 Session Completion (Success)
**Steps:**
1. Start session with 5 cards
2. Answer all 5 correctly
3. Complete final card

**Expected Results:**
- ✅ Timer stops
- ✅ Redirected to Session End page
- ✅ "Excellent Work!" or similar message
- ✅ Score displayed correctly
- ✅ Finish time displayed
- ✅ Confetti animation plays
- ✅ Three buttons: "Play Again", "View Reports", "Back to Users"

### 4.6 Session Timeout
**Steps:**
1. Start session with 1-minute timer
2. Answer 2-3 problems
3. Wait for timer to reach 0:00

**Expected Results:**
- ✅ Session automatically ends
- ✅ Redirected to Session End page
- ✅ "Time's Up!" message
- ✅ Partial score shown
- ✅ "Session Incomplete" status
- ✅ Yellow warning displayed
- ✅ Completed answers are saved

### 4.7 Exit Session Early
**Steps:**
1. Start session
2. Answer 3 problems
3. Click X (exit) button in header
4. Modal appears
5. Click "Continue Session"
6. Verify still in session
7. Click X again
8. Click "Exit Anyway"

**Expected Results:**
- ✅ Exit confirmation modal appears
- ✅ Warning about partial progress
- ✅ "Continue Session" keeps user in session
- ✅ "Exit Anyway" saves progress and exits
- ✅ Returns to Users page
- ✅ Partial session data saved

### 4.8 Timer Accuracy
**Steps:**
1. Start session with 5-minute timer
2. Watch timer for 30 seconds
3. Count down manually

**Expected Results:**
- ✅ Timer counts down accurately (±1 second)
- ✅ Timer format: M:SS (e.g., 4:59, 4:58)
- ✅ Visual progress bar matches timer
- ✅ Timer turns red when low (<30 seconds)

### 4.9 Keyboard Navigation (Desktop)
**Steps:**
1. Start session on desktop
2. Try using keyboard to enter numbers
3. Try using Enter key to submit

**Expected Results:**
- ✅ Number keys (0-9) work if implemented
- ✅ Backspace/Delete works if implemented
- ✅ Enter submits answer if implemented
- ✅ (Note: Check if keyboard support is implemented)

---

## 5. Session End Page Tests

### 5.1 Perfect Score Display
**Steps:**
1. Complete session with 100% score

**Expected Results:**
- ✅ Trophy icon (🏆)
- ✅ "Outstanding!" or "Perfect Score!" message
- ✅ Gold/yellow banner displayed
- ✅ Confetti animation
- ✅ Score: "10/10 (100%)"
- ✅ Finish time displayed

### 5.2 Good Score Display (75-89%)
**Steps:**
1. Complete session with 8/10 correct

**Expected Results:**
- ✅ Star icon (🌟)
- ✅ "Excellent Work!" message
- ✅ Confetti animation
- ✅ Score: "8/10 (80%)"
- ✅ Finish time displayed

### 5.3 Average Score Display (60-74%)
**Steps:**
1. Complete session with 7/10 correct

**Expected Results:**
- ✅ Thumbs up icon (👍)
- ✅ "Good Job!" message
- ✅ No confetti
- ✅ Score: "7/10 (70%)"
- ✅ Finish time displayed

### 5.4 Low Score Display (<60%)
**Steps:**
1. Complete session with 5/10 correct

**Expected Results:**
- ✅ Muscle icon (💪)
- ✅ "Keep Practicing!" message
- ✅ No confetti
- ✅ Score: "5/10 (50%)"
- ✅ Encouragement text

### 5.5 Timeout Display
**Steps:**
1. Let session timeout with partial completion

**Expected Results:**
- ✅ Clock icon (⏰)
- ✅ "Time's Up!" message
- ✅ Yellow warning box
- ✅ "Session Incomplete" text
- ✅ Partial score displayed
- ✅ No finish time
- ✅ Encouragement to improve speed

### 5.6 Navigation from Session End
**Steps:**
1. Complete session
2. Click "Play Again"
3. Verify new session starts
4. Complete second session
5. Click "View Reports"
6. Verify reports page loads with data
7. Return to session end
8. Click "Back to Users"

**Expected Results:**
- ✅ "Play Again" starts new session immediately
- ✅ "View Reports" shows reports page
- ✅ "Back to Users" returns to user list
- ✅ All buttons work without errors

---

## 6. Reports Page Tests

### 6.1 No Sessions State
**Steps:**
1. Create new user
2. View reports without completing sessions

**Expected Results:**
- ✅ "No sessions yet" message
- ✅ Chart icon (📊)
- ✅ Encouragement text
- ✅ No errors

### 6.2 Single Session Reports
**Steps:**
1. Complete one session (e.g., 15/20 correct)
2. View reports

**Expected Results:**
- ✅ Statistics cards display:
  - Sessions: 1
  - Avg Score: 75%
  - Best Score: 75%
  - Avg Time: [finish time]
- ✅ Score Trend graph shows 1 data point
- ✅ Most Missed Numbers chart shows data
- ✅ Session History table shows 1 row

### 6.3 Multiple Sessions Reports
**Steps:**
1. Complete 3 sessions with varying scores:
   - Session 1: 12/20 (60%)
   - Session 2: 16/20 (80%)
   - Session 3: 18/20 (90%)
2. View reports

**Expected Results:**
- ✅ Sessions: 3
- ✅ Avg Score: 77% (calculated correctly)
- ✅ Best Score: 90%
- ✅ Line chart shows upward trend
- ✅ Chart has 3 data points
- ✅ Session history table has 3 rows
- ✅ Newest session at top

### 6.4 Missed Numbers Analysis
**Steps:**
1. Complete session with intentional errors on 2s and 3s
2. Get wrong: 2×3, 2×4, 3×5, 2×7
3. View reports
4. Check "Most Missed Numbers" chart

**Expected Results:**
- ✅ Number 2 has highest bar (appears in 3 wrong answers)
- ✅ Number 3 has second bar (appears in 2 wrong answers)
- ✅ Other numbers have lower/zero bars
- ✅ Chart is readable and labeled correctly

### 6.5 Session History Table
**Steps:**
1. Complete multiple sessions
2. Scroll through session history table

**Expected Results:**
- ✅ Columns: Date, Score, Cards, Time, Status
- ✅ Date formatted correctly (e.g., "Oct 7, 2025")
- ✅ Score shows fraction and percentage
- ✅ Time shows M:SS for completed, "Timeout" for incomplete
- ✅ Status badges: "Complete" (green) or "Incomplete" (yellow)
- ✅ Table scrollable on mobile
- ✅ Rows have hover effect

### 6.6 Graph Interactivity
**Steps:**
1. Hover over data points on line chart
2. Hover over bars on bar chart

**Expected Results:**
- ✅ Tooltips appear on hover
- ✅ Tooltip shows exact values
- ✅ Tooltip includes session number
- ✅ Charts resize responsively

### 6.7 Back Navigation
**Steps:**
1. Click back arrow in header

**Expected Results:**
- ✅ Returns to Users page
- ✅ No errors
- ✅ User list still intact

---

## 7. Weighted Randomization Tests

### 7.1 First Session (No History)
**Steps:**
1. Create new user
2. Settings: numbers 1-5
3. Start session and note problems

**Expected Results:**
- ✅ Problems appear random
- ✅ All problems use only numbers 1-5
- ✅ No duplicates within session
- ✅ Good distribution of numbers

### 7.2 Weighted Based on Errors
**Steps:**
1. Complete Session 1, get wrong: 2×3, 2×4, 2×5, 3×4
2. Complete Session 2, note problems
3. Verify more 2s and 3s appear
4. Complete Session 3, get all correct
5. Complete Session 4, note problems return to random

**Expected Results:**
- ✅ Session 2 has more problems with 2 and 3
- ✅ Problems still use all selected numbers
- ✅ After good performance, weighting decreases
- ✅ Eventually returns to balanced distribution

### 7.3 Only Last 3 Sessions Analyzed
**Steps:**
1. Complete 5 sessions
2. Sessions 1-2: many errors on 7s and 8s
3. Sessions 3-5: all correct
4. Start Session 6
5. Check if problems still weighted toward 7s/8s

**Expected Results:**
- ✅ Old sessions (1-2) not influencing new problems
- ✅ Only last 3 sessions (3-5) analyzed
- ✅ Problems return to balanced distribution

---

## 8. Data Persistence Tests

### 8.1 Page Refresh
**Steps:**
1. Create 2 users
2. Complete 1 session
3. Refresh page (F5)
4. Navigate to Users page

**Expected Results:**
- ✅ All users still exist
- ✅ Session data preserved
- ✅ Settings unchanged
- ✅ No data loss

### 8.2 Browser Close/Reopen
**Steps:**
1. Create users and complete sessions
2. Close browser completely
3. Reopen browser
4. Navigate to application

**Expected Results:**
- ✅ All data persists
- ✅ Users visible
- ✅ Sessions in history
- ✅ Settings preserved

### 8.3 localStorage Verification
**Steps:**
1. Create data
2. Open DevTools → Application → Local Storage
3. Check stored keys

**Expected Results:**
- ✅ Keys present: `flash-cards-users`, `flash-cards-settings`, `flash-cards-sessions`
- ✅ Data is valid JSON
- ✅ No sensitive data exposed
- ✅ Data structure matches types

---

## 9. Multi-Tab Synchronization Tests

### 9.1 User Creation Across Tabs
**Steps:**
1. Open app in Tab 1
2. Open app in Tab 2
3. In Tab 1, create user "Alice"
4. Switch to Tab 2
5. Refresh Tab 2

**Expected Results:**
- ✅ Alice appears in Tab 2 after refresh
- ✅ (Note: Real-time sync may not be implemented - refresh is acceptable)

### 9.2 Session Completion Across Tabs
**Steps:**
1. Tab 1: Start session
2. Tab 2: View users page
3. Tab 1: Complete session
4. Tab 2: Refresh and check session count

**Expected Results:**
- ✅ Session count updates after refresh
- ✅ No data corruption

### 9.3 Settings Update Across Tabs
**Steps:**
1. Tab 1: Change settings
2. Tab 2: Start session
3. Verify session uses old or new settings

**Expected Results:**
- ✅ No conflicts
- ✅ Data remains consistent
- ✅ No localStorage quota errors

---

## 10. Accessibility Tests

### 10.1 Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Use Enter/Space to activate buttons
3. Navigate entire application without mouse

**Expected Results:**
- ✅ All interactive elements focusable
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ No keyboard traps
- ✅ Can complete full user journey via keyboard

### 10.2 Screen Reader (NVDA/JAWS/VoiceOver)
**Steps:**
1. Enable screen reader
2. Navigate through pages
3. Verify announcements make sense

**Expected Results:**
- ✅ Buttons have descriptive labels
- ✅ Form inputs have labels
- ✅ Page headings announced
- ✅ Dynamic content changes announced
- ✅ Timer updates announced

### 10.3 Color Contrast
**Steps:**
1. Use browser DevTools accessibility checker
2. Verify all text meets WCAG AA standards

**Expected Results:**
- ✅ Text has minimum 4.5:1 contrast ratio
- ✅ Large text has minimum 3:1 ratio
- ✅ Interactive elements distinguishable
- ✅ No reliance on color alone

### 10.4 Touch Targets (Mobile)
**Steps:**
1. Test on mobile device
2. Verify all buttons easy to tap

**Expected Results:**
- ✅ Minimum 44×44px touch targets
- ✅ Adequate spacing between buttons
- ✅ No accidental taps
- ✅ Comfortable thumb reach

---

## 11. Performance Tests

### 11.1 Large Dataset
**Steps:**
1. Create 50 users
2. Generate 100 sessions for one user
3. View reports

**Expected Results:**
- ✅ Page loads in <3 seconds
- ✅ No UI freezing
- ✅ Charts render correctly
- ✅ Scrolling is smooth

### 11.2 Session Generation Speed
**Steps:**
1. Settings: all numbers (1-12), 100 cards
2. Start session
3. Note loading time

**Expected Results:**
- ✅ Session starts in <1 second
- ✅ All 100 problems generated
- ✅ No duplicates
- ✅ No errors

### 11.3 localStorage Quota
**Steps:**
1. Create many users and sessions until approaching quota
2. Verify error handling

**Expected Results:**
- ✅ Graceful error message if quota exceeded
- ✅ Suggestion to clear data
- ✅ No data corruption
- ✅ Application remains functional

---

## 12. Edge Cases and Error Scenarios

### 12.1 Rapid Button Clicking
**Steps:**
1. Rapidly click "Add User" button 10 times
2. Rapidly click number pad buttons
3. Rapidly submit answers

**Expected Results:**
- ✅ No duplicate users created
- ✅ No double-submit bugs
- ✅ UI remains responsive
- ✅ No console errors

### 12.2 Invalid URL Navigation
**Steps:**
1. Navigate to `/session/invalid-id`
2. Navigate to `/reports/invalid-id`

**Expected Results:**
- ✅ Redirects to appropriate page (Users page)
- ✅ Error message or fallback behavior
- ✅ No application crash

### 12.3 Browser Back Button
**Steps:**
1. Navigate through: Splash → Users → Session → Session End
2. Use browser back button at each stage

**Expected Results:**
- ✅ Back button works correctly
- ✅ No broken states
- ✅ Session data preserved
- ✅ Appropriate warnings if needed

### 12.4 localStorage Disabled
**Steps:**
1. Disable localStorage in browser settings
2. Attempt to use application

**Expected Results:**
- ✅ Error message displayed
- ✅ Clear explanation
- ✅ Instructions to enable localStorage
- ✅ No crash or white screen

### 12.5 Network Offline (PWA)
**Steps:**
1. Use application online
2. Go offline
3. Try to continue using app

**Expected Results:**
- ✅ Application works offline (if PWA implemented)
- ✅ All core features functional
- ✅ Data persists locally

---

## 13. Mobile-Specific Tests

### 13.1 Portrait Orientation
**Steps:**
1. Test all pages in portrait mode on phone

**Expected Results:**
- ✅ All content visible
- ✅ No horizontal scrolling
- ✅ Buttons reachable
- ✅ Text readable

### 13.2 Landscape Orientation
**Steps:**
1. Rotate device to landscape
2. Test session page and number pad

**Expected Results:**
- ✅ Layout adjusts appropriately
- ✅ Number pad remains accessible
- ✅ Timer visible
- ✅ No clipping

### 13.3 Small Devices (iPhone SE, 320px width)
**Steps:**
1. Test on smallest supported device

**Expected Results:**
- ✅ All features accessible
- ✅ No layout breakage
- ✅ Text readable
- ✅ Buttons tappable

### 13.4 Large Tablets (iPad Pro, 1024px+)
**Steps:**
1. Test on large tablet

**Expected Results:**
- ✅ Layout uses available space efficiently
- ✅ Charts and graphs scale appropriately
- ✅ No overly stretched elements

---

## 14. Browser Compatibility

Test all major scenarios in each browser:

### 14.1 Chrome (Latest)
- ✅ All features work
- ✅ No console errors
- ✅ Smooth animations

### 14.2 Firefox (Latest)
- ✅ All features work
- ✅ localStorage functions correctly
- ✅ Charts render correctly

### 14.3 Safari (Latest)
- ✅ All features work
- ✅ iOS Safari specific tests
- ✅ Touch events work

### 14.4 Edge (Latest)
- ✅ All features work
- ✅ Consistent with Chrome behavior

---

## 15. Regression Testing Checklist

After any code changes, verify these critical paths:

- [ ] User creation and deletion
- [ ] Settings save and load
- [ ] Session start and completion
- [ ] Timer countdown and timeout
- [ ] Score calculation
- [ ] Reports data display
- [ ] Data persistence after refresh
- [ ] No TypeScript errors in console
- [ ] No React errors/warnings
- [ ] Mobile responsive layout

---

## Test Reporting Template

For each test failure, document:

**Test Name:** [e.g., "Session Page - Answering Correctly"]
**Environment:** [Browser, OS, Device]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:** [What should happen]
**Actual Result:** [What actually happened]
**Screenshots:** [Attach if applicable]
**Console Errors:** [Copy any errors]
**Severity:** [Critical/High/Medium/Low]
**Reproducible:** [Always/Sometimes/Rarely]

---

## Success Criteria

The application is ready for production when:
- ✅ All critical path tests pass
- ✅ No high-severity bugs remain
- ✅ Accessibility score >90% (Lighthouse)
- ✅ Performance score >80% (Lighthouse)
- ✅ Works on all target browsers
- ✅ Mobile experience is smooth
- ✅ Data persistence is reliable
- ✅ No data loss scenarios
- ✅ Error handling is graceful
- ✅ User experience is intuitive

---

## Notes for Testers

1. **Take your time** - Don't rush through scenarios
2. **Document everything** - Screenshots help debug issues
3. **Test edge cases** - Try to break things
4. **Think like a user** - Not just a tester
5. **Verify data** - Check localStorage in DevTools
6. **Test on real devices** - Not just emulators
7. **Clear data between test runs** - Ensures clean slate
8. **Report all bugs** - Even small UI issues matter

---

**Last Updated:** October 7, 2025
**Test Suite Version:** 1.0
**Application Version:** 1.0.0
