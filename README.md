# Ensurio First — React Landing Page

## Setup

```bash
# 1. Create a new Vite React project
npm create vite@latest ensurio-first -- --template react
cd ensurio-first

# 2. Install dependencies
npm install
npm install framer-motion react-hook-form

# 3. Replace the src/ folder with the provided files

# 4. Run
npm run dev
```

## File Structure

```
src/
├── App.jsx                          # Root — assembles all sections
├── styles/
│   └── tokens.css                   # CSS variables (colors, fonts, radii)
├── components/
│   ├── Navbar.jsx                   # Top info bar + sticky nav
│   ├── Hero.jsx                     # Split-screen hero with tool on right
│   ├── DiagnosticTool/
│   │   ├── index.jsx                # Tab switcher card
│   │   ├── PremiumCheck.jsx         # IOP 3-step wizard + score
│   │   ├── FamilyCheck.jsx          # Family readiness 3-step + score
│   │   ├── ScoreResult.jsx          # Animated SVG score ring
│   │   ├── StepIndicator.jsx        # Animated step progress bar
│   │   └── LeadGateForm.jsx         # Lead capture form (react-hook-form)
│   ├── Services.jsx                 # IOP phases + Management services
│   ├── AboutSection.jsx             # Dark rebrand story + stats
│   └── Footer.jsx                   # Links + legal line
```

## Color Palette

| Variable         | Hex       | Usage                          |
|-----------------|-----------|-------------------------------|
| `--navy`        | #0D1B4B   | Primary dark, backgrounds      |
| `--navy-mid`    | #162258   | Mid navy                       |
| `--navy-light`  | #1E2F6E   | Hero gradient end              |
| `--teal`        | #00B899   | CTAs, accents, active states   |
| `--teal-dark`   | #008F78   | Hover state                    |
| `--teal-pale`   | #E6FAF7   | Selected chip backgrounds      |
| `--white`       | #FFFFFF   | Surfaces                       |
| `--light-bg`    | #F5F7FA   | Section backgrounds            |

## Connecting the Lead Gate

The `LeadGateForm` currently calls `onSubmit(data)` with `{ name, email, company }`.
Wire it to your CRM or email service:

```js
// Example: send to your backend
const handleSubmit = async (data) => {
  await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify({ ...data, tool: 'iop', score: result.score }),
    headers: { 'Content-Type': 'application/json' },
  })
  setSubmitted(true)
}
```

Popular integrations: HubSpot Forms API, Mailchimp, Brevo, Resend, or a simple
serverless function (Vercel/Netlify) forwarding to your email.

## Extending the Tools

- **Scoring logic** lives in `calcScore()` inside `PremiumCheck.jsx` and inline in `FamilyCheck.jsx`
- **Questions** are in the `QUESTIONS` array in `FamilyCheck.jsx`
- **IOP phases** are in the `IOP_PHASES` array in `Services.jsx`
- **Management services** are in the `MGMT_SERVICES` array in `Services.jsx`

## Next Steps

- [ ] Add Google Analytics / Meta Pixel events on form submit
- [ ] Connect lead gate to CRM
- [ ] Generate actual downloadable PDF on submission (use `@react-pdf/renderer`)
- [ ] Add responsive mobile styles (CSS media queries or Tailwind)
- [ ] Add a Blog section
- [ ] Add a Contact Us section with a map
