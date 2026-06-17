"""Selenium test cases for CiviFix"""
import pytest
import logging
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from conftest import TestConfig
from auth_pages import LoginPage, SignupPage
from complaint_pages import CitizenDashboardPage, ComplaintCreationPage, ComplaintDetailPage
from role_pages import InspectorDashboardPage, InspectorComplaintDetailPage, WorkerDashboardPage, WorkerComplaintDetailPage

logger = logging.getLogger(__name__)


class TestAuthentication:
    """Authentication test cases"""
    
    @pytest.mark.parametrize("email,expected_result", [
        (TestConfig.TEST_CITIZEN_EMAIL, "success"),
        ("", "error"),
        ("invalid-email", "error"),
    ])
    def test_login_scenarios(self, driver, test_context, email, expected_result):
        """Test various login scenarios"""
        test_context['test_id'] = "AUTH_001"
        test_context['scenario'] = f"Login with {email or 'empty email'}"
        
        login_page = LoginPage(driver, TestConfig)
        login_page.navigate_to(f"{TestConfig.FRONTEND_URL}/login")
        
        try:
            login_page.login_with_email(email)
            
            if expected_result == "success":
                # Wait for OTP step to appear
                login_page.wait_for_element_visible(login_page.OTP_INPUTS)
                test_context['actual_result'] = "OTP step shown"
                test_context['status'] = "PASS"
            else:
                error_msg = login_page.get_error_message()
                if error_msg:
                    test_context['actual_result'] = f"Error shown: {error_msg}"
                    test_context['status'] = "PASS"
                else:
                    test_context['actual_result'] = "No validation or error shown"
                    test_context['status'] = "FAIL"
            
            login_page.screenshot(f"test_login_{email or 'blank'}_{test_context['status']}.png")
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"
            logger.error(f"Login test failed: {str(e)}")
    
    def test_signup_new_user(self, driver, test_context):
        """Test user signup"""
        test_context['test_id'] = "AUTH_002"
        test_context['scenario'] = "Signup new user"
        
        signup_page = SignupPage(driver, TestConfig)
        signup_page.navigate_to(f"{TestConfig.FRONTEND_URL}/signup")
        
        try:
            # Generate unique email for test
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            test_email = f"test_user_{timestamp}@civifix.local"
            
            signup_page.signup_step_one(
                name="Test User",
                email=test_email,
                mobile="9876543210"
            )
            
            # Wait for step 2 to appear
            signup_page.wait_for_element_visible(signup_page.ADDRESS_INPUT)
            
            signup_page.signup_step_two(
                address="123 Test Address, Chennai",
                district="Chennai",
                ward="Ward 1"
            )
            
            # Wait for OTP inputs on signup page
            signup_page.wait_for_element_visible(signup_page.OTP_INPUTS)
            test_context['actual_result'] = "Signup OTP screen shown"
            test_context['status'] = "PASS"
            signup_page.screenshot(f"test_signup_{test_context['status']}.png")
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"
            logger.error(f"Signup test failed: {str(e)}")
    
    def test_otp_verification(self, driver, test_context):
        """Test OTP verification"""
        test_context['test_id'] = "AUTH_003"
        test_context['scenario'] = "OTP Verification"
        
        login_page = LoginPage(driver, TestConfig)
        login_page.navigate_to(f"{TestConfig.FRONTEND_URL}/login")
        
        try:
            login_page.login_with_email(TestConfig.TEST_CITIZEN_EMAIL)
            login_page.verify_otp(TestConfig.TEST_OTP)
            
            login_page.wait_for_url_change(f"{TestConfig.FRONTEND_URL}/login")
            current_url = login_page.get_current_url()
            if "dashboard" in current_url:
                test_context['actual_result'] = "OTP verified successfully"
                test_context['status'] = "PASS"
            else:
                error_msg = login_page.get_error_message()
                test_context['actual_result'] = error_msg or "Verification failed"
                test_context['status'] = "FAIL"
            
            login_page.screenshot(f"test_otp_verification_{test_context['status']}.png")
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"


