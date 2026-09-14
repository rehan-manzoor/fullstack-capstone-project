# GiftLink – User Stories

> **Project:** fullstack-capstone-project  
> **Repo:** https://github.com/mrusman24/fullstack-capstone-project  
> **Sprint Plan:** Module 1 – GiftLink Capstone

---

## Story 1 – Finish User Stories
**Label:** `backlog` | **Type:** `enhancement`

**As a** project manager  
**I need** a complete set of well-defined user stories on the Kanban board  
**So that** the development team has clear, sprint-ready work items to execute against

### Details and Assumptions
* User stories follow the GitHub issue template format
* All stories must have acceptance criteria in Gherkin format
* Stories are labeled `new`, then triaged to `backlog` or `icebox`

### Acceptance Criteria

```gherkin
Given I am a team member viewing the GitHub issues board
When I open any user story issue
Then I see the role, function, benefit, assumptions, and Gherkin acceptance criteria filled in
  And the story has at least one label applied
```

---

## Story 2 – Initialize and Populate MongoDB
**Label:** `backlog` | **Type:** `enhancement`

**As a** backend developer  
**I need** a MongoDB database initialized and populated with gift listing data  
**So that** the application has data to serve via its API endpoints

### Details and Assumptions
* MongoDB Atlas or a local MongoDB instance can be used
* An initial dataset of gift listings should be seeded
* Connection string is stored in a `.env` file (never committed to git)

### Acceptance Criteria

```gherkin
Given the backend service is running
When the application connects to MongoDB
Then the connection is successful without errors
  And querying the gifts collection returns at least 5 sample gift items
```

---

## Story 3 – Run Skeleton Application
**Label:** `backlog` | **Type:** `enhancement`

**As a** developer  
**I need** the skeleton application (frontend + backend) to run locally without errors  
**So that** I have a working baseline to build new features on top of

### Details and Assumptions
* The repo has `giftlink-backend` and `giftlink-frontend` directories
* `npm install` and `npm start` (or `npm run dev`) should work in both directories
* No business logic is expected at this stage, just the scaffold running

### Acceptance Criteria

```gherkin
Given I have cloned the repository and run npm install
When I start the backend with npm start
Then the Express server starts on the configured port without errors

Given the backend is running
When I start the frontend with npm start
Then the React app compiles and loads in the browser at http://localhost:3000
```

---

## Story 4 – Implement a Landing Page and Navigation
**Label:** `backlog` | **Type:** `enhancement`

**As a** site visitor  
**I need** a home/landing page with a navigation bar  
**So that** I can understand what GiftLink is about and navigate to other sections of the app

### Details and Assumptions
* Navigation bar should include links to: Home, Listings, Login, Register
* Landing page should display a hero section describing the app's purpose
* Responsive design is expected

### Acceptance Criteria

```gherkin
Given I visit the root URL of the application
When the page loads
Then I see a navigation bar with links to Home, Listings, Login, and Register
  And I see a hero section with a headline and brief description of GiftLink

Given I click any navigation link
When the link is clicked
Then I am taken to the correct route without a full page reload
```

---

## Story 5 – Add Authentication Components and Logic
**Label:** `backlog` | **Type:** `enhancement`

**As a** new user  
**I need** to register and log in to the application  
**So that** I can access features that require an authenticated session

### Details and Assumptions
* Registration requires: first name, last name, email, password
* Login requires: email and password
* JWT tokens are used for session management
* Passwords must be hashed before storage (bcrypt)

### Acceptance Criteria

```gherkin
Given I am on the registration page
When I fill in valid details and submit the form
Then my account is created
  And I am redirected to the home page as a logged-in user

Given I am on the login page
When I submit valid credentials
Then I receive a JWT token
  And I am redirected to the home page as an authenticated user

Given I submit invalid login credentials
When the form is submitted
Then I see a descriptive error message
  And I am not logged in
```

---

## Story 6 – Implement Gifts Details Page
**Label:** `backlog` | **Type:** `enhancement`

**As a** site visitor  
**I need** to view the full details of a specific gift listing  
**So that** I can decide whether I want to claim that item

### Details and Assumptions
* Clicking a listing from the Listings page navigates to a Details page
* Details page shows: name, category, condition, description, posted date, and user comments
* The API endpoint GET /api/gifts/:id is used to fetch data

### Acceptance Criteria

