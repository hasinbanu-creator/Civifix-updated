"""Page Objects for Authentication screens"""
from selenium.webdriver.common.by import By
from base_page import BasePage


class LoginPage(BasePage):
    """Login Page Object"""
    
    # Locators
    EMAIL_INPUT = (By.ID, "email-input")
    CONTINUE_BUTTON = (By.XPATH, "//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'CONTINUE')]")
    OTP_INPUTS = (By.XPATH, "//input[@inputmode='numeric' and @maxlength='1']")
    VERIFY_BUTTON = (By.XPATH, "//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'VERIFY')]")
    RESEND_BUTTON = (By.XPATH, "//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'RESEND')]")
    ERROR_MESSAGE = (By.XPATH, "//p[contains(@class, 'text-red-500') or contains(@class, 'text-red-600') or contains(text(), 'Invalid') or contains(text(), 'required')]")
    SIGNUP_BUTTON = (By.XPATH, "//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'SIGN UP')]")
    
    def enter_email(self, email):
        """Enter email"""
        self.type_text(self.EMAIL_INPUT, email)
    
    def click_continue(self):
        """Click continue button"""
        self.click_element(self.CONTINUE_BUTTON)
    
    def wait_for_otp_inputs(self):
        """Wait until 6 OTP input fields are present"""
        self.wait.until(lambda driver: len(driver.find_elements(*self.OTP_INPUTS)) == 6)

    def enter_otp(self, otp):
        """Enter OTP digits into each input"""
        self.wait_for_otp_inputs()
        inputs = self.find_elements(self.OTP_INPUTS)
        if len(inputs) != 6:
            raise ValueError("Expected 6 OTP inputs")
        for idx, char in enumerate(otp):
            inputs[idx].clear()
            inputs[idx].send_keys(char)
    
    def click_verify(self):
        """Click verify button"""
        self.click_element(self.VERIFY_BUTTON)
    
    def login_with_email(self, email):
        """Start login flow with email only"""
        self.enter_email(email)
        self.click_continue()
    
    def verify_otp(self, otp):
        """Verify OTP after login email submission"""
        self.enter_otp(otp)
        self.click_verify()
    
    def get_error_message(self):
        """Get error message"""
        if self.is_element_present(self.ERROR_MESSAGE):
            return self.get_text(self.ERROR_MESSAGE)
        return None


class SignupPage(BasePage):
    """Signup Page Object"""
    
    # Locators
    NAME_INPUT = (By.ID, "signup-name")
    MOBILE_INPUT = (By.ID, "signup-mobile")
    EMAIL_INPUT = (By.ID, "signup-email")
    ADDRESS_INPUT = (By.XPATH, "//textarea[@placeholder='House / Street / Locality']")
    DISTRICT_SELECT = (By.XPATH, "//select[option[contains(text(), 'Select District') or contains(text(), 'Select District')]]")
    WARD_SELECT = (By.XPATH, "//select[option[contains(text(), 'Select Ward') or contains(text(), 'Select Ward')]]")
    TERMS_CHECKBOX = (By.XPATH, "//button[contains(@class, 'rounded') and contains(normalize-space(.), 'Terms & Conditions') or contains(normalize-space(.), 'Privacy Policy')]/preceding-sibling::button")
    NEXT_BUTTON = (By.XPATH, "//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'NEXT')]")
    CREATE_ACCOUNT_BUTTON = (By.XPATH, "//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'CREATE ACCOUNT')]")
    OTP_INPUTS = (By.XPATH, "//input[@inputmode='numeric' and @maxlength='1']")
    VERIFY_BUTTON = (By.XPATH, "//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'VERIFY')]")
    ERROR_MESSAGE = (By.XPATH, "//p[contains(@class, 'text-red-500') or contains(@class, 'text-red-600') or contains(text(), 'invalid') or contains(text(), 'required')]")

    def enter_name(self, name):
        """Enter name"""
        self.type_text(self.NAME_INPUT, name)
    
    def enter_email(self, email):
        """Enter email"""
        self.type_text(self.EMAIL_INPUT, email)
    
    def enter_mobile(self, mobile):
        """Enter mobile"""
        self.type_text(self.MOBILE_INPUT, mobile)
    
    def enter_address(self, address):
        """Enter address"""
        self.type_text(self.ADDRESS_INPUT, address)
    
    def select_district(self, district):
        """Select district"""
        element = self.find_element(self.DISTRICT_SELECT)
        element.send_keys(district)
    
    def select_ward(self, ward):
        """Select ward"""
        element = self.find_element(self.WARD_SELECT)
        element.send_keys(ward)
    
    def click_next(self):
        """Click next button"""
        self.click_element(self.NEXT_BUTTON)
    
    def click_create_account(self):
        """Click create account"""
        self.click_element(self.CREATE_ACCOUNT_BUTTON)
    
    def enter_otp(self, otp):
        """Enter OTP into separate OTP inputs"""
        inputs = self.find_elements(self.OTP_INPUTS)
        if len(inputs) != 6:
            raise ValueError("Expected 6 OTP inputs")
        for idx, char in enumerate(otp):
            inputs[idx].clear()
            inputs[idx].send_keys(char)
    
    def click_verify(self):
        """Click verify button"""
        self.click_element(self.VERIFY_BUTTON)
    
    def signup_step_one(self, name, email, mobile):
        """Fill step 1 fields"""
        self.enter_name(name)
        self.enter_email(email)
        self.enter_mobile(mobile)
        self.click_next()
    
    def click_terms_checkbox(self):
        """Toggle the Terms & Conditions checkbox"""
        self.driver.execute_script(
            "const label = document.evaluate(\"//span[contains(., 'Terms & Conditions') or contains(., 'Privacy Policy')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;"
            "if (!label) throw new Error('Terms label not found');"
            "const checkbox = label.closest('div').querySelector('button[type=\'button\']');"
            "if (!checkbox) throw new Error('Terms checkbox not found');"
            "checkbox.click();"
        )
    
    def signup_step_two(self, address, district, ward, agree_terms=True):
        """Fill step 2 fields"""
        self.enter_address(address)
        self.select_district(district)
        self.select_ward(ward)
        if agree_terms:
            self.click_terms_checkbox()
        self.click_create_account()
    
    def enter_otp_for_signup(self, otp):
        """Enter OTP on signup verification"""
        self.enter_otp(otp)
        self.click_verify()
    
    def get_error_message(self):
        """Get error message"""
        if self.is_element_present(self.ERROR_MESSAGE):
            return self.get_text(self.ERROR_MESSAGE)
        return None
