# Swipe Navigation with Haptic Feedback 🎯

Your app now supports fluid swipe navigation between columns with haptic feedback!

## Features

✨ **Swipe Navigation** - Swipe left/right between columns on each tab
✨ **Haptic Feedback** - Vibration response on every swipe (mobile devices)
✨ **Multi-View Support** - Implemented across all main tabs:
  - **Home**: Overview ↔ Budget
  - **Money**: List ↔ Calendar  
  - **Health**: Today ↔ Week

## How It Works

### For Users

**Home Tab:**
- Swipe **left** to go from Overview → Budget
- Swipe **right** to go from Budget → Overview
- Tap buttons still work as before

**Money Tab:**
- Swipe **left** to go from List → Calendar
- Swipe **right** to go from Calendar → List

**Health Tab:**
- Swipe **left** to go from Today → Week
- Swipe **right** to go from Week → Today

**Haptic Feedback:**
- Feel a medium vibration (20ms) on each successful swipe
- Provides tactile confirmation of navigation

### For Developers

**Two Swipe Detection Hooks:**

1. **`useSwipeNative()`** - Recommended (used in this app)
   - Detects both touch AND mouse swipes
   - Prevents scroll/click conflicts
   - Works on desktop for testing
   
2. **`useSwipe()`** - Touch-only alternative
   - Lighter implementation
   - Touch events only

**Haptic Feedback Hook:**

```typescript
import { useHaptic } from "@/hooks/useHaptic";

const { medium, light, heavy, success, error } = useHaptic();

// Trigger different feedback patterns
medium();      // 20ms vibration
light();       // 10ms vibration
heavy();       // 30ms vibration
success();     // [10, 20, 10] pattern
error();       // [50, 20, 50, 20, 50] pattern
```

## Implementation Example

From `src/pages/Home.tsx`:

```typescript
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";

export default function Home() {
  const [tab, setTab] = useState<"overview" | "budget">("overview");
  const { medium } = useHaptic();

  // Register swipe handlers
  useSwipeNative({
    onSwipeLeft: () => {
      if (tab === "overview") {
        setTab("budget");
        medium(); // Haptic feedback
      }
    },
    onSwipeRight: () => {
      if (tab === "budget") {
        setTab("overview");
        medium(); // Haptic feedback
      }
    },
    threshold: 50, // Minimum swipe distance in pixels
  });

  return (
    // Component JSX
  );
}
```

## Files Modified

📁 **New Files:**
- `src/hooks/useSwipe.ts` - Swipe detection hook
- `src/hooks/useHaptic.ts` - Haptic feedback hook

📝 **Updated Files:**
- `src/pages/Home.tsx` - Added swipe between overview/budget
- `src/pages/Money.tsx` - Added swipe between list/calendar
- `src/pages/Health.tsx` - Added swipe between today/week

## Browser Compatibility

✅ **Haptic Feedback (Vibration API)**
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: iOS 13+
- Desktop: Supported if device has vibration motor

⚠️ **Graceful Fallback**
- If haptic unavailable, silently skips (no error)
- Swipe navigation works on all modern browsers

✅ **Swipe Detection**
- All modern browsers (touch + mouse)
- Desktop testing with mouse drag
- Mobile touch events
- Custom threshold to prevent accidental triggers

## Customization

**Change Swipe Sensitivity:**
```typescript
useSwipeNative({
  threshold: 75, // Increase from 50 (harder to trigger)
  onSwipeLeft: handleSwipe,
  onSwipeRight: handleSwipe,
});
```

**Use Different Haptic Patterns:**
```typescript
// Instead of medium()
success(); // [10, 20, 10] - celebratory
error();   // [50, 20, 50, 20, 50] - urgent
warning(); // [30, 10, 30] - attention
```

**Add Swipe to New Pages:**

```typescript
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";

export default function NewPage() {
  const [view, setView] = useState("view1");
  const { medium } = useHaptic();

  useSwipeNative({
    onSwipeLeft: () => {
      if (view === "view1") {
        setView("view2");
        medium();
      }
    },
    onSwipeRight: () => {
      if (view === "view2") {
        setView("view1");
        medium();
      }
    },
  });

  return (...);
}
```

## Testing

**Mobile Testing:**
1. Build: `npm run build`
2. Preview: `npm run preview`
3. Open on mobile device
4. Swipe left/right on each tab
5. Feel the haptic feedback!

**Desktop Testing:**
1. Open in Chrome/Edge
2. Click and drag left/right to simulate swipe
3. Watch view change (no haptic on desktop)

**DevTools Testing:**
```javascript
// Manually trigger haptic in console
navigator.vibrate(20);          // Single vibration
navigator.vibrate([10, 20, 10]); // Pattern
```

## Troubleshooting

**No haptic feedback on mobile:**
- Ensure device has vibration capability
- Some devices may disable vibration in settings
- Check browser DevTools console for errors

**Swipe not working:**
- Ensure threshold isn't too high (default 50px)
- Check that you're swiping horizontally
- Desktop requires mouse drag, not hover

**Accidental swipes:**
- Increase threshold value
- Or add additional checks before `setTab()`

## Performance Notes

- Minimal overhead: ~2KB bundled
- No external dependencies  
- Touch events properly cleaned up on unmount
- Swipe detection throttled to prevent excessive re-renders

---

**Ready to swipe!** 🎉 Your PWA now has a native app feel with swipe navigation and haptic feedback.