```gherkin
Given I am on the Listings page
When I click on a gift item
Then I am navigated to the details page for that specific gift
  And I can see the item's name, condition, category, and description

Given I am on a gift details page
When the page loads
Then any existing comments for that item are displayed
```

---

## Story 7 – Implement a Search Component
**Label:** `icebox` | **Type:** `enhancement`

**As a** user browsing gift listings  
**I need** to search and filter listings by name, category, and condition  
**So that** I can quickly find items that match my interests

### Details and Assumptions
* Search is implemented on the Listings page
* Multiple filters can be applied simultaneously
* Search is backed by a GET /api/gifts/search endpoint with query parameters

### Acceptance Criteria

```gherkin
Given I am on the Listings page
When I type a keyword in the search box
Then only listings matching that keyword are displayed

Given I apply a category filter
When the filter is selected
Then only listings in that category are shown
  And I can combine it with other filters simultaneously
```

---

## Story 8 – Design and Implement the Comments Feature
**Label:** `icebox` | **Type:** `enhancement`

**As an** authenticated user  
**I need** to post comments on gift listings  
**So that** I can express interest in an item or ask the donor questions

### Details and Assumptions
* Only logged-in users can post comments
* Comments include: username, comment text, and a timestamp
* Sentiment analysis is run on comments using the /sentiment service
* Sentiment result (positive/negative/neutral) is stored with the comment

### Acceptance Criteria

```gherkin
Given I am logged in and viewing a gift details page
When I type a comment and click submit
Then my comment appears in the comments section with my username and timestamp

Given I submit a comment
When the sentiment service processes it
Then the sentiment label (positive/negative/neutral) is displayed next to my comment

Given I am not logged in
When I try to submit a comment
Then I see a message telling me to log in first
```

---

## Story 9 – Containerize the Services and Applications
**Label:** `icebox` | **Type:** `enhancement`

**As a** DevOps engineer  
**I need** to containerize the backend, frontend, and sentiment service using Docker  
**So that** the application can be consistently deployed across any environment

### Details and Assumptions
* A Dockerfile is created for each service
* A docker-compose.yml is used to orchestrate all services locally
* Environment variables are injected at runtime via .env files

### Acceptance Criteria

```gherkin
Given I have Docker installed
When I run docker-compose up
Then all three services (backend, frontend, sentiment) start successfully
  And the application is accessible at http://localhost:3000

Given the containers are running
When I make an API request to the backend
Then the response is correct and the database is connected
```

---

## Story 10 – Deploy Backend and Frontend
**Label:** `icebox` | **Type:** `enhancement`

**As a** product owner  
**I need** the application deployed to a cloud platform  
**So that** end users can access GiftLink from anywhere via a public URL

### Details and Assumptions
* Deployment targets: IBM Code Engine or Kubernetes cluster
* GitHub Actions CI/CD pipeline triggers on push to main
* Production environment variables are set in the cloud platform config

### Acceptance Criteria

```gherkin
Given a commit is pushed to the main branch
When the GitHub Actions pipeline runs
Then the application is built and deployed automatically

Given the deployment succeeds
When I navigate to the public URL
Then the full GiftLink application is accessible and functional
```

---

## Technical Debt Story – Research Authentication in React and Express
**Label:** `technical debt`

**As a** developer  
**I need** to research best practices for JWT authentication in React and Express  
**So that** the authentication implementation is secure, scalable, and follows industry standards

### Details and Assumptions
* Research should cover: JWT token storage (localStorage vs. cookies), token refresh strategy, protected routes in React
* Findings should be documented in a brief tech note before implementation

### Acceptance Criteria

```gherkin
Given the research is complete
When I review the findings document
Then it covers JWT storage, token expiry, Express middleware, and React route protection
  And a recommended approach is clearly stated
```

---

## Backlog Triage Summary

| Story | Title | Label |
|---|---|---|
| 1 | Finish user stories | `backlog` |
| 2 | Initialize and populate MongoDB | `backlog` |
| 3 | Run skeleton application | `backlog` |
| 4 | Implement a landing page and navigation | `backlog` |
| 5 | Add authentication components and logic | `backlog` |
| 6 | Implement Gifts details page | `backlog` |
| 7 | Implement a search component | `icebox` |
| 8 | Design and implement the comments feature | `icebox` |
| 9 | Containerize the services and applications | `icebox` |
| 10 | Deploy backend and frontend | `icebox` |
| TD | Research authentication in React and Express | `technical debt` |
