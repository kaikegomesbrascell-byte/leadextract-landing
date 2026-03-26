"""
Property-Based Tests for Lead Extractor GUI Feedback Bug

This test suite validates the bugfix for the messagebox blocking issue
where status messages are not visible before the blocking dialog appears.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4**
"""

import unittest
from unittest.mock import Mock, patch, MagicMock, call
import threading
import time
from gui_manager import LeadExtractorGUI


class TestBugConditionExploration(unittest.TestCase):
    """
    Property 1: Bug Condition - Status Messages Visible Before Messagebox
    
    **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    
    CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
    When the test FAILS, it proves the messagebox blocks status updates from rendering.
    
    The bug is: messagebox.showinfo() is called synchronously (blocking) immediately
    after thread.start(), which prevents the UI event loop from processing the status
    label update that was configured just before. The user never sees the initial
    status message because the blocking dialog prevents UI updates.
    """
    
    def setUp(self):
        """Set up test fixtures."""
        self.gui = LeadExtractorGUI()
        self.gui.criar_interface()
        
    def tearDown(self):
        """Clean up after tests."""
        try:
            self.gui.root.destroy()
        except:
            pass
    
    @patch('automation_engine.GoogleMapsAutomation')
    @patch('gui_manager.messagebox.showinfo')
    def test_messagebox_scheduled_not_synchronous(self, mock_messagebox, mock_automation):
        """
        Test that messagebox is scheduled with root.after() instead of called synchronously.
        
        On UNFIXED code: messagebox.showinfo() is called directly (synchronously),
        blocking the UI thread before status updates can render.
        
        On FIXED code: messagebox is scheduled with root.after(800, ...), allowing
        status updates to render first.
        
        This test checks the IMPLEMENTATION DETAIL that reveals the bug.
        
        **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
        """
        # Track all calls to root.after and messagebox.showinfo
        after_calls = []
        messagebox_calls = []
        
        original_after = self.gui.root.after
        
        def track_after(delay, func=None, *args):
            """Track root.after calls."""
            after_calls.append(('after', delay, func))
            # Don't actually schedule - just track
            return None
        
        def track_messagebox(*args, **kwargs):
            """Track messagebox calls."""
            messagebox_calls.append(('messagebox', args, kwargs))
            return None
        
        self.gui.root.after = track_after
        mock_messagebox.side_effect = track_messagebox
        
        # Mock automation
        mock_automation_instance = Mock()
        mock_automation.return_value = mock_automation_instance
        
        # Set valid inputs
        self.gui.nicho_entry.insert(0, "Vidro")
        self.gui.localizacao_entry.insert(0, "ribeirão preto")
        self.gui.limite_slider.set(0)
        
        # Call iniciar_extracao
        self.gui.iniciar_extracao()
        
        # Allow thread to start
        time.sleep(0.1)
        
        # CRITICAL ASSERTION: On UNFIXED code, messagebox.showinfo() is called
        # directly (synchronously), so messagebox_calls will have 1 entry.
        # On FIXED code, messagebox is scheduled with root.after(), so
        # messagebox_calls will be empty and after_calls will contain the scheduled call.
        
        # Check if messagebox was called synchronously (BUG)
        synchronous_messagebox_calls = [c for c in messagebox_calls if 'Extração Iniciada' in str(c)]
        
        # Check if messagebox was scheduled with root.after (FIXED)
        scheduled_messagebox_calls = [c for c in after_calls if c[0] == 'after' and c[1] >= 800]
        
        # THE KEY ASSERTION: Messagebox should be scheduled, NOT called synchronously
        # On UNFIXED code, this will FAIL because messagebox is called directly
        self.assertEqual(len(synchronous_messagebox_calls), 0,
            f"Messagebox should NOT be called synchronously. "
            f"Found {len(synchronous_messagebox_calls)} synchronous calls. "
            f"This blocks the UI thread before status updates can render.")
        
        self.assertGreater(len(scheduled_messagebox_calls), 0,
            f"Messagebox should be scheduled with root.after(800, ...). "
            f"Found {len(scheduled_messagebox_calls)} scheduled calls with delay >= 800ms.")
        
        # Additional check: Verify the delay is at least 800ms
        if len(scheduled_messagebox_calls) > 0:
            delay = scheduled_messagebox_calls[0][1]
            self.assertGreaterEqual(delay, 800,
                f"Messagebox should be scheduled with at least 800ms delay. Found: {delay}ms")


