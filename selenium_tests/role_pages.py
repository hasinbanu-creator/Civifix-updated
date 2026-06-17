"""Page Objects for Inspector and Worker screens"""
from selenium.webdriver.common.by import By
from base_page import BasePage


class InspectorDashboardPage(BasePage):
    """Inspector Dashboard Page Object"""
    
    # Locators
    ASSIGNED_COMPLAINTS = (By.XPATH, "//span[contains(text(), 'Assigned')] | //div[@class='assigned-count']")
    PENDING_REVIEW = (By.XPATH, "//span[contains(text(), 'Pending')] | //div[@class='pending-count']")
    APPROVED_COMPLAINTS = (By.XPATH, "//span[contains(text(), 'Approved')] | //div[@class='approved-count']")
    REJECTED_COMPLAINTS = (By.XPATH, "//span[contains(text(), 'Rejected')] | //div[@class='rejected-count']")
    COMPLAINTS_TABLE = (By.XPATH, "//table | //div[@class='complaints-list']")
    COMPLAINT_ROW = (By.XPATH, "//tr[@class='complaint-row'] | //div[@class='complaint-item']")
    FILTER_BUTTON = (By.XPATH, "//button[contains(text(), 'Filter')]")
    SEARCH_INPUT = (By.NAME, "search")
    STATUS_FILTER = (By.NAME, "status_filter")
    
    def is_dashboard_loaded(self):
        """Check if dashboard is loaded"""
        return self.is_element_present(self.ASSIGNED_COMPLAINTS)
    
    def get_assigned_complaints_count(self):
        """Get assigned complaints count"""
        text = self.get_text(self.ASSIGNED_COMPLAINTS)
        return self._extract_number(text)
    
    def click_complaint_row(self, index):
        """Click complaint row by index"""
        rows = self.find_elements(self.COMPLAINT_ROW)
        if index < len(rows):
            rows[index].click()
    
    def search_complaint(self, complaint_id):
        """Search complaint by ID"""
        self.type_text(self.SEARCH_INPUT, complaint_id)
    
    def filter_by_status(self, status):
        """Filter complaints by status"""
        select_element = self.find_element(self.STATUS_FILTER)
        select_element.send_keys(status)
    
    def _extract_number(self, text):
        """Extract number from text"""
        import re
        match = re.search(r'\d+', text)
        return int(match.group()) if match else 0


class InspectorComplaintDetailPage(BasePage):
    """Inspector Complaint Detail Page Object"""
    
    # Locators
    COMPLAINT_ID = (By.XPATH, "//span[contains(text(), 'ID:')] | //p[@class='complaint-id']")
    COMPLAINT_STATUS = (By.XPATH, "//span[contains(text(), 'Status:')]")
    CITIZEN_DETAILS = (By.XPATH, "//div[@class='citizen-info'] | //section[@class='citizen-details']")
    COMPLAINT_DESCRIPTION = (By.XPATH, "//p[@class='description']")
    LOCATION_MAP = (By.XPATH, "//div[@id='map'] | //div[@class='map-container']")
    PHOTO_GALLERY = (By.XPATH, "//div[@class='photo-gallery'] | //div[@class='images']")
    APPROVE_BUTTON = (By.XPATH, "//button[contains(text(), 'Approve')]")
    REJECT_BUTTON = (By.XPATH, "//button[contains(text(), 'Reject')]")
    ADD_NOTES_TEXTAREA = (By.NAME, "notes")
    SUBMIT_NOTES_BUTTON = (By.XPATH, "//button[contains(text(), 'Save Notes')] | //button[contains(text(), 'Submit')]")
    NOTES_HISTORY = (By.XPATH, "//div[@class='notes-history']")
    
    def is_complaint_loaded(self):
        """Check if complaint is loaded"""
        return self.is_element_present(self.COMPLAINT_ID)
    
    def get_complaint_id(self):
        """Get complaint ID"""
        text = self.get_text(self.COMPLAINT_ID)
        return text.split(':')[-1].strip()
    
    def click_approve(self):
        """Click approve button"""
        self.click_element(self.APPROVE_BUTTON)
    
    def click_reject(self):
        """Click reject button"""
        self.click_element(self.REJECT_BUTTON)
    
    def add_notes(self, notes):
        """Add inspection notes"""
        self.type_text(self.ADD_NOTES_TEXTAREA, notes)
    
    def submit_notes(self):
        """Submit notes"""
        self.click_element(self.SUBMIT_NOTES_BUTTON)
    
    def approve_and_add_notes(self, notes):
        """Approve complaint and add notes"""
        self.add_notes(notes)
        self.submit_notes()
        self.click_approve()
    
    def reject_and_add_notes(self, reason):
        """Reject complaint and add reason"""
        self.add_notes(reason)
        self.submit_notes()
        self.click_reject()