class TestCitizenWorkflows:
    """Citizen workflow test cases"""
    
    def test_citizen_dashboard_access(self, driver, test_context):
        """Test citizen dashboard access"""
        test_context['test_id'] = "CITIZEN_001"
        test_context['scenario'] = "Dashboard Access"
        
        login_page = LoginPage(driver, TestConfig)
        login_page.navigate_to(f"{TestConfig.FRONTEND_URL}/login")
        
        try:
            login_page.login_with_email(TestConfig.TEST_CITIZEN_EMAIL)
            login_page.verify_otp(TestConfig.TEST_OTP)
            
            login_page.wait_for_url_change(f"{TestConfig.FRONTEND_URL}/login")
            
            dashboard = CitizenDashboardPage(driver, TestConfig)
            
            if dashboard.is_dashboard_loaded():
                test_context['actual_result'] = "Dashboard loaded successfully"
                test_context['status'] = "PASS"
                complaints_count = dashboard.get_total_complaints_count()
                test_context['remarks'] = f"Total complaints: {complaints_count}"
            else:
                test_context['actual_result'] = "Dashboard failed to load"
                test_context['status'] = "FAIL"
            
            dashboard.screenshot(f"test_citizen_dashboard_{test_context['status']}.png")
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"
            logger.error(f"Dashboard test failed: {str(e)}")
    
    def test_create_complaint(self, driver, test_context):
        """Test complaint creation"""
        test_context['test_id'] = "CITIZEN_002"
        test_context['scenario'] = "Create Complaint"
        
        # First login
        login_page = LoginPage(driver, TestConfig)
        login_page.navigate_to(f"{TestConfig.FRONTEND_URL}/login")
        login_page.login_with_email(TestConfig.TEST_CITIZEN_EMAIL)
        login_page.wait_for_otp_inputs()
        login_page.verify_otp(TestConfig.TEST_OTP)
        
        login_page.wait_for_url_change(f"{TestConfig.FRONTEND_URL}/login")
        
        import time
        time.sleep(2)
        
        # Navigate to complaint creation
        driver.get(f"{TestConfig.FRONTEND_URL}/complaints/create")
        time.sleep(2)
        
        complaint_page = ComplaintCreationPage(driver, TestConfig)
        
        try:
            complaint_page.submit_complaint(
                complaint_type="ROAD_DAMAGE",
                description="There is a large pothole affecting traffic",
                ward="Ward 1",
                address="13 Main Street, Chennai",
                priority="HIGH"
            )
            
            time.sleep(3)
            
            if complaint_page.is_element_present(complaint_page.SUCCESS_MESSAGE):
                test_context['actual_result'] = "Complaint submitted successfully"
                test_context['status'] = "PASS"
            else:
                error_msg = complaint_page.get_error_message()
                test_context['actual_result'] = error_msg or "Unknown error"
                test_context['status'] = "FAIL"
            
            complaint_page.screenshot(f"test_complaint_creation_{test_context['status']}.png")
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"
            logger.error(f"Complaint creation test failed: {str(e)}")
    
    def test_complaint_validation(self, driver, test_context):
        """Test complaint form validation"""
        test_context['test_id'] = "CITIZEN_003"
        test_context['scenario'] = "Complaint Form Validation"
        
        # First login because complaints/create is protected
        login_page = LoginPage(driver, TestConfig)
        login_page.navigate_to(f"{TestConfig.FRONTEND_URL}/login")
        login_page.login_with_email(TestConfig.TEST_CITIZEN_EMAIL)
        login_page.wait_for_otp_inputs()
        login_page.verify_otp(TestConfig.TEST_OTP)
        login_page.wait_for_url_change(f"{TestConfig.FRONTEND_URL}/login")
        
        # Navigate to complaint creation
        driver.get(f"{TestConfig.FRONTEND_URL}/complaints/create")
        
        import time
        time.sleep(2)
        
        complaint_page = ComplaintCreationPage(driver, TestConfig)
        
        try:
            # Try to submit without filling required fields
            complaint_page.click_submit()
            
            time.sleep(1)
            
            if complaint_page.is_required_field_error_shown():
                test_context['actual_result'] = "Validation error shown for empty fields"
                test_context['status'] = "PASS"
            else:
                test_context['actual_result'] = "No validation error shown"
                test_context['status'] = "FAIL"
            
            complaint_page.screenshot(f"test_form_validation_{test_context['status']}.png")
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"