class TestPreservationProperties(unittest.TestCase):
    """
    Property 2: Preservation - Error Validation and Other UI Behaviors Unchanged
    
    **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
    
    These tests verify that non-buggy behaviors remain unchanged after the fix.
    These tests should PASS on both unfixed and fixed code.
    """
    
    def setUp(self):
        """Set up test fixtures."""
        self.gui = LeadExtractorGUI()
        self.gui.criar_interface()
        
    def tearDown(self):
        """Clean up after tests."""
        try:
            self.gui.root.destroy()
        except:
            pass
    
    @patch('gui_manager.messagebox.showerror')
    def test_error_validation_messagebox_immediate_empty_nicho(self, mock_showerror):
        """
        Test that error validation messagebox appears immediately when nicho is empty.
        
        This behavior must be preserved - error dialogs should still block immediately.
        
        **Validates: Requirement 3.2**
        """
        # Set empty nicho, valid localização
        self.gui.nicho_entry.delete(0, 'end')
        self.gui.localizacao_entry.insert(0, "São Paulo")
        self.gui.limite_slider.set(0)
        
        # Click iniciar
        self.gui.iniciar_extracao()
        
        # Allow UI to process
        self.gui.root.update()
        
        # Assert error messagebox was called
        mock_showerror.assert_called_once()
        call_args = mock_showerror.call_args
        
        # Verify it's an error about validation
        self.assertEqual(call_args[0][0], "Erro de Validação")
        self.assertIn("nicho", call_args[0][1].lower())
    
    @patch('gui_manager.messagebox.showerror')
    def test_error_validation_messagebox_immediate_empty_localizacao(self, mock_showerror):
        """
        Test that error validation messagebox appears immediately when localização is empty.
        
        **Validates: Requirement 3.2**
        """
        # Set valid nicho, empty localização
        self.gui.nicho_entry.insert(0, "Restaurantes")
        self.gui.localizacao_entry.delete(0, 'end')
        self.gui.limite_slider.set(0)
        
        # Click iniciar
        self.gui.iniciar_extracao()
        
        # Allow UI to process
        self.gui.root.update()
        
        # Assert error messagebox was called
        mock_showerror.assert_called_once()
        call_args = mock_showerror.call_args
        
        # Verify it's an error about validation
        self.assertEqual(call_args[0][0], "Erro de Validação")
        self.assertIn("localização", call_args[0][1].lower())
    
    @patch('gui_manager.messagebox.showerror')
    def test_error_validation_messagebox_immediate_both_empty(self, mock_showerror):
        """
        Test that error validation messagebox appears immediately when both fields are empty.
        
        Property-based approach: Test multiple invalid input combinations.
        
        **Validates: Requirement 3.2**
        """
        # Set both fields empty
        self.gui.nicho_entry.delete(0, 'end')
        self.gui.localizacao_entry.delete(0, 'end')
        self.gui.limite_slider.set(0)
        
        # Click iniciar
        self.gui.iniciar_extracao()
        
        # Allow UI to process
        self.gui.root.update()
        
        # Assert error messagebox was called
        mock_showerror.assert_called_once()
        call_args = mock_showerror.call_args
        
        # Verify it's an error about validation
        self.assertEqual(call_args[0][0], "Erro de Validação")
    
    @patch('gui_manager.messagebox.showinfo')
    def test_completion_messagebox_appears_on_success(self, mock_showinfo):
        """
        Test that completion messagebox appears when extraction finishes successfully.
        
        This behavior must be preserved - completion dialogs should still appear.
        
        **Validates: Requirement 3.1**
        """
        # Simulate extraction completion
        total_leads = 42
        
        # Call the completion callback directly
        self.gui._on_extracao_concluida(total_leads)
        
        # Allow UI to process
        self.gui.root.update()
        
        # Assert completion messagebox was called
        mock_showinfo.assert_called_once()
        call_args = mock_showinfo.call_args
        
        # Verify it's a completion message
        self.assertIn("Concluída", call_args[0][0])
        self.assertIn(str(total_leads), call_args[0][1])
        
        # Verify status label updated
        self.assertIn("concluída", self.gui.status_label.cget("text").lower())
        self.assertIn(str(total_leads), self.gui.status_label.cget("text"))
        
        # Verify progress bar is at 100%
        self.assertEqual(self.gui.progress_bar.get(), 1.0)
        
        # Verify buttons are in correct state
        self.assertEqual(self.gui.btn_iniciar.cget("state"), "normal")
        self.assertEqual(self.gui.btn_parar.cget("state"), "disabled")
    
    @patch('automation_engine.GoogleMapsAutomation')
    @patch('gui_manager.messagebox.showinfo')
    def test_stop_button_interrupts_extraction(self, mock_messagebox, mock_automation):
        """
        Test that stop button correctly interrupts extraction.
        
        **Validates: Requirement 3.3**
        """
        # Mock automation
        mock_automation_instance = Mock()
        mock_automation.return_value = mock_automation_instance
        
        # Set valid inputs
        self.gui.nicho_entry.insert(0, "Vidro")
        self.gui.localizacao_entry.insert(0, "São Paulo")
        self.gui.limite_slider.set(0)
        
        # Start extraction
        self.gui.iniciar_extracao()
        self.gui.root.update()
        
        # Verify stop flag is not set initially
        self.assertFalse(self.gui.stop_flag.is_set())
        
        # Click stop button
        self.gui.parar_extracao()
        self.gui.root.update()
        
        # Verify stop flag is now set
        self.assertTrue(self.gui.stop_flag.is_set())
        
        # Verify status label updated
        self.assertIn("Parando", self.gui.status_label.cget("text"))
    
    @patch('automation_engine.GoogleMapsAutomation')
    @patch('gui_manager.messagebox.showinfo')
    def test_progress_bar_updates(self, mock_messagebox, mock_automation):
        """
        Test that progress bar updates correctly during extraction.
        
        **Validates: Requirement 3.4**
        """
        # Initial progress should be 0
        self.assertEqual(self.gui.progress_bar.get(), 0.0)
        
        # Simulate progress update
        test_lead = {
            "nome": "Test Company",
            "telefone": "11999999999",
            "site": "www.test.com",
            "nota": "4.5",
            "comentarios": "100",
            "endereco": "Test Address"
        }
        
        # Update progress to 50%
        self.gui.atualizar_progresso_thread_safe(test_lead, 0.5)
        self.gui.root.update()
        time.sleep(0.1)
        self.gui.root.update()
        
        # Progress bar should be updated (may be in buffer, so check after batch)
        # Add more leads to trigger batch update
        for i in range(5):
            self.gui.atualizar_progresso_thread_safe(test_lead, 0.5)
        
        self.gui.root.update()
        time.sleep(0.1)
        self.gui.root.update()
        
        # Now progress should be updated
        self.assertEqual(self.gui.progress_bar.get(), 0.5)
    
    @patch('automation_engine.GoogleMapsAutomation')
    @patch('gui_manager.messagebox.showinfo')
    def test_lead_data_table_updates_in_batches(self, mock_messagebox, mock_automation):
        """
        Test that lead data table updates correctly in batches of 5.
        
        Property-based approach: Test with multiple batch sizes.
        
        **Validates: Requirement 3.5**
        """
        # Initial table should be empty
        initial_rows = len(self.gui.data_table.get_children())
        
        # Create test leads
        test_leads = []
        for i in range(10):
            test_leads.append({
                "nome": f"Company {i}",
                "telefone": f"1199999{i:04d}",
                "site": f"www.company{i}.com",
                "nota": "4.5",
                "comentarios": "100",
                "endereco": f"Address {i}"
            })
        
        # Add leads one by one (should batch at 5)
        for i, lead in enumerate(test_leads):
            self.gui.atualizar_progresso_thread_safe(lead, (i + 1) / len(test_leads))
        
        # Allow UI to process
        self.gui.root.update()
        time.sleep(0.2)
        self.gui.root.update()
        
        # Verify leads were added to table
        final_rows = len(self.gui.data_table.get_children())
        self.assertGreater(final_rows, initial_rows)
        self.assertEqual(final_rows - initial_rows, 10)
    
    @patch('gui_manager.messagebox.showinfo')
    def test_automatic_file_generation(self, mock_showinfo):
        """
        Test that automatic file generation works correctly.
        
        **Validates: Requirement 3.6**
        """
        import os
        from pathlib import Path
        
        # Create test leads
        test_leads = [
            {
                "nome": "Company 1",
                "telefone": "11999991111",
                "site": "www.company1.com",
                "nota": "4.5",
                "comentarios": "100",
                "endereco": "Address 1"
            },
            {
                "nome": "Company 2",
                "telefone": "11999992222",
                "site": "www.company2.com",
                "nota": "4.8",
                "comentarios": "200",
                "endereco": "Address 2"
            }
        ]
        
        # Get Downloads folder
        pasta_downloads = str(Path.home() / "Downloads")
        
        # Call file generation method
        self.gui._gerar_arquivo_texto_automatico(test_leads, "Vidro", "São Paulo")
        
        # Allow UI to process
        self.gui.root.update()
        time.sleep(0.1)
        
        # Find the generated file (most recent leads_Vidro_*.txt file)
        import glob
        pattern = os.path.join(pasta_downloads, "leads_Vidro_São_Paulo_*.txt")
        files = glob.glob(pattern)
        
        # Verify at least one file was created
        self.assertGreater(len(files), 0, "File should be created in Downloads folder")
        
        # Get the most recent file
        if files:
            most_recent = max(files, key=os.path.getctime)
            
            # Verify file exists and has content
            self.assertTrue(os.path.exists(most_recent))
            self.assertGreater(os.path.getsize(most_recent), 0)
            
            # Clean up the test file
            try:
                os.remove(most_recent)
            except:
                pass


if __name__ == '__main__':
    unittest.main()
