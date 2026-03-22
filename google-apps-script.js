/**
 * ZAVMO Marketing Tracker — Google Apps Script API Bridge
 *
 * This script serves three purposes:
 * 1. Sends formatted notifications to Google Chat when weekly data is saved
 * 2. Fetches Google Analytics 4 data for auto-filling website metrics
 * 3. Fetches Google Calendar meetings matching search terms
 *
 * SETUP INSTRUCTIONS:
 * ==================
 *
 * 1. Go to https://script.google.com and create a new project
 *    Name it "Zavmo Marketing Tracker Bridge"
 *
 * 2. Paste this entire script into the editor (replace any existing code)
 *
 * 3. Replace YOUR_GOOGLE_CHAT_WEBHOOK_URL_HERE below with your webhook URL
 *    (See README.md Step 2 for how to create the webhook)
 *
 * 4. ENABLE THE ANALYTICS API:
 *    - In the Apps Script editor, click the "+" next to "Services" in the left sidebar
 *    - Search for "Google Analytics Data API"
 *    - Click "Add"
 *    - This enables the AnalyticsData advanced service
 *
 * 5. Click Deploy > New deployment
 *    - Click the gear icon and select "Web app"
 *    - Set "Execute as" to "Me"
 *    - Set "Who has access" to "Anyone"
 *    - Click Deploy
 *    - Authorise access when prompted (you'll need to grant Calendar and Analytics permissions)
 *    - Copy the Web App URL
 *
 * 6. Paste that URL into the Settings panel on your Zavmo tracker dashboard
 *
 * IMPORTANT: After making changes, you must create a NEW deployment
 * (Deploy > New deployment), not just save the file.
 */

// ============================================================
// CONFIGURATION — Replace with your actual values
// ============================================================
const GOOGLE_CHAT_WEBHOOK_URL = 'YOUR_GOOGLE_CHAT_WEBHOOK_URL_HERE';

// ============================================================
// REQUEST ROUTER
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'notify';

    switch (action) {
      case 'fetchGA4':
        return handleGA4Fetch(data);
      case 'fetchCalendar':
        return handleCalendarFetch(data);
      case 'test':
        return jsonResponse({ status: 'success', message: 'Connection working!' });
      default:
        return handleNotification(data);
    }
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

function doGet(e) {
  return jsonResponse({ status: 'ok', message: 'Zavmo Marketing Tracker bridge is running' });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// 1. GOOGLE CHAT NOTIFICATION
// ============================================================
function handleNotification(data) {
  const week = data.week;
  const weekDate = data.weekDate;
  const metrics = data.metrics || [];
  const achievements = data.newAchievements || [];
  const summary = data.summary || {};

  // Build metric text
  let metricsText = '';
  metrics.forEach(function(m) {
    const icon = m.hitTarget ? '✅' : '⚠️';
    metricsText += icon + ' <b>' + m.label + '</b>: ' + m.actual + ' (target: ' + m.target + ')\n';
  });

  const card = {
    cards: [{
      header: {
        title: 'ZAVMO Marketing Tracker Update',
        subtitle: 'Week ' + week + ' (' + weekDate + ') — Updated by Shalini',
        imageStyle: 'AVATAR'
      },
      sections: [
        {
          header: 'Key Metrics — Target vs Actual',
          widgets: [{ textParagraph: { text: metricsText || 'No metrics data' } }]
        },
        {
          header: 'Week Summary',
          widgets: [
            { keyValue: { topLabel: 'Demo Meetings Booked', content: (summary.demoMeetings || 0) + ' (Target: ' + (summary.demoTarget || 0) + ')', icon: 'BOOKMARK' } },
            { keyValue: { topLabel: 'LinkedIn Followers', content: (summary.totalFollowers || '—') + ' (Target: ' + (summary.followersTarget || 0) + ')', icon: 'PERSON' } },
            { keyValue: { topLabel: 'Website Visitors', content: (summary.uniqueVisitors || '—') + ' (Target: ' + (summary.visitorsTarget || 0) + ')', icon: 'DESCRIPTION' } },
            { keyValue: { topLabel: 'Targets Hit', content: (summary.targetsHit || 0) + ' / ' + (summary.totalTargets || 0), icon: 'STAR' } }
          ]
        }
      ]
    }]
  };

  // Add achievements if any
  if (achievements.length > 0) {
    card.cards[0].sections.push({
      header: 'New Achievements Unlocked!',
      widgets: achievements.map(function(a) {
        return { keyValue: { topLabel: a.name, content: a.desc, icon: 'STAR' } };
      })
    });
  }

  // Add dashboard link
  card.cards[0].sections.push({
    widgets: [{
      buttons: [{
        textButton: {
          text: 'VIEW DASHBOARD',
          onClick: { openLink: { url: data.dashboardUrl || 'https://iridescent-technologies.github.io/Marketing/' } }
        }
      }]
    }]
  });

  // Send to Google Chat
  UrlFetchApp.fetch(GOOGLE_CHAT_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(card)
  });

  return jsonResponse({ status: 'success' });
}

