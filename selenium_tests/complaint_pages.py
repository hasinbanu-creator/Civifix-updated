"""Page Objects for Dashboard and Complaint screens"""
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from base_page import BasePage


class CitizenDashboardPage(BasePage):
    """Citizen Dashboard Page Object"""
    
    # Locators
    WELCOME_TEXT = (By.XPATH, "//h1 | //h2[contains(text(), 'Dashboard')]")
    NEW_COMPLAINT_BUTTON = (By.XPATH, "//button[contains(text(), 'New Complaint')] | //button[contains(text(), 'Raise Complaint')]")
    COMPLAINTS_TABLE = (By.XPATH, "//table | //div[contains(@class, 'complaints')]")
    COMPLAINT_ROW = (By.XPATH, "//tr[@class='complaint-row'] | //div[@class='complaint-item']")
    PROFILE_BUTTON = (By.XPATH, "//button[contains(text(), 'Profile')] | //a[contains(@href, 'profile')]")
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(text(), 'Logout')] | //button[contains(text(), 'Sign Out')]")
    TOTAL_COMPLAINTS = (By.XPATH, "//span[contains(text(), 'Total Complaints')] | //div[@class='total-count']")
    PENDING_COMPLAINTS = (By.XPATH, "//span[contains(text(), 'Pending')] | //div[@class='pending-count']")
    RESOLVED_COMPLAINTS = (By.XPATH, "//span[contains(text(), 'Resolved')] | //div[@class='resolved-count']")
    
    def is_dashboard_loaded(self):
        """Check if dashboard is loaded"""
        return self.is_element_present(self.WELCOME_TEXT)
    
    def click_new_complaint(self):
        """Click new complaint button"""
        self.click_element(self.NEW_COMPLAINT_BUTTON)
    
    def get_total_complaints_count(self):
        """Get total complaints count"""
        if self.is_element_present(self.TOTAL_COMPLAINTS):
            text = self.get_text(self.TOTAL_COMPLAINTS)
            return self._extract_number(text)
        return 0
    
    def get_complaint_rows(self):
        """Get complaint rows"""
        return self.find_elements(self.COMPLAINT_ROW)
    
    def click_complaint(self, complaint_index):
        """Click complaint by index"""
        rows = self.get_complaint_rows()
        if complaint_index < len(rows):
            rows[complaint_index].click()
    
    def click_profile(self):
        """Click profile button"""
        self.click_element(self.PROFILE_BUTTON)
    
    def click_logout(self):
        """Click logout button"""
        self.click_element(self.LOGOUT_BUTTON)
    
    def _extract_number(self, text):
        """Extract number from text"""
        import re
        match = re.search(r'\d+', text)
        return int(match.group()) if match else 0


