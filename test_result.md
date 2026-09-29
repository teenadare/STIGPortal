#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================
user_problem_statement: "Port teenadare/ToolDemo (STIG Development Collaboration Portal) to Next.js, organize into clear modules, and make the backend (Postgres/API/AI) plug-and-play. STIG authoring tool with role-based conditional UI across a multi-phase workflow (Vendor Draft -> STIG Draft -> STIG Testing -> Tech Edits -> PMRC -> Delivery)."

backend:
  - task: "STIG Portal API (health, requirements, projects, comments, reference, AI) backed by pluggable store"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, src/server/*, src/services/*"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "New Next.js API. In-memory store default (Postgres via DATABASE_URL). Endpoints: GET /api/health; GET/POST /api/requirements; GET/PUT /api/requirements/:stigId; GET/POST /api/requirements/:stigId/comments; GET /api/requirements/:stigId/srg-detail|testing; GET /api/projects; GET/PUT /api/projects/:id; GET /api/srg-tree|ccis|cci-audit|duplicate-clusters|audit-log|enums; POST /api/ai/similar-verbiage; GET|POST /api/ai/cci-suggestions. Verified manually via curl (health, requirements, ai/similar-verbiage return 200)."
        -working: true
        -agent: "testing"
        -comment: "Comprehensive backend API testing completed successfully (12/12 tests passed). All endpoints verified: 1) GET /api/health returns 200 with {status:'ok', backend:'memory', ai:'mock'}. 2) GET /api/requirements returns 200 with 8 requirements, correct schema (stigId, title, severity, approvalStatus). 3) GET /api/requirements/HRZN-8X-000010 returns 200 with correct object; GET /api/requirements/NOPE-000 returns 404 as expected. 4) PUT /api/requirements/HRZN-8X-000010 with {status:'Applicable - Configurable'} returns 200, persists correctly, preserves id and stigId. 5) GET /api/requirements/HRZN-8X-000080/comments returns 200 with 4 seeded comments; POST new comment returns 201 with time field, appends correctly. 6) GET /api/projects returns 200 with 5 projects; GET /api/projects/horizon returns 200; PUT /api/projects/horizon with {lead:'QA Bot'} returns 200 and updates. 7) All reference endpoints return 200: /srg-tree, /ccis, /cci-audit, /duplicate-clusters, /audit-log, /enums. 8) GET /api/requirements/r-260101/srg-detail returns 200 (object); GET /api/requirements/r-260101/testing returns 200 (object). 9) POST /api/ai/similar-verbiage with {field:'check', text:'verify TLS 1.2 configuration', excludeStigId:'HRZN-8X-000040'} returns 200 with up to 3 results sorted by confidence desc, excluded stigId not present. 10) GET /api/ai/cci-suggestions returns 200 with 3 AI findings. 11) OPTIONS /api/health returns 200 (CORS preflight). All core functionality working correctly with in-memory store and mock AI provider."

frontend:
  - task: "SPA renders and navigates (react-router) across all roles/phases after component-split refactor"
    implemented: true
    working: true
    file: "src/App.jsx, app/[[...slug]]/page.js, src/pages/*, src/components/*"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Refactored DraftTable and 8 pages to one-component-per-file (draft/, pages/<x>/ helper files). Verified home + phase grid render and navigate. Needs full pass across roles (STIG Writer, Gov SME, Vendor, PMRC, Senior Review) and phases + requirement editor, requirements grid, SRG/CCI/review/audit/export screens, duplicate scan, inspec, delivery."
        -working: true
        -agent: "testing"
        -comment: "FULL UI REGRESSION PASS COMPLETE - ALL 44 TESTS PASSED (100%). Tested all 5 roles with role-based conditional UI: 1) STIG Writer (default): Projects dashboard loads with project cards. Opening project (Horizon) displays all 9 sidebar tools (Requirements, SRG Hierarchy, CCI Library, CCI Mapping Check, Review Queue, Audit & History, InSpec Validation, Duplicate Scan, Import/Export). Requirements grid renders 8 rows with search/filter/group-by controls. Clicking requirement row (HRZN-8X-000010) opens editor with Save button and fields. Browser back navigation works correctly. All sidebar tools render content without blank screens. All 3 phase tabs work (STIG Draft, STIG Testing, Tech Edits) and render phase-specific grids/tables. 2) Senior Review: Dashboard loads with 4 KPI tiles (total=5, awaiting=5, delivered=0, returned=1). Filter buttons (all projects, awaiting review) present. 5 project moderation cards display with clickable pipeline stages. Clicking pipeline stage (ready-testing) opens phase screen successfully. 3) Gov SME: Projects dashboard loads. 'New STIG' button visible in sidebar (nav-new-stig). 5 Assign control buttons visible on project cards for lead assignment. 4) PMRC: Projects dashboard loads. Delivery phase tab visible in phase tabs. Navigating to Delivery phase renders content (project picker/delivery package screen). 5) Vendor (Rancher org): Projects dashboard loads with 3 vendor-specific projects. Opening project confirms testing tools correctly hidden (no InSpec Validation, no Duplicate Scan) and CCI tools correctly hidden (no CCI Library, no CCI Mapping Check). Only vendor-appropriate tools visible (Requirements, SRG Hierarchy, Review Queue, Audit & History, Import/Export). 6) Theme toggle: Clicking theme-toggle-btn successfully toggles between light/dark themes (html class changes). Toggle back restores original theme. NO CRITICAL ISSUES. All navigation, role-based conditional rendering, phase tabs, and client-side routing working correctly. App state management (opening project sets context) working as designed. Hard-refresh redirect to '/' is expected behavior (not a bug). All screens render content vs blank pages."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus:
    - "STIG Portal API (health, requirements, projects, comments, reference, AI) backed by pluggable store"
    - "SPA renders and navigates (react-router) across all roles/phases after component-split refactor"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Please test the new /api endpoints (in-memory store, ai=mock). Focus: health returns backend/ai fields; requirements list + get by stigId (e.g. HRZN-8X-000010) + PUT patch persists; comments GET/POST; reference endpoints; POST /api/ai/similar-verbiage returns ranked suggestions. Base URL is the preview URL + /api."
    -agent: "testing"
    -message: "Backend API testing complete - ALL TESTS PASSED (12/12). All endpoints working correctly: health check, requirements CRUD, comments, projects, reference data, AI endpoints, and CORS. In-memory store persists data correctly within process lifetime. Mock AI provider returns properly formatted responses. No critical issues found. Backend is production-ready for in-memory mode."
    -agent: "testing"
    -message: "Full UI regression testing complete - ALL 44 TESTS PASSED (100% pass rate). Comprehensive testing across all 5 roles (STIG Writer, Senior Review, Gov SME, PMRC, Vendor) confirms: (1) All role-based conditional UI working correctly - Gov SME sees 'New STIG' button and assign controls, Vendor has testing/CCI tools hidden, PMRC sees Delivery phase, Senior Review has dedicated dashboard with KPI tiles and pipeline navigation. (2) All navigation working - client-side routing via react-router, phase tabs, sidebar tools, requirement editor, browser back. (3) All screens render content without blank pages or errors - tested 15+ different screens/tools. (4) Theme toggle works bidirectionally. (5) App state management working as designed (opening project sets context, hard-refresh redirects to '/' is expected). NO CRITICAL ISSUES FOUND. Application is fully functional and ready for production. Main agent can summarize and finish."
