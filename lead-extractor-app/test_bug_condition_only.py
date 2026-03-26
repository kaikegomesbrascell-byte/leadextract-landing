"""
Run only the bug condition exploration test to verify the fix.
"""

import unittest
import sys

# Import the test class
from test_gui_feedback_bug import TestBugConditionExploration

if __name__ == '__main__':
    # Create a test suite with only the bug condition test
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBugConditionExploration)
    
    # Run the test
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Exit with appropriate code
    sys.exit(0 if result.wasSuccessful() else 1)
