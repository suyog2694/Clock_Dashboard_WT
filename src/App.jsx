import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const timeZones = [
  { id: 'local', label: 'Local', tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: 'utc', label: 'UTC', tz: 'UTC' },
  { id: 'newyork', label: 'New York', tz: 'America/New_York' },
  { id: 'london', label: 'London', tz: 'Europe/London' },
  { id: 'tokyo', label: 'Tokyo', tz: 'Asia/Tokyo' },
  { id: 'sydney', label: 'Sydney', tz: 'Australia/Sydney' },
  { id: 'dubai', label: 'Dubai', tz: 'Asia/Dubai' },
  { id: 'delhi', label: 'New Delhi', tz: 'Asia/Kolkata' },
]

const zoneMap = Object.fromEntries(timeZones.map((zone) => [zone.id, zone]))

const formatTwo = (value) => String(value).padStart(2, '0')

const getZoneTime = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = formatter.formatToParts(date)
  const result = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
  return {
    hours: Number(result.hour),
    minutes: Number(result.minute),
    seconds: Number(result.second),
  }
}

const formatDigital = (date, timeZone, hour12 = true) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12,
  }).format(date)
}

const parseTimeToSeconds = (value) => {
  const [hours = '0', minutes = '0', seconds = '0'] = value.split(':')
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

const formatDuration = (duration) => {
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  return [hours, minutes, seconds].map(formatTwo).join(':')
}

const playAlarmTone = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return

  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.value = 440
  gain.gain.value = 0.12

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.3)
  oscillator.stop(context.currentTime + 0.8)
}

