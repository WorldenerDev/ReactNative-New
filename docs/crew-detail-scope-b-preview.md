# Crew Detail — Scope B HTML preview

Plan mode cannot write `.html` directly. **To open the mock:** copy everything inside the `html` fence below into  
`ReactNative-New/docs/crew-detail-scope-b-preview.html`  
then open that file in a browser (paths are relative to `docs/`).

Or switch to **Agent mode** and ask to “write the HTML file” so it is created for you.

**In scope:** header, tabs, filters, Create Trip, enriched trip cards, empty-activities CTA, chat preview, current bottom tabs.  
**Out:** vote banners, Recent Group Activity, client Discover-tab IA.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>Crew Detail — Scope B preview (no deferred)</title>
  <style>
    :root {
      --primary: #121212;
      --secondary: #BBDEF0;
      --white: #FFFFFF;
      --lightText: #5C7080;
      --border: #E5E7EB;
      --black: #000000;
      --page: #F4F7FA;
      --cta-blue: #E8F4FB;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #1a1a1a;
      color: var(--primary);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 48px;
      gap: 16px;
    }
    .note {
      max-width: 390px;
      color: #ccc;
      font-size: 13px;
      line-height: 1.45;
    }
    .note strong { color: #fff; }
    .phone {
      width: 390px;
      background: var(--page);
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.45);
      position: relative;
      padding-bottom: 72px;
    }
    .status-bar {
      height: 44px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 24px 6px;
      font-size: 15px;
      font-weight: 600;
      background: var(--white);
    }
    .status-bar .right { display: flex; gap: 6px; font-size: 12px; opacity: 0.7; }
    .header {
      background: var(--white);
      padding: 8px 16px 20px;
      text-align: center;
      position: relative;
    }
    .back {
      position: absolute;
      left: 12px;
      top: 8px;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .back img { width: 22px; height: 22px; }
    .crew-avatar {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      object-fit: cover;
      margin: 4px auto 12px;
      display: block;
      border: 3px solid var(--white);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .crew-name {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .crew-meta {
      margin-top: 4px;
      font-size: 14px;
      color: var(--lightText);
    }
    .tabs {
      display: flex;
      gap: 8px;
      padding: 12px 16px 0;
      background: var(--white);
    }
    .tab {
      flex: 1;
      text-align: center;
      padding: 10px 0;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      color: var(--lightText);
      background: transparent;
      border: none;
    }
    .tab.active {
      background: var(--secondary);
      color: var(--primary);
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 8px;
      gap: 12px;
      background: var(--page);
    }
    .pills { display: flex; gap: 8px; }
    .pill {
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      background: var(--white);
      color: var(--lightText);
      border: 1px solid var(--border);
    }
    .pill.active {
      background: var(--secondary);
      color: var(--primary);
      border-color: transparent;
    }
    .create-btn {
      background: var(--black);
      color: var(--white);
      border: none;
      border-radius: 22px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .create-btn img { width: 14px; height: 14px; filter: invert(1); }
    .content { padding: 4px 16px 16px; }
    .card {
      background: var(--white);
      border-radius: 16px;
      border: 1px solid var(--border);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .card-body {
      display: flex;
      gap: 12px;
      padding: 12px;
    }
    .trip-img {
      width: 92px;
      height: 110px;
      border-radius: 12px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .card-main { flex: 1; min-width: 0; }
    .city { font-size: 17px; font-weight: 700; }
    .dates { font-size: 13px; color: var(--lightText); margin-top: 2px; }
    .avatars {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
    .avatars img {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid var(--white);
      object-fit: cover;
      margin-left: -8px;
    }
    .avatars img:first-child { margin-left: 0; }
    .avatars .more {
      margin-left: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--lightText);
    }
    .badge {
      display: inline-block;
      margin-top: 8px;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: #E8F5E9;
      color: #2E7D32;
    }
    .badge.pending {
      background: #FFF3E0;
      color: #EF6C00;
    }
    .stats {
      display: flex;
      gap: 14px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .stat {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: var(--lightText);
      font-weight: 500;
    }
    .stat img { width: 14px; height: 14px; opacity: 0.75; }
    .cta {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      background: var(--cta-blue);
      border-top: 1px solid #d7ebf5;
      text-decoration: none;
      color: var(--primary);
    }
    .cta img.spark { width: 16px; height: 16px; flex-shrink: 0; }
    .cta span { flex: 1; font-size: 13px; font-weight: 500; line-height: 1.3; }
    .cta .chev { width: 14px; height: 14px; opacity: 0.5; }
    .chat-bar {
      margin: 8px 16px 0;
      background: var(--secondary);
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .chat-bar .icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255,255,255,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .chat-bar .icon-wrap img { width: 22px; height: 22px; }
    .chat-text { flex: 1; min-width: 0; }
    .chat-title { font-size: 15px; font-weight: 700; }
    .chat-preview {
      font-size: 12px;
      color: var(--lightText);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chat-bar .chev { width: 16px; height: 16px; opacity: 0.45; }
    .tabbar {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 64px;
      background: var(--white);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding-bottom: 6px;
    }
    .tabbar button {
      border: none;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: var(--lightText);
      width: 64px;
    }
    .tabbar button.active { color: #3B82C4; }
    .tabbar img { width: 22px; height: 22px; opacity: 0.55; }
    .tabbar button.active img { opacity: 1; }
    .legend {
      max-width: 390px;
      background: #2a2a2a;
      color: #ddd;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 12px;
      line-height: 1.5;
    }
    .legend h2 { font-size: 13px; color: #fff; margin-bottom: 8px; }
    .legend ul { padding-left: 18px; }
    .legend li { margin-bottom: 4px; }
    .in { color: #7dcea0; }
    .out { color: #f5b7b1; }
  </style>
</head>
<body>
  <p class="note">
    <strong>Crew Detail — Scope B preview</strong><br />
    Layout + best-effort data. No vote banners, no Recent Group Activity.
    Icons only from <code>src/assets/icons/source/</code>. Bottom tabs = current app.
  </p>

  <div class="phone" aria-label="Crew Detail Scope B">
    <div class="status-bar">
      <span>9:41</span>
      <span class="right">LTE · 100%</span>
    </div>

    <div class="header">
      <button class="back" type="button" aria-label="Back">
        <img src="../src/assets/icons/source/back.png" alt="" />
      </button>
      <img class="crew-avatar" src="../src/assets/icons/source/dummy.jpg" alt="Summer Crew" />
      <div class="crew-name">Summer Crew</div>
      <div class="crew-meta">6 members</div>
    </div>

    <div class="tabs">
      <button class="tab active" type="button">Trips</button>
      <button class="tab" type="button">Members</button>
    </div>

    <div class="toolbar">
      <div class="pills">
        <button class="pill active" type="button">Active</button>
        <button class="pill" type="button">Past</button>
      </div>
      <button class="create-btn" type="button">
        <img src="../src/assets/icons/source/plus_border.png" alt="" />
        Create Trip
      </button>
    </div>

    <div class="content">
      <article class="card">
        <div class="card-body">
          <img class="trip-img" src="../src/assets/icons/source/dummy.jpg" alt="Biarritz" />
          <div class="card-main">
            <div class="city">Biarritz</div>
            <div class="dates">1 Aug – 7 Aug 2026</div>
            <div class="avatars">
              <img src="../src/assets/icons/source/dummy.png" alt="" />
              <img src="../src/assets/icons/source/account.png" alt="" />
              <img src="../src/assets/icons/source/dummy.jpg" alt="" />
              <img src="../src/assets/icons/source/account@2x.png" alt="" />
              <span class="more">+1</span>
            </div>
            <span class="badge">Joined</span>
            <div class="stats">
              <div class="stat">
                <img src="../src/assets/icons/source/group.png" alt="" />
                5 Members
              </div>
              <div class="stat">
                <img src="../src/assets/icons/source/like.png" alt="" />
                2 Saved
              </div>
              <div class="stat">
                <img src="../src/assets/icons/source/Calendar.png" alt="" />
                0 Activities
              </div>
            </div>
          </div>
        </div>
        <a class="cta" href="#">
          <img class="spark" src="../src/assets/icons/source/magicWand.png" alt="" />
          <span>Let's get started! Add your first activity and start planning.</span>
          <img class="chev" src="../src/assets/icons/source/right.png" alt="" />
        </a>
      </article>

      <article class="card">
        <div class="card-body">
          <img class="trip-img" src="../src/assets/icons/source/bg.png" alt="Barcelona" />
          <div class="card-main">
            <div class="city">Barcelona</div>
            <div class="dates">7 Aug – 10 Aug 2026</div>
            <div class="avatars">
              <img src="../src/assets/icons/source/dummy.png" alt="" />
              <img src="../src/assets/icons/source/account.png" alt="" />
              <img src="../src/assets/icons/source/dummy.jpg" alt="" />
              <img src="../src/assets/icons/source/account@2x.png" alt="" />
              <span class="more">+2</span>
            </div>
            <span class="badge pending">Not joined</span>
            <div class="stats">
              <div class="stat">
                <img src="../src/assets/icons/source/group.png" alt="" />
                5 Members
              </div>
              <div class="stat">
                <img src="../src/assets/icons/source/like.png" alt="" />
                8 Saved
              </div>
              <div class="stat">
                <img src="../src/assets/icons/source/Calendar.png" alt="" />
                12 Activities
              </div>
            </div>
          </div>
        </div>
      </article>

      <div class="chat-bar">
        <div class="icon-wrap">
          <img src="../src/assets/icons/source/chat-icon.png" alt="" />
        </div>
        <div class="chat-text">
          <div class="chat-title">Group Chat</div>
          <div class="chat-preview">Timmy: Anyone free Friday?</div>
        </div>
        <img class="chev" src="../src/assets/icons/source/right.png" alt="" />
      </div>
    </div>

    <nav class="tabbar" aria-label="Current app tabs">
      <button type="button">
        <img src="../src/assets/icons/source/home.png" alt="" />
        Home
      </button>
      <button class="active" type="button">
        <img src="../src/assets/icons/source/group.png" alt="" />
        Crews
      </button>
      <button type="button">
        <img src="../src/assets/icons/source/trip.png" alt="" />
        Trips
      </button>
      <button type="button">
        <img src="../src/assets/icons/source/booking.png" alt="" />
        Bookings
      </button>
      <button type="button">
        <img src="../src/assets/icons/source/account.png" alt="" />
        Profile
      </button>
    </nav>
  </div>

  <div class="legend">
    <h2>Included vs omitted</h2>
    <ul>
      <li><span class="in">IN</span> — Header avatar, name, member count</li>
      <li><span class="in">IN</span> — Trips | Members, Active | Past, Create Trip</li>
      <li><span class="in">IN</span> — Trip cards: avatar stack, Members / Saved / Activities, participation badge</li>
      <li><span class="in">IN</span> — Empty-itinerary CTA only (0 activities)</li>
      <li><span class="in">IN</span> — Group Chat + last-message preview</li>
      <li><span class="out">OUT</span> — “X people voted” / green planning banner</li>
      <li><span class="out">OUT</span> — Recent Group Activity + See all</li>
      <li><span class="out">OUT</span> — Client mock bottom-tab IA</li>
    </ul>
    <p style="margin-top:10px;opacity:0.8">
      Icons: back, plus_border, group, like, Calendar, magicWand, right, chat-icon, home, trip, booking, account, dummy.jpg/png, bg.png
    </p>
  </div>
</body>
</html>
```