// ============================================================
// 2. GOOGLE ANALYTICS 4 DATA FETCH
// ============================================================
function handleGA4Fetch(data) {
  try {
    const propertyId = data.ga4Property;
    const startDate = data.startDate;
    const endDate = data.endDate;

    if (!propertyId) {
      return jsonResponse({ status: 'error', message: 'No GA4 Property ID provided' });
    }

    // Use the Analytics Data API to fetch metrics
    const request = AnalyticsData.Properties.runReport({
      dateRanges: [{ startDate: startDate, endDate: endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViewsPerSession' },
        { name: 'bounceRate' }
      ]
    }, 'properties/' + propertyId);

    // Parse the response
    const row = request.rows && request.rows.length > 0 ? request.rows[0] : null;

    if (!row) {
      return jsonResponse({ status: 'success', ga4: {
        activeUsers: 0,
        screenPageViews: 0,
        avgSessionDuration: 0,
        screenPageViewsPerSession: 0,
        bounceRate: 0
      }});
    }

    const values = row.metricValues;

    return jsonResponse({
      status: 'success',
      ga4: {
        activeUsers: Math.round(parseFloat(values[0].value)),
        screenPageViews: Math.round(parseFloat(values[1].value)),
        avgSessionDuration: Math.round(parseFloat(values[2].value)),
        screenPageViewsPerSession: parseFloat(parseFloat(values[3].value).toFixed(1)),
        bounceRate: parseFloat((parseFloat(values[4].value) * 100).toFixed(1))
      }
    });

  } catch (error) {
    return jsonResponse({ status: 'error', message: 'GA4 Error: ' + error.toString() });
  }
}

// ============================================================
// 3. GOOGLE CALENDAR MEETINGS FETCH
// ============================================================
function handleCalendarFetch(data) {
  try {
    const searchTerms = (data.searchTerms || 'demo, zavmo, discovery').split(',').map(function(t) { return t.trim().toLowerCase(); });
    const startDate = new Date(data.startDate || '2026-03-30');
    const endDate = new Date(data.endDate || '2026-06-22');

    // Fetch all calendar events in the date range
    const calendar = CalendarApp.getDefaultCalendar();
    const events = calendar.getEvents(startDate, endDate);

    // Filter events matching search terms
    const meetings = [];
    events.forEach(function(event) {
      const title = event.getTitle().toLowerCase();
      const matches = searchTerms.some(function(term) { return title.includes(term); });

      if (matches) {
        // Extract company name from title (try to parse "Demo with CompanyName" patterns)
        let company = event.getTitle();
        const patterns = [/(?:demo|call|meeting|discovery)\s+(?:with|for|re:?)\s+(.+)/i, /(.+?)\s+(?:demo|call|meeting|discovery)/i];
        for (var i = 0; i < patterns.length; i++) {
          var match = company.match(patterns[i]);
          if (match) { company = match[1].trim(); break; }
        }

        // Get attendees
        const guests = event.getGuestList();
        const contact = guests.length > 0 ? guests[0].getName() || guests[0].getEmail() : '';
        const organiser = event.getCreators().length > 0 ? event.getCreators()[0] : '';

        // Determine status
        var status = 'scheduled';
        var eventDate = event.getStartTime();
        if (eventDate < new Date()) {
          status = 'completed';
        }

        meetings.push({
          date: Utilities.formatDate(eventDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
          title: event.getTitle(),
          company: company,
          contact: contact,
          organiser: organiser,
          status: status
        });
      }
    });

    return jsonResponse({
      status: 'success',
      meetings: meetings,
      total: meetings.length
    });

  } catch (error) {
    return jsonResponse({ status: 'error', message: 'Calendar Error: ' + error.toString() });
  }
}
