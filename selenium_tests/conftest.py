"""Pytest configuration and fixtures for Selenium tests"""
import pytest
import os
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import logging

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('selenium_tests.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class TestConfig:
    """Test configuration class"""
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    BROWSER = os.getenv('BROWSER', 'chrome')
    HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'
    IMPLICIT_WAIT = int(os.getenv('IMPLICIT_WAIT', 10))
    EXPLICIT_WAIT = int(os.getenv('EXPLICIT_WAIT', 15))
    TAKE_SCREENSHOTS = os.getenv('TAKE_SCREENSHOTS', 'true').lower() == 'true'
    SCREENSHOT_PATH = os.getenv('SCREENSHOT_PATH', './screenshots')
    
    # Test users
    TEST_CITIZEN_EMAIL = os.getenv('TEST_CITIZEN_EMAIL', 'citizen@test.com')
    TEST_CITIZEN_PASSWORD = os.getenv('TEST_CITIZEN_PASSWORD', 'Test@12345')
    TEST_CITIZEN_MOBILE = os.getenv('TEST_CITIZEN_MOBILE', '9876543210')
    
    TEST_INSPECTOR_EMAIL = os.getenv('TEST_INSPECTOR_EMAIL', 'inspector@test.com')
    TEST_INSPECTOR_PASSWORD = os.getenv('TEST_INSPECTOR_PASSWORD', 'Test@12345')
    
    TEST_WORKER_EMAIL = os.getenv('TEST_WORKER_EMAIL', 'worker@test.com')
    TEST_WORKER_PASSWORD = os.getenv('TEST_WORKER_PASSWORD', 'Test@12345')
    
    TEST_ADMIN_EMAIL = os.getenv('TEST_ADMIN_EMAIL', 'admin@test.com')
    TEST_ADMIN_PASSWORD = os.getenv('TEST_ADMIN_PASSWORD', 'Test@12345')
    
    TEST_OTP = os.getenv('TEST_OTP', '000000')
    
    @classmethod
    def create_screenshot_dir(cls):
        """Create screenshot directory if it doesn't exist"""
        if not os.path.exists(cls.SCREENSHOT_PATH):
            os.makedirs(cls.SCREENSHOT_PATH)


@pytest.fixture(scope="function")
def driver():
    """Create and configure Selenium WebDriver"""
    TestConfig.create_screenshot_dir()
    
    if TestConfig.BROWSER.lower() == 'chrome':
        options = Options()
        if TestConfig.HEADLESS:
            options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
    else:
        raise ValueError(f"Unsupported browser: {TestConfig.BROWSER}")
    
    driver.implicitly_wait(TestConfig.IMPLICIT_WAIT)
    
    logger.info(f"WebDriver initialized - {TestConfig.BROWSER}")
    
    yield driver
    
    driver.quit()
    logger.info("WebDriver closed")


@pytest.fixture(scope="function")
def test_context():
    """Provide test context with metadata"""
    context = {
        'start_time': datetime.now(),
        'screenshots': [],
        'test_data': {},
        'step_count': 0
    }
    yield context
    context['end_time'] = datetime.now()


def pytest_configure(config):
    """Configure pytest"""
    TestConfig.create_screenshot_dir()
