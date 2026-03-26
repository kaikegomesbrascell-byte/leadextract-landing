"""
Verify that the fix was applied correctly by checking the code structure.
"""

import re

def verify_fix():
    """Verify the messagebox is scheduled, not called synchronously."""
    
    with open('gui_manager.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check that messagebox is scheduled with root.after
    scheduled_pattern = r'self\.root\.after\(\s*800\s*,\s*lambda:\s*messagebox\.showinfo\('
    scheduled_matches = re.findall(scheduled_pattern, content)
    
    # Check that there's no synchronous messagebox.showinfo in iniciar_extracao
    # Extract the iniciar_extracao method
    method_pattern = r'def iniciar_extracao\(self\).*?(?=\n    def |\Z)'
    method_match = re.search(method_pattern, content, re.DOTALL)
    
    if not method_match:
        print("❌ FAIL: Could not find iniciar_extracao method")
        return False
    
    method_content = method_match.group(0)
    
    # Check for synchronous messagebox calls (not inside lambda or after)
    # This is a simplified check - look for messagebox.showinfo not preceded by lambda:
    synchronous_pattern = r'(?<!lambda:\s)messagebox\.showinfo\(\s*\n\s*"Extração Iniciada"'
    synchronous_matches = re.findall(synchronous_pattern, method_content)
    
    print("=" * 60)
    print("FIX VERIFICATION RESULTS")
    print("=" * 60)
    
    if len(scheduled_matches) > 0:
        print(f"✅ PASS: Found {len(scheduled_matches)} scheduled messagebox call(s) with 800ms delay")
    else:
        print("❌ FAIL: No scheduled messagebox calls found")
        return False
    
    if len(synchronous_matches) == 0:
        print("✅ PASS: No synchronous messagebox calls found in iniciar_extracao")
    else:
        print(f"❌ FAIL: Found {len(synchronous_matches)} synchronous messagebox call(s)")
        return False
    
    # Check that the redundant root.after(500, ...) was removed
    redundant_pattern = r'self\.root\.after\(500,\s*lambda:\s*self\.status_label\.configure\(\s*text="✅ Extração iniciada'
    redundant_matches = re.findall(redundant_pattern, method_content)
    
    if len(redundant_matches) == 0:
        print("✅ PASS: Redundant root.after(500, ...) call was removed")
    else:
        print(f"⚠️  WARNING: Found {len(redundant_matches)} redundant root.after(500, ...) call(s)")
    
    print("=" * 60)
    print("✅ FIX VERIFIED: All checks passed!")
    print("=" * 60)
    return True

if __name__ == '__main__':
    import sys
    success = verify_fix()
    sys.exit(0 if success else 1)
