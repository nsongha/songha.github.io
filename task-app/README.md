# TaskFlow - Minimal Task Management MVP

A lightweight, focused task management application designed for speed and simplicity.

## Features

### Phase 1 MVP (Completed)

- **Dashboard** - Real-time overview with key metrics
  - Total tasks, in progress, completed, blocked
  - Completion rate
  - Visual progress bars
  - Blocked tasks alerts
  - Overdue tasks alerts

- **Kanban Board** - Drag-and-drop task management
  - 4 columns: To Do, In Progress, Done, Blocked
  - Simple drag-and-drop to update status
  - Task cards with priority badges
  - Due date tracking
  - Blocker reasons displayed

- **Daily Report** - Auto-generated standup reports
  - Completed yesterday
  - In progress today
  - Current blockers
  - Quick summary

- **Clean UI** - Minimal, fast, intuitive
  - No feature bloat
  - < 1 second page loads
  - Mobile responsive
  - Clear visual hierarchy

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Utilities**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd task-app
```

2. Install dependencies (already done):
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open your browser:
```
http://localhost:3000
```

## Project Structure

```
task-app/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── tasks/            # Kanban board page
│   ├── daily-report/     # Daily report page
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Basic UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── task/             # Task-related components
│   │   ├── task-card.tsx
│   │   └── kanban-board.tsx
│   ├── dashboard/        # Dashboard components
│   │   ├── dashboard-overview.tsx
│   │   ├── metrics-card.tsx
│   │   └── daily-report.tsx
│   └── layout/           # Layout components
│       ├── navbar.tsx
│       └── main-layout.tsx
├── lib/
│   ├── types/            # TypeScript types
│   ├── stores/           # Zustand stores
│   └── utils/            # Utilities & mock data
└── public/               # Static assets
```

## Features Details

### Dashboard
- **Metrics Cards**: Total, In Progress, Completed, Blocked tasks
- **Visual Alerts**: Highlighted blocked and overdue tasks
- **Progress Bars**: Visual distribution of tasks by status
- **Real-time Updates**: Instant metrics update when tasks change

### Kanban Board
- **Drag & Drop**: Move tasks between columns instantly
- **Priority Badges**: High, Medium, Low visual indicators
- **Due Dates**: Clear display with overdue warnings
- **Blocker Info**: Red highlighted blockers with reasons
- **Assignee**: Avatar and name on each task

### Daily Report
- **Auto-generated**: No manual effort required
- **3 Sections**: Completed yesterday, In progress today, Blockers
- **Color-coded**: Green (done), Blue (progress), Red (blocked)
- **Summary**: Quick stats at bottom

## Mock Data

Currently using mock data in `lib/utils/mock-data.ts`:
- 4 mock users (Admin, Manager, 2 Members)
- 2 mock projects
- 8 sample tasks with various statuses

## Next Steps

### Phase 2 - Core Features (Planned)
- [ ] Weekly reports with trends
- [ ] Problem detection & alerts
- [ ] Projects/Sprints management
- [ ] Team management
- [ ] Real database integration (PostgreSQL + Prisma)

### Phase 3 - Integrations (Planned)
- [ ] Slack notifications
- [ ] Email reports
- [ ] Calendar sync
- [ ] Webhook API

## Design Principles

1. **Minimal** - Only essential features
2. **Fast** - < 1 second page loads
3. **Simple** - No training required
4. **Focused** - Task tracking & reporting only
5. **Clean** - White space, clear typography

## Performance

- Dashboard loads: < 1 second
- Page transitions: Instant
- Task updates: Real-time
- Mobile responsive: Yes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private project

## Author

Built based on comprehensive research of user needs and pain points in existing PM tools.
