#!/usr/bin/env python3
"""
Backend API test suite for STIG Portal Next.js API
Tests all endpoints with in-memory store and mock AI provider
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Base URL from environment
BASE_URL = "https://nextjs-job-builder.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_success(msg: str):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def log_error(msg: str):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def log_info(msg: str):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def log_warning(msg: str):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self):
        self.passed += 1
    
    def add_fail(self, error: str):
        self.failed += 1
        self.errors.append(error)
    
    def summary(self):
        total = self.passed + self.failed
        print("\n" + "="*80)
        print(f"TEST SUMMARY: {self.passed}/{total} passed")
        if self.errors:
            print(f"\n{Colors.RED}FAILURES:{Colors.END}")
            for i, error in enumerate(self.errors, 1):
                print(f"{i}. {error}")
        print("="*80)
        return self.failed == 0

results = TestResults()

def test_health():
    """Test 1: GET /api/health -> 200 with status, backend, ai fields"""
    log_info("Test 1: GET /api/health")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200, got {response.status_code}")
            results.add_fail(f"Health endpoint returned {response.status_code}")
            return
        
        data = response.json()
        
        # Check required fields
        if "status" not in data or data["status"] != "ok":
            log_error(f"Expected status='ok', got {data.get('status')}")
            results.add_fail("Health status field incorrect")
            return
        
        if "backend" not in data or data["backend"] != "memory":
            log_error(f"Expected backend='memory', got {data.get('backend')}")
            results.add_fail("Health backend field incorrect")
            return
        
        if "ai" not in data or data["ai"] != "mock":
            log_error(f"Expected ai='mock', got {data.get('ai')}")
            results.add_fail("Health ai field incorrect")
            return
        
        log_success(f"Health check passed: {data}")
        results.add_pass()
        
    except Exception as e:
        log_error(f"Health check failed: {str(e)}")
        results.add_fail(f"Health check exception: {str(e)}")

def test_requirements_list():
    """Test 2: GET /api/requirements -> 200, array of 8 requirements"""
    log_info("Test 2: GET /api/requirements")
    try:
        response = requests.get(f"{BASE_URL}/requirements", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200, got {response.status_code}")
            results.add_fail(f"Requirements list returned {response.status_code}")
            return None
        
        data = response.json()
        
        if not isinstance(data, list):
            log_error(f"Expected array, got {type(data)}")
            results.add_fail("Requirements list is not an array")
            return None
        
        if len(data) != 8:
            log_error(f"Expected 8 requirements, got {len(data)}")
            results.add_fail(f"Requirements count is {len(data)}, expected 8")
            return None
        
        # Check schema of first requirement
        req = data[0]
        required_fields = ["stigId", "title", "severity", "approvalStatus"]
        for field in required_fields:
            if field not in req:
                log_error(f"Missing field '{field}' in requirement")
                results.add_fail(f"Requirement missing field: {field}")
                return None
        
        log_success(f"Requirements list passed: {len(data)} requirements with correct schema")
        results.add_pass()
        return data
        
    except Exception as e:
        log_error(f"Requirements list failed: {str(e)}")
        results.add_fail(f"Requirements list exception: {str(e)}")
        return None

def test_requirement_by_id():
    """Test 3: GET /api/requirements/:stigId - valid and invalid IDs"""
    log_info("Test 3: GET /api/requirements/:stigId")
    
    # Test valid ID
    try:
        response = requests.get(f"{BASE_URL}/requirements/HRZN-8X-000010", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200 for valid ID, got {response.status_code}")
            results.add_fail(f"Valid requirement ID returned {response.status_code}")
            return None
        
        data = response.json()
        
        if data.get("stigId") != "HRZN-8X-000010":
            log_error(f"Expected stigId='HRZN-8X-000010', got {data.get('stigId')}")
            results.add_fail("Requirement stigId mismatch")
            return None
        
        log_success(f"Valid requirement fetch passed: {data.get('title')}")
        results.add_pass()
        
    except Exception as e:
        log_error(f"Valid requirement fetch failed: {str(e)}")
        results.add_fail(f"Valid requirement exception: {str(e)}")
        return None
    
    # Test invalid ID (should return 404)
    try:
        response = requests.get(f"{BASE_URL}/requirements/NOPE-000", timeout=10)
        
        if response.status_code != 404:
            log_error(f"Expected 404 for invalid ID, got {response.status_code}")
            results.add_fail(f"Invalid requirement ID returned {response.status_code}")
            return None
        
        log_success("Invalid requirement ID correctly returned 404")
        results.add_pass()
        return data
        
    except Exception as e:
        log_error(f"Invalid requirement test failed: {str(e)}")
        results.add_fail(f"Invalid requirement exception: {str(e)}")
        return None

def test_requirement_update():
    """Test 4: PUT /api/requirements/:stigId - update and verify persistence"""
    log_info("Test 4: PUT /api/requirements/:stigId")
    
    try:
        # Update the requirement
        update_data = {"status": "Applicable - Configurable"}
        response = requests.put(
            f"{BASE_URL}/requirements/HRZN-8X-000010",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_error(f"Expected 200 for PUT, got {response.status_code}")
            results.add_fail(f"Requirement update returned {response.status_code}")
            return
        
        updated = response.json()
        
        if updated.get("status") != "Applicable - Configurable":
            log_error(f"Expected status='Applicable - Configurable', got {updated.get('status')}")
            results.add_fail("Requirement status not updated")
            return
        
        # Verify id and stigId are preserved
        if updated.get("stigId") != "HRZN-8X-000010":
            log_error(f"stigId changed after update: {updated.get('stigId')}")
            results.add_fail("stigId not preserved after update")
            return
        
        if "id" not in updated:
            log_error("id field missing after update")
            results.add_fail("id field not preserved after update")
            return
        
        log_success(f"Requirement update passed: status={updated.get('status')}")
        
        # Verify persistence by fetching again
        response = requests.get(f"{BASE_URL}/requirements/HRZN-8X-000010", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200 for GET after PUT, got {response.status_code}")
            results.add_fail("Failed to fetch requirement after update")
            return
        
        fetched = response.json()
        
        if fetched.get("status") != "Applicable - Configurable":
            log_error(f"Status not persisted: {fetched.get('status')}")
            results.add_fail("Requirement update not persisted")
            return
        
        log_success("Requirement update persisted correctly")
        results.add_pass()
        
    except Exception as e:
        log_error(f"Requirement update failed: {str(e)}")
        results.add_fail(f"Requirement update exception: {str(e)}")

def test_comments():
    """Test 5: GET/POST /api/requirements/:stigId/comments"""
    log_info("Test 5: GET/POST /api/requirements/:stigId/comments")
    
    try:
        # GET comments for HRZN-8X-000080 (should have seeded comments)
        response = requests.get(f"{BASE_URL}/requirements/HRZN-8X-000080/comments", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200 for GET comments, got {response.status_code}")
            results.add_fail(f"Get comments returned {response.status_code}")
            return
        
        comments = response.json()
        
        if not isinstance(comments, list):
            log_error(f"Expected array, got {type(comments)}")
            results.add_fail("Comments is not an array")
            return
        
        initial_count = len(comments)
        log_success(f"GET comments passed: {initial_count} existing comments")
        
        # POST a new comment
        new_comment = {
            "author": "Test User",
            "initials": "TU",
            "role": "Author",
            "text": "automated test note"
        }
        
        response = requests.post(
            f"{BASE_URL}/requirements/HRZN-8X-000080/comments",
            json=new_comment,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code != 201:
            log_error(f"Expected 201 for POST comment, got {response.status_code}")
            results.add_fail(f"Post comment returned {response.status_code}")
            return
        
        created = response.json()
        
        if "time" not in created:
            log_error("Created comment missing 'time' field")
            results.add_fail("Comment missing time field")
            return
        
        if created.get("text") != "automated test note":
            log_error(f"Comment text mismatch: {created.get('text')}")
            results.add_fail("Comment text not saved correctly")
            return
        
        log_success(f"POST comment passed: {created}")
        
        # GET comments again to verify it was appended
        response = requests.get(f"{BASE_URL}/requirements/HRZN-8X-000080/comments", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200 for GET comments after POST, got {response.status_code}")
            results.add_fail("Failed to fetch comments after POST")
            return
        
        comments = response.json()
        
        if len(comments) != initial_count + 1:
            log_error(f"Expected {initial_count + 1} comments, got {len(comments)}")
            results.add_fail("Comment not appended to list")
            return
        
        # Check if our comment is in the list
        found = any(c.get("text") == "automated test note" for c in comments)
        if not found:
            log_error("Posted comment not found in list")
            results.add_fail("Posted comment not in list")
            return
        
        log_success("Comment appended and persisted correctly")
        results.add_pass()
        
    except Exception as e:
        log_error(f"Comments test failed: {str(e)}")
        results.add_fail(f"Comments exception: {str(e)}")

def test_projects():
    """Test 6: GET /api/projects, GET /api/projects/:id, PUT /api/projects/:id"""
    log_info("Test 6: GET/PUT /api/projects")
    
    try:
        # GET all projects
        response = requests.get(f"{BASE_URL}/projects", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200 for GET projects, got {response.status_code}")
            results.add_fail(f"Get projects returned {response.status_code}")
            return
        
        projects = response.json()
        
        if not isinstance(projects, list):
            log_error(f"Expected array, got {type(projects)}")
            results.add_fail("Projects is not an array")
            return
        
        if len(projects) != 5:
            log_error(f"Expected 5 projects, got {len(projects)}")
            results.add_fail(f"Projects count is {len(projects)}, expected 5")
            return
        
        log_success(f"GET projects passed: {len(projects)} projects")
        
        # GET specific project
        response = requests.get(f"{BASE_URL}/projects/horizon", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200 for GET project by ID, got {response.status_code}")
            results.add_fail(f"Get project by ID returned {response.status_code}")
            return
        
        project = response.json()
        
        if project.get("id") != "horizon":
            log_error(f"Expected id='horizon', got {project.get('id')}")
            results.add_fail("Project ID mismatch")
            return
        
        log_success(f"GET project by ID passed: {project.get('name')}")
        
        # PUT update project
        update_data = {"lead": "QA Bot"}
        response = requests.put(
            f"{BASE_URL}/projects/horizon",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_error(f"Expected 200 for PUT project, got {response.status_code}")
            results.add_fail(f"Update project returned {response.status_code}")
            return
        
        updated = response.json()
        
        if updated.get("lead") != "QA Bot":
            log_error(f"Expected lead='QA Bot', got {updated.get('lead')}")
            results.add_fail("Project lead not updated")
            return
        
        log_success(f"PUT project passed: lead={updated.get('lead')}")
        results.add_pass()
        
    except Exception as e:
        log_error(f"Projects test failed: {str(e)}")
        results.add_fail(f"Projects exception: {str(e)}")

def test_reference_endpoints():
    """Test 7: Reference endpoints return 200 arrays/objects"""
    log_info("Test 7: Reference endpoints")
    
    endpoints = [
        "/srg-tree",
        "/ccis",
        "/cci-audit",
        "/duplicate-clusters",
        "/audit-log",
        "/enums"
    ]
    
    all_passed = True
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            
            if response.status_code != 200:
                log_error(f"GET {endpoint} returned {response.status_code}")
                results.add_fail(f"Reference endpoint {endpoint} returned {response.status_code}")
                all_passed = False
                continue
            
            data = response.json()
            log_success(f"GET {endpoint} passed: {type(data).__name__}")
            
        except Exception as e:
            log_error(f"GET {endpoint} failed: {str(e)}")
            results.add_fail(f"Reference endpoint {endpoint} exception: {str(e)}")
            all_passed = False
    
    if all_passed:
        results.add_pass()

def test_requirement_derived_data():
    """Test 8: GET /api/requirements/:stigId/srg-detail and /testing"""
    log_info("Test 8: GET /api/requirements/:stigId/srg-detail and /testing")
    
    try:
        # Test srg-detail
        response = requests.get(f"{BASE_URL}/requirements/r-260101/srg-detail", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200 for srg-detail, got {response.status_code}")
            results.add_fail(f"SRG detail returned {response.status_code}")
            return
        
        srg_detail = response.json()
        log_success(f"GET srg-detail passed: {type(srg_detail).__name__}")
        
        # Test testing endpoint
        response = requests.get(f"{BASE_URL}/requirements/r-260101/testing", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200 for testing, got {response.status_code}")
            results.add_fail(f"Testing endpoint returned {response.status_code}")
            return
        
        testing = response.json()
        log_success(f"GET testing passed: {type(testing).__name__}")
        results.add_pass()
        
    except Exception as e:
        log_error(f"Derived data test failed: {str(e)}")
        results.add_fail(f"Derived data exception: {str(e)}")

def test_ai_similar_verbiage():
    """Test 9: POST /api/ai/similar-verbiage"""
    log_info("Test 9: POST /api/ai/similar-verbiage")
    
    try:
        request_data = {
            "field": "check",
            "text": "verify TLS 1.2 configuration",
            "excludeStigId": "HRZN-8X-000040"
        }
        
        response = requests.post(
            f"{BASE_URL}/ai/similar-verbiage",
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_error(f"Expected 200, got {response.status_code}")
            results.add_fail(f"Similar verbiage returned {response.status_code}")
            return
        
        data = response.json()
        
        if not isinstance(data, list):
            log_error(f"Expected array, got {type(data)}")
            results.add_fail("Similar verbiage is not an array")
            return
        
        if len(data) > 3:
            log_error(f"Expected up to 3 results, got {len(data)}")
            results.add_fail(f"Similar verbiage returned {len(data)} results, expected max 3")
            return
        
        # Check schema
        if data:
            item = data[0]
            required_fields = ["stigId", "title", "value", "confidence"]
            for field in required_fields:
                if field not in item:
                    log_error(f"Missing field '{field}' in result")
                    results.add_fail(f"Similar verbiage missing field: {field}")
                    return
            
            # Verify excluded stigId is not present
            excluded_present = any(item.get("stigId") == "HRZN-8X-000040" for item in data)
            if excluded_present:
                log_error("Excluded stigId found in results")
                results.add_fail("Similar verbiage included excluded stigId")
                return
            
            # Verify sorted by confidence desc
            confidences = [item.get("confidence", 0) for item in data]
            if confidences != sorted(confidences, reverse=True):
                log_error(f"Results not sorted by confidence: {confidences}")
                results.add_fail("Similar verbiage not sorted by confidence")
                return
        
        log_success(f"POST similar-verbiage passed: {len(data)} results, sorted by confidence")
        results.add_pass()
        
    except Exception as e:
        log_error(f"Similar verbiage test failed: {str(e)}")
        results.add_fail(f"Similar verbiage exception: {str(e)}")

def test_ai_cci_suggestions():
    """Test 10: GET /api/ai/cci-suggestions"""
    log_info("Test 10: GET /api/ai/cci-suggestions")
    
    try:
        response = requests.get(f"{BASE_URL}/ai/cci-suggestions", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200, got {response.status_code}")
            results.add_fail(f"CCI suggestions returned {response.status_code}")
            return
        
        data = response.json()
        
        if not isinstance(data, list):
            log_error(f"Expected array, got {type(data)}")
            results.add_fail("CCI suggestions is not an array")
            return
        
        log_success(f"GET cci-suggestions passed: {len(data)} AI findings")
        results.add_pass()
        
    except Exception as e:
        log_error(f"CCI suggestions test failed: {str(e)}")
        results.add_fail(f"CCI suggestions exception: {str(e)}")

def test_cors_preflight():
    """Test 11: OPTIONS /api/health -> 200 (CORS preflight)"""
    log_info("Test 11: OPTIONS /api/health (CORS preflight)")
    
    try:
        response = requests.options(f"{BASE_URL}/health", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200, got {response.status_code}")
            results.add_fail(f"CORS preflight returned {response.status_code}")
            return
        
        # Check CORS headers
        headers = response.headers
        if "Access-Control-Allow-Origin" not in headers:
            log_warning("Missing Access-Control-Allow-Origin header")
        
        if "Access-Control-Allow-Methods" not in headers:
            log_warning("Missing Access-Control-Allow-Methods header")
        
        log_success(f"OPTIONS preflight passed: {response.status_code}")
        results.add_pass()
        
    except Exception as e:
        log_error(f"CORS preflight test failed: {str(e)}")
        results.add_fail(f"CORS preflight exception: {str(e)}")

def main():
    print("\n" + "="*80)
    print("STIG Portal API Backend Test Suite")
    print(f"Base URL: {BASE_URL}")
    print("="*80 + "\n")
    
    # Run all tests
    test_health()
    test_requirements_list()
    test_requirement_by_id()
    test_requirement_update()
    test_comments()
    test_projects()
    test_reference_endpoints()
    test_requirement_derived_data()
    test_ai_similar_verbiage()
    test_ai_cci_suggestions()
    test_cors_preflight()
    
    # Print summary
    success = results.summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
