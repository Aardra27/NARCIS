from pathlib import Path

frontend = Path(r"C:\Users\AARDRA\Downloads\NARCIS\frontend")

login_tsx = frontend / "src" / "app" / "login" / "page.tsx"
dashboard_tsx = frontend / "src" / "app" / "dashboard" / "page.tsx"
login_css = frontend / "src" / "app" / "login" / "login.module.css"
dashboard_css = frontend / "src" / "app" / "dashboard" / "dashboard.module.css"

# --------------------------------------------------
# 1. Fix corrupted characters in Login
# --------------------------------------------------

text = login_tsx.read_text(encoding="utf-8")

text = text.replace("â— ONLINE", "● ONLINE")
text = text.replace("Â·Â·Â·", "•••")
text = text.replace("â†’", "→")
text = text.replace("âœ“", "✓")

# Slightly slower, smoother Login -> Dashboard timing
text = text.replace(
    '''      window.setTimeout(() => {
        setTransitioning(true);
      }, 350);

      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);''',
    '''      window.setTimeout(() => {
        setTransitioning(true);
      }, 300);

      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1350);'''
)

login_tsx.write_text(text, encoding="utf-8", newline="")

# --------------------------------------------------
# 2. Fix duplicate React keys + corrupted arrow
# --------------------------------------------------

text = dashboard_tsx.read_text(encoding="utf-8")

text = text.replace(
    '''{activities.map((activity) => (
                <div
                  className={styles.activity}
                  key={activity.year}
                >''',
    '''{activities.map((activity, index) => (
                <div
                  className={styles.activity}
                  key={`${activity.year}-${index}`}
                >'''
)

text = text.replace("View all activities â†’", "View all activities →")

dashboard_tsx.write_text(text, encoding="utf-8", newline="")

# --------------------------------------------------
# 3. Replace Login transition with smoother animation
# --------------------------------------------------

text = login_css.read_text(encoding="utf-8")

old_login = '''.transitioning {
  animation:
    loginExit
    850ms
    cubic-bezier(.65, 0, .35, 1)
    forwards;
  pointer-events: none;
}

@keyframes loginExit {
  0% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }

  55% {
    opacity: .65;
    transform: scale(1.006);
    filter: blur(1px);
  }

  100% {
    opacity: 0;
    transform: scale(1.012);
    filter: blur(3px);
  }
}'''

new_login = '''.transitioning {
  animation:
    loginExit
    1050ms
    cubic-bezier(.76, 0, .24, 1)
    forwards;
  pointer-events: none;
  will-change: opacity, transform, filter;
}

@keyframes loginExit {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }

  35% {
    opacity: .92;
    transform: translateY(-1px) scale(1.002);
    filter: blur(.3px);
  }

  72% {
    opacity: .48;
    transform: translateY(-4px) scale(1.006);
    filter: blur(1.2px);
  }

  100% {
    opacity: 0;
    transform: translateY(-7px) scale(1.01);
    filter: blur(3px);
  }
}'''

text = text.replace(old_login, new_login)

login_css.write_text(text, encoding="utf-8", newline="")

# --------------------------------------------------
# 4. Replace Dashboard entrance animation
# --------------------------------------------------

text = dashboard_css.read_text(encoding="utf-8")

old_dashboard = '''.page {
  animation: dashboardEnter 900ms cubic-bezier(.22, 1, .36, 1) both;
}

@keyframes dashboardEnter {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(.995);
    filter: blur(3px);
  }

  60% {
    opacity: .85;
    transform: translateY(2px) scale(1);
    filter: blur(.5px);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}'''

new_dashboard = '''.page {
  animation: dashboardEnter 1200ms cubic-bezier(.22, 1, .36, 1) both;
  will-change: opacity, transform, filter;
}

@keyframes dashboardEnter {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(.997);
    filter: blur(4px);
  }

  30% {
    opacity: .35;
    transform: translateY(8px) scale(.998);
    filter: blur(2.5px);
  }

  65% {
    opacity: .82;
    transform: translateY(2px) scale(1);
    filter: blur(.8px);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}'''

text = text.replace(old_dashboard, new_dashboard)

# Remove accidental duplicate .page animation block if present
duplicate = '''\n.page {\n  animation: dashboardEnter 900ms cubic-bezier(.22, 1, .36, 1) both;\n}\n\n@keyframes dashboardEnter {\n  0% {\n    opacity: 0;\n    transform: translateY(10px) scale(.995);\n    filter: blur(3px);\n  }\n\n  60% {\n    opacity: .85;\n    transform: translateY(2px) scale(1);\n    filter: blur(.5px);\n  }\n\n  100% {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n    filter: blur(0);\n  }\n}\n'''

text = text.replace(duplicate, "\n")

dashboard_css.write_text(text, encoding="utf-8", newline="")

print("NARCIS transition, encoding, and React-key fixes applied.")