class ComplaintCreationPage(BasePage):
    """Complaint Creation Page Object"""
    
    # Locators
    COMPLAINT_TYPE_SELECT = (By.XPATH, "//select[option[contains(., 'Select a category')]]")
    DESCRIPTION_INPUT = (By.XPATH, "//textarea[@placeholder='Describe the issue clearly (min 10 characters)']")
    PRIORITY_BUTTONS = (By.XPATH, "//button[contains(@class,'rounded-xl') and .//span[contains(text(),'Low') or contains(text(),'Medium') or contains(text(),'High')]]")
    WARD_SELECT = (By.XPATH, "//select[option[contains(., 'Select your ward')]]")
    ADDRESS_INPUT = (By.XPATH, "//input[@placeholder='e.g. Near post office, Main Road']")
    SUBMIT_BUTTON = (By.XPATH, "//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'SUBMIT COMPLAINT')]")
    SUCCESS_MESSAGE = (By.XPATH, "//h2[contains(., 'Complaint Submitted!')]")
    REQUIRED_FIELD_ERROR = (By.XPATH, "//p[contains(text(), 'Please select') or contains(text(), 'must be at least') or contains(text(), 'required')]")
    
    def select_complaint_type(self, complaint_type):
        """Select complaint type"""
        select_element = self.find_element(self.COMPLAINT_TYPE_SELECT)
        select_element.send_keys(complaint_type)
    
    def enter_description(self, description):
        """Enter complaint description"""
        self.type_text(self.DESCRIPTION_INPUT, description)
    
    def select_priority(self, priority):
        """Select priority button"""
        button_locator = (By.XPATH, f"//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), '{priority.upper()}') and contains(@class, 'rounded-xl')]")
        self.click_element(button_locator)
    
    def select_ward(self, ward):
        """Select ward"""
        select_element = self.find_element(self.WARD_SELECT)
        select_element.send_keys(ward)
    
    def enter_address(self, address):
        """Enter address"""
        self.type_text(self.ADDRESS_INPUT, address)
    
    def click_submit(self):
        """Click submit button"""
        self.click_element(self.SUBMIT_BUTTON)
    
    def submit_complaint(self, complaint_type, description, ward, address, priority="HIGH"):
        """Submit complaint with required details"""
        self.select_complaint_type(complaint_type)
        self.enter_description(description)
        self.select_ward(ward)
        self.enter_address(address)
        self.select_priority(priority)
        self.click_submit()
    
    def get_error_message(self):
        """Get error message"""
        if self.is_element_present(self.REQUIRED_FIELD_ERROR):
            return self.get_text(self.REQUIRED_FIELD_ERROR)
        return None
    
    def is_required_field_error_shown(self):
        """Check if required field error is shown"""
        return self.is_element_present(self.REQUIRED_FIELD_ERROR)


class ComplaintDetailPage(BasePage):
    """Complaint Detail Page Object"""
    
    # Locators
    COMPLAINT_ID = (By.XPATH, "//span[contains(text(), 'ID:')] | //p[@class='complaint-id']")
    COMPLAINT_STATUS = (By.XPATH, "//span[contains(text(), 'Status:')] | //p[@class='status']")
    COMPLAINT_TITLE = (By.XPATH, "//h1 | //h2[@class='complaint-title']")
    COMPLAINT_DESCRIPTION = (By.XPATH, "//p[@class='description'] | //div[@class='complaint-description']")
    COMPLAINT_LOCATION = (By.XPATH, "//p[@class='location'] | //div[@class='location-info']")
    COMPLAINT_PRIORITY = (By.XPATH, "//span[contains(text(), 'Priority')] | //p[@class='priority']")
    COMPLAINT_CREATED_DATE = (By.XPATH, "//span[contains(text(), 'Created')] | //p[@class='created-date']")
    STATUS_UPDATE_BUTTON = (By.XPATH, "//button[contains(text(), 'Update Status')]")
    EDIT_BUTTON = (By.XPATH, "//button[contains(text(), 'Edit')]")
    BACK_BUTTON = (By.XPATH, "//button[contains(text(), 'Back')] | //a[@href='javascript:history.back()']")
    COMMENTS_SECTION = (By.XPATH, "//div[@class='comments'] | //section[@class='comments-section']")
    ADD_COMMENT_BUTTON = (By.XPATH, "//button[contains(text(), 'Add Comment')]")
    
    def is_complaint_loaded(self):
        """Check if complaint detail is loaded"""
        return self.is_element_present(self.COMPLAINT_TITLE)
    
    def get_complaint_id(self):
        """Get complaint ID"""
        if self.is_element_present(self.COMPLAINT_ID):
            text = self.get_text(self.COMPLAINT_ID)
            return text.split(':')[-1].strip()
        return None
    
    def get_complaint_status(self):
        """Get complaint status"""
        if self.is_element_present(self.COMPLAINT_STATUS):
            text = self.get_text(self.COMPLAINT_STATUS)
            return text.split(':')[-1].strip()
        return None
    
    def get_complaint_title(self):
        """Get complaint title"""
        return self.get_text(self.COMPLAINT_TITLE)
    
    def get_complaint_description(self):
        """Get complaint description"""
        if self.is_element_present(self.COMPLAINT_DESCRIPTION):
            return self.get_text(self.COMPLAINT_DESCRIPTION)
        return None
    
    def click_back(self):
        """Click back button"""
        self.click_element(self.BACK_BUTTON)