class TestInspectorWorkflows:
    """Inspector workflow test cases"""
    
    def test_inspector_dashboard(self, driver, test_context):
        """Test inspector dashboard"""
        test_context['test_id'] = "INSPECTOR_001"
        test_context['scenario'] = "Inspector Dashboard"
        
        login_page = LoginPage(driver, TestConfig)
        login_page.navigate_to(f"{TestConfig.FRONTEND_URL}/login")
        
        try:
            login_page.login_with_email(TestConfig.TEST_INSPECTOR_EMAIL)
            login_page.verify_otp(TestConfig.TEST_OTP)
            
            login_page.wait_for_url_change(f"{TestConfig.FRONTEND_URL}/login")
            
            inspector_dashboard = InspectorDashboardPage(driver, TestConfig)
            
            if inspector_dashboard.is_dashboard_loaded():
                test_context['actual_result'] = "Inspector dashboard loaded"
                test_context['status'] = "PASS"
                assigned_count = inspector_dashboard.get_assigned_complaints_count()
                test_context['remarks'] = f"Assigned complaints: {assigned_count}"
            else:
                test_context['actual_result'] = "Dashboard failed to load"
                test_context['status'] = "FAIL"
            
            inspector_dashboard.screenshot(f"test_inspector_dashboard_{test_context['status']}.png")
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"


class TestWorkerWorkflows:
    """Worker workflow test cases"""
    
    def test_worker_dashboard(self, driver, test_context):
        """Test worker dashboard"""
        test_context['test_id'] = "WORKER_001"
        test_context['scenario'] = "Worker Dashboard"
        
        login_page = LoginPage(driver, TestConfig)
        login_page.navigate_to(f"{TestConfig.FRONTEND_URL}/login")
        
        try:
            login_page.login_with_email(TestConfig.TEST_WORKER_EMAIL)
            login_page.verify_otp(TestConfig.TEST_OTP)
            
            login_page.wait_for_url_change(f"{TestConfig.FRONTEND_URL}/login")
            
            worker_dashboard = WorkerDashboardPage(driver, TestConfig)
            
            if worker_dashboard.is_dashboard_loaded():
                test_context['actual_result'] = "Worker dashboard loaded"
                test_context['status'] = "PASS"
                assigned_count = worker_dashboard.get_assigned_count()
                test_context['remarks'] = f"Assigned complaints: {assigned_count}"
            else:
                test_context['actual_result'] = "Dashboard failed to load"
                test_context['status'] = "FAIL"
            
            worker_dashboard.screenshot(f"test_worker_dashboard_{test_context['status']}.png")
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"


class TestUIUX:
    """UI/UX test cases"""
    
    def test_responsive_design(self, driver, test_context):
        """Test responsive design"""
        test_context['test_id'] = "UIUX_001"
        test_context['scenario'] = "Responsive Design"
        
        try:
            driver.get(f"{TestConfig.FRONTEND_URL}/login")
            
            # Test different viewport sizes
            test_sizes = [
                (320, 480),    # Mobile
                (768, 1024),   # Tablet
                (1920, 1080)   # Desktop
            ]
            
            for width, height in test_sizes:
                driver.set_window_size(width, height)
                
                import time
                time.sleep(1)
                
                # Check if page is still usable
                login_page = LoginPage(driver, TestConfig)
                if not login_page.is_element_present(login_page.EMAIL_INPUT):
                    test_context['actual_result'] = f"Layout broken at {width}x{height}"
                    test_context['status'] = "FAIL"
                    return
            
            test_context['actual_result'] = "All viewport sizes render correctly"
            test_context['status'] = "PASS"
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"
    
    def test_broken_links(self, driver, test_context):
        """Test for broken links"""
        test_context['test_id'] = "UIUX_002"
        test_context['scenario'] = "Broken Links Check"
        
        try:
            driver.get(f"{TestConfig.FRONTEND_URL}/")
            
            import time
            time.sleep(2)
            
            # Find all links
            links = driver.find_elements("tag name", "a")
            broken_links = []
            
            for link in links:
                try:
                    href = link.get_attribute("href")
                    if href and href.startswith("http"):
                        link.click()
                        time.sleep(0.5)
                        if driver.title == "404" or "error" in driver.current_url.lower():
                            broken_links.append(href)
                        driver.back()
                except:
                    pass
            
            if broken_links:
                test_context['actual_result'] = f"Found {len(broken_links)} broken links"
                test_context['status'] = "FAIL"
                test_context['remarks'] = str(broken_links)
            else:
                test_context['actual_result'] = "No broken links found"
                test_context['status'] = "PASS"
        except Exception as e:
            test_context['actual_result'] = f"Exception: {str(e)}"
            test_context['status'] = "FAIL"