class WorkerDashboardPage(BasePage):
    """Worker Dashboard Page Object"""
    
    # Locators
    ASSIGNED_COMPLAINTS = (By.XPATH, "//span[contains(text(), 'Assigned')] | //div[@class='assigned-count']")
    IN_PROGRESS = (By.XPATH, "//span[contains(text(), 'In Progress')] | //div[@class='in-progress-count']")
    COMPLETED = (By.XPATH, "//span[contains(text(), 'Completed')] | //div[@class='completed-count']")
    COMPLAINTS_TABLE = (By.XPATH, "//table | //div[@class='complaints-list']")
    COMPLAINT_ITEM = (By.XPATH, "//tr[@class='complaint-row'] | //div[@class='complaint-item']")
    START_WORK_BUTTON = (By.XPATH, "//button[contains(text(), 'Start')] | //button[contains(text(), 'Begin Work')]")
    PRIORITY_HIGH_FILTER = (By.XPATH, "//button[contains(text(), 'High')]")
    
    def is_dashboard_loaded(self):
        """Check if dashboard is loaded"""
        return self.is_element_present(self.ASSIGNED_COMPLAINTS)
    
    def get_assigned_count(self):
        """Get assigned complaints count"""
        text = self.get_text(self.ASSIGNED_COMPLAINTS)
        return self._extract_number(text)
    
    def get_in_progress_count(self):
        """Get in progress complaints count"""
        text = self.get_text(self.IN_PROGRESS)
        return self._extract_number(text)
    
    def click_complaint_item(self, index):
        """Click complaint item by index"""
        items = self.find_elements(self.COMPLAINT_ITEM)
        if index < len(items):
            items[index].click()
    
    def _extract_number(self, text):
        """Extract number from text"""
        import re
        match = re.search(r'\d+', text)
        return int(match.group()) if match else 0


class WorkerComplaintDetailPage(BasePage):
    """Worker Complaint Detail Page Object"""
    
    # Locators
    COMPLAINT_ID = (By.XPATH, "//span[contains(text(), 'ID:')]")
    CURRENT_STATUS = (By.XPATH, "//span[contains(text(), 'Status:')]")
    PROGRESS_BAR = (By.XPATH, "//div[@class='progress-bar']")
    START_BUTTON = (By.XPATH, "//button[contains(text(), 'Start Work')]")
    ADD_UPDATE_TEXTAREA = (By.NAME, "update")
    SUBMIT_UPDATE_BUTTON = (By.XPATH, "//button[contains(text(), 'Post Update')]")
    MARK_COMPLETE_BUTTON = (By.XPATH, "//button[contains(text(), 'Mark Complete')]")
    MARK_COMPLETE_MODAL = (By.XPATH, "//div[@class='modal' and contains(., 'Complete')]")
    RESOLUTION_TEXTAREA = (By.NAME, "resolution")
    CONFIRM_COMPLETE_BUTTON = (By.XPATH, "//button[contains(text(), 'Confirm')] | //button[@class='confirm-btn']")
    UPDATES_HISTORY = (By.XPATH, "//div[@class='updates-history']")
    
    def is_complaint_loaded(self):
        """Check if complaint is loaded"""
        return self.is_element_present(self.COMPLAINT_ID)
    
    def click_start_work(self):
        """Click start work button"""
        self.click_element(self.START_BUTTON)
    
    def add_progress_update(self, update_text):
        """Add progress update"""
        self.type_text(self.ADD_UPDATE_TEXTAREA, update_text)
    
    def submit_update(self):
        """Submit progress update"""
        self.click_element(self.SUBMIT_UPDATE_BUTTON)
    
    def add_and_post_update(self, update_text):
        """Add and post update"""
        self.add_progress_update(update_text)
        self.submit_update()
    
    def click_mark_complete(self):
        """Click mark complete button"""
        self.click_element(self.MARK_COMPLETE_BUTTON)
    
    def enter_resolution_notes(self, resolution):
        """Enter resolution notes"""
        self.type_text(self.RESOLUTION_TEXTAREA, resolution)
    
    def confirm_completion(self):
        """Confirm complaint completion"""
        self.click_element(self.CONFIRM_COMPLETE_BUTTON)
    
    def complete_complaint(self, resolution_notes):
        """Complete complaint with resolution"""
        self.click_mark_complete()
        self.enter_resolution_notes(resolution_notes)
        self.confirm_completion()