function App() {
  const [now, setNow] = useState(new Date())
  const [showAnalog, setShowAnalog] = useState(true)
  const [showDigital, setShowDigital] = useState(true)
  const [showWorld, setShowWorld] = useState(true)
  const [selectedZones, setSelectedZones] = useState(['newyork', 'london', 'tokyo', 'sydney'])
  const [zonePicker, setZonePicker] = useState('dubai')
  const [alarmForm, setAlarmForm] = useState({ zone: 'utc', time: '07:00', label: 'Daily alert' })
  const [alarms, setAlarms] = useState([])
  const [activeAlert, setActiveAlert] = useState(null)
  const [timerInput, setTimerInput] = useState('00:10:00')
  const [timerRemaining, setTimerRemaining] = useState(parseTimeToSeconds('00:10:00'))
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerLabel, setTimerLabel] = useState('Focus session')
  const [timerAlert, setTimerAlert] = useState(null)
  const firedThisMinute = useRef({})

  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!alarms.length) return

    const currentDay = now.toDateString()
    alarms.forEach((alarm) => {
      const zone = zoneMap[alarm.zone]
      if (!zone) return

      const zoneTime = getZoneTime(now, zone.tz)
      const [targetHour, targetMinute] = alarm.time.split(':').map(Number)
      const alarmKey = `${alarm.id}-${currentDay}-${targetHour}-${targetMinute}`

      if (zoneTime.hours === targetHour && zoneTime.minutes === targetMinute) {
        if (firedThisMinute.current[alarmKey]) return
        firedThisMinute.current[alarmKey] = true

        playAlarmTone()
        setActiveAlert({
          label: alarm.label,
          zone: zone.label,
          time: alarm.time,
        })
      }
    })
  }, [now, alarms])

  useEffect(() => {
    if (!timerRunning || timerRemaining <= 0) return

    const id = window.setInterval(() => {
      setTimerRemaining((current) => {
        if (current <= 1) {
          setTimerRunning(false)
          setTimerAlert({ label: timerLabel })
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [timerRunning, timerRemaining, timerLabel])

  const localZone = timeZones[0]
  const localParts = getZoneTime(now, localZone.tz)
  const worldClocks = useMemo(
    () => selectedZones
      .map((id) => zoneMap[id])
      .filter(Boolean)
      .map((zone) => ({
        zone,
        parts: getZoneTime(now, zone.tz),
        label: formatDigital(now, zone.tz),
      })),
    [now, selectedZones],
  )

  const addZone = () => {
    if (!selectedZones.includes(zonePicker)) {
      setSelectedZones((current) => [...current, zonePicker])
    }
  }

  const removeZone = (zoneId) => {
    setSelectedZones((current) => current.filter((id) => id !== zoneId))
  }

  const handleAlarmSubmit = (event) => {
    event.preventDefault()
    if (!alarmForm.time.trim() || !alarmForm.label.trim()) return

    setAlarms((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        zone: alarmForm.zone,
        time: alarmForm.time,
        label: alarmForm.label,
      },
    ])
    setAlarmForm((prev) => ({ ...prev, label: '', time: prev.time }))
  }

  const dismissAlert = () => setActiveAlert(null)
  const removeAlarm = (alarmId) => setAlarms((current) => current.filter((alarm) => alarm.id !== alarmId))
  const handleTimerInputChange = (value) => setTimerInput(value)
  const handleTimerLabelChange = (event) => setTimerLabel(event.target.value)
  const handleStartTimer = () => {
    if (timerRemaining === 0) {
      setTimerRemaining(parseTimeToSeconds(timerInput))
    }
    setTimerRunning(true)
    setTimerAlert(null)
  }
  const handleToggleTimer = () => setTimerRunning((current) => !current)
  const handleResetTimer = () => {
    setTimerRunning(false)
    setTimerRemaining(parseTimeToSeconds(timerInput))
    setTimerAlert(null)
  }

  const hourHand = (localParts.hours % 12) * 30 + localParts.minutes * 0.5
  const minuteHand = localParts.minutes * 6 + localParts.seconds * 0.1
  const secondHand = localParts.seconds * 6

  return (
    <div className="dashboard">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Professional world-clock dashboard</p>
          <h1>Real-Time Timezone &amp; Alarm Command Center</h1>
          <p className="summary-text">
            Live clock updates, global time zone tracking, alarms, and controls for a high-performance monitoring experience.
          </p>
        </div>
        <div className="control-summary">
          <div>
            <span>Local System Time</span>
            <strong>{formatDigital(now, localZone.tz)}</strong>
          </div>
          <div>
            <span>Current Timezone</span>
            <strong>{localZone.tz}</strong>
          </div>
        </div>
      </header>

      <section className="dashboard-controls panel">
        <div className="control-block">
          <label className="control-label">
            Show analog
            <input type="checkbox" checked={showAnalog} onChange={(event) => setShowAnalog(event.target.checked)} />
          </label>
          <label className="control-label">
            Show digital
            <input type="checkbox" checked={showDigital} onChange={(event) => setShowDigital(event.target.checked)} />
          </label>
          <label className="control-label">
            Show world clocks
            <input type="checkbox" checked={showWorld} onChange={(event) => setShowWorld(event.target.checked)} />
          </label>
        </div>

        <div className="control-block">
          <label className="control-label full-width">
            Add timezone panel
            <div className="zone-pickers">
              <select value={zonePicker} onChange={(event) => setZonePicker(event.target.value)}>
                {timeZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.label} — {zone.tz}
                  </option>
                ))}
              </select>
              <button type="button" className="secondary" onClick={addZone}>
                Add
              </button>
            </div>
          </label>
        </div>
      </section>

      <main className="layout-grid">
        <article className="panel large-clock-panel">
          <div className="panel-header">
            <div>
              <span className="panel-tag">Primary clock</span>
              <h2>Local System Clock</h2>
            </div>
            <div className="panel-meta">{formatDigital(now, localZone.tz, true)} • {localZone.tz}</div>
          </div>

          <div className="clock-card">
            {showAnalog && (
              <div className="clock-face" style={{ '--scale': 0.9 }}>
                <div className="clock-ring">
                  {[...Array(12)].map((_, index) => (
                    <span key={index} className="tick" style={{ transform: `rotate(${index * 30}deg)` }} />
                  ))}
                  <div className="hand hour" style={{ transform: `rotate(${hourHand}deg)` }} />
                  <div className="hand minute" style={{ transform: `rotate(${minuteHand}deg)` }} />
                  <div className="hand second" style={{ transform: `rotate(${secondHand}deg)` }} />
                  <div className="clock-center" />
                </div>
              </div>
            )}

            {showDigital && (
              <div className="digital-panel">
                <div className="digital-row">
                  <div>
                    <span className="digital-label">Digital readout</span>
                    <strong>{formatDigital(now, localZone.tz, true)}</strong>
                  </div>
                  <div>
                    <span className="digital-label">UTC offset</span>
                    <strong>{Intl.DateTimeFormat('en-US', { timeZone: localZone.tz, timeZoneName: 'short' }).format(now)}</strong>
                  </div>
                </div>
                <div className="digital-description">
                  Live synchronization, smooth analog motion, and instant transition across the local system clock.
                </div>
              </div>
            )}
          </div>
        </article>

        <article className="panel metrics-panel">
          <div className="panel-header">
            <h2>Realtime diagnostics</h2>
          </div>
          <ul className="metric-list">
            <li>
              <span>Refresh cadence</span>
              <strong>1 second</strong>
            </li>
            <li>
              <span>Managed zones</span>
              <strong>{selectedZones.length + 1}</strong>
            </li>
            <li>
              <span>Active alarms</span>
              <strong>{alarms.length}</strong>
            </li>
          </ul>
        </article>
      </main>

      {activeAlert && (
        <section className="panel alert-panel">
          <div className="alert-content">
            <strong>Alarm fired:</strong>
            <span>{activeAlert.label}</span>
            <span>{activeAlert.zone}</span>
            <span>{activeAlert.time}</span>
          </div>
          <button type="button" className="secondary" onClick={dismissAlert}>
            Dismiss
          </button>
        </section>
      )}

      {showWorld && (
        <section className="panel world-panel">
          <div className="panel-header">
            <div>
              <span className="panel-tag">World clocks</span>
              <h2>Multi-region time cards</h2>
            </div>
            <p className="panel-note">Each zone updates live and can be removed to keep the dashboard concise.</p>
          </div>
          <div className="world-grid">
            {worldClocks.map(({ zone, parts, label }) => (
              <div key={zone.id} className="world-card">
                <div className="world-card-head">
                  <div>
                    <span className="zone-label">{zone.label}</span>
                    <strong>{zone.tz}</strong>
                  </div>
                  <button type="button" className="icon-button" onClick={() => removeZone(zone.id)}>
                    Remove
                  </button>
                </div>
                <div className="world-time">{label}</div>
                <div className="world-meta">
                  <span>HH:{formatTwo(parts.hours)}</span>
                  <span>MM:{formatTwo(parts.minutes)}</span>
                  <span>SS:{formatTwo(parts.seconds)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel timer-panel">
        <div className="panel-header">
          <div>
            <span className="panel-tag">Timer utility</span>
            <h2>Countdown timer</h2>
          </div>
          <p className="panel-note">A quick countdown for focused sessions, check-ins, or deadline alerts.</p>
        </div>

        <div className="timer-card">
          <div className="timer-display">{formatDuration(timerRemaining)}</div>
          <div className="timer-controls">
            <label>
              Label
              <input type="text" value={timerLabel} onChange={handleTimerLabelChange} />
            </label>
            <label>
              Duration
              <input type="time" step="1" value={timerInput} onChange={(event) => handleTimerInputChange(event.target.value)} />
            </label>
          </div>
          <div className="timer-actions">
            <button type="button" className="primary" onClick={handleStartTimer}>
              Start
            </button>
            <button type="button" className="secondary" onClick={handleToggleTimer}>
              {timerRunning ? 'Pause' : 'Resume'}
            </button>
            <button type="button" className="secondary" onClick={handleResetTimer}>
              Reset
            </button>
          </div>
          {timerAlert && (
            <div className="timer-alert">
              Timer finished: <strong>{timerAlert.label}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="panel alarm-panel">
        <div className="panel-header">
          <div>
            <span className="panel-tag">Alarm system</span>
            <h2>Zone-aware alarms</h2>
          </div>
          <p className="panel-note">Create multiple alarms tied to any supported timezone and stay ahead of global events.</p>
        </div>

        <form className="alarm-form" onSubmit={handleAlarmSubmit}>
          <label>
            Alarm label
            <input
              type="text"
              value={alarmForm.label}
              placeholder="E.g. Team standup"
              onChange={(event) => setAlarmForm((prev) => ({ ...prev, label: event.target.value }))}
            />
          </label>
          <label>
            Time zone
            <select value={alarmForm.zone} onChange={(event) => setAlarmForm((prev) => ({ ...prev, zone: event.target.value }))}>
              {timeZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label} — {zone.tz}
                </option>
              ))}
            </select>
          </label>
          <label>
            Alarm time
            <input
              type="time"
              value={alarmForm.time}
              onChange={(event) => setAlarmForm((prev) => ({ ...prev, time: event.target.value }))}
            />
          </label>
          <button type="submit" className="primary">
            Add alarm
          </button>
        </form>

        <div className="alarm-list">
          {alarms.length ? (
            alarms.map((alarm) => {
              const zone = zoneMap[alarm.zone]
              return (
                <div key={alarm.id} className="alarm-row">
                  <div>
                    <strong>{alarm.label}</strong>
                    <span>{zone?.label || 'Unknown'} • {alarm.time}</span>
                  </div>
                  <button type="button" className="secondary" onClick={() => removeAlarm(alarm.id)}>
                    Remove
                  </button>
                </div>
              )
            })
          ) : (
            <p className="empty-state">No alarms configured yet. Add one above to monitor a global event.</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
