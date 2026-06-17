"""Base Page Object class for Selenium tests"""
import logging
import os
from datetime import datetime
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

logger = logging.getLogger(__name__)


class BasePage:
    """Base Page Object class"""
    
    def __init__(self, driver, config):
        """Initialize Page Object"""
        self.driver = driver
        self.config = config
        self.wait = WebDriverWait(driver, config.EXPLICIT_WAIT)
        self.actions = ActionChains(driver)
    
    def navigate_to(self, url):
        """Navigate to URL"""
        self.driver.get(url)
        logger.info(f"Navigated to: {url}")
    
    def find_element(self, locator, timeout=None):
        """Find element with explicit wait"""
        timeout = timeout or self.config.EXPLICIT_WAIT
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            logger.debug(f"Element found: {locator}")
            return element
        except Exception as e:
            logger.error(f"Element not found: {locator} - {str(e)}")
            raise
    
    def find_elements(self, locator):
        """Find multiple elements"""
        try:
            elements = self.driver.find_elements(*locator)
            logger.debug(f"Found {len(elements)} elements for: {locator}")
            return elements
        except Exception as e:
            logger.error(f"Elements not found: {locator} - {str(e)}")
            return []
    
    def click_element(self, locator):
        """Click element"""
        try:
            element = self.wait.until(EC.element_to_be_clickable(locator))
            element.click()
            logger.info(f"Clicked element: {locator}")
        except Exception as e:
            logger.error(f"Click failed: {locator} - {str(e)}")
            raise
    
    def type_text(self, locator, text):
        """Type text into element"""
        try:
            element = self.find_element(locator)
            element.clear()
            element.send_keys(text)
            logger.info(f"Typed text in: {locator}")
        except Exception as e:
            logger.error(f"Type text failed: {locator} - {str(e)}")
            raise
    
    def get_text(self, locator):
        """Get text from element"""
        try:
            element = self.find_element(locator)
            text = element.text
            logger.debug(f"Got text from: {locator} - {text}")
            return text
        except Exception as e:
            logger.error(f"Get text failed: {locator} - {str(e)}")
            return None
    
    def wait_for_element_visible(self, locator, timeout=None):
        """Wait for element to be visible"""
        timeout = timeout or self.config.EXPLICIT_WAIT
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            logger.debug(f"Element visible: {locator}")
        except Exception as e:
            logger.error(f"Wait for visibility failed: {locator} - {str(e)}")
            raise
    
    def wait_for_element_invisible(self, locator, timeout=None):
        """Wait for element to be invisible"""
        timeout = timeout or self.config.EXPLICIT_WAIT
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element_located(locator)
            )
            logger.debug(f"Element invisible: {locator}")
        except Exception as e:
            logger.error(f"Wait for invisibility failed: {locator} - {str(e)}")
    
    def is_element_present(self, locator):
        """Check if element is present"""
        try:
            self.driver.find_element(*locator)
            return True
        except:
            return False
    
    def screenshot(self, filename):
        """Take screenshot"""
        try:
            if self.config.TAKE_SCREENSHOTS:
                filepath = os.path.join(self.config.SCREENSHOT_PATH, filename)
                self.driver.save_screenshot(filepath)
                logger.info(f"Screenshot saved: {filepath}")
                return filepath
        except Exception as e:
            logger.error(f"Screenshot failed: {str(e)}")
        return None
    
    def scroll_to_element(self, locator):
        """Scroll to element"""
        try:
            element = self.find_element(locator)
            self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
            logger.info(f"Scrolled to element: {locator}")
        except Exception as e:
            logger.error(f"Scroll failed: {locator} - {str(e)}")
    
    def get_current_url(self):
        """Get current URL"""
        url = self.driver.current_url
        logger.debug(f"Current URL: {url}")
        return url
    
    def wait_for_url_change(self, old_url, timeout=None):
        """Wait for URL to change"""
        timeout = timeout or self.config.EXPLICIT_WAIT
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda driver: driver.current_url != old_url
            )
            logger.info(f"URL changed from: {old_url}")
        except Exception as e:
            logger.error(f"URL change timeout: {str(e)}")
    
    def execute_script(self, script, *args):
        """Execute JavaScript"""
        return self.driver.execute_script(script, *args)
    
    def get_attribute(self, locator, attribute):
        """Get attribute value"""
        try:
            element = self.find_element(locator)
            value = element.get_attribute(attribute)
            logger.debug(f"Got attribute {attribute}: {value}")
            return value
        except Exception as e:
            logger.error(f"Get attribute failed: {locator} - {str(e)}")
            return None
