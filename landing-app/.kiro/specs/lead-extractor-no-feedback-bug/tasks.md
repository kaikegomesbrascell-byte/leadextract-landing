# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Status Messages Blocked by Messagebox
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that clicking "Iniciar Extração" with valid inputs shows status label update "🚀 Iniciando extração... Abrindo navegador..." BEFORE messagebox appears
  - The test assertions should match the Expected Behavior Properties from design: status messages visible before blocking dialogs
  - Run test on UNFIXED code (current gui_manager.py with messagebox.showinfo() on line 514)
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: messagebox appears immediately, blocking status label updates from rendering
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Error Validation and Other UI Behaviors Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (error validation, completion dialogs, progress updates)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test 1: Error validation messagebox appears immediately when nicho or localização is empty
  - Test 2: Completion messagebox appears when extraction finishes successfully
  - Test 3: Progress bar updates in real-time during extraction
  - Test 4: Stop button interrupts extraction correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Fix for messagebox blocking status updates

  - [x] 3.1 Implement the fix in gui_manager.py
    - Remove synchronous messagebox.showinfo() call on lines 514-523 that blocks UI thread
    - Schedule messagebox with self.root.after(800, lambda: messagebox.showinfo(...)) to allow status updates to render first
    - Use 800ms delay to ensure initial status message "🚀 Iniciando extração..." is visible before messagebox appears
    - Keep existing self.status_label.configure() call on line 497 so it renders immediately
    - Remove redundant self.root.after(500, ...) call on lines 523-525 since background thread handles status updates
    - _Bug_Condition: isBugCondition(input) where input.button == "btn_iniciar" AND validationPassed(input.formData) AND messagebox.showinfo() IS called synchronously AND status_label updates NOT visible to user_
    - _Expected_Behavior: status_label.text == "🚀 Iniciando extração... Abrindo navegador..." AND status_label IS visible to user AND messagebox appears AFTER status_label update AND time_between(status_update, messagebox) >= 800ms_
    - _Preservation: Error validation messageboxes (messagebox.showerror) must continue to display immediately when validation fails; Completion messageboxes must continue to display when extraction finishes; Progress bar updates must continue to work in real-time; Lead data table updates must continue to populate in batches of 5; Stop button functionality must continue to interrupt extraction correctly; Automatic file generation must continue to work_
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Status Messages Visible Before Messagebox
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify status label shows "🚀 Iniciando extração... Abrindo navegador..." before messagebox appears
    - Verify messagebox appears after >= 800ms delay
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Error Validation and Other UI Behaviors Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm error validation messageboxes still appear immediately
    - Confirm completion messageboxes still work correctly
    - Confirm progress bar updates still work in real-time
    - Confirm stop button still interrupts extraction correctly
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
